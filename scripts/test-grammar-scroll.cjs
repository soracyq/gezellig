/* global __dirname */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const { chromium, _electron } = createRequire(
  path.join(root, ".artifact-build/node_modules/__scroll.cjs"),
)("playwright");
const desktop = process.argv.includes("--desktop");
const base = desktop ? "dutchly://app" : "http://127.0.0.1:4173";
const out = path.join(root, "test-results/grammar-scroll");
fs.mkdirSync(out, { recursive: true });
(async () => {
  const { grammarTopics } = await import("../src/data/sample-content.ts");
  const { makeEvent } = await import("../src/domain/activity.ts");
  const lessons = Array.from({ length: 40 }, (_, i) => ({
    ...grammarTopics[0],
    id: `scroll:${i + 1}`,
    title: `Sorting lesson ${String(i + 1).padStart(2, "0")}`,
    level: "A2",
    sortOrder: i + 1,
    isSample: false,
    questions: [],
  }));
  let browser, app, page;
  const results = [],
    errors = [];
  try {
    if (desktop) {
      app = await _electron.launch({
        executablePath: path.join(root, "release/win-unpacked/Gezellig.exe"),
        args: [
          "--hidden",
          "--disable-background-timer-throttling",
          `--user-data-dir=${path.join(out, `profile-${Date.now()}`)}`,
        ],
      });
      page = await app.firstWindow();
      await page.getByRole("heading").first().waitFor({ timeout: 30000 });
    } else {
      browser = await chromium.launch({
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        headless: true,
      });
      page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    }
    page.setDefaultTimeout(15000);
    page.on("pageerror", (error) => errors.push(error.message));
    for (const scenario of [
      {
        name: "four lessons: complete 02",
        count: 4,
        selected: 1,
        completed: [],
        filter: "all",
        close: "Close preview",
      },
      {
        name: "middle of long list and existing completions",
        count: 40,
        selected: 18,
        completed: [2, 35],
        filter: "all",
        close: "Done",
      },
      {
        name: "Not completed removes completed card",
        count: 40,
        selected: 20,
        completed: [],
        filter: "new",
        close: "Escape",
      },
      ...(!desktop
        ? [
            {
              name: "narrow single-column list",
              count: 40,
              selected: 12,
              completed: [2, 35],
              filter: "all",
              close: "Done",
              narrow: true,
            },
          ]
        : []),
    ]) {
      console.log(`Checking ${scenario.name}`);
      if (!desktop)
        await page.setViewportSize({
          width: scenario.narrow ? 390 : 1440,
          height: scenario.narrow ? 844 : 1000,
        });
      await page.goto(base + "/grammar?level=A2", {
        waitUntil: "domcontentloaded",
      });
      await page.getByRole("heading").first().waitFor();
      const items = lessons.slice(0, scenario.count),
        selected = items[scenario.selected];
      const events = scenario.completed.map((i) =>
        makeEvent("lesson-completed", items[i].id, "grammar"),
      );
      await page.evaluate(
        ({ items, events }) => {
          localStorage.setItem(
            "@dutchly/curriculum/v1",
            JSON.stringify({
              version: 1,
              vocabulary: [],
              grammar: items,
              datasets: [],
            }),
          );
          localStorage.setItem(
            "@dutchly/activity/v1",
            JSON.stringify({ version: 1, events }),
          );
        },
        { items, events },
      );
      await page.reload();
      await page.getByTestId(`grammar-lesson:${items[0].id}`).waitFor();
      if (scenario.filter === "new")
        await page
          .getByRole("button", { name: /^Grammar status Not completed/ })
          .click();
      const card = page.getByTestId(`grammar-lesson:${selected.id}`);
      const opener = card.getByRole("button", {
        name: "Open lesson",
        exact: true,
      });
      await opener.scrollIntoViewIfNeeded(); // Test setup only, before opening or completion.
      await opener.focus();
      await page.keyboard.press("Enter");
      // Escape handling activates when the existing modal fade finishes.
      await page.getByRole("dialog").waitFor();
      await page
        .getByRole("button", { name: "Complete lesson", exact: true })
        .waitFor();
      const baseline = await page
        .getByTestId("learning-page-scroll")
        .evaluate((element) => element.scrollTop);
      await page.evaluate(() => {
        const scroller = document.querySelector(
          '[data-testid="learning-page-scroll"]',
        );
        window.__grammarTrace = [];
        window.__grammarTracing = true;
        const frame = () => {
          if (!window.__grammarTracing) return;
          window.__grammarTrace.push(scroller.scrollTop);
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });
      await page
        .getByRole("button", { name: "Complete lesson", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Lesson completed", exact: true })
        .waitFor();
      const completed = new Set([
        ...scenario.completed.map((i) => items[i].id),
        selected.id,
      ]);
      const expected = [
        ...items.filter((item) => !completed.has(item.id)),
        ...(scenario.filter === "all"
          ? items.filter((item) => completed.has(item.id))
          : []),
      ].map((item) => item.id);
      const order = await page
        .locator('[data-testid^="grammar-lesson:"]')
        .evaluateAll((cards) =>
          cards.map((card) =>
            card.getAttribute("data-testid").slice("grammar-lesson:".length),
          ),
        );
      assert.deepEqual(
        order,
        expected,
        "Cards must reorder while the preview is still open",
      );
      if (scenario.filter === "all")
        await card.getByText("Completed", { exact: true }).waitFor();
      else assert.equal(await card.count(), 0);
      if (scenario.close === "Escape") await page.keyboard.press("Escape");
      else
        await page
          .getByRole("button", { name: scenario.close, exact: true })
          .click();
      await page
        .getByRole("button", { name: "Close preview", exact: true })
        .waitFor({ state: "hidden" });
      await page.waitForTimeout(600);
      const observed = await page.evaluate(() => {
        window.__grammarTracing = false;
        return {
          positions: window.__grammarTrace,
          focus: document.activeElement?.getAttribute("aria-label"),
          focusedLesson: document.activeElement
            ?.closest('[data-testid^="grammar-lesson:"]')
            ?.getAttribute("data-testid"),
          history: JSON.parse(localStorage.getItem("@dutchly/activity/v1")),
        };
      });
      const maxMovement = Math.max(
        ...observed.positions.map((value) => Math.abs(value - baseline)),
      );
      assert(maxMovement < 2, `Viewport moved ${maxMovement}px`);
      assert.notEqual(
        observed.focusedLesson,
        `grammar-lesson:${selected.id}`,
        "Do not restore focus to the moved lesson",
      );
      assert.equal(
        observed.history.events.length,
        scenario.completed.length + 1,
      );
      assert(
        observed.history.events.some(
          (event) =>
            event.kind === "lesson-completed" && event.itemId === selected.id,
        ),
      );
      if (!desktop && scenario.count === 4)
        await page.screenshot({ path: path.join(out, "completed-02.png") });
      results.push({
        scenario: scenario.name,
        order,
        baseline,
        maxMovement,
        focus: observed.focus,
      });
      await page.reload();
      await page.getByTestId(`grammar-lesson:${selected.id}`).waitFor();
      await page
        .getByTestId(`grammar-lesson:${selected.id}`)
        .getByText("Completed", { exact: true })
        .waitFor();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(
      path.join(out, `${desktop ? "windows" : "browser"}.json`),
      JSON.stringify({ results, errors }, null, 2),
    );
    console.log(
      results
        .map(
          (result) =>
            `${result.scenario}: immediate sorting, saved completion, max movement ${result.maxMovement}px`,
        )
        .join("\n"),
    );
  } finally {
    if (app) await app.close();
    if (browser) await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
