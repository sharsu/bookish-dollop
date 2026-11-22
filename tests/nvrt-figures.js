/* The NVRT families in js/questions-nvrt-2.js, re-solved from what each
 * question shows.
 *
 * The older NVRT generators are checked for shape only; their pictures carry
 * no data to answer from. These families keep the model each picture was
 * drawn from (q.figureData), or read it back out of the SVG itself, so the
 * answer can be worked out again here - and by a different route from the
 * generator, which is the rule in tests/README.md:
 *
 *   Rotation          search all eight turns for the option that matches,
 *                     rather than apply the one turn the generator chose
 *   Plan View         project the heights printed in the alt text, and read
 *                     the option grids back out of the drawn SVG
 *   Shape Arithmetic  fit each piece by trying every turn against its
 *                     lettered edge, rather than place it on a known edge
 *   Count the Squares count squares by the lines actually drawn, where the
 *                     generator counted cells
 */
const { loadApp, createReport } = require("./lib/harness");

const app = loadApp();
const report = createReport("NVRT FIGURES");

const decode = uri => decodeURIComponent(String(uri).replace(/^data:image\/svg\+xml;charset=UTF-8,/, ""));
const LETTERS = ["A", "B", "C", "D", "E"];
/* Each family's templates and how many questions it should hold. The three
   Series strips share one count: which kind a seed makes depends on its level. */
const FAMILIES = {
  nvrtRotation: [["nvrtRotation"], 150],
  nvrtPlanView: [["nvrtPlanView"], 120],
  nvrtShapeArithmetic: [["nvrtShapeArithmetic"], 150],
  nvrtCountSquares: [["nvrtCountSquares"], 100],
  nvrtOddOneOutRule: [["nvrtOddOneOutRule"], 150],
  seriesStrips: [["nvrtSeriesCounts", "nvrtSeriesTurns", "nvrtSeriesTriangles"], 150],
  nvrtHolePunchFolds: [["nvrtHolePunchFolds"], 120],
  nvrtHiddenShapeTurned: [["nvrtHiddenShapeTurned"], 120]
};
const ofTemplate = name => app.nvrt.filter(q => q.template === name);
const ofFamily = family => app.nvrt.filter(q => FAMILIES[family][0].includes(q.template));
const TEMPLATES = Object.values(FAMILIES).flatMap(([templates]) => templates);
const fresh = app.nvrt.filter(q => TEMPLATES.includes(q.template));

/* The markup inside <g data-fig="X">...</g>. The groups hold no nested <g>. */
function group(svg, name) {
  const m = new RegExp(`<g data-fig="${name}">(.*?)</g>`).exec(svg);
  return m ? m[1] : null;
}

/* Run a solver over a family and report the first few it disagrees with. */
function solveAll(name, solve) {
  const questions = ofTemplate(name);
  if (!questions.length) return `no ${name} questions to check`;
  const bad = [];
  questions.forEach(q => {
    let verdict;
    try { verdict = solve(q); } catch (e) { verdict = "threw: " + e.message; }
    if (verdict !== true) bad.push(`#${q.id}: ${verdict}`);
  });
  return bad.length === 0 || `${bad.length} of ${questions.length} wrong, e.g. ${bad.slice(0, 3).join(" | ")}`;
}

/* ── shape ── */

report.check("every family is present at its full count", () => {
  const short = Object.entries(FAMILIES)
    .filter(([name, [, count]]) => ofFamily(name).length !== count)
    .map(([name, [, count]]) => `${name} ${ofFamily(name).length}/${count}`);
  return short.length === 0 || `generators gave up on some seeds: ${short.join(", ")}`;
});

report.check("every family reaches a paper: at least a fifth Hard and a fifth Super Hard", () => {
  /* An NVRT paper draws only on levels 3 and 4 (config.js). */
  const thin = Object.keys(FAMILIES).filter(name => {
    const qs = ofFamily(name);
    return [3, 4].some(level => qs.filter(q => q.difficulty === level).length < qs.length / 5);
  });
  return thin.length === 0 || `too few Hard or Super Hard in ${thin.join(", ")}`;
});

