import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import Papa from "papaparse";
import { grammarTopics } from "../src/data/sample-content.ts";
import { grammarPracticeCatalog } from "../src/data/grammar-practice-catalog.ts";
import { grammarExercises } from "../src/domain/grammarPractice.ts";
import { submitGrammarPractice } from "../src/domain/grammarAttempt.ts";
import { learningList } from "../src/domain/learningStatus.ts";
import { googleTranslateUrl } from "../src/domain/externalLinks.ts";
import {
  grammarTranslations,
  matchesAnswer,
} from "../src/domain/translation.ts";
import { emptyActivity, getStatistics } from "../src/domain/activity.ts";
import { dailyReview } from "../src/domain/review.ts";
import { validateTable } from "../src/imports/validate.ts";
import { readActivity, writeActivity } from "../src/storage/library.ts";
import type { GrammarTopic } from "../src/domain/models.ts";

const imported = ["A1", "A2"].flatMap((level) => {
  const [headers, ...rows] = Papa.parse<string[]>(
    readFileSync(
      new URL(
        `../public/import-data/dutch_grammar_${level}.csv`,
        import.meta.url,
      ),
      "utf8",
    ),
    { skipEmptyLines: true },
  ).data;
  const preview = validateTable(
    {
      headers,
      rows: rows.map((values, i) => ({ row: i + 2, values })),
      format: "csv",
      warnings: [],
    },
    "grammar",
    `${level}.csv`,
    { vocabulary: [], grammar: [] },
  );
  assert.equal(preview.invalid, 0);
  return (preview.items as GrammarTopic[]).map((lesson) => ({
    ...lesson,
    id: `existing-dataset:${lesson.sourceLessonId}`,
  }));
});

test("501 words and 20 explicit studied IDs produce 481 new and stable partitioned order", () => {
  const items = Array.from({ length: 501 }, (_, i) => ({ id: String(i) }));
  const studied = new Set(items.slice(0, 20).map((item) => item.id));
  const list = learningList(items, studied, "all");
  assert.deepEqual(list.counts, { all: 501, new: 481, learned: 20 });
  assert.deepEqual(list.items, [...items.slice(20), ...items.slice(0, 20)]);
  assert.equal(learningList(items, studied, "new").items.length, 481);
  assert.equal(learningList(items, studied, "learned").items.length, 20);
  assert.deepEqual(learningList(items.slice(10, 30), studied, "all").counts, {
    all: 20,
    new: 10,
    learned: 10,
  });
  studied.add("20");
  assert.equal(learningList(items, studied, "all").items[0].id, "21");
});

test("grammar keeps curriculum order and stable lesson identities within completion groups", () => {
  const lessons = ["01", "02", "03", "04", "05", "06"].map((id) => ({ id }));
  assert.deepEqual(
    learningList(lessons, new Set(["01", "02", "05"]), "all").items.map(
      (x) => x.id,
    ),
    ["03", "04", "06", "01", "02", "05"],
  );
  assert.deepEqual(
    lessons.map((x) => x.id),
    ["01", "02", "03", "04", "05", "06"],
  );
});

test("all 72 existing CSV lessons get five source-matched exercises without a migration", () => {
  assert.equal(imported.length, 72);
  assert.equal(Object.keys(grammarPracticeCatalog).length, 72);
  const before = JSON.stringify(imported);
  const allIds = new Set<string>();
  const kinds = new Set<string>();
  for (const lesson of imported) {
    const exercises = grammarExercises(lesson);
    assert.equal(exercises.length, 5, lesson.sourceLessonId ?? lesson.id);
    assert.deepEqual(
      exercises.map((x) => x.sortOrder),
      [1, 2, 3, 4, 5],
    );
    assert.deepEqual(grammarExercises(lesson), exercises);
    for (const exercise of exercises) {
      assert(!allIds.has(exercise.id));
      allIds.add(exercise.id);
      kinds.add(exercise.kind);
      assert.equal(exercise.relatedItemId, lesson.id);
      assert.equal(exercise.explanation, lesson.rules[0]);
      assert(
        matchesAnswer(exercise, exercise.correctAnswer.toUpperCase() + " "),
      );
      assert(!matchesAnswer(exercise, "This is not the Dutch answer"));
      for (const alternative of exercise.acceptedAnswers)
        assert(matchesAnswer(exercise, alternative));
      if (exercise.options) {
        assert.equal(new Set(exercise.options).size, 3);
        assert.equal(
          exercise.options.filter((option) => matchesAnswer(exercise, option))
            .length,
          1,
        );
      }
      if (exercise.chunks)
        assert.deepEqual(
          [...exercise.chunks].sort(),
          exercise.correctAnswer.split(" ").sort(),
        );
    }
  }
  assert.equal(allIds.size, 360);
  assert.deepEqual([...kinds].sort(), [
    "correction",
    "fill-blank",
    "multiple-choice",
    "ordering",
    "translation",
  ]);
  assert.equal(JSON.stringify(imported), before);
  for (const sample of grammarTopics)
    assert.equal(grammarExercises(sample).length, 5);
});

