import { createPronunciationService } from "./speech";
export const pronunciationService = createPronunciationService(() =>
  typeof window !== "undefined" &&
  window.speechSynthesis &&
  typeof window.SpeechSynthesisUtterance === "function"
    ? {
        synth: window.speechSynthesis,
        Utterance: window.SpeechSynthesisUtterance,
      }
    : undefined,
);
