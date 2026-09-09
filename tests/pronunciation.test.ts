import test from "node:test";
import assert from "node:assert/strict";
import {
  chooseDutchVoice,
  createPronunciationService,
  type SpeechEnvironment,
} from "../src/services/speech.ts";
const voice = (lang: string, name: string, localService = true) =>
  ({
    lang,
    name,
    voiceURI: name,
    localService,
    default: false,
  }) as SpeechSynthesisVoice;
function mockSpeech() {
  let voices: SpeechSynthesisVoice[] = [];
  let listener: (() => void) | undefined;
  let cancels = 0;
  const spoken: SpeechSynthesisUtterance[] = [];
  class Utterance {
    text: string;
    lang = "";
    voice = null;
    onerror: ((event: { error: string }) => void) | null = null;
    constructor(text: string) {
      this.text = text;
    }
  }
  const synth = {
    getVoices: () => voices,
    cancel: () => {
      cancels++;
    },
    speak: (u: SpeechSynthesisUtterance) => spoken.push(u),
    addEventListener: (_name: string, fn: () => void) => {
      listener = fn;
    },
    removeEventListener: () => {
      listener = undefined;
    },
  };
  const env = { synth, Utterance } as unknown as SpeechEnvironment;
  return {
    env,
    spoken,
    setVoices: (v: SpeechSynthesisVoice[]) => {
      voices = v;
      listener?.();
    },
    cancels: () => cancels,
    hasListener: () => !!listener,
  };
}
test("Dutch selection is deterministic, prefers nl-NL and never selects an English-only voice", () => {
  const vs = [
    voice("en-US", "English"),
    voice("nl-BE", "Belgian"),
    voice("nl-NL", "Dutch Z"),
    voice("nl-NL", "Dutch A"),
  ];
  assert.equal(chooseDutchVoice(vs)?.name, "Dutch A");
  assert.equal(chooseDutchVoice([...vs].reverse())?.name, "Dutch A");
  assert.equal(chooseDutchVoice([vs[0]]), undefined);
});
test("voice loading subscribes to voiceschanged and updates availability after initial empty list", () => {
  const mock = mockSpeech(),
    service = createPronunciationService(() => mock.env);
  let changes = 0;
  assert.equal(service.getStatus(), "unavailable");
  const unsubscribe = service.subscribe(() => changes++);
  mock.setVoices([voice("nl-NL", "Dutch")]);
  assert.equal(changes, 1);
  assert.equal(service.getStatus(), "available");
  unsubscribe();
  assert.equal(mock.hasListener(), false);
});
test("pronunciation sends the actual Dutch target with nl-NL and selected voice; cancels repeated audio", () => {
  const mock = mockSpeech(),
    service = createPronunciationService(() => mock.env);
  mock.setVoices([voice("nl-NL", "Dutch")]);
  for (const text of ["het huis", "de jongen", "zijn", "goedemorgen"])
    assert(service.speakDutch(text));
  assert.deepEqual(
    mock.spoken.map((u) => u.text),
    ["het huis", "de jongen", "zijn", "goedemorgen"],
  );
  assert(
    mock.spoken.every((u) => u.lang === "nl-NL" && u.voice?.lang === "nl-NL"),
  );
  assert.equal(mock.cancels(), 4);
  service.cancel();
  assert.equal(mock.cancels(), 5);
});
test("unsupported API, no Dutch voices and device errors fail gracefully", () => {
  const unsupported = createPronunciationService(() => undefined);
  assert.equal(unsupported.getStatus(), "unavailable");
  assert.equal(unsupported.speakDutch("huis"), false);
  unsupported.subscribe(() => {})();
  unsupported.cancel();
  const mock = mockSpeech(),
    service = createPronunciationService(() => mock.env);
  mock.setVoices([voice("en-US", "English")]);
  assert.equal(service.speakDutch("huis"), false);
  assert.equal(mock.spoken.length, 0);
  mock.setVoices([voice("nl-NL", "Dutch")]);
  let errors = 0;
  assert(service.speakDutch("huis", () => errors++));
  mock.spoken[0].onerror?.({
    error: "voice-unavailable",
  } as SpeechSynthesisErrorEvent);
  assert.equal(errors, 1);
  mock.env.synth.getVoices = () => {
    throw new Error("Device unavailable");
  };
  assert.equal(service.getStatus(), "unavailable");
  assert.equal(service.speakDutch("huis"), false);
});
