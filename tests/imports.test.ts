import assert from "node:assert/strict";
import test from "node:test";
import ExcelJS from "exceljs";
import Papa from "papaparse";
import { grammarTopics, vocabularyItems } from "../src/data/sample-content.ts";
import { emptyActivity, getStatistics } from "../src/domain/activity.ts";
import type { GrammarTopic, VocabularyItem } from "../src/domain/models.ts";
import { commitPreview } from "../src/imports/commit.ts";
import {
  MAX_FILE_BYTES,
  MAX_ROWS,
  readImportFile,
} from "../src/imports/read-file.ts";
import {
  exampleRows,
  fieldsFor,
  type ImportKind,
} from "../src/imports/schema.ts";
import { validateTable, type ParsedTable } from "../src/imports/validate.ts";
import { emptyCurriculum } from "../src/storage/library.ts";

const noExisting = { vocabulary: [], grammar: [] };
const builtins = { vocabulary: vocabularyItems, grammar: grammarTopics };
const csvBuffer = (text: string): ArrayBuffer =>
  new TextEncoder().encode(text).buffer;

function table(
  kind: ImportKind,
  rows: Record<string, string | undefined>[] = exampleRows[kind],
): ParsedTable {
  const headers = fieldsFor(kind).map((field) => field.name);
  return {
    headers,
    rows: rows.map((row, index) => ({
      row: index + 2,
      values: headers.map((header) => row[header] ?? ""),
    })),
    format: "csv",
    warnings: [],
  };
}

function preview(
  kind: ImportKind,
  rows: Record<string, string | undefined>[] = exampleRows[kind],
  existing = noExisting,
) {
  return validateTable(table(kind, rows), kind, `${kind}.csv`, existing);
}

async function workbookBuffer(
  sheets: { name: string; rows: ExcelJS.CellValue[][] }[],
): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  for (const sheet of sheets)
    workbook.addWorksheet(sheet.name).addRows(sheet.rows);
  const buffer = await workbook.xlsx.writeBuffer();
  return Uint8Array.from(new Uint8Array(buffer)).buffer;
}

const matrix = (input: ParsedTable) => [
  input.headers,
  ...input.rows.map((row) => row.values),
];

for (const kind of ["vocabulary", "grammar"] as const) {
  for (const format of ["csv", "xlsx"] as const) {
    test(`${kind} ${format} examples parse into importable records`, async () => {
      const input = table(kind);
      const buffer =
        format === "csv"
          ? csvBuffer(Papa.unparse(matrix(input)))
          : await workbookBuffer([
              {
                name: kind === "grammar" ? "Lessons" : "Vocabulary",
                rows: matrix(input),
              },
            ]);
      const parsed = await readImportFile(`example.${format}`, buffer, kind);
      const result = validateTable(
        parsed,
        kind,
        `example.${format}`,
        noExisting,
      );
      assert.equal(result.format, format);
      assert.equal(result.total, exampleRows[kind].length);
      assert.equal(result.valid, result.total);
      assert.equal(result.invalid, 0);
      assert.equal(result.skipped, 0);
      assert.equal(result.items.length, result.total);
      assert.ok(result.items.every((item) => item.isSample));
    });
  }
}

test("CSV UTF-8, BOM, quoted commas, escaped quotes and multiline cells survive parsing", async () => {
  const text =
    '\uFEFFdutch,english,cefr_level,word_type,notes\r\n"hé, daar","hey, there",A1,expression,"Say ""hé"".\nA second line with café."\r\n';
  const parsed = await readImportFile(
    "quoted.CSV",
    csvBuffer(text),
    "vocabulary",
  );
  const result = validateTable(parsed, "vocabulary", "quoted.CSV", noExisting);
  assert.equal(result.invalid, 0);
  assert.equal(result.items.length, 1);
  const item = result.items[0] as VocabularyItem;
  assert.equal(item.dutch, "hé, daar");
  assert.equal(item.english, "hey, there");
  assert.equal(item.notes, 'Say "hé".\nA second line with café.');
});

