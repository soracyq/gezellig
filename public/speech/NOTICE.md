# Bundled offline Dutch speech

Dutchly includes eSpeak NG's JavaScript port as an optional local pronunciation
engine. The worker and voice data are application assets. They require no cloud
API, account, runtime CDN request, or operating-system Dutch voice. Speech is
synthetic; this is not a recording of a native speaker.

## Upstream version and license

- Component: eSpeak NG / espeakng.js, version **1.49.1**.
- Compiled distribution: [pettarin/espeakng.js-cdn](https://github.com/pettarin/espeakng.js-cdn/tree/c023eaca5609b4523613f674d0ee67bd761502f1),
  pinned commit `c023eaca5609b4523613f674d0ee67bd761502f1` (2017-02-01).
- Engine and preferred-form source: [espeak-ng/espeak-ng](https://github.com/espeak-ng/espeak-ng/tree/88a588e635ddc1f74aaf847132f6d79bee189b86),
  pinned commit `88a588e635ddc1f74aaf847132f6d79bee189b86` (2017-02-01), the
  upstream update of the Emscripten port to 1.49.1. Its JavaScript wrapper is
  byte-identical to this compiled distribution's wrapper.
- [Complete source archive](./espeak-ng-1.49.1-source.zip) ships alongside the
  worker, including C/C++ engine source, language sources, Emscripten glue,
  build files, authors, copyright statements, and component license notices.
- License: GNU General Public License version 3 or later; see [LICENSE](./LICENSE)
  and the individual notices in the source archive. Copyright belongs to the
  upstream contributors, including Jonathan Duddington, Reece H. Dunn,
  Eitan Isaacson, and Alberto Pettarin. Preserve these files when redistributing
  the component. This notice does not change the license of other app files.
- Downloaded 2026-09-10. The compiled engine was obtained from upstream; it was
  not rebuilt from C/C++ during this update.

## Local modification

The distributed worker is unchanged except for its first initialization
expression. When `Module` is undefined, the upstream generated code evaluates
a constant function expression that returns `{}`. Dutchly directly assigns
`{}` in that branch instead. The replacement avoids startup `eval` so the
worker runs under the app's existing Content Security Policy. No speech,
language, or pronunciation rules changed, and no broader script permissions
were added.

[patch-worker.cjs](./patch-worker.cjs) records and reproduces this modification.
Download the original `js/espeakng.worker.js` from the pinned compiled
distribution, place it beside the script, then run `node patch-worker.cjs`.
The script verifies the exact original checksum before applying the edit.
The remaining upstream `eval` expressions belong to unused general-purpose
Emscripten helper functions; the speech message API does not invoke them.

The worker already requests `espeakng.worker.data` relative to its own URL;
no data-path edit is necessary. Keep both files in the same folder. A normal
browser must load them through the local web server; opening an HTML file
directly with `file://` is not a supported browser deployment. The Windows
application serves them through its local `dutchly://app` protocol.

## Worker message API used by Dutchly

1. Create a worker from `espeakng.worker.js`; wait for the literal message
   `"ready"`.
2. Send `{method: "set_voice", args: ["nl"], callback: "voice"}`. The callback's
   `result[0]` is `0` on success.
3. Send `{method: "set_rate", args: [150]}`.
4. Send `{method: "synthesize", args: [text], callback: requestId}`.
5. For messages matching that callback, `result[0]` is an `ArrayBuffer` of
   `Float32` samples until `done: true` signals completion. Some chunks can be
   empty. Ignore stale callbacks after a cancellation.

`get_samplerate` returns 22,050 Hz, but this port duplicates every mono sample
in the callback array. Play that array as mono at **44,100 Hz**, or select every
second sample and play the resulting mono buffer at 22,050 Hz. Do not play the
whole duplicate array at 22,050 Hz, which would halve speed and pitch. Web Audio
performs conversion to the output device's sample rate.

The local verification synthesized `het huis. Ik woon in een klein huis.` in
a real Chrome Web Worker under the app's strict policy: Dutch voice returned
success, 32 chunks contained nonzero audio, and duplicated-sample behavior was
verified. Audible output quality is assessed separately from data generation.

## SHA-256 checksums

| File | SHA-256 |
| --- | --- |
| `espeakng.worker.js` (local patch) | `75fc9c87f686f662f0f8269b8b8a08c642d374d8ad38c5b36fa67a8e5cf313d4` |
| `espeakng.worker.js` (original upstream) | `27dbae622e8dbd2b4f5def07208db1c557554148b83a99bacba37419031e2e2e` |
| `espeakng.worker.data` | `a1a5de916d3f3d28babe3a0948d6eab84e793ae69e333974a918a69ddec32a67` |
| `espeakng.js` | `ca8aebbd7a38e19424412d16be3f98df208d9ed3c086e969cee3e0eff266d26c` |
| `espeak-ng-1.49.1-source.zip` | `784d8e436bf772e071ec9ba5f6a4e5f80849a99075d2c201a6386e932defb4e3` |
| `LICENSE` | `8ceb4b9ee5adedde47b31e975c1d90c73ad27b6b165a1dcd80c7c545eb65b903` |
| `VERSION` | `0f06ce7b7a1d917dbf6b159f5c3a3322ff8d82165989b7c8742fe8b3612f8db` |
