import { z } from "zod";
import type {
  GrammarTopic,
  ImportedDataset,
  VocabularyItem,
} from "../domain/models.ts";
import type { ActivityJournal } from "../domain/activity.ts";
import { emptyActivity } from "../domain/activity.ts";
import type { SettingsStorage } from "./settings.ts";

export const CURRICULUM_KEY = "@dutchly/curriculum/v1";
export const ACTIVITY_KEY = "@dutchly/activity/v1";
export type Curriculum = {
  version: 1;
  vocabulary: VocabularyItem[];
  grammar: GrammarTopic[];
  datasets: ImportedDataset[];
};
export const emptyCurriculum = (): Curriculum => ({
  version: 1,
  vocabulary: [],
  grammar: [],
  datasets: [],
});
const text = z.string();
const level = z.enum(["A1", "A2", "B1", "B2", "C1"]);
const wordType = z.enum([
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
  "conjunction",
  "numeral",
  "particle",
  "expression",
  "phrase",
]);
const example = z.object({
  dutch: text,
  english: text,
  acceptedAnswers: z.array(text).optional(),
});
const vocabularySchema = z.object({
  id: text.min(1),
  dutch: text.min(1),
  english: text.min(1),
  level,
  wordType,
  topic: text,
  example,
  isSample: z.boolean(),
  notes: text.optional(),
  datasetId: text.optional(),
  tags: z.array(text).optional(),
  article: z.enum(["de", "het"]).optional(),
  plural: text.optional(),
  indefiniteArticle: z.literal("een").optional(),
  diminutive: text.optional(),
  regular: z.boolean().optional(),
  separable: z.boolean().optional(),
  auxiliary: z.enum(["hebben", "zijn", "hebben / zijn"]).optional(),
  pastParticiple: text.optional(),
  conjugations: z.record(text, z.record(text, text)).optional(),
  inflected: text.optional(),
  comparative: text.optional(),
  superlative: text.optional(),
});
const questionSchema = z.object({
  id: text,
  kind: z.literal("multiple-choice"),
  prompt: text,
  options: z.array(text),
  correctAnswer: text,
  explanation: text,
  relatedItemId: text,
});
const grammarSchema = z.object({
  id: text.min(1),
  title: text.min(1),
  level,
  category: text,
  summary: text,
  objective: text,
  explanation: text.min(1),
  rules: z.array(text),
  commonMistakes: z.array(text),
  examples: z.array(example),
  questions: z.array(questionSchema),
  estimatedMinutes: z.number().nonnegative(),
  isSample: z.boolean(),
  exceptions: z.array(text).optional(),
  usageNotes: z.array(text).optional(),
  prerequisiteIds: z.array(text).optional(),
  datasetId: text.optional(),
  sourceLessonId: text.optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});
const datasetSchema = z.object({
  id: text.min(1),
  name: text.min(1),
  importedAt: z.iso.datetime(),
  itemCount: z.number().int().nonnegative(),
  levels: z.array(level),
  format: z.enum(["csv", "xlsx", "json"]),
  status: z.enum(["active", "archived"]),
  contentType: z.enum(["vocabulary", "grammar"]),
  skippedCount: z.number().int().nonnegative(),
});
export const curriculumSchema = z
  .object({
    version: z.literal(1),
    vocabulary: z.array(vocabularySchema),
    grammar: z.array(grammarSchema),
    datasets: z.array(datasetSchema),
  })
  .superRefine((curriculum, context) => {
    for (const collection of ["vocabulary", "grammar", "datasets"] as const) {
      const ids = new Set<string>();
      curriculum[collection].forEach((item, index) => {
        if (ids.has(item.id))
          context.addIssue({
            code: "custom",
            path: [collection, index, "id"],
            message: `Duplicate ${collection} ID`,
          });
        ids.add(item.id);
      });
    }
  });
const eventSchema = z
  .object({
    id: text.min(1),
    kind: z.enum(["word-studied", "lesson-completed", "answer"]),
    itemId: text.min(1),
    contentType: z.enum(["vocabulary", "grammar"]),
    occurredAt: z.iso.datetime(),
    day: z.iso.date(),
    timeZone: text.min(1),
    questionId: text.optional(),
    correct: z.boolean().optional(),
    source: z.literal("daily-review").optional(),
    scheduledReview: z.boolean().optional(),
    answer: text.optional(),
  })
  .refine(
    (e) =>
      e.kind !== "answer" || (typeof e.correct === "boolean" && !!e.questionId),
    "Answer is incomplete",
  );
const journalSchema = z
  .object({ version: z.literal(1), events: z.array(eventSchema) })
  .refine(
    (j) => new Set(j.events.map((e) => e.id)).size === j.events.length,
    "Duplicate activity IDs",
  );

export async function readCurriculum(
  storage: SettingsStorage,
): Promise<Curriculum> {
  const raw = await storage.getItem(CURRICULUM_KEY);
  if (raw === null) return emptyCurriculum();
  try {
    return curriculumSchema.parse(JSON.parse(raw)) as Curriculum;
  } catch {
    throw new Error(
      "Your saved curriculum could not be read. It has been kept unchanged. Restore a backup or contact support before importing again.",
    );
  }
}
export async function readActivity(
  storage: SettingsStorage,
): Promise<ActivityJournal> {
  const raw = await storage.getItem(ACTIVITY_KEY);
  if (raw === null) return emptyActivity();
  try {
    return journalSchema.parse(JSON.parse(raw));
  } catch {
    throw new Error(
      "Your learning history could not be read. It has been kept unchanged. You can retry, or explicitly reset only learning progress in Settings.",
    );
  }
}
export async function writeCurriculum(
  storage: SettingsStorage,
  curriculum: Curriculum,
) {
  await storage.setItem(
    CURRICULUM_KEY,
    JSON.stringify(curriculumSchema.parse(curriculum)),
  );
}
export async function writeActivity(
  storage: SettingsStorage,
  journal: ActivityJournal,
) {
  await storage.setItem(
    ACTIVITY_KEY,
    JSON.stringify(journalSchema.parse(journal)),
  );
}
export async function resetActivity(storage: SettingsStorage) {
  await writeActivity(storage, emptyActivity());
}
