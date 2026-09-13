/* global __dirname */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const { chromium, _electron: electron } = createRequire(
  path.join(
    process.env.DUTCHLY_ARTIFACT_NODE_MODULES ||
      path.join(root, ".artifact-build/node_modules"),
    "__browser.cjs",
  ),
)("playwright");
const desktop = process.argv.includes("--desktop"),
  base = desktop ? "dutchly://app" : "http://127.0.0.1:4173";
const out = path.join(root, "test-results/grammar-files");
fs.mkdirSync(out, { recursive: true });
const errors = [],
  results = [];
let session;
const snapshot = (page) =>
  page.evaluate(() => ({
    activity: localStorage.getItem("@dutchly/activity/v1"),
    settings: localStorage.getItem("@dutchly/settings"),
    curriculum: JSON.parse(
      localStorage.getItem("@dutchly/curriculum/v1") ||
        '{"grammar":[],"vocabulary":[],"datasets":[]}',
    ),
  }));
async function go(page, route) {
  await page.goto(base + route);
  await page
    .getByText("Loading your saved learning space…", { exact: true })
    .waitFor({ state: "hidden" });
  await page.getByRole("heading").first().waitFor();
}
async function preview(page, level, format) {
  await go(page, "/import?kind=grammar");
  const file = path.join(
    root,
    "public/import-data",
    `dutch_grammar_${level}.${format}`,
  );
  const chooser = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "Choose CSV or Excel file", exact: true })
    .click();
  await (await chooser).setFiles(file);
  await page
    .getByRole("heading", { name: "4. Review and confirm", exact: true })
    .waitFor({ timeout: 30000 });
  return file;
}
const normalize = (s) => s.replace(/\s+/g, " ").trim();
async function inspectLesson(page, row, capture) {
  // Open through the actual lesson card, including scroll-to-card behaviour.
  await page
    .getByText(row.title, { exact: true })
    .locator("..")
    .getByRole("button", { name: "Open lesson", exact: true })
    .click();
  for (const text of [
    row.learning_objective,
    row.explanation,
    row.rule,
    row.notes,
  ].filter(Boolean))
    await page.getByText(text, { exact: true }).first().waitFor();
  if (capture && !desktop) {
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(out, `browser-${capture}-explanation.png`),
    });
  }
  await page.getByRole("button", { name: "Examples", exact: true }).click();
  for (const text of [
    row.example_dutch_1,
    row.example_english_1,
    row.example_dutch_2,
    row.example_english_2,
    row.common_mistake,
  ])
    await page.getByText(text, { exact: true }).first().waitFor();
  if (capture && !desktop) {
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(out, `browser-${capture}-examples.png`),
    });
  }
  await page.getByRole("button", { name: "Practice", exact: true }).click();
  await page.getByText("Question 1 of 5", { exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Close preview", exact: true })
    .click();
}
(async () => {
  const { loadGrammar } = await import("./grammar-data.mjs");
  const source = await loadGrammar();
  for (const format of ["csv", "xlsx"]) {
    const profile = path.join(
      out,
      `${desktop ? "desktop" : "browser"}-${format}-${Date.now()}`,
    );
    let page;
    if (desktop) {
      session = await electron.launch({
        executablePath:
          process.env.GEZELLIG_TEST_EXECUTABLE ||
          path.join(root, "release/win-unpacked/Gezellig.exe"),
        args: ["--hidden", `--user-data-dir=${profile}`],
        timeout: 45000,
      });
      page = await session.firstWindow();
      await page
        .getByRole("heading", {
          name: "Your daily dose of Dutch.",
          exact: true,
        })
        .waitFor();
    } else {
      session = await chromium.launchPersistentContext(profile, {
        executablePath:
          process.env.DUTCHLY_CHROME ||
          "C:/Program Files/Google/Chrome/Application/chrome.exe",
        headless: true,
        viewport: { width: 1440, height: 1000 },
        timezoneId: "Europe/Amsterdam",
      });
      page = await session.newPage();
    }
    page.on("pageerror", (e) => errors.push(e.message));
    await go(page, "/statistics");
    await page
      .getByText("No learning activity yet.", { exact: false })
      .waitFor();
    if (format === "xlsx") {
      await go(page, "/vocabulary");
      await page
        .getByRole("button", { name: "Preview het huis", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Mark studied", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Word studied", exact: true })
        .waitFor();
      await page.getByRole("button", { name: "Done", exact: true }).click();
    }
    await go(page, "/statistics");
    const statsBefore = normalize(await page.locator("body").innerText());
    const baseline = await snapshot(page);
    for (const level of ["A1", "A2"]) {
      const wanted = source.filter((r) => r.cefr_level === level),
        count = wanted.length;
      const file = await preview(page, level, format);
      const staged = await snapshot(page);
      assert.equal(staged.activity, baseline.activity);
      if (level === "A1") {
        await page
          .getByRole("button", { name: "Cancel import", exact: true })
          .click();
        assert.deepEqual(await snapshot(page), staged);
        await preview(page, level, format);
      }
      await page
        .getByRole("button", { name: `Confirm import (${count})`, exact: true })
        .click();
      await page
        .getByText(new RegExp(`${count} lessons imported\\.`))
        .waitFor();
      const saved = await snapshot(page);
      assert.equal(saved.activity, baseline.activity);
      assert.equal(saved.settings, baseline.settings);
      assert.deepEqual(
        saved.curriculum.vocabulary,
        baseline.curriculum.vocabulary,
      );
      assert.equal(saved.curriculum.datasets.at(-1).itemCount, count);
      assert.equal(saved.curriculum.datasets.at(-1).skippedCount, 0);
      const lessons = saved.curriculum.grammar.filter((g) => g.level === level);
      assert.equal(lessons.length, count);
      for (let i = 0; i < count; i++) {
        const actual = lessons[i],
          r = wanted[i];
        for (const [key, field] of Object.entries({
          sourceLessonId: "lesson_id",
          title: "title",
          category: "category",
          objective: "learning_objective",
          summary: "summary",
          explanation: "explanation",
        }))
          assert.equal(actual[key], r[field]);
        assert.equal(actual.sortOrder, Number(r.sort_order));
        assert.equal(actual.estimatedMinutes, Number(r.estimated_minutes));
        assert.equal(actual.isSample, false);
        assert.deepEqual(actual.rules, [r.rule]);
        assert.deepEqual(actual.commonMistakes, [r.common_mistake]);
        assert.deepEqual(actual.usageNotes, r.notes ? [r.notes] : []);
        assert.deepEqual(actual.questions, []);
        assert.deepEqual(actual.examples, [
          { dutch: r.example_dutch_1, english: r.example_english_1 },
          { dutch: r.example_dutch_2, english: r.example_english_2 },
        ]);
      }
      await go(page, `/grammar?level=${level}`);
      await page.getByText(wanted.at(-1).title, { exact: true }).waitFor();
      const body = await page.locator("body").innerText();
      let previous = -1;
      for (const r of wanted) {
        const position = body.indexOf(r.title);
        assert(position > previous, `Card order: ${r.lesson_id}`);
        previous = position;
        assert(body.includes(r.summary), `Summary: ${r.lesson_id}`);
      }
      assert.equal(
        await page.getByText("Imported lesson", { exact: true }).count(),
        count,
      );
      const selected = [
        wanted[0],
        wanted[Math.floor(count / 2)],
        wanted.at(-1),
      ];
      if (level === "A2")
        selected.push(
          wanted.find((r) => r.lesson_id === "a2-participle-prefixes"),
        );
      for (const r of selected)
        await inspectLesson(
          page,
          r,
          r.lesson_id === "a2-participle-prefixes" ? format : null,
        );
      assert.equal((await snapshot(page)).activity, baseline.activity);
      results.push({
        environment: desktop ? "packaged Windows" : "production browser",
        file: path.basename(file),
        records: count,
        imported: count,
        skipped: 0,
        allSavedFieldsMatch: true,
        allCardOrderAndSummariesMatch: true,
        lessonsOpened: selected.map((r) => r.lesson_id),
        statisticsUnchanged: true,
      });
      console.log(
        `PASS ${desktop ? "Windows" : "browser"} ${level} ${format}: ${count} lessons, all saved fields and order, ${selected.length} lesson displays.`,
      );
    }
    await go(page, "/statistics");
    assert.equal(
      normalize(await page.locator("body").innerText()),
      statsBefore,
    );
    await preview(page, "A2", format === "csv" ? "xlsx" : "csv");
    await page.getByText("40 duplicates skipped", { exact: false }).waitFor();
    assert(
      await page
        .getByRole("button", { name: "Confirm import (0)", exact: true })
        .isDisabled(),
    );
    assert.equal((await snapshot(page)).activity, baseline.activity);
    await session.close();
    session = null;
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    path.join(out, desktop ? "desktop-report.json" : "browser-report.json"),
    JSON.stringify({ results, errors }, null, 2) + "\n",
  );
  console.log(
    "PASS all four files: file chooser, preview, cancellation, confirmation, saved data, ordered cards, lesson displays, accents, duplicate protection and unchanged statistics.",
  );
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (session) await session.close();
  });
