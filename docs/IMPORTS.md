# Import vocabulary and grammar

Open **Imports** in Dutchly. Both vocabulary and grammar accept comma-separated UTF-8 CSV files and Excel `.xlsx` workbooks. Download the matching template or example directly from that screen. The same files are stored in [public/templates](../public/templates).

## Try an example

1. Choose Vocabulary or Grammar, then download its CSV or XLSX example.
2. Choose that file in Imports. Review the filename, content type, record counts and preview.
3. Read any row and column messages. Errors block the entire import. Warnings can allow it to continue.
4. Confirm the import to save accepted records, or cancel to leave your library unchanged.
5. Open Vocabulary or Grammar to find the added records. The example vocabulary contains a noun (`tafel`), a verb (`leren`), an adjective (`nieuw`) and an expression (`alstublieft`). The grammar example contains two A1 lessons.

The first import of an example into a fresh library should add four words or two lessons. Importing its other file format afterward should identify the same records as duplicates and add nothing. Import history lists the saved dataset, its format, import date, accepted and skipped counts, CEFR levels and status. A file with no new records does not create an empty dataset.

Example records have `is_sample=true` so they remain identifiable as demonstration content. Importing a file, opening a card or reading a preview does not change learning statistics. Explicit study and practice actions record progress.

## Prepare your own file

Start with the blank template. Keep the column names in the first row and enter one word or one lesson per row below it. The blank template itself has no importable records; it must be filled before use. Required columns must be present and their values must be filled in every data row. Optional columns may be omitted entirely or left empty. An unknown, empty or repeated column header is an error.

For Excel, use the `Vocabulary` sheet for words or the `Lessons` sheet for grammar. If that sheet is absent, the importer chooses the first nonempty sheet. Only one sheet is read, with a warning if the workbook contains others. The supplied workbooks freeze the header row and first column and include dropdowns for common category fields. Keep cells as plain text, numbers or booleans. Copy calculated results and paste them as values before importing. Formulas, formula results stored in formula cells, rich-text cells, hyperlinks, error cells and date objects are rejected. Use the text format for lesson IDs and other values that Excel might turn into dates.

For CSV, save as **CSV UTF-8 (comma delimited)**. Some spreadsheet programs use semicolons by default; select commas explicitly. A comma, quote or line break inside a value requires normal CSV quoting. Double a quote inside a quoted field, for example:

```csv
dutch,english,cefr_level,word_type,example_dutch,example_english
alstublieft,please,A1,expression,"Een koffie, alstublieft.","A coffee, please."
```

Accents and Dutch characters such as `é` and `ï` are preserved. Both Windows and Unix line endings are accepted. Empty data rows are ignored. For CSV, reported row numbers refer to parsed records, so a quoted cell containing a line break can span several text-editor lines while remaining one record.

## Vocabulary columns

| Column            | Required | Accepted content                                                                                                                 |
| ----------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `dutch`           | Yes      | Dutch word or expression. For a noun, keep `de` or `het` in `article`.                                                           |
| `english`         | Yes      | English meaning.                                                                                                                 |
| `cefr_level`      | Yes      | `A1`, `A2`, `B1`, `B2` or `C1`.                                                                                                  |
| `word_type`       | Yes      | `noun`, `verb`, `adjective`, `adverb`, `pronoun`, `preposition`, `conjunction`, `numeral`, `particle`, `expression` or `phrase`. |
| `topic`           | No       | Topic label. Defaults to Imported vocabulary.                                                                                    |
| `example_dutch`   | No       | Dutch sentence. Supply `example_english` with it.                                                                                |
| `example_english` | No       | English translation. Supply `example_dutch` with it.                                                                             |
| `notes`           | No       | Usage notes.                                                                                                                     |
| `tags`            | No       | Tags separated by semicolons, such as `home;furniture`.                                                                          |
| `article`         | No       | Nouns only: `de` or `het`.                                                                                                       |
| `plural`          | No       | Nouns only: plural form.                                                                                                         |
| `diminutive`      | No       | Nouns only: diminutive form.                                                                                                     |
| `regularity`      | No       | Verbs only: `regular` or `irregular`.                                                                                            |
| `separable`       | No       | Verbs only: `true` or `false`.                                                                                                   |
| `auxiliary`       | No       | Verbs only: `hebben`, `zijn` or `hebben / zijn`.                                                                                 |
| `past_participle` | No       | Verbs only: past participle.                                                                                                     |
| `inflected`       | No       | Adjectives only: inflected form.                                                                                                 |
| `comparative`     | No       | Adjectives only: comparative form.                                                                                               |
| `superlative`     | No       | Adjectives only: superlative form.                                                                                               |
| `is_sample`       | No       | `true` for demonstration content, otherwise `false` or empty.                                                                    |

Leave type-specific fields empty for other word types. A verb does not need an article or a plural; populating a noun field on a verb is an error. Missing optional morphology stays unknown. It is not inferred from the word. If a noun repeats the specified article in `dutch`, the preview removes that repeated article and reports a warning.

