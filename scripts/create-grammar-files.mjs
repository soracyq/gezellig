import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import Papa from "papaparse";
import {
  loadGrammar,
  headers,
  output,
  root,
  loadMap,
  folder,
} from "./grammar-data.mjs";

const runtimeRequire = createRequire(
  path.join(
    process.env.DUTCHLY_ARTIFACT_NODE_MODULES ||
      path.join(root, ".artifact-build/node_modules"),
    "__grammar-author.cjs",
  ),
);
const { Workbook, SpreadsheetFile } = await import(
  pathToFileURL(runtimeRequire.resolve("@oai/artifact-tool")).href
);
const JSZip = runtimeRequire("jszip");
const records = await loadGrammar();
const qa = path.join(root, "test-results/grammar-files");
await fs.mkdir(qa, { recursive: true });
const widths = [
  265, 105, 300, 145, 370, 370, 650, 435, 370, 370, 370, 370, 470, 470, 115,
  155, 110,
];
for (const level of ["A1", "A2"]) {
  const rows = records.filter((r) => r.cefr_level === level),
    stem = `dutch_grammar_${level}`;
  // A real CSV writer preserves commas, quotes and paragraph newlines.
  const csv = Papa.unparse(
    { fields: headers, data: rows.map((r) => headers.map((h) => r[h])) },
    { newline: "\r\n", quotes: true },
  );
  await fs.writeFile(path.join(output, stem + ".csv"), csv + "\r\n", "utf8");
  const matrix = [
    headers,
    ...rows.map((r) =>
      headers.map((h) =>
        ["sort_order", "estimated_minutes"].includes(h) ? Number(r[h]) : r[h],
      ),
    ),
  ];
  const book = Workbook.create(),
    sheet = book.worksheets.add("Lessons");
  const block = sheet.getRange(`A1:Q${matrix.length}`);
  block.setNumberFormat("@");
  block.values = matrix;
  sheet.getRange(`O2:P${matrix.length}`).setNumberFormat("0");
  block.format.font = { name: "Arial", size: 11, color: "#243F4D" };
  block.format.verticalAlignment = "top";
  block.format.wrapText = true;
  sheet.showGridLines = false;
  sheet.freezePanes.freezeRows(1);
  sheet.freezePanes.freezeColumns(1);
  sheet.tabColor = "#356B84";
  widths.forEach(
    (w, i) =>
      (sheet.getRange(
        `${String.fromCharCode(65 + i)}1:${String.fromCharCode(65 + i)}${matrix.length}`,
      ).format.columnWidthPx = w),
  );
  const header = sheet.getRange("A1:Q1");
  header.format.fill = "#243F4D";
  header.format.font = {
    name: "Arial",
    size: 11,
    bold: true,
    color: "#FFFFFF",
  };
  header.format.rowHeight = 34;
  header.format.verticalAlignment = "center";
  for (let r = 2; r <= matrix.length; r++) {
    const height = Math.min(
      409,
      Math.max(
        65,
        ...matrix[r - 1].map(
          (v, i) =>
            String(v)
              .split("\n")
              .reduce(
                (n, line) =>
                  n +
                  Math.max(1, Math.ceil((line.length * 7.6 + 18) / widths[i])),
                0,
              ) *
              15 +
            18,
        ),
      ),
    );
    const range = sheet.getRange(`A${r}:Q${r}`);
    range.format.rowHeight = height;
    if (r % 2 === 0) range.format.fill = "#F0F4F5";
  }
  sheet.tables.add(
    `A1:Q${matrix.length}`,
    true,
    `Grammar${level}`,
  ).showFilterButton = true;
  for (const [col, values] of Object.entries({
    B: ["A1", "A2"],
    Q: ["true", "false"],
  }))
    sheet.getRange(`${col}2:${col}${matrix.length}`).dataValidation = {
      rule: { type: "list", values },
    };
  book.recalculate();
  assert.deepEqual(sheet.getRange(`A1:Q${matrix.length}`).values, matrix);
  const inspections = [];
  for (const row of [1, Math.floor(matrix.length / 2), matrix.length - 1])
    inspections.push(
      (
        await book.inspect({
          kind: "table",
          range: `Lessons!A${row}:Q${row + 1}`,
          include: "values,formulas",
          tableMaxRows: 2,
          tableMaxCols: 17,
          maxChars: 2400,
        })
      ).ndjson,
    );
  inspections.push(
    (
      await book.inspect({
        kind: "match",
        searchTerm:
          "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
        options: { useRegex: true, maxResults: 20 },
        maxChars: 1200,
      })
    ).ndjson,
  );
  await fs.writeFile(
    path.join(qa, stem + "-inspection.ndjson"),
    inspections.join("\n"),
  );
  const longest =
    rows.reduce(
      (best, r, i) =>
        r.explanation.length > rows[best].explanation.length ? i : best,
      0,
    ) + 2;
  for (const range of [
    "A1:F3",
    "G1:H3",
    "I1:L3",
    "M1:Q3",
    `G${longest}:H${longest}`,
  ]) {
    const rendered = await book.render({
      sheetName: "Lessons",
      range,
      scale: 1,
      format: "png",
    });
    await fs.writeFile(
      path.join(qa, stem + "-" + range.replace(":", "-") + ".png"),
      new Uint8Array(await rendered.arrayBuffer()),
    );
  }
  const file = path.join(output, stem + ".xlsx");
  await (await SpreadsheetFile.exportXlsx(book)).save(file);
  // File-level compatibility with the existing ExcelJS reader; no lesson values change.
  const zip = await JSZip.loadAsync(await fs.readFile(file));
  const declaration =
    'xmlns:x="http://schemas.openxmlformats.org/spreadsheetml/2006/main"';
  for (const [name, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    if (name.startsWith("xl/worksheets/_rels/") && name.endsWith(".rels")) {
      zip.file(
        name,
        (await entry.async("string")).replace(/Target="\/xl\//g, 'Target="../'),
      );
      continue;
    }
    if (!name.endsWith(".xml")) continue;
    const xml = await entry.async("string");
    if (xml.includes(declaration))
      zip.file(
        name,
        xml
          .replaceAll(declaration, declaration.replace("xmlns:x=", "xmlns="))
          .replace(/<(\/?)x:/g, "<$1"),
      );
  }
  await fs.writeFile(
    file,
    await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }),
  );
  const sidecar = file + ".inspect.ndjson";
  if (await fs.stat(sidecar).catch(() => null))
    await fs.rename(sidecar, path.join(qa, stem + ".xlsx.inspect.ndjson"));
  console.log(
    `${stem}: ${rows.length} lessons exported in matching CSV/XLSX, five rendered views.`,
  );
}
const map = await loadMap();
await fs.writeFile(
  path.join(folder, "curriculum-map.md"),
  "# Dutch grammar curriculum map\n\nThe prerequisite map was established before lesson authoring. Orders are global because the existing application sorts its combined grammar list globally. Prerequisites are guidance, not app-enforced locks.\n\n| Level | Order | Lesson | Category | Main concept | Prerequisites |\n|---|---:|---|---|---|---|\n" +
    map
      .map(
        (r) =>
          `| ${r.cefr_level} | ${r.sort_order} | ${r.title} | ${r.category} | ${r.main_concept} | ${r.prerequisites.join(", ") || "None"} |`,
      )
      .join("\n") +
    "\n",
);
