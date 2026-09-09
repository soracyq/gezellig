import {
  appendEvent,
  dayNumber,
  localDay,
  makeEvent,
  type ActivityJournal,
} from "./activity.ts";
import type {
  ContentType,
  GrammarTopic,
  TranslationQuestion,
  VocabularyItem,
} from "./models.ts";
import {
  grammarTranslations,
  matchesAnswer,
  vocabularyTranslations,
} from "./translation.ts";

export const reviewKey = (type: ContentType, id: string) => `${type}:${id}`;
const afterDays = (day: string, days: number) =>
  new Date((dayNumber(day) + days) * 86400000).toISOString().slice(0, 10);
export function reviewProgress(journal: ActivityJournal) {
  const result = new Map<
    string,
    {
      firstStudiedAt: string;
      lastActivityAt: string;
      dueDay: string;
      consecutiveCorrectReviews: number;
      mistakes: number;
      reviews: number;
      lastScheduledDay?: string;
    }
  >();
  for (const e of [...journal.events].sort((a, b) =>
    a.occurredAt.localeCompare(b.occurredAt),
  )) {
    const key = reviewKey(e.contentType, e.itemId);
    const state = result.get(key) ?? {
      firstStudiedAt: e.occurredAt,
      lastActivityAt: e.occurredAt,
      dueDay: e.day,
      consecutiveCorrectReviews: 0,
      mistakes: 0,
      reviews: 0,
    };
    state.lastActivityAt = e.occurredAt;
    if (e.kind === "answer") {
      if (e.correct === false) {
        state.mistakes++;
        state.consecutiveCorrectReviews = 0;
        state.dueDay =
          e.source === "daily-review" ? afterDays(e.day, 1) : e.day;
      }
      if (e.source === "daily-review") {
        state.reviews++;
        if (e.scheduledReview && state.lastScheduledDay !== e.day) {
          if (e.correct) {
            state.consecutiveCorrectReviews = Math.min(
              5,
              state.consecutiveCorrectReviews + 1,
            );
            state.dueDay = afterDays(
              e.day,
              [1, 2, 4, 7, 14][state.consecutiveCorrectReviews - 1],
            );
          }
          state.lastScheduledDay = e.day;
        }
      }
    }
    result.set(key, state);
  }
  return result;
}
export function dailyReview(
  vocabulary: VocabularyItem[],
  grammar: GrammarTopic[],
  journal: ActivityJournal,
  target: number,
  now = new Date(),
) {
  const day = localDay(now),
    progress = reviewProgress(journal);
  const attempts = journal.events.filter(
    (e) => e.kind === "answer" && e.source === "daily-review" && e.day === day,
  );
  const done = new Set(attempts.map((e) => reviewKey(e.contentType, e.itemId)));
  const candidates = [
    ...vocabulary.map((item) => ({ item, type: "vocabulary" as const })),
    ...grammar.map((item) => ({ item, type: "grammar" as const })),
  ].flatMap(({ item, type }) => {
    const key = reviewKey(type, item.id),
      state = progress.get(key);
    if (!state) return [];
    const variations =
      type === "vocabulary"
        ? vocabularyTranslations(item as VocabularyItem)
        : grammarTranslations(item as GrammarTopic);
    if (!variations.length) return [];
    return [
      {
        key,
        state,
        question: variations[state.reviews % variations.length],
        scheduled: state.dueDay <= day,
      },
    ];
  });
  const available = candidates
    .filter((c) => !done.has(c.key))
    .sort((a, b) => {
      // Overdue first; equally due weak items before easy ones, then recent learning.
      if (a.scheduled !== b.scheduled) return a.scheduled ? -1 : 1;
      if (a.scheduled && a.state.dueDay !== b.state.dueDay)
        return a.state.dueDay.localeCompare(b.state.dueDay);
      const weakA =
          a.state.mistakes > 0 && a.state.consecutiveCorrectReviews < 5,
        weakB = b.state.mistakes > 0 && b.state.consecutiveCorrectReviews < 5;
      if (weakA !== weakB) return weakA ? -1 : 1;
      return (
        b.state.firstStudiedAt.localeCompare(a.state.firstStudiedAt) ||
        a.state.lastActivityAt.localeCompare(b.state.lastActivityAt) ||
        a.key.localeCompare(b.key)
      );
    });
  const remaining = Math.max(
    0,
    Math.min(Math.max(0, target - attempts.length), available.length),
  );
  const correct = attempts.filter((e) => e.correct).length;
  return {
    day,
    completed: attempts.length,
    total: attempts.length + remaining,
    remaining,
    target,
    eligible: candidates.length,
    questions: available.slice(0, remaining),
    correct,
    incorrect: attempts.length - correct,
    accuracy: attempts.length
      ? Math.round((correct / attempts.length) * 100)
      : null,
    vocabularyReviewed: attempts.filter((e) => e.contentType === "vocabulary")
      .length,
    grammarReviewed: attempts.filter((e) => e.contentType === "grammar").length,
    mastered: [...progress.values()].filter(
      (p) => p.consecutiveCorrectReviews >= 5,
    ).length,
  };
}

/** Recheck quota and eligibility inside the provider's existing storage lock. */
export function submitDailyReview(
  vocabulary: VocabularyItem[],
  grammar: GrammarTopic[],
  journal: ActivityJournal,
  target: number,
  question: TranslationQuestion,
  answer: string,
  expectedDay: string,
  now = new Date(),
) {
  const plan = dailyReview(vocabulary, grammar, journal, target, now);
  if (plan.day !== expectedDay)
    throw new Error(
      "A new day has started. Open today’s review before answering.",
    );
  const id = `daily-review:${plan.day}:${reviewKey(question.contentType, question.relatedItemId)}`;
  const existing = journal.events.find((e) => e.id === id);
  if (existing)
    return { journal, correct: existing.correct === true, alreadySaved: true };
  if (!answer.trim()) throw new Error("Type your Dutch answer first.");
  const candidate = plan.questions.find((c) => c.question.id === question.id);
  if (!candidate)
    throw new Error(
      "Today’s review has changed or is complete. Refresh the review to continue.",
    );
  const correct = matchesAnswer(candidate.question, answer);
  return {
    journal: appendEvent(
      journal,
      makeEvent(
        "answer",
        candidate.question.relatedItemId,
        candidate.question.contentType,
        {
          id,
          questionId: candidate.question.id,
          correct,
          source: "daily-review",
          scheduledReview: candidate.scheduled,
          answer,
        },
        now,
      ),
    ),
    correct,
    alreadySaved: false,
  };
}
