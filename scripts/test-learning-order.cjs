/* global __dirname */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const { chromium, _electron: electron } = createRequire(
  path.join(root, ".artifact-build/node_modules/__learning-order.cjs"),
)("playwright");
const desktop = process.argv.includes("--desktop");
const out = path.join(root, "test-results/learning-order");
fs.mkdirSync(out, { recursive: true });
let session;
(async () => {
  const { vocabularyItems } = await import("../src/data/sample-content.ts");
  const { readImportFile } = await import("../src/imports/read-file.ts");
  const { validateTable } = await import("../src/imports/validate.ts");
  const { commitPreview } = await import("../src/imports/commit.ts");
  const { emptyCurriculum } = await import("../src/storage/library.ts");
  const { orderVocabularyForLearning } =
    await import("../src/domain/vocabularyOrder.ts");
  const { vocabularyLabel } = await import("../src/domain/homeLearning.ts");
  const { makeEvent } = await import("../src/domain/activity.ts");
  let curriculum = emptyCurriculum();
  for (const [level, count] of [
    ["B1", 1500],
    ["B2", 2000],
  ]) {
    const name = `dutch_vocabulary_${level}_${count}.csv`;
    const table = await readImportFile(
      name,
      Uint8Array.from(
        fs.readFileSync(path.join(root, "public/import-data", name)),
      ).buffer,
      "vocabulary",
    );
    const preview = validateTable(table, "vocabulary", name, {
      vocabulary: [],
      grammar: [],
    });
    curriculum = commitPreview(
      curriculum,
      preview,
      { vocabulary: vocabularyItems, grammar: [] },
      `existing-${level}`,
    ).curriculum;
  }
  const sorted = orderVocabularyForLearning(curriculum.vocabulary);
  const byLevel = Object.fromEntries(
    ["B1", "B2"].map((level) => [
      level,
      sorted.filter((w) => w.level === level),
    ]),
  );
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const studied = [
    byLevel.B1[0],
    byLevel.B1.at(-1),
    byLevel.B2[0],
    byLevel.B2.at(-1),
  ];
  const activity = {
    version: 1,
    events: studied.map((w, i) =>
      makeEvent(
        "word-studied",
        w.id,
        "vocabulary",
        {},
        new Date(yesterday.getTime() + i * 1000),
      ),
    ),
  };
  let page;
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
  } else {
    session = await chromium.launch({
      executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      headless: true,
    });
    page = await session.newPage({ viewport: { width: 1344, height: 950 } });
    await page.goto(
      process.env.GEZELLIG_TEST_BASE_URL || "http://127.0.0.1:4175",
    );
  }
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page
    .getByRole("heading", { name: "Your daily dose of Dutch.", exact: true })
    .waitFor();
  await page.evaluate(
    ({ curriculum, activity }) => {
      localStorage.setItem(
        "@dutchly/curriculum/v1",
        JSON.stringify(curriculum),
      );
      localStorage.setItem("@dutchly/activity/v1", JSON.stringify(activity));
      localStorage.setItem(
        "@dutchly/settings",
        JSON.stringify({ version: 1, dailyTarget: 15 }),
      );
    },
    { curriculum, activity },
  );
  const snapshot = () =>
    page.evaluate(() =>
      Object.fromEntries(
        [
          "@dutchly/curriculum/v1",
          "@dutchly/activity/v1",
          "@dutchly/settings",
        ].map((k) => [k, localStorage.getItem(k)]),
      ),
    );
  const before = await snapshot();
  await page.reload({ waitUntil: "domcontentloaded" });
  const continueButton = page.getByRole("link", {
    name: "Continue learning",
    exact: true,
  });
  await continueButton.waitFor();
  assert(
    (await continueButton.getAttribute("href")).includes(
      encodeURIComponent(byLevel.B2[1].id),
    ),
  );
  await continueButton.click();
  await page
    .getByRole("heading", { name: vocabularyLabel(byLevel.B2[1]), exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Close preview", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Close preview", exact: true })
    .waitFor({ state: "hidden" });
  const cards = page.getByRole("button", { name: /^Preview / });
  for (const level of ["B1", "B2"]) {
    await page
      .getByRole("button", { name: `Vocabulary level ${level}`, exact: true })
      .click();
    await page.getByRole("button", { name: /^Vocabulary status All/ }).click();
    const fresh = byLevel[level].filter((w) => !studied.includes(w));
    const expected = fresh
      .slice(0, 50)
      .map((w) => `Preview ${vocabularyLabel(w)}`);
    assert.deepEqual(
      await cards.evaluateAll((els) =>
        els.map((el) => el.getAttribute("aria-label")),
      ),
      expected,
    );
    await page
      .getByRole("button", { name: /^Vocabulary status Studied/ })
      .click();
    assert.deepEqual(
      await cards.evaluateAll((els) =>
        els.map((el) => el.getAttribute("aria-label")),
      ),
      [byLevel[level][0], byLevel[level].at(-1)].map(
        (w) => `Preview ${vocabularyLabel(w)}`,
      ),
    );
    await cards.first().click();
    assert(
      await page
        .getByRole("button", { name: "Word studied", exact: true })
        .isDisabled(),
    );
    await page
      .getByRole("button", { name: "Close preview", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Close preview", exact: true })
      .waitFor({ state: "hidden" });
    await page
      .getByRole("button", { name: /^Vocabulary status Not studied/ })
      .click();
    await page
      .getByRole("button", { name: "Filter nouns", exact: true })
      .click();
    const nouns = fresh.filter((w) => w.wordType === "noun");
    assert.deepEqual(
      await cards.evaluateAll((els) =>
        els.map((el) => el.getAttribute("aria-label")),
      ),
      nouns.slice(0, 50).map((w) => `Preview ${vocabularyLabel(w)}`),
    );
    await page
      .getByRole("textbox", { name: "Search vocabulary", exact: true })
      .fill(nouns[0].dutch);
    await page
      .getByRole("button", {
        name: `Preview ${vocabularyLabel(nouns[0])}`,
        exact: true,
      })
      .waitFor();
    await page
      .getByRole("textbox", { name: "Search vocabulary", exact: true })
      .fill("");
    await page.getByRole("button", { name: "All words", exact: true }).click();
  }
  assert.deepEqual(
    await snapshot(),
    before,
    "browsing/reordering must not rewrite curriculum, IDs or learner data",
  );
  if (!desktop) await page.screenshot({ path: path.join(out, "web-b2.png") });
  await cards.first().click();
  await page.getByRole("button", { name: "Mark studied", exact: true }).click();
  await page
    .getByRole("button", { name: "Word studied", exact: true })
    .waitFor();
  const after = await snapshot();
  const saved = JSON.parse(after["@dutchly/activity/v1"]);
  assert.equal(saved.events.length, activity.events.length + 1);
  assert.equal(saved.events.at(-1).itemId, byLevel.B2[1].id);
  assert.deepEqual(saved.events.slice(0, -1), activity.events);
  assert.equal(
    after["@dutchly/curriculum/v1"],
    before["@dutchly/curriculum/v1"],
  );
  await page
    .getByRole("button", { name: "Close preview", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Close preview", exact: true })
    .waitFor({ state: "hidden" });
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await continueButton.waitFor();
  assert(
    (await continueButton.getAttribute("href")).includes(
      encodeURIComponent(byLevel.B2[2].id),
    ),
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await continueButton.waitFor();
  assert(
    (await continueButton.getAttribute("href")).includes(
      encodeURIComponent(byLevel.B2[2].id),
    ),
  );
  assert.deepEqual(errors, []);
  const result = {
    platform: desktop ? "Windows" : "web",
    counts: { B1: 1500, B2: 2000 },
    listAndFilters: true,
    existingRecordsAndProgressPreserved: true,
    continuationAndReload: true,
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
