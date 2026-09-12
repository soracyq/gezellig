# Dutchly 0.5.2 — Settings and Levels UI fixes

The reset confirmation contains Cancel reset, Confirm progress reset and the existing close X. Its extra Done action is hidden; other lesson and vocabulary dialogs keep Done. Reset logic is unchanged.

Settings uses the existing 820-pixel maximum width on its outer content container, with `width: "100%"` and `alignSelf: "center"`. This centers the heading and cards within the main page while retaining the shell's 20/36-pixel responsive side padding. The sidebar is unchanged.

Open imports and Reset learning progress use a warm Action variant: existing peach background and dark warm text tokens, orange hover border, and visible keyboard focus. The device icon has a 44-pixel target, pointer cursor, hover/focus states and the accessible label Open imported study files.

Levels captions and accessible labels now use A1 Beginner, A2 Elementary, B1 Intermediate, B2 Upper-intermediate and C1 Advanced. Level selection, content counts and navigation keep their existing behavior.

## Storage inspection and icon behavior

`ImportScreen.web.tsx` reads a selected CSV/XLSX file into a parser worker. `commitPreview` creates vocabulary/grammar records and dataset metadata; `LearningProvider` saves those records through `writeCurriculum` in `src/storage/library.ts` under `@dutchly/curriculum/v1`. The web AsyncStorage adapter uses `window.localStorage`. Original uploaded files are not copied into an imports folder.

The browser stores this data for the current site and browser profile. The Electron desktop app uses the same web storage inside its stable Dutchly Chromium profile, configured in `desktop/main.cjs` under the operating system's app-data directory. That profile contains browser-managed database files, not copies of the learner's CSV/XLSX files.

Consequently, clicking the Settings device icon opens `/import` in both browser and desktop. No folder path or filesystem access API was added. The Import page provides the existing import workflow and dataset list.

## Changed files

- `src/screens/SettingsScreen.tsx`: centered container, icon link, warm buttons and reset-dialog option.
- `src/screens/LevelsScreen.tsx`: CEFR names.
- `src/components/ui.tsx`: optional Done visibility and warm Action variant.
- Root/desktop package manifests and lockfiles, plus `app.json`: version 0.5.2.
- `README.md` and this guide: update instructions and verification notes.

## Verification

The 115 existing unit tests passed, including import validation, progress-reset preservation, Settings, review and storage tests. TypeScript, ESLint and formatting checks passed. The existing browser continuation/review and grammar-scroll regression scripts passed, with all four grammar-scroll cases retaining 0-pixel movement.

An isolated browser UI check imported both CSV examples, verified icon navigation with mouse and keyboard, checked warm hover/focus styling, confirmed that Cancel preserves all saved data and Confirm clears only activity, then reloaded to check persistence. It also checked all five CEFR captions, level selection, vocabulary/grammar navigation, the normal grammar Done action, and all app routes. Settings was exactly centered with no horizontal overflow at widths 390, 768, 1024, 1440, 1920 and 2560 pixels; the 390-pixel Levels layout was also checked. Screenshots and reports are in `test-results/settings-ui/`.

The same functional UI checks passed in the packaged Windows app using a separate test profile, including Settings layout at 1360 pixels. Both runs had no page errors. The production export and 0.5.2 installer build succeeded; all 89 packaged web files match the export. The installer wizard was not run over the user's installation.

## Open the Windows update

Close Dutchly, run `release/Dutchly-0.5.2-Setup.exe`, then reopen it from the existing shortcut. The local data profile stays in the same location.
