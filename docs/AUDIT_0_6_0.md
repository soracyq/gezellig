# Gezellig 0.6.0 audit

Initial findings recorded before implementation on 2026-09-13, against commit
`0aab178`. Work is isolated on `codex/v0.6.0-audit`. Version, storage identities,
published release and the user's unrelated `.gitignore` / `Prompt Source/` work
remain unchanged. The initial audit was committed as `cc6b6b7` before repairs.

## Baseline and scope

Inspected routing, all eight screens, shared controls and tokens, providers,
storage schemas and locks, curriculum imports, activity/statistics, translation
and review scheduling, speech services, desktop protocol/security, build scripts
and existing tests. Architecture remains Expo/React Native Web with local storage
and an isolated Electron wrapper. No migration or architecture rewrite is needed.

Baseline: `npm ls --depth=0`, `npm run typecheck`, `npm run lint`, and `npm test`
passed (115 tests). `npm audit --json` reports 14 moderate package entries from
two underlying advisories; no high/critical dependency entries.

## Findings and planned repairs

| ID / severity                                | Location                                                      | Problem and impact                                                                                                                                                           | Recommended repair                                                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| H1 High                                      | `src/domain/translation.ts`                                   | Valid imported nouns without optional article/plural fields generate no Review questions after being studied.                                                                | Use the exact supplied singular as a fallback; never invent an article. Retain existing morphology questions.                      |
| M1 Medium                                    | `src/state/LearningProvider.tsx`                              | A delayed refresh can replace a newer completed transaction's UI state; overlapping refreshes can also resolve out of order. Disk data survives, but progress appears stale. | Serialize refresh reads with writes and invalidate obsolete reads/unmounted work. Exercise the race in a browser regression.       |
| M2 Medium                                    | `src/storage/library.ts`                                      | Curriculum validation accepts duplicate IDs within a content collection; cards and progress references become ambiguous if stored data is damaged.                           | Reject duplicates on read/write without deleting or rewriting the original data; permit IDs shared across different content types. |
| M3 Medium                                    | `src/domain/activity.ts`                                      | Mistake-item counts merge vocabulary and grammar with the same item ID.                                                                                                      | Key uniqueness by content type and item ID.                                                                                        |
| M4 Medium                                    | Shared controls and screen selectors                          | Most button variants lack consistent hover/pressed/focus treatment; selected button state is not consistently exposed through appropriate web ARIA.                          | Reuse themed interaction states, accessible selected/pressed attributes and icon controls.                                         |
| L1 Low                                       | `src/theme/tokens.ts`, `src/components/ui.tsx`, answer inputs | Near-duplicate spacing, radii, typography and input styling make shared elements inconsistent.                                                                               | Add a small shared control/layout token set, reuse answer input styling, keep the established visual hierarchy.                    |
| L2 Low                                       | `src/components/ui.tsx`                                       | Shared modal has no explicit accessible dialog name; heading/action rows can squeeze headings at narrow widths.                                                              | Name dialogs, use shared close control and allow heading/action wrapping; verify keyboard focus and short/narrow viewports.        |
| D1 Medium, unresolved dependency             | `decode-uri-component` through Expo Router / query-string     | GHSA-vcc3-ghjq-m6fr: malformed encoded input can cause excessive decode work. Fixed upstream 0.5.0 changes to ESM; blind override risks breaking CommonJS consumers.         | Investigate a compatible targeted repair and exercise malformed route input; do not force broad upgrades.                          |
| D2 Moderate advisory, no affected call found | `uuid` through ExcelJS/xcode                                  | GHSA-w5hq-g745-h8pq concerns buffer-writing v3/v5/v6 APIs. Inspected consumers only call v4; app IDs use Expo Crypto.                                                        | Record exposure assessment; avoid an unrelated major upgrade. Recheck when upstream dependencies update.                           |

No confirmed critical application defect at this checkpoint. Runtime testing may
add findings. Existing scheduling is already centralized: first review next day;
correct intervals 1/3/7/14 days; fifth scheduled correct answer masters the item;
wrong answers reset the streak and return next day. Preserve these semantics.

## Verification plan

