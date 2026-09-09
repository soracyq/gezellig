# Dutch vocabulary for import

The A1/A2 grammar curriculum is also available in this folder: **32 A1 lessons and 40 A2 lessons**, in `dutch_grammar_A1.csv/.xlsx` and `dutch_grammar_A2.csv/.xlsx`. See [grammar import instructions, coverage and validation](grammar/README.md).

Created on 9 September 2026 for Dutchly 0.2.0, using the existing vocabulary schema and the supplied example. The original templates and application code are unchanged.

## Files

| Level | Records | CSV                            | Excel                           |
| ----- | ------: | ------------------------------ | ------------------------------- |
| A1    |     500 | `dutch_vocabulary_A1_500.csv`  | `dutch_vocabulary_A1_500.xlsx`  |
| A2    |   1,000 | `dutch_vocabulary_A2_1000.csv` | `dutch_vocabulary_A2_1000.xlsx` |

All four files are in `D:\Codex\Project\Dutch Learning APP\public\import-data`. Choose **one format for each level**. CSV and Excel contain identical cell values; importing both versions does not add more vocabulary.

## How to import

1. Open Dutchly and select **Import**, then **Vocabulary**.
2. Click **Choose CSV or Excel file**.
3. Select the A1 file from the folder above.
4. Review the preview, then click **Confirm import**.
5. Repeat with the A2 file.
6. Open **Vocabulary** and select A1 or A2. Try searching for `café`, `ingrediënt` or `kopiëren`.

On a fresh installation, **A1 adds 493 entries and skips seven existing samples**: huis, fiets, boek, wonen, werken, zijn and klein. A2 adds 1,000. These skipped entries are already available; the files themselves still contain exactly 500 and 1,000 records. If you previously imported other content, more entries may be skipped. Existing entries are preserved rather than overwritten.

Importing makes vocabulary available to study. It does not increase studied counts, accuracy, mistakes or streaks. All testing used isolated profiles; your actual learning history was not reset or changed.

## Content and schema

The original 20 columns and their order are preserved. All entries have a Dutch headword, English meaning, level, supported word type, topic and a paired Dutch/English example. `is_sample` is false. All 720 nouns have an article. Noun plurals are supplied where applicable; blanks are explained for mass nouns and other normally singular uses. All 310 verbs have regularity, separability, auxiliary and past participle. Adjective forms are provided where useful. Other type-specific fields stay empty.

The collection contains 720 nouns, 310 verbs, 210 adjectives, 100 adverbs, 37 pronouns, 29 prepositions, 14 conjunctions, 30 numerals, five particles, 31 expressions and 14 phrases. Articles are mapped to the existing particle category because the schema has no separate article category. Notes explain important secondary meanings, pronoun variants and mixed verb patterns. The importer does not support full conjugation tables as CSV columns, so no new columns were invented.

No conjugation or noun plural was added merely to increase the count. The review identified 18 legitimate morphology/headword overlaps, including **fietsen** (to cycle, also the plural of fiets), **ouder** (parent, also the comparative of oud) and **bedankt** (the conventional thanks expression, also a participle of bedanken). Their independent lexical meanings are retained. The detailed list is in `validation-report.json`.

## Validation performed

- Exactly **500 A1 + 1,000 A2 = 1,500** records.
- **Zero** normalized duplicate headwords within A1, within A2 or between the levels. The stronger accent/spacing/punctuation check also found zero duplicates.
- **Zero** missing required fields, invalid levels, unsupported word types, missing example pairs or invalid article values.
- All four final files passed the application's actual `readImportFile`, `validateTable` and `commitPreview` functions. CSV/XLSX cells and parsed vocabulary objects match exactly.
- Both levels were selected through the file chooser, previewed and confirmed from **both CSV and XLSX in the production browser app and the packaged Windows executable**.
- Tests checked visible accented Dutch text, noun plurals, verb participles, the final entry, duplicate reimport, preview cancellation and unchanged settings/activity. One profile started with zero activity; another contained a real studied-word event. Both histories remained unchanged by import.
- Excel files were rendered and visually checked across all columns and representative noun, verb and adjective rows. The saved files were reopened for metadata previews. The native Microsoft Excel application was not manually tested.

The exporter required two file-level compatibility adaptations: default SpreadsheetML namespace spelling and relative table relationship paths. These preserve the authored cells, formatting, filters and validation lists. The real application reader and cell-by-cell comparison passed after these corrections. No import rules were weakened.

`validation-report.json` contains record counts, checks, file sizes, hashes and the lexical-overlap review. Browser and Windows test evidence is in `test-results/vocabulary-files/` in the project.

## Level assignment and language review

The entries and example sentences were authored for this collection, not copied from a textbook list. A1 prioritises basic everyday needs; A2 expands into routine conversations, housing, services, work, study, travel and leisure. These are editorial teaching bands, not an officially certified word-by-word CEFR list. A language's CEFR level cannot be guaranteed by counting words or passing a file validator.

Language review included articles, plurals, verb forms, intended meanings and example translations. Programmatic article checks establish valid `de`/`het` values and completeness; they do not independently prove dictionary gender for every noun. Targeted references used during review include:

- [Council of Europe CEFR descriptors](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors-search), for the scope of A1/A2 everyday communication.
- [Taaladvies: perfect tense auxiliaries hebben and zijn](https://taaladvies.net/vorming-van-voltooide-tijden-met-hebben-of-zijn-algemeen/), for auxiliary notes.
- [Taaladvies: overlegd and overgelegd](https://taaladvies.net/overleggen-overlegd-of-overgelegd/), for the inseparable discussion meaning of overleggen.
- [ANW: maart](https://anw.ivdnt.org/article/maart) and [ANW: buurman](https://anw.ivdnt.org/article/buurman), for targeted plural checks.

## Reproducing the files

The two `source/*.psv` files are the single authored data source. `scripts/vocabulary-data.mjs` maps them to the exact schema, adds usage notes and validates the data. `scripts/create-vocabulary-files.mjs` exports both formats from those same records using the bundled spreadsheet runtime; `scripts/validate-vocabulary-files.mjs` validates the saved files. `scripts/test-vocabulary-imports.cjs` checks the browser or, with `--desktop`, the packaged Windows app.

Run the file validator from the project folder with `node scripts/validate-vocabulary-files.mjs`. The authoring and browser test scripts use the separate bundled dependencies through `.artifact-build/node_modules` or `DUTCHLY_ARTIFACT_NODE_MODULES`; they add no app dependencies. The browser checks expect the existing production preview on port 4173. No app rebuild is needed to import these local files.
