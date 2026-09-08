import assert from "node:assert/strict";
import test from "node:test";
import {
  appendEvent,
  dayNumber,
  emptyActivity,
  getStatistics,
  localDay,
  makeEvent,
  type ActivityEvent,
  type ActivityJournal,
} from "../src/domain/activity.ts";
import { vocabularyPractice } from "../src/domain/practice.ts";
import type { Question, VocabularyItem } from "../src/domain/models.ts";

const localNoon = (day: string) => {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date, 12);
};

function event(
  day: string,
  kind: ActivityEvent["kind"],
  itemId: string,
  overrides: Partial<ActivityEvent> = {},
): ActivityEvent {
  return {
    id: `${kind}:${itemId}`,
    kind,
    itemId,
    contentType: kind === "lesson-completed" ? "grammar" : "vocabulary",
    occurredAt: `${day}T12:00:00.000Z`,
    day,
    timeZone: "Europe/Amsterdam",
    ...overrides,
  };
}

const journal = (events: ActivityEvent[]): ActivityJournal => ({
  version: 1,
  events,
});
const lessonDays = (...days: string[]) =>
  journal(days.map((day) => event(day, "lesson-completed", `lesson-${day}`)));

test("fresh statistics contain zero activity, zero streaks and no invented accuracy", () => {
  const stats = getStatistics(emptyActivity(), localNoon("2026-09-07"));
  assert.equal(stats.hasActivity, false);
  for (const key of [
    "wordsToday",
    "wordsThisWeek",
    "wordsThisMonth",
    "wordsThisYear",
    "vocabularySize",
    "questionsAnswered",
    "correctAnswers",
    "incorrectAnswers",
    "mistakeItems",
    "studyDays",
    "streakDays",
    "longestStreak",
    "lessonsCompleted",
    "practiceAnswers",
  ] as const)
    assert.equal(stats[key], 0, key);
  assert.equal(stats.lifetimeAccuracy, null);
  assert.equal(stats.recentAccuracy, null);
  assert.deepEqual(
    stats.weeklyActivity.map((day) => day.words),
    [0, 0, 0, 0, 0, 0, 0],
  );
  assert.ok(stats.weeklyActivity.every((day) => !day.completed));
});

test("marking a word or lesson twice cannot inflate progress and does not mutate prior state", () => {
  const fresh = emptyActivity();
  const word = event("2026-09-07", "word-studied", "word-one");
  const studied = appendEvent(fresh, word);
  assert.equal(fresh.events.length, 0);
  assert.equal(studied.events.length, 1);
  assert.equal(appendEvent(studied, word), studied);
  assert.equal(
    appendEvent(studied, {
      ...word,
      id: "different-attempt",
      day: "2026-09-08",
    }),
    studied,
  );
  const lesson = event("2026-09-07", "lesson-completed", "lesson-one");
  const completed = appendEvent(studied, lesson);
  assert.equal(appendEvent(completed, { ...lesson, id: "new-id" }), completed);
  const stats = getStatistics(completed, localNoon("2026-09-07"));
  assert.equal(stats.vocabularySize, 1);
  assert.equal(stats.lessonsCompleted, 1);
  assert.equal(stats.questionsAnswered, 0);
  assert.equal(stats.lifetimeAccuracy, null);
  assert.equal(stats.studyDays, 1);
});

test("answer attempts are idempotent by attempt ID while distinct attempts are counted", () => {
  const first = event("2026-09-07", "answer", "word-one", {
    id: "attempt-one",
    questionId: "question-one",
    correct: false,
  });
  const once = appendEvent(emptyActivity(), first);
  assert.equal(appendEvent(once, first), once);
  const twice = appendEvent(once, {
    ...first,
    id: "attempt-two",
    correct: true,
  });
  const stats = getStatistics(twice, localNoon("2026-09-07"));
  assert.equal(stats.questionsAnswered, 2);
  assert.equal(stats.practiceAnswers, 2);
  assert.equal(stats.correctAnswers, 1);
  assert.equal(stats.incorrectAnswers, 1);
  assert.equal(stats.lifetimeAccuracy, 50);
  assert.equal(stats.mistakeItems, 1);
  assert.equal(stats.vocabularySize, 0);
  assert.equal(stats.lessonsCompleted, 0);
  assert.equal(stats.studyDays, 0);
});

test("recent accuracy uses the last 20 submitted attempts and mistake items are unique", () => {
  const events = Array.from({ length: 25 }, (_, index) =>
    event("2026-09-07", "answer", `word-${index % 2}`, {
      id: `attempt-${index}`,
      questionId: `question-${index % 2}`,
      correct: index >= 5,
    }),
  );
  const stats = getStatistics(journal(events), localNoon("2026-09-07"));
  assert.equal(stats.lifetimeAccuracy, 80);
  assert.equal(stats.recentAccuracy, 100);
  assert.equal(stats.correctAnswers, 20);
  assert.equal(stats.incorrectAnswers, 5);
  assert.equal(stats.mistakeItems, 2);
  assert.equal(stats.studyDays, 0);
});