Run domain/storage regression tests, existing real-file import/browser suites,
Review/continuation and Settings synchronization suites, grammar scroll checks,
pronunciation and save-failure checks. Inspect all routes at large desktop,
laptop/tablet and mobile widths, including console errors, modal keyboard access,
reset/data preservation and reload/reopen persistence. Export web and build an
unpacked desktop app in an isolated audit directory; do not replace or publish
the release installer.

## Repairs and design changes

No critical application defect was confirmed. H1, M1–M4 and L1–L2 above are
repaired. A further **Medium** issue was found in
`src/screens/ImportScreen.web.tsx`: its deadline started only after the browser
finished reading the file. The deadline now covers both reading and parsing, and
invalidates late results so a timed-out read cannot restart the worker or replace
the current preview. A regression supplies a stalled file promise, advances the
deadline, then releases that promise and verifies storage stays unchanged.

The learning provider now queues reads with transactions. A delayed read can no
longer overwrite a newer saved completion. Unmounted provider lifetimes ignore
their old read results. Storage tests cover duplicate IDs without rewriting the
damaged original; vocabulary and grammar may legitimately use the same ID and
their mistake counts now remain separate.

Shared controls keep the warm orange/peach and blue identity. Primary, secondary,
warm, quiet/link, destructive and icon actions share dimensions, rounded corners,
spacing and interaction states. Reset's Settings trigger remains warm; only the
final confirmation uses a muted destructive tone. Disabled link actions no longer
retain a navigable Link wrapper. Primary white text originally had approximately
4.26:1 contrast; the new action color provides 4.91:1. Badges, orange labels,
selected target text and error messages use the darker semantic text token.

Review and Grammar share answer-field styling. Cards remain flat and use the
existing shared radius, padding and borders; the shared dialog has a restrained
shadow. Modal widths, content widths, button heights and title sizes are theme
tokens. Page headings wrap alongside actions. Dialogs have accessible names,
shared close buttons, keyboard focus containment and internal scrolling. Filter
buttons expose `aria-pressed`, navigation exposes `aria-current`, decorative
icons are hidden from assistive technology, and answer failures are announced.
Text/icons continue to identify warm new and cool completed states.

The storage icon still opens Import on both web and desktop: imports are parsed
into browser storage, not copied into a study-files directory. Desktop keeps its
existing Chromium profile. No folder path or filesystem bridge was invented.
Settings uses `width: 100%`, the existing 820px maximum width and `alignSelf:
"center"` inside the centered application container.

## Feature and data integrity results

- Home continuation, random imported words and next-unlearned behavior passed.
  Opening/listening/importing do not create study activity.
- Vocabulary and Grammar filters, search, status changes, ordering, Google
  Translate links, authored exercises and saved attempts passed. Grammar
  completion still moves completed lessons to the end with zero measured scroll
  movement in the dedicated browser and Windows cases.
- Review tests cover unseen exclusion, Refresh without answers, mixed material,
  daily target changes, typed answers/normalization, wrong-answer reset,
  1/3/7/14-day spacing, fifth scheduled correct mastery, duplicate submissions,
  overdue priority, midnight, DST and full close/reopen persistence.
- Statistics derive from stored events. Reset clears only progress and retains
  imported curriculum and Settings; cancel changes nothing. No learner profile
  was used for testing: browser and desktop suites create isolated profiles.
- Real A1/A2 vocabulary and grammar CSV/XLSX imports passed preview, cancellation,
  confirmation, accents, ordering, duplicate handling and unchanged statistics.
- Review candidates are restricted to current curriculum. Historical activity
  with a missing curriculum reference is retained as history; no automatic
  deletion or migration was introduced. Lifetime/mastery history is not a count
  of currently available curriculum.
- Existing schemas reject malformed dates, unsupported storage versions and
  duplicate event IDs. Storage keys, desktop origin/application identity,
  curriculum content and package version remain unchanged.

## Important changed files

