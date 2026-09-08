import Papa from "papaparse";
import ExcelJS from "exceljs";
import type { ImportKind } from "./schema.ts";
import type { ParsedTable } from "./validate.ts";
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_ROWS = 5000;
export const MAX_COLUMNS = 64;
const MAX_INFLATED_BYTES = 25 * 1024 * 1024;

// Inspect ZIP metadata before XLSX decompression. This is a container guard,
// not a spreadsheet parser. ExcelJS still validates and reads the workbook.
export function checkXlsxContainer(bytes: Uint8Array) {
  const data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--)
    if (data.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  if (end < 0)
    throw new Error(
      "This is not a complete XLSX file. Save it as an Excel Workbook (.xlsx) and try again.",
    );
  const count = data.getUint16(end + 10, true);
  let offset = data.getUint32(end + 16, true);
  let expanded = 0;
  if (count === 65535 || count > 2000 || offset === 0xffffffff)
    throw new Error(
      "This workbook is too complex. Copy the import sheet into a new workbook.",
    );
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    if (
      offset + 46 > bytes.length ||
      data.getUint32(offset, true) !== 0x02014b50
    )
      throw new Error("The XLSX file is damaged.");
    const flags = data.getUint16(offset + 8, true),
      size = data.getUint32(offset + 24, true),
      nameLength = data.getUint16(offset + 28, true),
      extra = data.getUint16(offset + 30, true),
      comment = data.getUint16(offset + 32, true);
    if (flags & 1)
      throw new Error(
        "Password-protected workbooks are not supported. Save an unprotected copy.",
      );
    expanded += size;
    if (size === 0xffffffff || expanded > MAX_INFLATED_BYTES)
      throw new Error(
        "This workbook expands beyond the 25 MiB limit. Split it into smaller files.",
      );
    if (offset + 46 + nameLength + extra + comment > bytes.length)
      throw new Error("The XLSX directory is damaged.");
    names.push(
      new TextDecoder().decode(
        bytes.subarray(offset + 46, offset + 46 + nameLength),
      ),
    );
    offset += 46 + nameLength + extra + comment;
  }
  if (
    !names.includes("[Content_Types].xml") ||
    !names.includes("xl/workbook.xml")
  )
    throw new Error("The selected ZIP file is not an Excel XLSX workbook.");
  if (names.some((n) => /vbaproject|externallinks/i.test(n)))
    throw new Error(
      "Macros and external workbook links are not supported. Use a plain XLSX workbook.",
    );
}
export async function readImportFile(
  name: string,
  buffer: ArrayBuffer,
  kind: ImportKind,
): Promise<ParsedTable> {
  const bytes = new Uint8Array(buffer);
  if (!bytes.length) throw new Error("The selected file is empty.");
  if (bytes.length > MAX_FILE_BYTES)
    throw new Error(
      "Files must be 5 MiB or smaller. Split this file into smaller imports.",
    );
  const extension = name.toLowerCase().split(".").pop();
  if (!["csv", "xlsx"].includes(extension ?? ""))
    throw new Error("Choose a CSV (.csv) or Excel (.xlsx) file.");
  const zip = bytes[0] === 0x50 && bytes[1] === 0x4b;
  if (extension === "csv") {
    if (zip || bytes.includes(0))
      throw new Error(
        "The file does not contain UTF-8 CSV text. Export it as CSV UTF-8.",
      );
    let text: string;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      throw new Error(
        "The CSV is not valid UTF-8. In Excel, choose CSV UTF-8 when saving.",
      );
    }
    const parsed = Papa.parse<string[]>(text.replace(/^\uFEFF/, ""), {
      skipEmptyLines: false,
      delimiter: ",",
      preview: MAX_ROWS + 100,
    });
    if (parsed.errors.length)
      throw new Error(
        `CSV row ${(parsed.errors[0].row ?? 0) + 1}: ${parsed.errors[0].message}`,
      );
    if (parsed.meta.truncated)
      throw new Error(
        `Too many rows. Import at most ${MAX_ROWS.toLocaleString()} records at a time.`,
      );
    const rows = parsed.data
      .map((values, i) => ({ row: i + 1, values }))
      .filter((r) => r.values.some((v) => v.trim()));
    if (!rows.length)
      throw new Error("No headers or data were found in this file.");
    const header = rows.shift()!;
    if (header.row !== 1)
      throw new Error(
        "Put the column headers in the first row, with no title or blank rows above them.",
      );
    if (
      header.values.length > MAX_COLUMNS ||
      rows.some((row) => row.values.length > MAX_COLUMNS) ||
      rows.length > MAX_ROWS
    )
      throw new Error(
        `Use at most ${MAX_ROWS} records and ${MAX_COLUMNS} columns per import.`,
      );
    return { headers: header.values, rows, format: "csv", warnings: [] };
  }
  if (!zip)
    throw new Error(
      "This file is not an XLSX workbook. Renaming a CSV to .xlsx does not convert it.",
    );
  checkXlsxContainer(bytes);
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(
      buffer as Parameters<typeof workbook.xlsx.load>[0],
    );
  } catch {
    throw new Error(
      "The Excel workbook could not be read. Save it as a new .xlsx file and try again.",
    );
  }
  const preferred = kind === "vocabulary" ? "vocabulary" : "lessons";
  const sheet =
    workbook.worksheets.find((s) => s.name.toLowerCase() === preferred) ??
    workbook.worksheets.find((s) => s.actualRowCount > 0);
  if (!sheet)
    throw new Error("This workbook has no data. Fill in a template first.");
  if (sheet.rowCount > MAX_ROWS + 1 || sheet.columnCount > MAX_COLUMNS)
    throw new Error(
      `Use at most ${MAX_ROWS} records and ${MAX_COLUMNS} columns. Remove extra formatted rows and columns if necessary.`,
    );
  const rows: { row: number; values: string[] }[] = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const values: string[] = [];
    for (let i = 1; i <= sheet.columnCount; i++) {
      const cell = row.getCell(i);
      const value = cell.value;
      if (
        cell.type === ExcelJS.ValueType.Formula ||
        (value &&
          typeof value === "object" &&
          ("formula" in value || "sharedFormula" in value))
      )
        throw new Error(
          `Row ${rowNumber}, column ${i}: formulas are not imported. Paste values only.`,
        );
      if (value && typeof value === "object")
        throw new Error(
          `Row ${rowNumber}, column ${i}: use plain text or numbers, without links, dates, errors or rich formatting.`,
        );
      values.push(value === null || value === undefined ? "" : String(value));
    }
    if (values.some((v) => v.trim())) rows.push({ row: rowNumber, values });
  });
  if (!rows.length || rows[0].row !== 1)
    throw new Error("Put column headers in the first worksheet row.");
  const header = rows.shift()!;
  while (header.values.length && header.values.at(-1) === "")
    header.values.pop();
  for (const row of rows)
    while (row.values.length > header.values.length && row.values.at(-1) === "")
      row.values.pop();
  return {
    headers: header.values,
    rows,
    format: "xlsx",
    warnings:
      workbook.worksheets.length > 1
        ? [
            `Reading worksheet “${sheet.name}” only. Other worksheets are not imported.`,
          ]
        : [],
  };
}
