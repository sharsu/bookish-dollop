/* Shared loader and reporter for the checks in tests/.
 *
 * The app has no build step and no module system - every file is a <script> tag
 * that declares things at the top level of its own IIFE. Those top-level consts
 * never land on the context object, so they have to be asked for by name after
 * the files are evaluated; QUESTIONS, CONFIG and the rest are pulled across
 * explicitly below. Forgetting that is the commonest way one of these checks
 * ends up reporting "undefined" instead of a real result.
 *
 * js/app.js expects a browser, so document, localStorage and the timers are
 * mocked just enough for the question-selection code to run.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..", "..");

const FILES = [
  "js/diagrams.js",
  "js/questions.js",
  "js/questions-counting-principle.js",
  "js/questions-nvrt.js",
  "js/passages-english.js",
  "js/questions-english.js",
  "js/config.js",
  "js/app.js"
];

/* Names declared at the top level of the app's files that the checks need. */
const EXPORTS = [
  "QUESTIONS", "ENGLISH_QUESTIONS", "NVRT_QUESTIONS",
  "CONFIG", "RESULTS_STORAGE_KEY"
];

function loadApp(options = {}) {
  const store = Object.create(null);
  const ctx = { console: { log() {}, warn() {}, error() {} } };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  ctx.document = {
    addEventListener() {},
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }),
    body: { appendChild() {} }
  };
  ctx.localStorage = {
    getItem: key => (key in store ? store[key] : null),
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: key => { delete store[key]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; }
  };
  ctx.setInterval = () => 0;
  ctx.clearInterval = () => {};
  ctx.setTimeout = () => 0;
  ctx.clearTimeout = () => {};
  vm.createContext(ctx);

  const files = options.files || FILES;
  files.forEach(rel => {
    const full = path.join(ROOT, rel);
    vm.runInContext(fs.readFileSync(full, "utf8"), ctx, { filename: rel });
  });

  /* Pull the top-level declarations onto the context. A file that does not
     declare one is skipped rather than taking the whole load down. */
  EXPORTS.forEach(name => {
    try {
      vm.runInContext(`window.__${name} = typeof ${name} === "undefined" ? null : ${name};`, ctx);
    } catch (e) { ctx["__" + name] = null; }
  });

  return {
    ctx,
    store,
    maths: ctx.__QUESTIONS || [],
    english: ctx.__ENGLISH_QUESTIONS || [],
    nvrt: ctx.__NVRT_QUESTIONS || [],
    config: ctx.__CONFIG,
    resultsKey: ctx.__RESULTS_STORAGE_KEY
  };
}

/* A deterministic-enough shuffle for building sample papers. */
function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* What makes two questions the same question. The picture counts: NVRT reuses
   111 question texts across 3,956 image variants, and several maths templates
   print one sentence and vary only the figure they draw, so keying on the stem
   alone calls every one of those a duplicate. */
function questionKey(q) {
  return [
    q.question,
    (q.options || []).join("|"),
    q.questionImage || q.questionImageAlt || ""
  ].join("");
}

/* A tiny reporter. A check returns true, or a string saying what is wrong. */
function createReport(title) {
  let passed = 0;
  const failures = [];
  console.log(title);
  console.log("=".repeat(Math.max(title.length, 60)));

  return {
    check(name, fn) {
      let result;
      try {
        result = fn();
      } catch (e) {
        result = "threw: " + e.message;
      }
      if (result === true) {
        passed += 1;
        console.log("  ok    " + name);
      } else {
        failures.push({ name, detail: String(result) });
        console.log("  FAIL  " + name);
        console.log("        " + String(result));
      }
    },
    note(text) { console.log("  --    " + text); },
    finish() {
      console.log("");
      console.log(`${passed} passed, ${failures.length} failed`);
      return failures.length === 0;
    }
  };
}

/* Every permutation of a short list, for brute-force answer checks. */
function permutations(list) {
  if (list.length <= 1) return [list];
  return list.flatMap((item, index) =>
    permutations([...list.slice(0, index), ...list.slice(index + 1)])
      .map(rest => [item, ...rest]));
}

const byTemplate = (bank, name) => bank.filter(q => q.template === name);
const plain = value => String(value).replace(/[,£\s]/g, "");
const digitSignature = value => String(value).replace(/[^0-9]/g, "").split("").sort().join("");

module.exports = {
  ROOT, FILES, loadApp, shuffle, questionKey, createReport,
  permutations, byTemplate, plain, digitSignature
};
