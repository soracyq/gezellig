/* global __dirname */
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
if (!fs.existsSync(path.join(root, "dist", "index.html"))) {
  console.error(
    "No production web build found. Run npm run desktop to build and open Dutchly.",
  );
  process.exit(1);
}
let electron;
try {
  electron = require("electron");
} catch {
  console.error(
    "Electron is not installed. Run npm install in the project folder first.",
  );
  process.exit(1);
}
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
const child = spawn(
  electron,
  [path.join(root, "desktop"), ...process.argv.slice(2)],
  { cwd: root, stdio: "inherit", windowsHide: true, env },
);
child.on("error", (error) => {
  console.error("Dutchly could not start:", error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code || 0;
});