report.check("every question has five options, an explanation and its figure data", () => {
  const bad = fresh.filter(q =>
    !q.figureData || !q.explain || !q.questionImageAlt || q.options.length !== 5 ||
    LETTERS.some(letter => !group(decode(q.questionImage), letter)));
  return bad.length === 0 || `${bad.length} incomplete, e.g. #${bad[0].id} ${bad[0].template}`;
});

report.check("no family draws the same picture twice", () => {
  const dup = Object.keys(FAMILIES).filter(name => {
    const images = ofFamily(name).map(q => q.questionImage);
    return new Set(images).size !== images.length;
  });
  return dup.length === 0 || `repeated pictures in ${dup.join(", ")}`;
});

report.check("the answer is spread across the five letters", () => {
  const lopsided = Object.keys(FAMILIES).filter(name => {
    const counts = [0, 0, 0, 0, 0];
    ofFamily(name).forEach(q => { counts[q.answer] += 1; });
    return Math.max(...counts) > ofFamily(name).length * 0.35;
  });
  return lopsided.length === 0 || `one letter is the answer too often in ${lopsided.join(", ")}`;
});

/* ── Rotation ── */

const close = (p, q) => Math.abs(p[0] - q[0]) < 0.03 && Math.abs(p[1] - q[1]) < 0.03;
function turn(figure, degrees) {
  const t = (degrees * Math.PI) / 180;
  const move = ([x, y]) => [x * Math.cos(t) - y * Math.sin(t), x * Math.sin(t) + y * Math.cos(t)];
  return figure.map(part => (part.c ? { ...part, c: move(part.c) } : { ...part, pts: part.pts.map(move) }));
}
const mirror = figure => figure.map(part =>
  (part.c ? { ...part, c: [-part.c[0], part.c[1]] } : { ...part, pts: part.pts.map(([x, y]) => [-x, y]) }));
function partsMatch(a, b) {
  if (a.kind !== b.kind || a.fill !== b.fill) return false;
  if (a.c) return close(a.c, b.c) && Math.abs(a.r - b.r) < 0.03;
  if (a.pts.length !== b.pts.length) return false;
  /* Same vertices in the same cyclic order, either direction - stricter than
     the generator's own comparison, which only asks for the same set. */
  const n = a.pts.length;
  for (let start = 0; start < n; start += 1) {
    for (const dir of [1, -1]) {
      /* An open line is the same only end to end, forwards or backwards. */
      if (a.kind === "line" && !((start === 0 && dir === 1) || (start === n - 1 && dir === -1))) continue;
      if (a.pts.every((p, i) => close(p, b.pts[(start + dir * i + n * 2) % n]))) return true;
    }
  }
  return false;
}
function figuresMatch(a, b) {
  if (a.length !== b.length) return false;
  const used = new Set();
  return a.every(part => {
    const i = b.findIndex((other, j) => !used.has(j) && partsMatch(part, other));
    if (i < 0) return false;
    used.add(i);
    return true;
  });
}
const isTurn = (figure, reference) => [0, 45, 90, 135, 180, 225, 270, 315]
  .some(angle => figuresMatch(figure, turn(reference, angle)));

report.check("Rotation: exactly one option is a pure turn of the figure, and it is the answer", () =>
  solveAll("nvrtRotation", q => {
    const { reference, options } = q.figureData;
    const turns = options.map((option, i) => (isTurn(option, reference) ? i : -1)).filter(i => i >= 0);
    if (turns.length !== 1) return `${turns.length} options are turns of the figure`;
    return turns[0] === q.answer || `answer is ${LETTERS[q.answer]} but ${LETTERS[turns[0]]} is the turn`;
  }));

report.check("Rotation: the figure never looks the same mirrored, so a flip is always wrong", () =>
  solveAll("nvrtRotation", q => !isTurn(mirror(q.figureData.reference), q.figureData.reference) ||
    "the reference figure has a line of symmetry"));

report.check("Rotation: no two options are the same drawing", () =>
  solveAll("nvrtRotation", q => {
    const o = q.figureData.options;
    for (let i = 0; i < 5; i += 1) for (let j = i + 1; j < 5; j += 1) {
      if (figuresMatch(o[i], o[j])) return `${LETTERS[i]} and ${LETTERS[j]} are identical`;
    }
    return true;
  }));

