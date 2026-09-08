const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test, after } = require("node:test");
const {
  resolveStaticFile,
  responseHeaders,
  isTemplatePath,
} = require("./static-files.cjs");

const fixture = fs
  .mkdtemp(path.join(os.tmpdir(), "dutchly-static-"))
  .then(async (root) => {
    await fs.mkdir(path.join(root, "templates"));
    await fs.writeFile(path.join(root, "index.html"), "<h1>Dutchly</h1>");
    await fs.writeFile(path.join(root, "grammar.html"), "<h1>Grammar</h1>");
    await fs.writeFile(
      path.join(root, "import-worker.js"),
      "self.onmessage = () => {};",
    );
    await fs.writeFile(
      path.join(root, "templates", "vocabulary_example.csv"),
      "dutch,english\nleren,learn",
    );
    return root;
  });

after(async () => {
  const root = await fixture;
  await fs.unlink(path.join(root, "templates", "vocabulary_example.csv"));
  await fs.rmdir(path.join(root, "templates"));
  for (const name of ["index.html", "grammar.html", "import-worker.js"])
    await fs.unlink(path.join(root, name));
  await fs.rmdir(root);
});

test("serves the home page, extensionless Expo routes, and assets with correct types", async () => {
  const root = await fixture;
  assert.match((await resolveStaticFile(root, "/")).path, /index\.html$/);
  assert.match(
    (await resolveStaticFile(root, "/grammar")).path,
    /grammar\.html$/,
  );
  assert.equal(
    (await resolveStaticFile(root, "/import-worker.js")).contentType,
    "text/javascript; charset=utf-8",
  );
  assert.equal(await resolveStaticFile(root, "/missing"), null);
});

test("rejects traversal, Windows alternate streams, nulls, and malformed encoding", async () => {
  const root = await fixture;
  for (const value of [
    "/../secret",
    "/%2e%2e/secret",
    "/%2e%2e%5csecret",
    "/grammar.html:stream",
    "/%00",
    "/%E0%A4%A",
    "grammar",
  ]) {
    assert.equal(await resolveStaticFile(root, value), null, value);
  }
});

test("only the eight known template names are treated as attachments", async () => {
  for (const kind of ["vocabulary", "grammar"]) {
    for (const variation of ["template", "example"]) {
      for (const extension of ["csv", "xlsx"])
        assert.equal(
          isTemplatePath(`/templates/${kind}_${variation}.${extension}`),
          true,
        );
    }
  }
  assert.equal(isTemplatePath("/templates/unknown.csv"), false);
  assert.equal(isTemplatePath("/templates/vocabulary_example.csv.exe"), false);
  const file = await resolveStaticFile(
    await fixture,
    "/templates/vocabulary_example.csv",
  );
  const headers = responseHeaders(file, "/templates/vocabulary_example.csv");
  assert.equal(
    headers["Content-Disposition"],
    'attachment; filename="vocabulary_example.csv"',
  );
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.match(headers["Content-Security-Policy"], /worker-src 'self' blob:/);
});
