import type {
  CEFRLevel,
  GrammarTopic,
  VocabularyItem,
  WordType,
} from "../domain/models.ts";
import { fieldsFor, type ImportKind } from "./schema.ts";

export type ImportIssue = {
  row: number;
  column: string;
  value?: string;
  message: string;
  severity: "error" | "warning";
};
export type TableRow = { row: number; values: string[] };
export type ParsedTable = {
  headers: string[];
  rows: TableRow[];
  format: "csv" | "xlsx";
  warnings: string[];
};
export type ImportPreview = {
  kind: ImportKind;
  fileName: string;
  format: "csv" | "xlsx";
  total: number;
  valid: number;
  invalid: number;
  skipped: number;
  items: (VocabularyItem | GrammarTopic)[];
  issues: ImportIssue[];
  warnings: string[];
};
const levels = ["A1", "A2", "B1", "B2", "C1"];
const types = [
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
];
export const normalizeKey = (value: string) =>
  value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("nl");
export const vocabularyKey = (item: VocabularyItem) =>
  `${normalizeKey(item.dutch)}|${item.wordType}|${item.level}`;
export const grammarKey = (item: GrammarTopic) =>
  `${normalizeKey(item.title)}|${item.level}`;
const lines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((v) => v.trim())
    .filter(Boolean);

