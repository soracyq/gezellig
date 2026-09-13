/* global __dirname */
const assert = require("node:assert/strict");
const { Buffer } = require("node:buffer");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const { chromium, _electron } = createRequire(
  path.join(root, ".artifact-build/node_modules/__audit.cjs"),
)("playwright");
const desktop = process.argv.includes("--desktop");
const source = process.argv.includes("--source");
const base = desktop ? "dutchly://app" : "http://127.0.0.1:4173";
const out = path.join(root, "test-results/audit");
fs.mkdirSync(out, { recursive: true });
const mode = desktop ? (source ? "desktop-source" : "desktop") : "web";
const profile = path.join(out, `profile-${mode}-${Date.now()}`);
const errors = [],
  warnings = [],
  checks = [],
  bounds = [];
let app, browser, page;
async function launch() {
  if (desktop) {
    app = await _electron.launch({
      executablePath: source
        ? require("electron")
        : process.env.GEZELLIG_TEST_EXECUTABLE ||
          path.join(
            root,
            ".artifact-build/audit-desktop/win-unpacked/Gezellig.exe",
          ),
      args: [
        ...(source ? [path.join(root, "desktop")] : []),
        "--hidden",
        "--disable-background-timer-throttling",
        `--user-data-dir=${profile}`,
      ],
    });
    page = await app.firstWindow();
    await page.getByRole("heading").first().waitFor({ timeout: 30000 });
  } else {
    browser = await chromium.launchPersistentContext(profile, {
      executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      headless: true,
      viewport: { width: 1440, height: 1000 },
    });
    page = await browser.newPage();
  }
  page.setDefaultTimeout(12000);
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
    else if (m.type() === "warning") warnings.push(m.text());
  });
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
}
async function close() {
  if (app) await app.close();
  if (browser) await browser.close();
  app = browser = null;
}
async function go(route) {
  console.log(`Checking ${mode} ${route}`);
  await page.goto(base + route, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading").first().waitFor();
  await page.waitForFunction(
    () => document.title === "Gezellig · Your learning space",
    undefined,
    { timeout: 15000 },
  );
}
const snapshot = () =>
  page.evaluate(() => ({
    activity: localStorage.getItem("@dutchly/activity/v1"),
    curriculum: localStorage.getItem("@dutchly/curriculum/v1"),
    settings: localStorage.getItem("@dutchly/settings"),
  }));
(async () => {
  try {
    await launch();
    // Force a stale hydration to finish after the learner submits completion.
    await go("/vocabulary?preview=vocab-huis");
    await page
      .getByRole("button", { name: "Mark studied", exact: true })
      .waitFor();
    await page.evaluate(() => {
      const original = Promise.allSettled;
      Promise.allSettled = function (values) {
        Promise.allSettled = original;
        return original.call(Promise, values).then(
          (result) =>
            new Promise((resolve) => {
              window.__releaseAuditRead = () => resolve(result);
            }),
        );
      };
      window.dispatchEvent(
        new StorageEvent("storage", { key: "@dutchly/activity/v1" }),
      );
    });
    await page.waitForFunction(() => !!window.__releaseAuditRead);
    await page
      .getByRole("button", { name: "Mark studied", exact: true })
      .click();
    await page.waitForTimeout(250);
    await page.evaluate(() => window.__releaseAuditRead());
    await page
      .getByRole("button", { name: "Word studied", exact: true })
      .waitFor();
    await page.waitForTimeout(150);
    assert(
      await page
        .getByRole("button", { name: "Word studied", exact: true })
        .isVisible(),
    );
    assert.equal(JSON.parse((await snapshot()).activity).events.length, 1);
    checks.push(
      "Delayed learning refresh cannot overwrite a submitted completion",
    );
    await go("/settings");
    await page
      .getByRole("button", { name: "15 words per day", exact: true })
      .click();
    await page
      .getByText("Your target is 15 words per day.", { exact: false })
      .waitFor();
    const saved = await snapshot();
    await close();
    await launch();
    await go("/settings");
    assert.deepEqual(await snapshot(), saved);
    checks.push(
      "Learning progress and settings survive a full browser/app close and reopen",
    );

    const routes = [
      "/",
      "/levels",
      "/vocabulary",
      "/grammar",
      "/review",
      "/statistics",
      "/import",
      "/settings",
    ];
    for (const width of desktop ? [1360] : [360, 768, 1024, 1440, 2560]) {
      if (!desktop) await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await go(route);
        const size = await page
          .getByTestId("learning-page-scroll")
          .evaluate((el) => ({
            overflow: el.scrollWidth - el.clientWidth,
            width: el.clientWidth,
          }));
        assert(
          size.overflow <= 1,
          `${route} at ${width}: ${JSON.stringify(size)}`,
        );
        assert.match(await page.title(), /Gezellig/);
        if (route === "/settings") {
          const delta = await page
            .getByTestId("settings-content")
            .evaluate((el) => {
              const a = el.getBoundingClientRect(),
                b = el
                  .closest('[data-testid="learning-page-scroll"]')
                  .getBoundingClientRect();
              return (a.left + a.right - b.left - b.right) / 2;
            });
          assert(Math.abs(delta) <= 4, `Settings is off center: ${delta}`);
        }
        bounds.push({ route, viewport: width, ...size });
        if (
          [360, 1440].includes(width) &&
          ["/", "/settings", "/levels"].includes(route)
        )
          await page.screenshot({
            path: path.join(
              out,
              `${mode}-${route.slice(1) || "home"}-${width}.png`,
            ),
          });
      }
    }
    checks.push(
      "All eight routes have no horizontal overflow at tested widths; Settings stays centered",
    );
    await go("/settings");
    const storage = page.getByRole("link", {
      name: "Open imported study files",
      exact: true,
    });
    assert.equal(
      await storage.getAttribute("aria-label"),
      "Open imported study files",
    );
    await storage.focus();
    await page.keyboard.press("Enter");
    await page
      .getByRole("heading", { name: "Bring your own Dutch.", exact: true })
      .waitFor();
    await go("/settings");
    await page
      .getByRole("button", { name: "Reset learning progress", exact: true })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "Reset learning progress?",
      exact: true,
    });
    await dialog.waitFor();
    assert.equal(await page.getByRole("dialog").count(), 1);
    assert.equal(await dialog.getByRole("button").count(), 3);
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      assert(
        await dialog.evaluate((el) => el.contains(document.activeElement)),
        "Focus escaped the dialog",
      );
    }
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    assert.deepEqual(await snapshot(), saved);
    checks.push(
      "Named dialog traps keyboard focus; Escape cancels reset; storage icon opens Import with Enter",
    );
    // A file promise that resolves after timeout must not restart the worker.
    await go("/import");
    await page.evaluate(() => {
      const timer = window.setTimeout;
      window.setTimeout = function (callback, ms, ...args) {
        return timer(callback, ms === 20000 ? 50 : ms, ...args);
      };
      window.__originalArrayBuffer = File.prototype.arrayBuffer;
      File.prototype.arrayBuffer = function () {
        return new Promise((resolve) => {
          window.__lateAuditFile = () => resolve(new ArrayBuffer(2));
        });
      };
    });
    await page.locator('input[type="file"]').setInputFiles({
      name: "slow.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("a,b"),
    });
    await page
      .getByText("The file took too long to read.", { exact: false })
      .waitFor();
    await page.evaluate(() => {
      window.__lateAuditFile();
      File.prototype.arrayBuffer = window.__originalArrayBuffer;
    });
    await page.waitForTimeout(150);
    assert(
      await page
        .getByText("The file took too long to read.", { exact: false })
        .isVisible(),
    );
    assert.deepEqual(await snapshot(), saved);
    checks.push(
      "Stalled file read times out and ignores a late result without changing learner data",
    );
    await go("/import?kind=vocabulary");
    await page
      .locator('input[type="file"]')
      .setInputFiles(
        path.join(root, "public/templates/vocabulary_example.csv"),
      );
    await page
      .getByRole("button", { name: "Confirm import (4)", exact: true })
      .click();
    await page.getByText("4 words imported.", { exact: false }).waitFor();
    const beforeReset = await snapshot();
    await go("/settings");
    await page
      .getByRole("button", { name: "Reset learning progress", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Cancel reset", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden" });
    assert.deepEqual(await snapshot(), beforeReset);
    await page
      .getByRole("button", { name: "Reset learning progress", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Confirm progress reset", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden" });
    const afterReset = await snapshot();
    assert.equal(afterReset.curriculum, beforeReset.curriculum);
    assert.equal(afterReset.settings, beforeReset.settings);
    assert.deepEqual(JSON.parse(afterReset.activity), {
      version: 1,
      events: [],
    });
    await page.reload();
    await page.getByRole("heading").first().waitFor();
    assert.deepEqual(await snapshot(), afterReset);
    checks.push(
      "Real import survives cancel/confirm reset and reload; reset clears only activity",
    );
    for (const size of desktop
      ? []
      : [
          { width: 360, height: 640 },
          { width: 640, height: 360 },
        ]) {
      await page.setViewportSize(size);
      for (const route of [
        "/vocabulary?preview=vocab-huis",
        "/grammar?preview=grammar-articles",
      ]) {
        await go(route);
        const modal = page.getByRole("dialog");
        await modal.waitFor();
        assert.equal(await modal.count(), 1);
        for (const name of ["Close preview", "Done"]) {
          const box = await modal
            .getByRole("button", { name, exact: true })
            .boundingBox();
          assert(
            box &&
              box.x >= 0 &&
              box.y >= 0 &&
              box.x + box.width <= size.width &&
              box.y + box.height <= size.height,
            `${name} outside ${JSON.stringify(size)}`,
          );
        }
        assert(
          await modal.evaluate((el) =>
            [...el.querySelectorAll("div")].every(
              (child) =>
                child.scrollWidth <= child.clientWidth + 1 ||
                getComputedStyle(child).overflowX === "auto",
            ),
          ),
          "Modal horizontal overflow",
        );
        await modal.getByRole("button", { name: "Done", exact: true }).click();
      }
      await go("/settings");
      await page
        .getByRole("button", { name: "Open navigation menu", exact: true })
        .click();
      const menu = page.getByRole("dialog", {
        name: "Navigation",
        exact: true,
      });
      await menu.waitFor();
      assert.equal(await menu.getByRole("link").count(), 8);
      await menu.getByRole("link", { name: "Grammar", exact: true }).click();
      await menu.waitFor({ state: "hidden" });
      assert(new URL(page.url()).pathname === "/grammar");
    }
    if (!desktop)
      checks.push(
        "Vocabulary/Grammar dialogs and navigation remain usable at 360×640 and 640×360",
      );
    assert.deepEqual(errors, []);
    fs.writeFileSync(
      path.join(out, `${mode}.json`),
      JSON.stringify({ checks, bounds, errors, warnings }, null, 2),
    );
    console.log(checks.join("\n"));
    if (warnings.length)
      console.log("Runtime warnings:", [...new Set(warnings)]);
  } finally {
    await close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
