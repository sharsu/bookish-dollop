/* What a generated paper has to look like.
 *
 * These build real papers through selectQuizQuestions rather than reading the
 * config back, because the config is only an intention - the picking loop
 * balances topic, difficulty and passage quota against what the bank can
 * actually supply, and any of those can lose.
 */
const { loadApp, createReport, shuffle, questionKey, FILES } = require("./lib/harness");

/* js/skills.js as well as the usual files: the revision-length checks below
   need the skill list, and nothing else in the suite loads it. */
const app = loadApp({ files: FILES.concat(["js/skills.js"]) });
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

/* The expected shares are read from config rather than written here, so
   changing the mix does not mean editing a test to agree with it. What is
   being checked is that a real paper MATCHES the setting - which is a
   different claim from the setting having a particular value. */
function expectedShares(testType) {
  const raw = config.difficultyMix;
  if (!raw) return null;
  const named = raw[testType];
  const chosen = (named && typeof named === "object") ? named
    : (raw.default && typeof raw.default === "object") ? raw.default : raw;
  const allowed = ctx.getAllowedDifficulties(testType);
  const weights = allowed.filter(level => Number(chosen[level]) > 0);
  if (!weights.length) return null;
  const total = weights.reduce((sum, level) => sum + Number(chosen[level]), 0);
  return Object.fromEntries(weights.map(level =>
    [level, Math.round(100 * Number(chosen[level]) / total)]));
}

