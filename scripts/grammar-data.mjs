import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { fieldsFor } from "../src/imports/schema.ts";
import { validateTable, normalizeKey } from "../src/imports/validate.ts";

export const root = path.resolve(import.meta.dirname, "..");
export const folder = path.join(root, "public/import-data/grammar");
export const output = path.join(root, "public/import-data");
export const headers = fieldsFor("grammar").map((f) => f.name);
export async function loadMap() {
  const lines = (
    await fs.readFile(path.join(folder, "curriculum-map.psv"), "utf8")
  )
    .trim()
    .split(/\r?\n/);
  const keys = lines.shift().split("|");
  const map = lines.map((line) => {
    const values = line.split("|");
    assert.equal(values.length, keys.length);
    const r = Object.fromEntries(keys.map((k, i) => [k, values[i]]));
    r.sort_order = Number(r.sort_order);
    r.prerequisites = r.prerequisites ? r.prerequisites.split(";") : [];
    return r;
  });
  const seen = new Set(),
    titles = new Set();
  map.forEach((r, i) => {
    assert.match(r.lesson_id, /^a[12]-[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert(!seen.has(r.lesson_id), r.lesson_id);
    assert(!titles.has(normalizeKey(r.title)), r.title);
    assert.equal(r.sort_order, i + 1, "Global ordering");
    assert(r.main_concept && r.category && ["A1", "A2"].includes(r.cefr_level));
    r.prerequisites.forEach((p) =>
      assert(seen.has(p), `${r.lesson_id}: prerequisite ${p} missing or later`),
    );
    seen.add(r.lesson_id);
    titles.add(normalizeKey(r.title));
  });
  return map;
}
export async function loadGrammar() {
  const map = await loadMap();
  const records = [];
  for (const level of ["A1", "A2"]) {
    const raw = await fs.readFile(path.join(folder, `${level}.json`), "utf8");
    for (const r of JSON.parse(raw)) {
      const plan = map.find((p) => p.lesson_id === r.lesson_id);
      assert(plan && plan.cefr_level === level, r.lesson_id);
      const row = Object.fromEntries(headers.map((h) => [h, ""]));
      Object.assign(
        row,
        {
          lesson_id: plan.lesson_id,
          cefr_level: level,
          title: plan.title,
          category: plan.category,
          sort_order: String(plan.sort_order),
          is_sample: "false",
        },
        r,
      );
      row.estimated_minutes = String(row.estimated_minutes);
      for (const [k, v] of Object.entries(row)) {
        assert(headers.includes(k), `Unexpected field ${k}`);
        assert.equal(typeof v, "string", `${r.lesson_id}.${k}`);
        assert.equal(
          v,
          v.normalize("NFC").trim(),
          `${r.lesson_id}.${k}: normalization`,
        );
        assert(
          !/[\uFFFD\t]/u.test(v),
          `${r.lesson_id}.${k}: invalid character`,
        );
      }
      for (const field of [
        "lesson_id",
        "cefr_level",
        "title",
        "category",
        "learning_objective",
        "summary",
        "explanation",
        "rule",
        "example_dutch_1",
        "example_english_1",
        "example_dutch_2",
        "example_english_2",
        "common_mistake",
      ])
        assert(row[field], `${r.lesson_id}.${field}`);
      assert(
        Number.isInteger(Number(row.estimated_minutes)) &&
          Number(row.estimated_minutes) >= 3 &&
          Number(row.estimated_minutes) <= 10,
      );
      records.push(row);
    }
  }
  assert.equal(records.length, map.length);
  for (const field of [
    "lesson_id",
    "title",
    "learning_objective",
    "explanation",
    "rule",
  ])
    assert.equal(
      new Set(records.map((r) => normalizeKey(r[field]))).size,
      records.length,
      `Duplicate ${field}`,
    );
  for (const level of ["A1", "A2"]) {
    const rows = records.filter((r) => r.cefr_level === level);
    assert.deepEqual(
      rows.map((r) => r.lesson_id),
      map.filter((r) => r.cefr_level === level).map((r) => r.lesson_id),
    );
    const preview = validateTable(
      {
        headers,
        rows: rows.map((r, i) => ({
          row: i + 2,
          values: headers.map((h) => r[h]),
        })),
        format: "csv",
        warnings: [],
      },
      "grammar",
      level + ".csv",
      { vocabulary: [], grammar: [] },
    );
    assert.deepEqual(preview.issues, []);
    assert.equal(preview.items.length, rows.length);
  }
  return records;
}
if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  const map = process.argv.includes("--map")
    ? await loadMap()
    : await loadGrammar();
  console.log(
    JSON.stringify(
      {
        A1: map.filter((r) => r.cefr_level === "A1").length,
        A2: map.filter((r) => r.cefr_level === "A2").length,
        total: map.length,
        prerequisiteOrder: "valid",
      },
      null,
      2,
    ),
  );
}
