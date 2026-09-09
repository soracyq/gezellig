import { createPronunciationService } from "./speech";
import { createOfflineSpeech } from "./offlineSpeech";
const offline = createOfflineSpeech(() =>
  typeof window !== "undefined" &&
  typeof Worker === "function" &&
  typeof AudioContext === "function"
    ? { Worker, AudioContext }
    : undefined,
);
export const pronunciationService = createPronunciationService(
  () =>
    typeof window !== "undefined" &&
    window.speechSynthesis &&
    typeof window.SpeechSynthesisUtterance === "function"
      ? {
          synth: window.speechSynthesis,
          Utterance: window.SpeechSynthesisUtterance,
        }
      : undefined,
  offline,
);
