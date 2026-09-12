# Dutchly 0.5.0 — Continue learning and spaced review

Implements the supplied `Dutchly_Codex_Prompt_Continue_Learning_Review.md` in the existing app. No curriculum is regenerated and no progress is reset.

## Continue Learning and the featured word

Home says Start learning until there is an explicit word-studied or lesson-completed event. It then says Continue learning. Practice-only answers do not change this label.

The destination follows the most recent word-studied event that still belongs to the collection. It scans forward in the original curriculum/import order, skipping studied IDs, and wraps to earlier unstudied gaps if necessary. With no valid saved position it starts at the first unstudied word. When every word is studied, Home displays a completion message. The destination URL includes the word's level and ID. Merely opening it creates no learning event.

The featured word chooses randomly from imported vocabulary, falling back to labeled built-in samples when nothing is imported. The choice stays fixed during the Home visit. A separate cosmetic preference stores its ID to avoid repeating it on the next visit or restart when there are alternatives. This does not affect study status, Statistics, or Review. Its Explore word link opens that exact record.

## Grammar scroll preservation

The behavior in this section describes 0.5.0. Version 0.5.1 supersedes it with immediate sorting and viewport preservation; see [the grammar sorting update](GRAMMAR_SCROLL_0_5_1.md).

Opening a grammar preview captures the current visible card IDs and their order. Completion updates the actual history, badges and filter counts immediately while that card list stays in place through closing the preview. This also preserves the modal's original focus target so restoring focus does not scroll to a card that moved to the bottom.

Changing a status/level filter or returning to Grammar recomputes the normal incomplete-first order. In Not completed, a newly completed card can therefore remain visible with its updated Completed badge until that refresh. The page explains when ordering refreshes. No timeout-driven reorder or automatic scroll is used.

## Review algorithm

1. Replay saved activity into independent vocabulary and grammar records. Only explicit word-studied and lesson-completed events establish eligibility; imports, featured words, opening content and practice-only answers do not.
2. First review is scheduled one local calendar day after study/completion. Only non-mastered items whose own due day has arrived enter the daily candidate set.
3. Prioritize earlier due dates, then previously incorrect items. Use a daily pseudorandom rank to break equal-priority ties, apply the remaining Settings allowance, then separately shuffle the selected questions. Vocabulary and grammar share the selected pool.
4. The daily ranks are stable for the day and item IDs, keeping selection/order consistent across renders, reloads and tabs. Older overdue items retain priority; deferred items stay due in the journal.
5. Refresh shows each selected word's meaning, applicable noun/verb/adjective details and example, or each lesson's key rule and up to two examples. Previous/Next material allow reading without writing activity. Start test appears after the last refresh card.
6. Test keeps the existing typed English-to-Dutch question format and accepted variants. Each word/lesson gets at most one counted daily review attempt, irrespective of the noun, verb or lesson-example variation asked. The provider rechecks current eligibility, local day and quota inside its storage lock before saving.
7. A scheduled correct answer advances the streak. Correct reviews 1–4 schedule the next review after 1, 3, 7 and 14 days respectively; correct review 5 marks the item mastered. A wrong review resets the streak to zero and schedules the next day. It can later complete the same learning loop successfully. No early testing is offered by the normal daily session.

Intervals and the mastery threshold are centralized in `REVIEW_SCHEDULE` in `src/domain/review.ts`.

## Persistent records and compatibility

The existing activity journal is the persistent source of truth. Replaying it reconstructs the following fields without introducing a second progress store that could drift out of sync:

| Requested field       | Code field                                                 |
| --------------------- | ---------------------------------------------------------- |
| correct_review_streak | consecutiveCorrectReviews                                  |
| total_review_attempts | reviews                                                    |
| total_review_mistakes | mistakes                                                   |
| last_reviewed_at      | lastReviewedAt (ISO timestamp, absent before first review) |
| next_review_at        | nextReviewAt (local calendar date; null when mastered)     |
| review_status         | reviewStatus: learning / mastered                          |

