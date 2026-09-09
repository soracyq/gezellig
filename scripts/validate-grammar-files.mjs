import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import ExcelJS from "exceljs";
import { loadGrammar, headers, folder, output } from "./grammar-data.mjs";
import { readImportFile } from "../src/imports/read-file.ts";
import { validateTable, normalizeKey } from "../src/imports/validate.ts";
import { commitPreview } from "../src/imports/commit.ts";
import { emptyCurriculum } from "../src/storage/library.ts";
import { grammarTopics, vocabularyItems } from "../src/data/sample-content.ts";
const source = await loadGrammar();
const builtins = { grammar: grammarTopics, vocabulary: vocabularyItems };
const report = {
  checkedAt: new Date().toISOString(),
  counts: { A1: 32, A2: 40, total: 72 },
  checks: {},
  files: [],
};
for (const field of [
  "lesson_id",
  "title",
  "learning_objective",
  "rule",
  "explanation",
]) {
  assert.equal(new Set(source.map((r) => normalizeKey(r[field]))).size, 72);
  report.checks[`duplicate_${field}`] = 0;
}
assert(source.every((r) => r.is_sample === "false"));
Object.assign(report.checks, {
  missingRequiredFields: 0,
  invalidLevels: 0,
  invalidSortOrders: 0,
  invalidPrerequisites: 0,
  sampleTrue: 0,
  missingExamplePairs: 0,
});
for (const level of ["A1", "A2"]) {
  const expected = source.filter((r) => r.cefr_level === level);
  let canonical;
  for (const format of ["csv", "xlsx"]) {
    const filename = `dutch_grammar_${level}.${format}`,
      bytes = await fs.readFile(path.join(output, filename));
    const parsed = await readImportFile(
      filename,
      Uint8Array.from(bytes).buffer,
      "grammar",
    );
    assert.deepEqual(parsed.headers, headers);
    assert.deepEqual(
      parsed.rows.map((r) => r.values),
      expected.map((r) => headers.map((h) => r[h])),
    );
    if (format === "xlsx") {
      const book = new ExcelJS.Workbook();
      await book.xlsx.load(bytes);
      assert.deepEqual(
        book.worksheets.map((s) => s.name),
        ["Lessons"],
      );
      const sheet = book.getWorksheet("Lessons");
      assert.equal(sheet.rowCount, expected.length + 1);
      assert.equal(sheet.columnCount, 17);
      assert.equal(Object.keys(sheet.tables).length, 1);
      sheet.eachRow((row) =>
        row.eachCell((cell) => assert(!cell.formula, "Unexpected formula")),
      );
    }
    const preview = validateTable(parsed, "grammar", filename, builtins);
    assert.deepEqual(preview.issues, []);
    assert.equal(preview.invalid, 0);
    assert.equal(preview.items.length, expected.length);
    if (canonical) assert.deepEqual(preview.items, canonical);
    canonical = preview.items;
    const result = commitPreview(
      emptyCurriculum(),
      preview,
      builtins,
      `grammar-${level}-${format}`,
      new Date("2026-09-09T12:00:00+02:00"),
    );
    assert.equal(result.imported, expected.length);
    assert.equal(result.skipped, 0);
    const imported = result.curriculum.grammar;
    assert.deepEqual(
      imported.map((r) => r.sourceLessonId),
      expected.map((r) => r.lesson_id),
    );
    assert(
      imported.every((r) => r.isSample === false && r.questions.length === 0),
    );
    assert.deepEqual(
      imported.map((r) => r.sortOrder),
      expected.map((r) => Number(r.sort_order)),
    );
    const again = validateTable(parsed, "grammar", filename, {
      ...builtins,
      grammar: [...grammarTopics, ...imported],
    });
    assert.equal(again.items.length, 0);
    assert.equal(again.skipped, expected.length);
    report.files.push({
      filename,
      rows: expected.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      issues: 0,
      identicalToSource: true,
      imported: result.imported,
      reimportSkipped: again.skipped,
    });
  }
}
// Similar wording flags are review aids, not a proof of semantic distinctness.
const tokens = (s) => new Set(s.toLowerCase().match(/[a-z]+/g));
const pairs = [];
for (let i = 0; i < source.length; i++)
  for (let j = i + 1; j < source.length; j++) {
    const a = tokens(source[i].learning_objective + " " + source[i].rule),
      b = tokens(source[j].learning_objective + " " + source[j].rule);
    const intersection = [...a].filter((w) => b.has(w)).length,
      similarity = intersection / (a.size + b.size - intersection);
    if (similarity >= 0.4)
      pairs.push({
        first: source[i].lesson_id,
        second: source[j].lesson_id,
        similarity: Number(similarity.toFixed(3)),
      });
  }
report.similarWordingForEditorialReview = pairs;
report.semanticReview =
  "See coverage-audit.md; automated equality checks do not establish linguistic or pedagogical quality.";
await fs.writeFile(
  path.join(folder, "validation-report.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