test("noun, verb and adjective optional fields retain their meaning", () => {
  const rows = exampleRows.vocabulary.slice(0, 3).map((row) => ({ ...row }));
  rows[0].diminutive = "tafeltje";
  rows[0].tags = "home; furniture";
  rows[0].notes = "A piece of furniture.";
  const result = preview("vocabulary", rows);
  assert.equal(result.invalid, 0);
  const [noun, verb, adjective] = result.items as VocabularyItem[];
  assert.equal(noun.wordType, "noun");
  assert.ok(noun.wordType === "noun");
  assert.equal(noun.article, "de");
  assert.equal(noun.plural, "tafels");
  assert.equal(noun.diminutive, "tafeltje");
  assert.deepEqual(noun.tags, ["home", "furniture"]);
  assert.equal(noun.notes, "A piece of furniture.");
  assert.ok(verb.wordType === "verb");
  assert.equal(verb.regular, true);
  assert.equal(verb.separable, false);
  assert.equal(verb.auxiliary, "hebben");
  assert.equal(verb.pastParticiple, "geleerd");
  assert.equal("article" in verb, false);
  assert.ok(adjective.wordType === "adjective");
  assert.equal(adjective.inflected, "nieuwe");
  assert.equal(adjective.comparative, "nieuwer");
  assert.equal(adjective.superlative, "nieuwst");
});

test("grammar text, examples, ordering and notes survive without invented exercises", () => {
  const row: Record<string, string> = {
    ...exampleRows.grammar[0],
    rule: "First rule.\nSecond rule.",
    common_mistake: "First mistake.\r\nSecond mistake.",
    notes: "A usage note.\nAnother note.",
    sort_order: "0",
  };
  const result = preview("grammar", [row]);
  assert.equal(result.invalid, 0);
  const lesson = result.items[0] as GrammarTopic;
  assert.equal(lesson.sourceLessonId, row.lesson_id);
  assert.equal(lesson.objective, row.learning_objective);
  assert.equal(lesson.explanation, row.explanation);
  assert.deepEqual(lesson.rules, ["First rule.", "Second rule."]);
  assert.deepEqual(lesson.commonMistakes, [
    "First mistake.",
    "Second mistake.",
  ]);
  assert.deepEqual(lesson.usageNotes, ["A usage note.", "Another note."]);
  assert.equal(lesson.examples.length, 2);
  assert.equal(lesson.examples[1].english, row.example_english_2);
  assert.equal(lesson.sortOrder, 0);
  assert.equal(lesson.estimatedMinutes, 3);
  assert.deepEqual(lesson.questions, []);
});

test("all supported CEFR levels import and level/header case is normalized", () => {
  for (const kind of ["vocabulary", "grammar"] as const) {
    const rows = ["A1", "A2", "B1", "B2", "C1"].map((level) => ({
      ...exampleRows[kind][0],
      cefr_level: level.toLowerCase(),
      lesson_id: `lesson-${level}`,
    }));
    // Vocabulary does not accept a grammar-only lesson_id column.
    const input = table(kind, rows);
    input.headers = input.headers.map((name) => ` ${name.toUpperCase()} `);
    const result = validateTable(input, kind, "levels.csv", noExisting);
    assert.equal(result.invalid, 0);
    assert.deepEqual(
      result.items.map((item) => item.level),
      ["A1", "A2", "B1", "B2", "C1"],
    );
  }
});

test("minimal vocabulary and grammar rows accept empty optional fields", () => {
  const vocabulary = preview("vocabulary", [
    {
      dutch: "bijna",
      english: "almost",
      cefr_level: "A2",
      word_type: "adverb",
    },
  ]);
  assert.equal(vocabulary.invalid, 0);
  assert.equal(vocabulary.items[0].isSample, false);
  assert.deepEqual((vocabulary.items[0] as VocabularyItem).example, {
    dutch: "",
    english: "",
  });
  const grammar = preview("grammar", [
    {
      title: "Simple lesson",
      cefr_level: "A1",
      explanation: "An explanation.",
    },
  ]);
  assert.equal(grammar.invalid, 0);
  const lesson = grammar.items[0] as GrammarTopic;
  assert.equal(lesson.estimatedMinutes, 5);
  assert.deepEqual(lesson.questions, []);
  assert.deepEqual(lesson.examples, []);
});

