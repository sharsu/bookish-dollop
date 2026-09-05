/* Re-derive answers from each question's own wording, by a route the generator
 * does not use.
 *
 * This is the point of the file. A check that re-applies the generator's own
 * formula proves only that the code is self-consistent: numSmallestEvenFromDigits
 * shipped wrong in all fifty of its questions with a plausible-looking rule
 * behind it, and it took a child sitting the paper to notice. So where the
 * question states a relationship the answer is SEARCHED for, and where it states
 * a construction it is BRUTE-FORCED - both share no algebra with the thing they
 * are checking.
 *
 * NEVER write ([\d.]+) to capture a price: it swallows a sentence's full stop
 * and Number("1.96.") is NaN, which surfaces as "cannot read" rather than as a
 * wrong answer. Use DEC below.
 */
const {
  loadApp, createReport, permutations, byTemplate, digitSignature
} = require("./lib/harness");

const app = loadApp();
const report = createReport("ANSWERS, RE-DERIVED INDEPENDENTLY");

const DEC = "(\\d+(?:\\.\\d+)?)";
const num = value => Number(String(value).replace(/[,£\s]/g, "").replace(/(cm²|cm³|cm|g|p|%|°)$/i, ""));
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const near = (a, b) => Math.abs(a - b) < 1e-6;

/* Register a template with a parser that returns the expected answer, or null
   when the wording cannot be read. `format` turns that into the printed form. */
function verify(template, parse, format = String) {
  report.check(`${template}: every answer re-derived`, () => {
    const rows = byTemplate(app.maths, template);
    if (!rows.length) return "the template generates nothing";
    for (const q of rows) {
      const want = parse(q.question, q);
      if (want === null || want === undefined) {
        return `cannot read "${String(q.question).replace(/\s+/g, " ").slice(0, 90)}"`;
      }
      const got = String(q.options[q.answer]);
      if (format(want) !== got) {
        return `"${String(q.question).replace(/\s+/g, " ").slice(0, 70)}" marked ${got}, expected ${format(want)}`;
      }
    }
    return true;
  });
}

/* ── the one a child found ── */
report.check("numSmallestEvenFromDigits: brute force over every arrangement", () => {
  /* It put the SMALLEST even digit in the units place and sorted the rest in
     front: for 4, 8, 1, 7, 9 that gave 17,894 when 14,798 is smaller. The units
     place is worth least, so spending a small digit there is backwards. Two of
     its four options were the answer plus or minus ten, which for those digits
     produced 17,904 - a 0, and no 8 - and 17,884, with two 8s. */
  const rows = byTemplate(app.maths, "numSmallestEvenFromDigits");
  if (!rows.length) return "the template generates nothing";
  for (const q of rows) {
    const m = /digits ([\d, ]+) once/.exec(q.question);
    if (!m) return "cannot read the digits from: " + q.question;
    const digits = m[1].split(",").map(d => Number(d.trim()));
    const best = Math.min(...permutations(digits)
      .map(p => Number(p.join("")))
      .filter(v => v % 2 === 0));
    const got = num(q.options[q.answer]);
    if (got !== best) return `digits ${m[1]}: marked ${got}, the smallest even arrangement is ${best}`;
    for (const option of q.options) {
      const value = num(option);
      if (digitSignature(value) !== digitSignature(digits.join(""))) {
        return `digits ${m[1]}: option ${option} is not an arrangement of them`;
      }
      if (value !== got && value % 2 === 0 && value < got) {
        return `digits ${m[1]}: option ${option} is even and smaller than the answer`;
      }
    }
  }
  return true;
});

/* ── spatial, brute-forced over the solid ── */
report.check("geoPaintedCube: brute force over every unit cube", () => {
  const rows = byTemplate(app.maths, "geoPaintedCube");
  if (!rows.length) return "the template generates nothing";
  const count = (n, faces) => {
    let total = 0;
    for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) for (let z = 0; z < n; z++) {
      let painted = 0;
      if (x === 0 || x === n - 1) painted++;
      if (y === 0 || y === n - 1) painted++;
      if (z === 0 || z === n - 1) painted++;
      if (painted === faces) total++;
    }
    return total;
  };
  for (const q of rows) {
    const size = /measuring (\d+) cm along each edge/.exec(q.question);
    const exact = /paint on exactly (\d+) faces?/.exec(q.question);
    const none = /no paint on them at all/.test(q.question);
    if (!size || (!exact && !none)) return "cannot read: " + q.question.slice(0, 80);
    const want = count(Number(size[1]), none ? 0 : Number(exact[1]));
    if (num(q.options[q.answer]) !== want) {
      return `${size[1]} cm cube: marked ${q.options[q.answer]}, brute force gives ${want}`;
    }
  }
  return true;
});

verify("geoJoinedCubesSurface", question => {
  const m = /^(\d+) identical cubes, each measuring (\d+) cm/.exec(question);
  if (!m) return null;
  const count = Number(m[1]), side = Number(m[2]);
  /* Build the row and ask each cell whether its neighbour exists. */
  let faces = 0;
  for (let x = 0; x < count; x++) {
    faces += 4;                                  // top, bottom, front, back
    if (x === 0) faces += 1;
    if (x === count - 1) faces += 1;
  }
  return faces * side * side;
}, v => `${v.toLocaleString("en-GB")} cm²`);

/* ── nets, rebuilt from the alt text a screen reader would hear ── */
report.check("geoNetOppositeFace and geoNetOppositeSum: rebuilt from their alt text", () => {
  const ORDINALS = ["first", "second", "third", "fourth"];
  const fromAlt = alt => {
    const row = /labelled (.+?) from left to right/.exec(alt);
    const above = /A square labelled (\S+) is attached above the (\w+) square/.exec(alt);
    const below = /A square labelled (\S+) is attached below the (\w+) square/.exec(alt);
    if (!row || !above || !below) return null;
    const strip = row[1].split(",").map(s => s.trim());
    if (strip.length !== 4) return null;
    return { strip, above: above[1], below: below[1] };
  };
  const opposite = (net, label) => {
    const pairs = [[net.strip[0], net.strip[2]], [net.strip[1], net.strip[3]], [net.above, net.below]];
    for (const [a, b] of pairs) {
      if (a === label) return b;
      if (b === label) return a;
    }
    return null;
  };
  for (const q of byTemplate(app.maths, "geoNetOppositeFace")) {
    const net = fromAlt(q.questionImageAlt || "");
    const asked = /opposite the face marked (\S+)\?/.exec(q.question);
    if (!net || !asked) return "cannot rebuild the net for geoNetOppositeFace";
    const want = opposite(net, asked[1]);
    if (q.options[q.answer] !== want) {
      return `asked ${asked[1]}: marked ${q.options[q.answer]}, the net gives ${want}`;
    }
  }
  for (const q of byTemplate(app.maths, "geoNetOppositeSum")) {
    const net = fromAlt(q.questionImageAlt || "");
    const total = /add up to (\d+)/.exec(q.question);
    if (!net || !total) return "cannot rebuild the net for geoNetOppositeSum";
    const facing = opposite(net, "?");
    if (facing === null) return "no face is marked with a question mark";
    const want = Number(total[1]) - Number(facing);
    if (num(q.options[q.answer]) !== want) {
      return `total ${total[1]}, "?" opposite ${facing}: marked ${q.options[q.answer]}, expected ${want}`;
    }
    /* every visible pair must actually add to the stated total */
    for (const [a, b] of [[net.strip[0], net.strip[2]], [net.strip[1], net.strip[3]], [net.above, net.below]]) {
      if (a === "?" || b === "?") continue;
      if (Number(a) + Number(b) !== Number(total[1])) {
        return `the net is not consistent: ${a} + ${b} is not ${total[1]}`;
      }
    }
  }
  return true;
});