| Area                            | Files                                                                                                                                                                                                     |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reliability and learning        | `src/state/LearningProvider.tsx`, `src/storage/library.ts`, `src/domain/translation.ts`, `src/domain/activity.ts`, `src/screens/ImportScreen.web.tsx`                                                     |
| Shared design and accessibility | `src/theme/tokens.ts`, `src/theme/webStyles.ts`, `src/components/ui.tsx`, `src/components/AppShell.tsx`, `src/components/GrammarPractice.tsx`, `src/components/PracticeQuestion.tsx`                      |
| Screen integration              | `src/screens/SettingsScreen.tsx`, `src/screens/LevelsScreen.tsx`, `src/screens/VocabularyScreen.tsx`, `src/screens/GrammarScreen.tsx`, `src/screens/ReviewScreen.tsx`, `src/screens/StatisticsScreen.tsx` |
| Regression coverage             | `tests/activity.test.ts`, `tests/library.test.ts`, `tests/review.test.ts`, `scripts/test-audit.cjs`                                                                                                       |
| Desktop test isolation          | Seven existing `scripts/test-*.cjs` accept `GEZELLIG_TEST_EXECUTABLE`, allowing the audit build to be tested without replacing the release build.                                                         |
| Report                          | `docs/AUDIT_0_6_0.md`                                                                                                                                                                                     |

## Commands and results

Commands were run from the repository root in Windows PowerShell (`npm.cmd` /
`npx.cmd`). Detailed output and screenshots are under ignored `test-results/audit`.

