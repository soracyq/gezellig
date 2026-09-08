# Dutchly 0.2 verification

Checked on Windows on 7–8 September 2026. This phase extends the original application with imports, real local statistics, production web serving and a minimal Electron wrapper. All browser and desktop test data was created in isolated profiles; the user's normal browser/app history was not cleared.

## Automated checks

- **66 tests passed** with `npm test`: original curriculum/settings checks, 51 new import/activity/storage tests, and three static-file server tests.
- TypeScript, ESLint and Prettier checks passed.
- Production web export completed with all eight main screens, sitemap and missing-page route. The import worker and eight template/example downloads are included.
- iOS and Android JavaScript/Hermes bundles also exported successfully in this phase. This is compilation evidence, not an installed native-device test.

The tests cover both file formats and content kinds, quoted UTF-8 CSV, optional morphology, CEFR levels, missing/invalid headers and cells, malformed files, row/column/file bounds, worksheet selection, formulas and unsupported cell values. They also cover duplicate skipping, stale preview revalidation, preservation of existing exercises, zero initial statistics, idempotent actions, date periods, leap days, DST, streak rules, damaged storage, failed saves and progress-only reset.

## Production browser checks

Automated in Chrome using Playwright against the ordinary local production server at `http://127.0.0.1:4173`:

- Fresh Statistics shows zero activity and unavailable accuracy. Opening routes, import preview/cancel, successful imports and preview answer reveals do not create progress.
- Vocabulary and grammar examples were each confirmed from CSV and XLSX in fresh profiles. Vocabulary has four example rows; grammar has two. Reimporting the opposite format skips duplicates.
- All eight download links produced browser downloads with the exact expected filenames and bytes.
- An invalid A6 level produced a row/column error and disabled confirmation.
- A noun's article/plural survived import. Mark studied counted one word and became disabled for that item.
- An imported grammar lesson opened with explanations/examples, handled an empty exercise list and recorded completion only after the explicit action.
- A correct submitted practice answer increased the answer count and accuracy. Preview-only mode did not.
- Closing the browser process and reopening the same isolated profile retained content, activity and the changed daily target.
- Reset cancellation preserved all data. Confirmed reset emptied activity while preserving the raw curriculum and settings values byte-for-byte.
- Two tabs prepared the same new word before either confirmed. Concurrent confirmation stored it once; activity remained unchanged.
- All eight routes and the navigation menu worked at 360, 390 and 768 px widths without document overflow. Desktop screenshots at 1440 px were inspected. The sidebar was corrected to its fixed width; import errors and the file chooser were checked on a phone-sized viewport.
- No browser JavaScript errors remained. Static hydration and Metro's public-worker handling were corrected during these checks.

The local static server was also checked for direct route refresh, missing pages, HEAD requests, invalid methods, path traversal rejection and an actionable occupied-port error. Source browser scripts, isolated profiles and screenshots are in ignored `test-results/`.

## Spreadsheet downloads

Four XLSX files were authored with the spreadsheet artifact tool, inspected and rendered across all columns. Four matching CSV files use the same schema and example data. All eight files passed the actual application reader and validator. CSV/XLSX example imports produced matching objects. Empty templates correctly require the user to add rows.

The artifact exporter uses namespace-prefixed SpreadsheetML that ExcelJS does not read reliably. The template generator normalizes only that XML namespace spelling; an XML tree comparison verified unchanged cell values, styles, frozen panes and dropdowns. The supplied downloads are compatible with the importer. The native Microsoft Excel application was not opened for a manual test. Unusual third-party namespace-prefixed XLSX exports may need resaving through a conventional spreadsheet program.

## Windows desktop

Both the source Electron wrapper and the packaged Windows executable were exercised using isolated local profiles:

- The `dutchly://app` origin supports secure-context APIs, Web Locks, local file imports and persistent storage.
- Renderer sandboxing/context isolation are enabled; Node integration and renderer `require` are unavailable. External fetch is blocked.
- Clicking the file chooser and supplying a local CSV/XLSX file imported vocabulary and grammar successfully.
- All eight template links used the native Save As handler and wrote files identical to the packaged downloads. Automation supplied an isolated save destination instead of manually operating the operating-system dialog. Cancellation was checked separately.
- Imports left activity at zero. A real study action persisted after closing and reopening the executable. No renderer errors were reported.
- The Windows x64 NSIS installer was built at `release/Dutchly-0.2.0-Setup.exe`. It installs for the current user without an elevation helper. The packaged executable is `release/win-unpacked/Dutchly.exe`. The installer wizard was not run against the user's Windows installation.

Packaging initially encountered directory-rename errors in this execution environment. The wrapper now reuses the installed Electron distribution and packages its own dependency-free directory. Already downloaded/extracted build-tool caches were recovered by copying their contents and verifying file hashes before marking extraction complete; no downloaded executable contents were modified. A later file lock cleared on retry. These are recorded environment issues, not silent successful-build claims. Build failures return a nonzero exit code.

## Remaining limits

- Windows output is unsigned; the executable's native resource branding is minimal. macOS DMG/ZIP configuration exists but has not been built or tested on a Mac. Signing, notarization and store distribution remain future work.
- Native iOS/Android file importing and physical device testing are not part of this phase. Browser phone layouts were tested.
- No cloud synchronization, activity backup/restore, dataset removal, spaced review scheduling, formal mastery or CEFR assessment exists yet. Source imports should be retained as backups.
- The static website was built and previewed locally, not deployed to a public host. No hosting account or paid service was created. It is not an installed offline PWA; the desktop app includes its resources locally.
- The dependency audit reported **14 moderate, zero high and zero critical advisories**, in transitive URI decoding/UUID and Expo tooling dependencies. Forced major downgrades suggested by `npm audit fix --force` were not applied. Review compatible upstream fixes before public distribution.
- Expo's optional React Native DevTools download and Node's module-format notices can appear in this Windows environment. They did not prevent the tested builds and app flows.

The README, import guide and desktop guide contain the exact reopening and build commands and describe the implemented behavior separately from future work.
