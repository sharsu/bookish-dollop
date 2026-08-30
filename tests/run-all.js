#!/usr/bin/env node
/* Run every check. Exits non-zero if any of them fails, so it can gate a commit.
 *
 *   node tests/run-all.js
 *
 * Each suite runs in its own process: they each build the whole question bank,
 * and a bank left half-modified by one suite must not be what the next one
 * measures.
 */
const { spawnSync } = require("child_process");
const path = require("path");

const SUITES = [
  ["bank-integrity", "shape and formatting of every question in every bank"],
  ["answers", "answers re-derived from each question's own wording"],
  ["hints", "arithmetic written out inside hints"],
  ["figures", "drawn figures readable, and answerable without sight"],
  ["variety", "templates still produce genuinely different questions"],
  ["papers", "what a generated paper looks like"]
];

const only = process.argv[2];
const chosen = only ? SUITES.filter(([name]) => name.includes(only)) : SUITES;
if (!chosen.length) {
  console.error(`No suite matches "${only}". Available: ${SUITES.map(s => s[0]).join(", ")}`);
  process.exit(2);
}

const failed = [];
chosen.forEach(([name, description]) => {
  console.log("");
  console.log(`──── ${name} — ${description}`);
  const result = spawnSync(process.execPath, [path.join(__dirname, `${name}.js`)], {
    stdio: "inherit",
    cwd: path.join(__dirname, "..")
  });
  if (result.status !== 0) failed.push(name);
});

console.log("");
console.log("=".repeat(64));
if (failed.length) {
  console.log(`FAILED: ${failed.join(", ")}`);
  process.exit(1);
}
console.log(`All ${chosen.length} suites passed.`);