| Command                                       | Result                                                                                                                                                                                                                                               |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ls --depth=0`                            | Pass: installed direct dependency tree is valid. No dependency versions changed.                                                                                                                                                                     |
| `npm run typecheck`                           | Pass.                                                                                                                                                                                                                                                |
| `npm run lint`                                | Pass, zero warnings after repairs.                                                                                                                                                                                                                   |
| `npm run format:check`                        | Pass.                                                                                                                                                                                                                                                |
| `npm test`                                    | Pass: 118 tests, up from 115.                                                                                                                                                                                                                        |
| `node scripts/validate-vocabulary-files.mjs`  | Pass. Generated timestamp-only report changes were restored; curriculum files unchanged.                                                                                                                                                             |
| `node scripts/validate-grammar-files.mjs`     | Pass; same timestamp-only handling.                                                                                                                                                                                                                  |
| `npm run export:web`                          | Pass: all 10 static routes exported to `dist`.                                                                                                                                                                                                       |
| `node scripts/test-continue-review.cjs`       | Pass: Home, Review Refresh/Test, target limits, persistence and all eight main routes.                                                                                                                                                               |
| `node scripts/test-grammar-scroll.cjs`        | Pass: four cases, maximum measured movement 0px.                                                                                                                                                                                                     |
| `node scripts/test-settings-sync.cjs`         | Pass: cross-tab target changes and preserved history.                                                                                                                                                                                                |
| `node scripts/test-practice-save.cjs`         | Pass: locked saves and duplicate activation protection.                                                                                                                                                                                              |
| `node scripts/test-learning-improvements.cjs` | Pass: imported curriculum, statuses, translations and grammar exercise styles.                                                                                                                                                                       |
| `node scripts/test-review-improvements.cjs`   | Pass: real imports, mixed typed review, concurrent tabs, target changes and full reopen.                                                                                                                                                             |
| `node scripts/test-local-speech.cjs`          | Pass: actual locally generated non-silent PCM, cancellation and no progress mutation.                                                                                                                                                                |
| `node scripts/test-vocabulary-imports.cjs`    | Pass: all four A1/A2 CSV/XLSX files.                                                                                                                                                                                                                 |
| `node scripts/test-grammar-imports.cjs`       | Pass: all four A1/A2 CSV/XLSX files.                                                                                                                                                                                                                 |
| `node scripts/test-audit.cjs`                 | Pass: delayed hydration, complete reopen, 40 route/width combinations, centered Settings, keyboard dialog/storage action, file-read timeout, reset preservation and narrow/short dialogs/navigation. No captured browser console errors or warnings. |
| `npm audit --json`                            | Exit 1: 14 moderate package entries from two underlying advisories below; zero high/critical entries. This is not a clean audit result.                                                                                                              |
| `git diff --check`                            | Pass.                                                                                                                                                                                                                                                |

The browser suite uses a production preview started with `npm run preview:web`.
Widths tested: 360, 768, 1024, 1440 and 2560 pixels. Additional modal/navigation
checks run at 360×640 and 640×360. Screenshots were visually inspected at mobile
and desktop widths; automated checks also measure horizontal overflow and
Settings centering.

### Windows build and development checks

Built an unpacked Windows x64 app using the existing electron-builder
configuration with only the output directory overridden:

```powershell
@'
const path = require('node:path');
require('electron-builder').build({ projectDir: path.resolve('desktop'), dir: true, config: { electronVersion: require('electron/package.json').version, directories: { output: path.resolve('.artifact-build/audit-desktop') }, publish: null } }).catch(e => { console.error(e); process.exitCode = 1; });
'@ | node
```

Build passed. Output: `.artifact-build/audit-desktop/win-unpacked/Gezellig.exe`.
The existing NSIS installer was not rebuilt, replaced or published. Its SHA256
remains `a43123cd1cae86541295a5d53ed03c324323af20cf7ba042b39e68e29efb61f4`.

With `GEZELLIG_TEST_EXECUTABLE` set to that unpacked executable, all seven existing
desktop-capable suites passed:

```powershell
node scripts/test-continue-review.cjs --desktop
node scripts/test-grammar-scroll.cjs --desktop
node scripts/test-learning-improvements.cjs --desktop
node scripts/test-review-improvements.cjs --desktop
node scripts/test-vocabulary-imports.cjs --desktop
node scripts/test-grammar-imports.cjs --desktop
node scripts/test-local-speech.cjs --desktop
```

`node scripts/test-local-speech.cjs --desktop --source --stalled-native` also
passed against the development Electron wrapper: a silent native voice falls
back to the bundled voice, with actual generated audio and unchanged storage.

Both `node scripts/test-audit.cjs --desktop` and
`node scripts/test-audit.cjs --desktop --source` passed: delayed hydration,
process close/reopen, eight main routes, named dialogs and keyboard focus,
storage navigation, stalled file handling and reset preserving a real import.
Neither run captured renderer console errors or warnings. The new desktop test
harness initially navigated before initial rendering and checked titles before
Head settled. It now waits for the first heading and the expected title; the
reruns above passed. The first baseline browser attempt also needed the local
preview server started before it could connect.

The user requested uploading the completed work to GitHub. The two newer remote
README edits are preserved when integrating this branch; no release or tag is
created. User-local prompt documents and unrelated ignore-file edits are excluded
from the upload.

### Remaining dependencies and test limitations

1. **Decoder availability risk remains.** Installed `decode-uri-component@0.2.2`
   is reached through `query-string@7.1.3` and Expo Router. The
   [upstream advisory](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr)
   fixes excessive work on malformed input in 0.5.0. That release is ESM, while
   the installed caller expects a callable CommonJS export. A blind override
   risks breaking routing; changing query-string to its new major also changes
   exports expected by Expo. No forced downgrade, custom decoder fork or broad
   package upgrade was introduced. This needs a compatible upstream dependency
   update and routing regression coverage; it is not claimed fixed.
2. **UUID advisory remains in transitive packages.** The
   [upstream advisory](https://github.com/advisories/GHSA-w5hq-g745-h8pq)
   concerns provided-buffer bounds in v3/v5/v6. Inspected ExcelJS and xcode
   callers use v4; Gezellig itself uses Expo Crypto. This is a call-site exposure
   assessment, not a claim that the installed affected package is patched.

No hard-coded service credentials, new tracking, unsafe imported HTML rendering
or broad desktop filesystem bridge was found in the inspected application code.
The existing exact external-link allowlist and path traversal protections pass
their tests. This audit is not an exhaustive penetration test.

Tests used Windows, Chrome and Electron. macOS, iOS, Android, Firefox and Safari
were not executed. Offline speech checks verify generated audio buffers and
playback state, not a human listening through this computer's speakers. Existing
integration harnesses use locally provisioned Playwright under
`.artifact-build/node_modules` and the installed Chrome executable; they are not
yet provisioned automatically by `npm ci` or CI. Existing
Node module-type notices and Expo terminal color-environment notices remain;
they are tooling notices, not captured application runtime errors. No fresh NSIS
installation, code signing, release or tag was performed.

## Recommendation

Recommend **0.6.1** for this bounded reliability/accessibility patch. The actual
version remains **0.6.0**. The next three priorities are:

1. Resolve the decoder advisory with compatible upstream packages and routing tests.
2. Add user-controlled backup/restore for local curriculum, settings and progress.
3. Add CI for typecheck, lint, domain tests, web export and repeatable browser smoke tests.
