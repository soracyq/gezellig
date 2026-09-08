import type { Question, VocabularyItem } from "./models.ts";

export function vocabularyPractice(
  words: VocabularyItem[],
  existing: Question[],
): Question[] {
  const covered = new Set(existing.map((q) => q.relatedItemId));
  const meanings = [
    ...new Set(words.map((word) => word.english.trim()).filter(Boolean)),
  ];
  const generated = words
    .filter((word) => !covered.has(word.id))
    .flatMap((word): Question[] => {
      const alternatives = meanings
        .filter(
          (meaning) =>
            meaning.toLocaleLowerCase() !==
            word.english.trim().toLocaleLowerCase(),
        )
        .slice(0, 3);
      if (!alternatives.length) return [];
      const options = [...alternatives];
      options.splice(word.dutch.length % (options.length + 1), 0, word.english);
      return [
        {
          id: `meaning:${word.id}`,
          relatedItemId: word.id,
          kind: "multiple-choice",
          prompt: `What does “${word.dutch}” mean?`,
          options,
          correctAnswer: word.english,
          explanation: `${word.dutch} means ${word.english}.`,
        },
      ];
    });
  return [...existing, ...generated];
}
