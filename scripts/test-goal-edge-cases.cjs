/* global __dirname */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const { chromium } = createRequire(
  path.join(root, ".artifact-build/node_modules/__goal-edges.cjs"),
)("playwright");
const base = process.env.GEZELLIG_TEST_BASE_URL || "http://127.0.0.1:4173";
let browser;
(async () => {
  const { vocabularyItems } = await import("../src/data/sample-content.ts");
  const { makeEvent } = await import("../src/domain/activity.ts");
  browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  const context = await browser.newContext();
  await context.addInitScript(() => {
    window.__sounds = 0;
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...args) {
      window.__sounds++;
      return start.apply(this, args);
    };
  });
  const page = await context.newPage();
  await page.goto(base);
  await page
    .getByRole("heading", { name: "Your daily dose of Dutch.", exact: true })
    .waitFor();
  await page.evaluate(
    (events) => {
      localStorage.setItem(
        "@dutchly/settings",
        JSON.stringify({ version: 1, dailyTarget: 5 }),
      );
      localStorage.setItem(
        "@dutchly/activity/v1",
        JSON.stringify({ version: 1, events }),
      );
    },
    vocabularyItems
      .slice(1, 5)
      .map((w) => makeEvent("word-studied", w.id, "vocabulary")),
  );
  await page.reload();
  let release;
  const delayed = new Promise((resolve) => {
    release = resolve;
  });
  await context.route("**/audio/goal-complete.wav", async (route) => {
    await delayed;
    await route.fulfill({
      contentType: "audio/wav",
      body: fs.readFileSync(path.join(root, "public/audio/goal-complete.wav")),
    });
  });
  await page.getByRole("link", { name: "Vocabulary", exact: true }).click();
  await page
    .getByRole("button", { name: "Preview het huis", exact: true })
    .click();
  await page.getByRole("button", { name: "Mark studied", exact: true }).click();
  const close = page.getByRole("button", {
    name: "Close celebration",
    exact: true,
  });
  await close.waitFor();
  // Let the modal finish its fade and request audio while the asset is delayed.
  await page.waitForTimeout(500);
  await close.click();
  await close.waitFor({ state: "hidden" });
  release();
  await page.waitForTimeout(500);
  assert.equal(
    await page.evaluate(() => window.__sounds),
    0,
    "A delayed sound must not start after closing the celebration",
  );
  assert.equal(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("@dutchly/activity/v1")).events.length,
    ),
    5,
  );
  // Reaching the next target on the same day must still not replay the reward.
  await page
    .getByRole("button", { name: "Close preview", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Close preview", exact: true })
    .waitFor({ state: "hidden" });
  const another = await context.newPage();
  await another.goto(base + "/vocabulary");
  await another
    .getByRole("button", { name: "Preview zijn", exact: true })
    .click();
  await another
    .getByRole("button", { name: "Mark studied", exact: true })
    .click();
  await another
    .getByRole("button", { name: "Word studied", exact: true })
    .waitFor();
  assert.equal(
    await another
      .getByRole("button", { name: "Close celebration", exact: true })
      .count(),
    0,
  );
  assert.equal(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("@dutchly/activity/v1")).events.length,
    ),
    6,
  );
  console.log(
    "Delayed sound cancellation and same-day second-tab suppression passed.",
  );
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (browser) await browser.close();
  });