/* ── Plan View ── */

report.check("Plan View: the heights in the alt text project onto exactly one option, the answer", () =>
  solveAll("nvrtPlanView", q => {
    const m = /back row first, left to right: ([\d, ;]+)\./.exec(q.questionImageAlt);
    if (!m) return "alt text carries no heights";
    const heights = m[1].split(";").map(row => row.trim().split(",").map(Number));
    const fromAbove = heights.map(row => row.map(h => (h > 0 ? "1" : "0")).join("")).join("");
    const svg = decode(q.questionImage);
    const grids = LETTERS.map(letter => [...group(svg, letter).matchAll(/data-cell="([01])"/g)].map(c => c[1]).join(""));
    if (grids.some(g => g.length !== 12)) return "an option grid does not have 12 squares";
    const matching = grids.map((g, i) => (g === fromAbove ? i : -1)).filter(i => i >= 0);
    if (matching.length !== 1) return `${matching.length} options match the view from above`;
    return matching[0] === q.answer || `answer is ${LETTERS[q.answer]} but ${LETTERS[matching[0]]} matches`;
  }));

report.check("Plan View: the drawing has one cube top for every cube in the heights", () =>
  solveAll("nvrtPlanView", q => {
    const m = /back row first, left to right: ([\d, ;]+)\./.exec(q.questionImageAlt);
    const cubes = m[1].split(/[;,]/).map(Number).reduce((a, b) => a + b, 0);
    const tops = (decode(q.questionImage).match(/data-face="top"/g) || []).length;
    return tops === cubes || `${tops} cube tops drawn for ${cubes} cubes`;
  }));

/* ── Shape Arithmetic ── */

const parseKey = key => key.split(",").map(Number);
const keyOf = (c, r, q) => `${c},${r},${q}`;
function turnPiece(cells, ends) {
  /* A quarter turn clockwise: point (x, y) goes to (-y, x); the cell whose
     corner was (c, r) now has its corner at (-r - 1, c). */
  return {
    cells: cells.map(k => { const [c, r, q] = parseKey(k); return keyOf(-r - 1, c, (q + 1) % 4); }),
    ends: ends.map(([x, y]) => [-y, x])
  };
}
const normalise = cells => {
  const parsed = cells.map(parseKey);
  const minC = Math.min(...parsed.map(p => p[0])), minR = Math.min(...parsed.map(p => p[1]));
  return parsed.map(([c, r, q]) => keyOf(c - minC, r - minR, q)).sort().join(" ");
};
const allTurns = cells => {
  const out = [];
  let current = { cells, ends: [] };
  for (let t = 0; t < 4; t += 1) { out.push(normalise(current.cells)); current = turnPiece(current.cells, []); }
  return out;
};

report.check("Shape Arithmetic: each piece fits its lettered edge one way only, and the result is the answer", () =>
  solveAll("nvrtShapeArithmetic", q => {
    const { base, baseLabels, pieces, turned, options } = q.figureData;
    const baseSet = new Set(base);
    const result = new Set(base);
    const cuts = [];
    for (const piece of pieces) {
      const target = baseLabels.find(label => label.letter === piece.letter);
      if (!target) return `no edge on the shape is lettered ${piece.letter}`;
      const fits = new Set();
      let current = { cells: piece.shape, ends: [piece.a, piece.b] };
      for (let t = 0; t < 4; t += 1) {
        const [a, b] = current.ends;
        for (const [from, to] of [[a, target.a], [a, target.b]]) {
          const dx = to[0] - from[0], dy = to[1] - from[1];
          const other = from === a ? b : a;
          const otherTarget = to === target.a ? target.b : target.a;
          if (other[0] + dx !== otherTarget[0] || other[1] + dy !== otherTarget[1]) continue;
          const moved = current.cells.map(k => { const [c, r, qq] = parseKey(k); return keyOf(c + dx, r + dy, qq); });
          const inside = moved.filter(k => baseSet.has(k)).length;
          const sideOk = piece.op === "add" ? inside === 0 : inside === moved.length;
          if (sideOk) fits.add(moved.slice().sort().join(" "));
        }
        current = turnPiece(current.cells, current.ends);
      }
      if (fits.size !== 1) return `piece ${piece.letter} fits ${fits.size} ways`;
      const placed = [...fits][0].split(" ");
      if (piece.op === "add") placed.forEach(k => result.add(k));
      else cuts.push(...placed);
    }
    cuts.forEach(k => result.delete(k));
    const want = normalise([...result]);
    const matches = options.map((option, i) => {
      const exact = normalise(option) === want;
      const anyTurn = allTurns(option).includes(want);
      return { i, exact, anyTurn };
    });
    const hits = matches.filter(m => m.anyTurn);
    if (hits.length !== 1) return `${hits.length} options match the result even allowing turns`;
    if (hits[0].i !== q.answer) return `answer is ${LETTERS[q.answer]} but ${LETTERS[hits[0].i]} matches`;
    return turned || hits[0].exact || "the answer is turned though the question does not say so";
  }));