/* ── parallel lines, measured off the drawing itself ── */
report.check("geoParallelLineAngles: measured from the drawn line coordinates", () => {
  const rows = byTemplate(app.maths, "geoParallelLineAngles");
  if (!rows.length) return "the template generates nothing";
  const regionAngle = (horizY, trans, point) => {
    const t = (horizY - trans.y1) / (trans.y2 - trans.y1);
    const ix = trans.x1 + t * (trans.x2 - trans.x1);
    const along = [Math.sign(point.x - ix), 0];
    const dy = trans.y2 - trans.y1, dx = trans.x2 - trans.x1;
    const sign = Math.sign(point.y - horizY) === Math.sign(dy) ? 1 : -1;
    const cross = [sign * dx, sign * dy];
    const dot = along[0] * cross[0] + along[1] * cross[1];
    const mag = Math.hypot(...along) * Math.hypot(...cross);
    return Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180 / Math.PI;
  };
  for (const q of rows) {
    const svg = decodeURIComponent(String(q.questionImage).replace(/^data:[^,]+,/, ""));
    const lines = [...svg.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/g)]
      .map(m => ({ x1: +m[1], y1: +m[2], x2: +m[3], y2: +m[4] }));
    const labels = [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"[^>]*>([^<]*)<\/text>/g)]
      .map(m => ({ x: +m[1], y: +m[2], text: m[3] }));
    const horizontals = lines.filter(l => l.y1 === l.y2);
    const transversal = lines.find(l => l.y1 !== l.y2);
    const given = labels.find(l => /°$/.test(l.text));
    const asked = labels.find(l => l.text === "x");
    if (horizontals.length !== 2 || !transversal || !given || !asked) {
      return "the figure does not hold two parallel lines, a crossing line and both labels";
    }
    const nearestLine = point => horizontals
      .reduce((best, l) => (Math.abs(l.y1 - point.y) < Math.abs(best.y1 - point.y) ? l : best)).y1;
    const a = regionAngle(nearestLine(given), transversal, given);
    const b = regionAngle(nearestLine(asked), transversal, asked);
    const value = Number(given.text.replace("°", ""));
    /* The drawing is schematic, so the measured angles are not the printed
       ones. What must hold is whether the two regions are equal or add to 180. */
    const equal = Math.abs(a - b) < 1;
    const supplementary = Math.abs(a + b - 180) < 1;
    if (!equal && !supplementary) return `regions measure ${a.toFixed(1)} and ${b.toFixed(1)}`;
    const want = equal ? value : 180 - value;
    if (num(q.options[q.answer]) !== want) {
      return `given ${value}°, the drawing makes them ${equal ? "equal" : "supplementary"}, so x is ${want}° not ${q.options[q.answer]}`;
    }
  }
  return true;
});

/* ── scatter graphs, against Pearson's r ── */
report.check("statScatterCorrelation: agrees with Pearson's r on the plotted points", () => {
  const rows = byTemplate(app.maths, "statScatterCorrelation");
  if (!rows.length) return "the template generates nothing";
  for (const q of rows) {
    const points = [...String(q.questionImageAlt).matchAll(/\((\d+), (\d+)\)/g)]
      .map(m => [Number(m[1]), Number(m[2])]);
    if (points.length < 5) return "cannot read the points from the alt text";
    const n = points.length;
    const mx = points.reduce((s, p) => s + p[0], 0) / n;
    const my = points.reduce((s, p) => s + p[1], 0) / n;
    let sxy = 0, sxx = 0, syy = 0;
    for (const [x, y] of points) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; }
    const r = sxy / Math.sqrt(sxx * syy);
    const marked = String(q.options[q.answer]);
    if (/Positive correlation/.test(marked) && !(r > 0.7)) return `marked positive but r = ${r.toFixed(2)}`;
    if (/Negative correlation/.test(marked) && !(r < -0.7)) return `marked negative but r = ${r.toFixed(2)}`;
    if (/No correlation/.test(marked) && Math.abs(r) > 0.5) return `marked none but r = ${r.toFixed(2)}`;
  }
  return true;
});

