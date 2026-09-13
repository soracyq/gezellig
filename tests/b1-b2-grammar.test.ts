import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { grammarTopics, vocabularyItems } from "../src/data/sample-content.ts";
import { grammarExercises } from "../src/domain/grammarPractice.ts";
import { commitPreview } from "../src/imports/commit.ts";
import { readImportFile } from "../src/imports/read-file.ts";
import { grammarFields } from "../src/imports/schema.ts";
import { normalizeKey, validateTable } from "../src/imports/validate.ts";
import { emptyCurriculum } from "../src/storage/library.ts";

const folder = new URL("../public/import-data/", import.meta.url);
const baselineHashes = {
  "dutch_vocabulary_A1_500.csv":
    "e458df17bf78c8ffc049214048315b6b5229b84ba5fae3a06a132fd303c2ac93",
  "dutch_vocabulary_A2_1000.csv":
    "867ebaab8dbd68b384452169ffc67afd021bc2ee405a8dc5ca3b5a72ed022d41",
  "dutch_grammar_A1.csv":
    "53c16674c7e547dc2fd5d15e7ddccacd5f89944ed51c63c80438f48aa42c2cd8",
  "dutch_grammar_A2.csv":
    "ab3fec064e843655398f80488ff2bbbd5ac641ce6f60e88ba8e92d6e532635b3",
};

test("B1/B2 additions preserve the four A1/A2 reference CSVs byte for byte", async () => {
  for (const [name, expected] of Object.entries(baselineHashes)) {
    const bytes = await readFile(new URL(name, folder));
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      expected,
      name,
    );
  }
});

test("B1/B2 grammar imports after A1/A2 with unique IDs, complete fields and continuous order", async () => {
  const builtins = { vocabulary: vocabularyItems, grammar: grammarTopics };
  let curriculum = emptyCurriculum();
  const ids = new Set<string>();
  const titles = new Set<string>();
  let nextOrder = 73;
  for (const level of ["A1", "A2", "B1", "B2"]) {
    const name = `dutch_grammar_${level}.csv`;
    const bytes = await readFile(new URL(name, folder));
    const table = await readImportFile(
      name,
      Uint8Array.from(bytes).buffer,
      "grammar",
    );
    assert.deepEqual(
      table.headers,
      grammarFields.map((field) => field.name),
    );
    assert.equal(
      table.rows.length,
      level === "A1" ? 32 : level === "A2" ? 40 : 36,
    );
    for (const row of table.rows) {
      assert.equal(row.values.length, table.headers.length);
      const value = Object.fromEntries(
        table.headers.map((key, i) => [key, row.values[i]]),
      );
      assert(!ids.has(normalizeKey(value.lesson_id)), value.lesson_id);
      assert(!titles.has(normalizeKey(value.title)), value.title);
      ids.add(normalizeKey(value.lesson_id));
      titles.add(normalizeKey(value.title));
      if (level === "B1" || level === "B2") {
        for (const key of table.headers)
          assert(value[key].trim(), `${name}: missing ${key}`);
        assert.equal(value.cefr_level, level);
        assert(value.lesson_id.startsWith(`${level.toLowerCase()}-`));
        assert.equal(value.is_sample, "false");
        assert.equal(Number(value.sort_order), nextOrder++);
      }
    }
    const before = structuredClone(curriculum);
    const preview = validateTable(table, "grammar", name, {
      vocabulary: [...builtins.vocabulary, ...curriculum.vocabulary],
      grammar: [...builtins.grammar, ...curriculum.grammar],
    });
    assert.equal(preview.invalid, 0, JSON.stringify(preview.issues));
    assert.equal(preview.skipped, 0);
    assert.equal(preview.valid, table.rows.length);
    const result = commitPreview(
      curriculum,
      preview,
      builtins,
      `test-${level}`,
    );
    assert.deepEqual(curriculum, before, "commit must not mutate its input");
    assert.equal(result.imported, table.rows.length);
    assert.equal(result.skipped, 0);
    assert.deepEqual(
      result.curriculum.grammar.slice(0, before.grammar.length),
      before.grammar,
    );
    assert.deepEqual(result.curriculum.vocabulary, before.vocabulary);
    curriculum = result.curriculum;
    if (level === "B1" || level === "B2") {
      for (const lesson of curriculum.grammar.filter(
        (item) => item.level === level,
      )) {
        const exercises = grammarExercises(lesson);
        assert.equal(exercises.length, 2);
        assert(exercises.every((exercise) => exercise.kind === "translation"));
        assert.deepEqual(
          exercises.map((exercise) => exercise.correctAnswer),
          lesson.examples.map((example) => example.dutch),
        );
      }
    }
    const repeat = validateTable(table, "grammar", name, curriculum);
    assert.equal(repeat.items.length, 0);
    assert.equal(repeat.skipped, table.rows.length);
  }
  assert.equal(nextOrder, 145);
  assert.equal(curriculum.grammar.length, 144);
  assert(curriculum.grammar.every((lesson) => !lesson.isSample));
});
