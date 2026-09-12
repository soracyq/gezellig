import assert from "node:assert/strict";
import test from "node:test";
import { vocabularyItems, grammarTopics } from "../src/data/sample-content.ts";
import { continueLearning, randomWord } from "../src/domain/homeLearning.ts";
import {
  appendEvent,
  emptyActivity,
  makeEvent,
} from "../src/domain/activity.ts";
import {
  dailyReview,
  reviewProgress,
  submitDailyReview,
  REVIEW_SCHEDULE,
} from "../src/domain/review.ts";
import { vocabularyTranslations } from "../src/domain/translation.ts";
const day = (n: number) => new Date(Date.UTC(2026, 8, n, 12));
const words = Array.from({ length: 30 }, (_, i) => ({
  ...vocabularyItems[0],
  id: `import:${i}`,
  isSample: false,
}));
const study = (n = 30) => ({
  version: 1 as const,
  events: words
    .slice(0, n)
    .map((word) =>
      makeEvent("word-studied", word.id, "vocabulary", {}, day(1)),
    ),
});

test("legacy scheduled credits survive replay and duplicate-day answers cannot create instant mastery", () => {
  const journal = study(1);
  for (const [i, date] of [1, 2, 4, 4, 4].entries())
    journal.events.push(
      makeEvent(
        "answer",
        words[0].id,
        "vocabulary",
        {
          id: `legacy:${i}`,
          questionId: "legacy-translation",
          source: "daily-review",
          scheduledReview: true,
          correct: true,
        },
        day(date),
      ),
    );
  const before = JSON.stringify(journal);
  const progress = reviewProgress(journal).get(`vocabulary:${words[0].id}`)!;
  assert.equal(progress.consecutiveCorrectReviews, 3);
  assert.equal(progress.reviews, 5);
  assert.equal(progress.nextReviewAt, "2026-09-11");
  assert.equal(progress.reviewStatus, "learning");
  assert.equal(JSON.stringify(journal), before);
});

test("Home distinguishes new and existing learners, continues after latest study, skips studied, wraps gaps and ends", () => {
  const fresh = emptyActivity();
  assert.equal(continueLearning(words, fresh).started, false);
  assert.equal(continueLearning(words, fresh).next?.id, words[0].id);
  let journal = study(2);
  assert.equal(continueLearning(words, journal).started, true);
  assert.equal(continueLearning(words, journal).next?.id, words[2].id);
  journal = appendEvent(
    journal,
    makeEvent("word-studied", words[5].id, "vocabulary", {}, day(2)),
  );
  assert.equal(continueLearning(words, journal).next?.id, words[6].id);
  journal = appendEvent(
    journal,
    makeEvent("word-studied", words[29].id, "vocabulary", {}, day(3)),
  );
  assert.equal(continueLearning(words, journal).next?.id, words[2].id);
  assert.equal(continueLearning(words, study()).complete, true);
  assert.equal(continueLearning(words, study()).next, undefined);
  assert.equal(
    continueLearning(words, {
      version: 1,
      events: [
        makeEvent(
          "lesson-completed",
          grammarTopics[0].id,
          "grammar",
          {},
          day(1),
        ),
      ],
    }).started,
    true,
  );
  assert.equal(
    continueLearning(words, {
      version: 1,
      events: [
        makeEvent(
          "answer",
          words[0].id,
          "vocabulary",
          { correct: true },
          day(1),
        ),
      ],
    }).started,
    false,
  );
});

test("Home featured word uses imported records, avoids previous selection and does not mutate data", () => {
  const all = [...vocabularyItems, ...words];
  const snapshot = JSON.stringify(all);
  assert.equal(randomWord(all, undefined, () => 0)?.id, words[0].id);
  assert.equal(randomWord(all, words[0].id, () => 0)?.id, words[1].id);
  assert.equal(randomWord(all, undefined, () => 0.9)?.id, words[27].id);
  assert.equal(JSON.stringify(all), snapshot);
  assert.equal(randomWord([], undefined), undefined);
  assert.equal(randomWord([words[0]], words[0].id)?.id, words[0].id);
});

test("new study is due tomorrow, and only explicit study/completion enables review", () => {
  const journal = study();
  const snapshot = JSON.stringify(journal);
  assert.equal(dailyReview(words, [], journal, 15, day(1)).questions.length, 0);
  assert.equal(
    dailyReview(words, [], journal, 15, day(2)).questions.length,
    15,
  );
  const unseen = {
    version: 1 as const,
    events: [
      makeEvent(
        "answer",
        grammarTopics[0].id,
        "grammar",
        { correct: true, id: "practice" },
        day(1),
      ),
    ],
  };
  assert.equal(dailyReview([], grammarTopics, unseen, 15, day(2)).eligible, 0);
  assert.equal(JSON.stringify(journal), snapshot);
});

