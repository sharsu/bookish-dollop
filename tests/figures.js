/* Drawn figures have to be readable, and answerable without sight.
 *
 * A diagram is data, not decoration: the bar values, the sector angles, the net
 * that was drawn. If the alt text does not carry that data the question cannot
 * be answered at all by a child using a screen reader, and if a label falls off
 * the canvas or lands on top of another one it cannot be answered by anyone.
 */
const { loadApp, createReport } = require("./lib/harness");

const app = loadApp();
const report = createReport("FIGURES");

const withFigures = app.maths.filter(q => q.questionImage);
const decode = uri => decodeURIComponent(String(uri).replace(/^data:image\/svg\+xml;charset=UTF-8,/, ""));

report.check("there are figures to check at all", () =>
  withFigures.length > 100 || `only ${withFigures.length} questions carry a figure`);

report.check("every drawn figure carries alt text", () => {
  const bad = withFigures.filter(q => !q.questionImageAlt || !String(q.questionImageAlt).trim());
  return bad.length === 0 ||
    `${bad.length} figures have none, e.g. ${bad[0].template}`;
});

report.check("alt text carries data, not just a description", () => {
  /* "A bar chart." is useless. The values are what the picture shows, so the
     alt text has to contain numbers or labelled letters. */
  const bad = withFigures.filter(q => {
    const alt = String(q.questionImageAlt);
    return !/\d/.test(alt) && !/\b[A-Z]\b/.test(alt);
  });
  return bad.length === 0 ||
    `${bad.length} figures describe without stating, e.g. ${bad[0].template}: ${bad[0].questionImageAlt}`;
});

report.check("no label is drawn outside its canvas", () => {
  /* A single pad of 46 was too small beside a maze wall and put "Exit 1" at
     x = -6, off the picture entirely. */
  const bad = [];
  withFigures.forEach(q => {
    const svg = decode(q.questionImage);
    const box = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
    if (!box) return;
    const width = Number(box[1]), height = Number(box[2]);
    const labels = [...svg.matchAll(/<text x="(-?[\d.]+)" y="(-?[\d.]+)"/g)];
    labels.forEach(m => {
      const x = Number(m[1]), y = Number(m[2]);
      if (x < 0 || y < 0 || x > width || y > height) {
        bad.push(`${q.template} at ${x},${y} in a ${width}x${height} canvas`);
      }
    });
  });
  return bad.length === 0 || `${bad.length} labels off canvas, e.g. ${bad[0]}`;
});

report.check("no two labels are drawn on top of each other", () => {
  /* The scatter builder drew its vertical-axis title over the highest tick
     number, the same fault the bar chart and distance-time graph carry notes
     about. Boxes are approximate - a label is treated as roughly 0.6 of its
     font size per character wide and one font size tall. */
  const bad = [];
  withFigures.forEach(q => {
    const svg = decode(q.questionImage);
    const labels = [...svg.matchAll(/<text x="(-?[\d.]+)" y="(-?[\d.]+)"[^>]*?font-size="([\d.]+)"[^>]*>([^<]*)<\/text>/g)]
      .map(m => {
        const size = Number(m[3]);
        const text = m[4];
        const width = text.length * size * 0.6;
        const anchor = /text-anchor="end"/.test(m[0]) ? 1 : /text-anchor="start"/.test(m[0]) ? 0 : 0.5;
        const x = Number(m[1]) - width * anchor;
        return { x1: x, x2: x + width, y1: Number(m[2]) - size, y2: Number(m[2]), text };
      })
      .filter(l => l.text.trim());
    for (let i = 0; i < labels.length; i += 1) {
      for (let j = i + 1; j < labels.length; j += 1) {
        const a = labels[i], b = labels[j];
        const overlapX = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1);
        const overlapY = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1);
        /* Require a real overlap, not a shared edge. */
        if (overlapX > 1.5 && overlapY > 1.5) {
          bad.push(`${q.template}: "${a.text}" and "${b.text}"`);
        }
      }
    }
  });
  return bad.length === 0 || `${bad.length} overlapping pairs, e.g. ${bad[0]}`;
});

report.check("NVRT draws its own figures and does not touch DIAGRAMS", () => {
  /* The maze and net builders were added to js/diagrams.js while NVRT was
     using its own 88 SVG lines. Keeping that separation is why none of this
     work has ever moved an NVRT picture. */
  const fs = require("fs");
  const path = require("path");
  const source = fs.readFileSync(path.join(__dirname, "..", "js", "questions-nvrt.js"), "utf8");
  const references = (source.match(/DIAGRAMS/g) || []).length;
  return references === 0 || `questions-nvrt.js refers to DIAGRAMS ${references} times`;
});

report.note(`${withFigures.length} maths questions carry a drawn figure`);
process.exit(report.finish() ? 0 : 1);