test("required columns and cells produce row and column errors for both import kinds", () => {
  for (const kind of ["vocabulary", "grammar"] as const) {
    for (const field of fieldsFor(kind).filter((field) => field.required)) {
      const input = table(kind, [exampleRows[kind][0]]);
      const index = input.headers.indexOf(field.name);
      input.headers.splice(index, 1);
      input.rows[0].values.splice(index, 1);
      const missingHeader = validateTable(
        input,
        kind,
        "missing.csv",
        noExisting,
      );
      assert.ok(
        missingHeader.issues.some(
          (issue) =>
            issue.row === 1 &&
            issue.column === field.name &&
            issue.severity === "error",
        ),
      );
      assert.equal(missingHeader.items.length, 0);
      const missingCell = preview(kind, [
        { ...exampleRows[kind][0], [field.name]: "   " },
      ]);
      assert.equal(missingCell.invalid, 1);
      assert.ok(
        missingCell.issues.some(
          (issue) =>
            issue.row === 2 &&
            issue.column === field.name &&
            issue.severity === "error",
        ),
      );
    }
  }
});

test("unknown, duplicate and empty headers block the complete import", () => {
  for (const header of ["unknown_field", "dutch", ""]) {
    const input = table("vocabulary");
    input.headers.push(header);
    const result = validateTable(
      input,
      "vocabulary",
      "headers.csv",
      noExisting,
    );
    assert.equal(result.items.length, 0);
    assert.equal(result.invalid, result.total);
    assert.ok(result.issues.some((issue) => issue.row === 1));
  }
});

test("bad row values are rejected with actionable locations, and a mixed preview cannot commit", () => {
  const badValues = [
    { cefr_level: "C2" },
    { word_type: "substantive" },
    { article: "een" },
    { plural: "tafels", word_type: "verb" },
    { example_english: "" },
    { is_sample: "perhaps" },
    { notes: "x".repeat(20001) },
  ];
  for (const badValue of badValues) {
    const result = preview("vocabulary", [
      exampleRows.vocabulary[1],
      { ...exampleRows.vocabulary[0], ...badValue },
    ]);
    assert.equal(result.valid, 1);
    assert.equal(result.invalid, 1);
    assert.ok(
      result.issues.some(
        (issue) => issue.row === 3 && issue.severity === "error",
      ),
    );
    assert.throws(
      () => commitPreview(emptyCurriculum(), result, builtins, "blocked"),
      /Fix all validation errors/,
    );
  }
  for (const badValue of [
    { regularity: "maybe" },
    { separable: "2" },
    { auxiliary: "worden" },
  ]) {
    assert.equal(
      preview("vocabulary", [{ ...exampleRows.vocabulary[1], ...badValue }])
        .invalid,
      1,
    );
  }
  for (const badValue of [
    { cefr_level: "A0" },
    { sort_order: "1.5" },
    { estimated_minutes: "121" },
    { example_english_1: "" },
  ]) {
    assert.equal(
      preview("grammar", [{ ...exampleRows.grammar[0], ...badValue }]).invalid,
      1,
    );
  }
});

test("an empty template gives guidance and does not create a dataset", async () => {
  for (const kind of ["vocabulary", "grammar"] as const) {
    const result = preview(kind, []);
    assert.equal(result.total, 0);
    assert.equal(result.items.length, 0);
    assert.match(result.issues[0].message, /Fill in the template/);
    assert.throws(
      () => commitPreview(emptyCurriculum(), result, builtins, "empty"),
      /Fix all validation errors/,
    );
  }
});

test("duplicate words skip existing built-ins, imported words and repeated normalized file rows", () => {
  const original = vocabularyItems[0];
  const imported = preview("vocabulary").items[0] as VocabularyItem;
  const rows = [
    {
      dutch: ` ${original.dutch.toUpperCase()} `,
      english: "A changed meaning",
      cefr_level: original.level,
      word_type: original.wordType,
    },
    { ...exampleRows.vocabulary[0], dutch: " TAFEL " },
    {
      dutch: "bijna",
      english: "almost",
      cefr_level: "A2",
      word_type: "adverb",
    },
    {
      dutch: " BIJNA  ",
      english: "changed",
      cefr_level: "A2",
      word_type: "adverb",
    },
  ];
  const snapshot = JSON.stringify([original, imported]);
  const result = validateTable(
    table("vocabulary", rows),
    "vocabulary",
    "duplicates.csv",
    { vocabulary: [...vocabularyItems, imported], grammar: grammarTopics },
  );
  assert.equal(result.valid, 4);
  assert.equal(result.invalid, 0);
  assert.equal(result.skipped, 3);
  assert.equal(result.items.length, 1);
  assert.equal((result.items[0] as VocabularyItem).english, "almost");
  assert.equal(JSON.stringify([original, imported]), snapshot);
});

