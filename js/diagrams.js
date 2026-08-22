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

  root.DIAGRAMS = { shadedGrid, barChart, pictogram, pieChart, distanceTime, vennTwo, lShape, anglesOnLine, coordGrid };
})();