test("daily tie selection and presentation mix due vocabulary and grammar and remain stable across reload", () => {
  const journal = study(15);
  journal.events.push(
    ...grammarTopics.map((lesson) =>
      makeEvent("lesson-completed", lesson.id, "grammar", {}, day(1)),
    ),
  );
  const first = dailyReview(words, grammarTopics, journal, 15, day(2));
  assert.deepEqual(
    dailyReview(words, grammarTopics, journal, 15, day(2)),
    first,
  );
  const keys = first.questions.map((item) => item.key);
  assert(keys.some((key) => key.startsWith("grammar:")));
  assert(keys.some((key) => key.startsWith("vocabulary:")));
  assert.notDeepEqual(keys, [...keys].sort());
  assert.notDeepEqual(
    dailyReview(words, grammarTopics, journal, 15, day(3)).questions.map(
      (item) => item.key,
    ),
    keys,
  );
  const q = first.questions[0].question;
  const next = submitDailyReview(
    words,
    grammarTopics,
    journal,
    15,
    q,
    q.correctAnswer,
    first.day,
    day(2),
  );
  assert.deepEqual(
    dailyReview(words, grammarTopics, next.journal, 15, day(2)).questions.map(
      (item) => item.key,
    ),
    keys.slice(1),
  );
});

test("older words remain in their own loop and a daily cap never forgets deferred items", () => {
  let journal = study(15);
  journal.events.push(
    ...words
      .slice(15)
      .map((word) =>
        makeEvent("word-studied", word.id, "vocabulary", {}, day(2)),
      ),
  );
  assert.equal(dailyReview(words, [], journal, 15, day(2)).eligible, 30);
  assert.equal(dailyReview(words, [], journal, 15, day(2)).due, 15);
  const overdue = dailyReview(words, [], journal, 15, day(3));
  assert(
    overdue.questions.every((item) =>
      words
        .slice(0, 15)
        .some((word) => word.id === item.question.relatedItemId),
    ),
  );
  for (let i = 0; i < 15; i++) {
    const plan = dailyReview(words, [], journal, 15, day(3)),
      q = plan.questions[0].question;
    journal = submitDailyReview(
      words,
      [],
      journal,
      15,
      q,
      q.correctAnswer,
      plan.day,
      day(3),
    ).journal;
  }
  const done = dailyReview(words, [], journal, 15, day(3));
  assert.equal(done.remaining, 0);
  assert.equal(done.deferred, 15);
  assert.equal(dailyReview(words, [], journal, 15, day(4)).due, 30);
});

test("wrong review resets streak, retries next day and can later reach five spaced correct reviews", () => {
  let journal = study(1);
  const answer = (date: number, correct = true) => {
    const p = dailyReview(words, [], journal, 15, day(date)),
      q = p.questions[0].question;
    journal = submitDailyReview(
      words,
      [],
      journal,
      15,
      q,
      correct ? q.correctAnswer : "wrong",
      p.day,
      day(date),
    ).journal;
  };
  answer(2);
  answer(3, false);
  let state = reviewProgress(journal).get(`vocabulary:${words[0].id}`)!;
  assert.equal(state.consecutiveCorrectReviews, 0);
  assert.equal(state.dueDay, "2026-09-04");
  for (const date of [4, 5, 8, 15, 29]) answer(date);
  state = reviewProgress(journal).get(`vocabulary:${words[0].id}`)!;
  assert.equal(state.consecutiveCorrectReviews, 5);
  assert.equal(state.reviews, 7);
  assert.equal(state.mistakes, 1);
  assert.equal(state.reviewStatus, "mastered");
  assert.equal(state.nextReviewAt, null);
  assert(state.lastReviewedAt);
  assert.equal(dailyReview(words, [], journal, 15, day(30)).remaining, 0);
  assert.deepEqual(REVIEW_SCHEDULE.correctIntervals, [1, 3, 7, 14]);
});

test("same-day retries and early variation answers cannot earn extra streaks or reset progress", () => {
  let journal = study(1);
  for (const date of [2, 3]) {
    const p = dailyReview(words, [], journal, 15, day(date)),
      q = p.questions[0].question;
    const saved = submitDailyReview(
      words,
      [],
      journal,
      15,
      q,
      q.correctAnswer,
      p.day,
      day(date),
    );
    journal = saved.journal;
    assert.deepEqual(
      submitDailyReview(words, [], journal, 15, q, "wrong", p.day, day(date))
        .journal,
      journal,
    );
  }
  const q = vocabularyTranslations(words[0])[0];
  assert.throws(
    () =>
      submitDailyReview(
        words,
        [],
        journal,
        15,
        q,
        q.correctAnswer,
        "2026-09-04",
        day(4),
      ),
    /changed or is complete/,
  );
  const practice = appendEvent(
    journal,
    makeEvent(
      "answer",
      words[0].id,
      "vocabulary",
      { id: "practice", correct: false },
      day(4),
    ),
  );
  assert.equal(
    reviewProgress(practice).get(`vocabulary:${words[0].id}`)!
      .consecutiveCorrectReviews,
    2,
  );
});
