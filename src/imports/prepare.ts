import { readImportFile } from "./read-file.ts";
import type { ImportKind } from "./schema.ts";
import { validateTable } from "./validate.ts";

// Infer only unambiguous schemas. Mixed or incomplete headers still go through
// normal validation; filenames and CEFR levels never determine content type.
export function detectImportKind(headers: string[]): ImportKind | null {
  const names = new Set(headers.map((header) => header.trim().toLowerCase()));
  const vocabulary = ["dutch", "english", "word_type"].every((name) =>
    names.has(name),
  );
  const grammar = ["title", "explanation"].every((name) => names.has(name));
  if (vocabulary === grammar) return null;
  return vocabulary ? "vocabulary" : "grammar";
}

export async function prepareImport(
  name: string,
  buffer: ArrayBuffer,
  selectedKind: ImportKind,
  existing: Parameters<typeof validateTable>[3],
) {
  const table = await readImportFile(name, buffer, selectedKind);
  const kind = detectImportKind(table.headers) ?? selectedKind;
  const preview = validateTable(table, kind, name, existing);
  if (kind !== selectedKind)
    preview.warnings.unshift(
      `Detected ${kind} columns. Switched to ${kind} import. Review the preview before confirming.`,
    );
  return preview;
}
