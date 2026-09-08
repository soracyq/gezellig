import assert from "node:assert/strict";
import test from "node:test";
import { grammarTopics, vocabularyItems } from "../src/data/sample-content.ts";
import { emptyActivity, makeEvent } from "../src/domain/activity.ts";
import {
  ACTIVITY_KEY,
  CURRICULUM_KEY,
  emptyCurriculum,
  readActivity,
  readCurriculum,
  resetActivity,
  writeActivity,
  writeCurriculum,
} from "../src/storage/library.ts";
import {
  SETTINGS_STORAGE_KEY,
  type SettingsStorage,
} from "../src/storage/settings.ts";

function memoryStorage(initial: [string, string][] = []) {
  const values = new Map(initial);
  const writes: string[] = [];
  const storage: SettingsStorage = {
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => {
      writes.push(key);
      values.set(key, value);
    },
  };
  return { values, writes, storage };
}

test("new installation reads empty curriculum and progress without writing or resetting anything", async () => {
  const { storage, writes } = memoryStorage();
  assert.deepEqual(await readCurriculum(storage), emptyCurriculum());
  assert.deepEqual(await readActivity(storage), emptyActivity());
  assert.deepEqual(writes, []);
});

test("curriculum and real activity persist through independent reads including morphology and exercises", async () => {
  const { storage, writes } = memoryStorage();
  const curriculum = {
    ...emptyCurriculum(),
    vocabulary: vocabularyItems,
    grammar: grammarTopics,
  };
  const activity = {
    ...emptyActivity(),
    events: [makeEvent("word-studied", vocabularyItems[0].id, "vocabulary")],
  };
  await writeCurriculum(storage, curriculum);
  await writeActivity(storage, activity);
  assert.deepEqual(await readCurriculum(storage), curriculum);
  assert.deepEqual(await readActivity(storage), activity);
  assert.deepEqual(writes, [CURRICULUM_KEY, ACTIVITY_KEY]);
  const restored = await readCurriculum(storage);
  assert.ok(restored.grammar.some((topic) => topic.questions.length > 0));
  assert.ok(
    restored.vocabulary.some(
      (item) => item.wordType === "verb" && item.conjugations,
    ),
  );
});

test("malformed curriculum fails visibly and leaves the original saved data untouched", async () => {
  for (const raw of [
    "{broken",
    "null",
    "[]",
    "{}",
    '{"version":2,"vocabulary":[],"grammar":[],"datasets":[]}',
    '{"version":1,"vocabulary":[{}],"grammar":[],"datasets":[]}',
  ]) {
    const { storage, values, writes } = memoryStorage([[CURRICULUM_KEY, raw]]);
    await assert.rejects(
      readCurriculum(storage),
      /curriculum could not be read.*kept unchanged/,
    );
    assert.equal(values.get(CURRICULUM_KEY), raw);
    assert.deepEqual(writes, []);
  }
});

test("malformed or incomplete activity fails visibly without silently clearing or rewriting history", async () => {
  const good = makeEvent("word-studied", "word-one", "vocabulary");
  const invalidRecords = [
    "{broken",
    "null",
    "[]",
    "{}",
    JSON.stringify({ version: 2, events: [] }),
    JSON.stringify({ version: 1, events: [{ ...good, day: "2026-02-30" }] }),
    JSON.stringify({
      version: 1,
      events: [{ ...good, kind: "answer", correct: true }],
    }),
    JSON.stringify({
      version: 1,
      events: [{ ...good, kind: "answer", questionId: "question-one" }],
    }),
    JSON.stringify({ version: 1, events: [good, good] }),
  ];
  for (const raw of invalidRecords) {
    const { storage, values, writes } = memoryStorage([[ACTIVITY_KEY, raw]]);
    await assert.rejects(
      readActivity(storage),
      /history could not be read.*kept unchanged/,
    );
    assert.equal(values.get(ACTIVITY_KEY), raw);
    assert.deepEqual(writes, []);
  }
});

test("unavailable storage reads propagate without initializing replacement data", async () => {
  const writes: string[] = [];
  const storage: SettingsStorage = {
    getItem: async () => {
      throw new Error("Storage unavailable");
    },
    setItem: async (key) => {
      writes.push(key);
    },
  };
  await assert.rejects(readActivity(storage), /Storage unavailable/);
  await assert.rejects(readCurriculum(storage), /Storage unavailable/);
  assert.deepEqual(writes, []);
});

test("failed saves propagate so the UI can retain its previous state and show an error", async () => {
  const storage: SettingsStorage = {
    getItem: async () => null,
    setItem: async () => {
      throw new Error("Storage quota exceeded");
    },
  };
  await assert.rejects(
    writeActivity(storage, emptyActivity()),
    /Storage quota exceeded/,
  );
  await assert.rejects(
    writeCurriculum(storage, emptyCurriculum()),
    /Storage quota exceeded/,
  );
  await assert.rejects(resetActivity(storage), /Storage quota exceeded/);
});

test("invalid writes are rejected before any storage mutation", async () => {
  const { storage, writes } = memoryStorage();
  const badActivity = {
    ...emptyActivity(),
    events: [makeEvent("answer", "word-one", "vocabulary")],
  };
  await assert.rejects(writeActivity(storage, badActivity));
  const badCurriculum = {
    ...emptyCurriculum(),
    grammar: [{ ...grammarTopics[0], explanation: "" }],
  };
  await assert.rejects(writeCurriculum(storage, badCurriculum));
  assert.deepEqual(writes, []);
});

test("explicit progress reset changes only the activity key and preserves settings and content byte-for-byte", async () => {
  const settings = '{"version":1,"dailyTarget":30}';
  const curriculum = JSON.stringify({
    ...emptyCurriculum(),
    vocabulary: vocabularyItems,
    grammar: grammarTopics,
  });
  const activity = JSON.stringify({
    ...emptyActivity(),
    events: [makeEvent("word-studied", "word-one", "vocabulary")],
  });
  const { storage, values, writes } = memoryStorage([
    [SETTINGS_STORAGE_KEY, settings],
    [CURRICULUM_KEY, curriculum],
    [ACTIVITY_KEY, activity],
    ["unrelated-app-data", "keep this"],
  ]);
  await resetActivity(storage);
  assert.deepEqual(writes, [ACTIVITY_KEY]);
  assert.deepEqual(await readActivity(storage), emptyActivity());
  assert.equal(values.get(SETTINGS_STORAGE_KEY), settings);
  assert.equal(values.get(CURRICULUM_KEY), curriculum);
  assert.equal(values.get("unrelated-app-data"), "keep this");
});

test("explicit progress reset can recover unreadable history without reading or touching curriculum", async () => {
  const reads: string[] = [];
  const writes: [string, string][] = [];
  const storage: SettingsStorage = {
    getItem: async (key) => {
      reads.push(key);
      throw new Error("Cannot read");
    },
    setItem: async (key, value) => {
      writes.push([key, value]);
    },
  };
  await resetActivity(storage);
  assert.deepEqual(reads, []);
  assert.deepEqual(writes, [[ACTIVITY_KEY, JSON.stringify(emptyActivity())]]);
});
