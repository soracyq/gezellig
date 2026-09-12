/* global __dirname */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const { chromium } = createRequire(
  path.join(root, ".artifact-build/node_modules/__settings.cjs"),
)("playwright");
const out = path.join(root, "test-results/bugfixes");
fs.mkdirSync(out, { recursive: true });
let browser;
(async () => {
  browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  const context = await browser.newContext();
  const settings = await context.newPage(),
    review = await context.newPage();
  context.setDefaultTimeout(7000);
  const base = "http://127.0.0.1:4173";
  await settings.goto(base + "/settings");
  await settings
    .getByText("Your target is 10 words per day.", { exact: false })
    .waitFor();
  const { vocabularyItems } = await import("../src/data/sample-content.ts");
  const { makeEvent } = await import("../src/domain/activity.ts");
  const history = JSON.stringify({
    version: 1,
    events: vocabularyItems.map((v) =>
      makeEvent(
        "word-studied",
        v.id,
        "vocabulary",
        {},
        new Date(Date.now() - 86400000),
      ),
    ),
  });
  await settings.evaluate(
    (history) => localStorage.setItem("@dutchly/activity/v1", history),
    history,
  );
  await review.goto(base + "/review");
  await review
    .getByText("8 review questions available today · Daily maximum: 10", {
      exact: true,
    })
    .waitFor();
  await settings
    .getByRole("button", { name: "5 words per day", exact: true })
    .click();
  await settings
    .getByText("Your target is 5 words per day.", { exact: false })
    .waitFor();
  await review
    .getByText("5 review questions available today · Daily maximum: 5", {
      exact: true,
    })
    .waitFor();
  await settings
    .getByRole("button", { name: "15 words per day", exact: true })
    .click();
  await review
    .getByText("8 review questions available today · Daily maximum: 15", {
      exact: true,
    })
    .waitFor();
  const peer = await context.newPage();
  await peer.goto(base + "/settings");
  await peer
    .getByText("Your target is 15 words per day.", { exact: false })
    .waitFor();
  await settings
    .getByRole("button", { name: "20 words per day", exact: true })
    .click();
  await peer
    .getByText("Your target is 20 words per day.", { exact: false })
    .waitFor();
  await review
    .getByText("8 review questions available today · Daily maximum: 20", {
      exact: true,
    })
    .waitFor();
  assert.equal(
    await settings.evaluate(() => localStorage.getItem("@dutchly/activity/v1")),
    history,
  );
  // Removing a preference in a second tab also refreshes consumers to the default.
  await peer.evaluate(() => localStorage.removeItem("@dutchly/settings"));
  await review
    .getByText("8 review questions available today · Daily maximum: 10", {
      exact: true,
    })
    .waitFor();
  const version = require("../package.json").version;
  await settings
    .getByText(`Gezellig ${version} · Personal learning · No account needed.`, {
      exact: true,
    })
    .waitFor();
  const report = {
    checkedAt: new Date().toISOString(),
    checks: [
      "Daily target decrease/increase updates existing Review tab without reload",
      "Settings tabs stay synchronized",
      "Removing saved settings restores default in other tabs",
      "Learning history unchanged",
      "Displayed version matches package",
    ],
  };
  fs.writeFileSync(
    path.join(out, "settings-sync.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(report);
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (browser) await browser.close();
  });
