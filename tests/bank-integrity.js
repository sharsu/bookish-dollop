/* Things that must be true of every question in every bank, whatever it asks.
 *
 * Most of these exist because a real question shipped breaking them. Where that
 * is so, the comment says which one - a check whose reason has been forgotten
 * is the first to be deleted when it becomes inconvenient.
 */
const { loadApp, createReport, plain } = require("./lib/harness");

const app = loadApp();
const report = createReport("BANK INTEGRITY");
const banks = [
  ["maths", app.maths],
  ["english", app.english],
  ["nvrt", app.nvrt]
];

const sample = list => list.slice(0, 2)
  .map(q => `${q.template || q.topic}: ${String(q.question).replace(/\s+/g, " ").slice(0, 70)} [${(q.options || []).join(" / ")}]`)
  .join("  |  ");

banks.forEach(([name, bank]) => {
  report.check(`${name}: every question's answer points at one of its options`, () => {
    /* Not every bank offers four. English spelling questions add a fifth,
       "No mistake", and NVRT offers Picture A to E - so the rule is that the
       index is inside the list, not that the list is a particular length. */
    const bad = bank.filter(q =>
      !Array.isArray(q.options) || q.options.length < 2 ||
      typeof q.answer !== "number" || q.answer < 0 || q.answer >= q.options.length);
    return bad.length === 0 || `${bad.length} questions, e.g. ${sample(bad)}`;
  });

  report.check(`${name}: no question offers the same option twice`, () => {
    const bad = bank.filter(q => new Set((q.options || []).map(String)).size !== (q.options || []).length);
    return bad.length === 0 || `${bad.length} questions, e.g. ${sample(bad)}`;
  });

  report.check(`${name}: every question has a non-empty stem`, () => {
    const bad = bank.filter(q => !q.question || !String(q.question).trim());
    return bad.length === 0 || `${bad.length} questions`;
  });

  report.check(`${name}: every difficulty is 1 to 4`, () => {
    const bad = bank.filter(q => ![1, 2, 3, 4].includes(q.difficulty));
    return bad.length === 0 || `${bad.length} questions`;
  });
});

/* ── option formatting, all learned from questions that shipped ── */

report.check("no negative amount of money is offered", () => {
  /* pctSaleChange and friends modelled real misconceptions that ran below zero
     and printed answers like -£1.40. */
  const bad = app.maths.filter(q => (q.options || []).some(o => /£\s*-|-\s*£/.test(String(o))));
  return bad.length === 0 || `${bad.length} questions, e.g. ${sample(bad)}`;
});

report.check("money is never printed beyond two decimal places", () => {
  const bad = app.maths.filter(q => (q.options || []).some(o => /£\d[\d,]*\.\d{3,}/.test(String(o))));
  return bad.length === 0 || `${bad.length} questions, e.g. ${sample(bad)}`;
});

report.check("no clock time has a fraction of a minute", () => {
  /* spdHalfSpeedWithStops printed 10:50.5 am when an odd run was halved. */
  const bad = app.maths.filter(q => (q.options || []).some(o => /\d+:\d+\.\d/.test(String(o))));
  return bad.length === 0 || `${bad.length} questions, e.g. ${sample(bad)}`;
});

report.check("the answer is never the only decimal among whole numbers", () => {
  /* meaInchConvert and decMultiplyBySmall made the answer stand out: a child
     could pick it without doing the question.

     Only applies when every option carries the SAME unit. meaEstimateSize
     offers "17 m / 70 cm / 7 m / 1.7 m", where the bare numbers are not
     comparable at all - choosing between a length in metres and one in
     centimetres is the question, not a formatting slip. */
  const UNIT = /(cm²|cm³|cm|mm|km\/h|km|kg|ml|litres?|m|g|p|%|°)$/i;
  const bad = app.maths.filter(q => {
    if (!q.options || q.options.length !== 4) return false;
    const texts = q.options.map(o => plain(o));
    const units = texts.map(t => (t.match(UNIT) || [""])[0].toLowerCase());
    if (new Set(units).size !== 1) return false;          // mixed units: not comparable
    const values = texts.map(t => t.replace(UNIT, ""));
    if (!values.every(v => /^-?\d+(\.\d+)?$/.test(v))) return false;
    const decimals = values.filter(v => v.includes("."));
    return decimals.length === 1 && values[q.answer].includes(".");
  });
  return bad.length === 0 || `${bad.length} questions, e.g. ${sample(bad)}`;
});

report.check("no probability question offers a value outside 0 to 1", () => {
  /* probThreeIndependent offered 7.064 and probComplement 6.5: their distractor
     lists were filtered to real probabilities, and when that left mk short it
     padded with nudge(), which knows nothing about the topic. Only questions
     whose ANSWER is a decimal probability are checked - plenty of probability
     questions answer with a count, and 36 is not a broken option. */
  const bad = app.maths.filter(q => q.topic === "Probability").filter(q => {
    const answer = String(q.options[q.answer]).trim();
    if (!/^0?\.\d+$/.test(answer)) return false;
    return q.options.some(o => {
      const text = String(o).trim();
      if (!/^-?\d*\.?\d+$/.test(text)) return false;      // fractions, words, %
      const value = Number(text);
      return !(value >= 0 && value <= 1);
    });
  });
  return bad.length === 0 || `${bad.length} questions, e.g. ${sample(bad)}`;
});

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

report.check("a fraction answer is always given in its lowest terms", () => {
  const bad = app.maths.filter(q => {
    const answer = String(q.options[q.answer]).trim();
    const m = /^(\d+)\/(\d+)$/.exec(answer);
    return m && gcd(Number(m[1]), Number(m[2])) !== 1;
  });
  return bad.length === 0 || `${bad.length} questions, e.g. ${sample(bad)}`;
});

report.check("fracThreeMixedChain never prints an uncancelled fraction", () => {
  /* It asked for "3 2/10", which a child cancels to 1/5 before starting and is
     then working from different numbers than the hint quotes. Other templates
     may print 5/10 on purpose - cancelling it is part of the exercise - so this
     is the one place the rule belongs. */
  const bad = app.maths.filter(q => q.template === "fracThreeMixedChain").filter(q =>
    [...String(q.question).matchAll(/(\d+)\/(\d+)/g)]
      .some(m => gcd(Number(m[1]), Number(m[2])) !== 1));
  return bad.length === 0 || `${bad.length} questions, e.g. ${sample(bad)}`;
});

report.check("every maths question names a template", () => {
  /* The paper builder spreads a paper across templates; a question without one
     cannot take part, and silently weights the pick towards its topic. */
  const bad = app.maths.filter(q => !q.template);
  return bad.length === 0 || `${bad.length} questions have no template`;
});

report.note(`maths ${app.maths.length}, english ${app.english.length}, nvrt ${app.nvrt.length}`);
process.exit(report.finish() ? 0 : 1);
