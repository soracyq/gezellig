import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { fieldsFor, exampleRows } from "../src/imports/schema.ts";

const root = path.resolve(import.meta.dirname, "..");
// Optional maintainer command: use the separate bundled artifact runtime, never app dependencies.
const artifactModules =
  process.env.DUTCHLY_ARTIFACT_NODE_MODULES ||
  path.join(root, ".artifact-build/node_modules");
const artifactRequire = createRequire(
  path.join(artifactModules, "__dutchly-loader.cjs"),
);
let Workbook, SpreadsheetFile, JSZip;
try {
  ({ Workbook, SpreadsheetFile } = await import(
    pathToFileURL(artifactRequire.resolve("@oai/artifact-tool")).href
  ));
  JSZip = artifactRequire("jszip");
} catch {
  throw new Error(
    "Bundled artifact runtime not found. Set DUTCHLY_ARTIFACT_NODE_MODULES to its node_modules directory, or create the .artifact-build/node_modules junction described in docs/IMPORTS.md.",
  );
}
const output = path.join(root, "public/templates");
const previews = path.join(root, "test-results/template-previews");
await fs.mkdir(output, { recursive: true });
await fs.mkdir(previews, { recursive: true });
const column = (index) => String.fromCharCode(65 + index);
const csvCell = (value) =>
  /[,"\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
const enums = {
  cefr_level: ["A1", "A2", "B1", "B2", "C1"],
  word_type: [
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
  article: ["de", "het"],
  regularity: ["regular", "irregular"],
  separable: ["true", "false"],
  auxiliary: ["hebben", "zijn", "hebben / zijn"],
  is_sample: ["true", "false"],
};

async function normalizeSpreadsheetNamespace(filename) {
  const archive = await JSZip.loadAsync(await fs.readFile(filename));
  const declaration =
    'xmlns:x="http://schemas.openxmlformats.org/spreadsheetml/2006/main"';
  // ExcelJS requires the SpreadsheetML namespace to be default instead of x-prefixed.
  // Preserve the authored cell data, styles and controls, changing namespace spelling only.
  for (const [name, entry] of Object.entries(archive.files)) {
    if (entry.dir || !name.endsWith(".xml")) continue;
    const xml = await entry.async("string");
    if (!xml.includes(declaration)) continue;
    archive.file(
      name,
      xml
        .replaceAll(declaration, declaration.replace("xmlns:x=", "xmlns="))
        .replace(/<(\/?)x:/g, "<$1"),
    );
  }
  await fs.writeFile(
    filename,
    await archive.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }),
  );
}

for (const kind of ["vocabulary", "grammar"]) {
  const fields = fieldsFor(kind);
  const headers = fields.map((field) => field.name);
  const sheetName = kind === "vocabulary" ? "Vocabulary" : "Lessons";
  for (const variant of ["template", "example"]) {
    const rows = variant === "example" ? exampleRows[kind] : [];
    const matrix = [
      headers,
      ...rows.map((row) => headers.map((header) => row[header] ?? "")),
    ];
    const stem = `${kind}_${variant}`;
    await fs.writeFile(
      path.join(output, `${stem}.csv`),
      matrix.map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n",
      "utf8",
    );
    const workbook = Workbook.create();
    const sheet = workbook.worksheets.add(sheetName);
    const lastColumn = column(headers.length - 1);
    const visibleRows = Math.max(matrix.length, 5);
    const block = sheet.getRange(`A1:${lastColumn}${visibleRows}`);
    block.format.font = { name: "Arial", size: 11, color: "#243F4D" };
    block.format.verticalAlignment = "center";
    block.format.wrapText = true;
    block.format.rowHeight =
      variant === "template" ? 30 : kind === "grammar" ? 104 : 66;
    sheet.getRange(`A2:${lastColumn}${visibleRows}`).setNumberFormat("@");
    sheet.getRange(`A1:${lastColumn}${matrix.length}`).values = matrix;
    sheet.showGridLines = false;
    sheet.freezePanes.freezeRows(1);
    sheet.freezePanes.freezeColumns(1);
    sheet.tabColor = "#356B84";
    const header = sheet.getRange(`A1:${lastColumn}1`);
    header.format.fill = "#243F4D";
    header.format.font = {
      name: "Arial",
      size: 11,
      bold: true,
      color: "#FFFFFF",
    };
    header.format.rowHeight = 32;
    header.format.horizontalAlignment = "center";
    header.format.borders = {
      insideVertical: { style: "thin", color: "#FFFFFF" },
    };
    headers.forEach((name, index) => {
      const letter = column(index);
      let width = Math.max(132, name.length * 8 + 24);
      if (
        /^example_/.test(name) ||
        [
          "english",
          "title",
          "summary",
          "learning_objective",
          "rule",
          "common_mistake",
          "notes",
        ].includes(name)
      )
        width = 290;
      if (name === "explanation") width = 390;
      if (name === "dutch" || name === "lesson_id") width = 180;
      sheet.getRange(
        `${letter}1:${letter}${visibleRows}`,
      ).format.columnWidthPx = width;
      if (enums[name])
        sheet.getRange(`${letter}2:${letter}101`).dataValidation = {
          rule: { type: "list", values: enums[name] },
        };
      if (name === "sort_order" || name === "estimated_minutes") {
        sheet
          .getRange(`${letter}2:${letter}${visibleRows}`)
          .setNumberFormat("0");
        rows.forEach((row, rowIndex) => {
          if (row[name])
            sheet.getRange(`${letter}${rowIndex + 2}`).values = [
              [Number(row[name])],
            ];
        });
      }
    });
    for (let row = 2; row <= visibleRows; row++) {
      sheet.getRange(`A${row}:${lastColumn}${row}`).format.fill =
        row % 2 === 0 ? "#F0F4F5" : "#FFFFFF";
    }
    workbook.recalculate();
    const table = await workbook.inspect({
      kind: "table",
      range: `${sheetName}!A1:${lastColumn}${Math.min(matrix.length, 5)}`,
      include: "values,formulas",
      tableMaxRows: 5,
      tableMaxCols: headers.length,
      maxChars: 3500,
    });
    const errors = await workbook.inspect({
      kind: "match",
      searchTerm:
        "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
      options: { useRegex: true, maxResults: 20 },
      maxChars: 1000,
    });
    await fs.writeFile(
      path.join(previews, `${stem}-inspection.ndjson`),
      table.ndjson + "\n" + errors.ndjson,
    );
    for (const [start, end] of [
      [0, 5],
      [6, 11],
      [12, headers.length - 1],
    ]) {
      const range = `${column(start)}1:${column(end)}${Math.min(visibleRows, kind === "grammar" && variant === "example" ? 3 : 5)}`;
      const preview = await workbook.render({
        sheetName,
        range,
        scale: 1,
        format: "png",
      });
      await fs.writeFile(
        path.join(previews, `${stem}-${start + 1}.png`),
        new Uint8Array(await preview.arrayBuffer()),
      );
    }
    const xlsx = await SpreadsheetFile.exportXlsx(workbook);
    await xlsx.save(path.join(output, `${stem}.xlsx`));
    await normalizeSpreadsheetNamespace(path.join(output, `${stem}.xlsx`));
    const sidecar = path.join(output, `${stem}.xlsx.inspect.ndjson`);
    if (await fs.stat(sidecar).catch(() => null))
      await fs.rename(
        sidecar,
        path.join(previews, `${stem}.xlsx.inspect.ndjson`),
      );
    console.log(
      `${stem}: ${headers.length} columns, ${rows.length} data rows, exported and inspected.`,
    );
  }
}
