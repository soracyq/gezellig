import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { loadVocabulary, headers, output, root } from "./vocabulary-data.mjs";

const runtimeModules =
  process.env.DUTCHLY_ARTIFACT_NODE_MODULES ||
  path.join(root, ".artifact-build/node_modules");
const runtimeRequire = createRequire(
  path.join(runtimeModules, "__vocabulary-author.cjs"),
);
const { Workbook, SpreadsheetFile } = await import(
  pathToFileURL(runtimeRequire.resolve("@oai/artifact-tool")).href
);
const JSZip = runtimeRequire("jszip");
const rows = await loadVocabulary();
const qa = path.join(root, "test-results/vocabulary-files");
await fs.mkdir(qa, { recursive: true });
const csvCell = (v) =>
  /[,"\r\n]/.test(v) ? '"' + v.replaceAll('"', '""') + '"' : v;
const widths = [
  205, 260, 105, 135, 215, 390, 440, 550, 130, 85, 180, 130, 130, 115, 155, 190,
  155, 155, 160, 115,
];

for (const [level, count] of [
  ["A1", 500],
  ["A2", 1000],
]) {
  if (process.argv[2] && process.argv[2] !== level) continue;
  const data = rows.filter((r) => r.cefr_level === level);
  const matrix = [headers, ...data.map((r) => headers.map((h) => r[h]))];
  const stem = `dutch_vocabulary_${level}_${count}`;
  const csv = matrix.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
  await fs.writeFile(path.join(output, stem + ".csv"), csv, "utf8");
  const book = Workbook.create(),
    sheet = book.worksheets.add("Vocabulary");
  const block = sheet.getRange(`A1:T${matrix.length}`);
  block.setNumberFormat("@");
  block.values = matrix;
  block.format.font = { name: "Arial", size: 11, color: "#243F4D" };
  block.format.verticalAlignment = "center";
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
  const title = sheet.getRange("A1:T1");
  title.format.fill = "#243F4D";
  title.format.font = { name: "Arial", size: 11, color: "#FFFFFF", bold: true };
  title.format.horizontalAlignment = "center";
  title.format.rowHeight = 34;
  title.format.borders = {
    insideVertical: { style: "thin", color: "#FFFFFF" },
  };
  for (let r = 2; r <= matrix.length; r++) {
    const height = Math.max(
      42,
      ...matrix[r - 1].map(
        (v, i) => Math.ceil((v.length * 7.6 + 16) / widths[i]) * 15 + 12,
      ),
    );
    const range = sheet.getRange(`A${r}:T${r}`);
    range.format.rowHeight = height;
    if (r % 2 === 0) range.format.fill = "#F0F4F5";
  }
  const table = sheet.tables.add(
    `A1:T${matrix.length}`,
    true,
    `Vocabulary${level}`,
  );
  table.showFilterButton = true;
  for (const [col, values] of Object.entries({
    C: ["A1", "A2", "B1", "B2", "C1"],
    D: [
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
    ],
    J: ["de", "het"],
    M: ["regular", "irregular"],
    N: ["true", "false"],
    O: ["hebben", "zijn", "hebben / zijn"],
    T: ["true", "false"],
  })) {
    sheet.getRange(`${col}2:${col}${matrix.length}`).dataValidation = {
      rule: { type: "list", values },
    };
  }
  book.recalculate();
  assert.deepEqual(sheet.getRange(`A1:T${matrix.length}`).values, matrix);
  const checks = [];
  for (const first of [1, Math.floor(matrix.length / 2), matrix.length - 2])
    checks.push(
      (
        await book.inspect({
          kind: "table",
          range: `Vocabulary!A${first}:T${first + 2}`,
          include: "values,formulas",
          tableMaxRows: 3,
          tableMaxCols: 20,
          maxChars: 2500,
        })
      ).ndjson,
    );
  checks.push(
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
    checks.join("\n"),
  );
  for (const range of ["A1:G5", "H1:N5", "O1:T5"]) {
    const image = await book.render({
      sheetName: "Vocabulary",
      range,
      scale: 1,
      format: "png",
    });
    await fs.writeFile(
      path.join(qa, stem + "-" + range.replace(":", "-") + ".png"),
      new Uint8Array(await image.arrayBuffer()),
    );
  }
  const file = path.join(output, stem + ".xlsx");
  await (await SpreadsheetFile.exportXlsx(book)).save(file);
  // Same proven namespace-only compatibility adaptation as the original templates.
  const archive = await JSZip.loadAsync(await fs.readFile(file));
  const declaration =
    'xmlns:x="http://schemas.openxmlformats.org/spreadsheetml/2006/main"';
  let converted = 0;
  for (const [name, entry] of Object.entries(archive.files)) {
    if (entry.dir) continue;
    if (name.startsWith("xl/worksheets/_rels/") && name.endsWith(".rels")) {
      const rel = await entry.async("string");
      // ExcelJS expects worksheet table targets relative to the worksheet directory.
      archive.file(name, rel.replace(/Target="\/xl\//g, 'Target="../'));
      continue;
    }
    if (!name.endsWith(".xml")) continue;
    const xml = await entry.async("string");
    if (!xml.includes(declaration)) continue;
    archive.file(
      name,
      xml
        .replaceAll(declaration, declaration.replace("xmlns:x=", "xmlns="))
        .replace(/<(\/?)x:/g, "<$1"),
    );
    converted++;
  }
  await fs.writeFile(
    file,
    await archive.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }),
  );
  const sidecar = file + ".inspect.ndjson";
  if (await fs.stat(sidecar).catch(() => null))
    await fs.rename(sidecar, path.join(qa, stem + ".xlsx.inspect.ndjson"));
  console.log(
    `${stem}: ${data.length} rows, matching CSV/XLSX, 3 rendered ranges, ${converted} XML namespaces adapted.`,
  );
}
