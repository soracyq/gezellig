import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  appendEvent,
  emptyActivity,
  getStatistics,
  localDay,
  makeEvent,
  type ActivityJournal,
} from "../src/domain/activity.ts";
import { crossedDailyGoal } from "../src/domain/dailyGoals.ts";
import {
  claimGoalCelebration,
  GOAL_CELEBRATIONS_KEY,
} from "../src/storage/goalCelebrations.ts";
import {
  DAILY_TARGETS,
  type SettingsStorage,
} from "../src/storage/settings.ts";
import {
  resetActivity,
  writeActivity,
  readActivity,
} from "../src/storage/library.ts";

const today = new Date(2026, 8, 24, 12);
const tomorrow = new Date(2026, 8, 25, 12);
function words(count: number, now = today): ActivityJournal {
  return {
    version: 1,
    events: Array.from({ length: count }, (_, i) =>
      makeEvent("word-studied", `word-${i}`, "vocabulary", {}, now),
    ),
  };
}
function memory() {
  const values = new Map<string, string>();
  const storage: SettingsStorage = {
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => {
      values.set(key, value);
    },
  };
  return { values, storage };
}

test("each Settings target celebrates a crossing, including progress that skips equality", () => {
  for (const target of DAILY_TARGETS) {
    const before = words(target - 1);
    assert.equal(
      crossedDailyGoal(before, before, "vocabulary", target, today),
      null,
    );
    for (const count of [target, target + 1]) {
      const goal = crossedDailyGoal(
        before,
        words(count),
        "vocabulary",
        target,
        today,
      );
      assert.deepEqual(goal, {
        kind: "vocabulary",
        day: localDay(today),
        count,
      });
      assert.equal(goal.count, getStatistics(words(count), today).wordsToday);
    }
    assert.equal(
      crossedDailyGoal(
        words(target),
        words(target + 1),
        "vocabulary",
        target,
        today,
      ),
      null,
    );
  }
});

test("revisits, answers and opening content cannot add goal progress", () => {
  const before = words(4);
  const duplicate = appendEvent(
    before,
    makeEvent("word-studied", "word-0", "vocabulary", { id: "retry" }, today),
  );
  const answer = appendEvent(
    before,
    makeEvent(
      "answer",
      "word-4",
      "vocabulary",
      { id: "answer", questionId: "q", correct: true },
      today,
    ),
  );
  for (const after of [before, duplicate, answer])
    assert.equal(crossedDailyGoal(before, after, "vocabulary", 5, today), null);
  // Revisiting a word first studied on another day also contributes nothing.
  const old = words(5, new Date(2026, 8, 23, 12));
  const revisited = appendEvent(
    old,
    makeEvent("word-studied", "word-0", "vocabulary", {}, today),
  );
  assert.equal(getStatistics(revisited, today).wordsToday, 0);
});

test("grammar uses new lesson completions, independently of vocabulary and practice answers", () => {
  const before = words(10);
  const after = appendEvent(
    before,
    makeEvent("lesson-completed", "lesson", "grammar", {}, today),
  );
  assert.deepEqual(crossedDailyGoal(before, after, "grammar", 50, today), {
    kind: "grammar",
    day: localDay(today),
    count: 1,
  });
  const revisit = appendEvent(
    after,
    makeEvent("lesson-completed", "lesson", "grammar", {}, tomorrow),
  );
  assert.equal(crossedDailyGoal(after, revisit, "grammar", 50, tomorrow), null);
  const answer = appendEvent(
    before,
    makeEvent(
      "answer",
      "lesson",
      "grammar",
      { id: "a", questionId: "q", correct: true },
      today,
    ),
  );
  assert.equal(crossedDailyGoal(before, answer, "grammar", 5, today), null);
});

test("hydration, lowering targets, and calendar rollover alone never celebrate", () => {
  const saved = words(15);
  assert.equal(crossedDailyGoal(saved, saved, "vocabulary", 5, today), null);
  assert.equal(
    crossedDailyGoal(saved, saved, "vocabulary", 15, tomorrow),
    null,
  );
  const nextDay = {
    ...saved,
    events: [
      ...saved.events,
      ...words(5, tomorrow).events.map((e) => ({
        ...e,
        id: `${e.id}-new`,
        itemId: `${e.itemId}-new`,
      })),
    ],
  };
  assert.equal(
    crossedDailyGoal(saved, nextDay, "vocabulary", 5, tomorrow)?.day,
    localDay(tomorrow),
  );
});

test("notification dates survive reload, further targets and progress reset; next local day can celebrate", async () => {
  const { storage, values } = memory();
  const goal = { kind: "vocabulary" as const, day: localDay(today), count: 5 };
  await writeActivity(storage, words(5));
  const original = await readActivity(storage);
  assert.equal(await claimGoalCelebration(storage, goal), true);
  assert.equal(
    await claimGoalCelebration(storage, { ...goal, count: 10 }),
    false,
  );
  assert.deepEqual(await readActivity(storage), original);
  assert.equal(
    await claimGoalCelebration(storage, { ...goal, kind: "grammar", count: 1 }),
    true,
  );
  const dates = values.get(GOAL_CELEBRATIONS_KEY);
  await resetActivity(storage);
  assert.deepEqual(await readActivity(storage), emptyActivity());
  assert.equal(values.get(GOAL_CELEBRATIONS_KEY), dates);
  assert.equal(await claimGoalCelebration(storage, goal), false);
  assert.equal(
    await claimGoalCelebration(storage, { ...goal, day: localDay(tomorrow) }),
    true,
  );
});

test("failed or malformed notification storage never grants an unpersisted celebration", async () => {
  const { storage, values } = memory();
  const goal = { kind: "grammar" as const, day: localDay(today), count: 1 };
  await assert.rejects(
    claimGoalCelebration(
      {
        ...storage,
        setItem: async () => {
          throw new Error("Disk full");
        },
      },
      goal,
    ),
    /Disk full/,
  );
  assert.equal(values.size, 0);
  values.set(GOAL_CELEBRATIONS_KEY, "broken");
  await assert.rejects(claimGoalCelebration(storage, goal));
  assert.equal(values.get(GOAL_CELEBRATIONS_KEY), "broken");
});

test("local chime is a short, quiet PCM asset with silent edges", () => {
  const wav = readFileSync(
    new URL("../public/audio/goal-complete.wav", import.meta.url),
  );
  assert.equal(wav.toString("ascii", 0, 4), "RIFF");
  assert.equal(wav.readUInt16LE(22), 1);
  const duration = wav.readUInt32LE(40) / wav.readUInt32LE(28);
  assert.ok(duration >= 1 && duration <= 2);
  let peak = 0;
  for (let i = 44; i < wav.length; i += 2)
    peak = Math.max(peak, Math.abs(wav.readInt16LE(i)) / 32768);
  assert.ok(peak > 0.01 && peak < 0.2);
  assert.equal(wav.readInt16LE(44), 0);
  assert.ok(Math.abs(wav.readInt16LE(wav.length - 2)) < 5);
});
