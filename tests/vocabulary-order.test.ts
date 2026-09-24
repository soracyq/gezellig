import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { vocabularyLearningRanks } from "../src/data/vocabulary-learning-ranks.ts";
import { vocabularyItems } from "../src/data/sample-content.ts";
import { continueLearning } from "../src/domain/homeLearning.ts";
import {
  orderVocabularyForLearning,
  learningRank,
} from "../src/domain/vocabularyOrder.ts";
import { learningList } from "../src/domain/learningStatus.ts";
import {
  emptyActivity,
  makeEvent,
  getStatistics,
} from "../src/domain/activity.ts";
import { dailyReview, reviewProgress } from "../src/domain/review.ts";
import { readImportFile } from "../src/imports/read-file.ts";
import { validateTable } from "../src/imports/validate.ts";
import { commitPreview } from "../src/imports/commit.ts";
import { emptyCurriculum } from "../src/storage/library.ts";
import type { VocabularyItem } from "../src/domain/models.ts";

const folder = new URL("../public/import-data/", import.meta.url);
const audit = JSON.parse(
  await readFile(
    new URL(
      "../content-drafts/b1-b2/learning-order-audit.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const families: string[][] = JSON.parse(
  await readFile(
    new URL("../content-drafts/b1-b2/learning-priority.json", import.meta.url),
    "utf8",
  ),
).families;
const imported: Record<string, VocabularyItem[]> = {};
for (const [level, count] of [
  ["B1", 1500],
  ["B2", 2000],
] as const) {
  const name = `dutch_vocabulary_${level}_${count}.csv`;
  const table = await readImportFile(
    name,
    Uint8Array.from(await readFile(new URL(name, folder))).buffer,
    "vocabulary",
  );
  const preview = validateTable(table, "vocabulary", name, {
    vocabulary: [],
    grammar: [],
  });
  assert.equal(preview.invalid, 0);
  imported[level] = commitPreview(
    emptyCurriculum(),
    preview,
    { vocabulary: [], grammar: [] },
    `existing-${level}`,
  ).curriculum.vocabulary;
}

test("original curriculum content is unchanged, allowing only Git's CSV newline normalization", async () => {
  for (const [file, expected] of Object.entries(audit.sourceHashes)) {
    const bytes = await readFile(new URL(file, folder));
    const hash = createHash("sha256").update(bytes).digest("hex");
    if (hash !== expected && file.endsWith(".csv")) {
      assert.equal(
        createHash("sha256")
          .update(bytes.toString("utf8").replace(/\r\n/g, "\n"))
          .digest("hex"),
        audit.sourceTextHashes[file],
        file,
      );
    } else assert.equal(hash, expected, file);
  }
});

test("all 3500 production words have one continuous explicit rank and keep their original records and IDs", () => {
  assert.equal(Object.keys(vocabularyLearningRanks).length, 3500);
  for (const [level, original] of Object.entries(imported)) {
    const snapshot = JSON.stringify(original);
    const ordered = orderVocabularyForLearning(original);
    assert.deepEqual(
      ordered.map(learningRank),
      Array.from({ length: original.length }, (_, i) => i + 1),
    );
    assert.deepEqual(
      ordered.map((w) => w.dutch),
      audit.levels[level].map((r: { dutch: string }) => r.dutch),
    );
    assert.equal(new Set(ordered.map((w) => w.id)).size, original.length);
    for (const item of ordered)
      assert.equal(
        item,
        original.find((word) => word.id === item.id),
      );
    assert.equal(JSON.stringify(original), snapshot);
    assert.deepEqual(
      orderVocabularyForLearning([...original].reverse()),
      ordered,
    );
    assert.deepEqual(orderVocabularyForLearning(ordered), ordered);
  }
});

test("A1/A2/C1 and unranked custom entries retain their exact slots and relative order", () => {
  const a1 = vocabularyItems[0];
  const a2 = { ...a1, id: "a2", level: "A2" as const };
  const c1 = { ...a1, id: "c1", level: "C1" as const };
  const custom = {
    ...a1,
    id: "custom",
    dutch: "my custom word",
    level: "B1" as const,
  };
  const before = [
    a1,
    imported.B1[0],
    a2,
    imported.B2[0],
    custom,
    imported.B1[10],
    c1,
    imported.B2[10],
  ];
  const after = orderVocabularyForLearning(before);
  for (const index of [0, 2, 4, 6]) assert.equal(after[index], before[index]);
  assert.deepEqual(new Set(after), new Set(before));
  for (const level of ["B1", "B2"]) {
    const ranks = after
      .filter((w) => w.level === level && learningRank(w) !== undefined)
      .map((w) => learningRank(w)!);
    assert.deepEqual(
      ranks,
      [...ranks].sort((a, b) => a - b),
    );
  }
});

test("learning status, type and search filters retain rank inside both groups", () => {
  for (const original of Object.values(imported)) {
    const words = orderVocabularyForLearning(original);
    const learned = new Set([words[0].id, words[3].id, words[45].id]);
    const grouped = learningList(words, learned);
    assert.deepEqual(grouped.items, [
      ...words.filter((w) => !learned.has(w.id)),
      ...words.filter((w) => learned.has(w.id)),
    ]);
    for (const filter of ["new", "learned"] as const) {
      const filtered = learningList(
        words.filter((w) => w.wordType === "noun" || w.dutch.includes("en")),
        learned,
        filter,
      ).items;
      assert.deepEqual(
        filtered.map(learningRank),
        filtered.map(learningRank).sort((a, b) => a! - b!),
      );
    }
  }
});

test("Continue Learning resumes highest-priority unlearned word in the active advanced level after an old alphabetical import", () => {
  for (const [level, original] of Object.entries(imported)) {
    const sorted = orderVocabularyForLearning(original);
    const late = sorted.at(-1)!;
    const journal = {
      version: 1 as const,
      events: [makeEvent("word-studied", late.id, "vocabulary")],
    };
    assert.equal(
      continueLearning(original, emptyActivity()).next?.id,
      sorted[0].id,
    );
    assert.equal(
      continueLearning(
        [...vocabularyItems, ...imported.B1, ...imported.B2],
        journal,
      ).next?.id,
      sorted[0].id,
      level,
    );
    journal.events.push(makeEvent("word-studied", sorted[0].id, "vocabulary"));
    assert.equal(continueLearning(original, journal).next?.id, sorted[1].id);
    const complete = {
      version: 1 as const,
      events: original.map((w) =>
        makeEvent("word-studied", w.id, "vocabulary"),
      ),
    };
    assert.equal(continueLearning(original, complete).complete, true);
  }
});

test("Continue Learning respects custom-word positions mixed with ranked imports", () => {
  for (const level of ["B1", "B2"] as const) {
    const ranked = orderVocabularyForLearning(imported[level]);
    const custom = {
      ...vocabularyItems[0],
      id: `custom-${level}`,
      dutch: "personal study word",
      level,
    };
    const words = [custom, ...ranked];
    const journal = {
      version: 1 as const,
      events: [makeEvent("word-studied", ranked.at(-1)!.id, "vocabulary")],
    };
    assert.equal(continueLearning(words, journal).next?.id, custom.id);
    journal.events.push(makeEvent("word-studied", custom.id, "vocabulary"));
    assert.equal(continueLearning(words, journal).next?.id, ranked[0].id);
    const onlyCustom = [
      custom,
      { ...custom, id: "custom-two" },
      { ...custom, id: "custom-three" },
    ];
    assert.equal(
      continueLearning(onlyCustom, {
        version: 1,
        events: [makeEvent("word-studied", "custom-two", "vocabulary")],
      }).next?.id,
      "custom-three",
    );
  }
});

test("reordering preserves study statistics, review schedule, mastery and saved events", () => {
  const words = [...imported.B1, ...imported.B2];
  const started = new Date(2026, 8, 1, 12);
  const now = new Date(2026, 8, 24, 12);
  const studied = [words[0], words[10], words[1500]];
  const journal = {
    version: 1 as const,
    events: studied.map((w) =>
      makeEvent("word-studied", w.id, "vocabulary", {}, started),
    ),
  };
  for (const [index, day] of [2, 3, 5, 9, 16].entries())
    journal.events.push(
      makeEvent(
        "answer",
        words[0].id,
        "vocabulary",
        {
          id: `review-${index}`,
          questionId: "q",
          source: "daily-review",
          correct: true,
          scheduledReview: true,
        },
        new Date(2026, 8, day, 12),
      ),
    );
  const snapshot = JSON.stringify(journal);
  const stats = getStatistics(journal, now);
  const progress = reviewProgress(journal);
  assert.equal(
    progress.get(`vocabulary:${words[0].id}`)?.reviewStatus,
    "mastered",
  );
  const before = dailyReview(words, [], journal, 10, now);
  const reordered = orderVocabularyForLearning(words);
  assert.deepEqual(dailyReview(reordered, [], journal, 10, now), before);
  assert.deepEqual(getStatistics(journal, now), stats);
  assert.deepEqual(reviewProgress(journal), progress);
  assert.equal(JSON.stringify(journal), snapshot);
});

test("reviewed opening mixes themes and forms, later words score lower, families stay nearby, and no A–Z sequence is used", () => {
  for (const level of ["B1", "B2"]) {
    const rows = audit.levels[level] as {
      dutch: string;
      theme: string;
      word_type: string;
      score: number;
      frequency: number | null;
    }[];
    const first = rows.slice(0, 50),
      middle = rows.slice(rows.length / 2 - 25, rows.length / 2 + 25),
      last = rows.slice(-50);
    assert.ok(new Set(first.map((r) => r.word_type)).size >= 4);
    assert.ok(
      new Set(first.map((r) => r.theme)).size >= (level === "B1" ? 5 : 3),
    );
    const mean = (sample: typeof rows) =>
      sample.reduce((sum, r) => sum + r.score, 0) / sample.length;
    assert.ok(mean(first) > mean(middle));
    assert.ok(mean(middle) > mean(last));
    for (const sample of [first, middle, last]) {
      const ascending = sample
        .slice(1)
        .filter(
          (r, i) => r.dutch.localeCompare(sample[i].dutch, "nl") > 0,
        ).length;
      assert.ok(
        ascending > 10 && ascending < 40,
        `${level} sample must not follow A–Z`,
      );
    }
    for (const family of families) {
      const positions = family.map((w) => rows.findIndex((r) => r.dutch === w));
      if (positions.every((i) => i >= 0))
        assert.ok(
          Math.max(...positions) - Math.min(...positions) <= 65,
          family.join("/"),
        );
    }
  }
});
