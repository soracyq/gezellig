/* global __dirname */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const {
  resolveStaticFile,
  responseHeaders,
  securityHeaders,
} = require("../desktop/static-files.cjs");

const args = process.argv.slice(2);
const validArgs =
  args.length === 0 || (args.length === 2 && args[0] === "--port");
const port = args.length ? Number(args[1]) : 4173;
if (!validArgs || !Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(
    "Usage: npm run preview:web -- --port 4173 (port must be 1–65535)",
  );
  process.exit(1);
}
const root = path.resolve(__dirname, "..", "dist");
if (!fs.existsSync(path.join(root, "index.html"))) {
  console.error("No production web build found. Run npm run export:web first.");
  process.exit(1);
}
const server = http.createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { ...securityHeaders, Allow: "GET, HEAD" });
    response.end("Method not allowed");
    return;
  }
  try {
    const pathname = new URL(request.url, `http://127.0.0.1:${port}`).pathname;
    const file = await resolveStaticFile(root, pathname);
    if (!file) {
      response.writeHead(404, {
        ...securityHeaders,
        "Content-Type": "text/plain; charset=utf-8",
      });
      response.end("Page not found. Open / to return to Gezellig.");
      return;
    }
    response.writeHead(200, {
      ...responseHeaders(file, pathname),
      "Content-Length": file.size,
    });
    if (request.method === "HEAD") response.end();
    else {
      const stream = fs.createReadStream(file.path);
      stream.on("error", () => response.destroy());
      stream.pipe(response);
    }
  } catch (error) {
    console.error("Preview request failed:", error.message);
    if (!response.headersSent) response.writeHead(500, securityHeaders);
    response.end("Could not load this page");
  }
});
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Stop the earlier preview with Ctrl+C, or run npm run preview:web -- --port ${port === 65535 ? 4174 : port + 1}`,
    );
  } else console.error("The preview could not start:", error.message);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => {
  console.log(`Gezellig production preview: http://127.0.0.1:${port}`);
  console.log("Keep this terminal open. Press Ctrl+C to stop.");
  console.log(
    "Use this same address and port again to keep the same browser data.",
  );
});
