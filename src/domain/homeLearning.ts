import type { ActivityJournal } from "./activity.ts";
import type { VocabularyItem } from "./models.ts";
import { learningRank, orderVocabularyForLearning } from "./vocabularyOrder.ts";

export function continueLearning(
  words: VocabularyItem[],
  journal: ActivityJournal,
) {
  words = orderVocabularyForLearning(words);
  const studiedEvents = journal.events.filter(
    (event) =>
      event.kind === "word-studied" && event.contentType === "vocabulary",
  );
  const studied = new Set(studiedEvents.map((event) => event.itemId));
  const latest = [...studiedEvents]
    .reverse()
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .find((event) => words.some((word) => word.id === event.itemId));
  const position = latest
    ? words.findIndex((word) => word.id === latest.itemId) + 1
    : 0;
  const latestWord = latest
    ? words.find((word) => word.id === latest.itemId)
    : undefined;
  // Older imports may have been studied alphabetically. Start with the first
  // remaining priority in the active B1/B2 level, not after an old low rank.
  const hasPriorityOrder =
    latestWord &&
    words.some(
      (word) =>
        word.level === latestWord.level && learningRank(word) !== undefined,
    );
  const priorityNext =
    latestWord && hasPriorityOrder
      ? words.find(
          (word) => word.level === latestWord.level && !studied.has(word.id),
        )
      : undefined;
  const next =
    priorityNext ??
    [...words.slice(position), ...words.slice(0, position)].find(
      (word) => !studied.has(word.id),
    );
  return {
    started: journal.events.some(
      (event) =>
        event.kind === "word-studied" || event.kind === "lesson-completed",
    ),
    next,
    complete: words.length > 0 && !next,
  };
}

export function randomWord(
  words: VocabularyItem[],
  previousId?: string,
  random = Math.random,
) {
  const imported = words.filter((word) => !word.isSample);
  const pool = imported.length ? imported : words;
  const alternatives = pool.filter((word) => word.id !== previousId);
  const choices = alternatives.length ? alternatives : pool;
  return choices[
    Math.min(choices.length - 1, Math.floor(random() * choices.length))
  ];
}

export function vocabularyLabel(item: VocabularyItem) {
  return item.wordType === "noun" && item.article
    ? `${item.article} ${item.dutch.replace(/^(de|het)\s+/i, "")}`
    : item.dutch;
}
