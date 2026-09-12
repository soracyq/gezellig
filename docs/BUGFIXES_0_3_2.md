# Dutchly 0.3.2 — bug checks and fixes

Checked on 2026-09-10. This update preserves the existing curriculum, imported datasets and personal learning history. Tests use isolated profiles; no user progress was reset.

## Reproduced bugs

| Trigger                                                                           | Before                                                                             | Fixed behavior                                                                                                                       |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Change the daily target in one browser tab while Review is open in another        | The Review tab retained its old limit, although save validation used the new limit | Settings and Review refresh automatically across tabs and when the app becomes active; explicit Review refresh also reloads settings |
| A Dutch device voice is listed, but its speech request never starts or errors     | Listen stayed on Preparing indefinitely                                            | After three seconds the pending device utterance is canceled and bundled Dutch speech starts                                         |
| AudioContext.resume stays pending while voice files finish loading                | Loading the voice cleared the only timeout, leaving Preparing stuck                | An independent ten-second audio deadline reports a retryable error; cancellation and late callbacks cannot affect later playback     |
| A practice save waits for storage while the learner changes their selected option | Saved correctness and visible feedback could disagree                              | Choices are disabled during saving, and feedback uses the submitted answer; web radio selection is exposed accessibly                |
| Open Settings in a newer release                                                  | Footer still said Dutchly 0.2                                                      | Footer uses the version from the application's package                                                                               |

The source audit found no further blockers in review eligibility, daily quota enforcement, translation generation, import deduplication or journal handling for the supported curriculum. This is a targeted bug audit, not a claim that every possible device or data condition is covered.

## Verification

- All **99 automated tests** pass, including five new speech timing/cancellation regressions. Type checking, lint and formatting pass.
- `node scripts/test-settings-sync.cjs`: existing Review and Settings tabs follow target decreases/increases and preference removal without reload; learning history remains unchanged; displayed version matches the package.
- `node scripts/test-practice-save.cjs`: actual browser storage locks delay both a correct and an incorrect practice save. The selection stays locked, exactly one event is recorded, and feedback matches its correctness.
- `node scripts/test-review-improvements.cjs`: all eight routes and the existing import/review flow pass with 1,501 vocabulary items and 74 lessons, saved progress across process reopening, daily completion and duplicate-tab protection.
- `node scripts/test-local-speech.cjs --stalled-native`: a simulated unresponsive device voice falls back to real bundled synthesis and Web Audio playback. The speech engine is real; only the failing native API is simulated.
- The packaged Windows app passes real local synthesis/playback with network mode offline. Audio contains nonzero samples, repeated Listen and modal close cancel playback, and no learning storage changes or external network requests occur.
- Production web export and Windows installer build succeed. The packaged web script's checksum matches the tested web export.

Reports remain under `test-results/bugfixes`, `test-results/practice-save`, `test-results/review-improvements` and `test-results/local-speech`.

## Try the update

1. Close the old Dutchly window and run `release/Dutchly-0.3.2-Setup.exe`. Open Dutchly normally; check the version at the bottom of Settings.
2. Open a vocabulary word and press Listen. It continues to work offline using the bundled voice when a local Dutch device voice is unavailable.
3. Try a grammar practice question. Its answer choices should stay fixed after you press Check answer while the result is saving.
4. In the local browser version, open Review and Settings in two tabs at the same address. Change the daily target and check that Review updates without reloading.

The voice remains synthetic. Automated checks do not establish physical-speaker output or native-speaker pronunciation quality. Native mobile speech, macOS execution and the installer wizard were not tested in this update. The Windows installer remains unsigned.