report.check("Shape Arithmetic: no option has a hole in it", () =>
  /* A flipped piece can leave a triangle enclosed, and a shape with a hole is
     a wrong answer a child can rule out without doing the question. Checked
     by flooding the empty quarter-cells from outside each option. */
  solveAll("nvrtShapeArithmetic", q => {
    for (const [i, option] of q.figureData.options.entries()) {
      const cells = new Set(option);
      const parsed = option.map(parseKey);
      const maxC = Math.max(...parsed.map(p => p[0])) + 1, maxR = Math.max(...parsed.map(p => p[1])) + 1;
      const touching = (c, r, qq) => [
        [[c, r - 1, 2], [c + 1, r, 3], [c, r + 1, 0], [c - 1, r, 1]][qq],
        [c, r, (qq + 1) % 4], [c, r, (qq + 3) % 4]];
      const seen = new Set([keyOf(-1, -1, 0)]);
      const stack = [[-1, -1, 0]];
      while (stack.length) {
        const [c, r, qq] = stack.pop();
        touching(c, r, qq).forEach(([nc, nr, nq]) => {
          const k = keyOf(nc, nr, nq);
          if (nc < -1 || nr < -1 || nc > maxC || nr > maxR || cells.has(k) || seen.has(k)) return;
          seen.add(k);
          stack.push([nc, nr, nq]);
        });
      }
      const empty = (maxC + 2) * (maxR + 2) * 4 - cells.size;
      if (seen.size !== empty) return `option ${LETTERS[i]} encloses a gap`;
    }
    return true;
  }));

/* ── Count the Squares ── */

report.check("Count the Squares: counting squares by the drawn lines gives the answer, and only the answer", () =>
  solveAll("nvrtCountSquares", q => {
    const { width, height, unit, ox, oy } = q.figureData;
    const svg = decode(q.questionImage);
    const edges = new Set();
    for (const m of group(svg, "grid").matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/g)) {
      const [x1, y1, x2, y2] = m.slice(1, 5).map(Number);
      const u = v => Math.round((v - ox) / unit), w = v => Math.round((v - oy) / unit);
      edges.add([u(x1), w(y1), u(x2), w(y2)].join(","));
    }
    const h = (x, y) => edges.has(`${x},${y},${x + 1},${y}`);
    const v = (x, y) => edges.has(`${x},${y},${x},${y + 1}`);
    let count = 0;
    for (let k = 1; k <= Math.max(width, height); k += 1) {
      for (let y = 0; y + k <= height; y += 1) {
        for (let x = 0; x + k <= width; x += 1) {
          let ok = true;
          for (let i = 0; i < k && ok; i += 1) ok = h(x + i, y) && h(x + i, y + k) && v(x, y + i) && v(x + k, y + i);
          if (ok) count += 1;
        }
      }
    }
    const values = LETTERS.map(letter => Number((/>(\d+)<\/text>/.exec(group(svg, letter)) || [])[1]));
    if (values[q.answer] !== count) return `answer shows ${values[q.answer]} but ${count} squares are drawn`;
    return values.filter(value => value === count).length === 1 || `${count} is offered twice`;
  }));

