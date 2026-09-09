export type SpeechEnvironment = {
  synth: SpeechSynthesis;
  Utterance: typeof SpeechSynthesisUtterance;
};
export type PlaybackEvents = { onStart?: () => void; onEnd?: () => void };
export type OfflineSpeech = {
  available: () => boolean;
  speak: (
    text: string,
    onError?: () => void,
    events?: PlaybackEvents,
  ) => boolean;
  cancel: () => void;
};
export function chooseDutchVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  return voices
    .filter((v) => v.localService && /^nl(?:[-_]|$)/i.test(v.lang))
    .sort((a, b) => {
      const rank = (v: SpeechSynthesisVoice) =>
        (v.lang.toLowerCase().replace("_", "-") === "nl-nl" ? 0 : 2) +
        (v.localService ? 0 : 1);
      return (
        rank(a) - rank(b) ||
        a.voiceURI.localeCompare(b.voiceURI) ||
        a.name.localeCompare(b.name)
      );
    })[0];
}
export function createPronunciationService(
  environment: () => SpeechEnvironment | undefined,
  offline?: OfflineSpeech,
) {
  let utterance: SpeechSynthesisUtterance | undefined;
  let generation = 0;
  const nativeVoice = () => {
    try {
      return chooseDutchVoice(environment()?.synth.getVoices() ?? []);
    } catch {
      return undefined;
    }
  };
  const getMode = (): "device" | "offline" | "unavailable" =>
    nativeVoice() ? "device" : offline?.available() ? "offline" : "unavailable";
  const getStatus = (): "available" | "unavailable" =>
    getMode() === "unavailable" ? "unavailable" : "available";
  function cancel() {
    generation++;
    try {
      environment()?.synth.cancel();
    } catch {
      /* The bundled voice remains usable when the device API fails. */
    }
    offline?.cancel();
    utterance = undefined;
  }
  return {
    getStatus,
    getMode,
    subscribe(listener: () => void) {
      const env = environment();
      env?.synth.addEventListener("voiceschanged", listener);
      return () => env?.synth.removeEventListener("voiceschanged", listener);
    },
    cancel,
    speakDutch(
      text: string,
      onError?: () => void,
      events?: PlaybackEvents,
    ): boolean {
      if (!text.trim() || text.length > 500) return false;
      cancel();
      const request = generation;
      let usedFallback = false;
      const fallback = () => {
        if (request !== generation || usedFallback) return false;
        usedFallback = true;
        return offline?.available() && offline.speak(text, onError, events);
      };
      try {
        const env = environment(),
          voice = nativeVoice();
        if (!env || !voice) return !!fallback();
        utterance = new env.Utterance(text);
        utterance.lang = "nl-NL";
        utterance.voice = voice;
        utterance.onstart = () => {
          if (request === generation) events?.onStart?.();
        };
        utterance.onend = () => {
          if (request === generation && !usedFallback) events?.onEnd?.();
        };
        utterance.onerror = (event) => {
          if (
            request === generation &&
            !usedFallback &&
            event.error !== "canceled" &&
            event.error !== "interrupted"
          ) {
            if (!fallback()) onError?.();
          }
        };
        env.synth.speak(utterance);
        return true;
      } catch {
        return !!fallback();
      }
    },
  };
}