test("noun articles and Unicode whitespace/case variants are normalized before duplicate checks", () => {
  const rows = [
    { ...exampleRows.vocabulary[0], dutch: "de tafel" },
    { ...exampleRows.vocabulary[0], dutch: " DE   TAFEL " },
    { dutch: "café", english: "cafe", cefr_level: "A1", word_type: "noun" },
    {
      dutch: "CAFE\u0301",
      english: "duplicate",
      cefr_level: "A1",
      word_type: "noun",
    },
  ];
  const result = preview("vocabulary", rows);
  assert.equal(result.invalid, 0);
  assert.equal(result.skipped, 2);
  assert.equal((result.items[0] as VocabularyItem).dutch, "tafel");
  assert.ok(
    result.issues.some((issue) => /repeated article/.test(issue.message)),
  );
});

test("grammar duplicates use stable IDs or normalized title and level and preserve existing questions", () => {
  const original = grammarTopics[0];
  const existing = { vocabulary: vocabularyItems, grammar: [original] };
  const originalSnapshot = JSON.stringify(original);
  const rows = [
    {
      ...exampleRows.grammar[0],
      lesson_id: ` ${original.id.toUpperCase()} `,
      title: "A renamed lesson",
    },
    {
      ...exampleRows.grammar[0],
      lesson_id: "different-id",
      title: `  ${original.title.toUpperCase()} `,
      cefr_level: original.level,
    },
    exampleRows.grammar[0],
    {
      ...exampleRows.grammar[0],
      title: "Duplicate source id",
      lesson_id: " EXAMPLE-NIET ",
    },
  ];
  const result = validateTable(
    table("grammar", rows),
    "grammar",
    "grammar.csv",
    existing,
  );
  assert.equal(result.skipped, 3);
  assert.equal(result.items.length, 1);
  assert.equal(JSON.stringify(original), originalSnapshot);
  assert.ok(original.questions.length > 0);
});

test("preview and cancellation leave input curriculum, activity and statistics unchanged", () => {
  const curriculum = emptyCurriculum();
  const activity = emptyActivity();
  const before = JSON.stringify({
    curriculum,
    activity,
    statistics: getStatistics(activity),
  });
  const result = preview("vocabulary");
  assert.equal(result.items.length, 4);
  // Cancel is discarding this pure preview: only the confirmation path calls commitPreview/writeCurriculum.
  assert.equal(
    JSON.stringify({
      curriculum,
      activity,
      statistics: getStatistics(activity),
    }),
    before,
  );
});

test("confirmation creates dataset metadata while retaining curriculum and untouched progress", () => {
  const activity = emptyActivity();
  const statsBefore = getStatistics(activity);
  const original = emptyCurriculum();
  const now = new Date("2026-09-07T12:00:00.000Z");
  const result = commitPreview(
    original,
    preview("vocabulary"),
    builtins,
    "dataset-one",
    now,
  );
  assert.equal(result.imported, 4);
  assert.equal(result.skipped, 0);
  assert.equal(original.vocabulary.length, 0);
  assert.ok(
    result.curriculum.vocabulary.every(
      (item) => item.datasetId === "dataset-one",
    ),
  );
  assert.equal(
    new Set(result.curriculum.vocabulary.map((item) => item.id)).size,
    4,
  );
  assert.deepEqual(result.dataset, {
    id: "dataset-one",
    name: "vocabulary.csv",
    contentType: "vocabulary",
    format: "csv",
    importedAt: now.toISOString(),
    itemCount: 4,
    skippedCount: 0,
    levels: ["A1"],
    status: "active",
  });
  assert.deepEqual(getStatistics(activity), statsBefore);
});