/* ── algebra, checked by evaluating the identity ── */
report.check("algExpandBrackets: the identity holds at several values of x", () => {
  const rows = byTemplate(app.maths, "algExpandBrackets");
  if (!rows.length) return "the template generates nothing";
  const toFn = src => new Function("x", "return " + String(src)
    .replace(/−/g, "-").replace(/×/g, "*")
    .replace(/(\d)\s*\(/g, "$1*(")
    .replace(/(\d)x/g, "$1*x")
    .replace(/(^|[^\d*])x/g, "$11*x") + ";");
  for (const q of rows) {
    const m = /Expand and simplify: (.+)$/.exec(q.question);
    if (!m) return "cannot read the expression";
    let left, right;
    try { left = toFn(m[1]); right = toFn(q.options[q.answer]); }
    catch (e) { return `cannot evaluate ${m[1]} / ${q.options[q.answer]}`; }
    for (const x of [0, 1, 2, 5, -3, 7.5]) {
      if (Math.abs(left(x) - right(x)) > 1e-9) {
        return `${m[1]} is not ${q.options[q.answer]} at x = ${x}`;
      }
    }
    /* and no distractor may also be equivalent, or there are two right answers */
    for (let k = 0; k < q.options.length; k++) {
      if (k === q.answer) continue;
      let other;
      try { other = toFn(q.options[k]); } catch (e) { continue; }
      if ([0, 1, 2, 5, -3].every(x => Math.abs(left(x) - other(x)) < 1e-9)) {
        return `distractor ${q.options[k]} is also equal to ${m[1]}`;
      }
    }
  }
  return true;
});

report.check("algFactoriseSimple: multiplies back, and is fully factorised", () => {
  const rows = byTemplate(app.maths, "algFactoriseSimple");
  if (!rows.length) return "the template generates nothing";
  for (const q of rows) {
    const m = /Factorise fully: (\d+)x \+ (\d+)/.exec(q.question);
    const f = /^(\d+)\((\d+)x \+ (\d+)\)$/.exec(q.options[q.answer]);
    if (!m) return "cannot read the expression";
    if (!f) return "the answer is not of the form n(ax + b): " + q.options[q.answer];
    const [A, B] = [Number(m[1]), Number(m[2])];
    const [k, p, r] = [Number(f[1]), Number(f[2]), Number(f[3])];
    if (k * p !== A || k * r !== B) return `${q.options[q.answer]} does not multiply back to ${A}x + ${B}`;
    if (gcd(p, r) !== 1) return `${q.options[q.answer]} is not fully factorised`;
    if (k !== gcd(A, B)) return `took out ${k}, but the HCF of ${A} and ${B} is ${gcd(A, B)}`;
  }
  return true;
});

/* ── relationships, found by search rather than by formula ── */
verify("algAgeProblem", question => {
  const m = /is (\d+) years older than (?:his|her) \w+\. In (\d+) years' time/.exec(question);
  if (!m) return null;
  const gap = Number(m[1]), years = Number(m[2]);
  for (let now = 1; now <= 120; now++) if (now + years === 2 * (now - gap)) return now;
  return null;
});

verify("algTwoItemElimination", question => {
  const m = new RegExp(`(\\d+) pencils and (\\d+) pens cost £${DEC}\\. (\\d+) pencils and (\\d+) pens cost £${DEC}`).exec(question);
  if (!m) return null;
  const [a1, b1, a2, b2] = [Number(m[1]), Number(m[2]), Number(m[4]), Number(m[5])];
  const c1 = Math.round(Number(m[3]) * 100), c2 = Math.round(Number(m[6]) * 100);
  for (let pencil = 1; pencil <= 300; pencil++) {
    for (let pen = 1; pen <= 300; pen++) {
      if (a1 * pencil + b1 * pen === c1 && a2 * pencil + b2 * pen === c2) return pencil;
    }
  }
  return null;
}, v => `${v}p`);

verify("algBalanceWeights", question => {
  const m = /(\d+) identical cubes weigh exactly the same as (\d+) identical spheres.*?weigh (\d+) g/.exec(question);
  if (!m) return null;
  const [p, r, total] = m.slice(1).map(Number);
  for (let cube = 1; cube < total; cube++) if (p * cube === r * (total - cube)) return cube;
  return null;
}, v => `${v} g`);

verify("bidMissingNumberInChain", question => {
  const m = /^(\d+) × \(□ \+ (\d+)\) − (\d+) = (\d+)\./.exec(question);
  if (!m) return null;
  const [a, b, c, result] = m.slice(1).map(Number);
  for (let x = 0; x <= 1000; x++) if (a * (x + b) - c === result) return x;
  return null;
});

verify("bidPowersRootsChain", question => {
  const m = /What is √(\d+) \+ (\d+)² × (\d+) ÷ (\d+)\?/.exec(question);
  if (!m) return null;
  const [root, base, inner, div] = m.slice(1).map(Number);
  return Math.sqrt(root) + base * base * inner / div;   // JS already applies BIDMAS
});

/* ── circles: the formulas written out again ── */
const PI = 3.14;
verify("geoCircleArea", question => {
  const m = /(radius|diameter) of (\d+) cm/.exec(question);
  if (!m) return null;
  const r = m[1] === "diameter" ? Number(m[2]) / 2 : Number(m[2]);
  return PI * r * r;
}, v => `${Number(v.toFixed(3))} cm²`);

verify("geoCircleCircumference", question => {
  const m = /(radius|diameter) of (\d+) cm/.exec(question);
  if (!m) return null;
  const r = m[1] === "diameter" ? Number(m[2]) / 2 : Number(m[2]);
  return 2 * PI * r;
}, v => `${Number(v.toFixed(3))} cm`);

verify("geoCircleInSquare", question => {
  const byRadius = /circle has a radius of (\d+) cm/.exec(question);
  const bySide = /square has a side of (\d+) cm/.exec(question);
  if (!byRadius && !bySide) return null;
  const r = byRadius ? Number(byRadius[1]) : Number(bySide[1]) / 2;
  return (2 * r) * (2 * r) - PI * r * r;
}, v => `${Number(v.toFixed(3))} cm²`);

/* ── sequences ── */
verify("seqWhichTermEquals", question => {
  const m = /nth term of a sequence is (\d*)n² \+ (\d*)n?(?: \+ (\d+))?\. Which term of the sequence is equal to ([\d,]+)\?/.exec(question);
  if (!m) return null;
  const a = m[1] === "" ? 1 : Number(m[1]);
  const b = m[2] === "" ? 1 : Number(m[2]);
  const c = m[3] ? Number(m[3]) : 0;
  const value = Number(m[4].replace(/,/g, ""));
  for (let n = 1; n <= 200; n++) if (a * n * n + b * n + c === value) return n;
  return null;
}, n => `the ${n}th term`);

verify("seqGeometricExceeds", question => {
  const m = /A sequence starts ([\d,]+), ([\d,]+), ([\d,]+), ([\d,]+) and.*?first term greater than ([\d,]+)\?/.exec(question);
  if (!m) return null;
  const terms = m.slice(1, 5).map(x => Number(x.replace(/,/g, "")));
  const bound = Number(m[5].replace(/,/g, ""));
  const ratio = terms[1] / terms[0];
  let value = terms[0], n = 1;
  while (value <= bound && n < 60) { value *= ratio; n += 1; }
  return n;
}, n => `the ${n}th term`);

verify("seqTwoSequencesMeet", question => {
  const m = /Sequence A starts ([\d, ]+) and carries.*?Sequence B starts ([\d, ]+) and carries/.exec(question);
  if (!m) return null;
  const A = m[1].split(",").map(Number), B = m[2].split(",").map(Number);
  const da = A[1] - A[0], db = B[1] - B[0];
  for (let n = 1; n <= 500; n++) if (A[0] + (n - 1) * da > B[0] + (n - 1) * db) return n;
  return null;
});

/* ── counting, by a different traversal from the generator's ── */
verify("countTwoRestrictions", question => {
  const m = /Using the digits ([\d, ]+), how many three-digit numbers greater than ([\d,]+) can be made that are even/.exec(question);
  if (!m) return null;
  const pool = new Set(m[1].split(",").map(x => Number(x.trim())));
  const bound = Number(m[2].replace(/,/g, ""));
  let count = 0;
  /* Walk every three-digit number rather than the digit pool three deep. */
  for (let v = 100; v <= 999; v++) {
    if (v <= bound || v % 2 !== 0) continue;
    const digits = String(v).split("").map(Number);
    if (new Set(digits).size !== 3) continue;
    if (!digits.every(d => pool.has(d))) continue;
    count += 1;
  }
  return count;
});

/* ── probability, recomputed from counts rather than from decimals ── */
report.check("probAtLeastOneOfColour: counted over the unordered pairs", () => {
  const rows = byTemplate(app.maths, "probAtLeastOneOfColour");
  if (!rows.length) return "the template generates nothing";
  for (const q of rows) {
    const m = /holds (\d+) red counters and (\d+) blue counters/.exec(q.question);
    if (!m) return "cannot read the bag";
    const red = Number(m[1]), blue = Number(m[2]), n = red + blue;
    const pairs = n * (n - 1) / 2, blueOnly = blue * (blue - 1) / 2;
    const g = gcd(pairs - blueOnly, pairs);
    const want = `${(pairs - blueOnly) / g}/${pairs / g}`;
    if (q.options[q.answer] !== want) {
      return `${red} red, ${blue} blue: marked ${q.options[q.answer]}, expected ${want}`;
    }
  }
  return true;
});

verify("probThreeIndependent", question => {
  const m = new RegExp(`on any given day is ${DEC}`).exec(question);
  if (!m) return null;
  const p = Number(m[1]);
  const days = /\btwo\b/.test(question) ? 2 : 3;
  const none = Math.pow(1 - p, days);
  return /at least one/.test(question) ? 1 - none : none;
}, v => `${Number(v.toFixed(6))}`);

verify("probExpectedReverse", question => {
  const m = /(\d+) equal sections, (\d+) of which are red.*?expect ([\d,]+) reds/.exec(question);
  if (!m) return null;
  const sections = Number(m[1]), red = Number(m[2]);
  return Number(m[3].replace(/,/g, "")) * sections / red;
}, v => v.toLocaleString("en-GB"));

/* ── fractions, in exact integer rationals ── */
const ratio = (n, d) => { const g = gcd(n, d) || 1; return [n / g, d / g]; };
const parseMixed = text => {
  const m = /^(?:(\d+)\s+)?(\d+)\/(\d+)$/.exec(String(text).trim());
  if (m) return ratio(Number(m[1] || 0) * Number(m[3]) + Number(m[2]), Number(m[3]));
  const whole = /^(\d+)$/.exec(String(text).trim());
  return whole ? [Number(whole[1]), 1] : null;
};
const showMixed = ([n, d]) => {
  if (d === 1) return `${n}`;
  const w = Math.floor(n / d), rest = n - w * d;
  if (rest === 0) return `${w}`;
  const [rn, rd] = ratio(rest, d);
  return w ? `${w} ${rn}/${rd}` : `${rn}/${rd}`;
};

verify("fracThreeMixedChain", question => {
  const m = /What is (.+?) \+ (.+?) − (.+?)\?$/.exec(question);
  if (!m) return null;
  const parts = m.slice(1).map(parseMixed);
  if (parts.some(p => !p)) return null;
  const [[a, b], [c, d], [e, f]] = parts;
  return ratio(a * d * f + c * b * f - e * b * d, b * d * f);
}, showMixed);

verify("fracRecipeScale", question => {
  const m = /recipe for (\d+) pancakes uses (\d+)\/(\d+) of a cup.*?make (\d+) pancakes/.exec(question);
  if (!m) return null;
  const [serves, n, d, wanted] = m.slice(1).map(Number);
  return ratio(n * wanted, d * serves);
}, r => `${showMixed(r)} cups`);

/* ── money and measures ── */
verify("decMultiStepBill", question => {
  const m = new RegExp(`potatoes at £${DEC} and side salads at £${DEC}\\. Nadia buys (\\d+) jacket potatoes and (\\d+) side salads.*?voucher for (\\d+)% off.*?a £(\\d+) note`).exec(question);
  if (!m) return null;
  const pence = v => Math.round(Number(v) * 100);
  const gross = pence(m[1]) * Number(m[3]) + pence(m[2]) * Number(m[4]);
  const net = gross - gross * Number(m[5]) / 100;
  return Number(m[6]) * 100 - net;
}, p => `£${(p / 100).toFixed(2)}`);

verify("pctSuccessiveReverse", question => {
  const m = new RegExp(`reduced by (\\d+)% in a sale.*?further (\\d+)%.*?now costs £${DEC}`).exec(question);
  if (!m) return null;
  const a = Number(m[1]), b = Number(m[2]);
  return Math.round(Math.round(Number(m[3]) * 100) / ((100 - b) / 100) / ((100 - a) / 100));
}, p => `£${(p / 100).toFixed(2)}`);

verify("meaTrapeziumArea", question => {
  const m = /parallel sides of (\d+) cm and (\d+) cm, and a perpendicular height of (\d+) cm/.exec(question);
  if (!m) return null;
  const [a, b, h] = m.slice(1).map(Number);
  return (a + b) / 2 * h;
}, v => `${v.toLocaleString("en-GB")} cm²`);

verify("meaAreaFindMissingSide", question => {
  const m = /area of ([\d,]+) cm² and a base of (\d+) cm/.exec(question);
  if (!m) return null;
  const area = Number(m[1].replace(/,/g, "")), base = Number(m[2]);
  if (/\btriangle\b/.test(question)) return 2 * area / base;
  if (/\bparallelogram\b/.test(question)) return area / base;
  return null;
}, v => `${Number(v.toFixed(3))} cm`);

/* ── rounding and estimating ── */
verify("numRoundSigFigs", question => {
  const m = /What is ([\d,]+) rounded to (\d) significant figure/.exec(question);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, "")), sf = Number(m[2]);
  const place = Math.pow(10, String(n).length - sf);
  return Math.round(n / place) * place;
}, v => v.toLocaleString("en-GB"));

