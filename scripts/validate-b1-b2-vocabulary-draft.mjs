import assert from "node:assert/strict";
import fs from "node:fs/promises";
import Papa from "papaparse";

const root = new URL("../", import.meta.url);
const normalize = (value) =>
  value
    .normalize("NFC")
    .trim()
    .toLocaleLowerCase("nl")
    .replace(/^(?:de|het)\s+/, "")
    .replace(/^zich\s+/, "")
    .replace(/\s+/g, " ");
const seen = new Set();
for (const file of [
  "dutch_vocabulary_A1_500.csv",
  "dutch_vocabulary_A2_1000.csv",
]) {
  const result = Papa.parse(
    await fs.readFile(new URL(`public/import-data/${file}`, root), "utf8"),
    { header: true, skipEmptyLines: true },
  );
  assert.deepEqual(result.errors, []);
  for (const row of result.data) seen.add(normalize(row.dutch));
}
const rows = JSON.parse(
  await fs.readFile(
    new URL("content-drafts/b1-b2/vocabulary-b1.json", root),
    "utf8",
  ),
);
const counts = {};
for (const row of rows) {
  for (const key of [
    "dutch",
    "english",
    "cefr_level",
    "word_type",
    "topic",
    "example_dutch",
    "example_english",
  ]) {
    assert.equal(typeof row[key], "string");
    assert(row[key].trim(), `${row.dutch}: ${key}`);
    assert.equal(row[key], row[key].normalize("NFC"));
  }
  assert.equal(row.cefr_level, "B1");
  const key = normalize(row.dutch);
  assert(!seen.has(key), `Duplicate Dutch lemma: ${row.dutch}`);
  seen.add(key);
  counts[row.word_type] = (counts[row.word_type] ?? 0) + 1;
}
console.log(
  JSON.stringify(
    {
      status: "DRAFT — not a completed vocabulary import",
      B1DraftItems: rows.length,
      B1Required: 1500,
      B2DraftItems: 0,
      B2Required: 2000,
      duplicateHeadwords: 0,
      missingDraftFields: 0,
      wordTypes: counts,
      morphologyVerified: false,
      vocabularyImporterTested: false,
    },
    null,
    2,
  ),
);
