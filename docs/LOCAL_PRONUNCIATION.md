# Dutchly 0.3.1 — local pronunciation

Version 0.3.2 adds recovery when device speech never starts or audio resume remains blocked. Use `release/Dutchly-0.3.2-Setup.exe` for the current update. See [the 0.3.2 bug-fix report](BUGFIXES_0_3_2.md); the implementation and original 0.3.1 checks below remain background for the bundled voice.

The disabled Listen button in 0.3.0 depended on the browser exposing an installed Dutch speech voice. The checked Windows computer has Chinese and English voices but no Dutch voice. An early desktop probe returned an empty voice list; later checks returned those non-Dutch voices. The old tests simulated Dutch voices and did not catch the missing real voice.

## Fix

Listen now prefers an installed **local** Dutch voice (`nl-NL` first). If one is unavailable, or the device speech API reports an error, a bundled eSpeak NG engine generates Dutch audio locally and Web Audio plays it. It handles words imported in the future as well as the built-in samples. No text is sent to a server, and no account, paid service or Windows language-pack installation is needed.

The button displays **Built-in Dutch voice · works offline** when the fallback is selected. Preparation, playback and errors have visible messages. Repeating Listen replaces the previous audio; closing the word detail cancels it. Listening does not change curriculum, study history or settings.

The worker and language data are roughly 3.3 MB. Its GPL license, pinned source archive, checksums and reproducible CSP compatibility patch ship under `public/speech`. The existing strict app security policy remains in place. Technical background: the upstream [eSpeak NG JavaScript port](https://github.com/espeak-ng/espeak-ng/blob/master/emscripten/README.md) runs synthesis using Web Workers and Web Audio. Full provenance is in [the bundled component notice](../public/speech/NOTICE.md).

## Use it on Windows

1. Close the older Dutchly window.
2. Run `release/Dutchly-0.3.1-Setup.exe`, then open Dutchly normally. Alternatively, open `release/win-unpacked/Dutchly.exe` with its surrounding files in place.
3. Open Vocabulary, choose **het huis**, then press **Listen**.
4. Repeat with the internet disconnected. Speech assets are included in the app.

Your existing desktop profile, imports and learning history stay in `%APPDATA%\Dutchly`. No profile reset is needed. Updating a build does not transfer data between the separate browser and desktop profiles.

For the local browser version, run `npm.cmd run export:web`, then `npm.cmd run preview:web`, and open `http://127.0.0.1:4173`. Keep the server running. Do not open the exported HTML directly as a file. A hosted web version needs its files loaded from the host; this change does not add a service-worker cache for offline hosted browsing.

## Checks

Verified on 2026-09-10: all 94 automated tests, type checking, lint and formatting pass. The production browser and packaged Windows 0.3.1 speech checks pass with real synthesis and zero page errors or external requests. The existing browser review/import regression also passes with 1,501 words and 74 lessons, including close/reopen persistence and duplicate-tab answer protection. The web export and Windows installer build completed successfully; the installer wizard itself was not run.

The focused browser/desktop check is `node scripts/test-local-speech.cjs` (with `--desktop` for the packaged Windows app). It uses the actual worker and audio engine, not a simulated speech synthesizer. It records nonzero PCM frames, 44,100 Hz playback, a running AudioContext, Dutch voice selection, keyboard activation, cancellation and identical learning storage before/after. Browser external requests are blocked; the Windows context is explicitly set offline before loading the voice. Reports are written under `test-results/local-speech`.

Unit tests cover local-only native selection, fallback after missing/failed native speech, delayed voice availability, Dutch worker configuration, chunked PCM, cancellation, stale callbacks and retry after failure. The existing review/import UI check has been updated to expect the bundled voice when device voices are absent.

## If there is still no sound

- Confirm you opened version 0.3.1 rather than an older installed shortcut/build.
- Check Windows volume, the app volume mixer and the selected speaker/headphones. If the message reaches **Playing Dutch pronunciation…**, the app has started audio playback.
- If an error message appears, try Listen again. In a browser, check that the tab/site is not muted and that the local web server is still running.

The bundled voice sounds more robotic than a natural recording. The automated checks verify synthesis and playback calls, not what comes out of your physical speakers or native-speaker pronunciation quality. Native Expo Android/iOS speech is still unsupported. Speech input is limited to 500 characters, sufficient for vocabulary headwords. A native Dutch Windows voice may improve sound quality when exposed by the browser; Microsoft lists Dutch **Frank** in its [supported voice and installation guide](https://support.microsoft.com/en-au/windows/appendix-a-supported-languages-and-voices-4486e345-7730-53da-fcfe-55cc64300f01).