verify("numEstimateOneSigFig", question => {
  const m = /Estimate ([\d,]+) × (\d+) by rounding/.exec(question);
  if (!m) return null;
  const one = x => { const p = Math.pow(10, String(x).length - 1); return Math.round(x / p) * p; };
  return one(Number(m[1].replace(/,/g, ""))) * one(Number(m[2]));
}, v => v.toLocaleString("en-GB"));

verify("numLCMShare", question => {
  const m = /between (\d+) children, or (\d+) children, or (\d+) children/.exec(question);
  if (!m) return null;
  const l = (a, b) => a * b / gcd(a, b);
  const [a, b, c] = m.slice(1).map(Number);
  return l(l(a, b), c);
}, v => v.toLocaleString("en-GB"));

verify("numFractionToPercent", question => {
  const m = /What is (\d+)\/(\d+) as a percentage/.exec(question);
  if (!m) return null;
  return Number(m[1]) / Number(m[2]) * 100;
}, v => `${Number(v.toFixed(3))}%`);

/* Factor questions, recomputed by trial division rather than from the primes. */
verify("numFactorCount", question => {
  const m = /How many factors does (\d+) have\?/.exec(question);
  if (!m) return null;
  const n = Number(m[1]);
  let count = 0;
  for (let k = 1; k <= n; k++) if (n % k === 0) count += 1;
  return count;
});

verify("numOddFactorCount", question => {
  const m = /How many factors of (\d+) are odd\?/.exec(question);
  if (!m) return null;
  const n = Number(m[1]);
  let count = 0;
  for (let k = 1; k <= n; k += 2) if (n % k === 0) count += 1;
  return count;
});

verify("numHCFofFour", question => {
  const m = /HCF\) of (\d+), (\d+), (\d+) and (\d+)\?/.exec(question);
  if (!m) return null;
  const values = m.slice(1).map(Number);
  let best = 1;
  for (let k = 1; k <= Math.min(...values); k++) if (values.every(v => v % k === 0)) best = k;
  return best;
});

