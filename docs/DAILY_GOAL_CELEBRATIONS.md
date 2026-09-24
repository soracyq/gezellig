# Daily goal celebrations

Vocabulary celebrates when a saved study action crosses the daily target from
Settings (5, 10, 15, 20, 30, 40 or 50). Grammar celebrates one newly completed
lesson per day. Its target is centralized as `DAILY_GRAMMAR_TARGET` in
`src/domain/dailyGoals.ts`.

Both use the existing activity journal and `getStatistics`, including the
existing local-calendar date helper. `appendEvent` already prevents repeat
study/completion events for an item, even across days. Opening content,
pronunciation, Google Translate, imports and practice/review answers do not
trigger this feature. Home statistics, study-day/streak rules, review scheduling
and reset behavior remain unchanged.

The provider checks `previousCount < target && currentCount >= target` only
after saving a study/completion action. It does not check on hydration, refresh,
navigation, a target change or the date changing. Existing completed goals are
not celebrated retroactively.

Notification dates are saved with AsyncStorage at
`@dutchly/goal-celebrations/v1`, inside the existing cross-tab transaction lock,
before displaying the reward. The key contains dates, not another progress
counter. Vocabulary and grammar are independent. Raising the target after a
celebration does not award a second celebration that day. A progress reset keeps
the notification dates, so redoing the same day's work does not repeat the
reward. Failed notification storage skips the reward while keeping successfully
saved learning progress; failed progress storage never awards a reward.

The UI reuses `PreviewModal`, theme tokens and accessible Action buttons.
Continue learning, Done, close and Escape dismiss the reward and return to the
open study material without navigation. A per-mount guard plays the chime once
when the modal appears. Existing modal focus management contains keyboard focus.

`public/audio/goal-complete.wav` is an original synthesized C–E–G chime, 1.6
seconds, quiet mono PCM. Its reproducible source is
`scripts/build-goal-sound.cjs` (run with Node). It contains no samples, spoken
voice, commercial recordings or external service dependencies. The public asset
is copied into the web export and Windows package. Web Audio is resumed during
the study-button gesture before asynchronous storage, then plays the decoded
asset once when the reward appears. Unsupported/blocked audio leaves the visual
celebration usable. These released web/Electron platforms have audio support;
the unshipped native iOS/Android fallback is visual-only. This does not add a
service worker or offline installation to an ordinary hosted browser website;
the Windows package includes the asset for offline use.

The follow-up bug audit added cancellation: dismissing or unmounting the dialog
stops playback and prevents a delayed audio download/decode from playing afterward.

## Verification

- `npm test`: 145 passed, zero failures. Includes all seven daily-goal tests:
  every target, 14-to-16 crossings, duplicate study, review exclusion, grammar,
  local-day rollover, target changes, persistence, reset, storage failures and
  the WAV's duration/peak/edges.
- `npm run typecheck`: passed.
- ESLint on every changed/new source and test: passed (the sound generator's
  explicit Node Buffer import was fixed and rechecked).
- `npm run build:desktop:dir`: web production export and Windows package passed.
- `node scripts/build-desktop.cjs`: Windows installer rebuilt successfully at
  `release/Gezellig-0.6.2-Setup.exe`; installation into the user's profile was
  not performed.
- `node scripts/test-goal-celebrations.cjs` and its `--desktop` variant:
  browser and packaged Windows passed, using isolated learner profiles. Checked
  vocabulary and grammar crossings, actual Web Audio start with decoded 1.6s
  buffer, no looping, remote requests blocked, no replay after more study or
  reload, disabled repeat completion, preserved activity, Tab/Enter/Escape,
  desktop-width and mobile layout, and zero page errors. Screenshots inspected.
- Test artifacts: `test-results/goal-celebrations/` (ignored by Git).

No learner profile was reset or migrated. No version change or GitHub release
is part of this feature.
