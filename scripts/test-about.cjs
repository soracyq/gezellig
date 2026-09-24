/* global __dirname */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const { chromium, _electron: electron } = createRequire(
  path.join(root, ".artifact-build/node_modules/__about.cjs"),
)("playwright");
const { version } = require("../package.json");
const { repository } = require("../desktop/project-info.json");
const { updateAPI } = require("../desktop/external-links.cjs");
const desktop = process.argv.includes("--desktop");
const live = process.argv.includes("--live");
const expectCurrent = process.argv.includes("--expect-current");
if (expectCurrent && !live)
  throw new Error("--expect-current requires --live.");
const out = path.join(root, "test-results/about");
fs.mkdirSync(out, { recursive: true });
let session;
const snapshot = (page) =>
  page.evaluate(() =>
    JSON.stringify(
      Object.fromEntries(
        Object.keys(localStorage)
          .sort()
          .map((key) => [key, localStorage.getItem(key)]),
      ),
    ),
  );
(async () => {
  let page, context;
  if (desktop) {
    session = await electron.launch({
      executablePath:
        process.env.GEZELLIG_TEST_EXECUTABLE ||
        path.join(root, "release/win-unpacked/Gezellig.exe"),
      args: [
        "--hidden",
        "--disable-background-timer-throttling",
        `--user-data-dir=${path.join(out, `desktop-${Date.now()}`)}`,
      ],
    });
    page = await session.firstWindow();
    context = session.context();
    await session
      .evaluate(({ app, shell }) => {
        globalThis.__aboutLinks = [];
        shell.openExternal = async (url) => {
          globalThis.__aboutLinks.push(url);
        };
        return app.getVersion();
      })
      .then((actual) => assert.equal(actual, version));
  } else {
    session = await chromium.launch({
      executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      headless: true,
    });
    context = await session.newContext({
      viewport: { width: 1344, height: 950 },
    });
    page = await context.newPage();
    await page.goto(
      process.env.GEZELLIG_TEST_BASE_URL || "http://127.0.0.1:4174",
    );
    await context.route(`${repository}**`, (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "Official project link opened in a new browser tab.",
      }),
    );
  }
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page
    .getByRole("heading", { name: "Your daily dose of Dutch.", exact: true })
    .waitFor();
  // Preserve genuine saved activity, not just an empty profile.
  await page.getByRole("link", { name: "Vocabulary", exact: true }).click();
  await page
    .getByRole("button", { name: "Preview het huis", exact: true })
    .click();
  await page.getByRole("button", { name: "Mark studied", exact: true }).click();
  await page
    .getByRole("button", { name: "Word studied", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page
    .getByRole("button", { name: "Close preview", exact: true })
    .waitFor({ state: "hidden" });
  const before = await snapshot(page);
  let requests = 0,
    responseTag = `v${version}`,
    responseStatus = 200,
    fail = false,
    releasePending;
  if (live)
    context.on("request", (request) => {
      if (request.url() === updateAPI) requests++;
    });
  let delay = false;
  if (!live)
    await context.route(updateAPI, async (route) => {
      requests++;
      if (delay)
        await new Promise((resolve) => {
          releasePending = resolve;
        });
      if (fail) return route.abort("internetdisconnected");
      await route.fulfill({
        status: responseStatus,
        contentType: "application/json",
        body: JSON.stringify({
          tag_name: responseTag,
          draft: false,
          prerelease: false,
          body:
            "## What's new\n- Improved Dutch practice\n" +
            "Additional release information. ".repeat(100),
        }),
      });
    });
  const entry = page.getByRole("button", {
    name: `About Gezellig, version ${version}`,
    exact: true,
  });
  await entry.focus();
  await page.keyboard.press("Enter");
  await page
    .getByRole("heading", { name: "About Gezellig", exact: true })
    .waitFor();
  await page.getByText("Derrick Chen", { exact: true }).waitFor();
  await page.getByText(`Version ${version}`, { exact: true }).last().waitFor();
  assert.equal(requests, 0, "opening About must not request GitHub");
  const github = page.getByRole("link", {
    name: "Open Gezellig's GitHub repository in your browser",
    exact: true,
  });
  assert.equal(await github.getAttribute("href"), repository);
  async function openExternal(link, expected) {
    if (desktop) {
      const prior = await session.evaluate(
        () => globalThis.__aboutLinks.length,
      );
      await link.click();
      await page.waitForTimeout(200);
      const links = await session.evaluate(() => globalThis.__aboutLinks);
      assert.equal(links.length, prior + 1);
      assert.equal(links.at(-1), expected);
    } else {
      const opened = context.waitForEvent("page");
      await link.click();
      const tab = await opened;
      await tab.waitForURL(expected);
      await tab.close();
    }
  }
  await openExternal(github, repository);
  if (!live) delay = true;
  await page
    .getByRole("button", { name: "Check for updates", exact: true })
    .click();
  if (!live) {
    const checking = page.getByRole("button", {
      name: "Checking for updates…",
      exact: true,
    });
    assert(await checking.isDisabled());
    await checking.evaluate((el) => {
      el.click();
      el.click();
    });
    await page.waitForTimeout(200);
    assert.equal(requests, 1, "repeated clicks must share one request");
    delay = false;
    releasePending();
  }
  let liveUpdateStatus, liveUpdateDetails;
  if (live) {
    const status = page.getByText(
      /^(You're up to date|You're using a newer build|A new version is available)$/,
    );
    await status.waitFor({ timeout: 15000 });
    liveUpdateStatus = await status.innerText();
    liveUpdateDetails = await page.getByTestId("update-status").innerText();
    assert.equal(requests, 1, "live verification must request GitHub once");
    if (expectCurrent) {
      assert.equal(
        liveUpdateStatus,
        "You're up to date",
        "GitHub's latest published release must match the packaged app",
      );
      await page
        .getByText(`Gezellig ${version} is the latest version.`, {
          exact: true,
        })
        .waitFor();
    }
    await page.screenshot({
      path: path.join(out, `${desktop ? "desktop" : "web"}-live.png`),
    });
  } else {
    await page
      .getByText("You're up to date", { exact: true })
      .waitFor({ timeout: 15000 });
    await page
      .getByText(`Gezellig ${version} is the latest version.`, { exact: true })
      .waitFor();
  }
  await page.getByText("Last successful check:", { exact: false }).waitFor();
  if (!live) {
    responseTag = "v0.10.0";
    await page
      .getByRole("button", { name: "Check for updates", exact: true })
      .click();
    await page
      .getByText("A new version is available", { exact: true })
      .waitFor();
    const update = page.getByRole("link", {
      name: "View update and full release notes on GitHub",
      exact: true,
    });
    await openExternal(update, `${repository}/releases/tag/v0.10.0`);
    if (!desktop)
      await page.getByText("This is the web app.", { exact: false }).waitFor();
    if (!desktop)
      await page.screenshot({
        path: path.join(out, `${desktop ? "desktop" : "web"}-update.png`),
      });
    fail = true;
    await page
      .getByRole("button", { name: "Check for updates", exact: true })
      .click();
    await page
      .getByText(
        "Unable to check for updates. Please check your internet connection and try again.",
        { exact: true },
      )
      .waitFor();
    fail = false;
    responseStatus = 429;
    await page
      .getByRole("button", { name: "Retry update check", exact: true })
      .click();
    await page
      .getByText("GitHub is limiting update checks right now.", {
        exact: false,
      })
      .waitFor();
    responseStatus = 503;
    await page
      .getByRole("button", { name: "Retry update check", exact: true })
      .click();
    await page
      .getByText("GitHub is unavailable right now.", { exact: false })
      .waitFor();
    responseStatus = 200;
    responseTag = `v${version}`;
    await page
      .getByRole("button", { name: "Retry update check", exact: true })
      .click();
    await page.getByText("You're up to date", { exact: true }).waitFor();
  }
  await page
    .getByRole("button", { name: "Close About Gezellig", exact: true })
    .focus();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    assert(
      await page.evaluate(
        () =>
          !!document.activeElement?.closest(
            '[aria-modal="true"], [role="dialog"]',
          ),
      ),
      "focus must stay inside About",
    );
  }
  await page.keyboard.press("Escape");
  await page
    .getByRole("heading", { name: "About Gezellig", exact: true })
    .waitFor({ state: "hidden" });
  assert(
    await entry.evaluate((el) => el === document.activeElement),
    "focus returns to About entry",
  );
  if (!desktop && !live) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page
      .getByRole("button", { name: "Open navigation menu", exact: true })
      .click();
    await entry.click();
    await page
      .getByRole("heading", { name: "About Gezellig", exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "Close navigation menu", exact: true })
      .waitFor({ state: "hidden" });
    await page.waitForTimeout(350); // Capture the completed modal fade, not its overlap with the closing menu.
    await page.screenshot({ path: path.join(out, "mobile-about.png") });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    );
    await page
      .getByRole("button", { name: "Close About Gezellig", exact: true })
      .focus();
    await page.keyboard.press("Enter");
    await page
      .getByRole("heading", { name: "About Gezellig", exact: true })
      .waitFor({ state: "hidden" });
  }
  assert.equal(
    await snapshot(page),
    before,
    "About and updates must preserve every storage entry",
  );
  assert.deepEqual(errors, []);
  const report = {
    environment: desktop ? "packaged Windows" : "production web",
    liveAPI: live,
    expectedCurrent: expectCurrent,
    liveUpdateStatus,
    liveUpdateDetails,
    version,
    requests,
    errors,
    storageUnchanged: true,
    externalLinksVerified: true,
    keyboardVerified: true,
  };
  fs.writeFileSync(
    path.join(out, `${desktop ? "desktop" : "web"}${live ? "-live" : ""}.json`),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (session) await session.close();
  });
