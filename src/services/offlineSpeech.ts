import type { OfflineSpeech, PlaybackEvents } from "./speech";

type Environment = { Worker: typeof Worker; AudioContext: typeof AudioContext };
/** A bundled worker synthesizes Dutch PCM; no text is sent to a server. */
export function createOfflineSpeech(
  environment: () => Environment | undefined,
): OfflineSpeech {
  let worker: Worker | undefined;
  let ready: Promise<void> | undefined;
  let context: AudioContext | undefined;
  let source: AudioBufferSourceNode | undefined;
  let generation = 0;
  let pending:
    | {
        id: string;
        chunks: Float32Array[];
        resolve: (samples: Float32Array) => void;
        reject: (error: Error) => void;
      }
    | undefined;
  let initReject: ((error: Error) => void) | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let resumeWait: { finish: (error?: Error) => void } | undefined;
  function reset(error: Error) {
    clearTimeout(timeout);
    resumeWait?.finish(error);
    initReject?.(error);
    initReject = undefined;
    pending?.reject(error);
    pending = undefined;
    worker?.terminate();
    worker = undefined;
    ready = undefined;
  }
  function resumeAudio(audioContext: AudioContext) {
    // Browsers may leave resume() pending when audio is blocked. Its deadline
    // must be independent of the worker deadline, which ends when voices load.
    const resumed = audioContext.resume();
    return new Promise<void>((resolve, reject) => {
      let settled = false;
      const wait = {
        finish(error?: Error) {
          if (settled) return;
          settled = true;
          clearTimeout(resumeTimeout);
          if (resumeWait === wait) resumeWait = undefined;
          if (error) reject(error);
          else resolve();
        },
      };
      const resumeTimeout = setTimeout(
        () => wait.finish(new Error("Audio output did not become available")),
        10000,
      );
      resumeWait = wait;
      void resumed.then(
        () => wait.finish(),
        () => wait.finish(new Error("Audio output could not be resumed")),
      );
    });
  }
  function initialize(env: Environment) {
    if (ready) return ready;
    ready = new Promise<void>((resolve, reject) => {
      initReject = reject;
      worker = new env.Worker("/speech/espeakng.worker.js");
      timeout = setTimeout(
        () => reset(new Error("Voice loading timed out")),
        20000,
      );
      worker.onerror = () =>
        reset(new Error("Could not load the built-in voice"));
      worker.onmessage = ({ data }) => {
        if (data === "ready") {
          worker!.postMessage({
            method: "set_voice",
            args: ["nl"],
            callback: "configure-dutch",
          });
          return;
        }
        if (data.callback === "configure-dutch") {
          if (data.result?.[0] !== 0) {
            reset(new Error("Bundled Dutch voice is missing"));
            return;
          }
          clearTimeout(timeout);
          initReject = undefined;
          worker!.postMessage({ method: "set_rate", args: [150] });
          resolve();
          return;
        }
        if (!pending || data.callback !== pending.id) return;
        const samples = data.result?.[0];
        if (samples instanceof ArrayBuffer && samples.byteLength)
          pending.chunks.push(new Float32Array(samples));
        if (data.done) {
          clearTimeout(timeout);
          const count = pending.chunks.reduce((sum, c) => sum + c.length, 0);
          const merged = new Float32Array(count);
          let offset = 0;
          for (const chunk of pending.chunks) {
            merged.set(chunk, offset);
            offset += chunk.length;
          }
          pending.resolve(merged);
          pending = undefined;
        }
      };
    });
    return ready;
  }
  function cancel() {
    generation++;
    resumeWait?.finish();
    if (source) {
      source.onended = null;
      try {
        source.stop();
      } catch {
        /* Already finished. */
      }
      source.disconnect();
      source = undefined;
    }
    // Resolve superseded requests so their closures do not linger.
    if (pending) clearTimeout(timeout);
    pending?.resolve(new Float32Array());
    pending = undefined;
  }
  return {
    available: () => !!environment(),
    cancel,
    speak(text: string, onError?: () => void, events?: PlaybackEvents) {
      const env = environment();
      if (!env || !text.trim() || text.length > 500) return false;
      cancel();
      const request = generation;
      try {
        context ??= new env.AudioContext();
        // Resume during the click gesture, before awaiting voice files.
        const resumed = resumeAudio(context);
        void (async () => {
          try {
            await Promise.all([initialize(env), resumed]);
            if (request !== generation) return;
            const samples = await new Promise<Float32Array>(
              (resolve, reject) => {
                pending = {
                  id: `speech-${request}`,
                  chunks: [],
                  resolve,
                  reject,
                };
                timeout = setTimeout(
                  () => reset(new Error("Speech timed out")),
                  20000,
                );
                worker!.postMessage({
                  method: "synthesize",
                  args: [text],
                  callback: pending.id,
                });
              },
            );
            if (request !== generation) return;
            if (!samples.length || context!.state !== "running")
              throw new Error("Audio output unavailable");
            // This pinned worker duplicates each 22,050 Hz sample: play at 44,100 Hz.
            const buffer = context!.createBuffer(1, samples.length, 44100);
            buffer.getChannelData(0).set(samples);
            source = context!.createBufferSource();
            source.buffer = buffer;
            source.connect(context!.destination);
            source.onended = () => {
              if (request === generation) {
                source?.disconnect();
                source = undefined;
                events?.onEnd?.();
              }
            };
            source.start();
            events?.onStart?.();
          } catch {
            if (request === generation) {
              reset(new Error("Speech could not complete"));
              onError?.();
            }
          }
        })();
        return true;
      } catch {
        reset(new Error("Could not start speech"));
        return false;
      }
    },
  };
}
