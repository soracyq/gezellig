import type { GrammarExercise, GrammarTopic } from "./models.ts";
import { grammarPracticeCatalog } from "../data/grammar-practice-catalog.ts";

export interface GrammarPracticeEntry {
  source: Pick<GrammarTopic, "objective" | "rules" | "examples">;
  exercises: Omit<GrammarExercise, "relatedItemId">[];
}

/** A read-only supplement: matching existing imports requires no data migration. */
export function grammarExercises(lesson: GrammarTopic): GrammarExercise[] {
  const entry = lesson.sourceLessonId
    ? grammarPracticeCatalog[lesson.sourceLessonId]
    : undefined;
  // A custom import reusing an ID must not acquire exercises for different content.
  if (
    entry &&
    lesson.objective === entry.source.objective &&
    JSON.stringify(lesson.rules) === JSON.stringify(entry.source.rules) &&
    lesson.examples.length === entry.source.examples.length &&
    lesson.examples.every(
      (example, i) =>
        example.dutch === entry.source.examples[i].dutch &&
        example.english === entry.source.examples[i].english,
    )
  ) {
    return entry.exercises.map((exercise) => ({
      ...exercise,
      id: `${lesson.id}:${exercise.id}`,
      relatedItemId: lesson.id,
    }));
  }
  const questions: GrammarExercise[] = lesson.questions.map((question, i) => ({
    ...question,
    relatedItemId: lesson.id,
    acceptedAnswers: [],
    hint: "",
    sortOrder: i + 1,
  }));
  for (const [i, example] of lesson.examples.entries()) {
    if (!example.dutch.trim() || !example.english.trim()) continue;
    questions.push({
      id: `translation:${lesson.id}:example:${i}`,
      kind: "translation",
      relatedItemId: lesson.id,
      prompt: example.english,
      correctAnswer: example.dutch,
      acceptedAnswers: example.acceptedAnswers ?? [],
      explanation: lesson.rules[0] ?? lesson.objective,
      hint: "Use the wording from the lesson example.",
      sortOrder: questions.length + 1,
    });
  }
  return questions;
}