/* ── "what must be true" questions, where the danger is a SECOND true option ── */
report.check("numParityResult: the answer always holds and every distractor breaks", () => {
  /* The paper this came from asked what must be true of four different odd
     numbers added together and offered "it has at least two digits" as a
     distractor. The smallest such sum is 1 + 3 + 5 + 7 = 16, so that is always
     true as well and the question has two right answers. Each option is
     therefore tested against real instances here. */
  const rows = byTemplate(app.maths, "numParityResult");
  if (!rows.length) return "the template generates nothing";
  const PREDICATES = [
    [/^It is an odd number$/, v => v % 2 === 1],
    [/^It is an even number$/, v => v % 2 === 0],
    [/^It is greater than (\d+)$/, (v, m) => v > Number(m[1])],
    [/^It has at least two digits$/, v => v >= 10],
    [/^It is divisible by (\d+)$/, (v, m) => v % Number(m[1]) === 0],
    [/^It is a multiple of (\d+)$/, (v, m) => v % Number(m[1]) === 0]
  ];
  const predicateFor = text => {
    for (const [pattern, fn] of PREDICATES) {
      const m = pattern.exec(text);
      if (m) return v => fn(v, m);
    }
    return null;
  };
  for (const q of rows) {
    const m = /(adds together|multiplies together) (\w+) different (odd|even) numbers/.exec(q.question);
    if (!m) return "cannot read: " + q.question;
    const count = ["two", "three", "four", "five", "six"].indexOf(m[2]) + 2;
    const wantOdd = m[3] === "odd";
    const pool = [];
    for (let n = 1; n <= 21; n += 1) if ((n % 2 === 1) === wantOdd) pool.push(n);
    const results = [];
    const walk = (start, picked) => {
      if (picked.length === count) {
        results.push(m[1] === "adds together"
          ? picked.reduce((a, b) => a + b, 0)
          : picked.reduce((a, b) => a * b, 1));
        return;
      }
      for (let k = start; k < pool.length; k += 1) {
        picked.push(pool[k]); walk(k + 1, picked); picked.pop();
      }
    };
    walk(0, []);
    for (let k = 0; k < q.options.length; k += 1) {
      const holds = predicateFor(String(q.options[k]));
      if (!holds) return `unrecognised option: ${q.options[k]}`;
      const alwaysTrue = results.every(holds);
      if (k === q.answer && !alwaysTrue) {
        return `"${q.options[k]}" is the marked answer but does not always hold`;
      }
      if (k !== q.answer && alwaysTrue) {
        return `"${q.options[k]}" is a distractor but is ALSO always true (${q.question})`;
      }
    }
  }
  return true;
});

/* ── from the August 2026 papers ── */
report.check("numDigitCardsDivisible: brute force over every arrangement", () => {
  /* Sibling of numSmallestEvenFromDigits, which shipped wrong for two years by
     assuming which digit belonged at the end. Nothing is assumed here either. */
  const rows = byTemplate(app.maths, "numDigitCardsDivisible");
  if (!rows.length) return "the template generates nothing";
  for (const q of rows) {
    const m = /number cards: ([\d, ]+)\. Using each card once, what is the (largest|smallest) five-digit number that can be made which is divisible by (\d+)\?/.exec(q.question);
    if (!m) return "cannot read: " + q.question.slice(0, 90);
    const digits = m[1].split(",").map(d => Number(d.trim()));
    const divisor = Number(m[3]);
    const fits = permutations(digits)
      .map(p => Number(p.join("")))
      .filter(v => v % divisor === 0);
    const want = m[2] === "largest" ? Math.max(...fits) : Math.min(...fits);
    const got = num(q.options[q.answer]);
    if (got !== want) return `cards ${m[1]}: marked ${got}, ${m[2]} divisible by ${divisor} is ${want}`;
    for (const option of q.options) {
      if (digitSignature(num(option)) !== digitSignature(digits.join(""))) {
        return `cards ${m[1]}: option ${option} is not an arrangement of them`;
      }
    }
    /* No distractor may also be a better answer than the marked one. */
    for (const option of q.options) {
      const v = num(option);
      if (v === got || v % divisor !== 0) continue;
      if (m[2] === "largest" ? v > got : v < got) {
        return `cards ${m[1]}: option ${option} beats the marked answer`;
      }
    }
  }
  return true;
});

report.check("numEvenFactorCount: factor counts done by trial division", () => {
  const rows = byTemplate(app.maths, "numEvenFactorCount");
  if (!rows.length) return "the template generates nothing";
  const count = n => { let c = 0; for (let k = 1; k <= n; k += 1) if (n % k === 0) c += 1; return c; };
  for (const q of rows) {
    const wantEven = /an even number of factors/.test(q.question);
    for (let k = 0; k < q.options.length; k += 1) {
      const isEven = count(num(q.options[k])) % 2 === 0;
      if (k === q.answer && isEven !== wantEven) {
        return `${q.options[k]} is marked but has an ${isEven ? "even" : "odd"} count`;
      }
      if (k !== q.answer && isEven === wantEven) {
        return `${q.options[k]} is a distractor but ALSO has an ${isEven ? "even" : "odd"} count`;
      }
    }
  }
  return true;
});

verify("decToImproperFraction", question => {
  const m = /What is (\d+(?:\.\d+)?) as an improper fraction\?/.exec(question);
  if (!m) return null;
  /* Build the fraction from the digits of the decimal, not by dividing. */
  const [whole, frac = ""] = m[1].split(".");
  const den = Math.pow(10, frac.length);
  return ratio(Number(whole) * den + Number(frac || 0), den);
}, ([n, d]) => `${n}/${d}`);

verify("pctToFraction", question => {
  const m = /What is (\d+(?:\.\d+)?)% as a fraction in its simplest form\?/.exec(question);
  if (!m) return null;
  const [whole, frac = ""] = m[1].split(".");
  const scale = Math.pow(10, frac.length);
  return ratio(Number(whole) * scale + Number(frac || 0), 100 * scale);
}, ([n, d]) => `${n}/${d}`);

verify("pctCompoundGrowth", question => {
  const m = /worth £([\d,]+) in (\d{4})\. Its value increased by (\d+)% every year.*?worth in (\d{4})\?/.exec(question);
  if (!m) return null;
  const start = Number(m[1].replace(/,/g, ""));
  const years = Number(m[4]) - Number(m[2]);
  let value = start;
  for (let y = 0; y < years; y += 1) value = value * (100 + Number(m[3])) / 100;
  return Math.round(value);
}, v => `£${v.toLocaleString("en-GB")}`);

