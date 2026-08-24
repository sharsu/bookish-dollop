/* ═══════════════════════════════════════════════════════════════════
   MATHS DIAGRAMS

   Several question types in the QE and GL papers cannot be asked in words
   alone — reading a bar chart, a pie chart, a distance-time graph, a Venn
   diagram, a shaded shape. This module draws them as inline SVG and returns
   a data URI, the same mechanism js/questions-nvrt.js already uses: the
   question carries `questionImage` and `questionImageAlt`, and js/app.js
   renders it into #question-media.

   Every builder returns { image, alt }. The alt text carries the figure's data
   — the bar values, the sector angles, the numbers in each region — because
   that data is what the picture shows. Without it the question would be
   unanswerable to a child using a screen reader.

   Drawn at a fixed natural size and centred by the stylesheet, so a small
   diagram is not stretched across the card.
═══════════════════════════════════════════════════════════════════ */
(() => {
  const root = typeof window !== "undefined" ? window : globalThis;

  const INK = "#0f172a";
  const GRID = "#cbd5e1";
  const FILL = "#6366f1";
  const FILL_SOFT = "#c7d2fe";
  const FONT = "font-family='Segoe UI,Helvetica,Arial,sans-serif'";


  /* For alt text: "an isosceles triangle", "a rectangle". */
  const article = word => (/^[aeiou]/i.test(String(word).trim()) ? "an" : "a");

  const uri = svg =>
    `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/>\s+</g, "><").trim())}`;

  const wrap = (w, h, body) => uri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">` +
    `<rect width="${w}" height="${h}" fill="#ffffff"/>${body}</svg>`);

  const text = (x, y, s, opts = {}) =>
    `<text x="${x}" y="${y}" ${FONT} font-size="${opts.size || 13}" ` +
    `fill="${opts.fill || INK}" text-anchor="${opts.anchor || "middle"}" ` +
    `${opts.weight ? `font-weight="${opts.weight}"` : ""}>${escapeText(s)}</text>`;

  /* SVG is XML, so these five characters must be escaped even inside a data URI. */
  const escapeText = s => String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

  /* ── A rectangle of cells, some shaded ── */
  function shadedGrid({ cols, rows, shaded, cell = 30 }) {
    const w = cols * cell + 2, h = rows * cell + 2;
    let body = "";
    let n = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const on = n < shaded;
        body += `<rect x="${c * cell + 1}" y="${r * cell + 1}" width="${cell}" height="${cell}" ` +
                `fill="${on ? FILL_SOFT : "#ffffff"}" stroke="${INK}" stroke-width="1.5"/>`;
        n++;
      }
    }
    return { image: wrap(w, h, body),
             alt: `A grid of ${cols} by ${rows} squares with ${shaded} of them shaded.` };
  }

  /* ── Vertical bar chart ── */
  function barChart({ labels, values, axisLabel, step }) {
    const padL = 42, padB = 34, padT = 30, barW = 34, gap = 16;   // padT holds the axis title
    const maxV = Math.max(...values);
    const tick = step || Math.max(1, Math.ceil(maxV / 5));
    const top = Math.ceil(maxV / tick) * tick;
    const plotH = 150;
    const w = padL + labels.length * (barW + gap) + 14;
    const h = padT + plotH + padB;
    const y = v => padT + plotH - (v / top) * plotH;

    let body = `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="${INK}" stroke-width="1.5"/>` +
               `<line x1="${padL}" y1="${padT + plotH}" x2="${w - 6}" y2="${padT + plotH}" stroke="${INK}" stroke-width="1.5"/>`;
    for (let v = 0; v <= top; v += tick) {
      body += `<line x1="${padL - 4}" y1="${y(v)}" x2="${w - 6}" y2="${y(v)}" stroke="${GRID}" stroke-width="1"/>` +
              text(padL - 8, y(v) + 4, v, { anchor: "end", size: 11 });
    }
    values.forEach((v, i) => {
      const x = padL + 10 + i * (barW + gap);
      body += `<rect x="${x}" y="${y(v)}" width="${barW}" height="${padT + plotH - y(v)}" ` +
              `fill="${FILL}" stroke="${INK}" stroke-width="1"/>` +
              text(x + barW / 2, padT + plotH + 15, labels[i], { size: 11 });
    });
    /* Above the plot and left-aligned, clear of the tick numbers: anchored at
       the axis it overlapped the highest one. */
    if (axisLabel) body += text(4, 12, axisLabel, { anchor: "start", size: 11, fill: "#475569" });
    /* The alt text must carry the data, not just say a chart is present — the
       values are what the picture shows, and without them the question cannot
       be answered at all without sight. */
    return { image: wrap(w, h, body),
             alt: `A bar chart. ` + labels.map((l, k) => `${l}: ${values[k]}`).join(", ") +
                  `. Each gridline is ${tick}.` };
  }

  /* ── Pictogram: rows of symbols, each worth a fixed amount ── */
  function pictogram({ rows, per, symbol = "★" }) {
    const padL = 74, rowH = 26, w = padL + 8 * 22 + 10;
    const h = rows.length * rowH + 34;
    let body = "";
    rows.forEach(([label, count], i) => {
      const y = 20 + i * rowH;
      body += text(padL - 8, y + 4, label, { anchor: "end", size: 12 });
      for (let s = 0; s < count; s++) {
        body += text(padL + 10 + s * 22, y + 6, symbol, { size: 17, fill: FILL });
      }
    });
    body += text(padL, h - 8, `Each ${symbol} stands for ${per}`, { anchor: "start", size: 11, fill: "#475569" });
    return { image: wrap(w, h, body),
             alt: `A pictogram. Each symbol stands for ${per}. Rows: ` +
                  rows.map(([l, c]) => `${l} has ${c} symbols`).join(", ") + "." };
  }

  /* ── Pie chart from a list of [label, degrees] ── */
  function pieChart(sectors) {
    /* The legend sits at x = 206, so a fixed width of 260 left only 54px for
       the text and clipped the longer names. Size the canvas to the longest
       label instead. */
    const R = 74, cx = 90, cy = 88;
    const widest = Math.max(...sectors.map(([label]) => `${label}`.length)) * 12 * 0.62;
    const w = Math.max(260, 206 + widest + 10);
    const h = Math.max(186, 30 + sectors.length * 22);
    const shades = [FILL, FILL_SOFT, "#a5b4fc", "#e0e7ff", "#818cf8"];
    let angle = -90, body = "", legend = "";
    sectors.forEach(([label, deg], i) => {
      const a0 = angle * Math.PI / 180, a1 = (angle + deg) * Math.PI / 180;
      const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0);
      const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
      const large = deg > 180 ? 1 : 0;
      body += `<path d="M ${cx} ${cy} L ${x0.toFixed(1)} ${y0.toFixed(1)} ` +
              `A ${R} ${R} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" ` +
              `fill="${shades[i % shades.length]}" stroke="${INK}" stroke-width="1.5"/>`;
      legend += `<rect x="188" y="${26 + i * 22}" width="12" height="12" fill="${shades[i % shades.length]}" stroke="${INK}" stroke-width="1"/>` +
                text(206, 36 + i * 22, label, { anchor: "start", size: 12 });
      angle += deg;
    });
    return { image: wrap(w, h, body + legend),
             alt: `A pie chart. ` + sectors.map(s => `${s[0]}: ${s[1]} degrees`).join(", ") + `.` };
  }

  /* ── Distance-time graph from [hour, distance] points ── */
  function distanceTime({ points, xLabel = "Time (hours)", yLabel = "Distance (km)" }) {
    /* padT leaves room for the vertical-axis title above the plot. It used to
       be 14, with the title right-anchored at the axis - which pushed it off
       the left of the canvas and on top of the highest tick number. */
    const padL = 46, padB = 36, padT = 34, plotW = 210, plotH = 150;
    const w = padL + plotW + 16, h = padT + plotH + padB;
    const maxX = Math.max(...points.map(p => p[0]));
    const maxY = Math.max(...points.map(p => p[1]));
    const X = v => padL + (v / maxX) * plotW;
    const Y = v => padT + plotH - (v / maxY) * plotH;

    let body = "";
    for (let gx = 0; gx <= maxX; gx++) {
      body += `<line x1="${X(gx)}" y1="${padT}" x2="${X(gx)}" y2="${padT + plotH}" stroke="${GRID}" stroke-width="1"/>` +
              text(X(gx), padT + plotH + 15, gx, { size: 11 });
    }
    const yStep = maxY / 4;
    for (let k = 0; k <= 4; k++) {
      const v = yStep * k;
      body += `<line x1="${padL}" y1="${Y(v)}" x2="${padL + plotW}" y2="${Y(v)}" stroke="${GRID}" stroke-width="1"/>` +
              text(padL - 6, Y(v) + 4, v, { anchor: "end", size: 11 });
    }
    body += `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="${INK}" stroke-width="1.5"/>` +
            `<line x1="${padL}" y1="${padT + plotH}" x2="${padL + plotW}" y2="${padT + plotH}" stroke="${INK}" stroke-width="1.5"/>`;
    const path = points.map(p => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(" ");
    body += `<polyline points="${path}" fill="none" stroke="${FILL}" stroke-width="2.5"/>`;
    points.forEach(p => { body += `<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="3.5" fill="${FILL}"/>`; });
    body += text(padL + plotW / 2, h - 6, xLabel, { size: 11, fill: "#475569" }) +
            /* Above the plot and left-aligned to the canvas, so it is never
               clipped and never sits on a tick number. */
            text(4, padT - 16, yLabel, { anchor: "start", size: 11, fill: "#475569" });
    return { image: wrap(w, h, body),
             alt: `A distance-time graph passing through ${points.map(p => `(${p[0]}, ${p[1]})`).join(", ")}.` };
  }

  /* ── Two overlapping sets ── */
  function vennTwo({ labelA, labelB, onlyA, both, onlyB, outside }) {
    const w = 300, h = 190;
    let body = `<rect x="6" y="6" width="${w - 12}" height="${h - 34}" fill="none" stroke="${INK}" stroke-width="1.5"/>` +
               `<circle cx="112" cy="88" r="62" fill="${FILL_SOFT}" fill-opacity="0.55" stroke="${INK}" stroke-width="1.5"/>` +
               `<circle cx="188" cy="88" r="62" fill="#fde68a" fill-opacity="0.55" stroke="${INK}" stroke-width="1.5"/>` +
               text(74, 92, onlyA, { size: 15, weight: 700 }) +
               text(150, 92, both, { size: 15, weight: 700 }) +
               text(226, 92, onlyB, { size: 15, weight: 700 }) +
               text(74, 34, labelA, { size: 12 }) +
               text(226, 34, labelB, { size: 12 });
    if (outside !== undefined) body += text(w - 20, h - 42, outside, { size: 13, anchor: "end" });
    return { image: wrap(w, h, body),
             alt: `A Venn diagram. ${labelA} only: ${onlyA}. Both: ${both}. ${labelB} only: ${onlyB}.` +
                  (outside !== undefined ? ` Outside both: ${outside}.` : "") };
  }

  /* ── L-shaped compound figure with the sides labelled ── */
  /* The notch is cut from the bottom-right corner, so the shape has six sides.
     Only four are labelled - the enclosing width and height, and the two sides
     of the cut - which is what both the area and the perimeter question need.

     Placement is the whole difficulty. The first version put the cut's vertical
     measurement at x = W, beside the empty corner rather than beside the edge it
     describes, and at the same height as the horizontal one, so the two read as
     "3 cm 4 cm" side by side and neither was attached to anything. Each label now
     sits against its own edge, and the vertical one is pulled clear of the figure
     with a leader line, because a 2 cm notch is too narrow to hold the text. */
  function lShape({ W, H, w, h, unit = "cm" }) {
    const s = 14, ox = 38, oy = 26;
    const px = v => ox + v * s, py = v => oy + v * s;
    const outline = [
      [0, 0], [W, 0], [W, H - h], [W - w, H - h], [W - w, H], [0, H]
    ].map(([x, y]) => `${px(x)},${py(y)}`).join(" ");

    const rule = (x1, y1, x2, y2) =>
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ` +
      `stroke="${INK}" stroke-width="1" stroke-dasharray="3 2"/>`;

    /* The leader runs from just right of the cut's vertical edge out past the
       figure, to where that measurement is written. */
    const leaderY = py(H - h / 2);
    const labelX = px(W) + 14;

    const body =
      `<polygon points="${outline}" fill="${FILL_SOFT}" stroke="${INK}" stroke-width="2"/>` +
      text(px(W / 2), py(0) - 8, `${W} ${unit}`, { size: 12 }) +
      text(px(0) - 10, py(H / 2) + 4, `${H} ${unit}`, { anchor: "end", size: 12 }) +
      /* The cut's horizontal side: written just above the edge it measures, so
         it cannot be mistaken for the vertical one below it. */
      text(px(W - w / 2), py(H - h) - 7, `${w} ${unit}`, { size: 12 }) +
      /* The cut's vertical side: leader out to the right, clear of the figure. */
      rule(px(W - w) + 3, leaderY, labelX - 4, leaderY) +
      text(labelX, leaderY + 4, `${h} ${unit}`, { anchor: "start", size: 12 });

    return { image: wrap(labelX + 46, py(H) + 18, body),
             alt: `An L-shaped figure formed by removing a ${w} by ${h} ${unit} corner ` +
                  `from a ${W} by ${H} ${unit} rectangle. The full width is ${W} ${unit} ` +
                  `and the full height is ${H} ${unit}; the cut-out corner measures ` +
                  `${w} ${unit} across and ${h} ${unit} down.` };
  }

  /* ── Angles meeting at a point on a straight line ── */
  function anglesOnLine({ known, unknownLabel = "x", onLine = true }) {
    /* A half turn only uses the space above the line, but a full turn needs
       the circle in both directions - the shared height of 130 cut off every
       ray and label below the centre. */
    const w = 300, R = 74;
    const h = onLine ? 130 : 200, cx = 150, cy = onLine ? 100 : 100;
    const total = onLine ? 180 : 360;
    let body = onLine
      ? `<line x1="20" y1="${cy}" x2="280" y2="${cy}" stroke="${INK}" stroke-width="2"/>`
      : "";
    let a = 0;
    const all = known.concat([{ deg: total - known.reduce((s, k) => s + k.deg, 0), label: unknownLabel }]);
    all.forEach((seg, i) => {
      const mid = (a + seg.deg / 2) * Math.PI / 180;
      const end = (a + seg.deg) * Math.PI / 180;
      if (i < all.length - 1 || !onLine) {
        body += `<line x1="${cx}" y1="${cy}" x2="${(cx + R * Math.cos(-end)).toFixed(1)}" ` +
                `y2="${(cy + R * Math.sin(-end)).toFixed(1)}" stroke="${INK}" stroke-width="2"/>`;
      }
      const lx = cx + R * 0.58 * Math.cos(-mid), ly = cy + R * 0.58 * Math.sin(-mid);
      body += text(lx.toFixed(1), (ly + 4).toFixed(1), seg.label !== undefined ? seg.label : `${seg.deg}°`,
                   { size: 12, weight: seg.label ? 700 : 400 });
      a += seg.deg;
    });
    body += `<circle cx="${cx}" cy="${cy}" r="3" fill="${INK}"/>`;
    return { image: wrap(w, h, body),
             alt: `Angles meeting at a point ${onLine ? "on a straight line" : "in a full turn"}, ` +
                  `with ${known.map(k => k.deg + " degrees").join(", ")} known and one marked ${unknownLabel}.` };
  }

  /* ── Coordinate grid with labelled points ── */
  function coordGrid({ size = 8, points }) {
    const s = 26, pad = 26;
    const w = pad + size * s + 14, h = pad + size * s + 22;
    const X = v => pad + v * s, Y = v => pad + (size - v) * s;
    let body = "";
    for (let k = 0; k <= size; k++) {
      body += `<line x1="${X(k)}" y1="${Y(0)}" x2="${X(k)}" y2="${Y(size)}" stroke="${GRID}" stroke-width="1"/>` +
              `<line x1="${X(0)}" y1="${Y(k)}" x2="${X(size)}" y2="${Y(k)}" stroke="${GRID}" stroke-width="1"/>` +
              text(X(k), Y(0) + 15, k, { size: 10 }) +
              (k ? text(X(0) - 8, Y(k) + 4, k, { anchor: "end", size: 10 }) : "");
    }
    body += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(size)}" y2="${Y(0)}" stroke="${INK}" stroke-width="1.5"/>` +
            `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(size)}" stroke="${INK}" stroke-width="1.5"/>`;
    points.forEach(([px, py, label]) => {
      /* A label always drawn to the right of its point runs off the canvas for
         a point near the right-hand edge, which clipped "corner" on the
         rotation diagrams. Put it on whichever side it fits. */
      const wide = `${label}`.length * 12 * 0.6;
      const fitsRight = X(px) + 11 + wide < w - 4;
      body += `<circle cx="${X(px)}" cy="${Y(py)}" r="4.5" fill="${FILL}"/>` +
              text(X(px) + (fitsRight ? 11 : -11), Y(py) - 7, label,
                   { anchor: fitsRight ? "start" : "end", size: 12, weight: 700 });
    });
    return { image: wrap(w, h, body),
             /* The alt text has to say where the points are: "a grid with 2 marked
                points" leaves the question unanswerable without sight. */
             alt: `A coordinate grid from 0 to ${size}. ` +
                  points.map(([px, py, label]) =>
                    `${label ? `${label} is at` : "A point at"} (${px}, ${py})`).join("; ") + "." };
  }


  /* ── Named plane shapes, and their symmetry ──
     Drawn from real coordinates so the picture and the stated symmetry cannot
     disagree. Each entry gives the outline in a 0..1 box, the number of lines of
     symmetry and the order of rotational symmetry. */
  /* Coordinates are in a SQUARE unit box, and the drawing cell must be square
     too - stretching the box turned the equilateral triangle into a merely
     isosceles one. Three of these were wrong on the first pass: the "rhombus"
     was a square stood on its corner, so it had four lines of symmetry rather
     than two; the equilateral triangle was 2% short in height; and the
     right-angled triangle had legs so nearly equal that it read as isosceles,
     which would have given it a line of symmetry it is not supposed to have. */
  const SHAPES = {
    square:              { lines: 4, order: 4, pts: [[.1,.1],[.9,.1],[.9,.9],[.1,.9]] },
    rectangle:           { lines: 2, order: 2, pts: [[.05,.25],[.95,.25],[.95,.75],[.05,.75]] },
    /* Unequal diagonals, or it would be a square. */
    rhombus:             { lines: 2, order: 2, pts: [[.5,.12],[.98,.5],[.5,.88],[.02,.5]] },
    parallelogram:       { lines: 0, order: 2, pts: [[.28,.2],[.98,.2],[.72,.8],[.02,.8]] },
    kite:                { lines: 1, order: 1, pts: [[.5,.04],[.9,.4],[.5,.96],[.1,.4]] },
    "isosceles trapezium": { lines: 1, order: 1, pts: [[.28,.22],[.72,.22],[.96,.8],[.04,.8]] },
    /* Height is base x root 3 over 2, so all three sides really are equal. */
    "equilateral triangle": { lines: 3, order: 3, pts: [[.5,.138],[.94,.9],[.06,.9]] },
    "isosceles triangle":   { lines: 1, order: 1, pts: [[.5,.06],[.82,.9],[.18,.9]] },
    "scalene triangle":     { lines: 0, order: 1, pts: [[.22,.1],[.95,.62],[.06,.9]] },
    /* Legs clearly unequal, so it is not an isosceles right-angled triangle. */
    "right-angled triangle":{ lines: 0, order: 1, pts: [[.14,.05],[.14,.9],[.8,.9]] },
    "regular pentagon":  { lines: 5, order: 5, pts: [[.5,.08],[.947,.405],[.776,.93],[.224,.93],[.053,.405]] },
    "regular hexagon":   { lines: 6, order: 6, pts: [[.96,.5],[.73,.898],[.27,.898],[.04,.5],[.27,.102],[.73,.102]] },
    arrowhead:           { lines: 1, order: 1, pts: [[.5,.06],[.94,.94],[.5,.66],[.06,.94]] },
    "L-shape":           { lines: 0, order: 1, pts: [[.08,.08],[.6,.08],[.6,.5],[.94,.5],[.94,.94],[.08,.94]] }
  };

  const shapePath = (name, x, y, w, h) => {
    const def = SHAPES[name];
    if (!def) return "";
    const pts = def.pts.map(([u, v]) => `${(x + u * w).toFixed(1)},${(y + v * h).toFixed(1)}`).join(" ");
    return `<polygon points="${pts}" fill="none" stroke="${INK}" stroke-width="2"/>`;
  };

  /* Five candidate shapes in a row, lettered A to E, exactly as the papers set
     them: the options a child picks are the letters, and the figure carries the
     drawings - the same arrangement js/questions-nvrt.js already uses. */
  function shapeChoices({ names, letters = ["A", "B", "C", "D", "E"] }) {
    const cell = 96, gap = 14, pad = 12, box = 88;   // box is square
    const w = pad * 2 + names.length * cell + (names.length - 1) * gap;
    const h = 152;
    let body = "";
    names.forEach((name, i) => {
      const x = pad + i * (cell + gap);
      body += shapePath(name, x + (cell - box) / 2, 12, box, box) +
              text(x + cell / 2, 136, letters[i], { size: 15, weight: 700, fill: FILL });
    });
    return { image: wrap(w, h, body),
             alt: `Five shapes lettered A to E: ` +
                  names.map((n, i) => `${letters[i]} is ${article(n)} ${n}`).join(", ") + "." };
  }

  /* A row of triangles to be named left to right. */
  function triangleRow({ kinds }) {
    const cell = 104, gap = 16, pad = 14;
    const w = pad * 2 + kinds.length * cell + (kinds.length - 1) * gap;
    const h = 122;
    let body = "";
    kinds.forEach((kind, i) => {
      const x = pad + i * (cell + gap), box = 88;     // square, as above
      body += shapePath(`${kind} triangle`, x + (cell - box) / 2, 10, box, box);
      /* A right angle is what tells that triangle apart, so it is marked. */
      if (kind === "right-angled") {
        const bx = x + (cell - box) / 2 + box * 0.14, by = 10 + box * 0.9;
        body += `<polyline points="${bx},${by - 11} ${bx + 11},${by - 11} ${bx + 11},${by}" ` +
                `fill="none" stroke="${INK}" stroke-width="1.5"/>`;
      }
      body += text(x + cell / 2, 112, `${i + 1}`, { size: 13, weight: 700, fill: FILL });
    });
    return { image: wrap(w, h, body),
             alt: `Four triangles numbered 1 to 4 from left to right: ` +
                  kinds.map((k, i) => `${i + 1} is ${k}`).join(", ") + "." };
  }

  /* A parallelogram cut into a strip of triangles, some of them shaded. Counting
     triangles is the point, so they are all the same size and alternate. */
  function triangleStrip({ total, shaded }) {
    const tw = 44, th = 76, pad = 14;
    const w = pad * 2 + (total + 1) * (tw / 2);
    const h = th + pad * 2;
    let body = "";
    for (let k = 0; k < total; k++) {
      const x0 = pad + k * (tw / 2);
      const up = k % 2 === 0;
      const pts = up
        ? `${x0},${pad + th} ${x0 + tw},${pad + th} ${x0 + tw / 2},${pad}`
        : `${x0},${pad} ${x0 + tw},${pad} ${x0 + tw / 2},${pad + th}`;
      body += `<polygon points="${pts}" fill="${k < shaded ? FILL_SOFT : "#ffffff"}" ` +
              `stroke="${INK}" stroke-width="1.5"/>`;
    }
    return { image: wrap(w, h, body),
             alt: `A shape divided into ${total} equal triangles, of which ${shaded} ` +
                  `${shaded === 1 ? "is" : "are"} shaded.` };
  }

  /* Two journeys on one pair of axes, which is how the papers ask for the gap
     between them at a given time. */
  function distanceTimeTwo({ seriesA, seriesB, labelA = "A", labelB = "B",
                             xLabel = "Time (hours)", yLabel = "Distance (miles)" }) {
    const padL = 50, padB = 38, padT = 34, plotW = 230, plotH = 158;
    const w = padL + plotW + 60, h = padT + plotH + padB;
    const all = seriesA.concat(seriesB);
    const maxX = Math.max(...all.map(p => p[0])), maxY = Math.max(...all.map(p => p[1]));
    const X = v => padL + (v / maxX) * plotW, Y = v => padT + plotH - (v / maxY) * plotH;

    let body = "";
    for (let gx = 0; gx <= maxX; gx++) {
      body += `<line x1="${X(gx)}" y1="${padT}" x2="${X(gx)}" y2="${padT + plotH}" stroke="${GRID}" stroke-width="1"/>` +
              text(X(gx), padT + plotH + 15, gx, { size: 11 });
    }
    for (let k = 0; k <= 4; k++) {
      const v = (maxY / 4) * k;
      body += `<line x1="${padL}" y1="${Y(v)}" x2="${padL + plotW}" y2="${Y(v)}" stroke="${GRID}" stroke-width="1"/>` +
              text(padL - 7, Y(v) + 4, v, { anchor: "end", size: 11 });
    }
    body += `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="${INK}" stroke-width="1.5"/>` +
            `<line x1="${padL}" y1="${padT + plotH}" x2="${padL + plotW}" y2="${padT + plotH}" stroke="${INK}" stroke-width="1.5"/>`;

    const draw = (pts, colour, label) => {
      const path = pts.map(p => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(" ");
      const last = pts[pts.length - 1];
      return `<polyline points="${path}" fill="none" stroke="${colour}" stroke-width="2.5"/>` +
             pts.map(p => `<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="3.5" fill="${colour}"/>`).join("") +
             text(X(last[0]) + 7, Y(last[1]) + 4, label, { anchor: "start", size: 12, weight: 700, fill: colour });
    };
    body += draw(seriesA, FILL, labelA) + draw(seriesB, "#b45309", labelB);
    body += text(padL + plotW / 2, h - 6, xLabel, { size: 11, fill: "#475569" }) +
            text(4, padT - 16, yLabel, { anchor: "start", size: 11, fill: "#475569" });

    const say = (pts, label) => `${label} passes through ` +
      pts.map(p => `(${p[0]}, ${p[1]})`).join(", ");
    return { image: wrap(w, h, body),
             alt: `A distance-time graph with two journeys. ${say(seriesA, labelA)}. ` +
                  `${say(seriesB, labelB)}.` };
  }


  /* Triangular-number patterns as rows of dots, the way the papers draw them. */
  function dotTriangles({ upto }) {
    const r = 6, gap = 19, colGap = 34, pad = 18;
    const widths = Array.from({ length: upto }, (_, k) => k + 1);
    /* A column has to be at least as wide as its caption: "Pattern 1" is wider
       than a one-dot triangle, and centring it under the dots pushed it off the
       left edge of the canvas. */
    const LABEL_W = 62;
    const cellW = n => Math.max(n * gap, LABEL_W);
    let x = pad, body = "";
    const h = pad * 2 + upto * gap + 26;
    widths.forEach((rows, idx) => {
      const w = cellW(rows);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col <= row; col++) {
          const cx = x + w / 2 - (row * gap) / 2 + col * gap;
          const cy = pad + row * gap;
          body += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" fill="${FILL}"/>`;
        }
      }
      body += text(x + w / 2, pad + upto * gap + 16, `Pattern ${idx + 1}`, { size: 11, fill: "#475569" });
      x += w + colGap;
    });
    const counts = widths.map(n => (n * (n + 1)) / 2);
    return { image: wrap(x - colGap + pad, h, body),
             alt: `Patterns of dots arranged in triangles. ` +
                  counts.map((c, k) => `Pattern ${k + 1} has ${c} dot${c === 1 ? "" : "s"}`).join(", ") + "." };
  }


  /* ── a maze with four numbered exits ──────────────────────────────────
     Cells are addressed (x, y) with x left to right and y top to bottom, the
     way the SVG is drawn. Walls sit on cell edges:
       vWalls: [x, y] is a wall on the RIGHT edge of cell (x, y)
       hWalls: [x, y] is a wall on the BOTTOM edge of cell (x, y)
     Exits sit on the boundary, given as { side, at, label } where `at` is the
     row for a left or right exit and the column for a top or bottom one.
     `start` is the cell the toy is released in, and `facing` the direction it
     sets off in. */
  function maze({ cols, rows, vWalls = [], hWalls = [], exits = [], start, facing = "up" }) {
    /* The side labels need more room than the top and bottom ones: "Exit 1"
       set beside the left wall is about 42px wide plus its 10px gap, and a
       single padding of 46 ran it off the canvas at x = -6. */
    const s = 34, padX = 60, padY = 34;
    const w = padX * 2 + cols * s, h = padY * 2 + rows * s;
    const X = k => padX + k * s, Y = k => padY + k * s;
    const has = (list, x, y) => list.some(p => p[0] === x && p[1] === y);
    const exitAt = (side, at) => exits.find(e => e.side === side && e.at === at);

    let body = "";

    /* The boundary, drawn a segment at a time so an exit can be left open. */
    for (let c = 0; c < cols; c++) {
      if (!exitAt("top", c))
        body += `<line x1="${X(c)}" y1="${Y(0)}" x2="${X(c + 1)}" y2="${Y(0)}" stroke="${INK}" stroke-width="3"/>`;
      if (!exitAt("bottom", c))
        body += `<line x1="${X(c)}" y1="${Y(rows)}" x2="${X(c + 1)}" y2="${Y(rows)}" stroke="${INK}" stroke-width="3"/>`;
    }
    for (let r = 0; r < rows; r++) {
      if (!exitAt("left", r))
        body += `<line x1="${X(0)}" y1="${Y(r)}" x2="${X(0)}" y2="${Y(r + 1)}" stroke="${INK}" stroke-width="3"/>`;
      if (!exitAt("right", r))
        body += `<line x1="${X(cols)}" y1="${Y(r)}" x2="${X(cols)}" y2="${Y(r + 1)}" stroke="${INK}" stroke-width="3"/>`;
    }

    /* Internal walls. */
    vWalls.forEach(([x, y]) => {
      body += `<line x1="${X(x + 1)}" y1="${Y(y)}" x2="${X(x + 1)}" y2="${Y(y + 1)}" stroke="${INK}" stroke-width="3"/>`;
    });
    hWalls.forEach(([x, y]) => {
      body += `<line x1="${X(x)}" y1="${Y(y + 1)}" x2="${X(x + 1)}" y2="${Y(y + 1)}" stroke="${INK}" stroke-width="3"/>`;
    });

    /* Each exit: the gap in the wall is marked, and labelled outside it, so
       there is no doubt which opening the number refers to. */
    exits.forEach(e => {
      const mid = e.at + 0.5;
      if (e.side === "top") {
        body += `<line x1="${X(e.at) + 4}" y1="${Y(0)}" x2="${X(e.at + 1) - 4}" y2="${Y(0)}" stroke="${FILL}" stroke-width="5"/>` +
                text(X(mid), Y(0) - 12, `Exit ${e.label}`, { size: 12, weight: 700 });
      } else if (e.side === "bottom") {
        body += `<line x1="${X(e.at) + 4}" y1="${Y(rows)}" x2="${X(e.at + 1) - 4}" y2="${Y(rows)}" stroke="${FILL}" stroke-width="5"/>` +
                text(X(mid), Y(rows) + 22, `Exit ${e.label}`, { size: 12, weight: 700 });
      } else if (e.side === "left") {
        body += `<line x1="${X(0)}" y1="${Y(e.at) + 4}" x2="${X(0)}" y2="${Y(e.at + 1) - 4}" stroke="${FILL}" stroke-width="5"/>` +
                text(X(0) - 10, Y(mid) + 4, `Exit ${e.label}`, { anchor: "end", size: 12, weight: 700 });
      } else {
        body += `<line x1="${X(cols)}" y1="${Y(e.at) + 4}" x2="${X(cols)}" y2="${Y(e.at + 1) - 4}" stroke="${FILL}" stroke-width="5"/>` +
                text(X(cols) + 10, Y(mid) + 4, `Exit ${e.label}`, { anchor: "start", size: 12, weight: 700 });
      }
    });

    /* The toy, and an arrow showing which way it sets off. */
    const cx = X(start.x + 0.5), cy = Y(start.y + 0.5);
    const d = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] }[facing];
    const tipX = cx + d[0] * 15, tipY = cy + d[1] * 15;
    const tailX = cx - d[0] * 9, tailY = cy - d[1] * 9;
    body += `<circle cx="${cx}" cy="${cy}" r="5.5" fill="${FILL}"/>` +
            `<line x1="${tailX}" y1="${tailY}" x2="${tipX}" y2="${tipY}" stroke="${FILL}" stroke-width="2.5"/>` +
            `<polygon points="${tipX},${tipY} ${tipX - d[0] * 7 - d[1] * 5},${tipY - d[1] * 7 - d[0] * 5} ` +
            `${tipX - d[0] * 7 + d[1] * 5},${tipY - d[1] * 7 + d[0] * 5}" fill="${FILL}"/>`;

    /* The alt text carries the whole layout. A maze described only as "a maze"
       is not a harder question without sight, it is an impossible one. */
    const side = k => ["left", "right", "top", "bottom"][k];
    const wallWords = [];
    vWalls.forEach(([x, y]) => wallWords.push(
      `between column ${x + 1} and column ${x + 2} in row ${y + 1}`));
    hWalls.forEach(([x, y]) => wallWords.push(
      `between row ${y + 1} and row ${y + 2} in column ${x + 1}`));
    const exitWords = exits.map(e => e.side === "left" || e.side === "right"
      ? `Exit ${e.label} is an opening in the ${e.side} wall at row ${e.at + 1}`
      : `Exit ${e.label} is an opening in the ${e.side} wall at column ${e.at + 1}`);
    return {
      image: wrap(w, h, body),
      alt: `A maze ${cols} columns wide and ${rows} rows deep, numbered from the ` +
           `top left. Internal walls: ${wallWords.length ? wallWords.join("; ") : "none"}. ` +
           `${exitWords.join("; ")}. The toy starts in column ${start.x + 1}, ` +
           `row ${start.y + 1}, facing ${facing}.`
    };
  }


  /* ── three circles, one letter per region ─────────────────────────────
     `letters` supplies the seven inner regions in this fixed order:
       onlyA, onlyB, onlyC, AB, AC, BC, ABC
     Each label position is chosen so it sits inside exactly the circles that
     region belongs to; the assertion below is what keeps that true if the
     geometry is ever adjusted. */
  /* ── A net of a cube ──

     Only one family of net is drawn: a horizontal strip of four squares with one
     square attached above the strip and one below it. That restriction is what
     makes the figure safe to ask questions about, because the folding is then
     certain. Fold the strip into a band and it becomes the four side faces, so
     two squares standing two apart in the strip end up facing each other;
     whatever hangs above the strip becomes the top and whatever hangs below
     becomes the bottom, so those two face each other as well. That holds
     wherever along the strip they are attached, which is what lets the
     attachment points vary without the answer needing a special case.

     The alt text spells the layout out, because the layout IS the question:
     a child reading it aloud has to be able to rebuild the net from the words. */
  function cubeNet({ strip, above, below, cell = 46 }) {
    const pad = 16, cols = strip.length, rows = 3;
    const w = pad * 2 + cols * cell, h = pad * 2 + rows * cell;
    const square = (col, row, label) => {
      const x = pad + col * cell, y = pad + row * cell;
      return `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" ` +
             `fill="${FILL_SOFT}" stroke="${INK}" stroke-width="1.5"/>` +
             text(x + cell / 2, y + cell / 2 + 6, label, { size: 18, weight: 700 });
    };
    let body = "";
    strip.forEach((label, col) => { body += square(col, 1, label); });
    body += square(above.at, 0, above.label);
    body += square(below.at, 2, below.label);

    const ord = ["first", "second", "third", "fourth"];
    return {
      image: wrap(w, h, body),
      alt: `A net of a cube. Four squares sit in a row, labelled ` +
        `${strip.join(", ")} from left to right. A square labelled ${above.label} ` +
        `is attached above the ${ord[above.at]} square of the row, ` +
        `${strip[above.at]}. A square labelled ${below.label} is attached below ` +
        `the ${ord[below.at]} square of the row, ${strip[below.at]}.`
    };
  }

  function vennThree({ labelA, labelB, labelC, letters, outside }) {
    const w = 320, h = 268;
    const R = 64;
    const A = [108, 100], B = [192, 100], C = [150, 168];
    const SPOTS = {
      onlyA: [70, 84], onlyB: [230, 84], onlyC: [150, 216],
      AB: [150, 80], AC: [100, 152], BC: [200, 152], ABC: [150, 123]
    };
    const inside = (p, c) => (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 < R * R;
    const WANT = {
      onlyA: [1, 0, 0], onlyB: [0, 1, 0], onlyC: [0, 0, 1],
      AB: [1, 1, 0], AC: [1, 0, 1], BC: [0, 1, 1], ABC: [1, 1, 1]
    };
    Object.entries(SPOTS).forEach(([key, p]) => {
      const got = [inside(p, A), inside(p, B), inside(p, C)].map(Number);
      if (got.join() !== WANT[key].join())
        throw new Error(`vennThree: the ${key} label is in the wrong region`);
    });

    let body = `<rect x="6" y="6" width="${w - 12}" height="${h - 30}" fill="none" stroke="${INK}" stroke-width="1.5"/>`;
    [[A, FILL_SOFT], [B, "#fde68a"], [C, "#bbf7d0"]].forEach(([c, fill]) => {
      body += `<circle cx="${c[0]}" cy="${c[1]}" r="${R}" fill="${fill}" ` +
              `fill-opacity="0.5" stroke="${INK}" stroke-width="1.5"/>`;
    });
    const order = ["onlyA", "onlyB", "onlyC", "AB", "AC", "BC", "ABC"];
    order.forEach((key, k) => {
      body += text(SPOTS[key][0], SPOTS[key][1] + 5, letters[k], { size: 14, weight: 700 });
    });
    body += text(A[0] - 34, 26, labelA, { size: 12, weight: 700 }) +
            text(B[0] + 34, 26, labelB, { size: 12, weight: 700 }) +
            text(C[0], h - 12, labelC, { size: 12, weight: 700 });
    if (outside) body += text(w - 22, h - 40, outside, { size: 14, weight: 700, anchor: "end" });

    /* The alt text has to name which circles each letter is in, or the question
       cannot be answered without seeing the picture. */
    const words = [
      `${letters[0]} is in ${labelA} only`,
      `${letters[1]} is in ${labelB} only`,
      `${letters[2]} is in ${labelC} only`,
      `${letters[3]} is in ${labelA} and ${labelB} but not ${labelC}`,
      `${letters[4]} is in ${labelA} and ${labelC} but not ${labelB}`,
      `${letters[5]} is in ${labelB} and ${labelC} but not ${labelA}`,
      `${letters[6]} is in all three`
    ];
    return {
      image: wrap(w, h, body),
      alt: `A Venn diagram with three overlapping circles labelled ${labelA}, ` +
           `${labelB} and ${labelC}, and a letter in each region. ` +
           words.join("; ") +
           (outside ? `; ${outside} is outside all three circles` : "") + `.`
    };
  }


  /* ── four small speed-time graphs, labelled, for a "which graph" question ──
     Each graph is a list of [minutes, speed] legs walked left to right. Steady
     speed is a HORIZONTAL line on a speed-time graph, which is the whole point
     of the question - on a distance-time graph it would slope. */
  function speedTimeChoices(graphs, { maxTime, maxSpeed }) {
    const gw = 150, gh = 104, padL = 30, padB = 22, gap = 22;
    const cols = 2, rows = Math.ceil(graphs.length / cols);
    const w = cols * (gw + gap) + gap, h = rows * (gh + gap + 16) + gap;
    let body = "";
    graphs.forEach((legs, k) => {
      const ox = gap + (k % cols) * (gw + gap);
      const oy = gap + Math.floor(k / cols) * (gh + gap + 16) + 12;
      const X = t => ox + padL + (t / maxTime) * (gw - padL - 6);
      const Y = v => oy + (gh - padB) - (v / maxSpeed) * (gh - padB - 8);
      /* Axes, with the speed scale marked so the graphs can be told apart. */
      body += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(maxTime)}" y2="${Y(0)}" stroke="${INK}" stroke-width="1.4"/>` +
              `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(maxSpeed)}" stroke="${INK}" stroke-width="1.4"/>`;
      for (let v = 0; v <= maxSpeed; v += maxSpeed / 2) {
        body += `<line x1="${X(0) - 3}" y1="${Y(v)}" x2="${X(0)}" y2="${Y(v)}" stroke="${INK}" stroke-width="1"/>` +
                text(X(0) - 6, Y(v) + 4, v, { anchor: "end", size: 9 });
      }
      /* The trace: a horizontal run at each speed, joined vertically. */
      let t = 0, prev = null, path = "";
      legs.forEach(([mins, speed]) => {
        if (prev !== null) path += ` L ${X(t).toFixed(1)} ${Y(speed).toFixed(1)}`;
        else path += `M ${X(t).toFixed(1)} ${Y(speed).toFixed(1)}`;
        t += mins;
        path += ` L ${X(t).toFixed(1)} ${Y(speed).toFixed(1)}`;
        prev = speed;
      });
      body += `<path d="${path}" fill="none" stroke="${FILL}" stroke-width="2.4"/>` +
              text(ox + padL, oy - 4, `Graph ${"ABCD"[k]}`, { size: 12, weight: 700, anchor: "start" }) +
              text(ox + padL + (gw - padL) / 2, oy + gh - 4, "time (min)", { size: 9 });
    });
    return {
      image: wrap(w, h, body),
      /* Each graph is described leg by leg, because "four speed-time graphs" is
         not something a question can be answered from. */
      alt: `Four speed-time graphs, with speed in metres per second up the side ` +
           `and time in minutes along the bottom. ` +
           graphs.map((legs, k) => {
             const parts = legs.map(([mins, speed]) => speed === 0
               ? `stopped for ${mins} minutes`
               : `${speed} m/s for ${mins} minutes`);
             return `Graph ${"ABCD"[k]} shows ` + parts.join(", then ");
           }).join(". ") + `.`
    };
  }

  root.DIAGRAMS = { maze, cubeNet, vennThree, speedTimeChoices, shadedGrid, barChart, pictogram, pieChart, distanceTime, vennTwo,
                    lShape, anglesOnLine, coordGrid,
                    shapeChoices, triangleRow, triangleStrip, distanceTimeTwo,
                    dotTriangles };
})();
