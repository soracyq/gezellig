/* global __dirname */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const { chromium, _electron: electron } = createRequire(
  path.join(root, ".artifact-build/node_modules/__speech.cjs"),
)("playwright");
const desktop = process.argv.includes("--desktop");
const sourceBuild = process.argv.includes("--source");
const stalledNative = process.argv.includes("--stalled-native");
const out = path.join(root, "test-results/local-speech");
fs.mkdirSync(out, { recursive: true });
let session;
function observeAudio() {
  window.__speechAudio = [];
  window.__speechMessages = [];
  window.__speechStops = 0;
  const originalStart = AudioBufferSourceNode.prototype.start;
  const originalStop = AudioBufferSourceNode.prototype.stop;
  AudioBufferSourceNode.prototype.start = function (...args) {
    const samples = this.buffer.getChannelData(0);
    let peak = 0;
    for (const value of samples) peak = Math.max(peak, Math.abs(value));
    window.__speechAudio.push({
      frames: samples.length,
      rate: this.buffer.sampleRate,
      duration: this.buffer.duration,
      peak,
      state: this.context.state,
    });
    return originalStart.apply(this, args);
  };
  AudioBufferSourceNode.prototype.stop = function (...args) {
    window.__speechStops++;
    return originalStop.apply(this, args);
  };
  const originalPost = Worker.prototype.postMessage;
  Worker.prototype.postMessage = function (message, ...args) {
    window.__speechMessages.push(message);
    return originalPost.call(this, message, ...args);
  };
}
const snapshot = (page) =>
  page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
(async () => {
  let page;
  const profile = path.join(
    out,
    `${desktop ? "windows" : "browser"}-${Date.now()}`,
  );
  if (desktop) {
    session = await electron.launch({
      executablePath: path.join(
        root,
        sourceBuild
          ? "node_modules/electron/dist/electron.exe"
          : "release/win-unpacked/Gezellig.exe",
      ),
      args: [
        ...(sourceBuild ? [path.join(root, "desktop")] : []),
        "--hidden",
        "--disable-background-timer-throttling",
        `--user-data-dir=${profile}`,
      ],
    });
    page = await session.firstWindow();
    await page
      .getByRole("heading", { name: "Your daily dose of Dutch.", exact: true })
      .waitFor();
    // The packaged scheme is local; disable network connectivity before loading the voice.
    await page.context().setOffline(true);
  } else {
    session = await chromium.launchPersistentContext(profile, {
      executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      headless: true,
      viewport: { width: 1360, height: 1000 },
    });
    page = await session.newPage();
    await session.route("**/*", (route) =>
      new URL(route.request().url()).hostname === "127.0.0.1"
        ? route.continue()
        : route.abort(),
    );
  }
  page.setDefaultTimeout(30000);
  await page.context().addInitScript(observeAudio);
  if (stalledNative)
    await page.context().addInitScript(() => {
      const events = new EventTarget();
      Object.defineProperty(window, "speechSynthesis", {
        configurable: true,
        value: {
          getVoices: () => [
            {
              name: "Stalled Dutch device",
              lang: "nl-NL",
              localService: true,
              voiceURI: "stalled",
            },
          ],
          speak: () => {},
          cancel: () => {},
          addEventListener: (...args) => events.addEventListener(...args),
          removeEventListener: (...args) => events.removeEventListener(...args),
        },
      });
      Object.defineProperty(window, "SpeechSynthesisUtterance", {
        configurable: true,
        value: class {
          constructor(text) {
            this.text = text;
          }
        },
      });
    });
  const errors = [],
    externalRequests = [],
    speechFiles = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    const url = request.url();
    if (/^https?:/.test(url) && new URL(url).hostname !== "127.0.0.1")
      externalRequests.push(url);
    if (url.includes("/speech/")) speechFiles.push(url);
  });
  const base = desktop ? "dutchly://app" : "http://127.0.0.1:4173";
  await page.goto(base + "/vocabulary?preview=vocab-huis");
  const listen = page.getByRole("button", {
    name: "Listen to Dutch pronunciation of het huis",
    exact: true,
  });
  await listen.waitFor();
  const voices = await page.evaluate(() =>
    speechSynthesis
      .getVoices()
      .map((v) => ({ name: v.name, lang: v.lang, local: v.localService })),
  );
  await page
    .getByText(
      stalledNative
        ? "Dutch device voice · works offline"
        : "Built-in Dutch voice · works offline",
      { exact: true },
    )
    .waitFor();
  assert(await listen.isEnabled());
  const before = await snapshot(page);
  await listen.click();
  await page.waitForFunction(() => window.__speechAudio.length === 1, null, {
    polling: 10,
  });
  await listen.evaluate((el) => el.click());
  await page.waitForFunction(() => window.__speechAudio.length === 2, null, {
    polling: 10,
  });
  assert((await page.evaluate(() => window.__speechStops)) >= 1);
  await page
    .getByRole("button", { name: "Done", exact: true })
    .evaluate((el) => el.click());
  assert((await page.evaluate(() => window.__speechStops)) >= 2);
  assert.deepEqual(await snapshot(page), before);
  const audio = await page.evaluate(() => window.__speechAudio);
  assert(
    audio.every(
      (a) =>
        a.frames > 1000 &&
        a.peak > 0.01 &&
        a.rate === 44100 &&
        a.duration > 0.2 &&
        a.duration < 6 &&
        a.state === "running",
    ),
  );
  const messages = await page.evaluate(() => window.__speechMessages);
  assert(messages.some((m) => m.method === "set_voice" && m.args[0] === "nl"));
  assert.equal(
    messages.filter(
      (m) => m.method === "synthesize" && m.args[0] === "het huis",
    ).length,
    2,
  );
  // Exercise another source word and keyboard activation with the real engine.
  await page.goto(base + "/vocabulary?preview=vocab-zijn");
  const verbListen = page.getByRole("button", {
    name: "Listen to Dutch pronunciation of zijn",
    exact: true,
  });
  await verbListen.focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => window.__speechAudio.length === 1, null, {
    polling: 10,
  });
  await page
    .getByText(
      stalledNative
        ? "Dutch device voice · works offline"
        : "Built-in Dutch voice · works offline",
      { exact: true },
    )
    .waitFor();
  assert.deepEqual(await snapshot(page), before);
  if (!desktop)
    await page.screenshot({ path: path.join(out, "listen-offline.png") });
  assert.deepEqual(errors, []);
  assert.deepEqual(externalRequests, []);
  const report = {
    checkedAt: new Date().toISOString(),
    platform: desktop ? "Windows Electron" : "Chrome localhost",
    sourceBuild,
    stalledNative,
    voices,
    audio,
    speechFiles,
    externalRequests,
    errors,
    checks: [
      stalledNative
        ? "Stalled native speech switches to real bundled synthesis and playback"
        : "Real bundled Dutch synthesis and Web Audio playback with no installed Dutch voice",
      desktop
        ? "Network mode offline with no external requests"
        : "External network requests blocked; only localhost allowed",
      "Repeated Listen and modal close cancel audio",
      "Keyboard playback and natural completion",
      "All local learning storage unchanged",
    ],
  };
  fs.writeFileSync(
    path.join(
      out,
      `${desktop ? "windows" : "browser"}${stalledNative ? "-stalled-native" : ""}-report.json`,
    ),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (session) await session.close();
  });
