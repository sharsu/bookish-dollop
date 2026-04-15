(() => {
  const root = typeof window !== "undefined" ? window : globalThis;
  const store = root.STUDY_GUIDES || {};

  const toArray = value => Array.isArray(value) ? value.filter(Boolean) : value ? [value] : [];

  const escapeHtml = value => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const slugifyTopic = topic => String(topic || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const normalizeExamples = examples => toArray(examples)
    .map((example, index) => {
      if (typeof example === "string") {
        return { title: `Example ${index + 1}`, text: example };
      }

      return {
        title: example?.title || `Example ${index + 1}`,
        text: example?.text || example?.body || ""
      };
    })
    .filter(example => example.text);

  const createStudyVisualCard = ({ emoji = "📘", title = "Maths idea", subtitle = "Take it one step at a time", chips = [], accent = "#4f46e5" } = {}) => `
    <svg viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="cardGrad" x1="0" x2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#eef2ff" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="340" height="200" rx="24" fill="url(#cardGrad)" stroke="${escapeHtml(accent)}" stroke-width="4"/>
      <circle cx="58" cy="56" r="28" fill="${escapeHtml(accent)}" opacity="0.18"/>
      <text x="58" y="66" text-anchor="middle" font-size="28">${escapeHtml(emoji)}</text>
      <text x="100" y="56" font-size="24" font-weight="700" fill="#1e1b4b">${escapeHtml(title)}</text>
      <text x="100" y="84" font-size="14" fill="#475569">${escapeHtml(subtitle)}</text>
      ${chips.slice(0, 4).map((chip, index) => {
        const x = 30 + (index % 2) * 150;
        const y = 118 + Math.floor(index / 2) * 44;
        return `<rect x="${x}" y="${y}" width="132" height="28" rx="14" fill="#ffffff" stroke="${escapeHtml(accent)}" opacity="0.85" />
          <text x="${x + 66}" y="${y + 19}" text-anchor="middle" font-size="13" font-weight="600" fill="#1e1b4b">${escapeHtml(chip)}</text>`;
      }).join("")}
    </svg>`;

  const createCountingVisual = ({ first = "3 ways", second = "5 ways", total = "3 × 5 = 15" } = {}) => `
    <svg viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="10" y="10" width="340" height="200" rx="24" fill="#f8faff" stroke="#06b6d4" stroke-width="4"/>
      <circle cx="56" cy="110" r="12" fill="#4f46e5"/>
      <circle cx="170" cy="70" r="12" fill="#10b981"/>
      <circle cx="170" cy="110" r="12" fill="#10b981"/>
      <circle cx="170" cy="150" r="12" fill="#10b981"/>
      <circle cx="300" cy="70" r="12" fill="#f97316"/>
      <circle cx="300" cy="110" r="12" fill="#f97316"/>
      <circle cx="300" cy="150" r="12" fill="#f97316"/>
      <line x1="68" y1="110" x2="158" y2="70" stroke="#4f46e5" stroke-width="4"/>
      <line x1="68" y1="110" x2="158" y2="110" stroke="#4f46e5" stroke-width="4"/>
      <line x1="68" y1="110" x2="158" y2="150" stroke="#4f46e5" stroke-width="4"/>
      <line x1="182" y1="70" x2="288" y2="70" stroke="#10b981" stroke-width="4"/>
      <line x1="182" y1="110" x2="288" y2="110" stroke="#10b981" stroke-width="4"/>
      <line x1="182" y1="150" x2="288" y2="150" stroke="#10b981" stroke-width="4"/>
      <text x="34" y="85" font-size="14" font-weight="700" fill="#1e1b4b">Start</text>
      <text x="122" y="28" font-size="14" font-weight="700" fill="#1e1b4b">${escapeHtml(first)}</text>
      <text x="252" y="28" font-size="14" font-weight="700" fill="#1e1b4b">${escapeHtml(second)}</text>
      <text x="180" y="194" text-anchor="middle" font-size="20" font-weight="800" fill="#0f766e">${escapeHtml(total)}</text>
    </svg>`;

  const normalizeConcept = (concept, index, topic) => ({
    title: concept?.title || `Concept ${index + 1}`,
    slug: concept?.slug || slugifyTopic(concept?.title || `${topic}-${index + 1}`),
    summary: concept?.summary || "",
    explanation: toArray(concept?.explanation || concept?.intro || concept?.description || ""),
    steps: toArray(concept?.steps || []),
    tips: toArray(concept?.tips || []),
    examples: normalizeExamples(concept?.examples),
    visual: concept?.visual || "",
    visualLabel: concept?.visualLabel || ""
  });

  const buildOverviewConceptFromGuide = guide => ({
    title: "Overview",
    slug: "overview",
    summary: guide?.summary || `An overview of ${guide?.topic || "this topic"}.`,
    explanation: guide?.explanation || guide?.intro || `Learn ${guide?.topic || "this topic"} in small steps.`,
    steps: guide?.steps || [],
    tips: guide?.tips || [],
    examples: guide?.examples || (guide?.tryIt ? [{ title: "Quick example", text: guide.tryIt }] : []),
    visual: guide?.visual || "",
    visualLabel: guide?.visualLabel || ""
  });

  const normalizeStudyGuide = guide => {
    const safeGuide = guide || {};
    const topic = safeGuide.topic || "Maths";
    const conceptSource = Array.isArray(safeGuide.concepts) && safeGuide.concepts.length
      ? safeGuide.concepts
      : [buildOverviewConceptFromGuide(safeGuide)];
    const concepts = conceptSource.map((concept, index) => normalizeConcept(concept, index, topic));

    return {
      ...safeGuide,
      topic,
      slug: safeGuide.slug || slugifyTopic(topic),
      concepts,
      summary: safeGuide.summary || concepts[0]?.summary || `Explore ${topic} in small steps.`,
      intro: safeGuide.intro || concepts[0]?.explanation?.[0] || `Learn ${topic} in small steps.`,
      keyIdea: safeGuide.keyIdea || concepts[0]?.steps?.[0] || "Take it one step at a time.",
      visual: safeGuide.visual || concepts[0]?.visual || "",
      visualLabel: safeGuide.visualLabel || concepts[0]?.visualLabel || ""
    };
  };

  root.STUDY_GUIDES = store;
  root.slugifyTopic = slugifyTopic;
  root.createStudyVisualCard = createStudyVisualCard;
  root.createCountingVisual = createCountingVisual;
  root.normalizeStudyGuide = normalizeStudyGuide;
  root.registerStudyGuide = guide => {
    if (!guide || !guide.topic) return;
    store[guide.topic] = normalizeStudyGuide(guide);
  };
})();
