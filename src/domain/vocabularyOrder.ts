import { vocabularyLearningRanks } from "../data/vocabulary-learning-ranks.ts";
import type { VocabularyItem } from "./models.ts";

/** Read-only learning_rank, independent of import row numbers and learner IDs. */
export function learningRank(item: VocabularyItem): number | undefined {
  if (item.level !== "B1" && item.level !== "B2") return undefined;
  const headword = item.dutch
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("nl");
  return vocabularyLearningRanks[`${item.level}|${headword}|${item.wordType}`];
}

/** Replace only ranked slots within each level, without mutating any record.
 * A1/A2/C1 and unmatched custom words keep their positions and relative order.
 * Every supported B1/B2 dataset entry has an explicit rank; no A–Z fallback.
 */
export function orderVocabularyForLearning(
  words: VocabularyItem[],
): VocabularyItem[] {
  const result = [...words];
  for (const level of ["B1", "B2"]) {
    const slots: number[] = [];
    const entries: { item: VocabularyItem; rank: number; position: number }[] =
      [];
    words.forEach((item, position) => {
      if (item.level !== level) return;
      const rank = learningRank(item);
      if (rank === undefined) return;
      slots.push(position);
      entries.push({ item, rank, position });
    });
    entries.sort((a, b) => a.rank - b.rank || a.position - b.position);
    slots.forEach((slot, i) => {
      result[slot] = entries[i].item;
    });
  }
  return result;
}
