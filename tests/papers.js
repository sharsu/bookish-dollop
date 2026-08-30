/* What a generated paper has to look like.
 *
 * These build real papers through selectQuizQuestions rather than reading the
 * config back, because the config is only an intention - the picking loop
 * balances topic, difficulty and passage quota against what the bank can
 * actually supply, and any of those can lose.
 */
const { loadApp, createReport, shuffle, questionKey } = require("./lib/harness");

const app = loadApp();
const report = createReport("PAPERS");
const { ctx, config, resultsKey } = app;

const TYPES = ["maths", "nvrt", "english"];

function build(testType, papers = 24) {
  const spec = config.papers[testType];
  const bank = ctx.getQuestionBankForTestType(testType);
  return Array.from({ length: papers }, () =>
    ctx.selectQuizQuestions(bank, spec.questions, shuffle,
      { studentName: "Milan", testType }));
}

/* Recent results in storage change what the picker does, so each case sets its
   own and clears up afterwards. */
function withHistory(rows, fn) {
  const before = app.store[resultsKey];
  if (rows) app.localStorageSet = null;
  if (rows) ctx.localStorage.setItem(resultsKey, JSON.stringify(rows));
  else ctx.localStorage.removeItem(resultsKey);
  try { return fn(); }
  finally {
    if (before === undefined) ctx.localStorage.removeItem(resultsKey);
    else ctx.localStorage.setItem(resultsKey, before);
  }
}

const history = (testType, percentage, count = 6) =>
  Array.from({ length: count }, (unused, k) => ({
    testType, percentage, correct: 1, questionCount: 2, timeTakenSeconds: 100,
    skipped: 0, topicBreakdown: [], completedAt: new Date(2026, 7, 1 + k).toISOString()
  }));

TYPES.forEach(testType => {
  const spec = config.papers[testType];

  report.check(`${testType}: every paper is ${spec.questions} questions long`, () => {
    const papers = withHistory(null, () => build(testType));
    const short = papers.filter(p => p.length !== spec.questions).length;
    return short === 0 || `${short} of ${papers.length} papers were not full length`;
  });

  report.check(`${testType}: no paper asks the same question twice`, () => {
    const papers = withHistory(null, () => build(testType));
    const bad = papers.filter(p => new Set(p.map(questionKey)).size !== p.length).length;
    return bad === 0 || `${bad} papers repeated a question`;
  });
});

/* ── the configured difficulty mix ── */
report.check("a maths paper is 60% Super Hard and 40% Hard, whatever the child has scored", () => {
  /* The share used to come off the recent average, and at 38% that rule handed
     back 80% HARD - the opposite of what is wanted. A weak record is therefore
     the case worth testing. */
  for (const [label, rows] of [
    ["no history", null],
    ["a strong record", history("maths", 92)],
    ["a weak record", history("maths", 38)]
  ]) {
    const tally = {};
    withHistory(rows, () => build("maths", 12)).forEach(paper =>
      paper.forEach(q => { tally[q.difficulty] = (tally[q.difficulty] || 0) + 1; }));
    const total = (tally[3] || 0) + (tally[4] || 0);
    if (!total) return `${label}: no Hard or Super Hard questions at all`;
    const superShare = Math.round(100 * (tally[4] || 0) / total);
    if (Math.abs(superShare - 60) > 3) return `${label}: ${superShare}% Super Hard, expected 60%`;
  }
  return true;
});

/* ── spread across templates ── */
report.check("a maths paper never asks the same template twice", () => {
  /* Topic and difficulty were balanced, but inside a topic the pick was
     weighted by how many questions each template happened to hold, so one with
     150 crowded out one with 50 and 65% of papers asked some shape three times
     over with only the numbers changed. */
  const papers = withHistory(null, () => build("maths", 12));
  let worst = 0, worstName = "";
  papers.forEach(paper => {
    const count = {};
    paper.forEach(q => { count[q.template] = (count[q.template] || 0) + 1; });
    Object.entries(count).forEach(([name, n]) => {
      if (n > worst) { worst = n; worstName = name; }
    });
  });
  return worst <= 1 || `${worstName} appeared ${worst} times in one paper`;
});

report.check("a maths paper spans every topic", () => {
  const papers = withHistory(null, () => build("maths", 12));
  const topics = new Set(app.maths.map(q => q.topic)).size;
  const worst = Math.min(...papers.map(p => new Set(p.map(q => q.topic)).size));
  return worst === topics || `a paper covered only ${worst} of the ${topics} topics`;
});

/* ── comprehension passages ── */
report.check("an English paper carries between one and the configured number of passages", () => {
  /* One is correct, not short: a text past singlePassageLineLimit is
     deliberately a paper on its own, because asking a child to read two of them
     inside the time allowed is not a comprehension test. */
  const wanted = Math.max(1, Number(config.comprehensionPassagesPerPaper) || 1);
  const counts = withHistory(null, () => build("english", 20))
    .map(paper => new Set(paper.filter(q => q.group).map(q => q.group)).size);
  const low = Math.min(...counts), high = Math.max(...counts);
  if (low < 1) return `a paper had no passage at all`;
  if (high > wanted) return `a paper had ${high} passages, config asks for ${wanted}`;
  return true;
});

report.check("questions from one passage run together", () => {
  const papers = withHistory(null, () => build("english", 12));
  for (const paper of papers) {
    const seen = new Map();
    paper.forEach((q, index) => {
      if (!q.group) return;
      if (!seen.has(q.group)) seen.set(q.group, []);
      seen.get(q.group).push(index);
    });
    for (const [group, positions] of seen) {
      const span = positions[positions.length - 1] - positions[0] + 1;
      if (span !== positions.length) return `${group} is split across the paper`;
    }
  }
  return true;
});

/* ── the difficulty range is honoured ── */
report.check("no paper contains a level the config does not allow", () => {
  const allowed = new Set(ctx.getAllowedDifficulties("maths"));
  const papers = withHistory(null, () => build("maths", 12));
  for (const paper of papers) {
    const stray = paper.find(q => !allowed.has(q.difficulty));
    if (stray) return `a ${stray.difficulty} appeared, allowed are ${[...allowed].join(", ")}`;
  }
  return true;
});

report.note(`papers configured: ` +
  TYPES.map(t => `${t} ${config.papers[t].questions}q/${config.papers[t].timeLimit}min`).join(", "));
process.exit(report.finish() ? 0 : 1);
