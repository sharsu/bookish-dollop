/* Every sum written out inside a hint must actually balance.
 *
 * Hints are prose with arithmetic embedded, so the scanner has to know what is
 * arithmetic and what only looks like it. Each guard below was added because
 * the scanner got something wrong, and the comment says what - a scanner that
 * cries wolf gets switched off, and the two real faults it has caught since
 * (a pounds-and-pence equation, and a hint quoting the wrong difference) would
 * have gone out with it.
 */
const { loadApp, createReport } = require("./lib/harness");

const app = loadApp();
const report = createReport("HINT ARITHMETIC");

/* "25% of 80 = 20" reads as an equation but is not one to a plain evaluator. */
const PERCENT_OF = /(\d[\d,]*(?:\.\d+)?)\s*%\s*of\s*(\d[\d,]*(?:\.\d+)?)\s*(?:is|=)\s*(\d[\d,]*(?:\.\d+)?)/gi;

/* A chain of numbers joined by operators and at least one equals sign. Commas
   are kept inside a number: splitting "1,080" at the comma gives 1, and the
   scanner then reports a perfectly good sum as wrong. */
const CHAIN = /-?\d[\d,]*(?:\.\d+)?(?:\s*[+\-−×x*÷/]\s*-?\d[\d,]*(?:\.\d+)?)*\s*=\s*-?\d[\d,]*(?:\.\d+)?(?:\s*[+\-−×x*÷/]\s*-?\d[\d,]*(?:\.\d+)?)*/g;

const toNumber = text => Number(String(text).replace(/,/g, ""));

function evaluate(expression) {
  const js = expression
    .replace(/,/g, "")
    .replace(/−/g, "-")
    .replace(/[×x]/g, "*")
    .replace(/÷/g, "/");
  if (!/^[-+*/(). \d]+$/.test(js)) return null;      // superscripts, prose, symbols
  try {
    const value = Function(`"use strict"; return (${js});`)();
    return Number.isFinite(value) ? value : null;
  } catch (e) {
    return null;
  }
}

let checked = 0;
const wrong = [];
const hints = [...new Set(app.maths.concat(app.english).map(q => q.explain).filter(Boolean))];

hints.forEach(hint => {
  /* Drop the pound signs before scanning. "£154 ÷ £11 = 14" is a sound thing to
     write - money divided by money gives a count - but the scanner cannot parse
     £, so it would grab only the tail and read "11 = 14". Stripping the symbol
     makes it "154 ÷ 11 = 14", which checks out.

     This widens the check rather than narrowing it: a hint that mixes pounds
     and pence in one equation now fails, which is exactly the fault that
     reached a paper as "£1.56 ÷ 4 = 39p per 100 g". */
  let text = hint.replace(/£/g, "");

  /* Check the percentage statements, then blank them out so the chain scan
     below does not read the numbers they leave behind as an equation. */
  PERCENT_OF.lastIndex = 0;
  const spans = [];
  let pm;
  while ((pm = PERCENT_OF.exec(text))) {
    checked += 1;
    const want = toNumber(pm[1]) / 100 * toNumber(pm[2]);
    if (Math.abs(want - toNumber(pm[3])) > 1e-9) {
      wrong.push({ fragment: pm[0], detail: `${pm[1]}% of ${pm[2]} is ${want}`, hint });
    }
    spans.push([pm.index, pm.index + pm[0].length]);
  }
  spans.reverse().forEach(([a, b]) => {
    text = text.slice(0, a) + " ".repeat(b - a) + text.slice(b);
  });

  CHAIN.lastIndex = 0;
  let m;
  while ((m = CHAIN.exec(text))) {
    const lead = text.slice(0, m.index).replace(/\s+$/, "");
    const before = lead.slice(-1);
    const after = text[m.index + m[0].length];

    /* An operator immediately before the match means the left-hand operand was
       cut off and the fragment is not a sum: in "172p ÷ 4 = 43p" the "172p" is
       not numeric, so the chain starts at the 4 and reads "4 = 43".

       The chain also stops dead at a "^", so "36 = 2^ * 3^" would read as
       "36 = 2"; the invented symbols from logDefinedOperator are arithmetic to
       a reader but not to an evaluator; and √ turns "√25 = 5" into "25 = 5". */
    if (after === "^" || "^⊗⊙∆□⊕√+-−×x*÷/".includes(before)) continue;

    /* An unknown standing where a number would be: "a + 5 = 2(a − 8)" is
       algebra, and the scanner would pull "+ 5 = 2" out of the middle of it.
       The letter has to stand ALONE - in "is 3 + 4 = 7" the letter before the
       match is the end of a word, and that sum is real. */
    if (/(^|[^A-Za-z])[A-Za-z]$/.test(lead)) continue;

    /* "= 2(a − 8)" captures only the 2, so the right-hand side is truncated. */
    if (after === "(") continue;

    const sides = m[0].split("=").map(s => s.trim()).filter(Boolean);
    if (sides.length < 2) continue;
    const values = sides.map(evaluate);
    if (values.some(v => v === null)) continue;
    checked += 1;

    /* A hint may legitimately round: "180 ÷ 11 = 16.364" is how a person
       writes it, and demanding 16.363636363636363 would fail every one of
       them. A side that is a bare decimal is therefore allowed to be the
       other side rounded to the number of places it actually shows. */
    const tolerance = side => {
      const bare = /^-?\d[\d,]*(?:\.(\d+))?$/.exec(side.trim());
      if (!bare) return 1e-9;
      return bare[1] ? 0.5 * Math.pow(10, -bare[1].length) : 1e-9;
    };
    const slack = Math.max(...sides.map(tolerance));
    if (values.some(v => Math.abs(v - values[0]) > slack)) {
      wrong.push({ fragment: m[0].trim(), detail: `sides evaluate to ${values.join(", ")}`, hint });
    }
  }
});

report.check("the scanner actually found sums to check", () =>
  checked > 500 || `only ${checked} sums found - the check is close to vacuous`);

report.check("every worked sum inside a hint balances", () => {
  if (!wrong.length) return true;
  const first = wrong.slice(0, 3)
    .map(w => `"${w.fragment}" (${w.detail}) in: ${w.hint.replace(/\s+/g, " ").slice(0, 90)}`)
    .join("  |  ");
  return `${wrong.length} wrong, e.g. ${first}`;
});

report.check("hints exist for a decent share of the bank", () => {
  const withHint = app.maths.filter(q => q.explain).length;
  const share = withHint / app.maths.length;
  return share > 0.5 || `only ${Math.round(share * 100)}% of maths questions carry a hint`;
});

report.note(`${hints.length} distinct hints, ${checked} worked sums checked`);
process.exit(report.finish() ? 0 : 1);