/* ── Odd One Out: rules ── */

/* The one position whose value differs from four that agree, or -1. */
function loner(values) {
  const keys = values.map(v => JSON.stringify(v));
  const lone = keys.map((k, i) => (keys.filter(x => x === k).length === 1 ? i : -1)).filter(i => i >= 0);
  const rest = keys.filter((_, i) => i !== lone[0]);
  return lone.length === 1 && new Set(rest).size === 1 ? lone[0] : -1;
}
const pointsOf = attr => attr.trim().split(/\s+/).map(p => p.split(",").map(Number));
function insidePolygon([x, y], pts) {
  /* Winding by angle sum, not the ray casting the generator uses. */
  let total = 0;
  pts.forEach((a, i) => {
    const b = pts[(i + 1) % pts.length];
    const t1 = Math.atan2(a[1] - y, a[0] - x), t2 = Math.atan2(b[1] - y, b[0] - x);
    let d = t2 - t1;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    total += d;
  });
  return Math.abs(total) > Math.PI;
}
const ODD_READERS = {
  /* The slope of each figure's shading lines, read from its pattern. */
  hatch: markup => Number(/patternTransform="rotate\(([\d.]+)\)"/.exec(markup)[1]) % 180,
  /* Straight pieces in the open line, merging any that run straight on. */
  segments: markup => {
    const pts = pointsOf(/<polyline points="([^"]+)"/.exec(markup)[1]);
    let pieces = 0;
    for (let i = 1; i < pts.length; i += 1) {
      const prev = i >= 2 ? pts[i - 2] : null, a = pts[i - 1], b = pts[i];
      const straightOn = prev && Math.abs((a[0] - prev[0]) * (b[1] - a[1]) - (a[1] - prev[1]) * (b[0] - a[0])) < 1e-6;
      if (!straightOn) pieces += 1;
    }
    return pieces;
  },
  /* How many black and how many white circles lie inside the outline. */
  inside: markup => {
    const outline = pointsOf(/<polygon points="([^"]+)"[^>]*data-part="outline"/.exec(markup)[1]);
    const count = { black: 0, white: 0 };
    for (const m of markup.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="5" fill="([^"]+)"/g)) {
      if (insidePolygon([Number(m[1]), Number(m[2])], outline)) count[m[3] === "#ffffff" ? "white" : "black"] += 1;
    }
    return count;
  },
  /* A rounded outline is drawn with many points, a straight-ended one with four. */
  ends: markup => pointsOf(/<polygon points="([^"]+)"[^>]*data-part="outline"/.exec(markup)[1]).length > 8
};

report.check("Odd One Out rules: exactly one figure breaks the rule, read off the drawing, and it is the answer", () =>
  solveAll("nvrtOddOneOutRule", q => {
    const rule = q.figureData.rule;
    let odd;
    if (rule === "flipped") {
      /* Four are turns of each other; the fifth is a turn of none of them. */
      const figs = q.figureData.figures;
      const turnsOfOthers = figs.map((f, i) => figs.filter((g, j) => j !== i && isTurn(g, f)).length);
      odd = loner(turnsOfOthers.map(n => n > 0));
    } else {
      const svg = decode(q.questionImage);
      odd = loner(LETTERS.map(letter => ODD_READERS[rule](group(svg, letter))));
    }
    if (odd < 0) return `${rule}: no single figure stands apart`;
    return odd === q.answer || `${rule}: answer is ${LETTERS[q.answer]} but ${LETTERS[odd]} stands apart`;
  }));

report.check("Odd One Out rules: every rule is used", () => {
  const used = new Set(ofTemplate("nvrtOddOneOutRule").map(q => q.figureData.rule));
  const missing = ["hatch", "segments", "inside", "ends", "flipped"].filter(r => !used.has(r));
  return missing.length === 0 || `never used: ${missing.join(", ")}`;
});

/* ── Series strips ── */

/* Predict a value at the gap from the frames either side, given how a value
   moves from one frame to the next. Every visible step must agree. */
