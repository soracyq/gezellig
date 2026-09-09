import test from "node:test";
import assert from "node:assert/strict";
import {
  chooseDutchVoice,
  createPronunciationService,
  type OfflineSpeech,
  type PlaybackEvents,
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

function mockOffline() {
  const spoken: {
    text: string;
    onError?: () => void;
    events?: PlaybackEvents;
  }[] = [];
  let cancels = 0;
  const service: OfflineSpeech = {
    available: () => true,
    speak: (text, onError, events) => {
      spoken.push({ text, onError, events });
      return true;
    },
    cancel: () => cancels++,
  };
  return { service, spoken, cancels: () => cancels };
}

test("remote Dutch voices are never selected for local pronunciation", () => {
  assert.equal(chooseDutchVoice([voice("nl-NL", "Remote", false)]), undefined);
  assert.equal(
    chooseDutchVoice([
      voice("nl-NL", "Remote", false),
      voice("nl-BE", "Local Belgian"),
    ])?.name,
    "Local Belgian",
  );
});

test("the bundled voice is available without a speech API or installed Dutch voice", () => {
  const empty = mockSpeech();
  const remote = mockSpeech();
  remote.setVoices([voice("nl-NL", "Remote", false)]);
  for (const environment of [undefined, empty.env, remote.env]) {
    const fallback = mockOffline();
    const service = createPronunciationService(
      () => environment,
      fallback.service,
    );
    let starts = 0;
    let ends = 0;
    let errors = 0;
    assert.equal(service.getStatus(), "available");
    assert.equal(service.getMode(), "offline");
    assert.equal(
      service.speakDutch("het huis", () => errors++, {
        onStart: () => starts++,
        onEnd: () => ends++,
      }),
      true,
    );
    assert.equal(fallback.spoken[0].text, "het huis");
    fallback.spoken[0].events?.onStart?.();
    fallback.spoken[0].events?.onEnd?.();
    fallback.spoken[0].onError?.();
    assert.deepEqual([starts, ends, errors], [1, 1, 1]);
    service.cancel();
    assert.equal(fallback.cancels(), 2);
  }
  assert.equal(remote.spoken.length, 0);
});

test("a local Dutch voice takes precedence and a device exception uses the bundled voice", () => {
  const mock = mockSpeech();
  const fallback = mockOffline();
  const service = createPronunciationService(() => mock.env, fallback.service);
  mock.setVoices([voice("nl-NL", "Dutch")]);
  assert.equal(service.getMode(), "device");
  assert.equal(service.speakDutch("de jongen"), true);
  assert.equal(mock.spoken.length, 1);
  assert.equal(fallback.spoken.length, 0);
  mock.env.synth.speak = () => {
    throw new Error("Device speech failed");
  };
  assert.equal(service.speakDutch("goedemorgen"), true);
  assert.equal(fallback.spoken[0].text, "goedemorgen");
  mock.env.synth.getVoices = () => {
    throw new Error("Device voices failed");
  };
  assert.equal(service.getMode(), "offline");
  assert.equal(service.speakDutch("zijn"), true);
  assert.equal(fallback.spoken[1].text, "zijn");
});

test("a native speech error falls back once, while cancellation and stale errors stay silent", () => {
  const mock = mockSpeech();
  const fallback = mockOffline();
  const service = createPronunciationService(() => mock.env, fallback.service);
  mock.setVoices([voice("nl-NL", "Dutch")]);
  let errors = 0;
  let ends = 0;
  service.speakDutch("het huis", () => errors++, { onEnd: () => ends++ });
  const first = mock.spoken[0];
  for (const error of ["canceled", "interrupted"])
    first.onerror?.({ error } as SpeechSynthesisErrorEvent);
  assert.equal(fallback.spoken.length, 0);
  first.onerror?.({ error: "synthesis-failed" } as SpeechSynthesisErrorEvent);
  assert.equal(fallback.spoken.length, 1);
  assert.equal(fallback.spoken[0].text, "het huis");
  assert.equal(errors, 0);
  first.onerror?.({ error: "synthesis-failed" } as SpeechSynthesisErrorEvent);
  first.onend?.({} as SpeechSynthesisEvent);
  assert.equal(fallback.spoken.length, 1);
  assert.deepEqual([errors, ends], [0, 0]);
  fallback.spoken[0].events?.onEnd?.();
  assert.equal(ends, 1);
  service.speakDutch("de jongen", () => errors++);
  first.onerror?.({ error: "voice-unavailable" } as SpeechSynthesisErrorEvent);
  service.cancel();
  mock.spoken[1].onerror?.({
    error: "voice-unavailable",
  } as SpeechSynthesisErrorEvent);
  assert.equal(fallback.spoken.length, 1);
  assert.equal(errors, 0);
});
