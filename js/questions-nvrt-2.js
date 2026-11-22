/* ═══════════════════ NVRT: families from the NVRT-1 bank ═══════════════════
   Four kinds of question the generators in questions-nvrt.js never asked,
   modelled on the screenshots in question-bank/NVRT-1:

     Rotation           which figure is the same one turned, not flipped
     Plan View          a stack of cubes seen from directly above
     Shape Arithmetic   pieces added to and cut from a shape along lettered edges
     Count the Squares  every square of every size in a grid shape

   Self-contained on purpose. It shares nothing with questions-nvrt.js except
   the NVRT_QUESTIONS array it appends to, so markable can mirror it as one
   file without the two drifting apart.

   Every question carries `figureData`, the model its picture was drawn from.
   tests/nvrt-figures.js re-solves each question from that data, or from the
   drawn SVG itself, by a different route from the generator - searching
   rotations rather than applying one, projecting heights, counting drawn
   lines. A check written from the same idea as the code would agree with it
   however wrong it was; tests/README.md has the story. */
(() => {
  const root = typeof window !== "undefined" ? window : globalThis;
  if (!Array.isArray(root.NVRT_QUESTIONS)) return;

  const INK = "#0f172a";
  const ACCENT = "#4f46e5";
  const PANEL_STROKE = "#cbd5e1";
  const SHADE = "#9ca3af";
  const CUBE_TOP = "#c7cdd4";
  const LABELS = ["A", "B", "C", "D", "E"];
  const FILLS = { white: "#ffffff", ink: INK, grey: SHADE };

  let nextId = root.NVRT_QUESTIONS.reduce((max, q) => Math.max(max, Number(q && q.id) || 0), 0) + 1;

  const svgToDataUri = svg =>
    `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/>\s+</g, "><").trim())}`;

  /* Two decimal places is finer than a pixel, and keeps "-0" out of the SVG. */
  const num = value => {
    const rounded = Math.round(value * 100) / 100;
    return Object.is(rounded, -0) ? 0 : rounded;
  };

  /* A small seeded generator, so a question is the same on every page load. */
  function makeRng(seed) {
    let state = (Math.imul(seed + 1, 0x9e3779b1) ^ 0x5bd1e995) >>> 0;
    const next = () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const int = n => Math.floor(next() * n);
    return {
      next,
      int,
      pick: list => list[int(list.length)],
      shuffle: list => {
        const copy = list.slice();
        for (let i = copy.length - 1; i > 0; i -= 1) {
          const j = int(i + 1);
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
      }
    };
  }

  /* One Medium in ten; the rest Hard and Super Hard, which are the only levels
     an NVRT paper draws on (allowedDifficulties in config.js). A family with
     nothing at 3 or 4 would never reach a paper at all. */
  const LEVELS = [2, 3, 4, 3, 4, 3, 3, 4, 3, 4];
  const levelFor = seed => LEVELS[seed % LEVELS.length];

  function baseSvg(width, height, body) {
    return svgToDataUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">` +
      `<rect width="${width}" height="${height}" rx="24" fill="#f8fafc"/>${body}</svg>`);
  }

  function panelRect(x, y, w, h, dashed = false) {
    const stroke = dashed ? ACCENT : PANEL_STROKE;
    const dash = dashed ? ` stroke-dasharray="7 5"` : "";
    return `<rect x="${num(x)}" y="${num(y)}" width="${w}" height="${h}" rx="12" fill="#ffffff" stroke="${stroke}" stroke-width="2"${dash}/>`;
  }

  function text(x, y, content, size = 14, extra = "") {
    return `<text x="${num(x)}" y="${num(y)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size}" font-weight="700" fill="${INK}"${extra}>${content}</text>`;
  }

  function questionBox(x, y, w, h) {
    return panelRect(x, y, w, h, true) +
      `<text x="${num(x + w / 2)}" y="${num(y + h / 2 + 11)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="${ACCENT}">?</text>`;
  }

  function placeAnswer(rng, correct, distractors) {
    const answer = rng.int(5);
    const options = [];
    let next = 0;
    for (let i = 0; i < 5; i += 1) options.push(i === answer ? correct : distractors[next++]);
    return { answer, options };
  }

  function makeQuestion(fields) {
    return {
      id: nextId++,
      topic: fields.topic,
      template: fields.template,
      question: fields.question,
      options: LABELS.map(label => `Picture ${label}`),
      answer: fields.answer,
      difficulty: fields.difficulty,
      questionImage: fields.image,
      questionImageAlt: fields.alt,
      explain: fields.explain,
      figureData: fields.data
    };
  }

  /* A generator may reject its own draw - a shape that looks the same
     mirrored, a column hidden behind a tower - and try again. The attempts are
     bounded, so a generator that can never succeed leaves a gap the tests
     count rather than hanging the page. */
  function generate(build, seed, attempts = 80) {
    for (let i = 0; i < attempts; i += 1) {
      const question = build(seed, makeRng(seed * 7919 + i * 104729 + 17));
      if (question) return question;
    }
    return null;
  }

  const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th"];
  const listWords = items => items.length <= 1
    ? items.join("")
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

  /* ───────────────────────── polyominoes ───────────────────────── */

  const cellKey = (c, r) => `${c},${r}`;
  const parseCell = key => key.split(",").map(Number);

  /* Cells grown one neighbour at a time, so the result is always connected. */
  function growPolyomino(rng, size, cols, rows) {
    const cells = new Set([cellKey(rng.int(cols), rng.int(rows))]);
    for (let guard = 0; cells.size < size && guard < 400; guard += 1) {
      const [c, r] = parseCell(rng.pick([...cells]));
      const [dc, dr] = rng.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
      if (c + dc >= 0 && r + dr >= 0 && c + dc < cols && r + dr < rows) cells.add(cellKey(c + dc, r + dr));
    }
    return cells.size === size ? cells : null;
  }

  /* The outline of a set of cells as one closed loop, clockwise on screen,
     with straight runs merged into single edges. Null when the cells enclose a
     hole or touch only at a corner: neither draws as one clean outline. */
  function polyominoOutline(cells) {
    const has = (c, r) => cells.has(cellKey(c, r));
    const next = new Map();
    let edges = 0;
    const add = (x1, y1, x2, y2) => {
      const from = `${x1},${y1}`;
      next.set(from, next.has(from) ? null : `${x2},${y2}`);
      edges += 1;
    };
    cells.forEach(key => {
      const [c, r] = parseCell(key);
      if (!has(c, r - 1)) add(c, r, c + 1, r);
      if (!has(c + 1, r)) add(c + 1, r, c + 1, r + 1);
      if (!has(c, r + 1)) add(c + 1, r + 1, c, r + 1);
      if (!has(c - 1, r)) add(c, r + 1, c, r);
    });
    if ([...next.values()].includes(null)) return null;
    const start = next.keys().next().value;
    const loop = [];
    let at = start;
    do {
      loop.push(parseCell(at));
      at = next.get(at);
    } while (at && at !== start && loop.length <= edges);
    if (at !== start || loop.length !== edges) return null;
    return loop.filter((p, i) => {
      const a = loop[(i + loop.length - 1) % loop.length];
      const b = loop[(i + 1) % loop.length];
      return (p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0]) !== 0;
    });
  }

  /* ═════════════════════════ ROTATION ═════════════════════════
     An asymmetric figure on the left, five copies on the right. One is the
     figure turned; the others have been flipped - all of it, or only the
     outline, or only the small mark inside - and then turned. The draw is
     thrown away if the figure looks the same mirrored, since then a flipped
     copy would also be a correct answer. */

  const mapFigure = (figure, fn) => figure.map(part => {
    const moved = { ...part, anchor: part.anchor && fn(part.anchor) };
    if (part.kind === "circle") moved.c = fn(part.c);
    else moved.pts = part.pts.map(fn);
    return moved;
  });

  const turnPoint = degrees => {
    const t = (degrees * Math.PI) / 180;
    const cos = Math.cos(t), sin = Math.sin(t);
    /* Screen y points down, so this turns clockwise as the child sees it. */
    return ([x, y]) => [x * cos - y * sin, x * sin + y * cos];
  };
  const turnFigure = (figure, degrees) => mapFigure(figure, turnPoint(degrees));
  const mirrorFigure = figure => mapFigure(figure, ([x, y]) => [-x, y]);

  /* Flip only the small mark, in place, about a vertical line through it. */
  const flipMark = figure => figure.map(part => {
    if (!part.mark) return part;
    const flip = ([x, y]) => [2 * part.anchor[0] - x, y];
    return part.kind === "circle" ? { ...part, c: flip(part.c) } : { ...part, pts: part.pts.map(flip) };
  });

  const near = (p, q) => Math.abs(p[0] - q[0]) < 0.02 && Math.abs(p[1] - q[1]) < 0.02;
  function samePart(a, b) {
    if (a.kind !== b.kind || a.fill !== b.fill) return false;
    if (a.kind === "circle") return near(a.c, b.c) && Math.abs(a.r - b.r) < 0.02;
    if (a.pts.length !== b.pts.length) return false;
    if (a.kind === "line") {
      const first = a.pts[0], last = a.pts[a.pts.length - 1];
      const ends = (near(first, b.pts[0]) && near(last, b.pts[b.pts.length - 1])) ||
        (near(first, b.pts[b.pts.length - 1]) && near(last, b.pts[0]));
      if (!ends) return false;
    }
    return a.pts.every(p => b.pts.some(q => near(p, q)));
  }
  function sameFigure(a, b) {
    if (a.length !== b.length) return false;
    const used = new Set();
    return a.every(part => {
      const index = b.findIndex((other, j) => !used.has(j) && samePart(part, other));
      if (index < 0) return false;
      used.add(index);
      return true;
    });
  }
  const EIGHTH_TURNS = [0, 45, 90, 135, 180, 225, 270, 315];
  const isTurnOf = (figure, reference) =>
    EIGHTH_TURNS.some(angle => sameFigure(figure, turnFigure(reference, angle)));

  /* Corners cut at 45 degrees, at vertices that are not next to each other so
     no edge is shortened from both ends. */
  function chamferLoop(loop, picks) {
    const out = [];
    loop.forEach((p, i) => {
      if (!picks.includes(i)) { out.push(p); return; }
      const a = loop[(i + loop.length - 1) % loop.length];
      const b = loop[(i + 1) % loop.length];
      const toward = q => {
        const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
        return [p[0] + ((q[0] - p[0]) * 0.5) / len, p[1] + ((q[1] - p[1]) * 0.5) / len];
      };
      out.push(toward(a), toward(b));
    });
    return out;
  }
  const isConvexCorner = (loop, i) => {
    const a = loop[(i + loop.length - 1) % loop.length], p = loop[i], b = loop[(i + 1) % loop.length];
    return (p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0]) > 0;
  };

  /* The small mark inside one cell. Each is chosen so that its own mirror
     image is not a turn of it - a mark with a line of symmetry would let the
     "only the mark was flipped" distractor quietly become a rotation. */
  const MARK_KINDS = ["flag", "halfTriangle", "hook"];
  function markParts(kind, turn, cx, cy) {
    const s = 0.28;
    const at = points => points.map(turnPoint(turn)).map(([x, y]) => [cx + x, cy + y]);
    const anchor = [cx, cy];
    if (kind === "flag") {
      return [{ kind: "poly", fill: "ink", mark: true, anchor, pts: at([[-s, -s], [s, -s], [-s, 0]]) }];
    }
    if (kind === "halfTriangle") {
      return [
        { kind: "poly", fill: "ink", mark: true, anchor, pts: at([[0, -s], [-s, s], [0, s]]) },
        { kind: "poly", fill: "white", mark: true, anchor, pts: at([[0, -s], [0, s], [s, s]]) }
      ];
    }
    return [{ kind: "line", fill: "none", mark: true, anchor, pts: at([[-s, -s], [-s, s], [s * 0.45, s], [s * 0.45, s * 0.25]]) }];
  }

  function figureMarkup(figure, cx, cy, scale) {
    const P = ([x, y]) => `${num(cx + x * scale)},${num(cy + y * scale)}`;
    return figure.map(part => {
      if (part.kind === "circle") {
        return `<circle cx="${num(cx + part.c[0] * scale)}" cy="${num(cy + part.c[1] * scale)}" r="${num(part.r * scale)}" fill="${FILLS[part.fill]}" stroke="${INK}" stroke-width="1.6"/>`;
      }
      if (part.kind === "line") {
        return `<polyline points="${part.pts.map(P).join(" ")}" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
      return `<polygon points="${part.pts.map(P).join(" ")}" fill="${FILLS[part.fill]}" stroke="${INK}" stroke-width="${part.mark ? 1.6 : 2}" stroke-linejoin="round"/>`;
    }).join("");
  }

  function rotationIcon(x, y) {
    const r = 13;
    return `<path d="M ${x - r} ${y} A ${r} ${r} 0 1 1 ${x} ${y + r}" fill="none" stroke="${INK}" stroke-width="2.5"/>` +
      `<polygon points="${x - 7},${y + r} ${x + 1},${y + r - 6} ${x + 1},${y + r + 6}" fill="${INK}"/>`;
  }

  /* What the tests need of a figure: each part's kind, fill and geometry. */
  const roundFigure = figure => figure.map(part => (part.kind === "circle"
    ? { kind: part.kind, fill: part.fill, c: part.c.map(num), r: num(part.r) }
    : { kind: part.kind, fill: part.fill, pts: part.pts.map(p => p.map(num)) }));

  function buildFigure(cells, chamferAt) {
    let loop = polyominoOutline(cells);
    if (!loop) return null;
    const corners = chamferAt.map(point => loop.findIndex(p => p[0] === point[0] && p[1] === point[1]))
      .filter(i => i >= 0 && isConvexCorner(loop, i));
    loop = chamferLoop(loop, corners);
    return [{ kind: "poly", fill: "white", pts: loop }];
  }

  function buildRotation(seed, rng) {
    const level = levelFor(seed);
    const cells = growPolyomino(rng, 5 + rng.int(3), 4, 4);
    if (!cells) return null;
    const outline = polyominoOutline(cells);
    if (!outline) return null;

    /* Hard and Super Hard cut one or two corners at 45 degrees. */
    const convex = outline.map((p, i) => i).filter(i => isConvexCorner(outline, i));
    const chamferAt = [];
    const wanted = level === 2 ? 0 : level === 3 ? 1 : 2;
    rng.shuffle(convex).forEach(i => {
      if (chamferAt.length >= wanted) return;
      const n = outline.length;
      const clash = chamferAt.some(p => {
        const j = outline.indexOf(p);
        return Math.abs(j - i) <= 1 || Math.abs(j - i) === n - 1;
      });
      if (!clash) chamferAt.push(outline[i]);
    });

    const figure = buildFigure(cells, chamferAt);
    if (!figure) return null;

    /* The mark sits in a cell none of whose corners was cut, so it stays clear
       of the 45-degree edge. */
    let markCell = null;
    if (level >= 3) {
      const free = [...cells].map(parseCell).filter(([c, r]) =>
        !chamferAt.some(([x, y]) => (x === c || x === c + 1) && (y === r || y === r + 1)));
      if (!free.length) return null;
      markCell = rng.pick(free);
      figure.push(...markParts(rng.pick(MARK_KINDS), rng.int(4) * 90, markCell[0] + 0.5, markCell[1] + 0.5));
    }

    const xs = figure[0].pts.map(p => p[0]), ys = figure[0].pts.map(p => p[1]);
    const offset = [-(Math.min(...xs) + Math.max(...xs)) / 2, -(Math.min(...ys) + Math.max(...ys)) / 2];
    const centre = fig => mapFigure(fig, ([x, y]) => [x + offset[0], y + offset[1]]);
    const reference = centre(figure);

    const mirrored = mirrorFigure(reference);
    if (isTurnOf(mirrored, reference)) return null;

    const step = level === 4 ? 45 : 90;
    const turns = [];
    for (let a = step; a < 360; a += step) turns.push(a);
    const correct = turnFigure(reference, rng.pick(turns));

    /* Distractors: a first copy of each kind of mistake, then more of the same
       kinds at other angles to fill any gap left by duplicates. */
    const kinds = level === 2 ? [mirrored] : [mirrored, flipMark(reference), flipMark(mirrored)];
    if (level === 4) {
      /* "Slightly changed": one cell more or fewer, then turned. */
      const changed = new Set(cells);
      const [c, r] = parseCell(rng.pick([...cells]));
      const [dc, dr] = rng.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
      if (changed.has(cellKey(c + dc, r + dr))) changed.delete(cellKey(c + dc, r + dr));
      else changed.add(cellKey(c + dc, r + dr));
      const markInside = !markCell || changed.has(cellKey(markCell[0], markCell[1]));
      const changedFigure = changed.size >= 4 && markInside ? buildFigure(changed, chamferAt) : null;
      if (changedFigure) {
        changedFigure.push(...reference.slice(1).map(part => mapFigure([part], ([x, y]) => [x - offset[0], y - offset[1]])[0]));
        kinds.push(centre(changedFigure));
      }
    }
    const angles = [0, ...turns];
    const first = rng.shuffle(kinds).map(kind => turnFigure(kind, rng.pick(angles)));
    const more = rng.shuffle(kinds.flatMap(kind => angles.map(a => turnFigure(kind, a))));
    const distractors = [];
    [...first, ...more].forEach(candidate => {
      if (distractors.length >= 4) return;
      if (isTurnOf(candidate, reference)) return;
      if (distractors.some(d => sameFigure(d, candidate))) return;
      distractors.push(candidate);
    });
    if (distractors.length < 4) return null;

    const { answer, options } = placeAnswer(rng, correct, distractors);
    const radius = Math.max(...[reference, ...options].flatMap(fig =>
      fig.flatMap(part => (part.kind === "circle" ? [part.c] : part.pts)).map(([x, y]) => Math.hypot(x, y))));
    const scale = 40 / radius;

    let body = panelRect(14, 24, 96, 96) + `<g data-fig="ref">${figureMarkup(reference, 62, 72, scale)}</g>`;
    body += rotationIcon(141, 70);
    options.forEach((fig, i) => {
      const x = 172 + i * 104;
      body += panelRect(x, 24, 96, 96) + `<g data-fig="${LABELS[i]}">${figureMarkup(fig, x + 48, 72, scale)}</g>`;
      body += text(x + 48, 140, LABELS[i]);
    });

    const markWords = level >= 3 ? " with a small mark inside it" : "";
    return makeQuestion({
      topic: "NVRT Rotation",
      template: "nvrtRotation",
      question: "Which figure is exactly the same as the figure on the left, but rotated?",
      answer,
      difficulty: level,
      image: baseSvg(700, 158, body),
      alt: `An irregular outline${markWords} on the left, and five copies A to E. Each copy has been turned, and all but one have also been flipped over.`,
      explain: "A rotation turns the whole figure but never flips it over. Pick one detail that is off to one side - a notch, a cut corner, the shaded half of the mark - and follow the outline clockwise from it in the original and in each option. If the detail comes round in a different order, that copy has been reflected. Check the small mark separately from the outline: sometimes only one of them has been flipped.",
      data: { reference: roundFigure(reference), options: options.map(roundFigure) }
    });
  }

  /* ═════════════════════════ PLAN VIEW ═════════════════════════
     Columns of cubes on a 4 x 3 grid, drawn in isometric view, and five flat
     grids. The right grid shades every square with any cube on it, however
     tall the column. A draw is rejected if any square cannot be read off the
     drawing - a column hidden behind a tower, or a gap where a cube could be
     hiding - because then the question has no fair answer. */

  const PLAN_COLS = 4;
  const PLAN_ROWS = 3;

  /* The three visible faces of one cube. Columns run down-right across the
     page; "back" runs up-right, away from the viewer; layers go up. */
  function cubeFaces(c, back, layer, edge) {
    const dx = (edge * Math.sqrt(3)) / 2, dy = edge / 2;
    const origin = [(c + back) * dx, (c - back) * dy - layer * edge];
    const along = [dx, dy], away = [dx, -dy], up = [0, -edge];
    const at = (...steps) => steps.reduce((p, v) => [p[0] + v[0], p[1] + v[1]], origin);
    return {
      top: [at(up), at(up, along), at(up, along, away), at(up, away)],
      front: [at(), at(along), at(along, up), at(up)],
      right: [at(along), at(along, away), at(along, away, up), at(along, up)]
    };
  }

  function insideConvex(p, quad) {
    let sign = 0;
    for (let i = 0; i < quad.length; i += 1) {
      const a = quad[i], b = quad[(i + 1) % quad.length];
      const cross = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
      if (Math.abs(cross) < 1e-9) return false;
      if (!sign) sign = Math.sign(cross);
      else if (Math.sign(cross) !== sign) return false;
    }
    return true;
  }

  /* The painter's order: nearer the viewer is drawn later. Cubes with the same
     depth never overlap in a true isometric view. */
  const cubeDepth = cube => cube.c - cube.back + cube.layer;

  /* How much of a square's top face can be seen: the face of the top cube of
     an occupied column, or of an imagined single cube on an empty square. The
     sample points avoid the lattice lines every cube edge lies on. */
  function topVisibility(heights, row, col, drawn, edge) {
    const back = PLAN_ROWS - 1 - row;
    const layer = Math.max(heights[row][col], 1) - 1;
    const depth = cubeDepth({ c: col, back, layer });
    const face = cubeFaces(col, back, layer, edge).top;
    const along = [face[1][0] - face[0][0], face[1][1] - face[0][1]];
    const away = [face[3][0] - face[0][0], face[3][1] - face[0][1]];
    const nearer = drawn.filter(d => d.depth > depth);
    const steps = [0.2, 0.45, 0.7];
    let seen = 0;
    steps.forEach(u => steps.forEach(v => {
      const p = [face[0][0] + u * along[0] + v * away[0], face[0][1] + u * along[1] + v * away[1]];
      const covered = nearer.some(d =>
        p[0] > d.box[0] && p[0] < d.box[2] && p[1] > d.box[1] && p[1] < d.box[3] &&
        (insideConvex(p, d.faces.top) || insideConvex(p, d.faces.front) || insideConvex(p, d.faces.right)));
      if (!covered) seen += 1;
    }));
    return seen / 9;
  }

  /* A cube's faces with the box around them, so most sample points can be
     ruled out without the full point-in-face test. */
  function drawnCube(cube, edge) {
    const faces = cubeFaces(cube.c, cube.back, cube.layer, edge);
    const pts = [...faces.top, ...faces.front, ...faces.right];
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    return { depth: cubeDepth(cube), faces, box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] };
  }

  function buildPlanView(seed, rng) {
    const level = levelFor(seed);
    const spec = { 2: [6, 8, 2], 3: [7, 9, 3], 4: [8, 10, 4] }[level];
    const count = spec[0] + rng.int(spec[1] - spec[0] + 1);
    const heights = Array.from({ length: PLAN_ROWS }, () => Array(PLAN_COLS).fill(0));
    const squares = [];
    for (let row = 0; row < PLAN_ROWS; row += 1) for (let col = 0; col < PLAN_COLS; col += 1) squares.push([row, col]);
    /* Tall columns stand towards the back left, away from the viewer, the way
       a real stack is built to be seen: a tower at the front hides whatever is
       behind it and the draw would be thrown away. "Nearness" runs from 0 at
       the back left corner to 5 at the front right. */
    const nearness = (row, col) => col + row;
    const occupied = rng.shuffle(squares).slice(0, count);
    occupied.forEach(([row, col]) => {
      const cap = Math.max(1, spec[2] - Math.floor((nearness(row, col) * spec[2]) / 6) + rng.int(2));
      heights[row][col] = 1 + rng.int(Math.min(cap, spec[2]));
    });
    /* Make sure the tall columns the level promises are there. */
    const towers = level === 4 ? 2 : 1;
    occupied.slice().sort((a, b) => nearness(...a) - nearness(...b)).slice(0, towers)
      .forEach(([row, col], i) => { heights[row][col] = spec[2] - i; });

    const edge = 22;
    const stackOf = () => {
      const list = [];
      for (let row = 0; row < PLAN_ROWS; row += 1) {
        for (let col = 0; col < PLAN_COLS; col += 1) {
          for (let layer = 0; layer < heights[row][col]; layer += 1) list.push({ c: col, back: PLAN_ROWS - 1 - row, layer });
        }
      }
      return list;
    };

    /* Every square must be readable. When one is hidden, shorten the tallest
       column standing in front of it and look again, rather than throwing the
       whole stack away. */
    let cubes = stackOf();
    let visibility = null;
    for (let repair = 0; repair < 12 && !visibility; repair += 1) {
      const drawn = cubes.map(cube => drawnCube(cube, edge));
      const seenBy = [];
      let hidden = null;
      for (const [row, col] of squares) {
        const seen = topVisibility(heights, row, col, drawn, edge);
        if (seen < 0.5) { hidden = [row, col]; break; }
        seenBy.push(seen);
      }
      if (!hidden) { visibility = seenBy; break; }
      const [row, col] = hidden;
      const front = [[row, col + 1], [row + 1, col], [row + 1, col + 1]]
        .filter(([r, c]) => r < PLAN_ROWS && c < PLAN_COLS && heights[r][c] > 1)
        .sort((a, b) => heights[b[0]][b[1]] - heights[a[0]][a[1]]);
      if (!front.length) return null;
      heights[front[0][0]][front[0][1]] -= 1;
      cubes = stackOf();
    }
    if (!visibility) return null;
    const tallest = heights.flat().sort((a, b) => b - a);
    if (tallest[0] < spec[2] || (level === 4 && tallest[1] < 3)) return null;

    const correct = heights.map(row => row.map(h => (h > 0 ? 1 : 0)));
    const flip = (grid, picks) => grid.map((row, r) => row.map((v, c) =>
      (picks.some(([pr, pc]) => pr === r && pc === c) ? 1 - v : v)));
    /* The tricky squares are the ones the drawing half hides. */
    const tricky = squares.map((square, i) => ({ square, score: 1 - visibility[i] + rng.next() * 0.35 }))
      .sort((a, b) => b.score - a.score).map(t => t.square);
    const singles = tricky.map(square => flip(correct, [square]));
    const doubles = [];
    for (let i = 0; i < 6; i += 1) for (let j = i + 1; j < 6; j += 1) doubles.push(flip(correct, [tricky[i], tricky[j]]));
    const shuffledDoubles = rng.shuffle(doubles);
    const pool = level === 4 ? singles
      : level === 3 ? [singles[0], singles[1], ...shuffledDoubles, ...singles.slice(2)]
        : [...shuffledDoubles, ...singles];
    const key = grid => grid.map(row => row.join("")).join("/");
    const seen = new Set([key(correct)]);
    const distractors = [];
    pool.forEach(grid => {
      if (distractors.length < 4 && !seen.has(key(grid))) { seen.add(key(grid)); distractors.push(grid); }
    });
    if (distractors.length < 4) return null;
    const { answer, options } = placeAnswer(rng, correct, distractors);

    /* Draw the stack centred in the left-hand area. */
    cubes.sort((a, b) => cubeDepth(a) - cubeDepth(b) || a.layer - b.layer);
    const faces = cubes.map(cube => cubeFaces(cube.c, cube.back, cube.layer, edge));
    const allPoints = faces.flatMap(f => [...f.top, ...f.front, ...f.right]);
    const minX = Math.min(...allPoints.map(p => p[0])), maxX = Math.max(...allPoints.map(p => p[0]));
    const minY = Math.min(...allPoints.map(p => p[1])), maxY = Math.max(...allPoints.map(p => p[1]));
    const shiftX = 104 - (minX + maxX) / 2, shiftY = 100 - (minY + maxY) / 2;
    const poly = (pts, fill, extra = "") =>
      `<polygon points="${pts.map(([x, y]) => `${num(x + shiftX)},${num(y + shiftY)}`).join(" ")}" fill="${fill}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"${extra}/>`;
    let body = `<g data-fig="stack">${faces.map(f =>
      poly(f.front, "#ffffff") + poly(f.right, "#ffffff") + poly(f.top, CUBE_TOP, ` data-face="top"`)).join("")}</g>`;

    const cell = 15;
    options.forEach((grid, i) => {
      const x = 214 + i * 88, y = 67;
      body += panelRect(x, y, 80, 66);
      let cells = "";
      grid.forEach((row, r) => row.forEach((v, c) => {
        cells += `<rect x="${x + 10 + c * cell}" y="${y + 10.5 + r * cell}" width="${cell}" height="${cell}" fill="${v ? SHADE : "#ffffff"}" stroke="${INK}" stroke-width="1.2" data-cell="${v}"/>`;
      }));
      body += `<g data-fig="${LABELS[i]}">${cells}</g>` + text(x + 40, y + 86, LABELS[i]);
    });

    const rowNames = ["back", "middle", "front"];
    const heightText = heights.map(row => row.join(", ")).join("; ");
    const shaded = correct.map((row, r) => {
      const at = row.map((v, c) => (v ? ORDINALS[c] : null)).filter(Boolean);
      return `${rowNames[r]} row ${at.length ? listWords(at) : "none"}`;
    }).join("; ");
    return makeQuestion({
      topic: "NVRT Plan View",
      template: "nvrtPlanView",
      question: "Which figure shows what the 3D figure looks like when viewed from directly above?",
      answer,
      difficulty: level,
      image: baseSvg(660, 200, body),
      alt: `A 3D figure of cubes standing on a grid 4 squares wide and 3 deep. Column heights, back row first, left to right: ${heightText}. Five flat 4 by 3 grids, A to E, show squares shaded or white.`,
      explain: `From directly above you see one square for every column of cubes, however tall it is, and nothing where there are no cubes. In each grid the top row is the back of the figure - the row along the upper right edge of the drawing - and the left-hand column is the one along the upper left edge. Work along the back row first, then the middle, then the front, and decide for each position whether any cube stands there. Watch the squares tucked behind a tall column. Here the shaded squares are: ${shaded}.`,
      data: { heights, options }
    });
  }

  /* ═════════════════════════ SHAPE ARITHMETIC ═════════════════════════
     A shape, then pieces joined on or cut out along lettered edges. A white
     piece is added outside the shape, a grey one is cut away from inside it;
     each piece is drawn turned, and the child must turn it back so its
     lettered edge lies along the edge with the same letter.

     Shapes live on a grid of quarter-cells - each square split by both
     diagonals into four triangles - so a 45-degree edge is as exact as a
     square one and adding or cutting is plain set arithmetic. A quarter is
     (c, r, q) with q = 0 top, 1 right, 2 bottom, 3 left, packed into one
     integer: splitting "c,r,q" strings took over half the generation time.
     figureData spells them out as "c,r,q" for the tests. */

  const qKey = (c, r, q) => ((c + 64) * 128 + (r + 64)) * 4 + q;
  const parseQ = key => [(key >> 9) - 64, ((key >> 2) & 127) - 64, key & 3];
  const listQ = shape => [...shape].map(key => parseQ(key).join(",")).sort();
  const SIDE_NEIGHBOUR = [[0, -1, 2], [1, 0, 3], [0, 1, 0], [-1, 0, 1]];
  const OUTWARD = [[0, -1], [1, 0], [0, 1], [-1, 0]];

  function shapeFrom(spec) {
    const shape = new Set();
    spec.forEach(([c, r, quarters]) => (quarters || [0, 1, 2, 3]).forEach(q => shape.add(qKey(c, r, q))));
    return shape;
  }
  const keyC = key => (key >> 9) - 64;
  const keyR = key => ((key >> 2) & 127) - 64;
  const mapShape = (shape, fn) => new Set([...shape].map(key => fn(...parseQ(key))));
  /* A quarter turn clockwise on screen, matching (x, y) -> (-y, x) for points. */
  const turnOnce = shape => {
    const out = new Set();
    shape.forEach(key => out.add(qKey(-keyR(key) - 1, keyC(key), ((key % 4) + 1) % 4)));
    return out;
  };
  const turnShape = (shape, turns) => {
    let out = shape;
    for (let t = 0; t < ((turns % 4) + 4) % 4; t += 1) out = turnOnce(out);
    return out;
  };
  const mirrorShape = shape => mapShape(shape, (c, r, q) => qKey(-c - 1, r, q === 1 ? 3 : q === 3 ? 1 : q));
  function shapeBounds(shape) {
    let minC = Infinity, minR = Infinity, maxC = -Infinity, maxR = -Infinity;
    shape.forEach(key => {
      const c = keyC(key), r = keyR(key);
      if (c < minC) minC = c;
      if (c > maxC) maxC = c;
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
    });
    return { minC, minR, maxC, maxR };
  }
  /* Moving a packed shape is one subtraction per key. */
  const normaliseShape = shape => {
    const b = shapeBounds(shape);
    const shift = (b.minC * 128 + b.minR) * 4;
    return new Set([...shape].map(key => key - shift));
  };
  const shapeKey = shape => [...normaliseShape(shape)].sort((a, b) => a - b).join(";");
  const turnFreeKey = shape => {
    const keys = [];
    let turned = shape;
    for (let t = 0; t < 4; t += 1) {
      keys.push(shapeKey(turned));
      turned = turnOnce(turned);
    }
    return keys.sort()[0];
  };
  const union = (...shapes) => new Set(shapes.flatMap(s => [...s]));
  const minus = (a, b) => new Set([...a].filter(key => !b.has(key)));
  const overlaps = (a, b) => [...a].some(key => b.has(key));
  const within = (a, b) => [...a].every(key => b.has(key));

  function shapeConnected(shape) {
    if (!shape.size) return false;
    const start = shape.values().next().value;
    const seen = new Set([start]);
    const queue = [start];
    while (queue.length) {
      const [c, r, q] = parseQ(queue.pop());
      const [dc, dr, nq] = SIDE_NEIGHBOUR[q];
      [qKey(c + dc, r + dr, nq), qKey(c, r, (q + 1) % 4), qKey(c, r, (q + 3) % 4)].forEach(n => {
        if (shape.has(n) && !seen.has(n)) { seen.add(n); queue.push(n); }
      });
    }
    return seen.size === shape.size;
  }

  /* A gap enclosed by the shape - a triangle left behind where a flipped
     piece only half meets the edge. It draws as a shape with a hole in it,
     which gives a wrong answer away at a glance. */
  function shapeHasHole(shape) {
    const b = shapeBounds(shape);
    const inBox = (c, r) => c >= b.minC - 1 && c <= b.maxC + 1 && r >= b.minR - 1 && r <= b.maxR + 1;
    const start = qKey(b.minC - 1, b.minR - 1, 0);
    const seen = new Set([start]);
    const queue = [start];
    while (queue.length) {
      const [c, r, q] = parseQ(queue.pop());
      const [dc, dr, nq] = SIDE_NEIGHBOUR[q];
      [[c + dc, r + dr, nq], [c, r, (q + 1) % 4], [c, r, (q + 3) % 4]].forEach(([nc, nr, nqq]) => {
        const k = qKey(nc, nr, nqq);
        if (inBox(nc, nr) && !shape.has(k) && !seen.has(k)) { seen.add(k); queue.push(k); }
      });
    }
    const empty = (b.maxC - b.minC + 3) * (b.maxR - b.minR + 3) * 4 - shape.size;
    return seen.size !== empty;
  }

  /* The cell side of each quarter, clockwise, and the cell centre it points at. */
  function quarterPoints(c, r, q) {
    const corners = [[c, r], [c + 1, r], [c + 1, r + 1], [c, r + 1]];
    return [corners[q], corners[(q + 1) % 4], [c + 0.5, r + 0.5]];
  }

  function outlineSegments(shape) {
    const segments = [];
    shape.forEach(key => {
      const [c, r, q] = parseQ(key);
      const [a, b, centre] = quarterPoints(c, r, q);
      const [dc, dr, nq] = SIDE_NEIGHBOUR[q];
      if (!shape.has(qKey(c + dc, r + dr, nq))) segments.push([a, b]);
      if (!shape.has(qKey(c, r, (q + 1) % 4))) segments.push([b, centre]);
      if (!shape.has(qKey(c, r, (q + 3) % 4))) segments.push([centre, a]);
    });
    return segments;
  }

  function shapeMarkup(shape, ox, oy, unit, fill) {
    const X = x => num(ox + x * unit), Y = y => num(oy + y * unit);
    const byCell = new Map();
    shape.forEach(key => {
      const [c, r, q] = parseQ(key);
      const k = cellKey(c, r);
      if (!byCell.has(k)) byCell.set(k, []);
      byCell.get(k).push(q);
    });
    /* A hairline in the fill colour hides the seams between touching pieces. */
    let body = "";
    byCell.forEach((quarters, k) => {
      const [c, r] = parseCell(k);
      if (quarters.length === 4) {
        body += `<rect x="${X(c)}" y="${Y(r)}" width="${unit}" height="${unit}" fill="${fill}" stroke="${fill}" stroke-width="0.8"/>`;
      } else {
        quarters.forEach(q => {
          body += `<polygon points="${quarterPoints(c, r, q).map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="${fill}" stroke="${fill}" stroke-width="0.8"/>`;
        });
      }
    });
    const path = outlineSegments(shape).map(([a, b]) => `M${X(a[0])} ${Y(a[1])}L${X(b[0])} ${Y(b[1])}`).join("");
    return body + `<path d="${path}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
  }

  /* Straight stretches of outline along cell sides, `len` units long. A run
     starts at p and goes len units along d, with n pointing out of the shape;
     d is always n turned a quarter anticlockwise, so placing a piece on a run
     is a pure rotation and never a reflection. */
  function boundaryRuns(shape, len) {
    const sides = new Map();
    shape.forEach(key => {
      const [c, r, q] = parseQ(key);
      const [dc, dr, nq] = SIDE_NEIGHBOUR[q];
      if (shape.has(qKey(c + dc, r + dr, nq))) return;
      const line = q === 0 ? r : q === 2 ? r + 1 : q === 1 ? c + 1 : c;
      const group = `${q}|${line}`;
      if (!sides.has(group)) sides.set(group, new Set());
      sides.get(group).add(q % 2 === 0 ? c : r);
    });
    const runs = [];
    sides.forEach((alongs, group) => {
      const [q, line] = group.split("|").map(Number);
      const n = OUTWARD[q];
      const d = [n[1], -n[0]];
      alongs.forEach(a => {
        for (let i = 0; i < len; i += 1) if (!alongs.has(a + i)) return;
        const start = d[0] + d[1] > 0 ? a : a + len;
        runs.push({ p: q % 2 === 0 ? [start, line] : [line, start], d, n, len });
      });
    });
    return runs;
  }

  /* A piece is designed in its run's own frame: the run lies from (0,0) to
     (len,0), +y is outside the shape. Added pieces sit at y >= 0 with exactly
     the cells 0..len-1 touching the run; cut pieces sit at y < 0. */
  const TURN_OF = d => (d[0] === 1 ? 0 : d[1] === 1 ? 1 : d[0] === -1 ? 2 : 3);
  function placeOnRun(frameShape, run) {
    const turn = TURN_OF(run.d);
    const at = (x, y) => [run.p[0] + x * run.d[0] + y * run.n[0], run.p[1] + x * run.d[1] + y * run.n[1]];
    return mapShape(frameShape, (i, j, q) => {
      const a = at(i, j), b = at(i + 1, j + 1);
      return qKey(Math.min(a[0], b[0]), Math.min(a[1], b[1]), (q + turn) % 4);
    });
  }
  const outsideStrip = run => placeOnRun(shapeFrom(Array.from({ length: run.len }, (_, i) => [i, 0])), run);
  const insideStrip = run => placeOnRun(shapeFrom(Array.from({ length: run.len }, (_, i) => [i, -1])), run);
  const flipAlongRun = (frame, len) => mapShape(frame, (i, j, q) => qKey(len - 1 - i, j, q === 1 ? 3 : q === 3 ? 1 : q));
  const flipAcrossRun = frame => mapShape(frame, (i, j, q) => qKey(i, -1 - j, q === 0 ? 2 : q === 2 ? 0 : q));
  const sameRun = (a, b) => a.p[0] === b.p[0] && a.p[1] === b.p[1] && a.d[0] === b.d[0] && a.d[1] === b.d[1];

  const ADD_PIECES = {
    1: {
      square: [[[0, 0]], [[0, 0], [0, 1]], [[0, 0], [0, 1], [1, 1]], [[0, 0], [0, 1], [-1, 1]]],
      slanted: [[[0, 0, [0, 1]]], [[0, 0, [0, 3]]], [[0, 0], [0, 1, [0, 1]]], [[0, 0], [0, 1, [0, 3]]]]
    },
    2: {
      square: [[[0, 0], [1, 0]], [[0, 0], [1, 0], [0, 1]], [[0, 0], [1, 0], [1, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]]],
      slanted: [[[0, 0, [0, 1]], [1, 0, [0, 3]]], [[0, 0], [1, 0, [0, 3]]], [[0, 0, [0, 1]], [1, 0]], [[0, 0], [1, 0], [0, 1, [0, 1]]]]
    }
  };
  const CUT_PIECES = {
    1: { square: [[[0, -1]], [[0, -1], [0, -2]]], slanted: [[[0, -1, [2, 1]]], [[0, -1, [2, 3]]]] },
    2: {
      square: [[[0, -1], [1, -1]], [[0, -1], [1, -1], [0, -2]], [[0, -1], [1, -1], [1, -2]]],
      slanted: [[[0, -1, [2, 1]], [1, -1, [2, 3]]], [[0, -1], [1, -1, [2, 3]]]]
    }
  };

  /* Cut half of one corner square away, leaving a 45-degree edge. */
  function slantCorner(base, rng) {
    const corners = [];
    base.forEach(key => {
      const [c, r, q] = parseQ(key);
      const open = side => {
        const [dc, dr, nq] = SIDE_NEIGHBOUR[side];
        return base.has(qKey(c, r, side)) && !base.has(qKey(c + dc, r + dr, nq));
      };
      if (q === 0) [0, 1, 2, 3].forEach(s => { if (open(s) && open((s + 1) % 4)) corners.push([c, r, s]); });
    });
    if (!corners.length) return base;
    const [c, r, s] = rng.pick(corners);
    const cut = minus(base, new Set([qKey(c, r, s), qKey(c, r, (s + 1) % 4)]));
    return shapeConnected(cut) ? cut : base;
  }

  function composeShape(base, placed) {
    const adds = placed.filter(p => p.op === "add").map(p => p.world);
    const cuts = placed.filter(p => p.op === "cut").map(p => p.world);
    return minus(union(base, ...adds), union(new Set(), ...cuts));
  }

  function fitsSix(shape) {
    const b = shapeBounds(shape);
    return b.maxC - b.minC < 6 && b.maxR - b.minR < 6;
  }

  /* What is already placed, gathered once rather than on every try. */
  function placedSoFar(placed) {
    const of = op => union(new Set(), ...placed.filter(p => p.op === op).map(p => p.world));
    return {
      added: of("add"),
      cut: of("cut"),
      outsides: union(new Set(), ...placed.map(p => p.outside)),
      insides: union(new Set(), ...placed.map(p => p.inside))
    };
  }

  /* The base's edges of each length, with the strips either side worked out
     once per question rather than on every try. */
  function runsWithStrips(base) {
    const runs = {};
    [1, 2].forEach(len => {
      runs[len] = boundaryRuns(base, len).map(run => ({ ...run, outside: outsideStrip(run), inside: insideStrip(run) }));
    });
    return runs;
  }

  function tryPlacePiece(rng, level, op, base, runsByLen, so) {
    const len = rng.pick(level === 2 ? [1, 2] : [1, 1, 2]);
    const family = (op === "add" ? ADD_PIECES : CUT_PIECES)[len];
    const slantedAllowed = op === "add" ? level >= 3 : level === 4;
    const frame = shapeFrom(rng.pick(slantedAllowed ? [...family.square, ...family.slanted] : family.square));
    const taken = union(so.outsides, so.insides);
    const runs = runsByLen[len].filter(run => !overlaps(run.outside, taken) && !overlaps(run.inside, taken));
    if (!runs.length) return null;
    const run = rng.pick(runs);
    const world = placeOnRun(frame, run);
    const { outside, inside } = run;
    if (op === "add") {
      if (overlaps(world, base) || overlaps(world, so.added) || overlaps(world, so.outsides)) return null;
      if (overlaps(inside, so.cut)) return null;
    } else {
      if (!within(world, base) || overlaps(world, so.cut) || overlaps(world, so.insides)) return null;
      if (overlaps(outside, so.added)) return null;
    }
    return { op, frame, run, world, outside, inside };
  }

  /* A labelled edge: a dashed bracket just outside it, ticks at its ends, and
     the letter beyond. a and b are the ends; n points away from the shape. */
  function edgeLabel(a, b, n, letter, ox, oy, unit) {
    const X = (p, k) => num(ox + p[0] * unit + n[0] * k), Y = (p, k) => num(oy + p[1] * unit + n[1] * k);
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    return `<path d="M${X(a, 2)} ${Y(a, 2)}L${X(a, 7)} ${Y(a, 7)}L${X(b, 7)} ${Y(b, 7)}L${X(b, 2)} ${Y(b, 2)}" fill="none" stroke="${ACCENT}" stroke-width="1.3" stroke-dasharray="3 2"/>` +
      `<text x="${X(mid, 15)}" y="${num(Y(mid, 15) + 4.5)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-style="italic" font-weight="700" fill="${ACCENT}">${letter}</text>`;
  }

  /* Draw a shape centred in a box, returning the offset used so labels can
     be placed in the same coordinates. */
  function centredShape(shape, x, y, w, h, unit, fill) {
    const b = shapeBounds(shape);
    const ox = x + w / 2 - ((b.minC + b.maxC + 1) / 2) * unit;
    const oy = y + h / 2 - ((b.minR + b.maxR + 1) / 2) * unit;
    return { markup: shapeMarkup(shape, ox, oy, unit, fill), ox, oy };
  }

  const turnVector = ([x, y], turns) => {
    let v = [x, y];
    for (let t = 0; t < turns; t += 1) v = [-v[1], v[0]];
    return v;
  };

  function buildShapeArithmetic(seed, rng) {
    const level = levelFor(seed);
    const baseCells = growPolyomino(rng, 5 + rng.int(4), 4, 4);
    if (!baseCells || !polyominoOutline(baseCells)) return null;
    let base = shapeFrom([...baseCells].map(parseCell));
    if (level >= 3 && rng.next() < 0.5) base = slantCorner(base, rng);

    const opsByLevel = {
      2: [["add"], ["add", "cut"], ["cut", "add"], ["add", "add"]],
      3: [["add", "cut"], ["cut", "add"], ["add", "add"]],
      4: [["add", "cut", "add"], ["cut", "add", "add"], ["add", "add", "cut"], ["add", "cut", "cut"]]
    };
    const ops = rng.pick(opsByLevel[level]);
    const placed = [];
    const runsByLen = runsWithStrips(base);
    for (const op of ops) {
      let piece = null;
      const so = placedSoFar(placed);
      for (let tries = 0; tries < 25 && !piece; tries += 1) piece = tryPlacePiece(rng, level, op, base, runsByLen, so);
      if (!piece) return null;
      placed.push(piece);
    }
    const result = composeShape(base, placed);
    if (!shapeConnected(result) || shapeHasHole(result) || !fitsSix(result) || minus(base, result).size === base.size) return null;
    if (placed.some(p => p.op === "cut") && !shapeConnected(minus(base, union(...placed.filter(p => p.op === "cut").map(p => p.world))))) return null;

    /* Wrong answers, each one mistake a child makes. Kept as recipes and only
       built when reached: four are needed, and building all of them up front
       was most of the time this family took. */
    const swap = (index, world, op = placed[index].op) =>
      composeShape(base, placed.map((p, i) => (i === index ? { ...p, op, world } : p)));
    const variants = [];
    placed.forEach((p, i) => {
      variants.push(() => swap(i, placeOnRun(flipAlongRun(p.frame, p.run.len), p.run)));     // piece flipped
      variants.push(() => composeShape(base, placed.filter((_, j) => j !== i)));             // piece left out
      if (p.op === "cut") variants.push(() => swap(i, placeOnRun(flipAcrossRun(p.frame), p.run), "add")); // added, not cut
      runsByLen[p.run.len].filter(run => !sameRun(run, p.run)).slice(0, 3).forEach(run => {
        variants.push(() => swap(i, placeOnRun(p.frame, run)));                               // wrong edge
      });
    });
    variants.push(() => mirrorShape(result));
    /* Spares, used only if the real mistakes collapse into duplicates: one
       square more or one fewer than the right answer. */
    const spares = [];
    rng.shuffle([...result]).slice(0, 6).forEach(key => {
      const [c, r] = parseQ(key);
      const [dc, dr] = rng.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
      spares.push(() => minus(result, shapeFrom([[c, r]])));
      spares.push(() => union(result, shapeFrom([[c + dc, r + dr]])));
    });
    const seen = new Set([turnFreeKey(result)]);
    const wrong = [];
    [...rng.shuffle(variants), ...spares].forEach(recipe => {
      if (wrong.length >= 4) return;
      const shape = recipe();
      if (!shape.size || !shapeConnected(shape) || shapeHasHole(shape) || !fitsSix(shape)) return;
      const key = turnFreeKey(shape);
      if (seen.has(key)) return;
      seen.add(key);
      wrong.push(shape);
    });
    if (wrong.length < 4) return null;

    const turned = level === 4;
    const show = shape => normaliseShape(turned ? turnShape(shape, 1 + rng.int(3)) : shape);
    const { answer, options } = placeAnswer(rng, show(result), wrong.map(show));

    /* Top row: base, then each piece with its sign, then = and the ? box. */
    const unit = 15;
    const shownBase = normaliseShape(base);
    const baseBounds = shapeBounds(base);
    const toBase = ([x, y]) => [x - baseBounds.minC, y - baseBounds.minR];
    const letters = ["x", "y", "z"];
    let body = panelRect(12, 14, 116, 116);
    const drawnBase = centredShape(shownBase, 12, 14, 116, 116, unit, "#ffffff");
    body += `<g data-fig="base">${drawnBase.markup}</g>`;
    const baseLabels = [];
    const pieceData = [];
    placed.forEach((p, i) => {
      const a = toBase(p.run.p);
      const b = [a[0] + p.run.d[0] * p.run.len, a[1] + p.run.d[1] * p.run.len];
      body += edgeLabel(a, b, p.run.n, letters[i], drawnBase.ox, drawnBase.oy, unit);
      baseLabels.push({ letter: letters[i], a, b });
    });
    let x = 138;
    placed.forEach((p, i) => {
      body += text(x + 9, 81, p.op === "add" ? "+" : "−", 26);
      x += 22;
      const turns = level === 2 ? rng.int(4) : 1 + rng.int(3);
      const turnedFrame = turnShape(p.frame, turns);
      const fb = shapeBounds(turnedFrame);
      const ends = [[0, 0], [p.run.len, 0]].map(pt => {
        const v = turnVector(pt, turns);
        return [v[0] - fb.minC, v[1] - fb.minR];
      });
      const outward = turnVector(p.op === "add" ? [0, -1] : [0, 1], turns);
      const shown = normaliseShape(turnedFrame);
      body += panelRect(x, 32, 80, 80);
      const drawn = centredShape(shown, x, 32, 80, 80, unit, p.op === "add" ? "#ffffff" : SHADE);
      body += `<g data-fig="piece-${letters[i]}">${drawn.markup}</g>`;
      body += edgeLabel(ends[0], ends[1], outward, letters[i], drawn.ox, drawn.oy, unit);
      pieceData.push({ letter: letters[i], op: p.op, shape: listQ(shown), a: ends[0], b: ends[1] });
      x += 90;
    });
    body += text(x + 9, 81, "=", 26);
    body += questionBox(x + 24, 32, 80, 80);
    const width = Math.max(640, x + 24 + 80 + 12);

    options.forEach((shape, i) => {
      const ox = 12 + i * 124;
      body += panelRect(ox, 150, 108, 108);
      body += `<g data-fig="${LABELS[i]}">${centredShape(shape, ox, 150, 108, 108, unit, "#ffffff").markup}</g>`;
      body += text(ox + 54, 276, LABELS[i]);
    });

    const pieceWords = placed.map((p, i) => `${p.op === "add" ? "a white piece added" : "a grey piece cut away"} at edge ${letters[i]}`);
    return makeQuestion({
      topic: "NVRT Shape Arithmetic",
      template: "nvrtShapeArithmetic",
      question: turned
        ? "Which figure shows the shape after the white pieces are added and the grey pieces are cut away? The answer may have been turned round."
        : "Which figure shows the shape after the white pieces are added and the grey pieces are cut away?",
      answer,
      difficulty: level,
      image: baseSvg(width, 290, body),
      alt: `A shape with lettered edges, then ${listWords(pieceWords)}. Five resulting shapes, A to E.`,
      explain: "Match each piece's letter to the same letter on the large shape. Turn the piece - never flip it - until its lettered edge lies exactly along that edge: a white piece sits outside the shape and is joined on, a grey piece sits inside and is cut out. Do one piece at a time, then trace the outline of what is left." +
        (turned ? " The finished shape has also been turned round, so compare outlines, not positions." : ""),
      data: { base: listQ(shownBase), baseLabels, pieces: pieceData, turned, options: options.map(listQ) }
    });
  }

  /* ═════════════════════════ COUNT THE SQUARES ═════════════════════════
     A shape drawn on a grid. Count every square of every size whose sides are
     all drawn. The wrong answers are the usual slips: only the small squares,
     forgetting the largest size, forgetting the 2 x 2s, one out. */

  function maskConnected(mask) {
    const cells = [];
    mask.forEach((row, r) => row.forEach((v, c) => { if (v) cells.push(cellKey(c, r)); }));
    const set = new Set(cells);
    const seen = new Set([cells[0]]);
    const queue = [cells[0]];
    while (queue.length) {
      const [c, r] = parseCell(queue.pop());
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dc, dr]) => {
        const k = cellKey(c + dc, r + dr);
        if (set.has(k) && !seen.has(k)) { seen.add(k); queue.push(k); }
      });
    }
    return seen.size === set.size;
  }

  /* Every empty square reaches the edge, so the shape has no holes - a hole
     would draw a square outline around nothing and make the count arguable. */
  function maskHasNoHoles(mask) {
    const rows = mask.length + 2, cols = mask[0].length + 2;
    const filled = (c, r) => r >= 1 && c >= 1 && r <= mask.length && c <= mask[0].length && mask[r - 1][c - 1];
    const seen = new Set([cellKey(0, 0)]);
    const queue = [[0, 0]];
    while (queue.length) {
      const [c, r] = queue.pop();
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dc, dr]) => {
        const nc = c + dc, nr = r + dr;
        if (nc < 0 || nr < 0 || nc >= cols || nr >= rows || filled(nc, nr) || seen.has(cellKey(nc, nr))) return;
        seen.add(cellKey(nc, nr));
        queue.push([nc, nr]);
      });
    }
    let empty = 0;
    for (let r = 0; r < rows; r += 1) for (let c = 0; c < cols; c += 1) if (!filled(c, r)) empty += 1;
    return seen.size === empty;
  }

  function buildCountSquares(seed, rng) {
    const level = levelFor(seed);
    const [w, h] = level === 2 ? [3 + rng.int(2), 4] : level === 3 ? [5, 4 + rng.int(2)] : [6, 5 + rng.int(2)];
    const mask = Array.from({ length: h }, () => Array(w).fill(true));
    const style = rng.pick(["stairs", "blocks", "mixed"]);
    const corners = [[0, 0, 1, 1], [w - 1, 0, -1, 1], [0, h - 1, 1, -1], [w - 1, h - 1, -1, -1]];
    corners.forEach(([c0, r0, sc, sr], i) => {
      const stairs = style === "stairs" || (style === "mixed" && i % 2 === 0);
      if (stairs) {
        const depth = rng.int(level === 2 ? 2 : 3);
        for (let dc = 0; dc < depth; dc += 1) for (let dr = 0; dr < depth - dc; dr += 1) mask[r0 + dr * sr][c0 + dc * sc] = false;
      } else {
        const bw = rng.int(3), bh = bw ? 1 + rng.int(2) : 0;
        for (let dc = 0; dc < bw; dc += 1) for (let dr = 0; dr < bh; dr += 1) mask[r0 + dr * sr][c0 + dc * sc] = false;
      }
    });
    if (!maskConnected(mask) || !maskHasNoHoles(mask)) return null;

    const inMask = (c, r) => r >= 0 && c >= 0 && r < h && c < w && mask[r][c];
    const counts = [];
    for (let k = 1; k <= Math.min(w, h); k += 1) {
      let n = 0;
      for (let r = 0; r + k <= h; r += 1) {
        for (let c = 0; c + k <= w; c += 1) {
          let all = true;
          for (let dr = 0; dr < k && all; dr += 1) for (let dc = 0; dc < k && all; dc += 1) all = inMask(c + dc, r + dr);
          if (all) n += 1;
        }
      }
      if (!n) break;
      counts.push(n);
    }
    const total = counts.reduce((a, b) => a + b, 0);
    const largest = counts.length;
    if (largest < (level === 2 ? 2 : 3) || counts[0] < 8) return null;
    if (level === 4 && total < 30) return null;

    const candidates = [counts[0], total - counts[largest - 1], total - counts[1], total + 1, total - 1, total + counts[largest - 1], total + 2];
    const distractors = [];
    candidates.forEach(v => {
      if (distractors.length < 4 && v > 0 && v !== total && !distractors.includes(v)) distractors.push(v);
    });
    if (distractors.length < 4) return null;
    const { answer, options } = placeAnswer(rng, total, rng.shuffle(distractors));

    const unit = Math.min(24, Math.floor(144 / Math.max(w, h)));
    const ox = 112 - (w * unit) / 2, oy = 95 - (h * unit) / 2;
    const edges = new Set();
    let fill = "";
    mask.forEach((row, r) => row.forEach((v, c) => {
      if (!v) return;
      fill += `<rect x="${ox + c * unit}" y="${oy + r * unit}" width="${unit}" height="${unit}" fill="#ffffff"/>`;
      edges.add(`${c},${r},${c + 1},${r}`).add(`${c},${r + 1},${c + 1},${r + 1}`)
        .add(`${c},${r},${c},${r + 1}`).add(`${c + 1},${r},${c + 1},${r + 1}`);
    }));
    const lines = [...edges].map(e => {
      const [x1, y1, x2, y2] = e.split(",").map(Number);
      return `<line x1="${ox + x1 * unit}" y1="${oy + y1 * unit}" x2="${ox + x2 * unit}" y2="${oy + y2 * unit}" stroke="${INK}" stroke-width="2" stroke-linecap="square"/>`;
    }).join("");
    let body = `<g data-fig="grid">${fill}${lines}</g>`;
    options.forEach((value, i) => {
      const x = 250 + i * 80;
      body += `<g data-fig="${LABELS[i]}">${panelRect(x, 64, 64, 64)}${text(x + 32, 105, value, 24)}</g>`;
      body += text(x + 32, 150, LABELS[i], 13);
    });

    const rowWords = mask.map((row, r) => {
      const filled = row.map((v, c) => (v ? c + 1 : null)).filter(Boolean);
      return `row ${r + 1}: columns ${filled[0]} to ${filled[filled.length - 1]}`;
    }).join("; ");
    const sizeWords = counts.map((n, i) => `${n} of ${i + 1}×${i + 1}`);
    return makeQuestion({
      topic: "NVRT Count the Squares",
      template: "nvrtCountSquares",
      question: "How many squares of any size can be found in this diagram?",
      answer,
      difficulty: level,
      image: baseSvg(660, 190, body),
      alt: `A shape drawn on a grid of small squares, ${w} columns by ${h} rows. Squares present by row from the top: ${rowWords}. Options A to E: ${options.join(", ")}.`,
      explain: `Count one size at a time: every 1×1 square, then every 2×2, then 3×3 and upwards. A bigger square only counts if all the small squares inside it are part of the shape, so slide a frame of each size across the grid row by row. Here there are ${listWords(sizeWords)}, making ${total} in all.`,
      data: { width: w, height: h, unit, ox, oy, options }
    });
  }

  /* ═══════════════ DRIVER ═══════════════ */
  /* Seeds start well clear of questions-nvrt.js (0 to about 19,000). */
  const FAMILIES = [
    [buildRotation, 150, 30000],
    [buildPlanView, 120, 31000],
    [buildShapeArithmetic, 150, 32000],
    [buildCountSquares, 100, 33000]
  ];
  const made = [];
  FAMILIES.forEach(([build, count, firstSeed]) => {
    for (let i = 0; i < count; i += 1) {
      const question = generate(build, firstSeed + i);
      if (question) made.push(question);
    }
  });
  root.NVRT_QUESTIONS.push(...made);
})();
