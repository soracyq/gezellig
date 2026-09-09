# Dutchly 0.3.0 — review, translation and pronunciation

This update extends the existing Expo app and Windows wrapper. Curriculum files, import formats, navigation and stored learner history are retained. The Windows output is `release/Dutchly-0.3.0-Setup.exe`; `release/win-unpacked/Dutchly.exe` can also be opened directly with its surrounding files in place.

## Audit and implementation

The previous Review screen selected multiple-choice vocabulary questions from the whole library and wrapped back to the beginning. It did not filter by learning history or enforce a persistent daily allowance. The activity journal already recorded real study, lesson completion and answer events. Five-correct mastery existed as a model/documented intention but was not implemented in the old Review flow.

Review now derives eligibility and scheduling from that existing journal. A word must have been marked studied or answered; a grammar lesson must have been completed or answered. Importing, opening a preview, listening and skipping create no review attempt or learning credit. Old real answers establish eligibility but are not retroactively counted as scheduled successes or today's daily-review attempts.

The Settings daily target is the maximum number of mixed review questions. Each eligible word or lesson appears at most once per local calendar day. If the target is 15 and only six suitable learned items exist, Review offers six. A fresh learner sees an empty state linking to vocabulary and grammar. Adding 1,501 words alone leaves Review empty.

Overdue and due items come first, followed by weak items, recent learning and other studied material. Vocabulary and grammar share the queue without a forced ratio. Question variations rotate across daily attempts; they do not pad the current allowance. Optional unlimited preview practice was removed from Review.

Answers are saved immediately. Submission rechecks the current stored target, curriculum and history inside the existing storage transaction. A deterministic day/item identifier prevents a double click, reload or competing browser tab from recording the same daily item twice. Lowering a target preserves answers already recorded; raising it offers additional eligible items. The next local calendar day resets the allowance without deleting history.

Correct scheduled reviews advance the consecutive count, with intervals of 1, 2, 4, 7 and 14 calendar days. Five consecutive correct scheduled reviews mark an item mastered; later scheduled maintenance continues. An incorrect answer resets that count and makes the item due the next day. Early correct reinforcement uses a daily slot but does not advance scheduled mastery.

## Translation questions

Review uses a typed answer, **Check answer**, feedback and **Next question**. The final answer leads to results; there is no extra question after the allowance is used. Existing lesson practice remains available separately.

Nouns require the stored definite article. Stored unambiguous Dutch plurals use `de`; the English prompt says, for example, `Plural of “house”` because the source has no English-plural field. Verbs with supported present-tense data use an explicit pronoun hint and accepted variants such as `jij/je`, `wij/we` or plural `zij/ze`. The checked English-form registry covers the conjugated samples **zijn**, **wonen** and **werken**. Imported verbs without suitable conjugation tables use their canonical infinitive translation.

Grammar questions use existing English/Dutch example pairs. A whole multi-sentence or dialogue pair remains one question, with a multiline answer field. Unrelated examples are never joined to invent a conversation. The feedback shows the lesson and its first stored rule. Optional authored `acceptedAnswers` are supported internally and survive local storage; current CSV/XLSX import schemas remain unchanged.

Grading normalizes Unicode composition, case, repeated whitespace and sentence-ending `. ! ?`. It preserves spelling, accents, apostrophes, commas and word order. Only the canonical answer and explicit alternatives are accepted. It does not infer synonyms or use runtime AI.

## Pronunciation and visual changes

The vocabulary detail headword is now 28 px, bold, using the existing title token. **Browse grammar** was replaced by a keyboard-accessible **Listen** control. **Mark studied** remains a separate action. Grammar card 02 uses the same badge and arrow styling as the other cards.

The web implementation uses the browser's Speech Synthesis API. It selects only Dutch voices, preferring `nl-NL`, then local voices, and speaks the displayed headword. It refreshes when voices arrive asynchronously and cancels previous speech before another request. See MDN's [getVoices documentation](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices), [voiceschanged event](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event) and [cancel method](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/cancel).

When the API or a Dutch voice is unavailable, Listen is disabled with an explanation. Speech errors produce a friendly message. There is no paid speech service or translation scraping. The service has a platform boundary; native Expo builds currently use the unavailable fallback.

## Verification

- `npm run typecheck`, `npm run lint`, `npm run format:check`: pass.
- `npm test`: 83 tests pass. Coverage includes learned-item filtering, caps, four-of-ten persistence, midnight and daylight-saving boundaries, changing targets, duplicate submissions, prioritization, five scheduled successes, reset after mistakes, article/plural/pronoun grading, dialogue pairs and explicit alternatives.
- `npm run export:web` and `node scripts/build-desktop.cjs`: pass; Windows x64 0.3.0 installer and unpacked app produced.
- Vocabulary and grammar validators pass for the existing CSV/XLSX assets. Their incidental report timestamps were restored; curriculum assets were not regenerated.
- `node scripts/test-review-improvements.cjs` exercises the production website with real file-picker imports of both vocabulary CSVs and both grammar XLSX files, all eight routes, an empty initial Review with 1,501 words and 74 lessons, genuine study/completion, daily answers, target changes, statistics, duplicate-tab submission and a 390 px viewport.
- `node scripts/test-review-improvements.cjs --desktop`: pass against the packaged executable using an isolated profile. Both browser and Windows checks fully closed and reopened their processes after four answers, verified all stored data was unchanged, then finished the review with 11 unique answers and 91% accuracy. Both reported zero page errors. Reports and browser screenshots are written under `test-results/review-improvements`.
- Pronunciation tests mock delayed voice loading and verify Dutch selection, exact spoken text, keyboard activation, cancellation, unavailable/error states and unchanged learning storage. They do not verify audible voice quality on a physical speaker.
- Visual inspection covered the large vocabulary headword and Listen focus state, mobile Review layout and completion results.

## Manual check on Windows

1. Close an older running Dutchly window. Run `release/Dutchly-0.3.0-Setup.exe`, then open Dutchly from the Start menu. Alternatively, open `release/win-unpacked/Dutchly.exe` directly.
2. In Settings, set the daily target to 10. Your existing profile and history remain in `%APPDATA%\Dutchly`. Browser and desktop profiles remain separate.
3. Open a vocabulary detail. Check the large bold headword and click **Listen** if a Dutch voice is available. Listening alone should not change progress.
4. Mark some words studied and complete a grammar lesson. Open Review. It should show at most 10 questions, using only learned items that have suitable source data.
5. Type answers, including `de` or `het` where requested. Check an intentionally wrong answer to see feedback. Try **Skip for now** and confirm the completed count stays unchanged.
6. After four answers, close and reopen the app. Review should retain four completed and the remaining allowance. Finish the queue and check the results and Statistics.
7. Lower or raise the daily target and return to Review. Saved answers remain; extra questions appear only if the higher target and remaining learned items allow them.
8. Check that grammar card 02 matches neighboring cards. A fresh profile should have no Review questions until something is studied, even after imports.

## Boundaries

English plurals and full verb conjugation tables are missing from the imported vocabulary schema. No speculative forms were added. Grammar conversation questions depend on actual authored pairs; no new dialogue curriculum was generated. Valid translations outside explicit alternatives can still be marked incorrect. Items without suitable source examples are excluded. Installed voices and audio quality vary by device; native mobile speech, real device audio, macOS packaging and the installer wizard were not exercised in this update. The Windows build remains unsigned and was prepared locally, not published.
