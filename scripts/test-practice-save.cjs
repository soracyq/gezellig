/* global __dirname */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const { chromium } = createRequire(
  path.join(root, ".artifact-build/node_modules/__practice.cjs"),
)("playwright");
const base = process.env.DUTCHLY_TEST_URL || "http://127.0.0.1:4173";
const out = path.join(root, "test-results/practice-save");
const checks = [];

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    // Each case uses an isolated profile, so no learner history is changed.
    for (const choice of ["het", "de"]) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${base}/grammar?preview=grammar-articles`);
      await page.getByRole("button", { name: "Practice", exact: true }).click();
      const blocker = await context.newPage();
      await blocker.goto(`${base}/`);
      await blocker.evaluate(() => {
        window.__practiceLockHeld = false;
        void navigator.locks.request("dutchly-local-data", async () => {
          window.__practiceLockHeld = true;
          await new Promise((resolve) => {
            window.__releasePracticeLock = resolve;
          });
        });
      });
      await blocker.waitForFunction(() => window.__practiceLockHeld);
      const selected = page
        .getByRole("radio", { name: choice, exact: true })
        .first();
      const alternative = page
        .getByRole("radio", {
          name: choice === "het" ? "de" : "het",
          exact: true,
        })
        .first();
      await selected.click();
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .first()
        .click();
      await page.waitForFunction(() =>
        [...document.querySelectorAll('[role="radio"]')].every(
          (radio) => radio.getAttribute("aria-disabled") === "true",
        ),
      );
      assert.equal(await selected.getAttribute("aria-checked"), "true");
      assert.equal(await alternative.isDisabled(), true);
      assert.equal(
        await page.evaluate(() => localStorage.getItem("@dutchly/activity/v1")),
        null,
      );
      // A queued activation must not replace the answer already being saved.
      await alternative.dispatchEvent("click");
      assert.equal(await selected.getAttribute("aria-checked"), "true");
      assert.equal(await alternative.getAttribute("aria-checked"), "false");
      await blocker.evaluate(() => window.__releasePracticeLock());
      await page.getByText("Answer saved", { exact: true }).first().waitFor();
      const correct = choice === "het";
      const feedback = `${correct ? "Correct." : "Not quite."} The answer is het.`;
      await page.getByText(feedback, { exact: true }).waitFor();
      const history = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("@dutchly/activity/v1")),
      );
      assert.equal(history.events.length, 1);
      assert.equal(history.events[0].correct, correct);
      assert.equal(history.events[0].questionId, "question-articles-boek");
      assert.equal(await selected.isDisabled(), true);
      assert.deepEqual(errors, []);
      checks.push({
        choice,
        correct,
        feedback,
        attempts: history.events.length,
      });
      await context.close();
    }
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(
      path.join(out, "report.json"),
      JSON.stringify({ passed: true, checks }, null, 2),
    );
    console.log(JSON.stringify({ passed: true, checks }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
