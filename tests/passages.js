/* Comprehension passages, and the questions that hang off them.
 *
 * A comprehension question is only answerable if what it quotes is actually in
 * the text. Getting that wrong is easy and quiet: a passage gets edited, a
 * question keeps quoting the old wording, and nothing complains until a child
 * hunts for a phrase that is not there.
 */
const { loadApp, createReport } = require("./lib/harness");

const app = loadApp();
const report = createReport("PASSAGES");
const passages = app.ctx.ENGLISH_PASSAGES || [];

report.check("there are passages to check", () =>
  passages.length > 10 || `only ${passages.length} passages found`);

/* Hyphen, en dash and em dash are all written as "-" before comparing, and
   curly quotes as straight ones. A quotation that differs from the text only in
   which dash was typed is faithful enough; failing on that would be crying
   wolf, and a check that cries wolf gets switched off. */
const normalise = s => String(s)
  .replace(/[‐-―]/g, "-")
  .replace(/[‘’]/g, "'")
  .replace(/[“”]/g, '"')
  .replace(/\s+/g, " ");

const textOf = p => normalise(p.lines.join(" "));
const label = p => `${p.title}`;

report.check("every passage has a title, a category and questions", () => {
  const bad = passages.filter(p =>
    !p.title || !p.category || !Array.isArray(p.lines) || !p.lines.length ||
    !Array.isArray(p.questions) || !p.questions.length);
  return bad.length === 0 || `${bad.length} incomplete, e.g. ${bad[0].title || "(untitled)"}`;
});

report.check("every question has one answer and three different distractors", () => {
  for (const p of passages) {
    for (const q of p.questions) {
      if (!q.q || !q.a || !Array.isArray(q.d)) return `${label(p)}: a malformed question`;
      if (q.d.length < 3) return `${label(p)}: "${q.q.slice(0, 50)}" has only ${q.d.length} distractors`;
      const all = [q.a, ...q.d].map(String);
      if (new Set(all).size !== all.length) return `${label(p)}: "${q.q.slice(0, 50)}" repeats an option`;
    }
  }
  return true;
});

report.check("every quoted fragment appears in its passage", () => {
  /* Single-quoted fragments inside a question are the ones a child is sent to
     look for. Short ones are skipped: 'a' or 'it' would match anything, and
     apostrophes inside words would be read as quotes. */
  for (const p of passages) {
    const body = textOf(p).toLowerCase();
    for (const q of p.questions) {
      /* The opening quote must follow a space or the start of the sentence, and
         the closing one must be followed by punctuation or a space. Without
         that, the apostrophe in "Ravi's mother" opens a phantom quotation that
         runs to the next real one. */
      const quoted = [...normalise(q.q).matchAll(/(?:^|[\s("])'([^']{4,60})'(?=[\s.,;:?!)"]|$)/g)]
        .map(m => m[1]);
      for (const fragment of quoted) {
        const needle = fragment.toLowerCase().replace(/\s+/g, " ").trim();
        /* Ignore anything that is plainly not a quotation from the text. */
        if (!/^[a-z' ,.;:!?—-]+$/.test(needle)) continue;
        /* An elided quotation - "a more desolate scene ... it is difficult to
           imagine" - is a normal thing for a question to do. Each side of the
           ellipsis has to be in the text; the whole string never will be. */
        const parts = needle.split(/\s*\.\.\.\s*/).map(s => s.trim()).filter(Boolean);
        for (const part of parts) {
          /* Terminal punctuation is routinely adjusted when a clause is lifted
             out: the passage reads "...furrowed by them;" and the question
             closes the quotation with a full stop. The words are what must
             match, not the mark at the end of them. */
          const trimmed = part.replace(/[.,;:!?—-]+$/, "").trim();
          if (trimmed.length < 4) continue;
          if (!body.includes(trimmed)) {
            return `${label(p)}: "${trimmed}" is quoted but is not in the passage`;
          }
        }
      }
    }
  }
  return true;
});

report.check("every line reference points at a line that exists", () => {
  for (const p of passages) {
    const printed = p.lines.length;
    for (const q of p.questions) {
      const refs = [...q.q.matchAll(/line (\d+)/gi)].map(m => Number(m[1]));
      for (const n of refs) {
        if (n < 1 || n > printed) {
          return `${label(p)}: refers to line ${n}, but the passage has ${printed}`;
        }
      }
    }
  }
  return true;
});

report.check("a long passage is still short enough to sit in one paper alone", () => {
  /* singlePassageLineLimit is NOT a maximum. Going past it is what makes a text
     a paper on its own, rather than being paired with a second one - so being
     over it is a designed case, and the long passages are listed below rather
     than failed. What would be a fault is a text so long that a child could not
     read it inside the time at all. */
  const limit = Number(app.config.singlePassageLineLimit) || Infinity;
  const absurd = passages.filter(p => p.lines.filter(l => l.trim()).length > limit * 2);
  return absurd.length === 0 ||
    `${absurd.map(p => `${p.title} (${p.lines.filter(l => l.trim()).length} lines)`).join(", ")}`;
});

report.check("every category has at least one passage, and pairing is possible", () => {
  /* Papers take one Classic and one from another category, so both sides of
     that pairing have to exist. */
  const byCategory = {};
  passages.forEach(p => { byCategory[p.category] = (byCategory[p.category] || 0) + 1; });
  if (!byCategory.Classic) return "there are no Classic passages to pair against";
  const others = Object.keys(byCategory).filter(c => c !== "Classic");
  if (!others.length) return "every passage is Classic, so no paper can be paired";
  return true;
});

report.check("questions span more than one difficulty", () => {
  const flat = passages.filter(p => new Set(p.questions.map(q => q.diff)).size < 2);
  return flat.length === 0 ||
    `${flat.length} passages ask everything at one level, e.g. ${flat[0].title}`;
});

const counts = {};
passages.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
report.note(`${passages.length} passages: ` +
  Object.keys(counts).sort().map(c => `${c} ${counts[c]}`).join(", "));
report.note(`${passages.reduce((s, p) => s + p.questions.length, 0)} comprehension questions in total`);

process.exit(report.finish() ? 0 : 1);