export function validateTable(
  table: ParsedTable,
  kind: ImportKind,
  fileName: string,
  existing: { vocabulary: VocabularyItem[]; grammar: GrammarTopic[] },
): ImportPreview {
  const preview: ImportPreview = {
    kind,
    fileName,
    format: table.format,
    total: table.rows.length,
    valid: 0,
    invalid: 0,
    skipped: 0,
    items: [],
    issues: [],
    warnings: [...table.warnings],
  };
  const issue = (
    row: number,
    column: string,
    message: string,
    value?: string,
    severity: "error" | "warning" = "error",
  ) => preview.issues.push({ row, column, message, value, severity });
  const headers = table.headers.map((h) => h.trim().toLowerCase());
  const fields = fieldsFor(kind);
  for (const field of fields.filter((f) => f.required))
    if (!headers.includes(field.name))
      issue(
        1,
        field.name,
        "Required column is missing. Download the current template.",
      );
  for (const [i, header] of headers.entries()) {
    if (!header) issue(1, `Column ${i + 1}`, "Column header is empty.");
    else if (headers.indexOf(header) !== i)
      issue(1, header, "Duplicate column header.");
    else if (!fields.some((f) => f.name === header))
      issue(1, header, "Unknown column. Check its spelling or remove it.");
  }
  if (preview.issues.length) {
    preview.invalid = table.rows.length;
    return preview;
  }
  if (!table.rows.length) {
    issue(
      1,
      "file",
      "No data rows found. Fill in the template before importing.",
    );
    return preview;
  }
  const keys = new Set(
    kind === "vocabulary"
      ? existing.vocabulary.map(vocabularyKey)
      : existing.grammar.map(grammarKey),
  );
  const lessonIds = new Set(
    existing.grammar
      .flatMap((g) =>
        [g.id, g.sourceLessonId].filter((id): id is string => !!id),
      )
      .map(normalizeKey),
  );
  for (const row of table.rows) {
    const before = preview.issues.length;
    const values = Object.fromEntries(
      headers.map((h, i) => [h, (row.values[i] ?? "").trim().normalize("NFC")]),
    );
    const get = (key: string) => values[key] ?? "";
    for (const field of fields.filter((f) => f.required))
      if (!get(field.name))
        issue(row.row, field.name, "This value is required.");
    if (
      row.values.length > headers.length &&
      row.values.slice(headers.length).some(Boolean)
    )
      issue(
        row.row,
        "row",
        "More values than headers. Check quoting and separators.",
      );
    for (const [column, value] of Object.entries(values))
      if (value.length > 20000)
        issue(row.row, column, "This cell exceeds 20,000 characters.");
    const level = get("cefr_level").toUpperCase();
    if (get("cefr_level") && !levels.includes(level))
      issue(
        row.row,
        "cefr_level",
        "Expected A1, A2, B1, B2 or C1.",
        get("cefr_level"),
      );
    const boolean = (column: string): boolean | undefined => {
      const v = get(column).toLowerCase();
      if (!v) return undefined;
      if (v === "true" || v === "yes") return true;
      if (v === "false" || v === "no") return false;
      issue(row.row, column, "Expected true or false.", get(column));
      return undefined;
    };
    const isSample = boolean("is_sample") ?? false;
    const pair = (dutch: string, english: string) => {
      if (!!get(dutch) !== !!get(english))
        issue(
          row.row,
          !get(dutch) ? dutch : english,
          "Provide both the Dutch example and its English translation.",
        );
      return { dutch: get(dutch), english: get(english) };
    };
    let item: VocabularyItem | GrammarTopic;
    if (kind === "vocabulary") {
      const wordType = get("word_type").toLowerCase();
      if (get("word_type") && !types.includes(wordType))
        issue(
          row.row,
          "word_type",
          `Expected one of: ${types.join(", ")}.`,
          get("word_type"),
        );
      for (const [type, columns] of Object.entries({
        noun: ["article", "plural", "diminutive"],
        verb: ["regularity", "separable", "auxiliary", "past_participle"],
        adjective: ["inflected", "comparative", "superlative"],
      }))
        if (wordType !== type)
          for (const column of columns)
            if (get(column))
              issue(
                row.row,
                column,
                `This field is only for ${type}s. Leave it empty for ${wordType}.`,
                get(column),
              );
      const article = get("article").toLowerCase();
      if (article && !["de", "het"].includes(article))
        issue(row.row, "article", "Expected de or het.", article);
      const regularity = get("regularity").toLowerCase();
      if (regularity && !["regular", "irregular"].includes(regularity))
        issue(
          row.row,
          "regularity",
          "Expected regular or irregular.",
          regularity,
        );
      const auxiliary = get("auxiliary").toLowerCase();
      if (auxiliary && !["hebben", "zijn", "hebben / zijn"].includes(auxiliary))
        issue(
          row.row,
          "auxiliary",
          "Expected hebben, zijn or hebben / zijn.",
          auxiliary,
        );
      let dutch = get("dutch");
      if (
        wordType === "noun" &&
        article &&
        normalizeKey(dutch).startsWith(article + " ")
      ) {
        dutch = dutch.slice(article.length + 1).trim();
        issue(
          row.row,
          "dutch",
          "The repeated article was removed from the Dutch term.",
          get("dutch"),
          "warning",
        );
      }
      if (!dutch)
        issue(row.row, "dutch", "Provide a Dutch term after the article.");
      item = {
        id: `pending:${row.row}`,
        dutch,
        english: get("english"),
        level: level as CEFRLevel,
        wordType: wordType as WordType,
        topic: get("topic") || "Imported vocabulary",
        example: pair("example_dutch", "example_english"),
        isSample,
        notes: get("notes") || undefined,
        tags: get("tags")
          ? get("tags")
              .split(";")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
      } as VocabularyItem;
      if (item.wordType === "noun")
        Object.assign(item, {
          article: article || undefined,
          plural: get("plural") || undefined,
          diminutive: get("diminutive") || undefined,
        });
      if (item.wordType === "verb")
        Object.assign(item, {
          regular: regularity ? regularity === "regular" : undefined,
          separable: boolean("separable"),
          auxiliary: auxiliary || undefined,
          pastParticiple: get("past_participle") || undefined,
        });
      if (item.wordType === "adjective")
        Object.assign(item, {
          inflected: get("inflected") || undefined,
          comparative: get("comparative") || undefined,
          superlative: get("superlative") || undefined,
        });
    } else {
      const examples = [
        pair("example_dutch_1", "example_english_1"),
        pair("example_dutch_2", "example_english_2"),
      ].filter((e) => e.dutch || e.english);
      const order = get("sort_order");
      const minutes = get("estimated_minutes");
      if (
        order &&
        (!/^\d+$/.test(order) || !Number.isSafeInteger(Number(order)))
      )
        issue(
          row.row,
          "sort_order",
          "Expected a nonnegative whole number.",
          order,
        );
      if (
        minutes &&
        (!/^\d+$/.test(minutes) || Number(minutes) < 1 || Number(minutes) > 120)
      )
        issue(
          row.row,
          "estimated_minutes",
          "Expected a whole number from 1 to 120.",
          minutes,
        );
      item = {
        id: `pending:${row.row}`,
        sourceLessonId: get("lesson_id") || undefined,
        title: get("title"),
        level: level as CEFRLevel,
        category: get("category") || "General grammar",
        objective: get("learning_objective") || get("title"),
        summary:
          get("summary") ||
          get("learning_objective") ||
          get("explanation").slice(0, 160),
        explanation: get("explanation"),
        rules: lines(get("rule")),
        commonMistakes: lines(get("common_mistake")),
        examples,
        questions: [],
        estimatedMinutes: minutes ? Number(minutes) : 5,
        isSample,
        usageNotes: lines(get("notes")),
        sortOrder: order ? Number(order) : undefined,
      };
    }
    if (preview.issues.slice(before).some((i) => i.severity === "error")) {
      preview.invalid++;
      continue;
    }
    preview.valid++;
    const key =
      kind === "vocabulary"
        ? vocabularyKey(item as VocabularyItem)
        : grammarKey(item as GrammarTopic);
    const sourceId =
      kind === "grammar" ? (item as GrammarTopic).sourceLessonId : undefined;
    if (keys.has(key) || (sourceId && lessonIds.has(normalizeKey(sourceId)))) {
      preview.skipped++;
      issue(
        row.row,
        sourceId ? "lesson_id" : kind === "vocabulary" ? "dutch" : "title",
        "Duplicate skipped. Existing content will remain unchanged.",
        sourceId ?? ("dutch" in item ? item.dutch : item.title),
        "warning",
      );
      continue;
    }
    keys.add(key);
    if (sourceId) lessonIds.add(normalizeKey(sourceId));
    preview.items.push(item);
  }
  return preview;
}
