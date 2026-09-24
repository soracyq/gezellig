import { z } from "zod";
import type { GoalCelebration } from "../domain/dailyGoals.ts";
import type { SettingsStorage } from "./settings.ts";

export const GOAL_CELEBRATIONS_KEY = "@dutchly/goal-celebrations/v1";
const schema = z.object({
  version: z.literal(1),
  vocabularyGoalCelebratedDate: z.iso.date().optional(),
  grammarGoalCelebratedDate: z.iso.date().optional(),
});

// Call inside the existing learning transaction lock, after progress is saved.
// Persist before showing anything: reloads and other tabs cannot replay it.
// Resetting learning progress deliberately leaves these notification dates intact.
export async function claimGoalCelebration(
  storage: SettingsStorage,
  celebration: GoalCelebration,
): Promise<boolean> {
  const raw = await storage.getItem(GOAL_CELEBRATIONS_KEY);
  const saved = schema.parse(raw === null ? { version: 1 } : JSON.parse(raw));
  const key =
    celebration.kind === "vocabulary"
      ? "vocabularyGoalCelebratedDate"
      : "grammarGoalCelebratedDate";
  if (saved[key] === celebration.day) return false;
  await storage.setItem(
    GOAL_CELEBRATIONS_KEY,
    JSON.stringify({
      ...saved,
      [key]: celebration.day,
    }),
  );
  return true;
}