function predict(values, gap, step, next) {
  let seen = null;
  for (let i = 0; i + 1 < values.length; i += 1) {
    if (values[i] === null || values[i + 1] === null) continue;
    const s = step(values[i], values[i + 1]);
    if (seen !== null && JSON.stringify(s) !== JSON.stringify(seen)) return { error: "the visible frames change by different amounts" };
    seen = s;
  }
  if (seen === null) return { error: "no two neighbouring frames are visible" };
  const forward = gap > 0 && values[gap - 1] !== null ? next(values[gap - 1], seen) : null;
  const back = gap + 1 < values.length && values[gap + 1] !== null ? next(values[gap + 1], seen, true) : null;
  if (forward !== null && back !== null && JSON.stringify(forward) !== JSON.stringify(back)) return { error: "the frames either side disagree" };
  return { value: forward !== null ? forward : back };
}
const angleStep = (a, b) => (((b - a) % 360) + 360) % 360;
const angleNext = (v, s, backwards) => (((v + (backwards ? -s : s)) % 360) + 360) % 360;
const countStep = (a, b) => b - a;
const countNext = (v, s, backwards) => v + (backwards ? -s : s);
const flipStep = (a, b) => a === b;
const flipNext = (v, same) => (same ? v : !v);

function seriesVerdict(q, predicted, keys) {
  const match = q.figureData.options.map((o, i) => (keys.every(k => o[k] === predicted[k]) ? i : -1)).filter(i => i >= 0);
  if (match.length !== 1) return `${match.length} options fit the pattern`;
  return match[0] === q.answer || `answer is ${LETTERS[q.answer]} but ${LETTERS[match[0]]} fits`;
}

report.check("Series turns: the step seen between frames predicts exactly one option, the answer", () =>
  solveAll("nvrtSeriesTurns", q => {
    const { frames, gap } = q.figureData;
    const predicted = {};
    for (const key of ["a", "b"]) {
      if (frames.find(f => f) && frames.find(f => f)[key] === undefined) continue;
      const p = predict(frames.map(f => (f ? f[key] : null)), gap, angleStep, angleNext);
      if (p.error) return `${key}: ${p.error}`;
      predicted[key] = p.value;
    }
    return seriesVerdict(q, predicted, Object.keys(predicted));
  }));

report.check("Series turns: each marker is drawn at the angle its frame records", () =>
  solveAll("nvrtSeriesTurns", q => {
    const svg = decode(q.questionImage);
    for (const [i, f] of q.figureData.frames.entries()) {
      if (!f) continue;
      const markup = group(svg, `frame-${i}`);
      const centre = /<circle cx="([\d.]+)" cy="([\d.]+)"/.exec(markup).slice(1).map(Number);
      const tip = pointsOf(/<polygon points="([^"]+)"/.exec(markup)[1])[0];
      const angle = ((Math.atan2(tip[0] - centre[0], centre[1] - tip[1]) * 180) / Math.PI + 360) % 360;
      if (Math.abs(((angle - f.a + 540) % 360) - 180) > 1) return `frame ${i + 1} draws ${angle.toFixed(0)} but records ${f.a}`;
    }
    return true;
  }));

report.check("Series counts: the counts and shading seen between frames predict exactly one option, the answer", () =>
  solveAll("nvrtSeriesCounts", q => {
    const { frames, gap } = q.figureData;
    const predicted = {};
    for (const [key, step, next] of [["tri", countStep, countNext], ["circ", countStep, countNext], ["blackFirst", flipStep, flipNext]]) {
      const p = predict(frames.map(f => (f ? f[key] : null)), gap, step, next);
      if (p.error) return `${key}: ${p.error}`;
      predicted[key] = p.value;
    }
    return seriesVerdict(q, predicted, ["tri", "circ", "blackFirst"]);
  }));

