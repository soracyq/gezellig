import { getStatistics, localDay, type ActivityJournal } from "./activity.ts";
import type { ContentType } from "./models.ts";

// Centralized until Settings offers a separate grammar target.
export const DAILY_GRAMMAR_TARGET = 1;
export type GoalCelebration = { kind: ContentType; day: string; count: number };

export function crossedDailyGoal(
  previous: ActivityJournal,
  current: ActivityJournal,
  kind: ContentType,
  vocabularyTarget: number,
  now = new Date(),
): GoalCelebration | null {
  const before = getStatistics(previous, now);
  const after = getStatistics(current, now);
  const target =
    kind === "vocabulary" ? vocabularyTarget : DAILY_GRAMMAR_TARGET;
  const previousCount =
    kind === "vocabulary" ? before.wordsToday : before.lessonsToday;
  const count = kind === "vocabulary" ? after.wordsToday : after.lessonsToday;
  return previousCount < target && count >= target
    ? { kind, day: localDay(now), count }
    : null;
}
