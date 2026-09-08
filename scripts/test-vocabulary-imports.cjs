const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const runtimeModules =
  process.env.DUTCHLY_ARTIFACT_NODE_MODULES ||
  path.join(root, ".artifact-build/node_modules");
const { chromium, _electron: electron } = createRequire(
  path.join(runtimeModules, "__browser.cjs"),
)("playwright");
const desktop = process.argv.includes("--desktop");
const base = desktop ? "dutchly://app" : "http://127.0.0.1:4173";
const out = path.join(root, "test-results/vocabulary-files");
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
        '{"vocabulary":[],"datasets":[]}',
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
  await go(page, "/import?kind=vocabulary");
  const file = path.join(
    root,
    "public/import-data",
    `dutch_vocabulary_${level}_${level === "A1" ? 500 : 1000}.${format}`,
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
async function inspectWord(page, level, label, expected) {
  await go(page, `/vocabulary?level=${level}`);
  await page
    .getByLabel("Search vocabulary", { exact: true })
    .fill(label.replace(/^(de|het) /, ""));
  await page
    .getByRole("button", { name: `Preview ${label}`, exact: true })
    .click();
  for (const text of expected)
    await page.getByText(text, { exact: true }).first().waitFor();
  await page.getByRole("button", { name: "Done", exact: true }).click();
}
(async () => {
  for (const format of ["csv", "xlsx"]) {
    const profile = path.join(
      out,
      `${desktop ? "desktop" : "browser"}-${format}-${Date.now()}`,
    );
    let page;
    if (desktop) {
      session = await electron.launch({
        executablePath: path.join(root, "release/win-unpacked/Dutchly.exe"),
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
    // A fresh profile checks zero history; the other checks preservation of real history.
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
    const baseline = await snapshot(page);
    for (const [level, count, added] of [
      ["A1", 500, 493],
      ["A2", 1000, 1000],
    ]) {
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
        .getByRole("button", { name: `Confirm import (${added})`, exact: true })
        .click();
      await page.getByText(new RegExp(`${added} words imported\\.`)).waitFor();
      const saved = await snapshot(page);
      assert.equal(saved.activity, baseline.activity);
      assert.equal(saved.settings, baseline.settings);
      const dataset = saved.curriculum.datasets.at(-1);
      assert.equal(dataset.itemCount, added);
      assert.equal(dataset.skippedCount, count - added);
      assert.equal(
        saved.curriculum.vocabulary.filter((v) => v.level === level).length,
        added,
      );
      results.push({
        environment: desktop ? "packaged Windows" : "production browser",
        file: path.basename(file),
        records: count,
        imported: added,
        skipped: count - added,
        statisticsUnchanged: true,
      });
      console.log(
        `PASS ${desktop ? "Windows" : "browser"} ${level} ${format}: ${added} imported, ${count - added} existing samples skipped; activity unchanged`,
      );
    }
    await inspectWord(page, "A1", "de mens", [
      "Every person has a name.",
      "mensen",
    ]);
    await inspectWord(page, "A1", "het café", ["cafés"]);
    await inspectWord(page, "A2", "het ingrediënt", ["ingrediënten"]);
    await inspectWord(page, "A2", "kopiëren", ["gekopieerd"]);
    await inspectWord(page, "A2", "in plaats van", [
      "Ik neem thee in plaats van koffie.",
    ]);
    assert.equal((await snapshot(page)).activity, baseline.activity);
    await go(page, "/statistics");
    if (format === "csv")
      await page
        .getByText("No learning activity yet.", { exact: false })
        .waitFor();
    else
      assert.equal(
        JSON.parse((await snapshot(page)).activity).events.length,
        1,
      );
    // Opposite-format reimport detects the same content, with no new records.
    await preview(page, "A2", format === "csv" ? "xlsx" : "csv");
    await page.getByText("1000 duplicates skipped", { exact: false }).waitFor();
    assert.equal(
      await page
        .getByRole("button", { name: "Confirm import (0)", exact: true })
        .isDisabled(),
      true,
    );
    assert.equal((await snapshot(page)).activity, baseline.activity);
    if (!desktop) {
      await go(page, "/vocabulary?level=A2");
      await page
        .getByLabel("Search vocabulary", { exact: true })
        .fill("ingrediënt");
      await page
        .getByRole("button", { name: "Preview het ingrediënt", exact: true })
        .click();
      await page.waitForTimeout(500); // Let the existing modal fade finish before visual capture.
      await page.screenshot({
        path: path.join(out, `browser-${format}-accented-word.png`),
      });
    }
    await session.close();
    session = null;
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    path.join(out, desktop ? "desktop-report.json" : "browser-report.json"),
    JSON.stringify({ results, errors }, null, 2),
  );
  console.log(
    "PASS all four files: chooser, preview, confirm, metadata, accents, zero and existing activity, cross-format duplicate protection.",
  );
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (session) await session.close();
  });
