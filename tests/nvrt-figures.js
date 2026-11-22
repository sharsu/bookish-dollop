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
const FAMILIES = {
  nvrtRotation: 150,
  nvrtPlanView: 120,
  nvrtShapeArithmetic: 150,
  nvrtCountSquares: 100
};
const ofTemplate = name => app.nvrt.filter(q => q.template === name);
const fresh = app.nvrt.filter(q => q.template in FAMILIES);

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
    .filter(([name, count]) => ofTemplate(name).length !== count)
    .map(([name, count]) => `${name} ${ofTemplate(name).length}/${count}`);
  return short.length === 0 || `generators gave up on some seeds: ${short.join(", ")}`;
});

report.check("every family reaches a paper: at least a fifth Hard and a fifth Super Hard", () => {
  /* An NVRT paper draws only on levels 3 and 4 (config.js). */
  const thin = Object.keys(FAMILIES).filter(name => {
    const qs = ofTemplate(name);
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
    const images = ofTemplate(name).map(q => q.questionImage);
    return new Set(images).size !== images.length;
  });
  return dup.length === 0 || `repeated pictures in ${dup.join(", ")}`;
});

report.check("the answer is spread across the five letters", () => {
  const lopsided = Object.keys(FAMILIES).filter(name => {
    const counts = [0, 0, 0, 0, 0];
    ofTemplate(name).forEach(q => { counts[q.answer] += 1; });
    return Math.max(...counts) > ofTemplate(name).length * 0.35;
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

report.note(`${fresh.length} questions across ${Object.keys(FAMILIES).length} families`);
process.exit(report.finish() ? 0 : 1);
