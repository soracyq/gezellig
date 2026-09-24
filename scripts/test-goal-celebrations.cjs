/* global __dirname */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const { chromium, _electron: electron } = createRequire(
  path.join(root, ".artifact-build/node_modules/__goals.cjs"),
)("playwright");
const desktop = process.argv.includes("--desktop");
const out = path.join(root, "test-results/goal-celebrations");
fs.mkdirSync(out, { recursive: true });
let session;
(async () => {
  const { vocabularyItems } = await import("../src/data/sample-content.ts");
  const { makeEvent, localDay } = await import("../src/domain/activity.ts");
  const day = localDay(new Date());
  let page, context;
  if (desktop) {
    session = await electron.launch({
      executablePath: path.join(root, "release/win-unpacked/Gezellig.exe"),
      args: [
        "--hidden",
        "--disable-background-timer-throttling",
        `--user-data-dir=${path.join(out, `desktop-${Date.now()}`)}`,
      ],
    });
    page = await session.firstWindow();
    context = session.context();
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
      process.env.GEZELLIG_TEST_BASE_URL || "http://127.0.0.1:4175",
    );
  }
  await page
    .getByRole("heading", { name: "Your daily dose of Dutch.", exact: true })
    .waitFor();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const base =
    new URL(page.url()).origin === "null"
      ? "dutchly://app"
      : new URL(page.url()).origin;
  // Observe real Web Audio decoding/playback; do not replace it with fake audio.
  await context.addInitScript(() => {
    window.__goalSounds = [];
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...args) {
      const result = start.apply(this, args);
      window.__goalSounds.push({
        duration: this.buffer?.duration,
        state: this.context.state,
        loop: this.loop,
      });
      return result;
    };
  });
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
      .map((word) => makeEvent("word-studied", word.id, "vocabulary")),
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  const read = () =>
    page.evaluate(() => ({
      activity: JSON.parse(localStorage.getItem("@dutchly/activity/v1")),
      dates: JSON.parse(localStorage.getItem("@dutchly/goal-celebrations/v1")),
      sounds: window.__goalSounds,
    }));
  const reward = () =>
    page.getByRole("button", { name: "Close celebration", exact: true });
  const closeStudy = async () => {
    await page
      .getByRole("button", { name: "Close preview", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Close preview", exact: true })
      .waitFor({ state: "hidden" });
  };
  await page.getByRole("link", { name: "Vocabulary", exact: true }).click();
  await page
    .getByRole("button", { name: "Preview het huis", exact: true })
    .click();
  assert.equal((await read()).activity.events.length, 4);
  assert.equal(await reward().count(), 0);
  assert.equal((await read()).sounds.length, 0);
  // Block every remote request: the shipped sound still works locally.
  await context.route("**/*", (route) => {
    const url = route.request().url();
    return url.startsWith(base + "/") ? route.continue() : route.abort();
  });
  await page.getByRole("button", { name: "Mark studied", exact: true }).click();
  await page
    .getByRole("heading", {
      name: "Today's vocabulary goal complete! 🎉",
      exact: true,
    })
    .waitFor();
  await page.getByText("You studied 5 words today.", { exact: true }).waitFor();
  await page.waitForFunction(() => window.__goalSounds.length === 1);
  let state = await read();
  assert.equal(state.dates.vocabularyGoalCelebratedDate, day);
  assert.equal(state.activity.events.length, 5);
  assert.deepEqual(state.sounds, [
    { duration: 1.6, state: "running", loop: false },
  ]);
  if (!desktop)
    await page.screenshot({ path: path.join(out, "web-vocabulary.png") });
  // Keyboard focus stays in the top dialog, and Enter dismisses it.
  await page
    .getByRole("button", { name: "Continue learning", exact: true })
    .focus();
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() =>
      document.activeElement?.getAttribute("aria-label"),
    ),
    "Done",
  );
  await page.keyboard.press("Enter");
  await reward().waitFor({ state: "hidden" });
  assert(
    await page
      .getByRole("button", { name: "Word studied", exact: true })
      .isDisabled(),
  );
  await closeStudy();
  await page.getByRole("button", { name: "Preview zijn", exact: true }).click();
  await page.getByRole("button", { name: "Mark studied", exact: true }).click();
  await page
    .getByRole("button", { name: "Word studied", exact: true })
    .waitFor();
  assert.equal((await read()).sounds.length, 1);
  assert.equal(await reward().count(), 0);
  await closeStudy();
  await page.getByRole("link", { name: "Grammar", exact: true }).click();
  await page
    .getByRole("button", { name: "Open lesson", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Complete lesson", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Grammar goal complete! 🎉", exact: true })
    .waitFor();
  await page.waitForFunction(() => window.__goalSounds.length === 2);
  assert.equal((await read()).dates.grammarGoalCelebratedDate, day);
  if (!desktop) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(out, "mobile-grammar.png") });
    assert(await reward().isVisible());
    assert(
      await page
        .getByRole("button", { name: "Done", exact: true })
        .last()
        .isVisible(),
    );
  }
  await page.keyboard.press("Escape");
  await reward().waitFor({ state: "hidden" });
  await closeStudy();
  const saved = (await read()).activity;
  await page.reload({ waitUntil: "domcontentloaded" });
  await page
    .getByRole("heading", {
      name: "Find the rhythm of Dutch.",
      exact: true,
    })
    .waitFor();
  assert.equal(await reward().count(), 0);
  assert.equal((await read()).sounds.length, 0);
  assert.deepEqual((await read()).activity, saved);
  if (!desktop) await page.setViewportSize({ width: 1344, height: 950 });
  // Second, newly completed grammar lesson today cannot celebrate again.
  await page
    .getByRole("button", { name: "Open lesson", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Complete lesson", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Lesson completed", exact: true })
    .waitFor();
  assert.equal(await reward().count(), 0);
  assert.equal((await read()).sounds.length, 0);
  state = await read();
  assert.equal(
    state.activity.events.filter((e) => e.kind === "word-studied").length,
    6,
  );
  assert.equal(
    state.activity.events.filter((e) => e.kind === "lesson-completed").length,
    2,
  );
  assert.deepEqual(errors, []);
  const result = {
    platform: desktop ? "Windows" : "web",
    vocabularyAndGrammar: true,
    realLocalAudioPlayed: true,
    remoteRequestsBlocked: true,
    reloadDidNotReplay: true,
    keyboardDismissal: true,
    errors,
  };
  fs.writeFileSync(
    path.join(out, desktop ? "desktop.json" : "web.json"),
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result));
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (session) await session.close();
  });