test("a meaningful day requires five new words, one completed lesson or five distinct questions", () => {
  const day = "2026-09-07";
  const words = Array.from({ length: 5 }, (_, i) =>
    event(day, "word-studied", `word-${i}`),
  );
  assert.equal(
    getStatistics(journal(words.slice(0, 4)), localNoon(day)).studyDays,
    0,
  );
  assert.equal(getStatistics(journal(words), localNoon(day)).studyDays, 1);
  assert.equal(getStatistics(lessonDays(day), localNoon(day)).studyDays, 1);
  const answers = Array.from({ length: 5 }, (_, i) =>
    event(day, "answer", `word-${i}`, {
      id: `answer-${i}`,
      questionId: `question-${i}`,
      correct: false,
    }),
  );
  assert.equal(
    getStatistics(journal(answers.slice(0, 4)), localNoon(day)).studyDays,
    0,
  );
  assert.equal(getStatistics(journal(answers), localNoon(day)).studyDays, 1);
  assert.equal(
    getStatistics(
      journal(
        answers.map((answer) => ({ ...answer, questionId: "same-question" })),
      ),
      localNoon(day),
    ).studyDays,
    0,
  );
});

test("calendar periods start on Monday and respect month and year boundaries", () => {
  const dates = [
    "2024-12-31",
    "2025-12-31",
    "2026-01-01",
    "2026-01-04",
    "2026-01-05",
  ];
  const words = journal(
    dates.map((day, i) => event(day, "word-studied", `word-${i}`)),
  );
  const stats = getStatistics(words, localNoon("2026-01-05"));
  assert.equal(stats.wordsToday, 1);
  assert.equal(stats.wordsThisWeek, 1);
  assert.equal(stats.wordsThisMonth, 3);
  assert.equal(stats.wordsThisYear, 3);
  assert.equal(stats.vocabularySize, 5);
  assert.deepEqual(
    stats.weeklyActivity.map((day) => day.date),
    [
      "2026-01-05",
      "2026-01-06",
      "2026-01-07",
      "2026-01-08",
      "2026-01-09",
      "2026-01-10",
      "2026-01-11",
    ],
  );
  const sunday = getStatistics(words, localNoon("2026-01-04"));
  assert.equal(sunday.wordsThisWeek, 3);
  assert.equal(sunday.weeklyActivity[0].date, "2025-12-29");
  assert.equal(sunday.weeklyActivity[6].date, "2026-01-04");
});

test("a current streak may end today or yesterday, then expires after a missed day", () => {
  const history = lessonDays("2026-09-03", "2026-09-04", "2026-09-05");
  assert.equal(getStatistics(history, localNoon("2026-09-05")).streakDays, 3);
  assert.equal(getStatistics(history, localNoon("2026-09-06")).streakDays, 3);
  const expired = getStatistics(history, localNoon("2026-09-07"));
  assert.equal(expired.streakDays, 0);
  assert.equal(expired.longestStreak, 3);
  const resumed = appendEvent(
    history,
    event("2026-09-07", "lesson-completed", "new-lesson"),
  );
  assert.equal(getStatistics(resumed, localNoon("2026-09-07")).streakDays, 1);
  assert.equal(
    getStatistics(resumed, localNoon("2026-09-07")).longestStreak,
    3,
  );
});

test("one calendar day contributes once even when all completion thresholds are met", () => {
  const history = lessonDays("2026-09-07");
  const additional = Array.from({ length: 5 }, (_, i) =>
    event("2026-09-07", "word-studied", `word-${i}`),
  );
  history.events.push(...additional);
  const stats = getStatistics(history, localNoon("2026-09-07"));
  assert.equal(stats.studyDays, 1);
  assert.equal(stats.streakDays, 1);
  assert.equal(stats.longestStreak, 1);
  assert.equal(stats.weeklyActivity[0].completed, true);
  assert.equal(stats.weeklyActivity[0].words, 5);
});

test("calendar streaks cross leap day, year end and daylight-saving changes", () => {
  for (const days of [
    ["2024-02-28", "2024-02-29", "2024-03-01"],
    ["2025-12-31", "2026-01-01", "2026-01-02"],
    ["2026-03-28", "2026-03-29", "2026-03-30"],
    ["2026-10-24", "2026-10-25", "2026-10-26"],
  ]) {
    const stats = getStatistics(lessonDays(...days), localNoon(days[2]));
    assert.equal(stats.streakDays, 3, days.join(", "));
    assert.equal(stats.longestStreak, 3);
    assert.equal(dayNumber(days[2]) - dayNumber(days[0]), 2);
  }
});

