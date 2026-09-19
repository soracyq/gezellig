# B1/B2 curriculum

The production vocabulary files are complete and live in `public/import-data/`. The JSON in this draft folder is the original 985-entry B1 authoring checkpoint; it is retained as history and is not the current import dataset.

| Content       | CSV                            | Excel                           | Records |
| ------------- | ------------------------------ | ------------------------------- | ------- |
| B1 vocabulary | `dutch_vocabulary_B1_1500.csv` | `dutch_vocabulary_B1_1500.xlsx` | 1,500   |
| B2 vocabulary | `dutch_vocabulary_B2_2000.csv` | `dutch_vocabulary_B2_2000.xlsx` | 2,000   |
| B1 grammar    | `dutch_grammar_B1.csv`         | —                               | 36      |
| B2 grammar    | `dutch_grammar_B2.csv`         | —                               | 36      |

Vocabulary retains the exact 20-column schema; CSV and Excel contain identical values. Each workbook has one filterable `Vocabulary` sheet, frozen headings, wrapped text and applicable morphology. Select either format per level. All production rows have `is_sample=false`. See `public/import-data/B1_B2_VOCABULARY_SOURCES.md` for sources, row-level attribution, reuse licenses and the limits of editorial CEFR placement.

The grammar CSVs retain the existing 17 columns. B1 orders are 73–108; B2 orders are 109–144. IDs and titles are unique and global ordering is continuous. B1 extends A1/A2 with word order, subordinate and relative clauses, narrative viewpoint, passives, infinitives, pronouns, `er`, hypotheses and cohesion. B2 adds clause hierarchy, information structure, advanced passives, reported uncertainty, modal scope, counterfactuals, compact structures and register. Prerequisite and extension notes explain overlap with earlier levels.

The existing importer creates two translation practice questions from each new grammar lesson's paired examples. It does not supply the separate five-question A1/A2 catalogue for these lessons.

## Verification

Validation on 19 September 2026: 121 automated tests passed; TypeScript, ESLint and formatting checks passed. All four new vocabulary files passed the production browser and packaged Windows import flows, with no invalid rows or new-file duplicates and no changes to learning activity.

The regression tests check exact vocabulary counts; normalized uniqueness across all 5,000 A1–B2 headwords; required fields and permitted levels; applicable noun/verb metadata; identical CSV/Excel values; new-file acceptance and repeat-import protection. The grammar tests also verify that all four A1/A2 reference CSVs remain byte-for-byte unchanged. Structural checks do not certify every linguistic judgment or constitute independent teacher review.

```sh
npm test
npm run typecheck
npm run lint
```

For browser testing, start the production preview on port 4173 and run:

```sh
node scripts/test-vocabulary-imports.cjs --advanced
node scripts/test-grammar-imports.cjs --advanced
```

Both scripts use isolated profiles and import A1/A2 first. Vocabulary tests exercise all eight A1–B2 CSV/Excel files through the chooser, preview and confirmation flow, verify representative metadata, preserve both zero and existing learning activity, and detect duplicates across formats. Add `--desktop` for the packaged Windows app; `GEZELLIG_TEST_EXECUTABLE` selects a local build. Tests never use the learner's real profile.

This update adds importable content and regression checks. It does not change application code, regenerate A1/A2 or replace the published installer.