test("confirmation rechecks a stale preview and prevents duplicate datasets or overwritten lessons", () => {
  for (const kind of ["vocabulary", "grammar"] as const) {
    const stale = preview(kind);
    const first = commitPreview(
      emptyCurriculum(),
      stale,
      builtins,
      `first-${kind}`,
    );
    const snapshot = JSON.stringify(first.curriculum);
    const second = commitPreview(
      first.curriculum,
      stale,
      builtins,
      `second-${kind}`,
    );
    assert.equal(second.imported, 0);
    assert.equal(second.skipped, stale.items.length);
    assert.equal(second.dataset, null);
    assert.equal(second.curriculum, first.curriculum);
    assert.equal(JSON.stringify(first.curriculum), snapshot);
  }
});

test("CSV rejects malformed quoting, non-UTF-8, binary, unsupported, empty and oversized input", async () => {
  const failures: [string, ArrayBuffer, RegExp][] = [
    ["empty.csv", new ArrayBuffer(0), /empty/],
    ["wrong.txt", csvBuffer("a,b"), /Choose a CSV/],
    ["fake.xlsx", csvBuffer("a,b\nx,y"), /not an XLSX/],
    ["broken.csv", csvBuffer('dutch,english\n"unclosed,value'), /CSV row/],
    ["invalid.csv", Uint8Array.from([0xc3, 0x28]).buffer, /not valid UTF-8/],
    ["binary.csv", Uint8Array.from([65, 0, 66]).buffer, /UTF-8 CSV/],
    ["large.csv", new ArrayBuffer(MAX_FILE_BYTES + 1), /5 MiB/],
    ["blank.csv", csvBuffer("\r\n  \r\n"), /No headers or data/],
    [
      "leading-blank.csv",
      csvBuffer("\ndutch,english\ntafel,table"),
      /first row/,
    ],
  ];
  for (const [name, buffer, message] of failures) {
    await assert.rejects(
      readImportFile(name, buffer, "vocabulary"),
      message,
      name,
    );
  }
  const zipped = await workbookBuffer([
    { name: "Vocabulary", rows: matrix(table("vocabulary")) },
  ]);
  await assert.rejects(
    readImportFile("renamed.csv", zipped, "vocabulary"),
    /UTF-8 CSV/,
  );
  await assert.rejects(
    readImportFile(
      "broken.xlsx",
      Uint8Array.from([0x50, 0x4b, 1, 2]).buffer,
      "vocabulary",
    ),
    /complete XLSX/,
  );
});

test("CSV limits reject more than 5,000 records and more than 64 headers", async () => {
  const tooManyRows =
    "dutch,english,cefr_level,word_type\n" +
    Array.from(
      { length: MAX_ROWS + 1 },
      (_, i) => `word${i},meaning,A1,noun`,
    ).join("\n");
  await assert.rejects(
    readImportFile("rows.csv", csvBuffer(tooManyRows), "vocabulary"),
    /at most 5000 records/,
  );
  const tooManyColumns = Array.from(
    { length: 65 },
    (_, i) => `column${i}`,
  ).join(",");
  await assert.rejects(
    readImportFile("columns.csv", csvBuffer(tooManyColumns), "vocabulary"),
    /64 columns/,
  );
  const tooWideDataRow =
    "dutch,english,cefr_level,word_type\n" +
    Array.from({ length: 65 }, (_, i) =>
      i < 4 ? ["tafel", "table", "A1", "noun"][i] : "",
    ).join(",");
  await assert.rejects(
    readImportFile("wide-data.csv", csvBuffer(tooWideDataRow), "vocabulary"),
    /64 columns/,
  );
});

test("XLSX selects the named Vocabulary or Lessons sheet and reports other sheets", async () => {
  const buffer = await workbookBuffer([
    { name: "Instructions", rows: [["Ignore this sheet"]] },
    { name: "VOCABULARY", rows: matrix(table("vocabulary")) },
    { name: "Lessons", rows: matrix(table("grammar")) },
  ]);
  for (const kind of ["vocabulary", "grammar"] as const) {
    const result = await readImportFile("combined.xlsx", buffer, kind);
    assert.deepEqual(
      result.headers,
      fieldsFor(kind).map((field) => field.name),
    );
    assert.equal(result.rows.length, exampleRows[kind].length);
    assert.equal(result.warnings.length, 1);
    assert.match(result.warnings[0], /Other worksheets are not imported/);
  }
});

