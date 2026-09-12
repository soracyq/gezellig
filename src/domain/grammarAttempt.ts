import type { GrammarTopic } from "./models.ts";
import { grammarExercises } from "./grammarPractice.ts";
import { matchesAnswer } from "./translation.ts";
import { appendEvent, makeEvent, type ActivityJournal } from "./activity.ts";

export function submitGrammarPractice(
  journal: ActivityJournal,
  lesson: GrammarTopic,
  questionId: string,
  answer: string,
  attemptId: string,
) {
  const question = grammarExercises(lesson).find(
    (item) => item.id === questionId,
  );
  if (!question)
    throw new Error("This exercise is no longer available. Reopen the lesson.");
  if (!answer.trim()) throw new Error("Enter an answer first.");
  if (
    question.kind === "multiple-choice" &&
    !question.options?.includes(answer)
  )
    throw new Error("Choose one of the available answers.");
  const existing = journal.events.find((event) => event.id === attemptId);
  if (existing) {
    if (
      existing.kind !== "answer" ||
      existing.questionId !== questionId ||
      existing.itemId !== lesson.id
    )
      throw new Error("This attempt belongs to another question.");
    return {
      journal,
      correct: existing.correct === true,
      answer: existing.answer ?? answer,
    };
  }
  const correct = matchesAnswer(question, answer);
  return {
    journal: appendEvent(
      journal,
      makeEvent("answer", lesson.id, "grammar", {
        id: attemptId,
        questionId,
        correct,
        answer,
      }),
    ),
    correct,
    answer,
  };
}
