/* global __dirname */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const Papa = require("papaparse");
const root = path.resolve(__dirname, "..");
const { chromium, _electron } = createRequire(
  path.join(root, ".artifact-build/node_modules/__learning.cjs"),
)("playwright");
const desktop = process.argv.includes("--desktop");
const base = desktop ? "dutchly://app" : "http://127.0.0.1:4173";
const out = path.join(root, "test-results/learning-improvements");
const checks = [];
fs.mkdirSync(out, { recursive: true });

(async () => {
  const { validateTable } = await import("../src/imports/validate.ts");
  const { commitPreview } = await import("../src/imports/commit.ts");
  const { vocabularyItems, grammarTopics } =
    await import("../src/data/sample-content.ts");
  const { grammarExercises } = await import("../src/domain/grammarPractice.ts");
  const { makeEvent } = await import("../src/domain/activity.ts");
  const builtins = { vocabulary: vocabularyItems, grammar: grammarTopics };
  let curriculum = { version: 1, vocabulary: [], grammar: [], datasets: [] };
  for (const kind of ["vocabulary", "grammar"])
    for (const level of ["A1", "A2"]) {
      const filename = `dutch_${kind}_${level}${kind === "vocabulary" ? (level === "A1" ? "_500" : "_1000") : ""}.csv`;
      const [headers, ...rows] = Papa.parse(
        fs.readFileSync(
          path.join(root, "public/import-data", filename),
          "utf8",
        ),
        { skipEmptyLines: true },
      ).data;
      const preview = validateTable(
        {
          headers,
          rows: rows.map((values, i) => ({ row: i + 2, values })),
          format: "csv",
          warnings: [],
        },
        kind,
        filename,
        {
          vocabulary: [...vocabularyItems, ...curriculum.vocabulary],
          grammar: [...grammarTopics, ...curriculum.grammar],
        },
      );
      assert.equal(preview.invalid, 0);
      curriculum = commitPreview(
        curriculum,
        preview,
        builtins,
        `fixture-${kind}-${level}`,
      ).curriculum;
    }
  const words = [...vocabularyItems, ...curriculum.vocabulary];
  const a1 = words.filter((x) => x.level === "A1");
  const grammar = [...grammarTopics, ...curriculum.grammar].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  const a1grammar = grammar.filter((x) => x.level === "A1");
  assert.equal(a1.length, 501);
  const events = a1
    .slice(0, 20)
    .map((x) => makeEvent("word-studied", x.id, "vocabulary"));
  events.push(
    ...[0, 1, 4].map((i) =>
      makeEvent("lesson-completed", a1grammar[i].id, "grammar"),
    ),
  );
  const activity = { version: 1, events };
  let browser, app, context, page;
  try {
    if (desktop) {
      app = await _electron.launch({
        executablePath:
          process.env.GEZELLIG_TEST_EXECUTABLE ||
          path.join(root, "release/win-unpacked/Gezellig.exe"),
        args: [
          "--hidden",
          "--disable-background-timer-throttling",
          `--user-data-dir=${path.join(out, `profile-${Date.now()}`)}`,
        ],
      });
      page = await app.firstWindow();
      context = page.context();
      await page.getByRole("heading").first().waitFor({ timeout: 30000 });
      await app.evaluate(({ shell }) => {
        global.__translateLinks = [];
        shell.openExternal = async (url) => {
          global.__translateLinks.push(url);
        };
      });
    } else {
      browser = await chromium.launch({
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        headless: true,
      });
      context = await browser.newContext({
        viewport: { width: 1440, height: 1100 },
      });
      page = await context.newPage();
      await context.route("https://translate.google.com/**", (route) =>
        route.fulfill({
          contentType: "text/html",
          body: "<title>Translate link captured</title>",
        }),
      );
    }
    page.setDefaultTimeout(15000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const go = async (route) => {
      console.log(`Checking ${desktop ? "Windows" : "browser"} ${route}`);
      await page.goto(base + route, { waitUntil: "domcontentloaded" });
      await page.getByRole("heading").first().waitFor();
      await page
        .getByText("Loading your saved learning space…", { exact: true })
        .waitFor({ state: "hidden" });
    };
    const snapshot = () =>
      page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
    await go("/");
    await page.evaluate(
      ({ curriculum, activity }) => {
        localStorage.setItem(
          "@dutchly/curriculum/v1",
          JSON.stringify(curriculum),
        );
        localStorage.setItem("@dutchly/activity/v1", JSON.stringify(activity));
      },
      { curriculum, activity },
    );
    await go("/vocabulary");
    for (const label of ["All (501)", "Not studied (481)", "Studied (20)"])
      await page
        .getByRole("button", {
          name: `Vocabulary status ${label}`,
          exact: true,
        })
        .waitFor();
    assert.equal(
      await page
        .getByRole("button", {
          name: "Vocabulary status All (501)",
          exact: true,
        })
        .getAttribute("aria-pressed"),
      "true",
    );
    const label = (word) =>
      word.wordType === "noun" && word.article
        ? `${word.article} ${word.dutch.replace(/^(de|het)\s+/i, "")}`
        : word.dutch;
    const before = await snapshot();
    await page
      .getByRole("button", {
        name: "Vocabulary status Studied (20)",
        exact: true,
      })
      .click();
    await page.getByText(label(a1[0]), { exact: true }).click();
    const google = page.getByRole("link", { name: /Google Translate/ });
    const expected = `https://translate.google.com/?sl=nl&tl=en&text=${encodeURIComponent(label(a1[0]))}&op=translate`;
    assert.equal(await google.getAttribute("href"), expected);
    if (desktop) {
      await google.click();
      await page.waitForTimeout(300);
      assert.deepEqual(await app.evaluate(() => global.__translateLinks), [
        expected,
      ]);
      assert.equal(app.windows().length, 1);
    } else {
      const popupPromise = context.waitForEvent("page");
      await google.click();
      const popup = await popupPromise;
      await popup.waitForLoadState();
      assert.equal(popup.url(), expected);
      await popup.close();
    }
    assert.deepEqual(await snapshot(), before);
    await page
      .getByRole("button", { name: /^Listen to Dutch pronunciation/ })
      .waitFor();
    await page
      .getByRole("button", { name: "Close preview", exact: true })
      .click();
    checks.push(
      "Google Translate exact noun/article link opens externally; Listen remains; no storage changes",
    );
    await page
      .getByRole("button", {
        name: "Vocabulary status Not studied (481)",
        exact: true,
      })
      .click();
    await page.getByText(label(a1[20]), { exact: true }).click();
    await page
      .getByRole("button", { name: "Mark studied", exact: true })
      .click();
    await page.getByText("Word studied", { exact: true }).waitFor();
    await page
      .getByRole("button", { name: "Close preview", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Vocabulary status Not studied (480)",
        exact: true,
      })
      .waitFor();
    assert.equal(
      await page.getByText(label(a1[20]), { exact: true }).count(),
      0,
    );
    await page
      .getByRole("button", {
        name: "Vocabulary status Studied (21)",
        exact: true,
      })
      .waitFor();
    await page.getByRole("textbox", { name: "Search vocabulary" }).fill("huis");
    const subset = a1.filter((x) =>
      `${label(x)} ${x.english} ${x.topic}`.toLowerCase().includes("huis"),
    );
    await page
      .getByRole("button", {
        name: `Vocabulary status All (${subset.length})`,
        exact: true,
      })
      .waitFor();
    checks.push(
      "501/20/481 filters, scoped search counts and immediate 480/21 updates verified",
    );
    await go("/grammar");
    await page
      .getByRole("button", {
        name: "Grammar status Completed (3)",
        exact: true,
      })
      .waitFor();
    const titles = await page
      .locator("div")
      .filter({
        has: page.getByRole("button", { name: "Open lesson", exact: true }),
      })
      .count();
    assert(titles > 0);
    const first = a1grammar[2];
    const card = page.getByText(first.title, { exact: true }).locator("..");
    await card.getByText("03", { exact: true }).waitFor();
    await card
      .getByRole("button", { name: "Open lesson", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Complete lesson", exact: true })
      .click();
    await page.getByText("Lesson completed", { exact: true }).waitFor();
    await page
      .getByRole("button", { name: "Close preview", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Grammar status Completed (4)",
        exact: true,
      })
      .waitFor();
    checks.push(
      "Grammar completion updates immediately and retains original lesson number",
    );
    const lesson = curriculum.grammar.find(
      (x) => x.sourceLessonId === "a2-comparatives",
    );
    const initialHistory = JSON.parse(
      (await snapshot())["@dutchly/activity/v1"],
    ).events.length;
    await go(`/grammar?level=A2&preview=${encodeURIComponent(lesson.id)}`);
    await page.getByRole("button", { name: "Practice", exact: true }).click();
    for (const [i, question] of grammarExercises(lesson).entries()) {
      await page.getByText(`Question ${i + 1} of 5`, { exact: true }).waitFor();
      if (question.kind === "multiple-choice")
        await page
          .getByRole("radio", { name: question.correctAnswer, exact: true })
          .click();
      else
        await page
          .getByRole("textbox", { name: "Your Dutch answer" })
          .fill(i === 4 ? "wrong" : question.correctAnswer);
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await page.getByText("Answer saved", { exact: true }).waitFor();
      await page
        .getByRole("button", {
          name: i === 4 ? "See results" : "Next question",
          exact: true,
        })
        .click();
    }
    await page.getByText("4 / 5 correct", { exact: true }).waitFor();
    const after = await snapshot();
    const history = JSON.parse(after["@dutchly/activity/v1"]);
    assert.equal(history.events.length, initialHistory + 5);
    assert.equal(
      history.events.filter((x) => x.kind === "lesson-completed").length,
      4,
    );
    assert(history.events.slice(-5).every((x) => !x.source && !!x.answer));
    assert.equal(
      after["@dutchly/curriculum/v1"],
      before["@dutchly/curriculum/v1"],
    );
    if (!desktop)
      await page.screenshot({ path: path.join(out, "practice-results.png") });
    await page.reload();
    await page.getByRole("button", { name: "Practice", exact: true }).waitFor();
    assert.deepEqual(await snapshot(), after);
    checks.push(
      "Five styles supported in data; complete choice/cloze/correction/translation round saves 4/5, preserves curriculum and completion after reopening",
    );
    const ordering = curriculum.grammar.find(
      (x) => x.sourceLessonId === "a1-basic-sentences",
    );
    await go(`/grammar?preview=${encodeURIComponent(ordering.id)}`);
    await page.getByRole("button", { name: "Practice", exact: true }).click();
    for (const [i, question] of grammarExercises(ordering)
      .slice(0, 3)
      .entries()) {
      if (i === 0)
        await page
          .getByRole("radio", { name: question.correctAnswer, exact: true })
          .click();
      else if (i === 1)
        await page
          .getByRole("textbox", { name: "Your Dutch answer" })
          .fill(question.correctAnswer);
      else
        for (const chunk of question.correctAnswer.split(" "))
          await page
            .getByRole("button", { name: chunk, exact: true })
            .first()
            .click();
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await page.getByText("Answer saved", { exact: true }).waitFor();
      if (i < 2)
        await page
          .getByRole("button", { name: "Next question", exact: true })
          .click();
      else
        await page
          .getByText(`Correct. The answer is ${question.correctAnswer}`, {
            exact: true,
          })
          .waitFor();
    }
    checks.push("Sentence ordering chips submit the intended sentence");
    for (const route of [
      "/",
      "/levels",
      "/vocabulary",
      "/grammar",
      "/review",
      "/statistics",
      "/import",
      "/settings",
    ])
      await go(route);
    assert.deepEqual(errors, []);
    checks.push("All eight routes render without uncaught errors");
    fs.writeFileSync(
      path.join(out, `${desktop ? "desktop" : "browser"}-report.json`),
      JSON.stringify({ passed: checks, errors }, null, 2),
    );
    console.log(checks.join("\n"));
  } finally {
    if (app) await app.close();
    if (browser) await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
