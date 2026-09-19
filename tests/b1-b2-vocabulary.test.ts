import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { grammarTopics, vocabularyItems } from "../src/data/sample-content.ts";
import { commitPreview } from "../src/imports/commit.ts";
import { readImportFile } from "../src/imports/read-file.ts";
import { vocabularyFields } from "../src/imports/schema.ts";
import { normalizeKey, validateTable } from "../src/imports/validate.ts";
import { emptyCurriculum } from "../src/storage/library.ts";

const folder = new URL("../public/import-data/", import.meta.url);
const counts = { A1: 500, A2: 1000, B1: 1500, B2: 2000 };
const lemma = (word: string) =>
  normalizeKey(word.normalize("NFC").replace(/^(de|het|zich)\s+/i, ""));

test("B1/B2 CSV and Excel contain identical complete records and import after A1/A2 without duplicates", async () => {
  const seen = new Set<string>();
  const builtins = { vocabulary: vocabularyItems, grammar: grammarTopics };
  let curriculum = emptyCurriculum();
  for (const [level, count] of Object.entries(counts)) {
    const stem = `dutch_vocabulary_${level}_${count}`;
    const csv = await readImportFile(
      `${stem}.csv`,
      Uint8Array.from(await readFile(new URL(`${stem}.csv`, folder))).buffer,
      "vocabulary",
    );
    assert.equal(csv.rows.length, count);
    for (const row of csv.rows) {
      const key = lemma(row.values[0]);
      assert(!seen.has(key), `Duplicate headword: ${key}`);
      seen.add(key);
    }
    const preview = validateTable(csv, "vocabulary", `${stem}.csv`, {
      vocabulary: [...builtins.vocabulary, ...curriculum.vocabulary],
      grammar: builtins.grammar,
    });
    assert.equal(preview.invalid, 0, JSON.stringify(preview.issues));
    if (level === "B1" || level === "B2") {
      assert.deepEqual(
        csv.headers,
        vocabularyFields.map((f) => f.name),
      );
      assert.equal(preview.skipped, 0);
      assert.equal(preview.items.length, count);
      const excel = await readImportFile(
        `${stem}.xlsx`,
        Uint8Array.from(await readFile(new URL(`${stem}.xlsx`, folder))).buffer,
        "vocabulary",
      );
      assert.deepEqual(excel.headers, csv.headers);
      assert.deepEqual(
        excel.rows.map((r) => r.values),
        csv.rows.map((r) => r.values),
      );
      const excelPreview = validateTable(excel, "vocabulary", `${stem}.xlsx`, {
        vocabulary: [...builtins.vocabulary, ...curriculum.vocabulary],
        grammar: builtins.grammar,
      });
      assert.equal(excelPreview.invalid, 0);
      assert.equal(excelPreview.skipped, 0);
      assert.equal(excelPreview.items.length, count);
      for (const row of csv.rows) {
        assert.equal(row.values.length, 20);
        const v = Object.fromEntries(
          csv.headers.map((h, i) => [h, row.values[i]]),
        );
        for (const field of [
          "dutch",
          "english",
          "word_type",
          "topic",
          "example_dutch",
          "example_english",
        ])
          assert(v[field].trim(), `${v.dutch}: missing ${field}`);
        assert.equal(v.cefr_level, level);
        assert.equal(v.is_sample, "false");
        if (v.word_type === "noun") {
          assert(["de", "het"].includes(v.article), v.dutch);
          assert(
            v.plural ||
              /uncountable|plural.only|no usual plural/i.test(v.notes),
            `${v.dutch}: missing plural or explanation`,
          );
        }
        if (v.word_type === "verb") {
          assert(["regular", "irregular"].includes(v.regularity), v.dutch);
          assert(["true", "false"].includes(v.separable), v.dutch);
          assert(
            ["hebben", "zijn", "hebben / zijn"].includes(v.auxiliary),
            v.dutch,
          );
          assert(v.past_participle, v.dutch);
        }
      }
    }
    const before = structuredClone(curriculum);
    const result = commitPreview(
      curriculum,
      preview,
      builtins,
      `test-${level}`,
    );
    assert.deepEqual(curriculum, before);
    assert.equal(result.imported, level === "A1" ? 493 : count);
    assert.deepEqual(result.curriculum.grammar, before.grammar);
    curriculum = result.curriculum;
    if (level === "B1" || level === "B2") {
      const repeated = validateTable(
        csv,
        "vocabulary",
        `${stem}.csv`,
        curriculum,
      );
      assert.equal(repeated.items.length, 0);
      assert.equal(repeated.skipped, count);
    }
  }
  assert.equal(seen.size, 5000);
  assert.equal(curriculum.vocabulary.length, 4993);
  assert(curriculum.vocabulary.every((v) => !v.isSample));
});