test("custom lessons sharing a source ID do not receive mismatched prepared practice", () => {
  const lesson = imported[0];
  const changed = { ...lesson, objective: "My custom objective" };
  assert.equal(grammarExercises(changed).length, 2);
  assert(grammarExercises(changed).every((x) => x.kind === "translation"));
  assert.equal(
    grammarExercises({ ...changed, examples: [], questions: [] }).length,
    0,
  );
});

test("practice and review share explicitly accepted Dutch alternatives", () => {
  const lesson = imported.find(
    (x) => x.sourceLessonId === "a2-perfect-subclauses",
  )!;
  const practice = grammarExercises(lesson).filter(
    (x) => x.kind === "translation",
  );
  const review = grammarTranslations(lesson);
  assert(matchesAnswer(practice[0], "Ik ben moe omdat ik hard gewerkt heb."));
  assert(matchesAnswer(review[0], "Ik ben moe omdat ik hard gewerkt heb."));
  assert(!matchesAnswer(practice[0], "Ik ben moe omdat ik heb hard gewerkt."));
  assert.equal(review[0].id, `translation:${lesson.id}:example:0`);
});

test("saved grammar attempts are idempotent, persist, affect statistics, and do not complete lessons or use daily quota", async () => {
  const lesson = imported[0];
  let journal = emptyActivity();
  for (const [i, exercise] of grammarExercises(lesson).entries()) {
    const result = submitGrammarPractice(
      journal,
      lesson,
      exercise.id,
      i === 4 ? "wrong" : exercise.correctAnswer,
      `attempt:${i}`,
    );
    journal = result.journal;
    assert.equal(result.correct, i !== 4);
    assert.deepEqual(
      submitGrammarPractice(
        journal,
        lesson,
        exercise.id,
        exercise.options?.find((option) => option !== exercise.correctAnswer) ??
          "wrong",
        `attempt:${i}`,
      ).journal,
      journal,
    );
  }
  assert.equal(journal.events.length, 5);
  assert(
    journal.events.every(
      (event) => event.kind === "answer" && !event.source && !!event.answer,
    ),
  );
  assert.equal(journal.events.filter((event) => event.correct).length, 4);
  assert.equal(getStatistics(journal).lessonsCompleted, 0);
  const review = dailyReview([], [lesson], journal, 10);
  assert.equal(review.completed, 0);
  const data = new Map<string, string>();
  const storage = {
    getItem: async (key: string) => data.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: async (key: string) => {
      data.delete(key);
    },
  };
  await writeActivity(storage, journal);
  assert.deepEqual(await readActivity(storage), journal);
  assert.throws(() =>
    submitGrammarPractice(journal, lesson, "missing", "a", "new"),
  );
});

test("Google Translate URLs preserve the exact displayed noun, spaces and Unicode", () => {
  for (const word of [
    "het huis",
    "de fiets",
    "de baby's",
    "één café & thee?",
    "'s avonds",
  ]) {
    const url = new URL(googleTranslateUrl(word));
    assert.equal(url.origin, "https://translate.google.com");
    assert.equal(url.searchParams.get("text"), word);
    assert.equal(url.searchParams.get("sl"), "nl");
    assert.equal(url.searchParams.get("tl"), "en");
    assert.equal(url.searchParams.get("op"), "translate");
  }
});