Vocabulary variants share `vocabulary:<word ID>`; grammar variants share `grammar:<lesson ID>` and retain their individual question IDs in saved attempts. Existing scheduled credits are honored, with at most one streak increment per item/day. Future due dates are calculated with the new intervals. Historical unscheduled reviews retain their attempt/mistake records but do not earn scheduled streak credit. Ordinary lesson practice remains in Statistics and does not change the review streak or schedule.

No import format, curriculum ID, activity storage key or journal version changes. The only new storage key is `@dutchly/home-featured-word/v1`, containing a cosmetic word ID.

## Main files changed

- `src/domain/homeLearning.ts` and `src/screens/HomeScreen.tsx`: continuation and featured-word selection.
- `src/screens/GrammarScreen.tsx`: hold visible order through completion and modal close.
- `src/domain/review.ts`: due eligibility, per-item scheduling, daily selection and mixed presentation.
- `src/components/ReviewRefresh.tsx` and `src/screens/ReviewScreen.tsx`: Refresh → Test and clear no-due/completion states.
- `src/screens/VocabularyScreen.tsx`: shared word-label helper; existing study controls remain intact.
- Tests and browser/Windows regression scripts, version metadata and this guide.

## Manual checks

1. Close Dutchly, install `release/Dutchly-0.5.0-Setup.exe`, and open it again. Use the same desktop profile or browser address to retain your existing data.
2. On Home, choose Start/Continue learning. Mark the displayed word studied, return Home, and verify Continue opens the next unstudied word.
3. Open a grammar lesson partway down its list, complete it and close the preview. Its badge should update without moving the page. Change filters to apply the new sorting.
4. Newly studied material is due tomorrow. With older due material, Review starts with Refresh; step through it and select Start test. Refreshing should not change Statistics or review streaks.
5. Submit correct and incorrect answers, reopen the app, and check that saved activity remains. A wrong answer returns the item to tomorrow's learning loop. The normal daily session respects the target in Settings.
6. Return Home on another visit and check the featured imported word changes when alternatives exist. Explore word should show that exact word without marking it studied.

## Verification performed

- 115 unit tests passed, including new/returning/completed Home states, continuation across skipped positions, nonrepeating imported featured words, tomorrow's first review, due-only eligibility, mixed daily selection, older-item retention, daily limits, wrong-answer recovery, five spaced successes, same-day/early-answer protection and legacy scheduled credits. Restored journals reconstruct identical review progress.
- TypeScript, ESLint and Prettier checks passed.
- Production browser tests exercised Home links and non-mutating previews, All and Not completed grammar viewports (card and scroll positions stayed within 2px during completion and after closing), five-word/three-lesson Refresh with unchanged history, mixed Test with seven correct/one incorrect answer, saved per-item progress, reload persistence, Settings limit 15 with 30 due items, and all eight routes.
- Existing browser regression tests passed for the complete 1501-word/74-lesson import flow, all four grammar CSV/XLSX files, duplicate protection, import cancellation, unchanged fresh Statistics, vocabulary filters/counts, exact Google Translate links, structured grammar practice, settings synchronization, delayed-save locking, daily review limits, process reopening and concurrent-tab answer deduplication. The older review regression now ages only its isolated fixture's study events to simulate next-day eligibility and steps through Refresh before testing.
- Real offline Dutch audio passed in the packaged Windows app, including fallback from a deliberately stalled native voice, repeated/keyboard Listen, natural completion and no learning-storage changes.
- The packaged Windows app passed the same new Home, grammar scroll, Refresh/Test, mixed-review, quota and eight-route checks. Closing the full process and launching it again retained its isolated test profile's history and next-word continuation position.
- The Windows installer was built successfully. All 89 packaged web files and four wrapper files match their source files byte-for-byte. The install wizard was not run against the user's existing installation.

## Limitations

- Reopening Review restarts Refresh for the remaining questions; answered questions and scheduling remain saved. A newly enlarged target may require refreshing the newly selected set.
- Random review order is deliberately stable within a day, rather than reshuffling on every reload.
- Mastered items stop appearing in normal daily tests. Optional long-term maintenance reviews are not added in this update.
- Dates follow the device's local calendar. Manually changing its date/time changes what is due.
- Grammar lists intentionally hold their visible order until a filter change or a later visit, including newly completed cards still visible under Not completed.
