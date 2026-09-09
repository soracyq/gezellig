export type SpeechEnvironment = {
  synth: SpeechSynthesis;
  Utterance: typeof SpeechSynthesisUtterance;
};
export function chooseDutchVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  return voices
    .filter((v) => /^nl(?:[-_]|$)/i.test(v.lang))
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
) {
  let utterance: SpeechSynthesisUtterance | undefined;
  const getStatus = (): "available" | "unavailable" => {
    try {
      return chooseDutchVoice(environment()?.synth.getVoices() ?? [])
        ? "available"
        : "unavailable";
    } catch {
      return "unavailable";
    }
  };
  return {
    getStatus,
    subscribe(listener: () => void) {
      const env = environment();
      env?.synth.addEventListener("voiceschanged", listener);
      return () => env?.synth.removeEventListener("voiceschanged", listener);
    },
    cancel() {
      try {
        environment()?.synth.cancel();
      } catch {
        /* Unsupported device. */
      }
      utterance = undefined;
    },
    speakDutch(text: string, onError?: () => void): boolean {
      try {
        const env = environment(),
          voice = chooseDutchVoice(env?.synth.getVoices() ?? []);
        if (!env || !voice || !text.trim()) return false;
        env.synth.cancel();
        utterance = new env.Utterance(text);
        utterance.lang = "nl-NL";
        utterance.voice = voice;
        utterance.onerror = (event) => {
          if (event.error !== "canceled" && event.error !== "interrupted")
            onError?.();
        };
        env.synth.speak(utterance);
        return true;
      } catch {
        return false;
      }
    },
  };
}