report.check("Series counts: each frame draws the numbers it records", () =>
  solveAll("nvrtSeriesCounts", q => {
    const svg = decode(q.questionImage);
    for (const [i, f] of q.figureData.frames.entries()) {
      if (!f) continue;
      const markup = group(svg, `frame-${i}`);
      const tris = [...markup.matchAll(/data-tri="([01])"/g)].map(m => m[1]);
      const circles = (markup.match(/<circle/g) || []).length;
      if (tris.length !== f.tri || circles !== f.circ) return `frame ${i + 1} draws ${tris.length} triangles and ${circles} circles`;
      if ((tris[0] === "1") !== f.blackFirst) return `frame ${i + 1} starts with the wrong colour`;
    }
    return true;
  }));

report.check("Series triangles: the three rules seen along the band predict exactly one option, the answer", () =>
  solveAll("nvrtSeriesTriangles", q => {
    const { cells, gap } = q.figureData;
    const want = { up: gap % 2 === 0 };
    /* The quarter: follow the triangles pointing the same way as the gap. */
    const sameWay = cells.map((c, i) => (i % 2 === gap % 2 ? (c ? c.q : null) : undefined)).filter(v => v !== undefined);
    const p = predict(sameWay, Math.floor(gap / 2), (a, b) => (((b - a) % 4) + 4) % 4, (v, s, back) => (((v + (back ? -s : s)) % 4) + 4) % 4);
    if (p.error) return `quarter: ${p.error}`;
    want.q = p.value;
    /* The arrowhead: positions three apart always match. */
    const heads = cells.map((c, i) => (c && i % 3 === gap % 3 ? c.head : null)).filter(Boolean);
    if (!heads.length || new Set(heads).size !== 1) return "the arrowheads do not repeat every three";
    want.head = heads[0];
    if (q.figureData.options.some(o => o.up !== want.up)) return "an option points the wrong way for the gap";
    return seriesVerdict(q, want, ["q", "head"]);
  }));

report.check("Series triangles: each triangle draws the quarter and arrowhead it records", () =>
  solveAll("nvrtSeriesTriangles", q => {
    const svg = decode(q.questionImage);
    for (const [i, c] of q.figureData.cells.entries()) {
      if (!c) continue;
      const markup = group(svg, `frame-${i}`);
      const quarter = Number(/data-quarter="(\d)"/.exec(markup)[1]);
      const head = /data-head="(\w+)"/.exec(markup)[1];
      if (quarter !== c.q || head !== c.head) return `triangle ${i + 1} draws quarter ${quarter} and a ${head} head`;
    }
    return true;
  }));

/* ── Hole Punch: folds ── */

const mirrorAcross = ([x, y], fold) => {
  /* Reflection through the foot of the perpendicular. */
  const [px, py] = fold.p, [dx, dy] = fold.d;
  const len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;
  const t = (x - px) * ux + (y - py) * uy;
  const foot = [px + t * ux, py + t * uy];
  return [2 * foot[0] - x, 2 * foot[1] - y];
};
const holeCentreOf = h => (h.c ? h.c : [h.pts.reduce((s, p) => s + p[0], 0) / h.pts.length, h.pts.reduce((s, p) => s + p[1], 0) / h.pts.length]);
const holesAlike = (a, b) => a.kind === b.kind && (a.c
  ? Math.hypot(a.c[0] - b.c[0], a.c[1] - b.c[1]) < 0.01
  : a.pts.every(p => b.pts.some(r => Math.hypot(p[0] - r[0], p[1] - r[1]) < 0.01)));

report.check("Hole Punch folds: folding each option back up stacks every hole on a punch, for one option only", () =>
  /* The generator unfolds; this folds up. Each hole on the right sheet must
     land exactly on a punched hole, the same shape the same way round, and
     every punch must be reached by one hole from every layer. */
  solveAll("nvrtHolePunchFolds", q => {
    const { folds, punches, options } = q.figureData;
    const layers = 2 ** folds.length;
    const fits = options.map(holes => {
      if (holes.length !== punches.length * layers) return false;
      const hits = punches.map(() => 0);
      for (const hole of holes) {
        let h = hole;
        for (const fold of folds) {
          const c = holeCentreOf(h);
          const cross = fold.d[0] * (c[1] - fold.p[1]) - fold.d[1] * (c[0] - fold.p[0]);
          if (Math.sign(cross) === -fold.keep) h = h.c ? { ...h, c: mirrorAcross(h.c, fold) } : { ...h, pts: h.pts.map(p => mirrorAcross(p, fold)) };
        }
        const k = punches.findIndex(p => holesAlike(p, h));
        if (k < 0) return false;
        hits[k] += 1;
      }
      return hits.every(n => n === layers);
    });
    const matching = fits.map((ok, i) => (ok ? i : -1)).filter(i => i >= 0);
    if (matching.length !== 1) return `${matching.length} options fold back onto the punches`;
    return matching[0] === q.answer || `answer is ${LETTERS[q.answer]} but ${LETTERS[matching[0]]} folds back`;
  }));

