# Gezellig 0.6.2 follow-up bug audit

This audit covers the pending daily-goal celebrations and B1/B2 learning-order
changes, plus regression checks of the existing application. Tests use isolated
browser/Windows profiles. The user's real learner data was not read, reset or
modified.

## Bugs reproduced and fixed

1. **A delayed chime could play after the celebration was closed.** The regression
   test holds back the local WAV response until after the dialog has appeared and
   been dismissed. The old implementation played once afterward. Playback now
   uses a cancellation signal on close/unmount, so pending audio never starts and
   already playing audio stops. Study progress remains saved.
2. **Continue Learning could skip custom words mixed with B1/B2 imports.** A custom
   word placed before the ranked collection appeared first in Vocabulary but was
   bypassed by Home. Continuation now follows the same displayed level order,
   including custom words. Collections containing only custom words retain their
   old continuation behavior. The regression test failed before the fix and
   passes for B1 and B2 afterward.

The grammar-scroll test also needed to account for the new goal dialog. It now
dismisses that dialog before closing the lesson while keeping both actions inside
the viewport-movement trace. This was a test expectation update, not a removal of
the celebration or a scroll-behavior change.

## Checks

- `npm test`: **153 passed, zero failures** after both fixes. Covers imports,
  learning activity, settings, review scheduling/mastery, grammar practice,
  pronunciation, update checks, goal persistence and vocabulary ordering.
- `npm run typecheck`: passed.
- `npm run lint`: passed before the two narrow fixes; ESLint on every file changed
  by the fixes passed afterward.
- `npm run format:check`: passed.
- `npm run build:desktop`: production web export and Windows x64 installer build.
- `node scripts/test-audit.cjs`: all eight screens at 360, 768, 1024, 1440 and
  2560 pixels; Settings centering; full browser close/reopen persistence;
  import/save/reset/cancel; keyboard/focus; delayed file reads; compact portrait
  and landscape dialogs. Passed with no page errors.
- Browser `test-about.cjs`, `test-review-controls.cjs`, `test-learning-order.cjs`
  and `test-goal-celebrations.cjs`: passed. Test server was localhost port 4173
  using `GEZELLIG_TEST_BASE_URL` where supported.
- `node scripts/test-goal-edge-cases.cjs`: passed delayed-sound cancellation and
  second-tab same-day reward suppression after the audio fix.
- `node scripts/test-grammar-scroll.cjs`: all four completion scenarios passed
  with **0 pixels** of viewport movement, including dismissal of the reward.
- Packaged Windows `test-goal-celebrations.cjs`, `test-learning-order.cjs`,
  `test-review-controls.cjs`, `test-about.cjs`, and `test-grammar-scroll.cjs`
  with `--desktop`: passed. All three desktop scroll scenarios had 0-pixel
  movement, and the audio/keyboard/review/update checks reported no page errors.

The upload review caught a portability issue in the new hash regression test:
Git's normal CSV line-ending conversion would cause false failures on a fresh
checkout. The audit keeps the original raw hashes and now also records canonical
text hashes. Tests accept only CRLF/LF normalization for CSV; Excel remains an
exact binary comparison. No curriculum files were rewritten.

The curriculum CSV/Excel files, importer schemas, persisted IDs and review
schedule implementation remain unchanged. Tests verify that ordering does not
rewrite stored records or learner history. The builder's original-data hashes
still match.

Test logs, isolated profiles and screenshots are in ignored `test-results/`.
The Windows installer is `release/Gezellig-0.6.2-Setup.exe`. It was rebuilt but not
installed into the user's profile. Hardware speaker output is not asserted by
automated tests; browser/Windows audio checks observe actual decoded Web Audio
playback with external requests blocked.

## GitHub scope

Upload includes application source, tests, rank data, the original local chime,
attribution and implementation reports. Personal prompt documents, local test
profiles, credentials and generated build folders are excluded. The user's
separate `.gitignore` edit is left unstaged.

The source version stays 0.6.2. Publishing a public release or replacing the
existing 0.6.1 release assets is not part of this source upload.
