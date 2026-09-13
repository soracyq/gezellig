# Gezellig 0.6.0 audit

Initial findings recorded before implementation on 2026-09-13, against commit
`0aab178`. Work is isolated on `codex/v0.6.0-audit`. Version, storage identities,
published release and the user's unrelated `.gitignore` / `Prompt Source/` work
remain unchanged. This report will be updated with actual verification results.

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

| ID / severity | Location | Problem and impact | Recommended repair |
| --- | --- | --- | --- |
| H1 High | `src/domain/translation.ts` | Valid imported nouns without optional article/plural fields generate no Review questions after being studied. | Use the exact supplied singular as a fallback; never invent an article. Retain existing morphology questions. |
| M1 Medium | `src/state/LearningProvider.tsx` | A delayed refresh can replace a newer completed transaction's UI state; overlapping refreshes can also resolve out of order. Disk data survives, but progress appears stale. | Serialize refresh reads with writes and invalidate obsolete reads/unmounted work. Exercise the race in a browser regression. |
| M2 Medium | `src/storage/library.ts` | Curriculum validation accepts duplicate IDs within a content collection; cards and progress references become ambiguous if stored data is damaged. | Reject duplicates on read/write without deleting or rewriting the original data; permit IDs shared across different content types. |
| M3 Medium | `src/domain/activity.ts` | Mistake-item counts merge vocabulary and grammar with the same item ID. | Key uniqueness by content type and item ID. |
| M4 Medium | Shared controls and screen selectors | Most button variants lack consistent hover/pressed/focus treatment; selected button state is not consistently exposed through appropriate web ARIA. | Reuse themed interaction states, accessible selected/pressed attributes and icon controls. |
| L1 Low | `src/theme/tokens.ts`, `src/components/ui.tsx`, answer inputs | Near-duplicate spacing, radii, typography and input styling make shared elements inconsistent. | Add a small shared control/layout token set, reuse answer input styling, keep the established visual hierarchy. |
| L2 Low | `src/components/ui.tsx` | Shared modal has no explicit accessible dialog name; heading/action rows can squeeze headings at narrow widths. | Name dialogs, use shared close control and allow heading/action wrapping; verify keyboard focus and short/narrow viewports. |
| D1 Medium, unresolved dependency | `decode-uri-component` through Expo Router / query-string | GHSA-vcc3-ghjq-m6fr: malformed encoded input can cause excessive decode work. Fixed upstream 0.5.0 changes to ESM; blind override risks breaking CommonJS consumers. | Investigate a compatible targeted repair and exercise malformed route input; do not force broad upgrades. |
| D2 Moderate advisory, no affected call found | `uuid` through ExcelJS/xcode | GHSA-w5hq-g745-h8pq concerns buffer-writing v3/v5/v6 APIs. Inspected consumers only call v4; app IDs use Expo Crypto. | Record exposure assessment; avoid an unrelated major upgrade. Recheck when upstream dependencies update. |

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
the release installer. Record exact results and limitations below after testing.
