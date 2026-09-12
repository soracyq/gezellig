/* global __dirname */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const { chromium, _electron: electron } = createRequire(
  path.join(root, ".artifact-build/node_modules/__review.cjs"),
)("playwright");
const desktop = process.argv.includes("--desktop");
const out = path.join(root, "test-results/review-improvements");
fs.mkdirSync(out, { recursive: true });
const base = desktop ? "dutchly://app" : "http://127.0.0.1:4173";
const errors = [],
  checks = [];
let session;
const snapshot = (page) =>
  page.evaluate(() => ({
    activity: localStorage.getItem("@dutchly/activity/v1"),
    curriculum: localStorage.getItem("@dutchly/curriculum/v1"),
    settings: localStorage.getItem("@dutchly/settings"),
  }));
async function go(page, route) {
  console.log(`Opening ${route}`);
  if (route === "/review" && page.url().startsWith(base)) {
    // Isolated regression profile: simulate the next day after its UI study
    // actions so the due-only scheduler can exercise the historical flow.
    await page.evaluate(() => {
      const raw = localStorage.getItem("@dutchly/activity/v1");
      if (!raw) return;
      const journal = JSON.parse(raw),
        now = new Date(),
        yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const today = now.toLocaleDateString("en-CA");
      let changed = false;
      for (const event of journal.events)
        if (event.kind !== "answer" && event.day === today) {
          event.day = yesterday.toLocaleDateString("en-CA");
          event.occurredAt = yesterday.toISOString();
          changed = true;
        }
      if (changed)
        localStorage.setItem("@dutchly/activity/v1", JSON.stringify(journal));
    });
  }
  await page.goto(base + route);
  await page
    .getByText("Loading your saved learning space…", { exact: true })
    .waitFor({ state: "hidden" });
  await page.getByRole("heading").first().waitFor();
  if (route === "/review") await startTest(page);
}
async function startTest(page) {
  for (
    let i = 0;
    i < 50 &&
    (await page
      .getByRole("button", { name: "Next material", exact: true })
      .count());
    i++
  )
    await page
      .getByRole("button", { name: "Next material", exact: true })
      .click();
  const start = page.getByRole("button", { name: "Start test", exact: true });
  if (await start.count()) await start.click();
}
function speechMock() {
  let voices = [];
  const target = new EventTarget();
  window.__spoken = [];
  Object.defineProperty(window, "SpeechSynthesisUtterance", {
    configurable: true,
    value: class {
      constructor(text) {
        this.text = text;
      }
    },
  });
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: {
      getVoices: () => voices,
      cancel: () => {},
      speak: (u) =>
        window.__spoken.push({
          text: u.text,
          lang: u.lang,
          voice: u.voice.lang,
        }),
      addEventListener: (...a) => target.addEventListener(...a),
      removeEventListener: (...a) => target.removeEventListener(...a),
    },
  });
  window.__setDutchVoice = () => {
    voices = [
      { lang: "en-US", name: "English", voiceURI: "en", localService: true },
      { lang: "nl-NL", name: "Test Dutch", voiceURI: "nl", localService: true },
    ];
    target.dispatchEvent(new Event("voiceschanged"));
  };
}
async function importFile(page, kind, filename, count) {
  await go(page, `/import?kind=${kind}`);
  const before = await snapshot(page),
    chooser = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "Choose CSV or Excel file", exact: true })
    .click();
  await (
    await chooser
  ).setFiles(path.join(root, "public/import-data", filename));
  await page
    .getByRole("heading", { name: "4. Review and confirm", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: `Confirm import (${count})`, exact: true })
    .click();
  await page
    .getByText(
      new RegExp(
        `${count} ${kind === "grammar" ? "lessons" : "words"} imported\\.`,
      ),
    )
    .waitFor();
  assert.equal((await snapshot(page)).activity, before.activity);
}
async function studyWord(page, id) {
  await go(page, `/vocabulary?preview=${encodeURIComponent(id)}`);
  await page.getByRole("button", { name: "Mark studied", exact: true }).click();
  await page
    .getByRole("button", { name: "Word studied", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Done", exact: true }).click();
}
(async () => {
  const { vocabularyItems, grammarTopics } =
    await import("../src/data/sample-content.ts");
  const { dailyReview } = await import("../src/domain/review.ts");
  const profile = path.join(
    out,
    `${desktop ? "desktop" : "browser"}-${Date.now()}`,
  );
  async function launch() {
    let opened;
    if (desktop) {
      session = await electron.launch({
        executablePath: path.join(root, "release/win-unpacked/Dutchly.exe"),
        args: [
          "--hidden",
          "--disable-background-timer-throttling",
          `--user-data-dir=${profile}`,
        ],
        timeout: 45000,
      });
      opened = await session.firstWindow();
      opened.setDefaultTimeout(20000);
      await opened
        .getByRole("heading", {
          name: "Your daily dose of Dutch.",
          exact: true,
        })
        .waitFor();
      await opened.context().addInitScript(speechMock);
    } else {
      session = await chromium.launchPersistentContext(profile, {
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        headless: true,
        viewport: { width: 1440, height: 1100 },
        timezoneId: "Europe/Amsterdam",
      });
      await session.addInitScript(speechMock);
      opened = await session.newPage();
      opened.setDefaultTimeout(20000);
    }
    opened.on("pageerror", (e) => errors.push(e.message));
    return opened;
  }
  let page = await launch();
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
    await go(page, route);
  checks.push("All eight routes load without a page error");
  await importFile(page, "vocabulary", "dutch_vocabulary_A1_500.csv", 493);
  await importFile(page, "vocabulary", "dutch_vocabulary_A2_1000.csv", 1000);
  await importFile(page, "grammar", "dutch_grammar_A1.xlsx", 32);
  await importFile(page, "grammar", "dutch_grammar_A2.xlsx", 40);
  const imported = await snapshot(page),
    curriculum = JSON.parse(imported.curriculum);
  assert.equal(curriculum.vocabulary.length + vocabularyItems.length, 1501);
  assert.equal(curriculum.grammar.length + grammarTopics.length, 74);
  await go(page, "/review");
  await page.getByText("Nothing to review yet", { exact: true }).waitFor();
  assert.equal(await page.getByRole("textbox").count(), 0);
  assert.equal((await snapshot(page)).activity, imported.activity);
  checks.push(
    "1501 words and 74 lessons with no study history produce an empty Review",
  );
  await go(page, "/vocabulary?preview=vocab-huis");
  const listen = page.getByRole("button", {
    name: "Listen to Dutch pronunciation of het huis",
    exact: true,
  });
  await listen.waitFor();
  assert(await listen.isEnabled());
  await page
    .getByText("Built-in Dutch voice · works offline", {
      exact: true,
    })
    .waitFor();
  const heading = page.getByRole("heading", { name: "het huis", exact: true });
  const typography = await heading.evaluate((el) => ({
    size: parseFloat(getComputedStyle(el).fontSize),
    weight: Number(getComputedStyle(el).fontWeight),
  }));
  assert(typography.size >= 28 && typography.weight >= 700);
  assert.equal(
    await page.getByText("Browse grammar", { exact: true }).count(),
    0,
  );
  const beforeListen = await snapshot(page);
  await page.evaluate(() => window.__setDutchVoice());
  await listen.click();
  assert.deepEqual(await page.evaluate(() => window.__spoken), [
    { text: "het huis", lang: "nl-NL", voice: "nl-NL" },
  ]);
  assert.deepEqual(await snapshot(page), beforeListen);
  await listen.focus();
  await page.keyboard.press("Enter");
  assert.equal((await page.evaluate(() => window.__spoken)).length, 2);
  if (!desktop) {
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(out, "vocabulary-pronunciation.png"),
    });
  }
  await page.getByRole("button", { name: "Mark studied", exact: true }).click();
  await page
    .getByRole("button", { name: "Word studied", exact: true })
    .waitFor();
  const boy = curriculum.vocabulary.find((w) => w.dutch === "jongen");
  assert(boy);
  await studyWord(page, boy.id);
  await studyWord(page, "vocab-zijn");
  await go(page, "/grammar");
  const colors = [];
  for (const label of ["01", "02"])
    colors.push(
      await page.getByText(label, { exact: true }).evaluate((el) => ({
        text: getComputedStyle(el).color,
        background: getComputedStyle(el.parentElement).backgroundColor,
      })),
    );
  assert.deepEqual(colors[0], colors[1]);
  checks.push(
    "Grammar cards 01/02 share visual styling; vocabulary title is 28px/bold and Browse grammar is gone",
  );
  for (const g of grammarTopics) {
    await go(page, `/grammar?preview=${g.id}`);
    await page
      .getByRole("button", { name: "Complete lesson", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Lesson completed", exact: true })
      .waitFor();
  }
  await go(page, "/review");
  await page
    .getByText("0 of 5 completed · 5 remaining", { exact: true })
    .waitFor();
  checks.push(
    "Only three studied words and two completed lessons become eligible",
  );
  for (const w of vocabularyItems.filter(
    (w) => !["vocab-huis", "vocab-zijn"].includes(w.id),
  ))
    await studyWord(page, w.id);
  await go(page, "/review");
  await page
    .getByText("0 of 10 completed · 10 remaining", { exact: true })
    .waitFor();
  async function expected() {
    const saved = await snapshot(page);
    return dailyReview(
      [...vocabularyItems, ...JSON.parse(saved.curriculum).vocabulary],
      [...grammarTopics, ...JSON.parse(saved.curriculum).grammar],
      JSON.parse(saved.activity),
      JSON.parse(saved.settings || '{"dailyTarget":10}').dailyTarget,
      new Date(),
    );
  }
  async function submitOne(wrong = false) {
    await startTest(page);
    const p = await expected(),
      q = p.questions[0].question;
    await page.getByText(q.prompt, { exact: true }).waitFor();
    const input = page.getByRole("textbox", {
      name: "Your Dutch answer",
      exact: true,
    });
    assert.equal(await page.getByRole("radio").count(), 0);
    assert.equal(
      await input.evaluate((el) => el.tagName),
      q.contentType === "grammar" ? "TEXTAREA" : "INPUT",
    );
    await input.fill(
      wrong
        ? "wrong"
        : `  ${q.correctAnswer.toUpperCase().replace(/ /g, "   ")}  `,
    );
    await page
      .getByRole("button", { name: "Check answer", exact: true })
      .click();
    await page.getByText("Answer saved.", { exact: true }).waitFor();
    assert((await page.locator("body").innerText()).includes(q.correctAnswer));
    const next = page.getByRole("button", {
      name: "Next question",
      exact: true,
    });
    if (await next.count()) await next.click();
    else
      await page
        .getByRole("button", { name: "See today’s results", exact: true })
        .click();
  }
  const beforeSkip = await snapshot(page);
  await page.getByRole("button", { name: "Skip for now", exact: true }).click();
  assert.deepEqual(await snapshot(page), beforeSkip);
  await go(page, "/review");
  if (!desktop) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(out, "review-mobile.png") });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    );
    await page.setViewportSize({ width: 1440, height: 1100 });
  }
  for (let i = 0; i < 4; i++) await submitOne(i === 0);
  const beforeClose = await snapshot(page);
  await session.close();
  session = null;
  page = await launch();
  await go(page, "/review");
  assert.deepEqual(await snapshot(page), beforeClose);
  await page.reload();
  await page
    .getByText("4 of 10 completed · 6 remaining", { exact: true })
    .waitFor();
  await startTest(page);
  if (!desktop) {
    const other = await session.newPage();
    await go(other, "/review");
    const q = (await expected()).questions[0].question;
    await page
      .getByRole("textbox", { name: "Your Dutch answer", exact: true })
      .fill(q.correctAnswer);
    await other
      .getByRole("textbox", { name: "Your Dutch answer", exact: true })
      .fill(q.correctAnswer);
    await Promise.all([
      page.getByRole("button", { name: "Check answer", exact: true }).click(),
      other.getByRole("button", { name: "Check answer", exact: true }).click(),
    ]);
    await page
      .getByText(/Answer saved\.|This item was already saved today/)
      .waitFor();
    await other.close();
    await go(page, "/review");
    assert.equal((await expected()).completed, 5);
  } else await submitOne();
  for (let i = 5; i < 10; i++) await submitOne();
  await page
    .getByRole("heading", { name: "Review complete", exact: true })
    .waitFor();
  assert.equal(await page.getByRole("textbox").count(), 0);
  await go(page, "/settings");
  await page
    .getByRole("button", { name: "5 words per day", exact: true })
    .click();
  await page
    .getByText("Your target is 5 words per day.", { exact: false })
    .waitFor();
  await go(page, "/review");
  await page
    .getByText("10 of 10 completed · 0 remaining", { exact: true })
    .waitFor();
  await go(page, "/settings");
  await page
    .getByRole("button", { name: "15 words per day", exact: true })
    .click();
  await page
    .getByText("Your target is 15 words per day.", { exact: false })
    .waitFor();
  await go(page, "/review");
  await page
    .getByText("10 of 11 completed · 1 remaining", { exact: true })
    .waitFor();
  await submitOne();
  await page
    .getByText("You’re all caught up for today.", { exact: true })
    .waitFor();
  if (!desktop)
    await page.screenshot({ path: path.join(out, "review-complete.png") });
  const final = await snapshot(page);
  const events = JSON.parse(final.activity).events,
    answers = events.filter((e) => e.source === "daily-review");
  assert.equal(answers.length, 11);
  assert.equal(answers.filter((e) => e.correct).length, 10);
  assert.equal(answers.filter((e) => e.contentType === "grammar").length, 2);
  assert.equal(final.curriculum, imported.curriculum);
  await go(page, "/statistics");
  const stats = await page.locator("body").innerText();
  assert(stats.includes("91%"));
  checks.push(
    "Typed vocabulary/grammar answers, skips, full process close/reopen and reload at 4/10, daily finish, target decrease/increase and 11 unique saved attempts",
  );
  checks.push(
    "Mocked delayed Dutch voice loading, exact target + nl-NL, keyboard Listen, fallback and no pronunciation progress",
  );
  if (!desktop)
    checks.push(
      "Concurrent browser tabs save one attempt for one item; mobile layout fits 390px",
    );
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    path.join(out, desktop ? "windows-report.json" : "browser-report.json"),
    JSON.stringify(
      { checkedAt: new Date().toISOString(), checks, errors },
      null,
      2,
    ) + "\n",
  );
  console.log(JSON.stringify({ checks, errors }, null, 2));
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (session) await session.close();
  });
