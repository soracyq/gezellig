import test from "node:test";
import assert from "node:assert/strict";
import { setImmediate } from "node:timers/promises";
import { createOfflineSpeech } from "../src/services/offlineSpeech.ts";

type WorkerRequest = { method: string; args: unknown[]; callback?: string };
type WorkerMessage =
  "ready" | { callback?: string; result?: unknown[]; done?: boolean };
function mockEnvironment() {
  const workers: FakeWorker[] = [];
  const contexts: FakeAudioContext[] = [];
  const order: string[] = [];
  class FakeWorker {
    url: string;
    requests: WorkerRequest[] = [];
    terminated = false;
    onmessage: ((event: { data: WorkerMessage }) => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(url: string) {
      this.url = url;
      workers.push(this);
      order.push("worker");
    }
    postMessage(request: WorkerRequest) {
      this.requests.push(request);
    }
    terminate() {
      this.terminated = true;
    }
    send(data: WorkerMessage) {
      this.onmessage?.({ data });
    }
    ready() {
      this.send("ready");
      this.send({ callback: "configure-dutch", result: [0], done: true });
    }
    request() {
      const request = this.requests.findLast(
        (item) => item.method === "synthesize",
      );
      assert(request?.callback);
      return request;
    }
    complete(request: WorkerRequest, samples = [0.25, 0.25, -0.25, -0.25]) {
      this.send({
        callback: request.callback,
        result: [new Float32Array(samples).buffer],
        done: true,
      });
    }
  }
  class FakeSource {
    buffer: ReturnType<FakeAudioContext["createBuffer"]> | undefined;
    onended: (() => void) | null = null;
    starts = 0;
    stops = 0;
    disconnects = 0;
    destination: object | undefined;
    connect(destination: object) {
      this.destination = destination;
    }
    disconnect() {
      this.disconnects++;
    }
    start() {
      this.starts++;
    }
    stop() {
      this.stops++;
    }
    finish() {
      this.onended?.();
    }
  }
  class FakeAudioContext {
    state = "running";
    destination = {};
    resumes = 0;
    sources: FakeSource[] = [];
    buffers: {
      channels: number;
      length: number;
      rate: number;
      pcm: Float32Array;
    }[] = [];
    constructor() {
      contexts.push(this);
    }
    resume() {
      this.resumes++;
      order.push("resume");
      return Promise.resolve();
    }
    createBuffer(channels: number, length: number, rate: number) {
      const pcm = new Float32Array(length);
      this.buffers.push({ channels, length, rate, pcm });
      return { getChannelData: () => pcm };
    }
    createBufferSource() {
      const source = new FakeSource();
      this.sources.push(source);
      return source;
    }
  }
  const environment = {
    Worker: FakeWorker,
    AudioContext: FakeAudioContext,
  } as unknown as NonNullable<
    ReturnType<Parameters<typeof createOfflineSpeech>[0]>
  >;
  return { environment, workers, contexts, order };
}

test("the bundled worker resumes audio in the gesture and plays exact Dutch text with complete 44.1 kHz PCM", async () => {
  const mock = mockEnvironment();
  const service = createOfflineSpeech(() => mock.environment);
  let starts = 0;
  let ends = 0;
  let errors = 0;
  assert.equal(service.available(), true);
  assert.equal(
    service.speak("het huis", () => errors++, {
      onStart: () => starts++,
      onEnd: () => ends++,
    }),
    true,
  );
  assert.deepEqual(mock.order, ["resume", "worker"]);
  assert.equal(mock.contexts[0].sources.length, 0);
  const worker = mock.workers[0];
  assert.equal(worker.url, "/speech/espeakng.worker.js");
  worker.send("ready");
  await setImmediate();
  assert.equal(
    worker.requests.some((r) => r.method === "synthesize"),
    false,
  );
  worker.send({ callback: "configure-dutch", result: [0], done: true });
  await setImmediate();
  assert.deepEqual(worker.requests.slice(0, 2), [
    { method: "set_voice", args: ["nl"], callback: "configure-dutch" },
    { method: "set_rate", args: [150] },
  ]);
  const request = worker.request();
  assert.deepEqual(request.args, ["het huis"]);
  worker.send({
    callback: "unrelated",
    result: [new Float32Array([99]).buffer],
  });
  worker.send({
    callback: request.callback,
    result: [new Float32Array([0.5, 0.5]).buffer],
  });
  worker.send({
    callback: request.callback,
    result: [new Float32Array([-0.5, -0.5]).buffer],
  });
  worker.send({ callback: request.callback, done: true });
  await setImmediate();
  assert.deepEqual(mock.contexts[0].buffers, [
    {
      channels: 1,
      length: 4,
      rate: 44100,
      pcm: new Float32Array([0.5, 0.5, -0.5, -0.5]),
    },
  ]);
  const source = mock.contexts[0].sources[0];
  assert.equal(source.destination, mock.contexts[0].destination);
  assert.equal(source.starts, 1);
  assert.deepEqual([starts, ends, errors], [1, 0, 0]);
  source.finish();
  assert.equal(source.disconnects, 1);
  assert.deepEqual([starts, ends, errors], [1, 1, 0]);
  service.cancel();
});

test("replacing pending pronunciation discards late old audio and cancellation stops the active source", async () => {
  const mock = mockEnvironment();
  const service = createOfflineSpeech(() => mock.environment);
  let starts = 0;
  let ends = 0;
  let errors = 0;
  const events = { onStart: () => starts++, onEnd: () => ends++ };
  service.speak("het huis", () => errors++, events);
  const worker = mock.workers[0];
  worker.ready();
  await setImmediate();
  const first = worker.request();
  service.speak("de jongen", () => errors++, events);
  await setImmediate();
  const second = worker.request();
  assert.notEqual(first.callback, second.callback);
  assert.deepEqual(second.args, ["de jongen"]);
  worker.complete(first);
  await setImmediate();
  assert.equal(mock.contexts[0].sources.length, 0);
  worker.complete(second);
  await setImmediate();
  assert.equal(mock.workers.length, 1);
  assert.equal(mock.contexts.length, 1);
  assert.equal(mock.contexts[0].resumes, 2);
  const source = mock.contexts[0].sources[0];
  const staleEnd = source.onended;
  service.cancel();
  assert.equal(source.stops, 1);
  assert.equal(source.disconnects, 1);
  assert.equal(source.onended, null);
  staleEnd?.();
  worker.complete(second);
  await setImmediate();
  assert.equal(mock.contexts[0].sources.length, 1);
  assert.deepEqual([starts, ends, errors], [1, 0, 0]);
});

test("cancelling while the worker loads prevents speech and permits a later request", async () => {
  const mock = mockEnvironment();
  const service = createOfflineSpeech(() => mock.environment);
  let errors = 0;
  service.speak("huis", () => errors++);
  service.cancel();
  const worker = mock.workers[0];
  worker.ready();
  await setImmediate();
  assert.equal(
    worker.requests.some((r) => r.method === "synthesize"),
    false,
  );
  assert.equal(mock.contexts[0].sources.length, 0);
  service.speak("zijn", () => errors++);
  await setImmediate();
  worker.complete(worker.request());
  await setImmediate();
  assert.equal(mock.contexts[0].sources[0].starts, 1);
  assert.equal(errors, 0);
  service.cancel();
});

test("worker failure reports an error and the next request creates a working replacement", async () => {
  const mock = mockEnvironment();
  const service = createOfflineSpeech(() => mock.environment);
  let errors = 0;
  service.speak("huis", () => errors++);
  const failedWorker = mock.workers[0];
  failedWorker.ready();
  await setImmediate();
  failedWorker.request();
  failedWorker.onerror?.();
  await setImmediate();
  assert.equal(errors, 1);
  assert.equal(failedWorker.terminated, true);
  assert.equal(mock.contexts[0].sources.length, 0);
  service.speak("goedemorgen", () => errors++);
  assert.equal(mock.workers.length, 2);
  const replacement = mock.workers[1];
  replacement.ready();
  await setImmediate();
  const request = replacement.request();
  assert.deepEqual(request.args, ["goedemorgen"]);
  replacement.complete(request);
  await setImmediate();
  assert.equal(mock.contexts[0].sources[0].starts, 1);
  assert.equal(errors, 1);
  service.cancel();
});

test("missing audio support and invalid text do not create workers or audio contexts", () => {
  const unavailable = createOfflineSpeech(() => undefined);
  assert.equal(unavailable.available(), false);
  assert.equal(unavailable.speak("huis"), false);
  unavailable.cancel();
  const mock = mockEnvironment();
  const service = createOfflineSpeech(() => mock.environment);
  assert.equal(service.speak("  "), false);
  assert.equal(service.speak("a".repeat(501)), false);
  assert.equal(mock.workers.length, 0);
  assert.equal(mock.contexts.length, 0);
});

test("empty PCM and blocked audio fail without reporting that playback started", async () => {
  for (const blocked of [false, true]) {
    const mock = mockEnvironment();
    const service = createOfflineSpeech(() => mock.environment);
    let errors = 0;
    let starts = 0;
    service.speak("huis", () => errors++, { onStart: () => starts++ });
    const worker = mock.workers[0];
    worker.ready();
    await setImmediate();
    if (blocked) mock.contexts[0].state = "suspended";
    worker.complete(worker.request(), blocked ? [0.5, 0.5] : []);
    await setImmediate();
    assert.equal(errors, 1);
    assert.equal(starts, 0);
    assert.equal(worker.terminated, true);
    assert.equal(mock.contexts[0].sources.length, 0);
    service.cancel();
  }
});

test("a missing bundled Dutch voice fails before any text is synthesized", async () => {
  const mock = mockEnvironment();
  const service = createOfflineSpeech(() => mock.environment);
  let errors = 0;
  service.speak("het huis", () => errors++);
  const worker = mock.workers[0];
  worker.send("ready");
  worker.send({ callback: "configure-dutch", result: [1], done: true });
  await setImmediate();
  assert.equal(
    worker.requests.some((r) => r.method === "synthesize"),
    false,
  );
  assert.equal(mock.contexts[0].sources.length, 0);
  assert.equal(worker.terminated, true);
  assert.equal(errors, 1);
  service.cancel();
});