report.check("statSetFromSummary: exactly one set has both the mean and the range", () => {
  const rows = byTemplate(app.maths, "statSetFromSummary");
  if (!rows.length) return "the template generates nothing";
  for (const q of rows) {
    const m = /mean of (\d+) and a range of (\d+)\?/.exec(q.question);
    if (!m) return "cannot read the summary";
    const mean = Number(m[1]), spread = Number(m[2]);
    const fits = q.options.filter(option => {
      const xs = String(option).split(",").map(x => Number(x.trim()));
      if (xs.some(Number.isNaN)) return false;
      const avg = xs.reduce((s, x) => s + x, 0) / xs.length;
      return avg === mean && Math.max(...xs) - Math.min(...xs) === spread;
    });
    if (fits.length !== 1) return `${fits.length} sets fit mean ${mean} and range ${spread}`;
    if (String(q.options[q.answer]) !== String(fits[0])) {
      return `marked "${q.options[q.answer]}" but "${fits[0]}" is the one that fits`;
    }
  }
  return true;
});

report.check("spdDurationRounded: the duration and its rounding both check out", () => {
  const rows = byTemplate(app.maths, "spdDurationRounded");
  if (!rows.length) return "the template generates nothing";
  for (const q of rows) {
    const m = /There are ([\d,]+) pages.*?about (\d+) minutes?(?: and (\d+) seconds)? to read each page/.exec(q.question);
    if (!m) return "cannot read: " + q.question.slice(0, 90);
    const pages = Number(m[1].replace(/,/g, ""));
    const each = Number(m[2]) * 60 + (m[3] ? Number(m[3]) : 0);
    const minutes = pages * each / 60;
    const want = Math.round(minutes / 30) * 30;
    const got = String(q.options[q.answer]);
    const hm = /^(?:(\d+) hours?)?\s*(?:(\d+) minutes)?$/.exec(got.trim());
    if (!hm) return `cannot read the marked answer "${got}"`;
    const gotMinutes = (Number(hm[1] || 0)) * 60 + Number(hm[2] || 0);
    if (gotMinutes !== want) {
      return `${pages} pages at ${each}s: marked ${got} (${gotMinutes} min), expected ${want} min`;
    }
  }
  return true;
});

report.check("geoBackElevation: the marked shape is the front mirrored, and only it", () => {
  /* Rebuilt from the alt text, which gives every corner. A back elevation is
     the front flipped left to right, so mirroring the front and looking for the
     candidate that matches is an independent route to the answer - and the
     check also insists exactly ONE candidate matches, because two would make
     the question unanswerable. */
  const rows = byTemplate(app.maths, "geoBackElevation");
  if (!rows.length) return "the template generates nothing";
  const corners = text => [...text.matchAll(/\(([-\d.]+), ([-\d.]+)\)/g)]
    .map(m => [Number(m[1]), Number(m[2])]);
  const same = (a, b) => {
    if (a.length !== b.length) return false;
    for (let shift = 0; shift < a.length; shift += 1) {
      const rotated = a.map((unused, k) => a[(k + shift) % a.length]);
      if (rotated.every(([x, y], k) => Math.abs(x - b[k][0]) < 1e-6 && Math.abs(y - b[k][1]) < 1e-6)) {
        return true;
      }
    }
    return false;
  };
  for (const q of rows) {
    const alt = String(q.questionImageAlt);
    const frontPart = /front elevation drawn as a shape with corners at (.+?), measured from/.exec(alt);
    if (!frontPart) return "cannot read the front elevation";
    const front = corners(frontPart[1]);
    const mirrored = front.map(([x, y]) => [1 - x, y]);
    const letters = ["A", "B", "C", "D"];
    const matching = letters.filter(letter => {
      /* Stop at the next semicolon or at the closing sentence - NOT at the next
         full stop, which sits inside every decimal: "[^;.]+" truncates
         "(0, 1), (0, 0.3), ..." to "(0, 1), (0, 0". */
      const part = new RegExp(`${letter} has corners at (.+?)(?=;|\\. Lines drawn)`).exec(alt);
      return part && same(corners(part[1]), mirrored);
    });
    if (matching.length !== 1) {
      return `${matching.length} candidates carry the mirrored outline (expected exactly 1)`;
    }
    if (q.options[q.answer] !== `Shape ${matching[0]}`) {
      return `marked ${q.options[q.answer]}, but the mirrored outline is Shape ${matching[0]}`;
    }
  }
  return true;
});

verify("geoIsoscelesAngleType", question => {
  const fromBase = /base angle of (\d+)°/.exec(question);
  const fromVertex = /vertex angle of (\d+)°/.exec(question);
  if (fromBase) {
    const vertex = 180 - 2 * Number(fromBase[1]);
    return vertex < 90 ? "acute" : vertex === 90 ? "right-angled" : "obtuse";
  }
  if (fromVertex) {
    const base = (180 - Number(fromVertex[1])) / 2;
    return base < 90 ? "acute" : base === 90 ? "right-angled" : "obtuse";
  }
  return null;
});

verify("ratCoinValueSplit", question => {
  const m = /has (\S+) coins and (\S+) coins in the ratio (\d+):(\d+)\. He has £([\d.]+) in total/.exec(question);
  if (!m) return null;
  const pence = name => (name.startsWith("£") ? Number(name.slice(1)) * 100 : Number(name.replace("p", "")));
  const low = pence(m[1]), high = pence(m[2]);
  const a = Number(m[3]), b = Number(m[4]);
  const total = Math.round(Number(m[5]) * 100);
  /* Search the number of lots rather than dividing, so the check does not
     repeat the generator's own arithmetic. */
  for (let lots = 1; lots <= 2000; lots += 1) {
    if (lots * (a * low + b * high) === total) return lots * b;
  }
  return null;
}, v => v.toLocaleString("en-GB"));

/* ── from the September 2026 papers ── */
verify("geoRotatePolygon", question => {
  const m = /divided into (\d+) equal segments.*?through (\d+)(½)? of those segments/.exec(question);
  if (!m) return null;
  const turns = Number(m[2]) + (m[3] ? 0.5 : 0);
  return 360 / Number(m[1]) * turns;
}, v => `${Number(v.toFixed(2))}°`);

report.check("statModeFromTable: the mode is recounted from the table", () => {
  const rows = byTemplate(app.maths, "statModeFromTable");
  if (!rows.length) return "the template generates nothing";
  for (const q of rows) {
    const pairs = [...q.question.matchAll(/(\d+) boxes hold (\d+) books each/g)]
      .map(m => ({ boxes: Number(m[1]), books: Number(m[2]) }));
    if (pairs.length < 3) return "cannot read the table";
    /* Build the whole list of boxes and take the commonest value, rather than
       looking for the biggest count - a different route to the same place. */
    const every = [];
    pairs.forEach(p => { for (let k = 0; k < p.boxes; k += 1) every.push(p.books); });
    const tally = {};
    every.forEach(v => { tally[v] = (tally[v] || 0) + 1; });
    const best = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    if (best.length > 1 && best[0][1] === best[1][1]) return "the table has no single mode";
    if (num(q.options[q.answer]) !== Number(best[0][0])) {
      return `marked ${q.options[q.answer]}, the commonest value is ${best[0][0]}`;
    }
  }
  return true;
});

