/* global __dirname */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const Papa = require("papaparse");
const root = path.resolve(__dirname, "..");
const { chromium, _electron } = createRequire(
  path.join(root, ".artifact-build/node_modules/__continue.cjs"),
)("playwright");
const desktop = process.argv.includes("--desktop");
const base = desktop ? "dutchly://app" : "http://127.0.0.1:4173";
const out = path.join(root, "test-results/continue-review");
fs.mkdirSync(out, { recursive: true });

(async () => {
  const { vocabularyItems, grammarTopics } =
    await import("../src/data/sample-content.ts");
  const { validateTable } = await import("../src/imports/validate.ts");
  const { commitPreview } = await import("../src/imports/commit.ts");
  const { makeEvent } = await import("../src/domain/activity.ts");
  const { dailyReview, reviewProgress } =
    await import("../src/domain/review.ts");
  const { continueLearning } = await import("../src/domain/homeLearning.ts");
  const builtin = { vocabulary: vocabularyItems, grammar: grammarTopics };
  let curriculum = { version: 1, vocabulary: [], grammar: [], datasets: [] };
  for (const [kind, filename] of [
    ["vocabulary", "dutch_vocabulary_A1_500.csv"],
    ["grammar", "dutch_grammar_A1.csv"],
    ["grammar", "dutch_grammar_A2.csv"],
  ]) {
    const [headers, ...rows] = Papa.parse(
      fs.readFileSync(path.join(root, "public/import-data", filename), "utf8"),
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
      builtin,
    );
    curriculum = commitPreview(
      curriculum,
      preview,
      builtin,
      `test:${filename}`,
    ).curriculum;
  }
  const words = [...vocabularyItems, ...curriculum.vocabulary];
  const grammar = [...grammarTopics, ...curriculum.grammar].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  const today = new Date(),
    yesterday = new Date(Date.now() - 86400000);
  const historyFor = (ws, gs, date = yesterday) => ({
    version: 1,
    events: [
      ...ws.map((word) =>
        makeEvent("word-studied", word.id, "vocabulary", {}, date),
      ),
      ...gs.map((lesson) =>
        makeEvent("lesson-completed", lesson.id, "grammar", {}, date),
      ),
    ],
  });
  let browser, context, page, app;
  const checks = [],
    errors = [];
  const profile = path.join(out, `profile-${Date.now()}`);
  try {
    if (desktop) {
      app = await _electron.launch({
        executablePath: path.join(root, "release/win-unpacked/Gezellig.exe"),
        args: [
          "--hidden",
          "--disable-background-timer-throttling",
          `--user-data-dir=${profile}`,
        ],
      });
      page = await app.firstWindow();
      context = page.context();
      await page.getByRole("heading").first().waitFor({ timeout: 30000 });
    } else {
      browser = await chromium.launch({
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        headless: true,
      });
      context = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
      });
      page = await context.newPage();
    }
    page.setDefaultTimeout(20000);
    page.on("pageerror", (error) => errors.push(error.message));
    const go = async (route) => {
      console.log(`Checking ${desktop ? "Windows" : "browser"} ${route}`);
      await page.goto(base + route, { waitUntil: "domcontentloaded" });
      await page.getByRole("heading").first().waitFor();
      await page
        .getByText("Loading your saved learning space…", { exact: true })
        .waitFor({ state: "hidden" });
    };
    const history = async () =>
      page.evaluate(() =>
        JSON.parse(
          localStorage.getItem("@dutchly/activity/v1") ||
            '{"version":1,"events":[]}',
        ),
      );
    const seed = async (activity) => {
      await page.evaluate(
        ({ curriculum, activity }) => {
          localStorage.setItem(
            "@dutchly/curriculum/v1",
            JSON.stringify(curriculum),
          );
          localStorage.setItem(
            "@dutchly/activity/v1",
            JSON.stringify(activity),
          );
        },
        { curriculum, activity },
      );
    };
    await go("/");
    await page
      .getByRole("link", { name: "Start learning", exact: true })
      .waitFor();
    await seed(historyFor([], []));
    await go("/");
    const start = page.getByRole("link", {
      name: "Start learning",
      exact: true,
    });
    assert(
      (await start.getAttribute("href")).includes(
        encodeURIComponent(words[0].id),
      ),
    );
    const featured = page.getByRole("link", {
      name: "Explore word",
      exact: true,
    });
    await featured.waitFor();
    const featuredLink = await featured.getAttribute("href");
    assert(
      curriculum.vocabulary.some((word) =>
        featuredLink.includes(encodeURIComponent(word.id)),
      ),
    );
    assert.equal((await history()).events.length, 0);
    await start.click();
    await page
      .getByRole("button", { name: "Mark studied", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Word studied", exact: true })
      .waitFor();
    await go("/");
    const next = page.getByRole("link", {
      name: "Continue learning",
      exact: true,
    });
    assert(
      (await next.getAttribute("href")).includes(
        encodeURIComponent(words[1].id),
      ),
    );
    assert.notEqual(await featured.getAttribute("href"), featuredLink);
    const beforeExplore = await history();
    await featured.click();
    await page
      .getByRole("button", { name: "Close preview", exact: true })
      .waitFor();
    assert.deepEqual(await history(), beforeExplore);
    await seed(historyFor([words[0], words[5]], []));
    await go("/");
    assert(
      (await next.getAttribute("href")).includes(
        encodeURIComponent(words[6].id),
      ),
    );
    await seed(historyFor(words, []));
    await go("/");
    await page
      .getByText("You’ve studied every word in your collection.", {
        exact: false,
      })
      .waitFor();
    assert.equal(await next.count(), 0);
    checks.push(
      "Home Start/Continue, next unstudied position, all-studied completion and imported nonrepeating featured word; opening records no study",
    );
    await seed(historyFor([], []));
    await go("/grammar");
    for (const status of ["All", "Not completed"]) {
      if (status !== "All")
        await page
          .getByRole("button", { name: /^Grammar status Not completed/ })
          .click();
      const lesson = grammar.filter((item) => item.level === "A1")[
        status === "All" ? 18 : 22
      ];
      const card = page.getByText(lesson.title, { exact: true }).locator("..");
      const open = card.getByRole("button", {
        name: "Open lesson",
        exact: true,
      });
      await open.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      const scroll = page.getByTestId("learning-page-scroll");
      const before = await scroll.evaluate((element) => element.scrollTop);
      await open.click();
      await page
        .getByRole("button", { name: "Complete lesson", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Lesson completed", exact: true })
        .waitFor();
      assert(
        Math.abs(
          (await scroll.evaluate((element) => element.scrollTop)) - before,
        ) < 2,
      );
      await page
        .getByRole("button", { name: "Close preview", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Close preview", exact: true })
        .waitFor({ state: "hidden" });
      await page.waitForTimeout(500);
      assert(
        Math.abs(
          (await scroll.evaluate((element) => element.scrollTop)) - before,
        ) < 2,
        `${status}: page moved after close`,
      );
      if (status === "All")
        await card.getByText("Completed", { exact: true }).waitFor();
      else assert.equal(await card.count(), 0);
    }
    checks.push(
      "Grammar viewport preserved within 2px while completion reorders/removes cards in All and Not completed",
    );
    await seed(historyFor(words.slice(0, 5), grammar.slice(0, 3), today));
    await go("/review");
    await page.getByText("No reviews due today", { exact: true }).waitFor();
    await seed(historyFor(words.slice(0, 5), grammar.slice(0, 3)));
    await go("/review");
    const beforeRefresh = await history();
    const plan = dailyReview(words, grammar, beforeRefresh, 10, new Date());
    assert.equal(plan.questions.length, 8);
    assert(
      plan.questions.some((item) => item.question.contentType === "grammar"),
    );
    for (let i = 0; i < 8; i++) {
      await page
        .getByRole("heading", { name: `Refresh ${i + 1} of 8`, exact: true })
        .waitFor();
      assert.equal(
        await page.getByRole("textbox", { name: "Your Dutch answer" }).count(),
        0,
      );
      if (i < 7)
        await page
          .getByRole("button", { name: "Next material", exact: true })
          .click();
    }
    assert.deepEqual(await history(), beforeRefresh);
    if (!desktop)
      await page.screenshot({ path: path.join(out, "refresh.png") });
    await page.getByRole("button", { name: "Start test", exact: true }).click();
    const order = [];
    for (let i = 0; i < 8; i++) {
      const current = dailyReview(
        words,
        grammar,
        await history(),
        10,
        new Date(),
      ).questions[0].question;
      order.push(current.contentType);
      await page.getByText(current.prompt, { exact: true }).waitFor();
      await page
        .getByRole("textbox", { name: "Your Dutch answer" })
        .fill(i === 0 ? "wrong" : current.correctAnswer);
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await page.getByText("Answer saved.", { exact: true }).waitFor();
      await page
        .getByRole("button", {
          name: i < 7 ? "Next question" : "See today’s results",
          exact: true,
        })
        .click();
    }
    await page
      .getByText("7 correct · 1 incorrect · 88% accuracy", { exact: true })
      .waitFor();
    const saved = await history(),
      progress = reviewProgress(saved);
    assert.equal(progress.size, 8);
    assert.equal(saved.events.length, 16);
    assert.equal(
      [...progress.values()].filter(
        (item) => item.consecutiveCorrectReviews === 1,
      ).length,
      7,
    );
    assert.equal(
      [...progress.values()].filter(
        (item) => item.mistakes === 1 && item.consecutiveCorrectReviews === 0,
      ).length,
      1,
    );
    await page.reload();
    await page.getByText("Review complete", { exact: true }).waitFor();
    assert.deepEqual(await history(), saved);
    checks.push(
      "First review tomorrow; Refresh contains five words and three lessons without writes; mixed test saves 7/8 with per-item progress and reload persistence",
    );
    await seed(historyFor(words.slice(0, 30), []));
    await go("/settings");
    await page
      .getByRole("button", { name: "15 words per day", exact: true })
      .click();
    await page
      .getByText("Your target is 15 words per day.", { exact: false })
      .waitFor();
    await go("/review");
    await page
      .getByText("0 of 15 completed · 15 remaining", { exact: true })
      .waitFor();
    const cap = dailyReview(words, grammar, await history(), 15, new Date());
    assert.equal(cap.questions.length, 15);
    assert.equal(cap.deferred, 15);
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
    if (desktop) {
      const finalHistory = await history();
      await app.close();
      app = await _electron.launch({
        executablePath: path.join(root, "release/win-unpacked/Gezellig.exe"),
        args: ["--hidden", `--user-data-dir=${profile}`],
      });
      page = await app.firstWindow();
      await page.getByRole("heading").first().waitFor({ timeout: 30000 });
      assert.deepEqual(await history(), finalHistory);
      assert.equal(continueLearning(words, finalHistory).next.id, words[30].id);
      checks.push(
        "Full Windows process reopen preserves learning history and continuation position",
      );
    }
    checks.push(
      "Settings target 15 caps 30 due items; all eight routes render without errors",
    );
    fs.writeFileSync(
      path.join(out, `${desktop ? "desktop" : "browser"}-report.json`),
      JSON.stringify({ checks, order, errors }, null, 2),
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
