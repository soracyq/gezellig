/* global __dirname */
const path = require("node:path");
const { build } = require("electron-builder");
const config = require("../desktop/electron-builder.json");
const args = process.argv.slice(2);
if (args.length && (args.length !== 1 || args[0] !== "--dir")) {
  console.error("Usage: node scripts/build-desktop.cjs [--dir]");
  process.exit(1);
}
// Package the dependency-free wrapper as its own project; Expo dependencies
// already live inside dist and must not be collected as desktop Node modules.
build({
  projectDir: path.resolve(__dirname, "../desktop"),
  dir: args.includes("--dir"),
  config: {
    ...config,
    electronVersion: require("electron/package.json").version,
  },
}).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