verify("meaSquareAreaToPerimeter", question => {
  const m = /area of a square field is ([\d.]+) (km²|m²|cm²)\. What is its perimeter\?/.exec(question);
  if (!m) return null;
  const side = Math.sqrt(Number(m[1]));
  return { value: Number((side * 4).toFixed(4)), unit: m[2].replace("²", "") };
}, r => `${r.value} ${r.unit}`);

report.check("geoDecisionTreeQuestion: exactly one option separates the two shapes", () => {
  /* The properties are looked up from a table written here, independently of
     the one in the generator - so a wrong entry there would show up. */
  const P = {
    "parallelogram":        { regular: 0, rotational: 1, reflective: 0, equalSides: 0, rightAngle: 0, parallelPair: 1 },
    "isosceles trapezium":  { regular: 0, rotational: 0, reflective: 1, equalSides: 0, rightAngle: 0, parallelPair: 1 },
    "rectangle":            { regular: 0, rotational: 1, reflective: 1, equalSides: 0, rightAngle: 1, parallelPair: 1 },
    "rhombus":              { regular: 0, rotational: 1, reflective: 1, equalSides: 1, rightAngle: 0, parallelPair: 1 },
    "square":               { regular: 1, rotational: 1, reflective: 1, equalSides: 1, rightAngle: 1, parallelPair: 1 },
    "kite":                 { regular: 0, rotational: 0, reflective: 1, equalSides: 0, rightAngle: 0, parallelPair: 0 },
    "regular pentagon":     { regular: 1, rotational: 1, reflective: 1, equalSides: 1, rightAngle: 0, parallelPair: 0 },
    "regular hexagon":      { regular: 1, rotational: 1, reflective: 1, equalSides: 1, rightAngle: 0, parallelPair: 1 },
    "isosceles triangle":   { regular: 0, rotational: 0, reflective: 1, equalSides: 0, rightAngle: 0, parallelPair: 0 },
    "equilateral triangle": { regular: 1, rotational: 1, reflective: 1, equalSides: 1, rightAngle: 0, parallelPair: 0 },
    "scalene triangle":     { regular: 0, rotational: 0, reflective: 0, equalSides: 0, rightAngle: 0, parallelPair: 0 }
  };
  const KEY = {
    "Does the shape have rotational symmetry?": "rotational",
    "Does the shape have a line of symmetry?": "reflective",
    "Is the shape regular?": "regular",
    "Are all of the shape's sides the same length?": "equalSides",
    "Does the shape have a right angle?": "rightAngle",
    "Does the shape have a pair of parallel sides?": "parallelPair"
  };
  const rows = byTemplate(app.maths, "geoDecisionTreeQuestion");
  if (!rows.length) return "the template generates nothing";
  for (const q of rows) {
    const m = /answering YES to the missing question are an? ([a-z ]+?), and shapes answering NO are an? ([a-z ]+?)\. Which/.exec(q.question);
    if (!m) return "cannot read the two shapes from: " + q.question.slice(0, 110);
    const yes = P[m[1]], no = P[m[2]];
    if (!yes || !no) return `unknown shape: ${m[1]} / ${m[2]}`;
    const splits = q.options.filter(option => {
      const key = KEY[String(option)];
      if (!key) return false;
      return yes[key] === 1 && no[key] === 0;
    });
    if (q.options.some(o => !KEY[String(o)])) return `unknown question offered: ${q.options.find(o => !KEY[String(o)])}`;
    if (splits.length !== 1) return `${splits.length} of the options separate ${m[1]} from ${m[2]}`;
    if (String(q.options[q.answer]) !== String(splits[0])) {
      return `marked "${q.options[q.answer]}" but "${splits[0]}" is the separating question`;
    }
  }
  return true;
});

report.check("numFactorsFromList: the count and the listed factors both check out", () => {
  const rows = byTemplate(app.maths, "numFactorsFromList");
  if (!rows.length) return "the template generates nothing";
  const factorsOf = n => { const out = []; for (let k = 1; k <= n; k += 1) if (n % k === 0) out.push(k); return out; };
  for (const q of rows) {
    const m = /has exactly (\d+) factors\. \d+ of them are shown here: ([\d, ]+)\. What is N\?/.exec(q.question);
    if (!m) return "cannot read: " + q.question.slice(0, 100);
    const count = Number(m[1]);
    const shown = m[2].split(",").map(x => Number(x.trim()));
    const answer = num(q.options[q.answer]);
    const fs = factorsOf(answer);
    if (fs.length !== count) return `${answer} has ${fs.length} factors, not ${count}`;
    if (!shown.every(f => answer % f === 0)) return `${answer} is not divisible by all of ${m[2]}`;
    /* No distractor may satisfy both conditions, or there are two answers. */
    for (const option of q.options) {
      const v = num(option);
      if (v === answer) continue;
      if (factorsOf(v).length === count && shown.every(f => v % f === 0)) {
        return `${v} also has ${count} factors and all of ${m[2]}`;
      }
    }
  }
  return true;
});

report.check("meaMinimumBlocks: found by searching every small cuboid", () => {
  const rows = byTemplate(app.maths, "meaMinimumBlocks");
  if (!rows.length) return "the template generates nothing";
  for (const q of rows) {
    const m = /length to be (\d+) times the width, and the width to be (\d+) cm longer than the height/.exec(q.question);
    if (!m) return "cannot read the conditions";
    const multiple = Number(m[1]), gap = Number(m[2]);
    let best = Infinity;
    for (let h = 1; h <= 40; h += 1) {
      const w = h + gap;
      const l = multiple * w;
      best = Math.min(best, h * w * l);
    }
    if (num(q.options[q.answer]) !== best) {
      return `marked ${q.options[q.answer]}, the smallest cuboid is ${best} blocks`;
    }
  }
  return true;
});

verify("numCoinExchange", question => {
  const m = /has £(\d+) in (\S+) coins\. He swaps half of his coins for (\S+) coins and the other half for (\S+) coins/.exec(question);
  if (!m) return null;
  const pence = name => (name.startsWith("£") ? Number(name.slice(1)) * 100 : Number(name.replace("p", "")));
  const total = Number(m[1]) * 100;
  const start = total / pence(m[2]);
  const half = total / 2;
  return start - (half / pence(m[3]) + half / pence(m[4]));
}, v => v.toLocaleString("en-GB"));

/* ── the four September questions that lean on a figure ── */
report.check("meaReadScale: the reading is rebuilt from the alt text", () => {
  const rows = byTemplate(app.maths, "meaReadScale");
  if (!rows.length) return "the template generates nothing";
  for (const q of rows) {
    const alt = /marked (\d+) at the left and (\d+) at the right, in (\w+), with (\d+) equal divisions.*?stands (\d+) divisions? to the right/.exec(q.questionImageAlt || "");
    const many = /How many grams would (\d+) such watermelons weigh/.exec(q.question);
    if (!alt || !many) return "cannot read the scale or the count";
    const from = Number(alt[1]), to = Number(alt[2]);
    const divisions = Number(alt[4]), at = Number(alt[5]);
    const value = from + (to - from) * at / divisions;
    const want = value * Number(many[1]) * 1000;
    if (num(q.options[q.answer]) !== want) {
      return `scale ${from}-${to} with ${divisions} divisions at ${at}: marked ${q.options[q.answer]}, expected ${want} g`;
    }
    if (at === 0 || at === divisions) return "the pointer sits on a labelled mark, which gives the reading away";
  }
  return true;
});