TYPES.forEach(testType => {
  report.check(`${testType}: a paper matches the configured mix, whatever the child has scored`, () => {
    const want = expectedShares(testType);
    if (!want) return true;                       // no mix configured for this test
    /* The share used to come off the recent average, and at 38% that rule
       handed back 80% Hard - the opposite of what was wanted. A weak record is
       therefore the case worth testing. */
    for (const [label, rows] of [
      ["no history", null],
      ["a strong record", history(testType, 92)],
      ["a weak record", history(testType, 38)]
    ]) {
      const tally = {};
      withHistory(rows, () => build(testType, 12)).forEach(paper =>
        paper.forEach(q => { tally[q.difficulty] = (tally[q.difficulty] || 0) + 1; }));
      const total = Object.values(tally).reduce((a, b) => a + b, 0);
      if (!total) return `${label}: the papers were empty`;
      for (const [level, share] of Object.entries(want)) {
        const got = Math.round(100 * (tally[level] || 0) / total);
        if (Math.abs(got - share) > 3) {
          return `${label}: level ${level} is ${got}% of the paper, config asks for ${share}%`;
        }
      }
      const stray = Object.keys(tally).filter(level => !(level in want));
      if (stray.length) return `${label}: level ${stray.join(", ")} appeared but has no share`;
    }
    return true;
  });
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

/* ── the Practice Paper a parent builds ──────────────────────────────────
 *
 * The paper itself is built by buildPracticePaper(), which takes a topic list
 * and a preset and nothing else - no DOM - so these run it for real rather
 * than re-implementing what it does.
 */

const TOPIC_SETS = [
  ["Fractions"],
  ["Fractions", "Algebra"],
  ["Geometry", "Probability", "Sequences"],
  ["Numbers", "Decimals", "Percentages", "Ratio"]
];

const presets = () => ctx.getPracticePresets();

function practicePaper(topics, presetId, count = 20) {
  return ctx.buildPracticePaper({
    topics, presetId, count, studentName: "Milan", shuffleArray: shuffle
  });
}

report.check("a practice paper contains only the topics that were picked", () => {
  let papers = 0;
  for (const topics of TOPIC_SETS) {
    for (const preset of presets()) {
      const built = practicePaper(topics, preset.id);
      papers++;
      if (!built.questions.length) return `${preset.id} on ${topics.join("+")} produced nothing`;
      const stray = built.questions.find(q => !topics.includes(q.topic));
      if (stray) return `${preset.id} on ${topics.join("+")} slipped in a ${stray.topic} question`;
    }
  }
  if (papers < 12) return `only ${papers} papers were built`;
  return true;
});

report.check("a practice paper uses only the levels its preset allows", () => {
  for (const preset of presets()) {
    /* A preset with no levels of its own means "whatever a real paper uses",
       so that is what it is held to. */
    const allowed = new Set(ctx.getAllowedDifficulties("maths", preset.difficulties));
    for (const topics of TOPIC_SETS) {
      const built = practicePaper(topics, preset.id);
      const stray = built.questions.find(q => !allowed.has(q.difficulty));
      if (stray) {
        return `${preset.id} produced a level ${stray.difficulty}, allowed are ${[...allowed].join(", ")}`;
      }
    }
  }
  return true;
});

report.check("the easiest-first preset really does climb, and the others do not have to", () => {
  const climbing = list => list.every((level, k) => k === 0 || list[k - 1] <= level);
  const ladders = presets().filter(preset => preset.order === "easiest-first");
  if (!ladders.length) return "no preset asks for a ladder, so nothing was checked";
  for (const preset of ladders) {
    for (const topics of TOPIC_SETS) {
      const built = practicePaper(topics, preset.id);
      if (!climbing(built.questions.map(q => q.difficulty))) {
        return `${preset.id} came out in a different order from easiest first`;
      }
      /* A ladder of all one level is sorted but teaches nothing, so the
         preset has to be reaching more than a single level. */
      if (new Set(built.questions.map(q => q.difficulty)).size < 2) {
        return `${preset.id} on ${topics.join("+")} is all one difficulty`;
      }
    }
  }
  return true;
});

report.check("asking for more questions than the topics hold shortens the paper, never pads it", () => {
  /* The failure this guards against is a paper quietly topping itself up from
     topics the parent did not pick. */
  const topics = ["Probability"];
  const preset = presets().find(p => p.difficulties && p.difficulties.length === 2) || presets()[0];
  const built = practicePaper(topics, preset.id, 5000);
  if (!built.questions.length) return "nothing was produced";
  if (built.questions.length > built.pool) {
    return `asked for 5,000, got ${built.questions.length} from a pool of ${built.pool}`;
  }
  const stray = built.questions.find(q => !topics.includes(q.topic));
  if (stray) return `padded with a ${stray.topic} question`;
  return true;
});

report.check("a practice paper never repeats a question, and spreads templates as widely as it can", () => {
  /* A practice paper is allowed to ask the same shape twice - twenty
     questions on one weak topic cannot avoid it, and drilling a shape with
     different numbers is the point. What it must not do is lean on one
     template while another goes unused, so the test is against the best any
     paper of that length could manage. */
  for (const topics of TOPIC_SETS) {
    for (const preset of presets()) {
      const built = practicePaper(topics, preset.id);
      const keys = built.questions.map(questionKey);
      if (new Set(keys).size !== keys.length) return `${preset.id} on ${topics.join("+")} repeated a question`;

      /* Per topic AND per level, because the paper is balanced on both: with
         two topics and twenty questions each topic gets ten, and Algebra has
         only a couple of templates at Easy however many Fractions has. The
         bound is what the tightest of those cells forces. */
      const cell = q => `${q.topic}|${q.difficulty}`;
      const templatesIn = {};
      ctx.practicePracticePool(topics, preset).forEach(q => {
        if (!q.template) return;
        (templatesIn[cell(q)] = templatesIn[cell(q)] || new Set()).add(q.template);
      });
      const askedIn = {};
      const counts = {};
      built.questions.forEach(q => {
        askedIn[cell(q)] = (askedIn[cell(q)] || 0) + 1;
        if (q.template) counts[q.template] = (counts[q.template] || 0) + 1;
      });
      if (!Object.keys(counts).length) continue;
      const best = Math.max(...Object.entries(askedIn).map(([key, asked]) =>
        Math.ceil(asked / Math.max(1, (templatesIn[key] || new Set()).size))));
      const worst = Math.max(...Object.values(counts));
      if (worst > best) {
        const name = Object.entries(counts).find(([, n]) => n === worst)[0];
        return `${preset.id} on ${topics.join("+")} asked ${name} ${worst} times; ` +
          `the tightest level needs no more than ${best}`;
      }
    }
  }
  return true;
});

report.check("a practice result stays out of the history a parent judges readiness by", () => {
  /* And - the bug this is really guarding - saving a real paper afterwards
     must not wipe the practice results out of the store, which is what
     happens if the save path reads the filtered list and writes it back. */
  const before = app.store[resultsKey];
  const row = (extra) => Object.assign({
    testType: "maths", studentName: "Milan", percentage: 50, correct: 5,
    questionCount: 10, timeTakenSeconds: 100, skipped: 0, topicBreakdown: [],
    completedAt: new Date(2026, 8, 1).toISOString()
  }, extra);
  try {
    ctx.localStorage.setItem(resultsKey, JSON.stringify([
      row({ id: "real-1" }),
      row({ id: "practice-1", practice: true, practiceTopics: ["Fractions"] })
    ]));

    const forReadiness = ctx.loadStoredResults();
    if (forReadiness.length !== 1) return `${forReadiness.length} results reached the readiness history, expected 1`;
    if (forReadiness[0].id !== "real-1") return `the practice paper is being counted as a real one`;

    const everything = ctx.loadStoredResults({ includePractice: true });
    if (everything.length !== 2) return `History can only see ${everything.length} of the 2 results`;

    /* Now save a real paper the way the app does, and check the practice one
       survived it. */
    const kept = ctx.loadStoredResults({ includePractice: true });
    kept.unshift(row({ id: "real-2" }));
    ctx.localStorage.setItem(resultsKey, JSON.stringify(kept));
    const after = ctx.loadStoredResults({ includePractice: true });
    if (!after.some(result => result.id === "practice-1")) {
      return "saving a real paper deleted the practice results";
    }
    return true;
  } finally {
    if (before === undefined) ctx.localStorage.removeItem(resultsKey);
    else ctx.localStorage.setItem(resultsKey, before);
  }
});

report.check("the questions-after-revision count follows config, rather than a number in the code", () => {
  const wanted = Number((config.practice || {}).questionsAfterRevision);
  if (!Number.isFinite(wanted) || wanted <= 0) return "config.practice.questionsAfterRevision is not a usable number";
  const skills = ctx.SKILLS || [];
  if (!skills.length) return "no skills are defined";
  /* Only skills with enough questions to fill the run can be held to the
     number; a thin skill genuinely gives what it has. */
  let checked = 0;
  for (const skill of skills) {
    const pool = ctx.getSkillQuestions(skill);
    if (pool.length < wanted + 4) continue;
    const run = ctx.buildSkillPractice(skill, shuffle);
    checked++;
    if (run.length !== wanted) {
      return `${skill.id} gave ${run.length} practice questions, config asks for ${wanted}`;
    }
  }
  if (checked < 10) return `only ${checked} skills had enough questions to check`;
  return true;
});

report.check("revision practice still climbs from the easiest level a skill has", () => {
  const skills = ctx.SKILLS || [];
  let laddered = 0;
  for (const skill of skills) {
    const run = ctx.buildSkillPractice(skill, shuffle);
    if (run.length < 2) continue;
    const levels = run.map(q => q.difficulty);
    if (!levels.every((level, k) => k === 0 || levels[k - 1] <= level)) {
      return `${skill.id} is not in easiest-first order`;
    }
    if (new Set(levels).size > 1) laddered++;
  }
  if (laddered < 10) return `only ${laddered} skills reached more than one difficulty`;
  return true;
});

report.note(`papers configured: ` +
  TYPES.map(t => `${t} ${config.papers[t].questions}q/${config.papers[t].timeLimit}min`).join(", "));
process.exit(report.finish() ? 0 : 1);
