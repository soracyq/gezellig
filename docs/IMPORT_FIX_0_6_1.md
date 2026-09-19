# Import type detection in Gezellig 0.6.1

A grammar CSV selected on the default Vocabulary import screen produced 17 misleading column errors: missing `dutch`, `english` and `word_type`, plus unknown grammar fields such as `lesson_id` and `title`. The B1/B2 files were valid under their own schemas. Earlier integration tests explicitly selected the correct mode and missed this route through the interface.

The file worker now detects unambiguous vocabulary or grammar headers before validation. The screen follows the detected type, labels the preview as Vocabulary words or Grammar lessons, and explains any automatic switch. Nothing is saved until the learner confirms. Unknown, incomplete or mixed schemas still receive normal validation errors. Detection uses headers, never filenames or CEFR levels. Excel retains the existing preferred-worksheet selection.

## B1/B2 files

| Files in `public/import-data/`             | Records per file |
| ------------------------------------------ | ---------------: |
| `dutch_vocabulary_B1_1500.csv` and `.xlsx` |            1,500 |
| `dutch_vocabulary_B2_2000.csv` and `.xlsx` |            2,000 |
| `dutch_grammar_B1.csv`                     |               36 |
| `dutch_grammar_B2.csv`                     |               36 |

The content files, import schemas, storage identities and learner data are unchanged. Existing checks cover normalized duplicate headwords across A1–B2, matching vocabulary CSV/Excel values, required fields, grammar IDs and continuous lesson order from 73 through 144.

## Updating and importing

- **Installed Windows app:** close Gezellig, run `release/Gezellig-0.6.1-Setup.exe`, then reopen it using the existing shortcut. Installing over the previous version retains its learning profile. Do not clear app storage.
- **Browser running from this project:** build with `npm run export:web`, reopen the same preview address and refresh. Keep the same browser, address and port to retain that browser's learning history.
- **Version 0.6.0 workaround:** select Grammar import before choosing a grammar file, and Vocabulary import for vocabulary. Reselect the file after changing modes.

Import one file at a time. Choose either CSV or Excel for each vocabulary level. Previewing or importing adds no study/completion events; duplicate imports are skipped.

## Regression coverage

`tests/import-detection.test.ts` reproduces the exact 17-error case and checks all six B1/B2 files from both modes, ambiguity, unexpected columns and unchanged input state. The existing browser and packaged Windows tests now support deliberately selecting the wrong mode:

```sh
npm test
npm run typecheck
node scripts/test-vocabulary-imports.cjs --advanced --mismatched-kind
node scripts/test-grammar-imports.cjs --advanced --mismatched-kind
node scripts/test-vocabulary-imports.cjs --advanced --mismatched-kind --desktop
node scripts/test-grammar-imports.cjs --advanced --mismatched-kind --desktop
```

The browser tests require the production preview on port 4173. Desktop tests use `release/win-unpacked/Gezellig.exe` unless `GEZELLIG_TEST_EXECUTABLE` selects another build. They use isolated profiles, check the corrected preview and saved records, open vocabulary details and grammar lessons/practice, verify ordering and duplicate protection, and preserve existing learning activity and statistics.