## Grammar columns

| Column               | Required | Accepted content                                                                   |
| -------------------- | -------- | ---------------------------------------------------------------------------------- |
| `lesson_id`          | No       | Stable unique text ID. Reusing one identifies a duplicate.                         |
| `cefr_level`         | Yes      | `A1`, `A2`, `B1`, `B2` or `C1`.                                                    |
| `title`              | Yes      | English lesson title.                                                              |
| `category`           | No       | Category such as Articles or Word order. Defaults to General grammar.              |
| `learning_objective` | No       | What the learner will be able to do. Defaults to the title.                        |
| `summary`            | No       | Short card description. Defaults to the objective or the start of the explanation. |
| `explanation`        | Yes      | Main explanation in English.                                                       |
| `rule`               | No       | Rule text. Use separate lines for multiple rules.                                  |
| `example_dutch_1`    | No       | First Dutch example, paired with `example_english_1`.                              |
| `example_english_1`  | No       | English translation of the first example.                                          |
| `example_dutch_2`    | No       | Second Dutch example, paired with `example_english_2`.                             |
| `example_english_2`  | No       | English translation of the second example.                                         |
| `common_mistake`     | No       | Mistake explanations. Use separate lines for multiple entries.                     |
| `notes`              | No       | Usage notes. Separate lines become separate notes.                                 |
| `sort_order`         | No       | Nonnegative whole number.                                                          |
| `estimated_minutes`  | No       | Whole number from 1 to 120. Defaults to 5.                                         |
| `is_sample`          | No       | `true` for demonstration content, otherwise `false` or empty.                      |

This version imports lesson text, examples and notes. It does not import or generate exercises. Imported lessons can be read and explicitly completed. Existing built-in lessons and their exercises remain available, including when an imported row duplicates a built-in lesson.

## Validation and duplicates

Header names ignore surrounding spaces and letter case. CEFR levels and enum fields are normalized for case. Boolean fields accept `true`/`false` and also `yes`/`no`; the templates use `true`/`false` consistently.

The preview identifies invalid values by row and column. Correct every error and choose the updated file again. An otherwise valid row does not bypass an error elsewhere in the file. No records are saved until the confirmation step succeeds.

Vocabulary duplicates use the combination of Dutch term, word type and CEFR level. Grammar duplicates use either the lesson's stable ID or its title and CEFR level. Dutch terms, lesson titles and IDs are compared after Unicode normalization, trimming, collapsing repeated whitespace and ignoring case. Duplicate checks include the built-in library, previously imported records and earlier accepted rows in the same file.

Duplicates are skipped with a warning. Imports never replace an existing record or its exercises. The confirmation step checks duplicates again against the latest saved library, so another browser tab importing the same content cannot intentionally add a second copy. The final counts may therefore differ from the preview if the library changed in another tab.

## Limits and storage

- Accepted extensions: `.csv` and `.xlsx`. Renaming another file does not convert it.
- Maximum file size: 5 MiB (5,242,880 bytes).
- Maximum data rows: 5,000, plus one header row.
- Maximum columns: 64. Current templates use 20 vocabulary columns and 17 grammar columns.
- Maximum cell text: 20,000 characters.
- Maximum declared uncompressed XLSX archive size: 25 MiB.
- Encrypted workbooks, macro-enabled files and workbooks containing external links are rejected.

The browser validates files in a worker so the interface can stay responsive. Import errors leave existing content and progress intact. Files are processed locally; there is no upload service or account synchronization. Saved imports belong to the current browser profile and site address, or to the installed desktop app's local profile. Clearing that site's storage removes its imports and progress. Keep your original source files as a backup.

Progress reset clears learning activity only. It preserves imported datasets, built-in content and settings. Dataset deletion, editing imports in place, exercise imports and cloud backup are outside this version.

## Regenerate the downloads (maintainers)

The eight checked-in downloads are ready to use. Running or building Dutchly does not require the spreadsheet authoring runtime.

If the import schema changes, the optional `scripts/create-templates.mjs` command regenerates the files from `src/imports/schema.ts`. It needs Node 24 or newer and the bundled `@oai/artifact-tool` and `jszip` dependencies supplied by Codex. Use the workspace dependency loader to locate those dependencies. Set `DUTCHLY_ARTIFACT_NODE_MODULES` to that bundle's `node_modules` directory, or create a `.artifact-build/node_modules` junction to it. Keep that runtime separate from the application's `node_modules`.

After following the Spreadsheets skill's operation marker requirement, run the builder with the bundled Node executable:

```powershell
node scripts/create-templates.mjs
```

The builder creates the four CSV files and four XLSX files, with workbook previews and compact inspections in the ignored `test-results/template-previews` directory. It adjusts the exported SpreadsheetML namespace spelling for ExcelJS compatibility without changing cell contents or formatting. Review the previews and run the project's import tests before committing regenerated downloads.
