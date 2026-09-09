# Dutchly 0.2 architecture

The existing Expo 57, React Native and TypeScript project remains the application. Expo Router connects eight screens: Home, Levels, Vocabulary, Grammar, Review, Statistics, Import and Settings. React Native Web provides the browser UI; Electron loads the exact production web export for desktop.

## Data and actions

```text
Screens → LearningProvider → domain rules → validated AsyncStorage repositories
                         → built-in sample curriculum + imported curriculum
Import screen → browser worker → file parser → row validation → preview
Confirmation → serialized import commit → curriculum repository
Desktop → secure local protocol → the same dist files and browser UI
```

`src/domain/models.ts` retains the existing word-type union and grammar-topic model. Noun forms, verb forms and adjective forms remain distinct. Imported lessons map to `GrammarTopic` with an empty questions array. The original sample exercises remain. `sourceLessonId`, tags, sort order and dataset metadata are additive fields.

`src/state/LearningProvider.tsx` shares content and real progress between screens. It reads storage before showing the learning space. Asynchronous reads never write defaults over damaged data. Each mutation rereads the latest stored value, runs a pure operation and writes the validated result before updating the UI. A promise queue serializes changes within a provider; `navigator.locks` serializes browser/Electron writes across tabs/windows. Native storage uses the in-process queue. Storage events refresh other browser tabs. Errors are visible and damaged curriculum/history blocks writes to that data.

The initial static HTML and first browser render share a loading frame. The responsive shell appears after hydration, avoiding a server/client mismatch between unknown server dimensions and the real viewport. Saved private content is loaded on the device, not embedded in static HTML.

## Independent storage keys

| Key                      | Content                                                    | Reset behavior                                   |
| ------------------------ | ---------------------------------------------------------- | ------------------------------------------------ |
| `@dutchly/settings`      | Existing version 1 daily word target                       | Preserved                                        |
| `@dutchly/curriculum/v1` | Imported words, lessons and dataset metadata               | Preserved                                        |
| `@dutchly/activity/v1`   | Version 1 journal of actual study/completion/answer events | The only key changed by confirmed progress reset |

Starter curriculum remains in `src/data/sample-content.ts`, labeled as sample. No demonstration statistics remain in application data. The first edition persisted only settings, so introducing an empty activity journal requires no destructive migration. Reading an absent key returns empty in memory; it does not overwrite other keys.

Each activity records an ID, item ID, content type, UTC timestamp, local calendar date and device timezone. Answer events also record question ID and correctness. Word/lesson completions are unique per item; practice attempts are unique by attempt ID. Statistics are derived from the journal, not independently maintained counters. See the README for the exact day, streak, period and accuracy rules. Minute ticks and app activation refresh date-sensitive views.

## Import pipeline

`schema.ts` defines downloadable template columns and examples. Papa Parse reads comma-delimited UTF-8 CSV including quoted commas/newlines. ExcelJS reads XLSX values. The parser checks actual file signatures, ZIP metadata and resource limits before reading. Formula, link, rich-text, date and error cells are rejected with locations; imported text is rendered as text, never HTML or code.

The web worker avoids parsing on the UI thread and is terminated on cancel, unmount or a 20-second deadline. Limits are 5 MiB compressed, 25 MiB declared inflated ZIP content, 5,000 data rows and 64 columns. Imports are intended for personal collections, not unbounded databases. The file is processed locally and never sent to a server.

`validateTable` validates headers and rows, preserves supported optional fields and reports errors/warnings by row and column. Any error blocks the complete import. Duplicate words match normalized Dutch + word type + CEFR; grammar duplicates match a supplied source ID or normalized title + CEFR. Duplicates are skipped without replacement. `commitPreview` repeats duplicate checks against current stored curriculum, protecting against stale previews. The commit changes no activity data. Failed writes leave the previous in-memory collection intact.

Daily Review uses `domain/review.ts` and `domain/translation.ts`. Eligibility comes only from the activity journal, not the curriculum array. The legacy `vocabularyPractice` helper is no longer used by Review; existing in-lesson multiple-choice exercises remain available. The selected daily target is reread inside the storage lock before each review save. Deterministic per-day/type/item event IDs prevent replay and cross-tab duplicates. Optional version-1 event fields `source`, `scheduledReview` and `answer` distinguish Daily Review from old practice without rewriting history. Local scheduling, consecutive scheduled successes and next due dates are derived from these events.

Grammar examples may optionally hold explicitly authored `acceptedAnswers`; storage preserves them. No import column was added: current CSV/XLSX grammar examples use the canonical answer only. No conjugations, English plurals or dialogues are inferred from unreliable metadata. See `docs/REVIEW_IMPROVEMENTS.md` for generation and grading boundaries.

Pronunciation is isolated behind `services/pronunciation.web.ts` and a native fallback. The Web Speech service loads local Dutch voices through `getVoices` and `voiceschanged`. If no local Dutch voice exists or the device speech API fails, `offlineSpeech.ts` loads the bundled eSpeak NG worker and voice data from `public/speech`. It selects `nl`, synthesizes in the worker and plays PCM using Web Audio. It resumes audio during the user gesture, limits input to 500 characters, ignores canceled requests, retries failed initialization and stops playback on modal close. No speech service has access to the learning provider or storage. There is no runtime remote dependency, new IPC bridge, or relaxed Content Security Policy; vendor provenance, source and the small CSP compatibility patch accompany the assets.

## Web and desktop

`npm run export:web` creates static files in `dist`. `scripts/preview-web.cjs` serves them on loopback with extensionless route resolution, explicit MIME types and path traversal checks. `netlify.toml` prepares static hosting; no deployment is performed.

Electron uses the secure standard `dutchly://app` protocol so relative routes, workers, fetch, storage and Web Locks work with local packaged files. The renderer has no Node integration or filesystem bridge, uses context isolation and sandboxing, and cannot navigate to external pages. Only the eight known template paths can download through the ordinary Save As flow. The desktop package has no application runtime dependencies; web assets are packaged as resources rather than dragging in the Expo development tree.

## Next architecture boundary

Spaced review scheduling and five-success recovery now live in pure domain modules. A future database/sync adapter must preserve stable item IDs and reconcile activity explicitly. CEFR estimation remains unimplemented. No account, backend, telemetry, paid service or credentials are present now. Native mobile import/speech, cross-device sync and deletion/restoration semantics require separate work.