report.check("statTwoSeriesGap: exactly one week shows the stated gap", () => {
  const rows = byTemplate(app.maths, "statTwoSeriesGap");
  if (!rows.length) return "the template generates nothing";
  for (const q of rows) {
    const m = /marked out of (\d+)\..*?score (\d+) more marks in English than in maths/.exec(q.question);
    if (!m) return "cannot read the question";
    const perMark = 100 / Number(m[1]);
    const gap = Number(m[2]) * perMark;
    const alt = String(q.questionImageAlt);
    const series = name => {
      const part = new RegExp(`${name} passes through ([^.]+)`).exec(alt);
      if (!part) return null;
      return [...part[1].matchAll(/\((\d+), (\d+)\)/g)]
        .map(p => [Number(p[1]), Number(p[2])]);
    };
    const maths = series("Maths"), english = series("English");
    if (!maths || !english) return "cannot read the two lines from the alt text";
    const weeks = maths.filter((p, k) => english[k][1] - p[1] === gap).map(p => p[0]);
    if (weeks.length !== 1) return `${weeks.length} weeks show a gap of ${gap}%`;
    if (String(q.options[q.answer]) !== `Week ${weeks[0]}`) {
      return `marked ${q.options[q.answer]}, the gap is in Week ${weeks[0]}`;
    }
  }
  return true;
});

report.check("geoLineAt45: the angle is measured, and only one option is 45°", () => {
  const rows = byTemplate(app.maths, "geoLineAt45");
  if (!rows.length) return "the template generates nothing";
  const angleOf = ([a, b]) => {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    return ((Math.atan2(dy, dx) * 180 / Math.PI) + 180) % 180;
  };
  const between = (p, r) => {
    const d = Math.abs(angleOf(p) - angleOf(r));
    return Math.min(d, 180 - d);
  };
  const pair = text => {
    const pts = [...String(text).matchAll(/\((\d+), (\d+)\)/g)]
      .map(p => [Number(p[1]), Number(p[2])]);
    return pts.length === 2 ? pts : null;
  };
  for (const q of rows) {
    const lm = pair(/joins the points (\(\d+, \d+\) and \(\d+, \d+\))/.exec(q.question)[1]);
    if (!lm) return "cannot read LM";
    const at45 = q.options.filter(o => {
      const p = pair(o);
      return p && Math.abs(between(lm, p) - 45) < 1e-6;
    });
    if (at45.length !== 1) return `${at45.length} options are at 45° to LM`;
    if (String(q.options[q.answer]) !== String(at45[0])) {
      return `marked ${q.options[q.answer]}, but ${at45[0]} is the one at 45°`;
    }
  }
  return true;
});

report.check("meaTriangleSplit: both pieces measured by the shoelace formula", () => {
  /* The generator uses the trapezium and triangle area formulas. This takes the
     corners of each piece and applies the shoelace formula instead, which knows
     nothing about what shape it is being given. */
  const rows = byTemplate(app.maths, "meaTriangleSplit");
  if (!rows.length) return "the template generates nothing";
  const shoelace = pts => {
    let sum = 0;
    for (let k = 0; k < pts.length; k += 1) {
      const [x1, y1] = pts[k], [x2, y2] = pts[(k + 1) % pts.length];
      sum += x1 * y2 - x2 * y1;
    }
    return Math.abs(sum) / 2;
  };
  for (const q of rows) {
    const m = /base of (\d+) cm and a height of (\d+) cm/.exec(q.question);
    if (!m) return "cannot read the triangle";
    const base = Number(m[1]), height = Number(m[2]);
    /* Right angle at the bottom-left: corners (0,0), (base,0), (0,height).
       The cut is vertical at x = base/2, where the sloping side has height
       height/2. */
    const mid = base / 2, midHeight = height / 2;
    const left = shoelace([[0, 0], [mid, 0], [mid, midHeight], [0, height]]);
    const right = shoelace([[mid, 0], [base, 0], [mid, midHeight]]);
    const want = left - right;
    if (num(q.options[q.answer]) !== want) {
      return `base ${base}, height ${height}: marked ${q.options[q.answer]}, shoelace gives ${want}`;
    }
    if (Math.abs(left + right - base * height / 2) > 1e-9) {
      return "the two pieces do not add up to the whole triangle";
    }
  }
  return true;
});

/* ── English ──
   There is no independent way to recompute "which technique is this", the way
   there is for a sum: the answer is a judgment, and a second judgment made here
   would only be my own opinion twice. What CAN be checked is that each question
   is well formed and that the set as a whole is not giveable-away, so that is
   what these do - and they are labelled as such rather than as answer checks. */
report.check("litTensionTechnique: options are real techniques, and no one answer dominates", () => {
  const rows = app.english.filter(q => q.template === "litTensionTechnique");
  if (!rows.length) return "the template generates nothing";
  const KNOWN = new Set([
    "Setting a time limit", "Foreshadowing", "Withholding a key fact",
    "Delaying the reveal", "Escalating in stages", "A false release",
    "Building a dilemma", "Giving the character something to lose"
  ]);
  const answers = {};
  for (const q of rows) {
    for (const option of q.options) {
      if (!KNOWN.has(String(option))) return `unknown technique offered: "${option}"`;
    }
    if (new Set(q.options).size !== q.options.length) return "a question repeats an option";
    answers[q.options[q.answer]] = (answers[q.options[q.answer]] || 0) + 1;
  }
  /* If one technique were the answer most of the time, a child could pick it
     blind and score well without reading anything. */
  const most = Math.max(...Object.values(answers));
  if (most > rows.length / 2) {
    return `one technique is the answer ${most} times out of ${rows.length}`;
  }
  if (Object.keys(answers).length < 4) {
    return `only ${Object.keys(answers).length} different techniques are ever the answer`;
  }
  return true;
});

report.check("litReportingClause: the answer is never also offered as a distractor", () => {
  const rows = app.english.filter(q => q.template === "litReportingClause");
  if (!rows.length) return "the template generates nothing";
  const answers = {};
  for (const q of rows) {
    if (new Set(q.options).size !== q.options.length) return "a question repeats an option";
    if (!/__________/.test(q.question)) return "the gap is missing from the sentence";
    answers[q.options[q.answer]] = (answers[q.options[q.answer]] || 0) + 1;
  }
  const repeated = Object.entries(answers).filter(([, n]) => n > 2);
  return repeated.length === 0 ||
    `${repeated[0][0]} is the answer ${repeated[0][1]} times`;
});

report.note(`${byTemplate(app.maths, "numSmallestEvenFromDigits").length} arrangements brute-forced; ` +
  `${new Set(app.maths.map(q => q.template)).size} templates in the bank`);
process.exit(report.finish() ? 0 : 1);
