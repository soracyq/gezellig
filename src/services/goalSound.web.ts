let context: AudioContext | undefined;
let buffer: Promise<AudioBuffer | null> | undefined;

// Resume during the study-button gesture, before awaiting storage. The asset
// is an original, quiet chime bundled with the app; no external audio service.
export function prepareGoalSound() {
  try {
    context ??= new AudioContext();
    void context.resume().catch(() => undefined);
    const audioContext = context;
    buffer ??= fetch("/audio/goal-complete.wav")
      .then((response) => {
        if (!response.ok) throw new Error("Chime unavailable");
        return response.arrayBuffer();
      })
      .then((bytes) => audioContext.decodeAudioData(bytes))
      .catch(() => {
        buffer = undefined;
        return null;
      });
  } catch {
    // Muted/unsupported audio must never prevent learning or the visual reward.
  }
}

export async function playGoalSound(signal?: AbortSignal) {
  try {
    const clip = await buffer;
    if (!clip || !context || context.state !== "running" || signal?.aborted)
      return;
    const source = context.createBufferSource();
    source.buffer = clip;
    source.loop = false;
    source.connect(context.destination);
    const stop = () => {
      source.stop();
      source.disconnect();
    };
    const cleanup = () => {
      signal?.removeEventListener("abort", stop);
      source.disconnect();
    };
    signal?.addEventListener("abort", stop, { once: true });
    source.onended = cleanup;
    try {
      source.start();
    } catch (error) {
      cleanup();
      throw error;
    }
  } catch {
    // Autoplay policy or an unavailable output device: keep the celebration.
  }
}
