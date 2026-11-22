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

  /* An irregular outline, with one or two corners cut at Hard and Super Hard
     and a small mark inside from Hard up, centred on the origin. Null if the
     draw looks the same mirrored - then a flipped copy would be a turn too.
     Shared with the "one is flipped" rule of Odd One Out. */
  function chiralFigure(rng, level) {
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
    if (isTurnOf(mirrorFigure(reference), reference)) return null;
    return { reference, cells, chamferAt, markCell, offset, centre };
  }

  function buildRotation(seed, rng) {
    const level = levelFor(seed);
    const drawn = chiralFigure(rng, level);
    if (!drawn) return null;
    const { reference, cells, chamferAt, markCell, offset, centre } = drawn;
    const mirrored = mirrorFigure(reference);

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

  /* ───────────────────────── plane geometry ───────────────────────── */

  const regularPolygon = (n, startDeg = -90) => Array.from({ length: n }, (_, k) => {
    const t = ((startDeg + (360 * k) / n) * Math.PI) / 180;
    return [Math.cos(t), Math.sin(t)];
  });

  /* Outline shapes for the figure-based rules, roughly unit radius. */
  const OUTLINES = {
    square: regularPolygon(4, -45),
    pentagon: regularPolygon(5),
    hexagon: regularPolygon(6),
    octagon: regularPolygon(8, -22.5),
    triangle: regularPolygon(3),
    circle: regularPolygon(28),
    house: [[-0.9, 0.9], [0.9, 0.9], [0.9, -0.15], [0, -0.95], [-0.9, -0.15]],
    arrow: [[-1, -0.4], [0.15, -0.4], [0.15, -0.9], [1, 0], [0.15, 0.9], [0.15, 0.4], [-1, 0.4]],
    lshape: [[-0.9, -0.95], [-0.15, -0.95], [-0.15, 0.2], [0.9, 0.2], [0.9, 0.95], [-0.9, 0.95]],
    trapezium: [[-1, 0.65], [1, 0.65], [0.55, -0.65], [-0.55, -0.65]],
    parallelogram: [[-1, 0.6], [0.35, 0.6], [1, -0.6], [-0.35, -0.6]],
    kite: [[0, -1], [0.65, -0.2], [0, 1], [-0.65, -0.2]]
  };

  const placePoints = (pts, scale, degrees = 0, dx = 0, dy = 0) =>
    pts.map(turnPoint(degrees)).map(([x, y]) => [dx + x * scale, dy + y * scale]);
  const pointsAttr = pts => pts.map(([x, y]) => `${num(x)},${num(y)}`).join(" ");

  function pointInPolygon([x, y], pts) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i, i += 1) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function distanceToSegment([px, py], [ax, ay], [bx, by]) {
    const dx = bx - ax, dy = by - ay;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  }
  const distanceToOutline = (p, pts) =>
    Math.min(...pts.map((a, i) => distanceToSegment(p, a, pts[(i + 1) % pts.length])));

  /* Do two segments meet at all, touching included? */
  function segmentsMeet(a, b, c, d) {
    const orient = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
    const onSegment = (p, q, r) => Math.min(p[0], r[0]) <= q[0] && q[0] <= Math.max(p[0], r[0]) &&
      Math.min(p[1], r[1]) <= q[1] && q[1] <= Math.max(p[1], r[1]);
    const o1 = orient(a, b, c), o2 = orient(a, b, d), o3 = orient(c, d, a), o4 = orient(c, d, b);
    if (o1 !== o2 && o3 !== o4) return true;
    return (o1 === 0 && onSegment(a, c, b)) || (o2 === 0 && onSegment(a, d, b)) ||
      (o3 === 0 && onSegment(c, a, d)) || (o4 === 0 && onSegment(c, b, d));
  }

  /* An arrow from (x1, y1) to (x2, y2) with one of three heads: a filled
     triangle, an outlined one, or two open strokes. */
  function arrowMarkup(x1, y1, x2, y2, head, size = 6) {
    const t = Math.atan2(y2 - y1, x2 - x1);
    const back = [x2 - size * 1.5 * Math.cos(t), y2 - size * 1.5 * Math.sin(t)];
    const side = [Math.cos(t + Math.PI / 2) * size, Math.sin(t + Math.PI / 2) * size];
    const left = [back[0] + side[0], back[1] + side[1]], right = [back[0] - side[0], back[1] - side[1]];
    const shaftEnd = head === "line" ? [x2, y2] : back;
    let svg = `<line x1="${num(x1)}" y1="${num(y1)}" x2="${num(shaftEnd[0])}" y2="${num(shaftEnd[1])}" stroke="${INK}" stroke-width="2"/>`;
    if (head === "line") {
      svg += `<polyline points="${pointsAttr([left, [x2, y2], right])}" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round" data-head="line"/>`;
    } else {
      svg += `<polygon points="${pointsAttr([[x2, y2], left, right])}" fill="${head === "solid" ? INK : "#ffffff"}" stroke="${INK}" stroke-width="1.5" data-head="${head}"/>`;
    }
    return svg;
  }

  /* ═════════════════════════ ODD ONE OUT: RULES ═════════════════════════
     Five figures, four of which share one hidden rule while everything else
     about them - outline, size, angle, contents - varies so that it cannot be
     the rule. Each rule is one the older Odd One Out generator never used:

       hatch     the direction the shading lines slope
       segments  how many straight pieces an open line is made of
       inside    which coloured circles sit inside the outline
       ends      rounded or straight ends on a long outline
       flipped   four are one drawing turned; the fifth is also flipped over

     Every rule is a property that can be read back off the drawing, which is
     how tests/nvrt-figures.js checks it. */

  const ODD_PANEL = { x: 20, step: 124, y: 16, size: 100 };

  function hatchPattern(id, angle, gap) {
    return `<defs><pattern id="${id}" patternUnits="userSpaceOnUse" width="${gap}" height="${gap}" patternTransform="rotate(${angle})">` +
      `<line x1="0" y1="${gap / 2}" x2="${gap}" y2="${gap / 2}" stroke="${INK}" stroke-width="1.4"/></pattern></defs>`;
  }

  const OUTLINE_POOL = ["square", "pentagon", "hexagon", "octagon", "triangle", "circle", "house", "arrow", "lshape", "trapezium", "parallelogram", "kite"];
  const ROOMY_POOL = ["square", "pentagon", "hexagon", "octagon", "circle", "house", "trapezium"];

  function oddHatch(rng, level) {
    const kinds = rng.shuffle(OUTLINE_POOL).slice(0, 5);
    const [common, odd] = rng.pick(level === 2 ? [[45, 135], [135, 45], [0, 90], [90, 0]] : [[45, 135], [135, 45], [30, 150], [150, 30]]);
    /* At Hard the spacing of the lines varies too, so "denser" is not a rule. */
    const gaps = level === 2 ? [6, 6, 6, 6, 6] : rng.shuffle([5, 5, 8, 8, rng.pick([5, 8])]);
    const figures = kinds.map((kind, i) => ({ kind, angle: i === 0 ? odd : common, gap: gaps[i], turn: rng.int(8) * 45, scale: 30 + rng.int(9) }));
    const slope = a => (a === 0 ? "level" : a === 90 ? "upright" : a < 90 ? "sloping down to the right" : "sloping up to the right");
    return {
      odd: figures[0],
      common: figures.slice(1),
      render: (f, cx, cy, i) => hatchPattern(`h${i}`, f.angle, f.gap) +
        `<polygon points="${pointsAttr(placePoints(OUTLINES[f.kind], f.scale, f.turn, cx, cy))}" fill="url(#h${i})" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`,
      note: `Here four figures are shaded with lines ${slope(common)}; in the odd one out the lines are ${slope(odd)}. The outlines are all different, so the outline cannot be the rule.`,
      describe: f => `a ${f.kind} shaded with lines ${slope(f.angle)}`
    };
  }

  function randomPolyline(rng, segments) {
    const dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const pts = [[0, 0]];
      let dir = rng.int(8);
      let ok = true;
      for (let s = 0; s < segments && ok; s += 1) {
        /* Every corner is a real turn, of 45 or 90 degrees. A sharper turn
           folds the line back on itself, and a hairpin reads as two lines. */
        if (s > 0) dir = (dir + rng.pick([1, 2, 6, 7])) % 8;
        const len = rng.pick([1, 1, 2]);
        const last = pts[pts.length - 1];
        const next = [last[0] + dirs[dir][0] * len, last[1] + dirs[dir][1] * len];
        for (let j = 0; j < pts.length - 2 && ok; j += 1) if (segmentsMeet(pts[j], pts[j + 1], last, next)) ok = false;
        if (pts.length >= 2) {
          /* A sharp 135-degree turn back must not lie along the last piece. */
          const prev = pts[pts.length - 2];
          const cross = (last[0] - prev[0]) * (next[1] - last[1]) - (last[1] - prev[1]) * (next[0] - last[0]);
          if (cross === 0) ok = false;
        }
        pts.push(next);
      }
      if (!ok) continue;
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
      if (Math.max(...xs) - Math.min(...xs) > 4 || Math.max(...ys) - Math.min(...ys) > 4) continue;
      return pts;
    }
    return null;
  }

  function oddSegments(rng, level) {
    const common = level === 4 ? 5 + rng.int(2) : 4 + rng.int(2);
    const odd = common + rng.pick([-1, 1]);
    const lines = [odd, common, common, common, common].map(n => randomPolyline(rng, n));
    if (lines.includes(null)) return null;
    const figures = lines.map(pts => ({ pts, dot: rng.int(pts.length) }));
    return {
      odd: figures[0],
      common: figures.slice(1),
      render: (f, cx, cy) => {
        const xs = f.pts.map(p => p[0]), ys = f.pts.map(p => p[1]);
        const scale = 66 / Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 2);
        const midX = (Math.min(...xs) + Math.max(...xs)) / 2, midY = (Math.min(...ys) + Math.max(...ys)) / 2;
        const at = ([x, y]) => [cx + (x - midX) * scale, cy + (y - midY) * scale];
        const dot = at(f.pts[f.dot]);
        return `<polyline points="${pointsAttr(f.pts.map(at))}" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>` +
          `<circle cx="${num(dot[0])}" cy="${num(dot[1])}" r="4.5" fill="${INK}"/>`;
      },
      note: `Here four of the lines are made of ${common} straight pieces and the odd one out has ${odd}. Count the pieces one at a time - every change of direction starts a new piece. The shapes the lines make and the position of the dot are only there to distract.`,
      describe: f => `an open line of ${f.pts.length - 1} straight pieces`
    };
  }

  /* Two black and two white circles placed around an outline so that a
     given number of each colour sits inside it. */
  /* The grid points clear of an outline, inside and out. An outline depends
     only on its shape and angle, so each is worked out once. */
  const spotCache = new Map();
  function spotsAround(kind, turn, outline) {
    const key = `${kind}|${turn}`;
    if (!spotCache.has(key)) {
      const spots = { in: [], out: [] };
      for (let x = -42; x <= 42; x += 6) {
        for (let y = -42; y <= 42; y += 6) {
          const p = [x, y];
          if (distanceToOutline(p, outline) < 9) continue;
          spots[pointInPolygon(p, outline) ? "in" : "out"].push(p);
        }
      }
      spotCache.set(key, spots);
    }
    return spotCache.get(key);
  }

  function placeDots(rng, spots, blackIn, whiteIn) {
    const r = 5;
    const want = [["ink", true], ["ink", false], ["white", true], ["white", false]];
    const counts = { "ink-true": blackIn, "ink-false": 2 - blackIn, "white-true": whiteIn, "white-false": 2 - whiteIn };
    const dots = [];
    for (const [fill, inside] of want) {
      for (let k = 0; k < counts[`${fill}-${inside}`]; k += 1) {
        const free = rng.shuffle(spots[inside ? "in" : "out"]).find(p => dots.every(d => Math.hypot(d.p[0] - p[0], d.p[1] - p[1]) >= 2 * r + 5));
        if (!free) return null;
        dots.push({ p: free, fill });
      }
    }
    return dots;
  }

  function oddInside(rng, level) {
    const signatures = [[1, 1], [2, 0], [0, 2], [1, 0], [0, 1], [2, 1], [1, 2], [0, 0], [2, 2]];
    const [common, odd] = (() => {
      const c = rng.pick(signatures);
      /* Super Hard keeps the number inside the same, so only the colours
         give the odd one away; Hard lets the number differ. */
      const options = signatures.filter(s => (s[0] !== c[0] || s[1] !== c[1]) &&
        (level === 4 ? s[0] + s[1] === c[0] + c[1] : s[0] + s[1] !== c[0] + c[1]));
      return [c, options.length ? rng.pick(options) : null];
    })();
    if (!odd) return null;
    const kinds = rng.shuffle(ROOMY_POOL).slice(0, 5);
    const figures = [];
    for (let i = 0; i < 5; i += 1) {
      const turn = rng.int(8) * 45;
      const outline = placePoints(OUTLINES[kinds[i]], 27, turn);
      const [b, w] = i === 0 ? odd : common;
      const dots = placeDots(rng, spotsAround(kinds[i], turn, outline), b, w);
      if (!dots) return null;
      const join = level === 4 ? rng.shuffle([0, 1, 2, 3]).slice(0, 2) : null;
      figures.push({ outline, dots, join });
    }
    const words = ([b, w]) => `${b} black and ${w} white circle${w === 1 ? "" : "s"} inside the outline`;
    return {
      odd: figures[0],
      common: figures.slice(1),
      render: (f, cx, cy) => {
        const at = ([x, y]) => [cx + x, cy + y];
        let svg = `<polygon points="${pointsAttr(f.outline.map(at))}" fill="#ffffff" stroke="${INK}" stroke-width="2" stroke-linejoin="round" data-part="outline"/>`;
        if (f.join) {
          const [a, b] = f.join.map(k => at(f.dots[k].p));
          svg += `<line x1="${num(a[0])}" y1="${num(a[1])}" x2="${num(b[0])}" y2="${num(b[1])}" stroke="${INK}" stroke-width="1.5"/>`;
        }
        return svg + f.dots.map(d => {
          const [x, y] = at(d.p);
          return `<circle cx="${num(x)}" cy="${num(y)}" r="5" fill="${FILLS[d.fill]}" stroke="${INK}" stroke-width="1.5"/>`;
        }).join("");
      },
      note: `Here four figures have ${words(common)}; the odd one out has ${words(odd)}. Every figure has two black and two white circles, so count each colour inside the outline separately.`,
      describe: () => "an outline with two black and two white circles in and around it"
    };
  }

  function stadium(length, width, rounded) {
    const half = length / 2, r = width / 2;
    if (!rounded) return [[-half, -r], [half, -r], [half, r], [-half, r]];
    const pts = [];
    for (let k = 0; k <= 10; k += 1) {
      const t = -Math.PI / 2 + (Math.PI * k) / 10;
      pts.push([half - r + r * Math.cos(t), r * Math.sin(t)]);
    }
    for (let k = 0; k <= 10; k += 1) {
      const t = Math.PI / 2 + (Math.PI * k) / 10;
      pts.push([-half + r + r * Math.cos(t), r * Math.sin(t)]);
    }
    return pts;
  }

  function oddEnds(rng, level) {
    const commonRound = rng.next() < 0.5;
    const heads = ["solid", "open", "line"];
    const figures = [0, 1, 2, 3, 4].map(i => ({
      rounded: i === 0 ? !commonRound : commonRound,
      turn: rng.int(8) * 45,
      order: rng.shuffle(["circle", "arrow", "block"]),
      head: level === 2 ? "solid" : rng.pick(heads),
      backwards: rng.next() < 0.5
    }));
    return {
      odd: figures[0],
      common: figures.slice(1),
      render: (f, cx, cy) => {
        const outline = placePoints(stadium(76, 30, f.rounded), 1, f.turn, cx, cy);
        let svg = `<polygon points="${pointsAttr(outline)}" fill="#ffffff" stroke="${INK}" stroke-width="2" stroke-linejoin="round" data-part="outline"/>`;
        f.order.forEach((item, k) => {
          const along = (k - 1) * 22;
          const [x, y] = placePoints([[along, 0]], 1, f.turn, cx, cy)[0];
          if (item === "circle") svg += `<circle cx="${num(x)}" cy="${num(y)}" r="5.5" fill="#ffffff" stroke="${INK}" stroke-width="1.6"/>`;
          if (item === "block") svg += `<polygon points="${pointsAttr(placePoints([[-4, -4], [4, -4], [4, 4], [-4, 4]], 1, f.turn, x, y))}" fill="${INK}"/>`;
          if (item === "arrow") {
            const [a, b] = placePoints(f.backwards ? [[8, 0], [-8, 0]] : [[-8, 0], [8, 0]], 1, f.turn, x, y);
            svg += arrowMarkup(a[0], a[1], b[0], b[1], f.head, 4);
          }
        });
        return svg;
      },
      note: `Here four outlines have ${commonRound ? "rounded" : "straight"} ends and the odd one out has ${commonRound ? "straight" : "rounded"} ends. The order of the small shapes inside, the arrow and the angle of each figure all change, so none of them can be the rule.`,
      describe: f => `a long outline with ${f.rounded ? "rounded" : "straight"} ends`
    };
  }

  function oddFlipped(rng, level) {
    const drawn = chiralFigure(rng, Math.max(level, 3));
    if (!drawn) return null;
    const { reference } = drawn;
    const angles = rng.shuffle(level === 4 ? EIGHTH_TURNS : [0, 90, 180, 270]);
    const turned = [];
    angles.forEach(angle => {
      const candidate = turnFigure(reference, angle);
      if (turned.length < 4 && !turned.some(t => sameFigure(t, candidate))) turned.push(candidate);
    });
    if (turned.length < 4) return null;
    const flipped = turnFigure(mirrorFigure(reference), rng.pick(level === 4 ? EIGHTH_TURNS : [0, 90, 180, 270]));
    const all = [flipped, ...turned];
    const radius = Math.max(...all.flatMap(fig => fig.flatMap(part => (part.kind === "circle" ? [part.c] : part.pts)).map(([x, y]) => Math.hypot(x, y))));
    const scale = 40 / radius;
    return {
      odd: flipped,
      common: turned,
      render: (f, cx, cy) => figureMarkup(f, cx, cy, scale),
      note: "Here four figures are the same drawing turned to different angles. The odd one out has been flipped over as well as turned: follow the outline clockwise from the small mark and its notches come round in a different order.",
      describe: () => "an irregular outline with a small mark inside",
      data: options => ({ figures: options.map(roundFigure) })
    };
  }

  const ODD_RULES = {
    2: [["hatch", oddHatch], ["ends", oddEnds]],
    3: [["hatch", oddHatch], ["segments", oddSegments], ["inside", oddInside], ["ends", oddEnds], ["flipped", oddFlipped]],
    4: [["segments", oddSegments], ["inside", oddInside], ["flipped", oddFlipped]]
  };

  function buildOddOneOutRule(seed, rng) {
    const level = levelFor(seed);
    const [rule, make] = ODD_RULES[level][Math.floor(seed / LEVELS.length) % ODD_RULES[level].length];
    const made = make(rng, level);
    if (!made) return null;
    const { answer, options } = placeAnswer(rng, made.odd, made.common);
    let body = "";
    options.forEach((figure, i) => {
      const x = ODD_PANEL.x + i * ODD_PANEL.step;
      const cx = x + ODD_PANEL.size / 2, cy = ODD_PANEL.y + ODD_PANEL.size / 2;
      body += `<g data-fig="${LABELS[i]}">${panelRect(x, ODD_PANEL.y, ODD_PANEL.size, ODD_PANEL.size)}${made.render(figure, cx, cy, i)}</g>`;
      body += text(cx, ODD_PANEL.y + ODD_PANEL.size + 20, LABELS[i]);
    });
    return makeQuestion({
      topic: "NVRT Odd One Out",
      template: "nvrtOddOneOutRule",
      question: "Which figure is most unlike the other four?",
      answer,
      difficulty: level,
      image: baseSvg(640, 152, body),
      alt: `Five figures, A to E: ${options.map((f, i) => `${LABELS[i]}, ${made.describe(f)}`).join("; ")}.`,
      explain: `Find the rule the four share rather than hunting for something odd: check one feature at a time - outline, shading, the number of lines, what is inside or outside, whether a figure has been flipped. ${made.note}`,
      data: { rule, ...(made.data ? made.data(options) : {}) }
    });
  }

  /* ═════════════════════════ SERIES: STRIPS ═════════════════════════
     A row of frames with one missing - anywhere in the row, not only at the
     end as in the older Series generator. Three kinds:

       turns      a marker travels round a circle while a shaded sector turns
                  the other way, by steps such as 45, 72 or 135 degrees
       counts     one set of shapes grows by one each frame while another
                  shrinks, and the shading may swap from frame to frame
       triangles  a band of triangles pointing up and down in turn, with one
                  rule for the up triangles, another for the down ones, and a
                  third running along the whole band

     Each frame is stored as numbers in figureData; tests/nvrt-figures.js
     works out each rule from the frames that are shown and predicts the gap. */

  const STRIP = { frames: 5, size: 84, y: 16 };
  const stripX = i => (640 - STRIP.frames * STRIP.size) / 2 + i * STRIP.size;

  function stripMarkup(frames, gap, render) {
    let svg = `<rect x="${stripX(0)}" y="${STRIP.y}" width="${STRIP.frames * STRIP.size}" height="${STRIP.size}" rx="10" fill="#ffffff" stroke="${INK}" stroke-width="2"/>`;
    for (let i = 1; i < STRIP.frames; i += 1) {
      svg += `<line x1="${stripX(i)}" y1="${STRIP.y}" x2="${stripX(i)}" y2="${STRIP.y + STRIP.size}" stroke="${INK}" stroke-width="2"/>`;
    }
    frames.forEach((frame, i) => {
      const cx = stripX(i) + STRIP.size / 2, cy = STRIP.y + STRIP.size / 2;
      svg += i === gap
        ? `<text x="${cx}" y="${cy + 12}" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="${ACCENT}">?</text>`
        : `<g data-fig="frame-${i}">${render(frame, cx, cy)}</g>`;
    });
    return svg;
  }

  function stripOptions(options, render, size = STRIP.size, y = 128) {
    let svg = "";
    options.forEach((option, i) => {
      const x = 28 + i * 120;
      svg += `<g data-fig="${LABELS[i]}">${panelRect(x, y, size, size)}${render(option, x + size / 2, y + size / 2)}</g>`;
      svg += text(x + size / 2, y + size + 20, LABELS[i]);
    });
    return svg;
  }

  /* Pick four wrong options that differ from the right one and each other. */
  function distinctWrong(rng, correct, candidates, key) {
    const seen = new Set([key(correct)]);
    const out = [];
    rng.shuffle(candidates).forEach(c => {
      if (out.length < 4 && !seen.has(key(c))) { seen.add(key(c)); out.push(c); }
    });
    return out.length === 4 ? out : null;
  }

  const wrap = a => ((a % 360) + 360) % 360;
  const polar = (cx, cy, r, deg) => {
    const t = (deg * Math.PI) / 180;
    return [cx + r * Math.sin(t), cy - r * Math.cos(t)];
  };

  function turnsFrame(f, cx, cy) {
    const R = 30;
    let svg = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#ffffff" stroke="${INK}" stroke-width="2"/>`;
    /* Angles are measured clockwise from twelve o'clock. */
    const tip = polar(cx, cy, R + 9, f.a), left = polar(cx, cy, R, f.a - 11), right = polar(cx, cy, R, f.a + 11);
    svg += `<polygon points="${pointsAttr([tip, left, right])}" fill="#ffffff" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round" data-angle="${f.a}"/>`;
    if (f.b !== undefined) {
      const r = 13;
      svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" stroke="${INK}" stroke-width="1.6"/>`;
      const p1 = polar(cx, cy, r, f.b - 45), p2 = polar(cx, cy, r, f.b + 45);
      svg += `<path d="M ${cx} ${cy} L ${num(p1[0])} ${num(p1[1])} A ${r} ${r} 0 0 1 ${num(p2[0])} ${num(p2[1])} Z" fill="${INK}" data-angle="${f.b}"/>`;
    }
    return svg;
  }

  function seriesTurns(rng, level) {
    const da = rng.pick(level === 4 ? [45, 135] : [45, 90, 135]);
    const db = rng.pick(level === 4 ? [60, 72, 120] : [45, 60, 90]);
    const a0 = rng.int(8) * 45, b0 = rng.int(level === 4 ? 10 : 8) * (level === 4 ? 36 : 45);
    /* Hard follows the marker alone; Super Hard adds the sector turning the
       other way. Either way the gap can be anywhere after the first frame. */
    const withSector = level === 4;
    const gap = level === 4 ? 1 + rng.int(3) : 1 + rng.int(4);
    const frame = i => (withSector ? { a: wrap(a0 + i * da), b: wrap(b0 - i * db) } : { a: wrap(a0 + i * da) });
    const frames = Array.from({ length: STRIP.frames }, (_, i) => frame(i));
    const correct = frames[gap];
    const candidates = withSector
      ? [
        { a: wrap(correct.a + da), b: correct.b }, { a: wrap(correct.a - da), b: correct.b },
        { a: correct.a, b: wrap(correct.b + db) }, { a: correct.a, b: wrap(correct.b - db) },
        { a: wrap(correct.a + da), b: wrap(correct.b + db) },
        { a: correct.a, b: wrap(b0 + gap * db) },                  // sector turned the wrong way
        { a: wrap(a0 - gap * da), b: correct.b }                   // marker turned the wrong way
      ]
      : [wrap(correct.a + da), wrap(correct.a - da), wrap(correct.a + 2 * da), wrap(correct.a + 180), wrap(correct.a + 45)].map(a => ({ a }));
    const wrong = distinctWrong(rng, correct, candidates, f => `${f.a}|${f.b}`);
    if (!wrong) return null;
    const { answer, options } = placeAnswer(rng, correct, wrong);
    const steps = withSector
      ? `the triangle moves ${da} degrees clockwise round the circle each time, while the black sector in the middle turns ${db} degrees anticlockwise`
      : `the triangle moves ${da} degrees clockwise round the circle each time`;
    return {
      template: "nvrtSeriesTurns", answer, gap,
      body: stripMarkup(frames, gap, turnsFrame) + stripOptions(options, turnsFrame),
      alt: `A row of five frames, frame ${gap + 1} missing. Each frame is a circle with a small triangle on its edge${withSector ? " and a black sector in a small circle at the centre" : ""}. Angles clockwise from the top, by frame: ${frames.map((f, i) => (i === gap ? "missing" : withSector ? `triangle ${f.a}, sector ${f.b}` : `${f.a}`)).join("; ")}. Options A to E: ${options.map(f => (withSector ? `triangle ${f.a}, sector ${f.b}` : `${f.a}`)).join("; ")}.`,
      note: `Here ${steps}. With the gap in the middle, work forwards from the frame before it and check the answer against the frame after it as well.`,
      data: { frames: frames.map((f, i) => (i === gap ? null : f)), options }
    };
  }

  /* Slots for the small circles, clear of the diagonal chain of triangles. */
  const COUNT_SLOTS = [[-30, -30], [-13, -33], [-33, -13], [30, 30], [13, 33], [33, 13], [-30, 4]];

  function countsFrame(f, cx, cy) {
    let svg = "";
    for (let k = 0; k < f.tri; k += 1) {
      const x = cx - 32 + k * 13, y = cy + 26 - k * 13;
      const black = (k % 2 === 0) === f.blackFirst;
      svg += `<polygon points="${pointsAttr([[x, y], [x + 12, y], [x, y - 12]])}" fill="${black ? INK : "#ffffff"}" stroke="${INK}" stroke-width="1.5" data-tri="${black ? 1 : 0}"/>`;
    }
    for (let k = 0; k < f.circ; k += 1) {
      svg += `<circle cx="${cx + COUNT_SLOTS[k][0]}" cy="${cy + COUNT_SLOTS[k][1]}" r="4.5" fill="#ffffff" stroke="${INK}" stroke-width="1.5"/>`;
    }
    return svg;
  }

  function seriesCounts(rng, level) {
    const c0 = 4 + rng.int(4);
    const swap = level >= 3;
    const firstBlack = rng.next() < 0.5;
    const gap = 1 + rng.int(3);
    const frame = i => ({ tri: 1 + i, circ: c0 - i, blackFirst: swap ? (i % 2 === 0) === firstBlack : firstBlack });
    const frames = Array.from({ length: STRIP.frames }, (_, i) => frame(i));
    const correct = frames[gap];
    const candidates = [
      { ...correct, tri: correct.tri + 1 }, { ...correct, tri: correct.tri - 1 },
      { ...correct, circ: correct.circ + 1 }, { ...correct, circ: correct.circ - 1 },
      { ...correct, blackFirst: !correct.blackFirst },
      { ...correct, tri: correct.tri + 1, circ: correct.circ + 1 }
    ].filter(f => f.tri >= 1 && f.circ >= 0 && f.circ <= COUNT_SLOTS.length);
    const wrong = distinctWrong(rng, correct, candidates, f => `${f.tri}|${f.circ}|${f.blackFirst}`);
    if (!wrong) return null;
    const { answer, options } = placeAnswer(rng, correct, wrong);
    const shade = f => (f.blackFirst ? "black first" : "white first");
    return {
      template: "nvrtSeriesCounts", answer, gap,
      body: stripMarkup(frames, gap, countsFrame) + stripOptions(options, countsFrame),
      alt: `A row of five frames, frame ${gap + 1} missing. Each frame has a diagonal chain of small triangles, black and white in turn, and some small circles. By frame: ${frames.map((f, i) => (i === gap ? "missing" : `${f.tri} triangles ${shade(f)}, ${f.circ} circles`)).join("; ")}. Options A to E: ${options.map(f => `${f.tri} triangles ${shade(f)}, ${f.circ} circles`).join("; ")}.`,
      note: `Here each frame has one more triangle and one fewer circle than the frame before${swap ? ", and the chain of triangles starts with the other colour each time" : ", and every chain starts with the same colour"}. Count both sets, and check the colour of the first triangle.`,
      data: { frames: frames.map((f, i) => (i === gap ? null : f)), options }
    };
  }

  /* One cell of the triangle band. Up triangles hold a square crossed into
     four with one quarter black; down triangles hold a circle crossed into
     four with one quarter grey. Quarters count clockwise from the top (the
     square) or from top right (the circle). The arrow points to the apex. */
  function triangleCell(cell, cx, top, side) {
    const h = (side * Math.sqrt(3)) / 2;
    const corners = cell.up
      ? [[cx, top], [cx + side / 2, top + h], [cx - side / 2, top + h]]
      : [[cx - side / 2, top], [cx + side / 2, top], [cx, top + h]];
    let svg = `<polygon points="${pointsAttr(corners)}" fill="#ffffff" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    const s = 10;
    if (cell.up) {
      const fy = top + h * 0.72;
      const sq = [[cx - s, fy - s], [cx + s, fy - s], [cx + s, fy + s], [cx - s, fy + s]];
      const quarter = [sq[cell.q], sq[(cell.q + 1) % 4], [cx, fy]];
      svg += `<polygon points="${pointsAttr(quarter)}" fill="${INK}" data-quarter="${cell.q}"/>`;
      svg += `<polygon points="${pointsAttr(sq)}" fill="none" stroke="${INK}" stroke-width="1.5"/>`;
      svg += `<line x1="${cx - s}" y1="${fy - s}" x2="${cx + s}" y2="${fy + s}" stroke="${INK}" stroke-width="1.2"/><line x1="${cx + s}" y1="${fy - s}" x2="${cx - s}" y2="${fy + s}" stroke="${INK}" stroke-width="1.2"/>`;
      svg += arrowMarkup(cx, top + h * 0.5, cx, top + h * 0.26, cell.head, 4.5);
    } else {
      const fy = top + h * 0.3;
      const start = cell.q * 90;
      const p1 = polar(cx, fy, s, start), p2 = polar(cx, fy, s, start + 90);
      svg += `<path d="M ${cx} ${num(fy)} L ${num(p1[0])} ${num(p1[1])} A ${s} ${s} 0 0 1 ${num(p2[0])} ${num(p2[1])} Z" fill="${SHADE}" data-quarter="${cell.q}"/>`;
      svg += `<circle cx="${cx}" cy="${num(fy)}" r="${s}" fill="none" stroke="${INK}" stroke-width="1.5"/>`;
      svg += `<line x1="${cx - s}" y1="${num(fy)}" x2="${cx + s}" y2="${num(fy)}" stroke="${INK}" stroke-width="1.2"/><line x1="${cx}" y1="${num(fy - s)}" x2="${cx}" y2="${num(fy + s)}" stroke="${INK}" stroke-width="1.2"/>`;
      svg += arrowMarkup(cx, top + h * 0.5, cx, top + h * 0.74, cell.head, 4.5);
    }
    return svg;
  }

  function seriesTriangles(rng) {
    const count = 7, side = 80, h = (side * Math.sqrt(3)) / 2;
    const heads = rng.shuffle(["solid", "open", "line"]);
    const upStep = rng.pick([1, 3]), downStep = rng.pick([1, 3]);
    const q0 = rng.int(4), d0 = rng.int(4);
    const cells = Array.from({ length: count }, (_, i) => {
      const up = i % 2 === 0;
      const j = Math.floor(i / 2);
      return { up, q: up ? (q0 + j * upStep) % 4 : (d0 + j * downStep) % 4, head: heads[i % 3] };
    });
    /* Not the middle down triangle: that leaves only the first and last down
       triangles showing, two quarter turns apart, and a quarter clockwise or
       anticlockwise would both fit the gap. */
    const gap = rng.pick([1, 2, 4, 5, 6]);
    const correct = cells[gap];
    const otherHeads = heads.filter(x => x !== correct.head);
    const candidates = [
      ...otherHeads.map(head => ({ ...correct, head })),
      { ...correct, q: (correct.q + 1) % 4 }, { ...correct, q: (correct.q + 3) % 4 }, { ...correct, q: (correct.q + 2) % 4 },
      { ...correct, q: (correct.q + 1) % 4, head: otherHeads[0] }
    ];
    const wrong = distinctWrong(rng, correct, candidates, c => `${c.q}|${c.head}`);
    if (!wrong) return null;
    const { answer, options } = placeAnswer(rng, correct, wrong);
    const x0 = (640 - (side / 2) * (count + 1)) / 2;
    let body = "";
    cells.forEach((cell, i) => {
      const cx = x0 + (side / 2) * (i + 1);
      if (i === gap) {
        const corners = cell.up
          ? [[cx, STRIP.y], [cx + side / 2, STRIP.y + h], [cx - side / 2, STRIP.y + h]]
          : [[cx - side / 2, STRIP.y], [cx + side / 2, STRIP.y], [cx, STRIP.y + h]];
        body += `<polygon points="${pointsAttr(corners)}" fill="#ffffff" stroke="${ACCENT}" stroke-width="2" stroke-dasharray="6 4"/>`;
        body += `<text x="${num(cx)}" y="${num(STRIP.y + h * (cell.up ? 0.78 : 0.48))}" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="${ACCENT}">?</text>`;
      } else {
        body += `<g data-fig="frame-${i}">${triangleCell(cell, cx, STRIP.y, side)}</g>`;
      }
    });
    const small = side * 0.92;
    body += stripOptions(options, (cell, cx, cy) => triangleCell(cell, cx, cy - (small * Math.sqrt(3)) / 4, small), 100, 108);
    const turnWord = step => (step === 1 ? "clockwise" : "anticlockwise");
    const describe = c => `${c.up ? "up" : "down"}, quarter ${c.q}, ${c.head} arrowhead`;
    return {
      template: "nvrtSeriesTriangles", answer, gap, height: 244,
      body,
      alt: `A band of seven triangles pointing up and down in turn, triangle ${gap + 1} missing. Up triangles hold a square crossed into quarters, down triangles a circle crossed into quarters; quarters numbered clockwise from the top. By triangle: ${cells.map((c, i) => (i === gap ? "missing" : describe(c))).join("; ")}. Options A to E: ${options.map(describe).join("; ")}.`,
      note: `Here three rules run at once. In the up triangles the black quarter turns a quarter ${turnWord(upStep)} each time; in the down triangles the grey quarter turns a quarter ${turnWord(downStep)}; and along the whole band the arrowheads repeat in the order ${heads.join(", ")}. Follow each rule separately to the gap.`,
      data: { cells: cells.map((c, i) => (i === gap ? null : c)), options }
    };
  }

  function buildSeriesStrip(seed, rng) {
    const level = levelFor(seed);
    const pick = Math.floor(seed / LEVELS.length) % 2;
    const made = level === 2 ? seriesCounts(rng, 2)
      : level === 3 ? (pick ? seriesTurns(rng, 3) : seriesCounts(rng, 3))
        : (pick ? seriesTurns(rng, 4) : seriesTriangles(rng));
    if (!made) return null;
    return makeQuestion({
      topic: "NVRT Series",
      template: made.template,
      question: made.template === "nvrtSeriesTriangles"
        ? "Which figure is missing from the series of triangles?"
        : "Which figure best completes the series?",
      answer: made.answer,
      difficulty: level,
      image: baseSvg(640, made.height || 250, made.body),
      alt: made.alt,
      explain: `Work out what changes from one frame to the next, one feature at a time, and write each change down before looking at the options. ${made.note}`,
      data: { gap: made.gap, ...made.data }
    });
  }

  /* ═════════════════════════ HOLE PUNCH: FOLDS ═════════════════════════
     Each fold is drawn step by step, then the punched paper, then five
     unfolded sheets. Unlike the older Hole Punch generator the folds can run
     corner to corner, there can be three of them, and the holes can be
     triangles or hearts, which point a way and so must be mirrored correctly
     at every crease.

     The paper is the unit square. A fold is a line of symmetry of whatever is
     still showing, so the layers always line up: square to half, half to
     quarter, square to triangle, triangle to smaller triangle. */

  const reflectAcross = ([x, y], line) => {
    const vx = x - line.p[0], vy = y - line.p[1];
    const along = vx * line.d[0] + vy * line.d[1];
    return [line.p[0] + 2 * along * line.d[0] - vx, line.p[1] + 2 * along * line.d[1] - vy];
  };

  function clipToSide(poly, line, keep) {
    const out = [];
    const value = p => line.d[0] * (p[1] - line.p[1]) - line.d[1] * (p[0] - line.p[0]);
    poly.forEach((a, i) => {
      const b = poly[(i + 1) % poly.length];
      const va = value(a) * keep, vb = value(b) * keep;
      if (va >= -1e-9) out.push(a);
      if ((va > 1e-9 && vb < -1e-9) || (va < -1e-9 && vb > 1e-9)) {
        const t = va / (va - vb);
        out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
      }
    });
    return out;
  }
  const centroidOf = poly => [poly.reduce((s, p) => s + p[0], 0) / poly.length, poly.reduce((s, p) => s + p[1], 0) / poly.length];
  const closeTo = (p, q, tol = 1e-6) => Math.abs(p[0] - q[0]) < tol && Math.abs(p[1] - q[1]) < tol;
  const isSymmetricAbout = (poly, line) => poly.every(p => poly.some(q => closeTo(reflectAcross(p, line), q, 1e-6)));

  function foldSequence(rng, count, diagonals) {
    let region = [[0, 0], [1, 0], [1, 1], [0, 1]];
    const folds = [];
    for (let f = 0; f < count; f += 1) {
      const c = centroidOf(region);
      const choices = [];
      [0, 45, 90, 135].forEach(deg => {
        if (!diagonals && deg % 90) return;
        const t = (deg * Math.PI) / 180;
        const line = { p: c, d: [Math.cos(t), Math.sin(t)] };
        if (!isSymmetricAbout(region, line)) return;
        [1, -1].forEach(keep => {
          const after = clipToSide(region, line, keep);
          const xs = after.map(p => p[0]), ys = after.map(p => p[1]);
          const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
          /* No long thin strips: they leave nowhere to punch. */
          if (Math.max(w, h) / Math.min(w, h) <= 2.01) choices.push({ line, keep, after });
        });
      });
      if (!choices.length) return null;
      const choice = rng.pick(choices);
      folds.push({ line: choice.line, keep: choice.keep, before: region, after: choice.after });
      region = choice.after;
    }
    return { folds, region };
  }

  /* Holes in paper units. A heart's point is its "direction". */
  const HOLE_SIZE = 0.075;
  function holeShape(kind, centre, deg) {
    if (kind === "circle") return { kind, c: centre, r: HOLE_SIZE * 0.85 };
    const local = kind === "triangle"
      ? regularPolygon(3).map(([x, y]) => [x * 1.05, y * 1.05 + 0.1])
      : Array.from({ length: 20 }, (_, k) => {
        const t = (2 * Math.PI * k) / 20;
        return [(16 * Math.sin(t) ** 3) / 17, (-(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) - 2) / 17];
      });
    const pts = placePoints(local, HOLE_SIZE, deg, centre[0], centre[1]);
    return { kind, pts, at: centroidOf(pts) };
  }
  /* A pointed hole keeps its centre in `at`, so most comparisons stop at one
     distance rather than matching every point of two hearts. */
  const holeCentre = hole => (hole.kind === "circle" ? hole.c : hole.at);
  const mapHole = (hole, fn) => {
    if (hole.kind === "circle") return { ...hole, c: fn(hole.c) };
    const pts = hole.pts.map(fn);
    return { ...hole, pts, at: centroidOf(pts) };
  };
  const reflectHole = (hole, line) => mapHole(hole, p => reflectAcross(p, line));
  /* The mistake of sliding a hole across a crease instead of mirroring it. */
  const slideHole = (hole, line) => {
    const c = holeCentre(hole), to = reflectAcross(c, line);
    return mapHole(hole, ([x, y]) => [x + to[0] - c[0], y + to[1] - c[1]]);
  };
  const spinHole = (hole, deg) => {
    const c = holeCentre(hole);
    const turn = turnPoint(deg);
    return mapHole(hole, ([x, y]) => { const [rx, ry] = turn([x - c[0], y - c[1]]); return [c[0] + rx, c[1] + ry]; });
  };
  /* Two holes count as the same unless they would look different: within
     0.03 of the paper's width is under three pixels, and an option that
     differs from another by less than that is the same option. */
  function sameHole(a, b) {
    if (a.kind !== b.kind) return false;
    if (a.kind === "circle") return closeTo(a.c, b.c, 0.03);
    if (!closeTo(a.at, b.at, 0.03)) return false;
    return a.pts.every(p => b.pts.some(q => closeTo(p, q, 0.03)));
  }
  const sameHoles = (a, b) => a.length === b.length && a.every(h => b.some(k => sameHole(h, k)));

  /* Unfold, last fold first, mirroring every hole across each crease.
     `copy` is how a hole crosses a crease; `skip` leaves a fold out. */
  function unfold(punches, folds, copy = reflectHole, skip = -1) {
    let holes = punches.slice();
    for (let f = folds.length - 1; f >= 0; f -= 1) {
      if (f !== skip) holes = holes.concat(holes.map(h => copy(h, folds[f].line)));
    }
    return holes;
  }

  /* Where a crease crosses the paper showing: the two crossing points
     furthest apart. A crease through a corner meets that corner from both
     edges, so the first and last hits can be the same point. */
  function lineThroughRegion(line, region) {
    const value = p => line.d[0] * (p[1] - line.p[1]) - line.d[1] * (p[0] - line.p[0]);
    const hits = [];
    region.forEach((a, i) => {
      const b = region[(i + 1) % region.length];
      const va = value(a), vb = value(b);
      if (Math.abs(va) < 1e-9) hits.push(a);
      else if (Math.abs(vb) > 1e-9 && va * vb < 0) {
        const t = va / (va - vb);
        hits.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
      }
    });
    let best = null, far = 0;
    hits.forEach(p => hits.forEach(q => {
      const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
      if (d > far) { far = d; best = [p, q]; }
    }));
    return best;
  }

  /* A mirror image that lands on a hole already there is the same hole. */
  const uniqueHoles = holes => holes.filter((h, i) => !holes.slice(0, i).some(k => sameHole(h, k)));

  function holesMarkup(holes, X, Y, scale) {
    return holes.map(hole => (hole.kind === "circle"
      ? `<circle cx="${num(X(hole.c[0]))}" cy="${num(Y(hole.c[1]))}" r="${num(hole.r * scale)}" fill="#ffffff" stroke="${INK}" stroke-width="1"/>`
      : `<polygon points="${pointsAttr(hole.pts.map(([x, y]) => [X(x), Y(y)]))}" fill="#ffffff" stroke="${INK}" stroke-width="1" stroke-linejoin="round"/>`)).join("");
  }

  const PAPER = "#b8bec6";
  function foldStepMarkup(state, x, y, size) {
    const pad = 10, side = size - 2 * pad;
    const X = v => x + pad + v * side, Y = v => y + pad + v * side;
    const P = poly => pointsAttr(poly.map(([px, py]) => [X(px), Y(py)]));
    let svg = panelRect(x, y, size, size);
    if (state.ghost) svg += `<polygon points="${P([[0, 0], [1, 0], [1, 1], [0, 1]])}" fill="none" stroke="${INK}" stroke-width="1.2" stroke-dasharray="4 3"/>`;
    svg += `<polygon points="${P(state.region)}" fill="${PAPER}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`;
    if (state.fold) {
      const ends = lineThroughRegion(state.fold.line, state.region);
      if (ends) svg += `<line x1="${num(X(ends[0][0]))}" y1="${num(Y(ends[0][1]))}" x2="${num(X(ends[1][0]))}" y2="${num(Y(ends[1][1]))}" stroke="#ffffff" stroke-width="2.5"/>`;
      /* A curved arrow from the half that moves to where it lands. */
      const moving = clipToSide(state.region, state.fold.line, -state.fold.keep);
      const from = centroidOf(moving), to = reflectAcross(from, state.fold.line);
      const mid = [(from[0] + to[0]) / 2 + state.fold.line.d[0] * 0.18, (from[1] + to[1]) / 2 + state.fold.line.d[1] * 0.18];
      const tip = [X(to[0]), Y(to[1])], ctrl = [X(mid[0]), Y(mid[1])];
      const t = Math.atan2(tip[1] - ctrl[1], tip[0] - ctrl[0]);
      const head = [[tip[0], tip[1]], [tip[0] - 7 * Math.cos(t - 0.45), tip[1] - 7 * Math.sin(t - 0.45)], [tip[0] - 7 * Math.cos(t + 0.45), tip[1] - 7 * Math.sin(t + 0.45)]];
      svg += `<path d="M ${num(X(from[0]))} ${num(Y(from[1]))} Q ${num(ctrl[0])} ${num(ctrl[1])} ${num(tip[0])} ${num(tip[1])}" fill="none" stroke="${INK}" stroke-width="1.8"/>`;
      svg += `<polygon points="${pointsAttr(head)}" fill="${INK}"/>`;
    }
    if (state.holes) svg += holesMarkup(state.holes, X, Y, side);
    return svg;
  }

  function buildHolePunchFolds(seed, rng) {
    const level = levelFor(seed);
    const count = level === 2 ? 1 + rng.int(2) : level === 3 ? 2 : 2 + rng.int(2);
    const sequence = foldSequence(rng, count, level >= 3);
    if (!sequence) return null;
    const { folds, region } = sequence;
    if (level >= 3 && !folds.some(f => Math.abs(f.line.d[0] * f.line.d[1]) > 0.1) && rng.next() < 0.6) return null;

    /* Punch away from every edge of what is showing, so no hole crosses a
       crease or overlaps its own mirror image. */
    let kinds = level === 2 ? ["circle"] : level === 3 ? rng.pick([["triangle"], ["heart"], ["circle", "triangle"]]) : rng.pick([["heart"], ["triangle", "heart"], ["triangle"], ["heart", "circle"]]);
    /* After three folds there is room for one hole only. */
    if (folds.length === 3) kinds = kinds.slice(0, 1);
    const punches = [];
    /* A hole's points reach about one hole-size from its centre; 1.3 keeps a
       clear gap between it and the crease, and between it and its own
       mirror image once unfolded. */
    const margin = HOLE_SIZE * 1.3;
    const xs = region.map(p => p[0]), ys = region.map(p => p[1]);
    const grid = [];
    for (let i = 0; i <= 12; i += 1) {
      for (let j = 0; j <= 12; j += 1) {
        const p = [Math.min(...xs) + ((Math.max(...xs) - Math.min(...xs)) * i) / 12, Math.min(...ys) + ((Math.max(...ys) - Math.min(...ys)) * j) / 12];
        if (pointInPolygon(p, region) && distanceToOutline(p, region) >= margin) grid.push(p);
      }
    }
    for (const kind of kinds) {
      const spot = rng.shuffle(grid).find(p =>
        punches.every(h => Math.hypot(holeCentre(h)[0] - p[0], holeCentre(h)[1] - p[1]) >= margin * 2));
      if (!spot) return null;
      punches.push(holeShape(kind, spot, rng.int(level === 4 ? 8 : 4) * (level === 4 ? 45 : 90)));
    }

    const correct = unfold(punches, folds);
    if (uniqueHoles(correct).length !== correct.length) return null;
    const directional = kinds.some(k => k !== "circle");
    const others = [[0.5, 0, 0.5, 1], [0, 0.5, 1, 0.5], [0, 0, 1, 1], [1, 0, 0, 1]]
      .map(([x1, y1, x2, y2]) => { const len = Math.hypot(x2 - x1, y2 - y1); return { p: [0.5, 0.5], d: [(x2 - x1) / len, (y2 - y1) / len] }; });
    const candidates = [
      ...folds.map((_, f) => unfold(punches, folds, reflectHole, f)),                         // a fold forgotten
      correct.slice(0, -1),                                                                   // one hole missing
      ...others.map(line => correct.concat(correct.map(h => reflectHole(h, line)))),          // an extra crease
      ...others.map(line => correct.map(h => reflectHole(h, line)))                            // the whole sheet mirrored
    ];
    if (directional) {
      candidates.push(unfold(punches, folds, slideHole));                                     // slid, not mirrored
      candidates.push(unfold(punches, folds, (h, line) => spinHole(slideHole(h, line), 180))); // turned, not mirrored
      const k = rng.int(correct.length);
      candidates.push(correct.map((h, i) => (i === k ? spinHole(h, 90) : h)));                 // one hole turned
    }
    const wrong = [];
    rng.shuffle(candidates).forEach(raw => {
      if (wrong.length >= 4) return;
      const holes = uniqueHoles(raw);
      if (!holes.length || sameHoles(holes, correct)) return;
      if (wrong.some(w => sameHoles(w, holes))) return;
      /* Every hole must still be on the paper. */
      if (holes.some(h => { const c = holeCentre(h); return c[0] < 0.05 || c[1] < 0.05 || c[0] > 0.95 || c[1] > 0.95; })) return;
      wrong.push(holes);
    });
    if (wrong.length < 4) return null;
    const { answer, options } = placeAnswer(rng, correct, wrong);

    let body = "";
    const step = 96;
    folds.forEach((fold, f) => {
      body += `<g data-fig="step-${f}">${foldStepMarkup({ region: fold.before, fold, ghost: f > 0 }, 20 + f * step, 14, 86)}</g>`;
    });
    body += `<g data-fig="punched">${foldStepMarkup({ region, holes: punches, ghost: true }, 20 + folds.length * step, 14, 86)}</g>`;
    options.forEach((holes, i) => {
      const x = 20 + i * 124, y = 122, size = 100;
      const pad = 10, side = size - 2 * pad;
      const X = v => x + pad + v * side, Y = v => y + pad + v * side;
      body += `<g data-fig="${LABELS[i]}">${panelRect(x, y, size, size)}<rect x="${x + pad}" y="${y + pad}" width="${side}" height="${side}" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>${holesMarkup(holes, X, Y, side)}</g>`;
      body += text(x + size / 2, y + size + 20, LABELS[i]);
    });

    const round = v => Math.round(v * 10000) / 10000;
    const roundHole = h => (h.kind === "circle" ? { kind: h.kind, c: h.c.map(round), r: round(h.r) } : { kind: h.kind, pts: h.pts.map(p => p.map(round)) });
    const shapes = [...new Set(kinds)].map(k => `${k}${k === "circle" ? "" : "-shaped"}`);
    return makeQuestion({
      topic: "NVRT Hole Punch",
      template: "nvrtHolePunchFolds",
      question: "The paper is folded as shown and then holes are punched through it. Which figure shows what the paper will look like when it is unfolded?",
      answer,
      difficulty: level,
      image: baseSvg(640, 254, body),
      alt: `A square of paper folded ${folds.length} time${folds.length === 1 ? "" : "s"}, ${folds.map(f => (Math.abs(f.line.d[0] * f.line.d[1]) > 0.1 ? "corner to corner" : "edge to edge")).join(", then ")}, then punched with ${listWords(shapes)} hole${punches.length === 1 ? "" : "s"}. Five unfolded sheets, A to E, with ${options.map(o => o.length).join(", ")} holes.`,
      explain: `Unfold one crease at a time, starting with the last fold. Each time, every hole gets a mirror image on the other side of that crease, so the number of holes doubles - ${punches.length * 2 ** folds.length} here. A mirrored hole is flipped, not just moved: a triangle pointing towards a crease points towards it from the other side too, and the same goes for the point of a heart.`,
      data: {
        folds: folds.map(f => ({ p: f.line.p.map(round), d: f.line.d.map(round), keep: f.keep })),
        punches: punches.map(roundHole),
        options: options.map(holes => holes.map(roundHole))
      }
    });
  }

  /* ═════════════════════════ HIDDEN SHAPE: TURNED ═════════════════════════
     A target outline and five line drawings. One drawing contains the
     target's outline - turned a quarter, a half or three quarters - among its
     lines. The older Hidden Shape generator only hid squares of a grid and
     never turned them, and its hint says the shape is never rotated, so this
     family carries its own wording and hint.

     Drawings live on a unit lattice and every line runs across, down or at
     45 degrees, so a drawing is a set of unit "atoms": h (x,y)-(x+1,y),
     v (x,y)-(x,y+1), d (x,y)-(x+1,y+1) and a (x+1,y)-(x,y+1). Containing the
     target is then a subset test, tried for every turn and position. */

  /* Packed into one integer, as Shape Arithmetic packs its quarters, so that
     moving a shape is one addition per atom. */
  const ATOM_TYPES = ["h", "v", "d", "a"];
  const ATOM_INDEX = { h: 0, v: 1, d: 2, a: 3 };
  const atomKey = (x, y, t) => ((x + 32) * 256 + (y + 32)) * 4 + ATOM_INDEX[t];
  const parseAtom = key => [(key >> 10) - 32, ((key >> 2) & 255) - 32, ATOM_TYPES[key & 3]];
  const atomShift = (dx, dy) => (dx * 256 + dy) * 4;
  function segmentAtoms([x1, y1], [x2, y2]) {
    const dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1);
    const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    const atoms = [];
    for (let i = 0; i < n; i += 1) {
      const x = x1 + dx * i, y = y1 + dy * i;
      const mx = Math.min(x, x + dx), my = Math.min(y, y + dy);
      atoms.push(atomKey(mx, my, dy === 0 ? "h" : dx === 0 ? "v" : dx === dy ? "d" : "a"));
    }
    return atoms;
  }
  const loopAtoms = loop => loop.flatMap((p, i) => segmentAtoms(p, loop[(i + 1) % loop.length]));
  /* A quarter turn clockwise, (x, y) -> (-y, x). */
  const turnAtoms = atoms => atoms.map(key => {
    const [x, y, t] = parseAtom(key);
    return t === "h" ? atomKey(-y, x, "v") : t === "v" ? atomKey(-y - 1, x, "h") : atomKey(-y - 1, x, t === "d" ? "a" : "d");
  });
  const mirrorAtoms = atoms => atoms.map(key => {
    const [x, y, t] = parseAtom(key);
    return t === "h" ? atomKey(-x - 1, y, "h") : t === "v" ? atomKey(-x, y, "v") : atomKey(-x - 1, y, t === "d" ? "a" : "d");
  });
  const moveAtoms = (atoms, dx, dy) => { const shift = atomShift(dx, dy); return atoms.map(key => key + shift); };
  const normaliseAtoms = atoms => {
    const parsed = atoms.map(parseAtom);
    return moveAtoms(atoms, -Math.min(...parsed.map(p => p[0])), -Math.min(...parsed.map(p => p[1])));
  };
  const atomsKey = atoms => [...new Set(normaliseAtoms(atoms))].sort().join(" ");
  const atomTurns = atoms => {
    const out = [normaliseAtoms(atoms)];
    for (let t = 1; t < 4; t += 1) out.push(normaliseAtoms(turnAtoms(out[t - 1])));
    return out;
  };

  /* Every placement of every turn of the target that lies inside the drawing. */
  function containsAtoms(figure, target) {
    return atomTurns(target).some(turned => {
      for (let dx = -1; dx <= 5; dx += 1) {
        for (let dy = -1; dy <= 5; dy += 1) {
          const shift = atomShift(dx, dy);
          if (turned.every(key => figure.has(key + shift))) return true;
        }
      }
      return false;
    });
  }

  /* Cut one convex corner of an outline off along a cell diagonal. */
  function cutCorner(loop, rng) {
    const corners = loop.map((p, i) => i).filter(i => isConvexCorner(loop, i));
    const i = rng.pick(corners);
    const p = loop[i], a = loop[(i + loop.length - 1) % loop.length], b = loop[(i + 1) % loop.length];
    const step = q => [p[0] + Math.sign(q[0] - p[0]), p[1] + Math.sign(q[1] - p[1])];
    return [...loop.slice(0, i), step(a), step(b), ...loop.slice(i + 1)];
  }

  function hiddenTarget(rng, level) {
    const cells = growPolyomino(rng, 3 + rng.int(2), 3, 3);
    if (!cells) return null;
    let loop = polyominoOutline(cells);
    if (!loop) return null;
    if (level === 4) loop = cutCorner(loop, rng);
    const atoms = loopAtoms(loop);
    /* The target must not look the same flipped over, or the mirrored decoy
       in the wrong answers would be a correct answer too. */
    const turns = atomTurns(atoms).map(a => [...new Set(a)].sort().join(" "));
    if (turns.includes(atomsKey(mirrorAtoms(atoms)))) return null;
    return { atoms, cells };
  }

  /* A drawing: an outline region, the shape hidden in it, and lines across. */
  function hiddenDrawing(rng, level, hide) {
    const region = growPolyomino(rng, 9 + rng.int(5), 4, 4);
    if (!region) return null;
    const outline = polyominoOutline(region);
    if (!outline) return null;
    const inRegion = key => {
      const [x, y, t] = parseAtom(key);
      const has = (c, r) => region.has(cellKey(c, r));
      if (t === "h") return has(x, y - 1) || has(x, y);
      if (t === "v") return has(x - 1, y) || has(x, y);
      return has(x, y);
    };
    const atoms = new Set(loopAtoms(outline));
    const shown = rng.pick(atomTurns(hide).slice(1));
    const spots = [];
    for (let dx = -1; dx <= 4; dx += 1) {
      for (let dy = -1; dy <= 4; dy += 1) {
        const moved = moveAtoms(shown, dx, dy);
        if (moved.every(inRegion)) spots.push(moved);
      }
    }
    if (!spots.length) return null;
    rng.pick(spots).forEach(k => atoms.add(k));
    /* Lines right across the region in all four directions. */
    const chords = level === 4 ? 3 + rng.int(2) : 2 + rng.int(2);
    for (let c = 0; c < chords; c += 1) {
      const kind = rng.pick(["h", "v", "d", "a"]);
      const k = rng.int(kind === "d" || kind === "a" ? 7 : 3) + (kind === "d" ? -3 : kind === "a" ? 1 : 1);
      for (let i = 0; i < 4; i += 1) {
        const key = kind === "h" ? atomKey(i, k, "h") : kind === "v" ? atomKey(k, i, "v")
          : kind === "d" ? atomKey(i, i - k, "d") : atomKey(i, k - i - 1, "a");
        if (inRegion(key)) atoms.add(key);
      }
    }
    return atoms;
  }

  /* Straight runs of atoms joined back into single lines for drawing. */
  function atomLines(atoms) {
    const groups = new Map();
    atoms.forEach(key => {
      const [x, y, t] = parseAtom(key);
      const line = t === "h" ? y : t === "v" ? x : t === "d" ? x - y : x + y;
      const along = t === "v" ? y : x;
      const g = `${t}|${line}`;
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(along);
    });
    const lines = [];
    groups.forEach((alongs, g) => {
      const [t, lineText] = g.split("|");
      const line = Number(lineText);
      alongs.sort((a, b) => a - b);
      let start = alongs[0];
      alongs.forEach((a, i) => {
        if (i + 1 < alongs.length && alongs[i + 1] === a + 1) return;
        const end = a + 1;
        if (t === "h") lines.push([[start, line], [end, line]]);
        else if (t === "v") lines.push([[line, start], [line, end]]);
        else if (t === "d") lines.push([[start, start - line], [end, end - line]]);
        else lines.push([[start, line - start + 1], [end, line - end + 1]]);
        start = alongs[i + 1];
      });
    });
    return lines;
  }

  function atomsMarkup(atoms, ox, oy, unit) {
    return atomLines(atoms).map(([[x1, y1], [x2, y2]]) =>
      `<line x1="${ox + x1 * unit}" y1="${oy + y1 * unit}" x2="${ox + x2 * unit}" y2="${oy + y2 * unit}" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`).join("");
  }

  function buildHiddenShapeTurned(seed, rng) {
    const level = levelFor(seed);
    const target = hiddenTarget(rng, level);
    if (!target) return null;
    const correct = hiddenDrawing(rng, level, target.atoms);
    if (!correct || !containsAtoms(correct, target.atoms)) return null;

    /* Wrong drawings hide a near miss: the target flipped over, or the target
       with one square more or fewer. None may contain the real target. */
    const decoys = [mirrorAtoms(target.atoms)];
    [...target.cells].forEach(key => {
      const fewer = new Set(target.cells);
      fewer.delete(key);
      const loop = fewer.size >= 2 ? polyominoOutline(fewer) : null;
      if (loop) decoys.push(loopAtoms(loop));
    });
    for (let tries = 0; tries < 6; tries += 1) {
      const more = new Set(target.cells);
      const [c, r] = parseCell(rng.pick([...target.cells]));
      const [dc, dr] = rng.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
      more.add(cellKey(c + dc, r + dr));
      const loop = more.size > target.cells.size ? polyominoOutline(more) : null;
      if (loop) decoys.push(loopAtoms(loop));
    }
    const wrong = [];
    for (let tries = 0; tries < 40 && wrong.length < 4; tries += 1) {
      const decoy = wrong.length === 0 || (level === 4 && wrong.length === 1) ? decoys[0] : rng.pick(decoys.slice(1).length ? decoys.slice(1) : decoys);
      const drawing = hiddenDrawing(rng, level, decoy);
      if (drawing && !containsAtoms(drawing, target.atoms)) wrong.push(drawing);
    }
    if (wrong.length < 4) return null;
    const { answer, options } = placeAnswer(rng, correct, rng.shuffle(wrong));

    const unit = 18;
    const centredAt = (atoms, x, y, size) => {
      const parsed = [...atoms].map(parseAtom);
      const xs = parsed.flatMap(([ax, , t]) => (t === "h" || t === "d" || t === "a" ? [ax, ax + 1] : [ax]));
      const ys = parsed.flatMap(([, ay, t]) => (t === "v" || t === "d" || t === "a" ? [ay, ay + 1] : [ay]));
      return {
        ox: x + size / 2 - ((Math.min(...xs) + Math.max(...xs)) / 2) * unit,
        oy: y + size / 2 - ((Math.min(...ys) + Math.max(...ys)) / 2) * unit
      };
    };
    let body = panelRect(20, 30, 96, 96, true);
    const t0 = centredAt(target.atoms, 20, 30, 96);
    body += `<g data-fig="target">${atomsMarkup(target.atoms, t0.ox, t0.oy, unit)}</g>`;
    body += text(68, 146, "Target", 13);
    const offsets = [];
    options.forEach((atoms, i) => {
      const x = 140 + i * 102;
      const o = centredAt(atoms, x, 30, 96);
      offsets.push(o);
      body += `<g data-fig="${LABELS[i]}">${panelRect(x, 30, 96, 96)}${atomsMarkup(atoms, o.ox, o.oy, unit)}</g>`;
      body += text(x + 48, 146, LABELS[i]);
    });

    return makeQuestion({
      topic: "NVRT Hidden Shape",
      template: "nvrtHiddenShapeTurned",
      question: "Which figure contains the target shape? The target may have been turned round, but it is never flipped over.",
      answer,
      difficulty: level,
      image: baseSvg(660, 160, body),
      alt: `A target outline and five line drawings, A to E, each made of straight lines across, down and corner to corner. One drawing contains the target's outline, turned.`,
      explain: "The target keeps its size and its shape, but here it can be turned round, so it may be lying on its side or upside down. Pick its most unusual feature - a long edge, a notch, a cut corner - and look for that first in each drawing, at every angle. Then trace the rest of the outline from there. A drawing that contains the target's mirror image is not a match: turning never swaps left and right.",
      data: { unit, target: t0, options: offsets }
    });
  }

  /* ═══════════════ DRIVER ═══════════════ */
  /* Seeds start well clear of questions-nvrt.js (0 to about 19,000). */
  const FAMILIES = [
    [buildRotation, 150, 30000],
    [buildPlanView, 120, 31000],
    [buildShapeArithmetic, 150, 32000],
    [buildCountSquares, 100, 33000],
    [buildOddOneOutRule, 150, 34000],
    [buildSeriesStrip, 150, 35000],
    [buildHolePunchFolds, 120, 36000],
    [buildHiddenShapeTurned, 120, 37000]
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
