# Dutchly 0.4.0 — Learning status and grammar practice

This update implements the supplied “Learning Status, Sorting, Google Translate and Grammar Practice” prompt in the existing app.

## Vocabulary improvements

- All / Not studied / Studied filters include counts after CEFR, word type and search filtering. For 501 matching words and 20 studied words, counts are 501 / 481 / 20.
- All is the default. Unstudied words appear first; both groups retain the original built-in/import order.
- Warm orange/cream badges and borders indicate Not studied; cool blue indicates Studied. Text and icons accompany color. Sample/Imported remains a separate source label.
- Only the explicit Mark studied action changes this status. Reading, imports, pronunciation, Google Translate and answer attempts do not.
- Counts, cards and ordering update immediately after the save succeeds.

## Grammar improvements

- All / Not completed / Completed filters use actual completion events.
- Incomplete lessons precede completed lessons within the selected level, preserving curriculum sort order inside each group and stable original lesson numbers.
- The same warm/cool treatment distinguishes lesson status from content source.
- Complete lesson remains an explicit action. Practice never completes a lesson automatically.

## Google Translate

Word details retain Listen and add Google Translate beside it. The URL includes the exact displayed Dutch headword and noun article, with encoded text and `sl=nl&tl=en&op=translate`.

Web links open a new tab with `noopener noreferrer`. Electron permits only the exact Google Translate text-link shape and asks the OS to open it in the default browser; all other external popups remain blocked. No scraping, translation API, audio endpoint, account or API key is used by Dutchly.

Google Translate needs an internet connection. Dutchly does not trigger its audio: use the speaker on that page. Its website controls and browser audio policies can change independently. Built-in Listen remains available locally.

## Grammar Practice

All 72 supplied imported lessons (32 A1 and 40 A2) receive five prepared questions each: 360 questions total. The two built-in sample lessons each retain their original two choice questions and add their three existing example translations, for five questions each.

Each imported lesson combines a targeted multiple-choice blank, a typed blank, sentence ordering or marked-error correction, and two English-to-Dutch translations. Prompts, answers and explanations come from that lesson's existing examples and rule; `scripts/grammar-practice-focus.psv` records authored focus forms and distractors. No runtime AI is involved.

`src/data/grammar-practice-catalog.ts` is the structured curriculum supplement. It includes stable exercise IDs, order, type, answer, accepted alternatives, hint, explanation and optional choices/chunks. `scripts/build-grammar-practice.cjs` reproducibly builds only that supplement, never the existing lesson or vocabulary import files. Run Prettier on its output after rebuilding.

The lookup requires both the source lesson ID and matching objective, rules and examples. This prevents custom content reusing an ID from acquiring unrelated exercises. Other custom lessons use their own saved multiple-choice questions and translated example pairs.

Practice shows one question at a time, saved feedback, Next question, a result such as 4 / 5 correct, and Practise again. Checked answers are persisted as ordinary grammar answer events with unique attempt IDs. Failed saves can be retried without double-counting. Options are locked during saving and after submission. Practice does not consume the Daily Review quota. Existing Review translation IDs remain stable and reuse prepared accepted alternatives.

## Files changed

- `src/domain/learningStatus.ts`, `src/components/LearningStatus.tsx`, theme tokens and vocabulary/grammar screens: status filtering and presentation.
- `src/domain/externalLinks.ts`, `src/components/ui.tsx`, pronunciation controls and `desktop/external-links.cjs`: Translate links and restricted system-browser handling.
- `src/domain/models.ts`, `grammarPractice.ts`, `grammarAttempt.ts`, `translation.ts`: structured exercises, source matching and answer handling.
- `src/components/GrammarPractice.tsx`, `src/state/LearningProvider.tsx`: sequential UI and durable attempts.
- `src/data/grammar-practice-catalog.ts`, exercise builder/focus source, regression tests, version metadata and this guide.
- `scripts/build-desktop.cjs`: prevents loading the packaging configuration twice, which had created duplicate resource copies and Windows file-lock failures.