report.check("Hole Punch folds: each sheet draws as many holes as it records, and no two options look alike", () =>
  solveAll("nvrtHolePunchFolds", q => {
    const svg = decode(q.questionImage);
    for (const [i, holes] of q.figureData.options.entries()) {
      const drawn = (group(svg, LETTERS[i]).match(/fill="#ffffff" stroke="#0f172a" stroke-width="1"/g) || []).length;
      if (drawn !== holes.length) return `${LETTERS[i]} draws ${drawn} holes for ${holes.length}`;
      for (let j = 0; j < i; j += 1) {
        const other = q.figureData.options[j];
        if (other.length === holes.length && holes.every(h => other.some(o => holesAlike(h, o)))) return `${LETTERS[j]} and ${LETTERS[i]} look the same`;
      }
    }
    return true;
  }));

/* ── Hidden Shape: turned ── */

/* Unit lengths of line, as pairs of lattice points, read off the drawing. */
function unitPieces(markup, ox, oy, unit) {
  const pieces = new Set();
  for (const m of markup.matchAll(/<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"/g)) {
    const [x1, y1, x2, y2] = m.slice(1, 5).map(Number);
    const a = [Math.round((x1 - ox) / unit), Math.round((y1 - oy) / unit)];
    const b = [Math.round((x2 - ox) / unit), Math.round((y2 - oy) / unit)];
    const n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
    const sx = Math.sign(b[0] - a[0]), sy = Math.sign(b[1] - a[1]);
    for (let i = 0; i < n; i += 1) {
      const p = [a[0] + sx * i, a[1] + sy * i], r = [a[0] + sx * (i + 1), a[1] + sy * (i + 1)];
      pieces.add([p, r].sort((u, v) => u[0] - v[0] || u[1] - v[1]).map(z => z.join(",")).join("|"));
    }
  }
  return pieces;
}
function shiftPieces(pieces, dx, dy, turnTimes) {
  return [...pieces].map(piece => piece.split("|").map(z => {
    let [x, y] = z.split(",").map(Number);
    for (let t = 0; t < turnTimes; t += 1) [x, y] = [-y, x];
    return [x + dx, y + dy];
  }).sort((u, v) => u[0] - v[0] || u[1] - v[1]).map(z => z.join(",")).join("|"));
}

report.check("Hidden Shape turned: exactly one drawing contains a turn of the target, and it is the answer", () =>
  solveAll("nvrtHiddenShapeTurned", q => {
    const { unit, target, options } = q.figureData;
    const svg = decode(q.questionImage);
    const goal = unitPieces(group(svg, "target"), target.ox, target.oy, unit);
    const holds = LETTERS.map((letter, i) => {
      const drawing = unitPieces(group(svg, letter), options[i].ox, options[i].oy, unit);
      for (let t = 0; t < 4; t += 1) {
        for (let dx = -8; dx <= 8; dx += 1) {
          for (let dy = -8; dy <= 8; dy += 1) {
            if (shiftPieces(goal, dx, dy, t).every(p => drawing.has(p))) return true;
          }
        }
      }
      return false;
    });
    const matching = holds.map((h, i) => (h ? i : -1)).filter(i => i >= 0);
    if (matching.length !== 1) return `${matching.length} drawings contain the target`;
    return matching[0] === q.answer || `answer is ${LETTERS[q.answer]} but ${LETTERS[matching[0]]} contains it`;
  }));

report.note(`${fresh.length} questions across ${Object.keys(FAMILIES).length} families`);
process.exit(report.finish() ? 0 : 1);
