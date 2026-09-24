import type { ContentType } from "./models.ts";

export type ActivityEvent = {
  id: string;
  kind: "word-studied" | "lesson-completed" | "answer";
  itemId: string;
  contentType: ContentType;
  occurredAt: string;
  day: string;
  timeZone: string;
  questionId?: string;
  correct?: boolean;
  source?: "daily-review";
  scheduledReview?: boolean;
  answer?: string;
};
export type ActivityJournal = { version: 1; events: ActivityEvent[] };
export const emptyActivity = (): ActivityJournal => ({
  version: 1,
  events: [],
});
export function localDay(
  date: Date,
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export function dayNumber(day: string): number {
  const [year, month, date] = day.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, date) / 86400000);
}
export function makeEvent(
  kind: ActivityEvent["kind"],
  itemId: string,
  contentType: ContentType,
  options: {
    id?: string;
    questionId?: string;
    correct?: boolean;
    source?: "daily-review";
    scheduledReview?: boolean;
    answer?: string;
  } = {},
  now = new Date(),
): ActivityEvent {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    id: options.id ?? `${kind}:${itemId}`,
    kind,
    itemId,
    contentType,
    occurredAt: now.toISOString(),
    day: localDay(now, timeZone),
    timeZone,
    ...options,
  };
}
export function appendEvent(
  journal: ActivityJournal,
  event: ActivityEvent,
): ActivityJournal {
  if (
    journal.events.some(
      (existing) =>
        existing.id === event.id ||
        (event.kind !== "answer" &&
          existing.kind === event.kind &&
          existing.itemId === event.itemId),
    )
  )
    return journal;
  return { ...journal, events: [...journal.events, event] };
}
export function getStatistics(journal: ActivityJournal, now = new Date()) {
  const today = localDay(now);
  const todayNumber = dayNumber(today);
  const weekStart =
    todayNumber - ((new Date(todayNumber * 86400000).getUTCDay() + 6) % 7);
  const events = journal.events;
  const words = events.filter((e) => e.kind === "word-studied");
  const lessons = events.filter((e) => e.kind === "lesson-completed");
  const answers = events.filter((e) => e.kind === "answer");
  const correctAnswers = answers.filter((e) => e.correct === true).length;
  const mistakes = answers.filter((e) => e.correct === false);
  const recent = answers.slice(-20);
  const days = new Map<
    string,
    { words: number; lessons: number; questions: Set<string> }
  >();
  for (const event of events) {
    const day = days.get(event.day) ?? {
      words: 0,
      lessons: 0,
      questions: new Set<string>(),
    };
    if (event.kind === "word-studied") day.words++;
    if (event.kind === "lesson-completed") day.lessons++;
    if (event.kind === "answer" && event.questionId)
      day.questions.add(event.questionId);
    days.set(event.day, day);
  }
  // Meaningful day: 5 new words OR 1 lesson OR 5 distinct answered questions.
  const completedDays = [...days]
    .filter(([, d]) => d.words >= 5 || d.lessons >= 1 || d.questions.size >= 5)
    .map(([day]) => dayNumber(day))
    .sort((a, b) => a - b);
  let longestStreak = 0,
    run = 0,
    previous = -Infinity;
  for (const day of completedDays) {
    run = day === previous + 1 ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
    previous = day;
  }
  const completedSet = new Set(completedDays);
  let cursor = completedSet.has(todayNumber) ? todayNumber : todayNumber - 1;
  let streakDays = 0;
  while (completedSet.has(cursor--)) streakDays++;
  return {
    hasActivity: events.length > 0,
    wordsToday: words.filter((e) => e.day === today).length,
    lessonsToday: lessons.filter((e) => e.day === today).length,
    wordsThisWeek: words.filter(
      (e) => dayNumber(e.day) >= weekStart && dayNumber(e.day) <= todayNumber,
    ).length,
    wordsThisMonth: words.filter((e) => e.day.slice(0, 7) === today.slice(0, 7))
      .length,
    wordsThisYear: words.filter((e) => e.day.slice(0, 4) === today.slice(0, 4))
      .length,
    vocabularySize: words.length,
    questionsAnswered: answers.length,
    correctAnswers,
    incorrectAnswers: mistakes.length,
    lifetimeAccuracy: answers.length
      ? Math.round((correctAnswers / answers.length) * 100)
      : null,
    recentAccuracy: recent.length
      ? Math.round(
          (recent.filter((e) => e.correct).length / recent.length) * 100,
        )
      : null,
    mistakeItems: new Set(mistakes.map((e) => `${e.contentType}:${e.itemId}`))
      .size,
    studyDays: completedDays.length,
    streakDays,
    longestStreak,
    lessonsCompleted: lessons.length,
    practiceAnswers: answers.length,
    weeklyActivity: Array.from({ length: 7 }, (_, i) => {
      const date = new Date((weekStart + i) * 86400000);
      const key = date.toISOString().slice(0, 10);
      return {
        day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
        date: key,
        words: words.filter((e) => e.day === key).length,
        completed: completedSet.has(weekStart + i),
      };
    }),
  };
}
