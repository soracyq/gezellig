# Dutch A1/A2 grammar curriculum

Created for Dutchly 0.2.0 on 9 September 2026, following the supplied grammar-curriculum prompt and `grammar_example.xlsx`. The curriculum contains **32 A1 lessons and 40 A2 lessons**, with 144 paired Dutch/English examples. Every lesson has an objective, summary, explanation, rule and meaningful common mistake. Reading estimates range from 3 to 6 minutes.

## Files to import

| Level | Lessons | CSV                                                                           | Excel                                                                          |
| ----- | ------: | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| A1    |      32 | `D:\Codex\Project\Dutch Learning APP\public\import-data\dutch_grammar_A1.csv` | `D:\Codex\Project\Dutch Learning APP\public\import-data\dutch_grammar_A1.xlsx` |
| A2    |      40 | `D:\Codex\Project\Dutch Learning APP\public\import-data\dutch_grammar_A2.csv` | `D:\Codex\Project\Dutch Learning APP\public\import-data\dutch_grammar_A2.xlsx` |

Choose **one format per level**. CSV and Excel contain the same lesson data. The Excel files have a `Lessons` sheet, the original headers in row 1, wrapped text, frozen headers/IDs and filters. No extra title rows or schema columns were added. CSV uses UTF-8 and properly quoted multiline fields, written with PapaParse.

## How to import

1. Open your existing Gezellig app on Windows or in your browser.
2. Select **Grammar**, then **Import grammar**. You can also select **Import** and choose **Grammar**.
3. Click **Choose CSV or Excel file** and open `dutch_grammar_A1.xlsx` from the folder above. CSV works too.
4. Review the preview. On a fresh profile, it offers **32** new lessons. Click **Confirm import (32)**.
5. Repeat with `dutch_grammar_A2.xlsx`, which offers **40** new lessons on a fresh profile.
6. Return to **Grammar**, choose A1 or A2, and click **Open lesson**. Read **Understand**, then **Examples**. Click **Complete lesson** only when you have finished studying it.

No application rebuild or reinstall is needed. These files are available locally; creating them does not automatically install lessons into your personal profile or publish them to a hosted site. Test imports use isolated profiles.

Existing sample lessons remain available and keep their sample labels. The imported curriculum starts with **Building your first sentences** in A1 and **Placing objects and adverbs** in A2. Card numbers may include pre-existing lessons. The curriculum's own order remains consistent.

If you already imported the same IDs or same titles at the same level, the app skips them rather than overwriting them. Do not import both formats expecting additional lessons. If you later edit a previously imported lesson, reimporting it is not an update mechanism in the current app.

## Sequence and coverage

The map was established before lesson authoring. See [the curriculum map](curriculum-map.md) for all lesson titles and prerequisites, and [the coverage audit](coverage-audit.md) for every area evaluated from the prompt.

A1 begins with subjects, verbs and basic sentences, then adds questions, articles, nouns, pronouns, adjectives, negation, prepositions, modals, separable verbs, instructions and coordination. It ends with existential er and a four-lesson introduction to the perfect tense.

A2 adds longer clause patterns, reflexives, expanded noun/pronoun usage, negative meanings, subordinate clauses, fuller perfect and simple-past use, future expressions, polite zou, infinitives, comparisons, relatives, indirect questions, fixed prepositions and basic locative/quantitative er.

The app globally sorts the combined grammar list, so A1 uses `sort_order` 1–32 and A2 uses 33–72. All declared prerequisites occur earlier. The map documents prerequisites; the import schema does not support prerequisite locks. Existing samples or other imported curricula can appear alongside this sequence.

## Validation and evidence

All four final files were actually selected, previewed and confirmed in **both the production browser app and the packaged Windows app**: eight successful file/environment combinations. Each environment imported 32 A1 and 40 A2 lessons from CSV, then repeated the imports from XLSX in a separate profile. No lessons were skipped on these fresh curriculum profiles. Reimporting the opposite format correctly identified all 40 A2 lessons as duplicates.

