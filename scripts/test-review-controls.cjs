/* global __dirname */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const { chromium, _electron: electron } = createRequire(
  path.join(root, ".artifact-build/node_modules/__review-controls.cjs"),
)("playwright");
const { version } = require("../package.json");
const desktop = process.argv.includes("--desktop");
const base = desktop
  ? "dutchly://app"
  : process.env.GEZELLIG_TEST_BASE_URL || "http://127.0.0.1:4174";
const out = path.join(root, "test-results/review-controls");
fs.mkdirSync(out, { recursive: true });
let session;
(async () => {
  const { vocabularyItems, grammarTopics } =
    await import("../src/data/sample-content.ts");
  const { makeEvent } = await import("../src/domain/activity.ts");
  const { dailyReview } = await import("../src/domain/review.ts");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const seed = {
    version: 1,
    events: [
      ...[vocabularyItems[0], vocabularyItems[3]].map((word) =>
        makeEvent("word-studied", word.id, "vocabulary", {}, yesterday),
      ),
      makeEvent(
        "lesson-completed",
        grammarTopics[0].id,
        "grammar",
        {},
        yesterday,
      ),
    ],
  };
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
    await session.evaluate(({ shell }) => {
      globalThis.__reviewLinks = [];
      shell.openExternal = async (url) => {
        globalThis.__reviewLinks.push(url);
      };
    });
  } else {
    session = await chromium.launch({
      executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      headless: true,
    });
    context = await session.newContext({
      viewport: { width: 1344, height: 950 },
    });
    page = await context.newPage();
    await context.route("https://translate.google.com/**", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "Google Translate speaker page",
      }),
    );
  }
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  if (!desktop) await page.goto(base, { waitUntil: "domcontentloaded" });
  await page
    .getByRole("heading", { name: "Your daily dose of Dutch.", exact: true })
    .waitFor();
  await page.evaluate(
    (activity) =>
      localStorage.setItem("@dutchly/activity/v1", JSON.stringify(activity)),
    seed,
  );
  await page.goto(base + "/review", { waitUntil: "domcontentloaded" });
  await page
    .getByRole("heading", { name: "Refresh 1 of 3", exact: true })
    .waitFor();
  const stored = () =>
    page.evaluate(() => ({
      activity: JSON.parse(localStorage.getItem("@dutchly/activity/v1")),
      curriculum: localStorage.getItem("@dutchly/curriculum/v1"),
      settings: localStorage.getItem("@dutchly/settings"),
    }));
  const before = await stored();
  const enter = async () => {
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press("Enter");
  };
  const syntheticEnter = (options) =>
    page.evaluate(
      (opts) =>
        document.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            bubbles: true,
            cancelable: true,
            ...opts,
          }),
        ),
      options,
    );
  async function listen(link, expected) {
    const old = await stored(),
      href = await link.getAttribute("href"),
      url = new URL(href);
    assert.equal(url.origin, "https://translate.google.com");
    assert.equal(url.searchParams.get("sl"), "nl");
    assert.equal(url.searchParams.get("tl"), "en");
    if (expected) assert.equal(url.searchParams.get("text"), expected);
    if (desktop) {
      await link.click();
      await page.waitForTimeout(100);
      assert.equal(
        await session.evaluate(() => globalThis.__reviewLinks.at(-1)),
        href,
      );
    } else {
      const opened = context.waitForEvent("page");
      await link.click();
      const tab = await opened;
      await tab.waitForURL(href);
      await tab.close();
    }
    assert.deepEqual(
      await stored(),
      old,
      "listening must not record an answer",
    );
  }
  await listen(
    page
      .getByRole("link", {
        name: "Listen to this Dutch text in Google Translate",
        exact: true,
      })
      .first(),
  );
  await syntheticEnter({ repeat: true });
  await page
    .getByRole("heading", { name: "Refresh 1 of 3", exact: true })
    .waitFor();
  for (let i = 1; i <= 3; i++) {
    await enter();
    if (i < 3)
      await page
        .getByRole("heading", { name: `Refresh ${i + 1} of 3`, exact: true })
        .waitFor();
  }
  const answer = page.getByRole("textbox", {
    name: "Your Dutch answer",
    exact: true,
  });
  await answer.waitFor();
  assert.deepEqual(
    await stored(),
    before,
    "refresh and Enter navigation must not save answers",
  );
  let checkedGrammar = false,
    hoverChecked = false;
  for (let i = 0; i < 3; i++) {
    const current = dailyReview(
      vocabularyItems,
      grammarTopics,
      (await stored()).activity,
      10,
      new Date(),
    ).questions[0].question;
    await page.getByText(current.prompt, { exact: true }).waitFor();
    const check = page.getByRole("button", {
      name: "Check answer",
      exact: true,
    });
    assert(await check.isDisabled());
    await page.mouse.move(0, 0);
    const disabledColor = await check.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    await check.hover();
    assert.equal(
      await check.evaluate((el) => getComputedStyle(el).backgroundColor),
      disabledColor,
    );
    await answer.press("Enter");
    assert.equal(
      (await stored()).activity.events.length,
      seed.events.length + i,
    );
    await answer.fill(current.correctAnswer);
    await answer.dispatchEvent("keydown", { key: "Enter", isComposing: true });
    await answer.dispatchEvent("keydown", { key: "Enter", repeat: true });
    assert.equal(
      (await stored()).activity.events.length,
      seed.events.length + i,
    );
    if (current.contentType === "grammar") {
      checkedGrammar = true;
      await answer.press("End");
      await answer.press("Shift+Enter");
      assert((await answer.inputValue()).includes("\n"));
      assert.equal(
        (await stored()).activity.events.length,
        seed.events.length + i,
      );
      await answer.fill(current.correctAnswer);
    }
    await listen(
      page.getByRole("link", {
        name: "Listen to your draft answer in Google Translate",
        exact: true,
      }),
      current.correctAnswer,
    );
    if (!hoverChecked) {
      await page.mouse.move(0, 0);
      const normal = await check.evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      await check.hover();
      assert.notEqual(
        await check.evaluate((el) => getComputedStyle(el).backgroundColor),
        normal,
      );
      const secondary = page.getByRole("link", {
        name: "Listen to your draft answer in Google Translate",
        exact: true,
      });
      const baseColor = await secondary.evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      await secondary.hover();
      assert.notEqual(
        await secondary.evaluate((el) => getComputedStyle(el).backgroundColor),
        baseColor,
      );
      hoverChecked = true;
    }
    await answer.press("Enter");
    await page.getByText("Answer saved.", { exact: true }).waitFor();
    await syntheticEnter({ repeat: true });
    await page.getByText("Answer saved.", { exact: true }).waitFor();
    assert.equal(
      (await stored()).activity.events.length,
      seed.events.length + i + 1,
    );
    await listen(
      page.getByRole("link", {
        name: "Listen to this Dutch text in Google Translate",
        exact: true,
      }),
      current.correctAnswer,
    );
    if (i === 0) {
      await page
        .getByRole("button", {
          name: `About Gezellig, version ${version}`,
          exact: true,
        })
        .click();
      await page
        .getByRole("heading", { name: "About Gezellig", exact: true })
        .waitFor();
      await syntheticEnter({});
      await page
        .getByRole("heading", { name: "About Gezellig", exact: true })
        .waitFor();
      await page
        .getByRole("button", { name: "Close About Gezellig", exact: true })
        .click();
      await page
        .getByRole("heading", { name: "About Gezellig", exact: true })
        .waitFor({ state: "hidden" });
      await page.getByText("Answer saved.", { exact: true }).waitFor();
      if (!desktop)
        await page.screenshot({
          path: path.join(out, `${desktop ? "desktop" : "web"}-feedback.png`),
        });
    }
    await enter();
    if (i < 2) await answer.waitFor();
  }
  await page
    .getByRole("heading", { name: "Review complete", exact: true })
    .waitFor();
  const after = await stored();
  assert.equal(after.activity.events.length, seed.events.length + 3);
  assert(
    after.activity.events
      .slice(seed.events.length)
      .every((event) => event.correct),
  );
  assert.equal(after.settings, before.settings);
  assert.equal(after.curriculum, before.curriculum);
  assert(checkedGrammar);
  assert(hoverChecked);
  assert.deepEqual(errors, []);
  const report = {
    environment: desktop ? "packaged Windows" : "production web",
    version,
    reviewAnswers: 3,
    grammarShiftEnter: checkedGrammar,
    hover: hoverChecked,
    refreshAndLinksDoNotRecordProgress: true,
    errors,
  };
  fs.writeFileSync(
    path.join(out, `${desktop ? "desktop" : "web"}.json`),
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
