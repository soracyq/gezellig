/* global __dirname */
const path = require("node:path");
const { build } = require("electron-builder");
// The UI reads the root package version. Reject mismatched packaging metadata
// rather than shipping an About window that misreports the installed version.
if (
  require("../package.json").version !==
  require("../desktop/package.json").version
) {
  console.error(
    "Desktop and root package versions must match before building.",
  );
  process.exit(1);
}
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
    // electron-builder already loads desktop/electron-builder.json. Passing it
    // again concatenates resource/target arrays and races duplicate file copies.
    electronVersion: require("electron/package.json").version,
  },
}).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