test("local dates use the requested timezone and preserve Dutch DST boundaries", () => {
  assert.equal(
    localDay(new Date("2026-03-28T23:30:00Z"), "Europe/Amsterdam"),
    "2026-03-29",
  );
  assert.equal(
    localDay(new Date("2026-03-29T22:30:00Z"), "Europe/Amsterdam"),
    "2026-03-30",
  );
  assert.equal(
    localDay(new Date("2026-10-24T22:30:00Z"), "Europe/Amsterdam"),
    "2026-10-25",
  );
  assert.equal(
    localDay(new Date("2026-10-25T22:30:00Z"), "Europe/Amsterdam"),
    "2026-10-25",
  );
  const instant = new Date("2026-09-07T23:30:00Z");
  assert.equal(localDay(instant, "Europe/Amsterdam"), "2026-09-08");
  assert.equal(localDay(instant, "America/New_York"), "2026-09-07");
});

test("events retain the local learning date even if their UTC timestamp is another date", () => {
  const history = journal([
    event("2026-09-08", "word-studied", "late-word", {
      occurredAt: "2026-09-07T23:30:00.000Z",
    }),
  ]);
  assert.equal(getStatistics(history, localNoon("2026-09-08")).wordsToday, 1);
  assert.equal(getStatistics(history, localNoon("2026-09-07")).wordsToday, 0);
});

test("event creation captures timestamp, device timezone and a stable completion ID", () => {
  const now = new Date("2026-09-07T12:13:14.000Z");
  const created = makeEvent("word-studied", "word-one", "vocabulary", {}, now);
  assert.equal(created.id, "word-studied:word-one");
  assert.equal(created.occurredAt, now.toISOString());
  assert.equal(
    created.timeZone,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  assert.equal(created.day, localDay(now));
  const answer = makeEvent(
    "answer",
    "lesson-one",
    "grammar",
    { id: "unique-attempt", questionId: "question-one", correct: true },
    now,
  );
  assert.equal(answer.id, "unique-attempt");
  assert.equal(answer.correct, true);
  assert.equal(answer.questionId, "question-one");
});

const practiceWords: VocabularyItem[] = [
  {
    id: "tafel",
    dutch: "tafel",
    english: "table",
    wordType: "noun",
    level: "A1",
    topic: "Home",
    example: { dutch: "", english: "" },
    isSample: false,
    article: "de",
  },
  {
    id: "leren",
    dutch: "leren",
    english: "to learn",
    wordType: "verb",
    level: "A1",
    topic: "Learning",
    example: { dutch: "", english: "" },
    isSample: false,
  },
  {
    id: "nieuw",
    dutch: "nieuw",
    english: "new",
    wordType: "adjective",
    level: "A1",
    topic: "Daily life",
    example: { dutch: "", english: "" },
    isSample: false,
  },
];

test("vocabulary practice generates answerable questions linked to imported words without recording activity", () => {
  const activity = emptyActivity();
  const questions = vocabularyPractice(practiceWords, []);
  assert.equal(questions.length, practiceWords.length);
  for (const question of questions) {
    const word = practiceWords.find(
      (item) => item.id === question.relatedItemId,
    );
    assert.ok(word);
    assert.equal(question.correctAnswer, word.english);
    assert.equal(
      question.options.filter((option) => option === question.correctAnswer)
        .length,
      1,
    );
    assert.ok(question.options.length >= 2);
    assert.equal(new Set(question.options).size, question.options.length);
    assert.match(question.prompt, new RegExp(word.dutch));
  }
  assert.deepEqual(vocabularyPractice(practiceWords, []), questions);
  assert.deepEqual(activity, emptyActivity());
});

test("existing hand-authored questions remain unchanged and are not duplicated by generated practice", () => {
  const existing: Question = {
    id: "authored-question",
    relatedItemId: "tafel",
    kind: "multiple-choice",
    prompt: "Choose the article for tafel.",
    options: ["de", "het"],
    correctAnswer: "de",
    explanation: "The noun tafel uses de.",
  };
  const snapshot = JSON.stringify(existing);
  const questions = vocabularyPractice(practiceWords, [existing]);
  assert.equal(questions[0], existing);
  assert.equal(
    questions.filter((question) => question.relatedItemId === "tafel").length,
    1,
  );
  assert.equal(questions.length, 3);
  assert.equal(JSON.stringify(existing), snapshot);
});

test("practice does not invent alternatives when there are no distinct meanings", () => {
  assert.deepEqual(vocabularyPractice([], []), []);
  assert.deepEqual(vocabularyPractice(practiceWords.slice(0, 1), []), []);
  assert.deepEqual(
    vocabularyPractice(
      [
        practiceWords[0],
        {
          ...practiceWords[0],
          id: "second-word",
          dutch: "another term",
          english: " TABLE ",
        },
      ],
      [],
    ),
    [],
  );
});