test("XLSX falls back to the first nonempty sheet and rejects a blank workbook", async () => {
  const buffer = await workbookBuffer([
    { name: "Empty", rows: [] },
    { name: "My words", rows: matrix(table("vocabulary")) },
  ]);
  const result = await readImportFile("fallback.xlsx", buffer, "vocabulary");
  assert.equal(result.rows.length, 4);
  assert.match(result.warnings[0], /My words/);
  const empty = await workbookBuffer([{ name: "Empty", rows: [] }]);
  await assert.rejects(
    readImportFile("blank.xlsx", empty, "vocabulary"),
    /has no data/,
  );
});

test("XLSX formulas are blocked even with a cached text or numeric result", async () => {
  for (const cell of [
    { formula: '"tafel"', result: "tafel" },
    { formula: "1+1", result: 2 },
  ]) {
    const rows: ExcelJS.CellValue[][] = [
      ["dutch", "english", "cefr_level", "word_type"],
      [cell, "table", "A1", "noun"],
    ];
    const buffer = await workbookBuffer([{ name: "Vocabulary", rows }]);
    await assert.rejects(
      readImportFile("formulas.xlsx", buffer, "vocabulary"),
      /Row 2, column 1: formulas are not imported/,
    );
  }
});

test("XLSX links, rich text, date and error cells are blocked instead of silently changing text", async () => {
  const cells: ExcelJS.CellValue[] = [
    { text: "tafel", hyperlink: "https://example.com" },
    { richText: [{ text: "tafel" }] },
    new Date("2026-09-07T12:00:00.000Z"),
    { error: "#VALUE!" },
  ];
  for (const cell of cells) {
    const buffer = await workbookBuffer([
      {
        name: "Vocabulary",
        rows: [
          ["dutch", "english", "cefr_level", "word_type"],
          [cell, "table", "A1", "noun"],
        ],
      },
    ]);
    await assert.rejects(
      readImportFile("typed-cells.xlsx", buffer, "vocabulary"),
      /Row 2, column 1: use plain text or numbers/,
    );
  }
});

test("XLSX enforces row/column bounds and first-row headers", async () => {
  const manyRows: ExcelJS.CellValue[][] = [
    ["dutch", "english", "cefr_level", "word_type"],
    ...Array.from({ length: MAX_ROWS + 1 }, (_, i) => [
      `word${i}`,
      "meaning",
      "A1",
      "noun",
    ]),
  ];
  await assert.rejects(
    readImportFile(
      "rows.xlsx",
      await workbookBuffer([{ name: "Vocabulary", rows: manyRows }]),
      "vocabulary",
    ),
    /at most 5000 records/,
  );
  await assert.rejects(
    readImportFile(
      "columns.xlsx",
      await workbookBuffer([
        {
          name: "Vocabulary",
          rows: [Array.from({ length: 65 }, (_, i) => `column${i}`)],
        },
      ]),
      "vocabulary",
    ),
    /64 columns/,
  );
  await assert.rejects(
    readImportFile(
      "blank-first.xlsx",
      await workbookBuffer([
        { name: "Vocabulary", rows: [[], ...matrix(table("vocabulary"))] },
      ]),
      "vocabulary",
    ),
    /first worksheet row/,
  );
});

test("XLSX container guard rejects encrypted entries and exaggerated decompressed sizes before loading", async () => {
  const buffer = await workbookBuffer([
    { name: "Vocabulary", rows: matrix(table("vocabulary")) },
  ]);
  const changed = (
    mutate: (data: DataView, offset: number) => void,
  ): ArrayBuffer => {
    const copy = buffer.slice(0);
    const data = new DataView(copy);
    for (let offset = 0; offset < copy.byteLength - 46; offset++) {
      if (data.getUint32(offset, true) === 0x02014b50) {
        mutate(data, offset);
        return copy;
      }
    }
    throw new Error("Test workbook lacks a ZIP central-directory entry");
  };
  const encrypted = changed((data, offset) =>
    data.setUint16(offset + 8, 1, true),
  );
  await assert.rejects(
    readImportFile("encrypted.xlsx", encrypted, "vocabulary"),
    /Password-protected/,
  );
  const oversized = changed((data, offset) =>
    data.setUint32(offset + 24, 26 * 1024 * 1024, true),
  );
  await assert.rejects(
    readImportFile("expanded.xlsx", oversized, "vocabulary"),
    /25 MiB limit/,
  );
});
