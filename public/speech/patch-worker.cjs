/* SPDX-License-Identifier: GPL-3.0-or-later */
// Reproduce the only Dutchly edit to the pinned upstream worker.
// First download js/espeakng.worker.js from the commit recorded in NOTICE.md.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const workerPath = path.join(__dirname, "espeakng.worker.js");
const original = fs.readFileSync(workerPath, "utf8");
const upstreamHash = "27dbae622e8dbd2b4f5def07208db1c557554148b83a99bacba37419031e2e2e";
const upstreamPrefix = 'var Module;if(typeof Module==="undefined")Module=eval("(function() { try { return Module || {} } catch(e) { return {} } })()");';
const localPrefix = '/* Dutchly: replace the startup eval with its equivalent literal for strict Content Security Policy; see NOTICE.md. */\nvar Module;if(typeof Module==="undefined")Module={};';
if (original.startsWith(localPrefix)) {
  console.log("Local worker patch already applied.");
} else {
  const actualHash = crypto.createHash("sha256").update(original).digest("hex");
  if (actualHash !== upstreamHash || !original.startsWith(upstreamPrefix)) {
    throw new Error("Worker does not match the pinned upstream bytes; refusing to patch.");
  }
  fs.writeFileSync(workerPath, localPrefix + original.slice(upstreamPrefix.length));
  console.log("Patched worker startup without changing the speech engine or language data.");
}
