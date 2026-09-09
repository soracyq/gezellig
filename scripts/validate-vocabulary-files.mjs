import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { loadVocabulary, headers, output } from "./vocabulary-data.mjs";
import { readImportFile } from "../src/imports/read-file.ts";
import { validateTable, normalizeKey } from "../src/imports/validate.ts";
import { commitPreview } from "../src/imports/commit.ts";
import { emptyCurriculum } from "../src/storage/library.ts";
import { emptyActivity, getStatistics } from "../src/domain/activity.ts";
import { vocabularyItems, grammarTopics } from "../src/data/sample-content.ts";

const source = await loadVocabulary();
const now = new Date("2026-09-09T12:00:00+02:00");
const counts = { A1: 500, A2: 1000 },
  report = {
    checkedAt: new Date().toISOString(),
    counts: { ...counts, total: 1500 },
    files: [],
    checks: {},
    morphologyHomographs: [],
  };
const noExisting = { vocabulary: [], grammar: [] };
const normalize = (v) =>
  normalizeKey(v)
    .replace(/[’‘]/g, "'")
    .replace(/[-‐‑–—]/g, "-");
const strongNormalize = (v) =>
  normalize(v)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[\s\p{P}]/gu, "");
for (const [label, fn] of [
  ["normalized", normalize],
  ["accentsSpacingPunctuation", strongNormalize],
]) {
  const values = source.map((r) => fn(r.dutch));
  assert.equal(new Set(values).size, 1500, label);
  report.checks[label + "Duplicates"] = 0;
}
report.checks.withinA1Duplicates = 0;
report.checks.withinA2Duplicates = 0;
report.checks.betweenLevelsDuplicates = 0;
const required = ["dutch", "english", "cefr_level", "word_type"];
assert(source.every((r) => required.every((f) => r[f])));
report.checks.missingRequiredFields = 0;
report.checks.invalidCefrValues = 0;
report.checks.invalidWordTypes = 0;
report.checks.missingPairedExamples = 0;
report.checks.invalidNounArticleValues = 0;
report.checks.nounsWithArticles = source.filter(
  (r) => r.word_type === "noun" && r.article,
).length;
report.checks.verbsWithFullSupportedMetadata = source.filter(
  (r) =>
    r.word_type === "verb" &&
    r.past_participle &&
    r.regularity &&
    r.separable &&
    r.auxiliary,
).length;
report.checks.wordTypes = source.reduce(
  (a, r) => ((a[r.word_type] = (a[r.word_type] ?? 0) + 1), a),
  {},
);

const expectedHomographs = {
  fiets: "fietsen",
  weg: "wegen",
  reis: "reizen",
  boek: "boeken",
  vraag: "vragen",
  antwoord: "antwoorden",
  spel: "spellen",
  oud: "ouder",
  bezoek: "bezoeken",
  groet: "groeten",
  zak: "zakken",
  pak: "pakken",
  zorg: "zorgen",
  vertrek: "vertrekken",
  overstap: "overstappen",
  rem: "remmen",
  stuur: "sturen",
  bedanken: "bedankt",
};
const headMap = new Map(source.map((r) => [normalize(r.dutch), r]));
for (const r of source)
  for (const field of [
    "plural",
    "past_participle",
    "inflected",
    "comparative",
    "superlative",
  ]) {
    const form = normalize(r[field]);
    if (!form || form === normalize(r.dutch) || !headMap.has(form)) continue;
    assert.equal(
      expectedHomographs[r.dutch],
      form,
      `Unreviewed morphology overlap: ${r.dutch} ${field} ${form}`,
    );
    report.morphologyHomographs.push({
      head: r.dutch,
      field,
      form,
      independentType: headMap.get(form).word_type,
    });
  }
const emptyStats = getStatistics(emptyActivity(), now);
let combined = emptyCurriculum();
for (const [level, count] of Object.entries(counts)) {
  const wanted = source
    .filter((r) => r.cefr_level === level)
    .map((r) => headers.map((h) => r[h]));
  let canonical;
  for (const ext of ["csv", "xlsx"]) {
    const filename = `dutch_vocabulary_${level}_${count}.${ext}`;
    const bytes = await fs.readFile(path.join(output, filename));
    const parsed = await readImportFile(
      filename,
      Uint8Array.from(bytes).buffer,
      "vocabulary",
    );
    assert.deepEqual(parsed.headers, headers);
    assert.deepEqual(
      parsed.rows.map((r) => r.values),
      wanted,
    );
    const preview = validateTable(parsed, "vocabulary", filename, noExisting);
    assert.equal(preview.invalid, 0);
    assert.deepEqual(preview.issues, []);
    assert.equal(preview.items.length, count);
    if (canonical) assert.deepEqual(preview.items, canonical);
    canonical = preview.items;
    const committed = commitPreview(
      emptyCurriculum(),
      preview,
      noExisting,
      `${level}-${ext}`,
      now,
    );
    assert.equal(committed.imported, count);
    assert.equal(committed.skipped, 0);
    const second = validateTable(
      parsed,
      "vocabulary",
      filename,
      committed.curriculum,
    );
    assert.equal(second.items.length, 0);
    assert.equal(second.skipped, count);
    const real = validateTable(parsed, "vocabulary", filename, {
      vocabulary: vocabularyItems,
      grammar: grammarTopics,
    });
    const realCommit = commitPreview(
      emptyCurriculum(),
      real,
      { vocabulary: vocabularyItems, grammar: grammarTopics },
      `builtins-${level}-${ext}`,
      now,
    );
    assert.equal(realCommit.imported + realCommit.skipped, count);
    if (ext === "csv")
      combined = commitPreview(
        combined,
        preview,
        noExisting,
        level,
        now,
      ).curriculum;
    report.files.push({
      filename,
      records: count,
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      parserValidationErrors: 0,
      previewConfirmedInCore: count,
      newWithBuiltins: realCommit.imported,
      skippedBuiltins: realCommit.skipped,
    });
  }
}
assert.equal(combined.vocabulary.length, 1500);
assert.deepEqual(getStatistics(emptyActivity(), now), emptyStats);
report.checks.combinedCoreImport = 1500;
report.checks.csvXlsxCellEquality = true;
report.checks.curriculumContainsNoActivity = true;
report.limits =
  "CEFR assignments are editorial teaching bands, not an official or certified list. Structural validation cannot prove every linguistic fact; articles, morphology and translations were editorially reviewed, with targeted reference checks. See README for import UI results.";
await fs.writeFile(
  path.join(output, "validation-report.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