## Data changes

There is no curriculum/import format change and no storage migration. Existing CSV/XLSX vocabulary and grammar assets remain unchanged. Existing lesson IDs, ordering, datasets and activity are retained. Users with the supplied curriculum already imported get practice automatically when opening the updated app. No re-import or progress reset is needed.

Opening a lesson only reads the supplement. Only an explicit study/completion action or checked answer writes activity. Browser and desktop retain their existing separate storage locations.

## Tests performed

- 107 unit tests passed, including all 72 actual grammar CSV records receiving five source-matched exercises, all exercise types and accepted variants, status counts/order, durable and idempotent attempts, unchanged completion/daily quota, and the desktop external-link allowlist.
- TypeScript, ESLint, Prettier and Git whitespace checks passed.
- Production browser checks passed for 501/20/481 counts, immediate 480/21 updates, scoped search counts, exact Google Translate noun/article URLs and a new tab, unchanged storage after opening Translate, separate lesson completion, a five-question 4/5 practice round, ordering chips, reload persistence and all eight routes.
- Existing browser regression checks passed for all four A1/A2 grammar CSV/XLSX files, vocabulary and grammar imports in the review flow, duplicate protection, cancellations, unchanged fresh statistics, daily review limits, saved answers after process reopening, settings synchronization, and delayed practice-save locking.
- Real bundled Dutch speech produced non-silent audio with external requests blocked in Chrome and the packaged Windows app. Windows also recovered from a deliberately stalled native voice; pronunciation left learning storage unchanged.
- Practice and status screenshots were inspected, including grammar practice at 390px without horizontal overflow.
- The packaged Windows app passed the same status, Translate handoff, practice, saved-answer, ordering and eight-route checks in an isolated profile.
- Closing and launching the packaged app again retained the test profile's 21 studied words, 4 completed lessons, 8 grammar answers and all 72 imported lessons.
- Windows installer creation passed after fixing duplicate configuration loading. All 89 packaged web files and four desktop wrapper files matched the tested source files byte-for-byte.

Browser Google Translate navigation was intercepted in testing; the Windows test records the call to `shell.openExternal`. These checks verify the URL and browser handoff without claiming that Google's remote page or audio was tested. The installer wizard was not run against the user's existing installation.

## How to test manually

1. Close the previous desktop app and install `release/Dutchly-0.4.0-Setup.exe`, then open Dutchly. For development, run `npm.cmd run web` from the project folder and use your usual browser address.
2. Open Vocabulary. Switch All / Not studied / Studied, then try search, word type and CEFR filters. Counts should reflect that combination.
3. In Not studied, open a word and choose Mark studied. Close the preview: its card disappears from this filter and the counts change immediately. All puts studied words after unstudied words.
4. Open a noun. Listen should remain available. Google Translate should open a separate browser page containing its Dutch article and word; use Google's speaker manually.
5. Open Grammar and complete one lesson. Its status becomes blue Completed and it moves behind incomplete lessons while keeping its number.
6. Open a supplied A1/A2 lesson's Practice tab. Answer five questions, including an intentional mistake. Check feedback, use Next question and inspect the final score. The lesson remains incomplete unless you explicitly complete it.
7. Open Statistics and Review, then reopen the app. Real answers and completion remain saved; practice answers have not consumed today's Daily Review allowance.

## Known limitations

- Grading accepts the expected form and explicitly listed alternatives, with case, spacing and terminal punctuation normalization. It is not an unrestricted Dutch-language evaluator; use the lesson wording as prompted.
- Closing or switching away from Practice starts a new round when reopened. Every checked answer remains saved; the unfinished round's screen position and score are not persisted.
- Custom lessons without matching supplied content receive only their own questions/example translations. Custom lessons with neither remain reading/completion-only.
- Google Translate audio is not automatic and requires its website and an internet connection. Built-in local speech is independent.
