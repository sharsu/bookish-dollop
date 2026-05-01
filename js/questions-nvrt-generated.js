/* Generated original NVRT-style visual questions for scalable bank growth. */
(() => {
  const root = typeof window !== "undefined" ? window : globalThis;
  if (!Array.isArray(root.NVRT_QUESTIONS)) return;

  let nextId = root.NVRT_QUESTIONS.reduce((max, q) => Math.max(max, Number(q?.id) || 0), 0) + 1;
  const optionCopy = ["Picture A", "Picture B", "Picture C", "Picture D", "Picture E"];
  const labels = ["A", "B", "C", "D", "E"];
  const shapes = ["circle", "square", "diamond", "triangle"];
  const cellTemplates = [
    [[0, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [0, 2]],
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[0, 1], [1, 0], [1, 1], [2, 0]],
    [[0, 0], [1, 0], [2, 0], [1, 1]],
    [[0, 1], [1, 1], [1, 2], [2, 2]]
  ];
  const cornerLayout = [[0, 0], [0, 2], [2, 0], [2, 2]];
  const crossLayout = [[1, 0], [0, 1], [2, 1], [1, 2]];
  const ringLayout = [[0, 1], [1, 0], [1, 1], [2, 1], [1, 2]];
  const reflectionLayouts = [
    [[0, 0], [0, 1], [1, 2]],
    [[0, 0], [1, 0], [2, 1]],
    [[0, 1], [1, 2], [2, 0]],
    [[0, 2], [1, 0], [2, 1]],
    [[0, 0], [1, 2], [2, 1]],
    [[0, 1], [1, 0], [2, 1], [2, 2]],
    [[0, 0], [0, 2], [1, 1], [2, 0]],
    [[0, 2], [1, 1], [1, 0], [2, 2]],
    [[0, 0], [1, 1], [1, 2], [2, 0]],
    [[0, 1], [1, 0], [1, 2], [2, 2]]
  ];
  const ink = "#0f172a";
  const accent = "#4f46e5";
  const panelStroke = "#cbd5e1";

  const svgToDataUri = svg => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/>\s+</g, "><").trim())}`;
  const hashInt = (seed, salt = 0) => {
    let x = (seed + 1) ^ ((salt + 1) * 0x9e3779b1);
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x = Math.imul(x ^ (x >>> 15), 0x45d9f3b);
    return (x ^ (x >>> 16)) >>> 0;
  };
  const pickIndex = (length, seed, salt = 0) => hashInt(seed, salt) % length;
  const pick = (list, seed, salt = 0) => list[pickIndex(list.length, seed, salt)];
  const diffLevel = (seed, offset = 0) => {
    const n = (seed + offset) % 10;
    return n < 1 ? 1 : n < 5 ? 2 : n < 8 ? 3 : 4;
  };

  function pickDistinctShape(seed, salt, excluded) {
    let kind = pick(shapes, seed, salt);
    if (kind === excluded) kind = pick(shapes, seed, salt + 1);
    if (kind === excluded) kind = pick(shapes, seed, salt + 2);
    return kind;
  }

  function normalizeCells(cells) {
    return [...new Set(cells.map(([col, row]) => `${col},${row}`))]
      .map(value => value.split(",").map(Number))
      .sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  }

  function rotateCells(cells, turns = 1, size = 3) {
    let current = normalizeCells(cells);
    const steps = ((turns % 4) + 4) % 4;
    for (let i = 0; i < steps; i++) {
      current = normalizeCells(current.map(([col, row]) => [size - 1 - row, col]));
    }
    return current;
  }

  function reflectCells(cells, axis = "vertical", size = 3) {
    return normalizeCells(cells.map(([col, row]) => [
      axis === "vertical" ? size - 1 - col : col,
      axis === "horizontal" ? size - 1 - row : row
    ]));
  }

  function mirrorCells(cells, size = 3) {
    return reflectCells(cells, "vertical", size);
  }

  function shiftCells(cells, dx = 1, dy = 0, size = 3) {
    return normalizeCells(cells.map(([col, row]) => [
      (col + dx + size) % size,
      (row + dy + size) % size
    ]));
  }

  function rotateTokenAngle(angle = 0, turns = 1) {
    return ((((angle || 0) + turns * 90) % 360) + 360) % 360;
  }

  function reflectTokenAngle(angle = 0, axis = "vertical") {
    const normalized = (((angle || 0) % 360) + 360) % 360;
    return axis === "vertical"
      ? ({ 0: 0, 90: 270, 180: 180, 270: 90 }[normalized] ?? normalized)
      : ({ 0: 180, 90: 90, 180: 0, 270: 270 }[normalized] ?? normalized);
  }

  function rotateTokens(tokens, turns = 1, size = 3) {
    let current = tokens.map(token => ({ ...token }));
    const steps = ((turns % 4) + 4) % 4;
    for (let i = 0; i < steps; i++) {
      current = current.map(token => ({
        ...token,
        col: size - 1 - token.row,
        row: token.col,
        rotate: rotateTokenAngle(token.rotate || 0, 1)
      }));
    }
    return current;
  }

  function reflectTokens(tokens, axis = "vertical", size = 3) {
    return tokens.map(token => ({
      ...token,
      col: axis === "vertical" ? size - 1 - token.col : token.col,
      row: axis === "horizontal" ? size - 1 - token.row : token.row,
      rotate: reflectTokenAngle(token.rotate || 0, axis)
    }));
  }

  function shiftTokens(tokens, dx = 1, dy = 0, size = 3) {
    return tokens.map(token => ({
      ...token,
      col: (token.col + dx + size) % size,
      row: (token.row + dy + size) % size
    }));
  }

  function rotatePattern(pattern, turns = 1, size = 3) {
    return pattern.tokens
      ? { tokens: rotateTokens(pattern.tokens, turns, size) }
      : { cells: rotateCells(pattern.cells, turns, size) };
  }

  function reflectPattern(pattern, axis = "vertical", size = 3) {
    return pattern.tokens
      ? { tokens: reflectTokens(pattern.tokens, axis, size) }
      : { cells: reflectCells(pattern.cells, axis, size) };
  }

  function shiftPattern(pattern, dx = 1, dy = 0, size = 3) {
    return pattern.tokens
      ? { tokens: shiftTokens(pattern.tokens, dx, dy, size) }
      : { cells: shiftCells(pattern.cells, dx, dy, size) };
  }

  function ensureReflectablePattern(pattern, axis = "vertical") {
    let current = clonePattern(pattern);
    for (let attempt = 0; attempt < 4; attempt++) {
      if (patternKey(current) !== patternKey(reflectPattern(current, axis))) return current;
      current = shiftPattern(current, axis === "vertical" ? 1 : 0, axis === "horizontal" ? 1 : 0);
      if (attempt % 2 === 1) current = rotatePattern(current, 1);
    }
    return current;
  }

  function tokenKey(tokens) {
    return tokens
      .map(token => `${token.row}:${token.col}:${token.kind}:${token.hollow ? 1 : 0}:${token.rotate || 0}`)
      .sort()
      .join("|");
  }

  function patternKey(pattern) {
    return pattern.tokens
      ? `t:${tokenKey(pattern.tokens)}`
      : `c:${normalizeCells(pattern.cells).map(([col, row]) => `${col}:${row}`).join("|")}`;
  }

  function clonePattern(pattern) {
    return pattern.tokens
      ? { tokens: pattern.tokens.map(token => ({ ...token })) }
      : { cells: normalizeCells(pattern.cells) };
  }

  function mutatePattern(pattern, seed) {
    if (pattern.tokens) {
      const tokens = pattern.tokens.map(token => ({ ...token }));
      const index = pickIndex(tokens.length, seed, 21);
      tokens[index].kind = pickDistinctShape(seed, 22, tokens[index].kind);
      tokens[index].rotate = tokens[index].kind === "triangle" ? ((tokens[index].rotate || 0) + 90) % 360 : 0;
      tokens[index].hollow = !tokens[index].hollow;
      return { tokens };
    }

    return { cells: shiftCells(pattern.cells, 1 + (seed % 2), (seed + 1) % 2) };
  }

  function placeOptions(correct, distractors, seed) {
    const answer = pickIndex(5, seed, 99);
    const queue = [];
    const seen = new Set([patternKey(correct)]);
    const tryAdd = pattern => {
      const key = patternKey(pattern);
      if (!seen.has(key)) {
        seen.add(key);
        queue.push(pattern);
      }
    };

    distractors.forEach(pattern => {
      tryAdd(pattern);
    });

    let salt = 0;
    let attempts = 0;
    while (queue.length < 4 && attempts < 20) {
      tryAdd(mutatePattern(correct, seed + salt));
      salt += 1;
      attempts += 1;
    }

    if (queue.length < 4) {
      [
        rotatePattern(correct, 1),
        rotatePattern(correct, 2),
        rotatePattern(correct, 3),
        shiftPattern(correct, 1, 0),
        shiftPattern(correct, 0, 1),
        shiftPattern(correct, 1, 1),
        reflectPattern(correct, "vertical"),
        reflectPattern(correct, "horizontal"),
        mutatePattern(rotatePattern(correct, 1), seed + 101),
        mutatePattern(shiftPattern(correct, 1, 0), seed + 151)
      ].forEach(tryAdd);
    }

    let rescue = 0;
    while (queue.length < 4 && rescue < 20) {
      tryAdd(mutatePattern(shiftPattern(correct, salt % 2, (salt + 1) % 2), seed + 200 + salt));
      salt += 1;
      rescue += 1;
    }

    for (let i = 0; queue.length < 4; i++) {
      tryAdd(correct.tokens
        ? {
            tokens: [{
              row: i % 3,
              col: (i + 1) % 3,
              kind: shapes[i % shapes.length],
              hollow: i % 2 === 0,
              rotate: shapes[i % shapes.length] === "triangle" ? (i * 90) % 360 : 0
            }]
          }
        : { cells: normalizeCells([[i % 3, (i + 1) % 3], [(i + 2) % 3, i % 3]]) });
    }

    const options = [];
    for (let i = 0; i < 5; i++) {
      options.push(i === answer ? correct : queue.shift());
    }
    return { answer, options };
  }

  function shapeMarkup(token, cell = 18, ox = 16, oy = 16) {
    const size = token.size || Math.max(7, Math.round(cell * 0.42));
    const cx = ox + token.col * cell;
    const cy = oy + token.row * cell;
    const fill = token.hollow ? "#ffffff" : ink;
    let inner = "";

    if (token.kind === "circle") {
      inner = `<circle cx="${cx}" cy="${cy}" r="${size}" fill="${fill}" stroke="${ink}" stroke-width="2"/>`;
    } else if (token.kind === "square") {
      inner = `<rect x="${cx - size}" y="${cy - size}" width="${size * 2}" height="${size * 2}" rx="3" fill="${fill}" stroke="${ink}" stroke-width="2"/>`;
    } else if (token.kind === "diamond") {
      inner = `<polygon points="${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}" fill="${fill}" stroke="${ink}" stroke-width="2"/>`;
    } else {
      inner = `<polygon points="${cx},${cy - size} ${cx + size},${cy + size} ${cx - size},${cy + size}" fill="${fill}" stroke="${ink}" stroke-width="2"/>`;
    }

    return token.rotate ? `<g transform="rotate(${token.rotate} ${cx} ${cy})">${inner}</g>` : inner;
  }

  function tokenPattern(tokens, opts = {}) {
    const cell = opts.cell || 18;
    const ox = opts.ox || 16;
    const oy = opts.oy || 16;
    return tokens.map(token => shapeMarkup(token, cell, ox, oy)).join("");
  }

  function cellPattern(cells, opts = {}) {
    const cell = opts.cell || 18;
    const ox = opts.ox || 16;
    const oy = opts.oy || 16;
    const blockSize = Math.max(10, cell - 3);
    const inset = Math.max(0, Math.round((cell - blockSize) / 2));
    return normalizeCells(cells).map(([col, row]) => (
      `<rect x="${ox + col * cell + inset}" y="${oy + row * cell + inset}" width="${blockSize}" height="${blockSize}" rx="3" fill="${ink}"/>`
    )).join("");
  }

  function patternMarkup(pattern, opts = {}) {
    return pattern.tokens ? tokenPattern(pattern.tokens, opts) : cellPattern(pattern.cells, opts);
  }

  function renderPattern(pattern, miniOrOpts = false) {
    const opts = typeof miniOrOpts === "object"
      ? miniOrOpts
      : (miniOrOpts ? { cell: 16, ox: 11, oy: 11 } : {});
    return patternMarkup(pattern, opts);
  }

  function panel(x, y, label, content, w = 88, h = 88) {
    return `
      <g transform="translate(${x} ${y})">
        <rect width="${w}" height="${h}" rx="14" fill="#ffffff" stroke="${panelStroke}" stroke-width="2"/>
        ${content}
        ${label ? `<text x="${w / 2}" y="${h + 18}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${ink}">${label}</text>` : ""}
      </g>`;
  }

  function questionMarkBox(x, y, w = 88, h = 88) {
    return `
      <g transform="translate(${x} ${y})">
        <rect width="${w}" height="${h}" rx="14" fill="#ffffff" stroke="${accent}" stroke-width="2.5" stroke-dasharray="8 6"/>
        <text x="${w / 2}" y="${h / 2 + 12}" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="${accent}">?</text>
      </g>`;
  }

  function baseSvg(width, height, body) {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
        <rect width="${width}" height="${height}" rx="24" fill="#f8fafc"/>
        ${body}
      </svg>`);
  }

  function oddOneOutSvg(patterns) {
    return baseSvg(640, 170, patterns.map((pattern, index) => panel(
      18 + index * 122,
      28,
      labels[index],
      renderPattern(pattern, { cell: 21, ox: 18, oy: 18 })
    )).join(""));
  }

  function gridSvg(cells, options) {
    const body = [
      panel(42, 28, "", renderPattern(cells[0], { cell: 21, ox: 18, oy: 18 }), 90, 90),
      panel(150, 28, "", renderPattern(cells[1], { cell: 21, ox: 18, oy: 18 }), 90, 90),
      panel(42, 136, "", renderPattern(cells[2], { cell: 21, ox: 18, oy: 18 }), 90, 90),
      questionMarkBox(150, 136, 90, 90),
      `<text x="142" y="252" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="${ink}">Find the missing box</text>`,
      `<text x="453" y="44" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="${ink}">Choose one option</text>`,
      ...options.map((pattern, index) => panel(282 + index * 68, 78, labels[index], renderPattern(pattern, { cell: 17, ox: 11, oy: 11 }), 56, 56))
    ].join("");

    return baseSvg(640, 252, body);
  }

  function reflectionSvg(sourcePattern, options, axis = "vertical") {
    const sourceOpts = axis === "vertical"
      ? { ox: 20, oy: 20, cell: 19 }
      : { ox: 30, oy: 16, cell: 16 };
    const mirrorLine = axis === "vertical"
      ? `<line x1="66" y1="10" x2="66" y2="98" stroke="${accent}" stroke-width="2.5" stroke-dasharray="7 6"/>`
      : `<line x1="18" y1="54" x2="114" y2="54" stroke="${accent}" stroke-width="2.5" stroke-dasharray="7 6"/>`;
    const source = `
      <g transform="translate(48 28)">
        <rect width="132" height="108" rx="16" fill="#ffffff" stroke="${panelStroke}" stroke-width="2"/>
        ${mirrorLine}
        ${patternMarkup(sourcePattern, sourceOpts)}
      </g>
      <text x="114" y="154" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="${ink}">Mirror line</text>`;
    const optionBoxes = options.map((pattern, index) => panel(214 + index * 82, 44, labels[index], renderPattern(pattern, { cell: 17, ox: 10, oy: 10 }), 68, 68)).join("");
    return baseSvg(640, 180, `${source}${optionBoxes}`);
  }

  function analogySvg(a, b, c, options) {
    const top = `${panel(36, 28, "A", renderPattern(a, { cell: 20, ox: 17, oy: 17 }), 84, 84)}<text x="137" y="78" font-family="Arial, sans-serif" font-size="26" fill="${accent}">→</text>${panel(160, 28, "B", renderPattern(b, { cell: 20, ox: 17, oy: 17 }), 84, 84)}`;
    const bottom = `${panel(36, 140, "C", renderPattern(c, { cell: 20, ox: 17, oy: 17 }), 84, 84)}<text x="137" y="190" font-family="Arial, sans-serif" font-size="26" fill="${accent}">→</text>${questionMarkBox(160, 140, 84, 84)}`;
    const optionBoxes = options.map((pattern, index) => panel(282 + index * 68, 88, labels[index], renderPattern(pattern, { cell: 17, ox: 11, oy: 11 }), 56, 56)).join("");
    return baseSvg(640, 252, `${top}${bottom}${optionBoxes}`);
  }

  function groupMembershipSvg(examples, options) {
    const exampleBoxes = examples.map((pattern, index) => panel(
      62 + index * 106,
      52,
      "",
      patternMarkup(pattern, { cell: 23, ox: 18, oy: 17 }),
      84,
      84
    )).join("");
    const optionBoxes = options.map((pattern, index) => panel(
      26 + index * 122,
      164,
      labels[index],
      patternMarkup(pattern, { cell: 19, ox: 13, oy: 12 }),
      72,
      72
    )).join("");

    return baseSvg(660, 270, `
      <text x="170" y="34" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="${ink}">These belong to one group</text>
      <text x="330" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="${ink}">Which option belongs with the group?</text>
      ${exampleBoxes}
      ${optionBoxes}`);
  }

  function seriesSvg(sequence, options) {
    const sequenceBoxes = sequence.map((pattern, index) => panel(
      36 + index * 118,
      52,
      "",
      patternMarkup(pattern, { cell: 22, ox: 16, oy: 16 }),
      82,
      82
    )).join("");
    const arrows = [0, 1, 2].map(index => (
      `<text x="${130 + index * 118}" y="102" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="${accent}">→</text>`
    )).join("");
    const optionBoxes = options.map((pattern, index) => panel(
      24 + index * 124,
      176,
      labels[index],
      patternMarkup(pattern, { cell: 19, ox: 13, oy: 12 }),
      74,
      74
    )).join("");

    return baseSvg(660, 286, `
      <text x="184" y="34" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="${ink}">Look at the sequence</text>
      <text x="330" y="160" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="${ink}">Which picture comes next?</text>
      ${sequenceBoxes}
      ${arrows}
      ${questionMarkBox(390, 52, 82, 82)}
      ${optionBoxes}`);
  }

  function makeQuestion(topic, question, answer, difficulty, image, alt) {
    return {
      id: nextId++,
      topic,
      question,
      options: optionCopy.slice(),
      answer,
      difficulty,
      questionImage: image,
      questionImageAlt: alt
    };
  }

  function makeLayoutTokens(layout, shapeA, shapeB, diffIndices, extra = {}) {
    return layout.map(([col, row], index) => ({
      row,
      col,
      kind: diffIndices.includes(index) ? shapeB : shapeA,
      hollow: extra.hollowIndices?.includes(index) || false,
      rotate: extra.rotateMap?.[index] || 0
    }));
  }

  function pickDistinctFrom(seed, salt, excluded) {
    let kind = pick(shapes, seed, salt);
    let offset = 1;
    while (excluded.includes(kind) && offset < shapes.length + 3) {
      kind = pick(shapes, seed, salt + offset);
      offset += 1;
    }
    return kind;
  }

  function makeRingTokens(outerKind, centerKind, accentKind, accentIndices = [], extra = {}) {
    return ringLayout.map(([col, row], index) => ({
      row,
      col,
      kind: index === 2 ? centerKind : (accentIndices.includes(index) ? accentKind : outerKind),
      hollow: extra.hollowIndices?.includes(index) || false,
      rotate: extra.rotateMap?.[index] || 0
    }));
  }

  function makeCrossPairTokens(lrKind, tbKind, centerKind, extra = {}) {
    const outerKinds = [tbKind, lrKind, lrKind, tbKind];
    const base = crossLayout.map(([col, row], index) => ({
      row,
      col,
      kind: extra.oddIndex === index ? extra.oddKind : outerKinds[index],
      hollow: extra.hollowIndices?.includes(index) || false,
      rotate: extra.rotateMap?.[index] || 0
    }));
    base.push({
      row: 1,
      col: 1,
      kind: extra.centerKind || centerKind,
      hollow: extra.hollowIndices?.includes(4) || false,
      rotate: extra.rotateMap?.[4] || 0
    });
    return base;
  }

  function makeReflectionTokens(seed, salt, axis) {
    const layout = rotateCells(pick(reflectionLayouts, seed, salt), pickIndex(4, seed, salt + 1));
    const primary = pick(shapes, seed, salt + 2);
    const secondary = pickDistinctShape(seed, salt + 3, primary);
    const accentIndex = pickIndex(layout.length, seed, salt + 4);
    const mode = pickIndex(4, seed, salt + 5);

    return layout.map(([col, row], index) => {
      if (mode === 0) {
        return { row, col, kind: index === accentIndex ? secondary : primary, hollow: index % 2 === 0 };
      }
      if (mode === 1) {
        return { row, col, kind: (index + seed) % 2 === 0 ? primary : secondary, hollow: col === 0 || row === 2 };
      }
      if (mode === 2) {
        return { row, col, kind: primary, hollow: index === accentIndex || (col + row + seed) % 2 === 0 };
      }

      const verticalRotation = col === 0 ? 90 : col === 2 ? 270 : row === 0 ? 180 : 0;
      const horizontalRotation = row === 0 ? 180 : row === 2 ? 0 : col === 0 ? 90 : 270;
      return {
        row,
        col,
        kind: "triangle",
        hollow: index % 2 === 1,
        rotate: axis === "vertical" ? verticalRotation : horizontalRotation
      };
    });
  }

  function genOddOneOut(seed) {
    const answer = pickIndex(5, seed, 1);
    const variant = pickIndex(6, seed, 2);
    let panels = [];

    if (variant === 0) {
      const shapeA = pick(shapes, seed, 2);
      const shapeB = pickDistinctShape(seed, 3, shapeA);
      const start = pickIndex(4, seed, 4);
      const regularDiffs = [0, 1, 2, 3].map((_, index) => (start + index) % 4);
      let regularIndex = 0;
      panels = Array.from({ length: 5 }, (_, index) => {
        if (index === answer) {
          return { tokens: makeLayoutTokens(cornerLayout, shapeA, shapeB, [regularDiffs[0], regularDiffs[2]]) };
        }
        return { tokens: makeLayoutTokens(cornerLayout, shapeA, shapeB, [regularDiffs[regularIndex++]]) };
      });
    } else if (variant === 1) {
      const shapeA = pick(shapes, seed, 5);
      const centerA = pickDistinctShape(seed, 6, shapeA);
      const centerB = pickDistinctShape(seed, 7, centerA);
      const start = pickIndex(4, seed, 8);
      const hollowOrder = [0, 1, 2, 3].map((_, index) => (start + index) % 4);
      let regularIndex = 0;
      panels = Array.from({ length: 5 }, (_, index) => {
        const centerKind = index % 2 === 0 ? centerA : centerB;
        if (index === answer) {
          return {
            tokens: [
              ...makeLayoutTokens(crossLayout, shapeA, shapeA, [], { hollowIndices: [hollowOrder[0], hollowOrder[2]] }),
              { row: 1, col: 1, kind: centerKind, hollow: index % 3 === 0 }
            ]
          };
        }
        return {
          tokens: [
            ...makeLayoutTokens(crossLayout, shapeA, shapeA, [], { hollowIndices: [hollowOrder[regularIndex++]] }),
            { row: 1, col: 1, kind: centerKind, hollow: index % 3 === 0 }
          ]
        };
      });
    } else if (variant === 2) {
      const centerKinds = [
        pick(shapes, seed, 9),
        pickDistinctShape(seed, 10, pick(shapes, seed, 9)),
        pickDistinctShape(seed, 11, pickDistinctShape(seed, 10, pick(shapes, seed, 9))),
        pick(shapes, seed, 12)
      ];
      const directionMaps = [
        { 0: 180, 1: 90, 2: 270, 3: 0 },
        { 0: 0, 1: 270, 2: 90, 3: 180 },
        { 0: 90, 1: 180, 2: 0, 3: 270 },
        { 0: 270, 1: 0, 2: 180, 3: 90 }
      ];
      const baseMapIndex = pickIndex(directionMaps.length, seed, 13);
      const baseMap = directionMaps[baseMapIndex];
      const wrongMap = directionMaps[(baseMapIndex + 1 + pickIndex(3, seed, 14)) % directionMaps.length];
      const wrongArrow = pickIndex(4, seed, 15);
      panels = Array.from({ length: 5 }, (_, index) => {
        const arrowTokens = crossLayout.map(([col, row], arrowIndex) => ({
          row,
          col,
          kind: "triangle",
          hollow: (index + arrowIndex + seed) % 2 === 0,
          rotate: index === answer && arrowIndex === wrongArrow
            ? wrongMap[arrowIndex]
            : baseMap[arrowIndex]
        }));
        const center = { row: 1, col: 1, kind: centerKinds[index % centerKinds.length], hollow: index % 2 === 0 };
        return { tokens: [...arrowTokens, center] };
      });
    } else if (variant === 3) {
      const outerKind = pick(shapes, seed, 16);
      const accentKind = pickDistinctShape(seed, 17, outerKind);
      const centerKind = pickDistinctFrom(seed, 18, [outerKind, accentKind]);
      const outerIndices = [0, 1, 3, 4];
      const start = pickIndex(outerIndices.length, seed, 19);
      const regularOrder = outerIndices.map((_, index) => outerIndices[(start + index) % outerIndices.length]);
      let regularIndex = 0;
      panels = Array.from({ length: 5 }, (_, index) => {
        if (index === answer) {
          return { tokens: makeRingTokens(outerKind, centerKind, accentKind, [regularOrder[0], regularOrder[2]], { hollowIndices: [2] }) };
        }
        const accentIndex = regularOrder[regularIndex++];
        return { tokens: makeRingTokens(outerKind, centerKind, accentKind, [accentIndex], { hollowIndices: [2] }) };
      });
    } else if (variant === 4) {
      let base = rotateCells(pick(reflectionLayouts, seed, 20), pickIndex(4, seed, 21));
      if (pickIndex(2, seed, 22) === 0) {
        const extra = [[2, 2]];
        base = normalizeCells([...base, ...extra]);
      }
      const oddCells = pickIndex(2, seed, 24) === 0 ? reflectCells(base, "vertical") : shiftCells(base, 1, 0);
      const rotations = [0, 1, 2, 3].map(turns => ({ cells: rotateCells(base, turns) }));
      let regularIndex = 0;
      panels = Array.from({ length: 5 }, (_, index) => {
        if (index === answer) return { cells: oddCells };
        return rotations[regularIndex++];
      });
    } else {
      const shapeA = pick(shapes, seed, 25);
      const shapeB = pickDistinctShape(seed, 26, shapeA);
      const shapeC = pickDistinctFrom(seed, 27, [shapeA, shapeB]);
      const regularConfigs = [
        { lr: shapeA, tb: shapeB, center: shapeC, hollowIndices: [4] },
        { lr: shapeB, tb: shapeC, center: shapeA, hollowIndices: [1, 2] },
        { lr: shapeC, tb: shapeA, center: shapeB, hollowIndices: [0, 3] },
        { lr: shapeA, tb: shapeC, center: shapeB, hollowIndices: [4, 0, 3] }
      ];
      let regularIndex = 0;
      panels = Array.from({ length: 5 }, (_, index) => {
        if (index === answer) {
          return {
            tokens: makeCrossPairTokens(shapeA, shapeB, shapeC, {
              oddIndex: pickIndex(4, seed, 28),
              oddKind: pickDistinctFrom(seed, 29, [shapeA, shapeB]),
              hollowIndices: [4]
            })
          };
        }
        const config = regularConfigs[regularIndex++];
        return {
          tokens: makeCrossPairTokens(config.lr, config.tb, config.center, { hollowIndices: config.hollowIndices })
        };
      });
    }

    if (variant === 2) {
      panels = panels.map(pattern => clonePattern(pattern));
    }

    return makeQuestion(
      "NVRT Odd One Out",
      "Which picture is the odd one out?",
      answer,
      diffLevel(seed),
      oddOneOutSvg(panels),
      "Generated original odd-one-out NVRT puzzle."
    );
  }

  function genGrid(seed) {
    const variant = pickIndex(5, seed, 60);
    let cells;
    let optionPatterns;
    let answer;

    if (variant === 0) {
      const a = rotateCells(pick([...cellTemplates, ...reflectionLayouts], seed, 10), pickIndex(4, seed, 11));
      let c = rotateCells(pick([...reflectionLayouts, ...cellTemplates], seed, 12), pickIndex(4, seed, 13));
      if (pickIndex(3, seed, 14) === 0) {
        c = normalizeCells([...c, ...shiftCells([[2, 2]], pickIndex(2, seed, 15), 0)]);
      }
      const step = pickIndex(3, seed, 16) + 1;
      const correct = { cells: rotateCells(c, step) };
      const placed = placeOptions(correct, [
        { cells: rotateCells(c, step + 1) },
        { cells: rotateCells(c, step + 3) },
        { cells: reflectCells(c, pickIndex(2, seed, 17) === 0 ? "vertical" : "horizontal") },
        { cells: c }
      ], seed);
      answer = placed.answer;
      optionPatterns = placed.options;
      cells = [{ cells: a }, { cells: rotateCells(a, step) }, { cells: c }];
    } else if (variant === 1) {
      const basePositions = pick([
        [[1, 1]],
        [[1, 0], [1, 2]],
        [[0, 1], [2, 1]],
        [[0, 0], [2, 2]],
        [[0, 2], [2, 0]],
        [[0, 0], [1, 1], [2, 2]],
        [[0, 2], [1, 1], [2, 0]]
      ], seed, 18);
      const extraPositions = [[0, 1], [1, 0], [1, 2], [2, 1], [0, 0], [0, 2], [2, 0], [2, 2]]
        .filter(([col, row]) => !basePositions.some(([bc, br]) => bc === col && br === row));
      const addAt = pickIndex(extraPositions.length, seed, 19);
      const extraPos = extraPositions[addAt];
      const shapeA = pick(shapes, seed, 20);
      const shapeB = pickDistinctShape(seed, 21, shapeA);
      const hollowBase = pickIndex(2, seed, 22) === 0;
      const a = { tokens: basePositions.map(([col, row], index) => ({ row, col, kind: shapeA, hollow: hollowBase && index % 2 === 0 })) };
      const b = { tokens: [...a.tokens, { row: extraPos[1], col: extraPos[0], kind: shapeA, hollow: hollowBase }] };
      const c = { tokens: basePositions.map(([col, row], index) => ({ row, col, kind: shapeB, hollow: !hollowBase || index % 2 === 1 })) };
      const correct = { tokens: [...c.tokens, { row: extraPos[1], col: extraPos[0], kind: shapeB, hollow: !hollowBase }] };
      const placed = placeOptions(correct, [
        { tokens: c.tokens.map(token => ({ ...token })) },
        { tokens: [...c.tokens, { row: extraPositions[(addAt + 1) % 4][1], col: extraPositions[(addAt + 1) % 4][0], kind: shapeB, hollow: true }] },
        { tokens: [...c.tokens, { row: extraPos[1], col: extraPos[0], kind: shapeA }] },
        { tokens: [...c.tokens, { row: extraPos[1], col: extraPos[0], kind: shapeB }] }
      ], seed);
      answer = placed.answer;
      optionPatterns = placed.options;
      cells = [a, b, c];
    } else if (variant === 2) {
      const shapeA = pick(shapes, seed, 23);
      const shapeB = pickDistinctShape(seed, 24, shapeA);
      const baseOptions = [
        { base: [[1, 0], [1, 2]], add: [0, 1] },
        { base: [[0, 1], [2, 1]], add: [1, 0] },
        { base: [[0, 0], [2, 2]], add: [1, 1] },
        { base: [[0, 2], [2, 0]], add: [1, 1] },
        { base: [[0, 1], [1, 2]], add: [2, 1] }
      ];
      const chosen = pick(baseOptions, seed, 25);
      const a = { tokens: chosen.base.map(([col, row], index) => ({ row, col, kind: shapeA, hollow: index % 2 === 0 })) };
      const b = { tokens: [...a.tokens, { row: chosen.add[1], col: chosen.add[0], kind: shapeA, hollow: true }] };
      const c = { tokens: chosen.base.map(([col, row], index) => ({ row, col, kind: shapeB, hollow: index % 2 === 1 })) };
      const correct = { tokens: [...c.tokens, { row: chosen.add[1], col: chosen.add[0], kind: shapeB, hollow: true }] };
      const placed = placeOptions(correct, [
        { tokens: [...c.tokens, { row: 1, col: 1, kind: shapeB, hollow: true }] },
        { tokens: [...c.tokens, { row: chosen.add[1], col: chosen.add[0], kind: shapeB }] },
        { tokens: [...c.tokens, { row: chosen.add[1], col: chosen.add[0], kind: shapeA, hollow: true }] },
        { tokens: c.tokens.map(token => ({ ...token, hollow: !token.hollow })) }
      ], seed);
      answer = placed.answer;
      optionPatterns = placed.options;
      cells = [a, b, c];
    } else if (variant === 3) {
      const base = rotateCells(pick([...reflectionLayouts, ...cellTemplates], seed, 26), pickIndex(4, seed, 27));
      const dx = pickIndex(2, seed, 28) + 1;
      const dy = pickIndex(2, seed, 29) + 1;
      const b = { cells: shiftCells(base, dx, 0) };
      const c = { cells: shiftCells(base, 0, dy) };
      const correct = { cells: shiftCells(base, dx, dy) };
      const placed = placeOptions(correct, [
        { cells: shiftCells(base, dx, dx) },
        { cells: shiftCells(base, dy, dy) },
        { cells: rotateCells(base, 1) },
        { cells: reflectCells(base, pickIndex(2, seed, 30) === 0 ? "vertical" : "horizontal") }
      ], seed);
      answer = placed.answer;
      optionPatterns = placed.options;
      cells = [{ cells: base }, b, c];
    } else {
      const sourceLayouts = [
        [[0, 0], [2, 2]],
        [[0, 2], [2, 0]],
        [[1, 0], [2, 1]],
        [[0, 1], [1, 2]],
        [[0, 0], [1, 1], [2, 2]],
        [[0, 2], [1, 1], [2, 0]]
      ];
      const aLayout = pick(sourceLayouts, seed, 31);
      const cLayout = rotateCells(pick(sourceLayouts, seed, 32), pickIndex(4, seed, 33));
      const shapeA = pick(shapes, seed, 34);
      const shapeB = pickDistinctShape(seed, 35, shapeA);
      const extraPos = pick([[1, 1], [0, 1], [1, 0], [2, 1], [1, 2]], seed, 36);
      const useTriangles = shapeB === "triangle" || pickIndex(2, seed, 37) === 0;
      const makeBaseTokens = (layout, kind) => layout.map(([col, row], index) => ({
        row,
        col,
        kind,
        hollow: index % 2 === 0,
        rotate: kind === "triangle" ? ((index + seed) % 4) * 90 : 0
      }));
      const transformTokens = (tokens, originalKind) => ([
        ...tokens.map((token, index) => ({
          ...token,
          kind: useTriangles ? "triangle" : shapeB,
          hollow: !token.hollow,
          rotate: useTriangles ? rotateTokenAngle(token.rotate || 0, 1 + (index % 2)) : 0
        })),
        {
          row: extraPos[1],
          col: extraPos[0],
          kind: useTriangles ? "triangle" : shapeB,
          hollow: false,
          rotate: useTriangles ? 90 : 0
        }
      ]);
      const a = { tokens: makeBaseTokens(aLayout, shapeA) };
      const b = { tokens: transformTokens(a.tokens, shapeA) };
      const c = { tokens: makeBaseTokens(cLayout, shapeA) };
      const correct = { tokens: transformTokens(c.tokens, shapeA) };
      const placed = placeOptions(correct, [
        { tokens: c.tokens.map(token => ({ ...token, kind: useTriangles ? "triangle" : shapeB, hollow: !token.hollow })) },
        { tokens: [...correct.tokens.slice(0, -1), { ...correct.tokens[correct.tokens.length - 1], row: (extraPos[1] + 1) % 3 }] },
        { tokens: correct.tokens.map((token, index) => ({ ...token, kind: index === correct.tokens.length - 1 ? shapeA : token.kind })) },
        { tokens: c.tokens.map(token => ({ ...token })) }
      ], seed);
      answer = placed.answer;
      optionPatterns = placed.options;
      cells = [a, b, c];
    }

    return makeQuestion(
      "NVRT Grid",
      "Which picture should replace the missing box?",
      answer,
      diffLevel(seed, 3),
      gridSvg(cells, optionPatterns),
      "Generated original grid-completion NVRT puzzle."
    );
  }

  function genReflection(seed) {
    const variant = seed % 4;
    const axis = variant % 2 === 0 ? "vertical" : "horizontal";
    let source;

    if (variant < 2) {
      let cells = rotateCells(pick(reflectionLayouts, seed, 30), pickIndex(4, seed, 31));
      if (pickIndex(3, seed, 32) === 0) {
        const extra = shiftCells(pick(reflectionLayouts, seed, 33).slice(0, 2), pickIndex(2, seed, 34), pickIndex(2, seed, 35));
        cells = normalizeCells([...cells, ...extra]);
      }
      source = { cells };
    } else {
      source = { tokens: makeReflectionTokens(seed, 36, axis) };
    }

    source = ensureReflectablePattern(source, axis);
    const correct = reflectPattern(source, axis);
    const oppositeAxis = axis === "vertical" ? "horizontal" : "vertical";
    const placed = placeOptions(correct, [
      clonePattern(source),
      reflectPattern(source, oppositeAxis),
      rotatePattern(correct, 1 + pickIndex(2, seed, 37)),
      shiftPattern(correct, axis === "vertical" ? 0 : 1, axis === "vertical" ? 1 : 0),
      rotatePattern(source, 2)
    ], seed);

    return makeQuestion(
      "NVRT Reflection",
      "Which option shows the mirror image?",
      placed.answer,
      diffLevel(seed, 5),
      reflectionSvg(source, placed.options, axis),
      "Generated original reflection NVRT puzzle."
    );
  }

  function genAnalogy(seed) {
    const variant = pickIndex(6, seed, 160);
    let a; let b; let c; let correct; let distractors;
    const pairLayouts = [
      [[0, 1], [2, 1]],
      [[1, 0], [1, 2]],
      [[0, 0], [2, 2]],
      [[0, 2], [2, 0]],
      [[0, 1], [1, 2]],
      [[1, 0], [2, 1]]
    ];
    const lineLayouts = [
      [[1, 0], [1, 1], [1, 2]],
      [[0, 1], [1, 1], [2, 1]],
      [[0, 0], [1, 1], [2, 2]],
      [[0, 2], [1, 1], [2, 0]],
      [[0, 0], [0, 2], [2, 0], [2, 2]]
    ];

    if (variant === 0) {
      const pair = pick(pairLayouts, seed, 161);
      const altPair = pairLayouts[(pickIndex(pairLayouts.length, seed, 162) + 1) % pairLayouts.length];
      const shapeA = pick(shapes, seed, 163);
      const shapeB = pickDistinctShape(seed, 164, shapeA);
      const makePairTokens = (layout, kind, addSecond, hollow = false) => layout.slice(0, addSecond ? 2 : 1).map(([col, row], index) => ({
        row,
        col,
        kind,
        hollow,
        rotate: kind === "triangle" ? (index * 90) % 360 : 0
      }));
      a = { tokens: makePairTokens(pair, shapeA, false, pickIndex(2, seed, 165) === 0) };
      b = { tokens: makePairTokens(pair, shapeA, true, a.tokens[0].hollow) };
      c = { tokens: makePairTokens(pair, shapeB, false, !a.tokens[0].hollow) };
      correct = { tokens: makePairTokens(pair, shapeB, true, !a.tokens[0].hollow) };
      distractors = [
        { tokens: makePairTokens(altPair, shapeB, true, !a.tokens[0].hollow) },
        { tokens: [...makePairTokens(pair, shapeB, true, !a.tokens[0].hollow), { row: 1, col: 1, kind: pickDistinctShape(seed, 166, shapeB) }] },
        { tokens: makePairTokens(pair, shapeA, true, !a.tokens[0].hollow) },
        { tokens: [{ row: pair[0][1], col: pair[0][0], kind: shapeB, hollow: !a.tokens[0].hollow }, { row: 1, col: 1, kind: shapeB, hollow: !a.tokens[0].hollow }] }
      ];
    } else if (variant === 1) {
      const transform = pick(["rotate", "reflect"], seed, 167);
      const baseA = { cells: rotateCells(pick([...cellTemplates, ...reflectionLayouts], seed, 168), pickIndex(4, seed, 169)) };
      const baseC = { cells: rotateCells(pick([...reflectionLayouts, ...cellTemplates], seed, 170), pickIndex(4, seed, 171)) };
      a = baseA;
      c = baseC;
      if (transform === "rotate") {
        const step = pick([1, 3], seed, 172);
        b = rotatePattern(baseA, step);
        correct = rotatePattern(baseC, step);
        distractors = [
          rotatePattern(baseC, step + 1),
          rotatePattern(baseC, step + 2),
          reflectPattern(baseC, "vertical"),
          clonePattern(baseC)
        ];
      } else {
        const axis = pick(["vertical", "horizontal"], seed, 173);
        const oppositeAxis = axis === "vertical" ? "horizontal" : "vertical";
        b = reflectPattern(baseA, axis);
        correct = reflectPattern(baseC, axis);
        distractors = [
          reflectPattern(baseC, oppositeAxis),
          rotatePattern(baseC, 1),
          shiftPattern(correct, 1, 0),
          clonePattern(baseC)
        ];
      }
    } else if (variant === 2) {
      const layoutA = pick(lineLayouts, seed, 174);
      const layoutC = rotateCells(pick(lineLayouts, seed, 175), pickIndex(4, seed, 176));
      const shapeA = pick(shapes, seed, 177);
      const shapeB = pickDistinctShape(seed, 178, shapeA);
      const hollowStart = pickIndex(2, seed, 179) === 0;
      const makeLineTokens = (layout, kind, hollowBase) => layout.map(([col, row], index) => ({
        row,
        col,
        kind,
        hollow: hollowBase ? index % 2 === 0 : index % 2 === 1,
        rotate: kind === "triangle" ? (index * 90) % 360 : 0
      }));
      a = { tokens: makeLineTokens(layoutA, shapeA, hollowStart) };
      b = { tokens: makeLineTokens(layoutA, shapeA, !hollowStart) };
      c = { tokens: makeLineTokens(layoutC, shapeB, hollowStart) };
      correct = { tokens: makeLineTokens(layoutC, shapeB, !hollowStart) };
      distractors = [
        { tokens: c.tokens.map(token => ({ ...token })) },
        { tokens: correct.tokens.map((token, index) => ({ ...token, hollow: index === 1 })) },
        { tokens: correct.tokens.map(token => ({ ...token, kind: shapeA })) },
        { tokens: makeLineTokens(rotateCells(layoutC, 1), shapeB, !hollowStart) }
      ];
    } else if (variant === 3) {
      const pairA = pick(pairLayouts, seed, 180);
      const pairC = pick(pairLayouts, seed, 181);
      const leftKind = pick(shapes, seed, 182);
      const rightKind = pickDistinctShape(seed, 183, leftKind);
      const newKind = pickDistinctFrom(seed, 184, [leftKind, rightKind]);
      const makePair = (layout, firstKind, secondKind) => ([
        { row: layout[0][1], col: layout[0][0], kind: firstKind },
        { row: layout[1][1], col: layout[1][0], kind: secondKind }
      ]);
      a = { tokens: makePair(pairA, leftKind, rightKind) };
      b = { tokens: [...makePair(pairA, leftKind, rightKind), { row: 1, col: 1, kind: newKind, hollow: true }] };
      c = { tokens: makePair(pairC, rightKind, leftKind) };
      correct = { tokens: [...makePair(pairC, rightKind, leftKind), { row: 1, col: 1, kind: newKind, hollow: true }] };
      distractors = [
        { tokens: [...c.tokens] },
        { tokens: [...makePair(pairC, rightKind, leftKind), { row: 1, col: 1, kind: leftKind }] },
        { tokens: [...makePair(pairA, rightKind, leftKind), { row: 1, col: 1, kind: newKind, hollow: true }] },
        { tokens: [...makePair(pairC, newKind, leftKind), { row: 1, col: 1, kind: rightKind, hollow: true }] }
      ];
    } else if (variant === 4) {
      const outer = pick(shapes, seed, 185);
      const accent = pickDistinctShape(seed, 186, outer);
      const center = pickDistinctFrom(seed, 187, [outer, accent]);
      const outerIndices = [0, 1, 3, 4];
      const startA = pickIndex(outerIndices.length, seed, 188);
      const startC = pickIndex(outerIndices.length, seed, 189);
      const nextA = outerIndices[(outerIndices.indexOf(outerIndices[startA]) + 1) % outerIndices.length];
      const nextC = outerIndices[(outerIndices.indexOf(outerIndices[startC]) + 1) % outerIndices.length];
      a = { tokens: makeRingTokens(outer, center, accent, [outerIndices[startA]], { hollowIndices: [2] }) };
      b = { tokens: makeRingTokens(outer, center, accent, [nextA], { hollowIndices: [2] }) };
      c = { tokens: makeRingTokens(accent, outer, center, [outerIndices[startC]], { hollowIndices: [] }) };
      correct = { tokens: makeRingTokens(accent, outer, center, [nextC], { hollowIndices: [] }) };
      distractors = [
        { tokens: makeRingTokens(accent, outer, center, [outerIndices[startC]], { hollowIndices: [] }) },
        { tokens: makeRingTokens(accent, outer, center, [outerIndices[(outerIndices.indexOf(outerIndices[startC]) + 3) % outerIndices.length]], { hollowIndices: [] }) },
        { tokens: makeRingTokens(accent, center, outer, [nextC], { hollowIndices: [2] }) },
        { tokens: makeRingTokens(accent, outer, center, [nextC, outerIndices[startC]], { hollowIndices: [] }) }
      ];
    } else {
      const lr = pick(shapes, seed, 190);
      const tb = pickDistinctShape(seed, 191, lr);
      const center = pickDistinctFrom(seed, 192, [lr, tb]);
      const p = pickDistinctFrom(seed, 193, [lr, tb, center]);
      const q = pickDistinctFrom(seed, 194, [p]);
      const r = pickDistinctFrom(seed, 195, [p, q]);
      a = { tokens: makeCrossPairTokens(lr, tb, center, { hollowIndices: [4] }) };
      b = { tokens: makeCrossPairTokens(tb, center, lr, { hollowIndices: [0, 3] }) };
      c = { tokens: makeCrossPairTokens(p, q, r, { hollowIndices: [4] }) };
      correct = { tokens: makeCrossPairTokens(q, r, p, { hollowIndices: [0, 3] }) };
      distractors = [
        { tokens: makeCrossPairTokens(r, q, p, { hollowIndices: [0, 3] }) },
        { tokens: makeCrossPairTokens(q, p, r, { hollowIndices: [0, 3] }) },
        { tokens: makeCrossPairTokens(q, r, p, { hollowIndices: [4] }) },
        { tokens: makeCrossPairTokens(p, q, r, { hollowIndices: [0, 3] }) }
      ];
    }

    const placed = placeOptions(correct, distractors, seed);
    return makeQuestion(
      "NVRT Analogy",
      "A changes to B. Which option should replace the missing picture?",
      placed.answer,
      diffLevel(seed, 7),
      analogySvg(a, b, c, placed.options),
      "Generated original NVRT analogy puzzle."
    );
  }

  function genGroupMembership(seed) {
    const variant = pickIndex(4, seed, 70);
    let examples;
    let correct;
    let distractors;

    if (variant === 0) {
      const accentSlots = [0, 1, 3, 4];
      examples = [0, 1, 2].map(index => {
        const outer = pick(shapes, seed, 71 + index * 3);
        const accent = pickDistinctShape(seed, 72 + index * 3, outer);
        const center = pickDistinctFrom(seed, 73 + index * 3, [outer, accent]);
        return {
          tokens: makeRingTokens(
            outer,
            center,
            accent,
            [accentSlots[pickIndex(accentSlots.length, seed, 74 + index)]],
            { hollowIndices: [2] }
          )
        };
      });

      const outer = pick(shapes, seed, 80);
      const accent = pickDistinctShape(seed, 81, outer);
      const center = pickDistinctFrom(seed, 82, [outer, accent]);
      const accentIndex = accentSlots[pickIndex(accentSlots.length, seed, 83)];
      correct = { tokens: makeRingTokens(outer, center, accent, [accentIndex], { hollowIndices: [2] }) };
      distractors = [
        { tokens: makeRingTokens(outer, center, accent, [], { hollowIndices: [2] }) },
        { tokens: makeRingTokens(outer, center, accent, [accentIndex, accentSlots[(accentSlots.indexOf(accentIndex) + 2) % accentSlots.length]], { hollowIndices: [2] }) },
        { tokens: makeRingTokens(outer, outer, accent, [accentIndex], { hollowIndices: [] }) },
        { tokens: makeRingTokens(outer, center, accent, [accentIndex], { hollowIndices: [0, 2] }) }
      ];
    } else if (variant === 1) {
      examples = [0, 1, 2].map(index => {
        const lr = pick(shapes, seed, 90 + index * 3);
        const tb = pickDistinctShape(seed, 91 + index * 3, lr);
        const center = pickDistinctFrom(seed, 92 + index * 3, [lr, tb]);
        return { tokens: makeCrossPairTokens(lr, tb, center, { hollowIndices: [4] }) };
      });

      const lr = pick(shapes, seed, 100);
      const tb = pickDistinctShape(seed, 101, lr);
      const center = pickDistinctFrom(seed, 102, [lr, tb]);
      correct = { tokens: makeCrossPairTokens(lr, tb, center, { hollowIndices: [4] }) };
      distractors = [
        { tokens: makeCrossPairTokens(lr, tb, center, { oddIndex: 0, oddKind: center, hollowIndices: [4] }) },
        { tokens: makeCrossPairTokens(lr, lr, center, { hollowIndices: [4] }) },
        { tokens: makeCrossPairTokens(lr, tb, lr, { hollowIndices: [4] }) },
        { tokens: makeCrossPairTokens(tb, center, lr, { hollowIndices: [] }) }
      ];
    } else if (variant === 2) {
      const base = ensureReflectablePattern({ cells: rotateCells(pick(reflectionLayouts, seed, 110), pickIndex(4, seed, 111)) }, "vertical");
      examples = [
        base,
        rotatePattern(base, 1),
        rotatePattern(base, 2)
      ];
      correct = rotatePattern(base, 3);
      distractors = [
        reflectPattern(base, pickIndex(2, seed, 112) === 0 ? "vertical" : "horizontal"),
        shiftPattern(base, 1, 0),
        { cells: normalizeCells([...base.cells, [2, 2]]) },
        { cells: rotateCells(pick(cellTemplates, seed, 113), pickIndex(4, seed, 114)) }
      ];
    } else {
      const diagonals = [[0, 3], [1, 2]];
      examples = [0, 1, 2].map(index => {
        const shape = pick(shapes, seed, 120 + index);
        const diag = diagonals[pickIndex(diagonals.length, seed, 121 + index)];
        return { tokens: makeLayoutTokens(cornerLayout, shape, shape, [], { hollowIndices: diag }) };
      });

      const shape = pick(shapes, seed, 130);
      const diag = diagonals[pickIndex(diagonals.length, seed, 131)];
      correct = { tokens: makeLayoutTokens(cornerLayout, shape, shape, [], { hollowIndices: diag }) };
      distractors = [
        { tokens: makeLayoutTokens(cornerLayout, shape, shape, [], { hollowIndices: [0, 1] }) },
        { tokens: makeLayoutTokens(cornerLayout, shape, shape, [], { hollowIndices: [1] }) },
        { tokens: makeLayoutTokens(cornerLayout, shape, shape, [], { hollowIndices: [0, 1, 2] }) },
        { tokens: [...makeLayoutTokens(cornerLayout, shape, shape, [], { hollowIndices: diag }), { row: 1, col: 1, kind: pickDistinctShape(seed, 132, shape) }] }
      ];
    }

    const placed = placeOptions(correct, distractors, seed);
    return makeQuestion(
      "NVRT Group Membership",
      "Which picture belongs with the group?",
      placed.answer,
      diffLevel(seed, 9),
      groupMembershipSvg(examples, placed.options),
      "Generated original NVRT group-membership puzzle."
    );
  }

  function genSeries(seed) {
    const variant = pickIndex(4, seed, 140);
    let sequence;
    let correct;
    let distractors;

    if (variant === 0) {
      const step = pick([1, 3], seed, 141);
      const base = { cells: rotateCells(pick([...reflectionLayouts, ...cellTemplates], seed, 142), pickIndex(4, seed, 143)) };
      sequence = [base, rotatePattern(base, step), rotatePattern(base, step * 2)];
      correct = rotatePattern(base, step * 3);
      distractors = [
        rotatePattern(base, step * 2 + 1),
        reflectPattern(base, pickIndex(2, seed, 144) === 0 ? "vertical" : "horizontal"),
        shiftPattern(correct, 1, 0),
        shiftPattern(correct, 0, 1)
      ];
    } else if (variant === 1) {
      const order = pick([
        cornerLayout,
        crossLayout,
        [[0, 0], [1, 1], [2, 2], [0, 2]],
        [[0, 2], [1, 1], [2, 0], [2, 2]]
      ], seed, 145);
      const shape = pick(shapes, seed, 146);
      const altShape = pickDistinctShape(seed, 147, shape);
      const hollow = pickIndex(2, seed, 148) === 0;
      sequence = [1, 2, 3].map(count => ({
        tokens: order.slice(0, count).map(([col, row], index) => ({
          row,
          col,
          kind: shape,
          hollow: hollow ? index % 2 === 0 : false,
          rotate: shape === "triangle" ? (index * 90) % 360 : 0
        }))
      }));
      correct = {
        tokens: order.slice(0, 4).map(([col, row], index) => ({
          row,
          col,
          kind: shape,
          hollow: hollow ? index % 2 === 0 : false,
          rotate: shape === "triangle" ? (index * 90) % 360 : 0
        }))
      };
      distractors = [
        { tokens: correct.tokens.slice(0, 3) },
        { tokens: correct.tokens.map((token, index) => index === 3 ? { ...token, kind: altShape, hollow: false } : { ...token }) },
        { tokens: correct.tokens.map((token, index) => index === 3 ? { ...token, row: (token.row + 1) % 3 } : { ...token }) },
        { tokens: [...correct.tokens, { row: 1, col: 1, kind: altShape, hollow: true }] }
      ];
    } else if (variant === 2) {
      const outer = pick(shapes, seed, 149);
      const accent = pickDistinctShape(seed, 150, outer);
      const center = pickDistinctFrom(seed, 151, [outer, accent]);
      const outerIndices = [0, 1, 3, 4];
      const start = pickIndex(outerIndices.length, seed, 152);
      const order = outerIndices.map((_, index) => outerIndices[(start + index) % outerIndices.length]);
      sequence = order.slice(0, 3).map(accentIndex => ({
        tokens: makeRingTokens(outer, center, accent, [accentIndex], { hollowIndices: [2] })
      }));
      correct = { tokens: makeRingTokens(outer, center, accent, [order[3]], { hollowIndices: [2] }) };
      distractors = [
        { tokens: makeRingTokens(outer, center, accent, [order[2]], { hollowIndices: [2] }) },
        { tokens: makeRingTokens(outer, center, accent, [order[3], order[1]], { hollowIndices: [2] }) },
        { tokens: makeRingTokens(outer, outer, accent, [order[3]], { hollowIndices: [] }) },
        { tokens: makeRingTokens(outer, center, accent, [order[(start + 2) % 4]], { hollowIndices: [0, 2] }) }
      ];
    } else {
      const shapeA = pick(shapes, seed, 153);
      const shapeB = pickDistinctShape(seed, 154, shapeA);
      const diagonals = [[0, 3], [1, 2]];
      const diagStart = pickIndex(2, seed, 155);
      sequence = [0, 1, 2].map(index => ({
        tokens: makeLayoutTokens(
          cornerLayout,
          index % 2 === 0 ? shapeA : shapeB,
          index % 2 === 0 ? shapeA : shapeB,
          [],
          { hollowIndices: diagonals[(diagStart + index) % 2] }
        )
      }));
      correct = {
        tokens: makeLayoutTokens(cornerLayout, shapeB, shapeB, [], { hollowIndices: diagonals[(diagStart + 1) % 2] })
      };
      distractors = [
        { tokens: makeLayoutTokens(cornerLayout, shapeA, shapeA, [], { hollowIndices: diagonals[(diagStart + 1) % 2] }) },
        { tokens: makeLayoutTokens(cornerLayout, shapeB, shapeB, [], { hollowIndices: diagonals[diagStart] }) },
        { tokens: makeLayoutTokens(cornerLayout, shapeB, shapeB, [], { hollowIndices: [0, 1] }) },
        { tokens: [...makeLayoutTokens(cornerLayout, shapeB, shapeB, [], { hollowIndices: diagonals[(diagStart + 1) % 2] }), { row: 1, col: 1, kind: shapeA, hollow: false }] }
      ];
    }

    const placed = placeOptions(correct, distractors, seed);
    return makeQuestion(
      "NVRT Series",
      "Which picture comes next in the sequence?",
      placed.answer,
      diffLevel(seed, 11),
      seriesSvg(sequence, placed.options),
      "Generated original NVRT sequence puzzle."
    );
  }

  const generated = [];
  for (let i = 0; i < 240; i++) generated.push(genOddOneOut(i));
  for (let i = 0; i < 240; i++) generated.push(genGrid(i + 1000));
  for (let i = 0; i < 240; i++) generated.push(genReflection(i + 2000));
  for (let i = 0; i < 240; i++) generated.push(genAnalogy(i + 3000));
  for (let i = 0; i < 120; i++) generated.push(genGroupMembership(i + 4000));
  for (let i = 0; i < 120; i++) generated.push(genSeries(i + 5000));

  root.NVRT_QUESTIONS.push(...generated);
  console.log(`Loaded ${generated.length} generated NVRT questions. Total now: ${root.NVRT_QUESTIONS.length}`);
})();