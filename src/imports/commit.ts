import type {
  GrammarTopic,
  ImportedDataset,
  VocabularyItem,
} from "../domain/models.ts";
import type { Curriculum } from "../storage/library.ts";
import {
  grammarKey,
  normalizeKey,
  vocabularyKey,
  type ImportPreview,
} from "./validate.ts";

export function commitPreview(
  curriculum: Curriculum,
  preview: ImportPreview,
  builtins: { vocabulary: VocabularyItem[]; grammar: GrammarTopic[] },
  datasetId: string,
  now = new Date(),
) {
  if (preview.invalid || preview.issues.some((i) => i.severity === "error"))
    throw new Error(
      "Fix all validation errors before importing. Nothing has been saved.",
    );
  const vocabularyKeys = new Set(
    [...builtins.vocabulary, ...curriculum.vocabulary].map(vocabularyKey),
  );
  const grammarKeys = new Set(
    [...builtins.grammar, ...curriculum.grammar].map(grammarKey),
  );
  const grammarIds = new Set(
    [...builtins.grammar, ...curriculum.grammar]
      .flatMap((g) =>
        [g.id, g.sourceLessonId].filter((id): id is string => !!id),
      )
      .map(normalizeKey),
  );
  let skipped = preview.skipped;
  const accepted = preview.items
    .filter((item) => {
      if (preview.kind === "vocabulary") {
        const key = vocabularyKey(item as VocabularyItem);
        if (vocabularyKeys.has(key)) {
          skipped++;
          return false;
        }
        vocabularyKeys.add(key);
        return true;
      }
      const topic = item as GrammarTopic,
        key = grammarKey(topic),
        id = topic.sourceLessonId
          ? normalizeKey(topic.sourceLessonId)
          : undefined;
      if (grammarKeys.has(key) || (id && grammarIds.has(id))) {
        skipped++;
        return false;
      }
      grammarKeys.add(key);
      if (id) grammarIds.add(id);
      return true;
    })
    .map((item, i) => ({ ...item, id: `${datasetId}:${i + 1}`, datasetId }));
  if (!accepted.length)
    return { curriculum, imported: 0, skipped, dataset: null };
  const dataset: ImportedDataset = {
    id: datasetId,
    name: preview.fileName,
    contentType: preview.kind,
    format: preview.format,
    importedAt: now.toISOString(),
    itemCount: accepted.length,
    skippedCount: skipped,
    levels: [...new Set(accepted.map((i) => i.level))],
    status: "active",
  };
  const next: Curriculum = {
    ...curriculum,
    datasets: [...curriculum.datasets, dataset],
    vocabulary:
      preview.kind === "vocabulary"
        ? [...curriculum.vocabulary, ...(accepted as VocabularyItem[])]
        : curriculum.vocabulary,
    grammar:
      preview.kind === "grammar"
        ? [...curriculum.grammar, ...(accepted as GrammarTopic[])]
        : curriculum.grammar,
  };
  return { curriculum: next, imported: accepted.length, skipped, dataset };
}