`validation-report.json` records the saved-file SHA-256 hashes and technical results. All four saved files pass the actual application reader, validator and commit function, with no validation issues. Every cell is compared against the same source records; CSV and XLSX produce identical grammar objects. Duplicate IDs, titles, objectives, rules and explanations are zero. Missing required fields, invalid levels, invalid ordering and missing example pairs are zero. All 72 records use `is_sample = false` and import without exercise arrays.

`import-test-report.json` records actual UI test results by environment and file. The UI checks select each file through the file chooser, preview, confirm, verify every saved field and all card ordering/summaries, open representative lessons, check their explanation/rule/notes and both translated examples, verify the no-exercises message, and check cross-format duplicate protection. They also test preview cancellation. A fresh profile and a profile with a real studied-word event verify unchanged activity, settings and statistics text.

Screenshots and detailed runtime output are in `D:\Codex\Project\Dutch Learning APP\test-results\grammar-files`. Browser screenshots cover accented Dutch and paragraph rendering. Workbook renders cover all 17 columns and the longest explanations. The Excel files were reopened with the actual ExcelJS reader, including sheet/table and formula checks. Native Microsoft Excel was not manually operated.

The bundled spreadsheet exporter needed the same two file-level adaptations used for the established example/vocabulary work: default SpreadsheetML namespace spelling and relative table relationship targets. These preserve the cell values and workbook structure; no application import rules were changed.

## What importing means

Importing makes the lessons **available to learn**. It does not complete lessons or add attempts, accuracy, streaks, mastery or CEFR achievement. Opening the reading preview also does not mark a lesson complete. Use the existing completion action when you have studied it.

The schema supports reading lessons but has no exercise columns. The **Practice** tab therefore explains that no exercises are included. No question JSON or other unsupported data was hidden in cells.

## Source and maintenance

- `curriculum-map.psv`: stable IDs, titles, categories, global sequence, concepts and prerequisite IDs.
- `A1.json` and `A2.json`: one authored lesson record per ID. Together with the map, these are the single canonical source for both export formats.
- `scripts/grammar-data.mjs`: loads the map/content, assembles the exact 17 fields and validates the source.
- `scripts/create-grammar-files.mjs`: exports both formats and renders workbook QA with the bundled artifact-tool runtime.
- `scripts/validate-grammar-files.mjs`: reopens the final files and validates them through the real importer.
- `scripts/test-grammar-imports.cjs`: tests browser imports; add `--desktop` to test the existing packaged Windows executable.

From the project folder, run `node scripts/validate-grammar-files.mjs` to validate the saved files. To run browser tests, start the existing production preview with `node scripts/preview-web.cjs`, then run `node scripts/test-grammar-imports.cjs` in another terminal. Desktop tests use `release/win-unpacked/Gezellig.exe` with an isolated profile and hidden window. They check DOM content but skip screenshots because capturing a hidden Electron window can stall.

Authoring and browser testing use the configured bundled dependencies via `.artifact-build/node_modules` or `DUTCHLY_ARTIFACT_NODE_MODULES`. They add no runtime app dependencies. Change the source files before regenerating; do not independently edit only one export format. Keep IDs stable because the importer uses them for duplicate detection.

## Language and level limitations

This is a **CEFR-aligned Dutch A1/A2 grammar curriculum**, not an official or certified CEFR syllabus. It primarily uses modern Standard Dutch as used in the Netherlands. The [coverage audit](coverage-audit.md) explains level choices and links the linguistic references used for targeted checks.

Advanced passive forms, complex verb groups, advanced er/relative constructions, reported speech and past counterfactuals remain outside this course. The pluperfect is briefly identified for recognition, while productive past-before-past work is reserved for later study.

The editorial review was performed by AI. An independent qualified NT2 teacher or native-language editor still needs to review every lesson for naturalness, accuracy, progression and level suitability before professional publication. Reading-time estimates should be checked with learners. Technical import success does not establish linguistic correctness, learning effectiveness or learner proficiency.
