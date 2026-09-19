import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  checkForUpdates,
  compareVersions,
  releaseSummary,
  networkMessage,
} from "../src/about/updates.ts";

const repository = "https://github.com/soracyq/gezellig";
const release = (tag: string) => ({
  tag_name: tag,
  draft: false,
  prerelease: false,
  body: "## Changes\n- Clearer previews\n- Better imports",
});
const responder =
  (value: unknown, status = 200): typeof fetch =>
  async () =>
    new Response(JSON.stringify(value), { status });

test("semantic precedence includes multi-digit versions, prereleases, build metadata and large integers", () => {
  assert(compareVersions("0.10.0", "0.9.0") > 0);
  assert(compareVersions("v0.6.1", "0.6.1") === 0);
  assert(compareVersions("1.0.0+new", "1.0.0+old") === 0);
  const sequence = [
    "1.0.0-alpha",
    "1.0.0-alpha.1",
    "1.0.0-alpha.beta",
    "1.0.0-beta",
    "1.0.0-beta.2",
    "1.0.0-beta.11",
    "1.0.0-rc.1",
    "1.0.0",
    "1.1.0",
    "2.0.0",
  ];
  for (let i = 1; i < sequence.length; i++) {
    assert(compareVersions(sequence[i], sequence[i - 1]) > 0);
    assert(compareVersions(sequence[i - 1], sequence[i]) < 0);
  }
  assert(
    compareVersions("999999999999999999999.0.0", "999999999999999999998.0.0") >
      0,
  );
  for (const invalid of [
    "01.2.3",
    "1.2",
    "1.2.3-01",
    "hello",
    "1.2.3+",
    "1.2.3\n",
  ])
    assert.throws(() => compareVersions(invalid, "0.6.1"));
});

test("public update check uses one unauthenticated request and constructs an official release URL", async () => {
  let calls = 0;
  const result = await checkForUpdates(
    "0.9.0",
    repository,
    undefined,
    async (url, options) => {
      calls++;
      assert.equal(
        url,
        "https://api.github.com/repos/soracyq/gezellig/releases/latest",
      );
      assert.equal(options?.credentials, "omit");
      assert.equal(options?.redirect, "error");
      assert(!new Headers(options?.headers).has("Authorization"));
      return new Response(
        JSON.stringify({
          ...release("v0.10.0"),
          html_url: "https://evil.test/",
        }),
      );
    },
  );
  assert.equal(calls, 1);
  assert.equal(result.status, "available");
  assert.equal(result.version, "0.10.0");
  assert.equal(result.url, repository + "/releases/tag/v0.10.0");
  assert(Number.isFinite(Date.parse(result.checkedAt)));
});

test("same, newer and locally ahead versions have distinct outcomes", async () => {
  assert.equal(
    (
      await checkForUpdates(
        "0.6.1",
        repository,
        undefined,
        responder(release("v0.6.1")),
      )
    ).status,
    "current",
  );
  assert.equal(
    (
      await checkForUpdates(
        "0.6.1",
        repository,
        undefined,
        responder(release("v0.6.2")),
      )
    ).status,
    "available",
  );
  assert.equal(
    (
      await checkForUpdates(
        "0.7.0",
        repository,
        undefined,
        responder(release("v0.6.1")),
      )
    ).status,
    "ahead",
  );
});

test("network, rate limit, missing release, server and malformed responses stay recoverable", async () => {
  await assert.rejects(
    checkForUpdates("0.6.1", repository, undefined, async () => {
      throw new TypeError("fetch failed");
    }),
    { message: networkMessage },
  );
  for (const status of [403, 429])
    await assert.rejects(
      checkForUpdates("0.6.1", repository, undefined, responder({}, status)),
      /limiting update checks/,
    );
  await assert.rejects(
    checkForUpdates("0.6.1", repository, undefined, responder({}, 404)),
    /No public release/,
  );
  await assert.rejects(
    checkForUpdates("0.6.1", repository, undefined, responder({}, 503)),
    /unavailable/,
  );
  for (const data of [
    {},
    { ...release("v1.0.0"), draft: true },
    { ...release("v1.0.0"), prerelease: true },
    release("bad-tag"),
  ])
    await assert.rejects(
      checkForUpdates("0.6.1", repository, undefined, responder(data)),
      /could not be read/,
    );
});

test("canceling an update check aborts the request", async () => {
  const controller = new AbortController();
  const pending = checkForUpdates(
    "0.6.1",
    repository,
    controller.signal,
    (_url, options) =>
      new Promise((_resolve, reject) => {
        options?.signal?.addEventListener(
          "abort",
          () => reject(new Error("aborted")),
          { once: true },
        );
      }),
  );
  controller.abort();
  await assert.rejects(pending, { message: networkMessage });
});

test("release preview stays short and plain text", () => {
  assert.equal(releaseSummary(null), "");
  const summary = releaseSummary(
    "# Heading\n[Read](https://example.test) **this**\n" + "word ".repeat(200),
  );
  assert(summary.length <= 500);
  assert(!summary.includes("https://"));
  assert(summary.includes("Heading\nRead this"));
});

test("root package is the displayed version source and matches packaging metadata", async () => {
  const json = async (path: string) =>
    JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
  const pkg = await json("../package.json");
  assert.equal((await json("../desktop/package.json")).version, pkg.version);
  assert.equal((await json("../app.json")).expo.version, pkg.version);
  const metadata = await readFile(
    new URL("../src/about/metadata.ts", import.meta.url),
    "utf8",
  );
  assert(metadata.includes("currentVersion = appPackage.version"));
  const project = await json("../desktop/project-info.json");
  assert.equal(project.repository, repository);
  assert.equal(project.developer, "Derrick Chen");
  assert(project.releases[pkg.version].summary);
});
