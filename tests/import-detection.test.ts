import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { detectImportKind, prepareImport } from "../src/imports/prepare.ts";
import { readImportFile } from "../src/imports/read-file.ts";
import { validateTable } from "../src/imports/validate.ts";

const empty = { vocabulary: [], grammar: [] };
const folder = new URL("../public/import-data/", import.meta.url);

test("the reported grammar-as-vocabulary error is reproduced and corrected before preview", async () => {
  const name = "dutch_grammar_B1.csv";
  const buffer = Uint8Array.from(await readFile(new URL(name, folder))).buffer;
  const parsed = await readImportFile(name, buffer, "vocabulary");
  const wrong = validateTable(parsed, "vocabulary", name, empty);
  assert.equal(wrong.issues.length, 17);
  assert(wrong.issues.some((issue) => issue.column === "dutch"));
  assert(wrong.issues.some((issue) => issue.column === "lesson_id"));
  const detected = await prepareImport(name, buffer, "vocabulary", empty);
  assert.equal(detected.kind, "grammar");
  assert.equal(detected.invalid, 0);
  assert.equal(detected.items.length, 36);
  assert(detected.warnings[0].includes("Switched to grammar import"));
});

for (const [name, expectedKind, count] of [
  ["dutch_vocabulary_B1_1500.csv", "vocabulary", 1500],
  ["dutch_vocabulary_B1_1500.xlsx", "vocabulary", 1500],
  ["dutch_vocabulary_B2_2000.csv", "vocabulary", 2000],
  ["dutch_vocabulary_B2_2000.xlsx", "vocabulary", 2000],
  ["dutch_grammar_B1.csv", "grammar", 36],
  ["dutch_grammar_B2.csv", "grammar", 36],
] as const) {
  test(`${name} previews correctly from either import mode without modifying existing content`, async () => {
    const buffer = Uint8Array.from(
      await readFile(new URL(name, folder)),
    ).buffer;
    for (const selectedKind of ["vocabulary", "grammar"] as const) {
      const existing = structuredClone(empty);
      const result = await prepareImport(name, buffer, selectedKind, existing);
      assert.equal(result.kind, expectedKind);
      assert.equal(result.invalid, 0);
      assert.equal(result.issues.length, 0);
      assert.equal(result.skipped, 0);
      assert.equal(result.items.length, count);
      assert.deepEqual(existing, empty);
      if (selectedKind === expectedKind)
        assert.equal(result.warnings.length, 0);
      else
        assert(
          result.warnings[0].includes(`Switched to ${expectedKind} import`),
        );
    }
  });
}

test("detection normalizes headers but never guesses mixed or incomplete schemas", async () => {
  assert.equal(
    detectImportKind([" DUTCH ", "English", "word_type"]),
    "vocabulary",
  );
  assert.equal(detectImportKind(["Title", " explanation "]), "grammar");
  assert.equal(detectImportKind(["cefr_level", "notes"]), null);
  assert.equal(
    detectImportKind(["dutch", "english", "word_type", "title", "explanation"]),
    null,
  );
  const buffer = new TextEncoder().encode(
    "title,explanation,cefr_level,unexpected\nLesson,Example,B1,value\n",
  ).buffer;
  const result = await prepareImport(
    "vocabulary.csv",
    buffer,
    "vocabulary",
    empty,
  );
  assert.equal(result.kind, "grammar");
  assert.equal(result.invalid, 1);
  assert.equal(result.items.length, 0);
  assert(result.issues.some((issue) => issue.column === "unexpected"));
});
