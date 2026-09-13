import assert from "node:assert/strict";
import test from "node:test";
import { vocabularyItems, grammarTopics } from "../src/data/sample-content.ts";
import {
  appendEvent,
  emptyActivity,
  getStatistics,
  localDay,
  makeEvent,
  type ActivityJournal,
} from "../src/domain/activity.ts";
import {
  dailyReview,
  reviewKey,
  reviewProgress,
  submitDailyReview,
} from "../src/domain/review.ts";
import {
  grammarTranslations,
  matchesAnswer,
  vocabularyTranslations,
} from "../src/domain/translation.ts";
import {
  readActivity,
  writeActivity,
  readCurriculum,
  writeCurriculum,
  emptyCurriculum,
} from "../src/storage/library.ts";
import type {
  GrammarTopic,
  NounItem,
  VocabularyItem,
} from "../src/domain/models.ts";
const now = new Date("2026-09-09T12:00:00Z");
const words = (n: number): VocabularyItem[] =>
  Array.from({ length: n }, (_, i) => ({
    ...vocabularyItems[0],
    id: `word-${i}`,
  }));
const studied = (
  items: VocabularyItem[],
  lessons: GrammarTopic[] = [],
): ActivityJournal => ({
  version: 1,
  events: [
    ...items.map((w) =>
      makeEvent(
        "word-studied",
        w.id,
        "vocabulary",
        {},
        new Date(now.getTime() - 86400000),
      ),
    ),
    ...lessons.map((g) =>
      makeEvent(
        "lesson-completed",
        g.id,
        "grammar",
        {},
        new Date(now.getTime() - 86400000),
      ),
    ),
  ],
});
function answerNext(
  ws: VocabularyItem[],
  gs: GrammarTopic[],
  journal: ActivityJournal,
  target = 10,
  date = now,
  correct = true,
) {
  const plan = dailyReview(ws, gs, journal, target, date),
    q = plan.questions[0].question;
  return submitDailyReview(
    ws,
    gs,
    journal,
    target,
    q,
    correct ? q.correctAnswer : "wrong",
    plan.day,
    date,
  ).journal;
}
test("daily targets 10/15, limited six, empty and 1501 unseen imports", () => {
  for (const [target, count, expected] of [
    [10, 100, 10],
    [15, 100, 15],
    [10, 6, 6],
    [10, 0, 0],
  ]) {
    const ws = words(count),
      p = dailyReview(ws, [], studied(ws), target, now);
    assert.equal(p.questions.length, expected);
    assert.equal(p.total, expected);
  }
  assert.equal(
    dailyReview(words(1501), grammarTopics, emptyActivity(), 10, now).questions
      .length,
    0,
  );
});
test("four words and two completed lessons yield six items, not all variations", () => {
  const ws = words(50),
    journal = studied(ws.slice(0, 4), grammarTopics);
  const p = dailyReview(ws, grammarTopics, journal, 10, now);
  assert.equal(p.eligible, 6);
  assert.equal(p.questions.length, 6);
  assert.equal(
    new Set(
      p.questions.map((q) =>
        reviewKey(q.question.contentType, q.question.relatedItemId),
      ),
    ).size,
    6,
  );
  assert(p.questions.some((q) => q.question.contentType === "grammar"));
});
test("practice-only historical answers do not create review eligibility or consume the allowance", () => {
  const journal = appendEvent(
    emptyActivity(),
    makeEvent(
      "answer",
      vocabularyItems[0].id,
      "vocabulary",
      { id: "old-attempt", questionId: "old", correct: false },
      now,
    ),
  );
  const p = dailyReview(vocabularyItems, [], journal, 10, now);
  assert.equal(p.eligible, 0);
  assert.equal(p.completed, 0);
});
test("persisted four answers reopen as four completed and six remaining, with raw answers retained", async () => {
  const ws = words(100);
  let journal = studied(ws);
  for (let i = 0; i < 4; i++) journal = answerNext(ws, [], journal);
  let raw: string | null = null;
  const storage = {
    getItem: async () => raw,
    setItem: async (_key: string, value: string) => {
      raw = value;
    },
  };
  await writeActivity(storage, journal);
  const restored = await readActivity(storage);
  const p = dailyReview(ws, [], restored, 10, now);
  assert.equal(p.completed, 4);
  assert.equal(p.remaining, 6);
  assert.equal(p.total, 10);
  assert.equal(
    restored.events.filter((e) => e.source === "daily-review" && e.answer)
      .length,
    4,
  );
  assert.deepEqual(restored, journal);
  assert.deepEqual(reviewProgress(restored), reviewProgress(journal));
});
test("changing targets mid-day preserves attempts and never makes remaining negative", () => {
  const ws = words(100);
  let journal = studied(ws);
  for (let i = 0; i < 4; i++) journal = answerNext(ws, [], journal);
  assert.equal(dailyReview(ws, [], journal, 15, now).remaining, 11);
  for (let i = 4; i < 10; i++) journal = answerNext(ws, [], journal);
  assert.equal(dailyReview(ws, [], journal, 5, now).remaining, 0);
  assert.equal(dailyReview(ws, [], journal, 5, now).completed, 10);
});
test("local midnight and DST reset only the daily allowance and stale-day submission is rejected", () => {
  const prior = process.env.TZ;
  process.env.TZ = "Europe/Amsterdam";
  try {
    const before = new Date("2026-10-24T21:59:00Z"),
      after = new Date("2026-10-24T22:01:00Z");
    assert.equal(localDay(before), "2026-10-24");
    assert.equal(localDay(after), "2026-10-25");
    const ws = words(3),
      journal = answerNext(ws, [], studied(ws), 10, before),
      snapshot = JSON.stringify(journal);
    assert.equal(dailyReview(ws, [], journal, 10, after).completed, 0);
    assert.equal(
      dailyReview(ws, [], journal, 10, new Date("2026-10-25T02:30:00Z")).day,
      "2026-10-25",
    );
    const q = dailyReview(ws, [], journal, 10, before).questions[0].question;
    assert.throws(
      () =>
        submitDailyReview(
          ws,
          [],
          journal,
          10,
          q,
          q.correctAnswer,
          localDay(before),
          after,
        ),
      /new day/,
    );
    assert.equal(JSON.stringify(journal), snapshot);
  } finally {
    if (prior === undefined) delete process.env.TZ;
    else process.env.TZ = prior;
  }
});
test("duplicate submission is idempotent; stale quota and unseen questions cannot bypass the cap", () => {
  const ws = words(20);
  let journal = studied(ws);
  const p = dailyReview(ws, [], journal, 5, now),
    q = p.questions[0].question;
  journal = submitDailyReview(
    ws,
    [],
    journal,
    5,
    q,
    q.correctAnswer,
    p.day,
    now,
  ).journal;
  const again = submitDailyReview(ws, [], journal, 5, q, "wrong", p.day, now);
  assert.equal(again.alreadySaved, true);
  assert.deepEqual(again.journal, journal);
  for (let i = 1; i < 5; i++) journal = answerNext(ws, [], journal, 5);
  const q6 = vocabularyTranslations(
    ws.find(
      (word) =>
        !journal.events.some(
          (event) =>
            event.source === "daily-review" && event.itemId === word.id,
        ),
    )!,
  )[0];
  assert.throws(
    () =>
      submitDailyReview(ws, [], journal, 5, q6, q6.correctAnswer, p.day, now),
    /changed or is complete/,
  );
  assert.throws(
    () =>
      submitDailyReview(
        ws,
        [],
        emptyActivity(),
        10,
        q,
        q.correctAnswer,
        p.day,
        now,
      ),
    /changed or is complete/,
  );
});
test("overdue then previously incorrect reviews take priority over dataset order", () => {
  const ws = words(3);
  let journal = studied(ws);
  journal = appendEvent(
    journal,
    makeEvent(
      "answer",
      ws[2].id,
      "vocabulary",
      {
        id: "mistake",
        questionId: "q",
        correct: false,
        source: "daily-review",
        scheduledReview: true,
      },
      new Date(now.getTime() - 86400000),
    ),
  );
  assert.equal(
    dailyReview(ws, [], journal, 1, now).questions[0].question.relatedItemId,
    ws[2].id,
  );
  journal.events[1] = {
    ...journal.events[1],
    occurredAt: "2026-09-01T12:00:00Z",
    day: "2026-09-01",
  };
  assert.equal(
    dailyReview(ws, [], journal, 1, now).questions[0].question.relatedItemId,
    ws[1].id,
  );
});
test("five correct scheduled days establish mastery; early answers do not advance and mistakes reset it", () => {
  const ws = words(1);
  let journal = studied(ws);
  for (const offset of [0, 1, 4, 11, 25])
    journal = answerNext(
      ws,
      [],
      journal,
      10,
      new Date(now.getTime() + offset * 86400000),
    );
  let state = reviewProgress(journal).get("vocabulary:word-0")!;
  assert.equal(state.consecutiveCorrectReviews, 5);
  assert.equal(
    dailyReview(ws, [], journal, 10, new Date("2026-10-05T12:00:00Z")).mastered,
    1,
  );
  assert.equal(
    dailyReview(ws, [], journal, 10, new Date("2026-10-05T12:00:00Z")).questions
      .length,
    0,
  );
  let recovery = answerNext(ws, [], studied(ws));
  recovery = answerNext(
    ws,
    [],
    recovery,
    10,
    new Date("2026-09-10T12:00:00Z"),
    false,
  );
  state = reviewProgress(recovery).get("vocabulary:word-0")!;
  assert.equal(state.consecutiveCorrectReviews, 0);
  assert.equal(state.mistakes, 1);
  let early = answerNext(ws, [], studied(ws));
  early = answerNext(ws, [], early, 10, new Date("2026-09-10T12:00:00Z"));
  assert.equal(
    dailyReview(ws, [], early, 10, new Date("2026-09-11T12:00:00Z")).questions
      .length,
    0,
  );
  assert.equal(
    reviewProgress(early).get("vocabulary:word-0")!.consecutiveCorrectReviews,
    2,
  );
});
test("noun singular/plural and controlled pronoun translations require correct Dutch spelling", () => {
  const boy = {
    ...vocabularyItems[0],
    id: "boy",
    dutch: "jongen",
    english: "boy",
    article: "de",
    plural: "jongens",
  } as NounItem;
  for (const [word, expected] of [
    [vocabularyItems[0], ["het huis", "de huizen"]],
    [boy, ["de jongen", "de jongens"]],
  ] as [VocabularyItem, string[]][]) {
    const q = vocabularyTranslations(word);
    assert.deepEqual(
      q.map((x) => x.correctAnswer),
      expected,
    );
    for (const x of q) {
      assert(
        matchesAnswer(
          x,
          `  ${x.correctAnswer.toUpperCase().replace(" ", "   ")}.  `,
        ),
      );
      assert(!matchesAnswer(x, x.correctAnswer.replace(/^(de|het) /, "")));
    }
  }
  const be = vocabularyTranslations(
    vocabularyItems.find((w) => w.dutch === "zijn")!,
  );
  assert.equal(be[0].prompt, "I am");
  assert.equal(be[0].correctAnswer, "ik ben");
  assert.equal(be[1].prompt, "you are");
  assert(matchesAnswer(be[1], "je bent"));
  assert(matchesAnswer(be[4], "we zijn"));
  assert(!matchesAnswer(be[1], "jij ben"));
  assert(!matchesAnswer(be[1], "u bent"));
  assert(
    !matchesAnswer(vocabularyTranslations(vocabularyItems[0])[0], "het huiz"),
  );
});
test("unknown conjugations and ambiguous plurals never produce invented forms", () => {
  const word = {
    ...vocabularyItems.find((w) => w.dutch === "zijn")!,
    id: "unknown",
    dutch: "kiezen",
    english: "to choose",
    conjugations: undefined,
  } as VocabularyItem;
  const q = vocabularyTranslations(word);
  assert.equal(q.length, 1);
  assert.equal(q[0].prompt, "to choose");
  assert.equal(q[0].correctAnswer, "kiezen");
  assert.equal(
    vocabularyTranslations({
      ...vocabularyItems[0],
      wordType: "noun",
      article: undefined,
      plural: undefined,
    }).length,
    1,
  );
});
test("a studied imported noun with no optional morphology remains reviewable", () => {
  for (const dutch of ["huis", "het huis", "café"]) {
    const word: VocabularyItem = {
      ...vocabularyItems[0],
      id: "minimal-noun",
      dutch,
      wordType: "noun",
      article: undefined,
      plural: undefined,
    };
    assert.equal(
      dailyReview([word], [], emptyActivity(), 10, now).questions.length,
      0,
    );
    const journal = studied([word]);
    const plan = dailyReview([word], [], journal, 10, now);
    assert.equal(plan.questions.length, 1);
    const question = plan.questions[0].question;
    assert.equal(question.correctAnswer, dutch);
    const result = submitDailyReview(
      [word],
      [],
      journal,
      10,
      question,
      dutch,
      plan.day,
      now,
    );
    assert.equal(result.journal.events.at(-1)?.correct, true);
  }
});
test("one-sentence and authored dialogue grammar, explicit variants, punctuation and Unicode", async () => {
  const lesson = {
    ...grammarTopics[0],
    id: "conversation",
    examples: [
      {
        english: "What time is it?\nIt's 9:45.",
        dutch: "Hoe laat is het?\nHet is kwart voor tien.",
      },
      {
        english: "What is your name?\nMy name is Derrick.",
        dutch: "Hoe heet je?\nMijn naam is Derrick.",
        acceptedAnswers: ["Hoe heet je?\nIk heet Derrick."],
      },
    ],
  };
  const questions = grammarTranslations(lesson);
  assert.equal(questions.length, 2);
  assert(
    matchesAnswer(questions[0], "  HOE LAAT IS HET\n Het is kwart voor tien  "),
  );
  assert(!matchesAnswer(questions[0], "Het is tien voor kwart"));
  assert(matchesAnswer(questions[1], "Hoe heet je? Ik heet Derrick."));
  assert(!matchesAnswer(questions[1], "Hoe heet je? Ik heet Anna."));
  const single = grammarTranslations(grammarTopics[1])[0];
  assert(matchesAnswer(single, "ik woon in amsterdam."));
  assert(!matchesAnswer(single, "ik woont in amsterdam"));
  assert.equal(dailyReview([], [lesson], emptyActivity(), 10, now).eligible, 0);
  assert.equal(
    dailyReview([], [lesson], studied([], [lesson]), 10, now).eligible,
    1,
  );
  const accent = { ...single, correctAnswer: "België" };
  assert(matchesAnswer(accent, "Belgie\u0308"));
  assert(!matchesAnswer(accent, "Belgie"));
  let raw: string | null = null;
  const storage = {
    getItem: async () => raw,
    setItem: async (_key: string, v: string) => {
      raw = v;
    },
  };
  await writeCurriculum(storage, { ...emptyCurriculum(), grammar: [lesson] });
  assert.deepEqual(
    (await readCurriculum(storage)).grammar[0].examples,
    lesson.examples,
  );
});
test("opening, question generation and skipped/previewed material do not write activity; real answers do", () => {
  const ws = words(6),
    journal = studied(ws),
    before = JSON.stringify(journal),
    stats = getStatistics(journal, now);
  dailyReview(ws, [], journal, 5, now);
  vocabularyTranslations(ws[0]);
  assert.equal(JSON.stringify(journal), before);
  assert.deepEqual(getStatistics(journal, now), stats);
  const saved = answerNext(ws, [], journal, 5, now, false),
    after = getStatistics(saved, now);
  assert.equal(after.questionsAnswered, 1);
  assert.equal(after.incorrectAnswers, 1);
  assert.equal(after.vocabularySize, stats.vocabularySize);
});
