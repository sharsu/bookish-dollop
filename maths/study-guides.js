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

  const createStudyVisualCard = ({ emoji = "📘", title = "Maths idea", subtitle = "Take it one step at a time", chips = [], accent = "#4f46e5" } = {}) => {
    const keyPoints = chips.slice(0, 4).filter(Boolean);
    const points = [
      { x: 74, y: 170, labelX: 42, labelY: 196, anchor: "start" },
      { x: 166, y: 124, labelX: 166, labelY: 98, anchor: "middle" },
      { x: 266, y: 178, labelX: 266, labelY: 206, anchor: "middle" },
      { x: 342, y: 132, labelX: 376, labelY: 110, anchor: "end" }
    ].slice(0, keyPoints.length);

    return `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fbfdff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <circle cx="352" cy="58" r="26" fill="${escapeHtml(accent)}" opacity="0.14"/>
        <text x="352" y="67" text-anchor="middle" font-size="26">${escapeHtml(emoji)}</text>
        <text x="32" y="42" font-size="19" font-weight="800" fill="#1e1b4b">${escapeHtml(title)}</text>
        <text x="32" y="64" font-size="12.5" fill="#475569">${escapeHtml(subtitle)}</text>
        <text x="32" y="92" font-size="11.5" font-weight="700" fill="${escapeHtml(accent)}">Topic overview</text>
        <line x1="32" y1="100" x2="122" y2="100" stroke="${escapeHtml(accent)}" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
        ${points.slice(1).map((point, index) => {
          const prev = points[index];
          const controlX = (prev.x + point.x) / 2;
          const controlY = Math.min(prev.y, point.y) - 20;
          return `<path d="M${prev.x} ${prev.y} Q${controlX} ${controlY} ${point.x} ${point.y}" fill="none" stroke="${escapeHtml(accent)}" stroke-width="3" stroke-linecap="round" opacity="0.45"/>`;
        }).join("")}
        ${points.map((point, index) => `
          <circle cx="${point.x}" cy="${point.y}" r="11" fill="${escapeHtml(accent)}" opacity="0.16"/>
          <circle cx="${point.x}" cy="${point.y}" r="5" fill="${escapeHtml(accent)}"/>
          <text x="${point.labelX}" y="${point.labelY}" text-anchor="${point.anchor}" font-size="11.25" font-weight="700" fill="#334155">${escapeHtml(keyPoints[index])}</text>
        `).join("")}
        <text x="32" y="218" font-size="11.25" fill="#475569">The sub-topics below unpack these ideas step by step.</text>
      </svg>`;
  };

  const createCountingVisual = ({ first = "3 ways", second = "5 ways", total = "3 × 5 = 15" } = {}) => `
    <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="10" y="10" width="400" height="220" rx="22" fill="#fbfdff" stroke="#06b6d4" stroke-width="4"/>
      <circle cx="352" cy="58" r="26" fill="#06b6d4" opacity="0.14"/>
      <text x="352" y="67" text-anchor="middle" font-size="26">🌳</text>
      <text x="32" y="42" font-size="19" font-weight="800" fill="#0f766e">Counting stages overview</text>
      <text x="32" y="64" font-size="12.5" fill="#475569">Multiply stages only after checking the rules for each choice.</text>
      <text x="32" y="92" font-size="11.5" font-weight="700" fill="#06b6d4">Topic overview</text>
      <line x1="32" y1="100" x2="122" y2="100" stroke="#06b6d4" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
      <text x="34" y="118" font-size="11.5" font-weight="700" fill="#0f766e">Stage 1</text>
      <text x="34" y="136" font-size="11.25" fill="#334155">${escapeHtml(first)}</text>
      <text x="34" y="164" font-size="11.5" font-weight="700" fill="#0f766e">Stage 2</text>
      <text x="34" y="182" font-size="11.25" fill="#334155">${escapeHtml(second)}</text>
      <text x="34" y="206" font-size="11.5" font-weight="700" fill="#0f766e">Total outcomes</text>
      <text x="34" y="224" font-size="11.25" fill="#334155">${escapeHtml(total)}</text>
      <circle cx="182" cy="134" r="10" fill="#0ea5e9"/>
      <circle cx="270" cy="102" r="9" fill="#14b8a6"/>
      <circle cx="270" cy="134" r="9" fill="#14b8a6"/>
      <circle cx="270" cy="166" r="9" fill="#14b8a6"/>
      ${[72,105,138,171,204].map(y => `<circle cx="344" cy="${y}" r="7" fill="#f59e0b"/>`).join("")}
      <line x1="192" y1="134" x2="261" y2="102" stroke="#0ea5e9" stroke-width="3"/>
      <line x1="192" y1="134" x2="261" y2="134" stroke="#0ea5e9" stroke-width="3"/>
      <line x1="192" y1="134" x2="261" y2="166" stroke="#0ea5e9" stroke-width="3"/>
      <line x1="279" y1="102" x2="337" y2="72" stroke="#14b8a6" stroke-width="2.5"/>
      <line x1="279" y1="102" x2="337" y2="105" stroke="#14b8a6" stroke-width="2.5"/>
      <line x1="279" y1="134" x2="337" y2="138" stroke="#14b8a6" stroke-width="2.5"/>
      <line x1="279" y1="134" x2="337" y2="171" stroke="#14b8a6" stroke-width="2.5"/>
      <line x1="279" y1="166" x2="337" y2="204" stroke="#14b8a6" stroke-width="2.5"/>
      <text x="206" y="96" font-size="10.5" fill="#334155">start</text>
      <text x="286" y="86" font-size="10.5" fill="#334155">choices branch out</text>
    </svg>`;

  const createStatisticsChartVisual = ({
    title = "Favourite Fruit",
    categories = ["Apple", "Banana", "Pear"],
    values = [6, 4, 8],
    step = 2,
    accent = "#0f766e"
  } = {}) => {
    const safeCategories = categories.slice(0, 3).map(escapeHtml);
    const safeValues = values.slice(0, 3).map(value => Number(value) || 0);
    const maxValue = Math.max(step * 4, ...safeValues);
    const chartTop = 78;
    const chartBottom = 196;
    const chartHeight = chartBottom - chartTop;
    const barWidth = 38;
    const xPositions = [245, 300, 355];
    const yTicks = Array.from({ length: 5 }, (_, index) => index * step);

    return `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f8fffd" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="26" y="34" font-size="18" font-weight="800" fill="#134e4a">Read the table, then the chart</text>
        <text x="26" y="54" font-size="12" fill="#475569">The same data is shown in two ways.</text>

        <rect x="24" y="72" width="150" height="126" rx="14" fill="#ffffff" stroke="#99f6e4" stroke-width="2"/>
        <text x="40" y="92" font-size="13" font-weight="700" fill="#0f766e">${escapeHtml(title)}</text>
        <line x1="36" y1="102" x2="160" y2="102" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="44" y="118" font-size="11" font-weight="700" fill="#334155">Item</text>
        <text x="128" y="118" font-size="11" font-weight="700" fill="#334155">Votes</text>
        ${safeCategories.map((category, index) => `
          <text x="44" y="${139 + index * 24}" font-size="11.5" fill="#334155">${category}</text>
          <text x="132" y="${139 + index * 24}" font-size="11.5" font-weight="700" fill="#0f766e">${safeValues[index] ?? 0}</text>
          <line x1="36" y1="${145 + index * 24}" x2="160" y2="${145 + index * 24}" stroke="#e2e8f0" stroke-width="1"/>
        `).join("")}

        <text x="228" y="92" font-size="12" font-weight="700" fill="#0f766e">Bar chart</text>
        <line x1="236" y1="196" x2="382" y2="196" stroke="#334155" stroke-width="2"/>
        <line x1="236" y1="70" x2="236" y2="196" stroke="#334155" stroke-width="2"/>
        ${yTicks.map((tick, index) => {
          const y = chartBottom - (tick / maxValue) * chartHeight;
          return `
            <line x1="236" y1="${y}" x2="382" y2="${y}" stroke="#d1fae5" stroke-width="1"/>
            <text x="222" y="${y + 4}" text-anchor="end" font-size="10.5" fill="#475569">${tick}</text>`;
        }).join("")}
        ${safeValues.map((value, index) => {
          const height = (value / maxValue) * chartHeight;
          const y = chartBottom - height;
          return `
            <rect x="${xPositions[index]}" y="${y}" width="${barWidth}" height="${height}" rx="8" fill="${escapeHtml(accent)}" opacity="${index === 0 ? 0.88 : 0.65}"/>
            <text x="${xPositions[index] + barWidth / 2}" y="${y - 8}" text-anchor="middle" font-size="11" font-weight="700" fill="#134e4a">${value}</text>
            <text x="${xPositions[index] + barWidth / 2}" y="212" text-anchor="middle" font-size="10.5" fill="#334155">${safeCategories[index]}</text>`;
        }).join("")}

        <rect x="274" y="24" width="118" height="28" rx="14" fill="#ccfbf1"/>
        <text x="333" y="42" text-anchor="middle" font-size="11.5" font-weight="700" fill="#115e59">Each step on scale = ${escapeHtml(step)}</text>
      </svg>`;
  };

  const createStatisticsSummaryVisual = ({ values = [4, 6, 8, 12], accent = "#0ea5e9" } = {}) => {
    const safeValues = values.map(value => Number(value) || 0);
    const ordered = [...safeValues].sort((a, b) => a - b);
    const total = ordered.reduce((sum, value) => sum + value, 0);
    const mean = total / ordered.length;
    const median = ordered.length % 2
      ? ordered[(ordered.length - 1) / 2]
      : (ordered[ordered.length / 2 - 1] + ordered[ordered.length / 2]) / 2;
    const range = ordered[ordered.length - 1] - ordered[0];

    return `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f8fbff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#0f172a">One data set, four summaries</text>
        <text x="28" y="58" font-size="12" fill="#475569">Put the numbers in order first.</text>
        ${ordered.map((value, index) => `
          <rect x="${30 + index * 68}" y="78" width="54" height="44" rx="12" fill="#ffffff" stroke="#bfdbfe" stroke-width="2"/>
          <text x="${57 + index * 68}" y="106" text-anchor="middle" font-size="18" font-weight="800" fill="#1d4ed8">${value}</text>
        `).join("")}
        <rect x="28" y="142" width="168" height="68" rx="16" fill="#ffffff" stroke="#bae6fd" stroke-width="2"/>
        <text x="42" y="164" font-size="13" font-weight="700" fill="#0369a1">Mean</text>
        <text x="42" y="184" font-size="11.5" fill="#334155">Add them: ${ordered.join(" + ")} = ${total}</text>
        <text x="42" y="201" font-size="11.5" fill="#334155">Then divide by ${ordered.length}: ${total} ÷ ${ordered.length} = ${mean}</text>
        <rect x="212" y="142" width="182" height="68" rx="16" fill="#ffffff" stroke="#bfdbfe" stroke-width="2"/>
        <text x="226" y="164" font-size="13" font-weight="700" fill="#1d4ed8">Median & Range</text>
        <text x="226" y="184" font-size="11.5" fill="#334155">Middle pair: ${ordered[1]} and ${ordered[2]}, so median = ${median}</text>
        <text x="226" y="201" font-size="11.5" fill="#334155">Range = ${ordered[ordered.length - 1]} - ${ordered[0]} = ${range}</text>
      </svg>`;
  };

  const createStatisticsComparisonVisual = ({ accent = "#f59e0b" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fffaf5" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#7c2d12">Compare using evidence</text>
        <text x="28" y="58" font-size="12" fill="#475569">Say what is higher, then prove it with numbers.</text>
        <rect x="28" y="78" width="168" height="118" rx="16" fill="#ffffff" stroke="#fed7aa" stroke-width="2"/>
        <text x="44" y="100" font-size="13" font-weight="700" fill="#b45309">Group A</text>
        <rect x="44" y="120" width="22" height="48" rx="6" fill="#f59e0b" opacity="0.45"/>
        <rect x="78" y="110" width="22" height="58" rx="6" fill="#f59e0b" opacity="0.6"/>
        <rect x="112" y="98" width="22" height="70" rx="6" fill="#f59e0b" opacity="0.75"/>
        <rect x="146" y="104" width="22" height="64" rx="6" fill="#f59e0b"/>
        <text x="44" y="186" font-size="11.5" fill="#334155">Mean = 12</text>
        <text x="118" y="186" font-size="11.5" fill="#334155">Range = 4</text>
        <rect x="222" y="78" width="168" height="118" rx="16" fill="#ffffff" stroke="#fdba74" stroke-width="2"/>
        <text x="238" y="100" font-size="13" font-weight="700" fill="#c2410c">Group B</text>
        <rect x="238" y="132" width="22" height="36" rx="6" fill="#fb923c" opacity="0.45"/>
        <rect x="272" y="118" width="22" height="50" rx="6" fill="#fb923c" opacity="0.6"/>
        <rect x="306" y="88" width="22" height="80" rx="6" fill="#fb923c" opacity="0.75"/>
        <rect x="340" y="140" width="22" height="28" rx="6" fill="#fb923c"/>
        <text x="238" y="186" font-size="11.5" fill="#334155">Mean = 9</text>
        <text x="304" y="186" font-size="11.5" fill="#334155">Range = 10</text>
        <rect x="62" y="204" width="296" height="16" rx="8" fill="#ffedd5"/>
        <text x="210" y="216" text-anchor="middle" font-size="11.5" font-weight="700" fill="#9a3412">Group A scores higher on average, but Group B is more spread out.</text>
      </svg>`;

  const createStatisticsFrequencyVisual = ({ accent = "#22c55e" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f7fff8" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#166534">Pictogram + frequency table</text>
        <text x="28" y="58" font-size="12" fill="#475569">The key changes the value of each picture.</text>
        <rect x="26" y="76" width="176" height="126" rx="16" fill="#ffffff" stroke="#bbf7d0" stroke-width="2"/>
        <text x="42" y="98" font-size="13" font-weight="700" fill="#15803d">Fruit sold</text>
        <text x="42" y="118" font-size="11.5" fill="#334155">Key: 🍎 = 2 fruit</text>
        <text x="42" y="144" font-size="11.5" fill="#334155">Apples</text><text x="114" y="144" font-size="14">🍎🍎🍎</text>
        <text x="42" y="168" font-size="11.5" fill="#334155">Pears</text><text x="114" y="168" font-size="14">🍎🍎</text>
        <text x="42" y="192" font-size="11.5" fill="#334155">Plums</text><text x="114" y="192" font-size="14">🍎🍎🍎🍎</text>
        <rect x="220" y="76" width="174" height="126" rx="16" fill="#ffffff" stroke="#86efac" stroke-width="2"/>
        <text x="236" y="98" font-size="13" font-weight="700" fill="#15803d">Frequency table</text>
        <text x="242" y="120" font-size="11" font-weight="700" fill="#334155">Value</text>
        <text x="330" y="120" font-size="11" font-weight="700" fill="#334155">Freq</text>
        <line x1="236" y1="126" x2="382" y2="126" stroke="#d1fae5" stroke-width="1.5"/>
        <text x="242" y="148" font-size="11.5" fill="#334155">2</text><text x="332" y="148" font-size="11.5" fill="#166534">1</text>
        <text x="242" y="170" font-size="11.5" fill="#334155">4</text><text x="332" y="170" font-size="11.5" fill="#166534">3</text>
        <text x="242" y="192" font-size="11.5" fill="#334155">6</text><text x="332" y="192" font-size="11.5" fill="#166534">2</text>
        <rect x="84" y="206" width="252" height="16" rx="8" fill="#dcfce7"/>
        <text x="210" y="218" text-anchor="middle" font-size="11.5" font-weight="700" fill="#166534">Mean from table = Σ(value × frequency) ÷ total frequency</text>
      </svg>`;

  const createGeometryPolygonVisual = ({ accent = "#6366f1" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f8faff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#312e81">Regular hexagon example</text>
        <text x="28" y="58" font-size="12" fill="#475569">Use n = 6 in the polygon formula.</text>
        <text x="38" y="100" font-size="13" font-weight="700" fill="#4338ca">Sum of interior angles</text>
        <text x="38" y="122" font-size="11.5" fill="#334155">(n - 2) × 180</text>
        <text x="38" y="140" font-size="11.5" fill="#334155">= (6 - 2) × 180</text>
        <text x="38" y="158" font-size="11.5" fill="#334155">= 720°</text>
        <text x="38" y="180" font-size="13" font-weight="700" fill="#4338ca">One interior angle</text>
        <text x="38" y="198" font-size="11.5" fill="#334155">720 ÷ 6 = 120°</text>
        <text x="38" y="216" font-size="13" font-weight="700" fill="#4338ca">Exterior angle</text>
        <text x="138" y="216" font-size="11" fill="#334155">360 ÷ 6 = 60°</text>
        <polygon points="300,78 352,108 352,168 300,198 248,168 248,108" fill="#dbe4ff" stroke="#6366f1" stroke-width="4"/>
        <text x="300" y="132" text-anchor="middle" font-size="14" font-weight="800" fill="#312e81">n = 6</text>
        <path d="M283 188 Q300 172 317 188" fill="none" stroke="#4338ca" stroke-width="3" stroke-linecap="round"/>
        <text x="300" y="162" text-anchor="middle" font-size="10" font-weight="700" fill="#4338ca">interior</text>
        <text x="300" y="176" text-anchor="middle" font-size="10.5" font-weight="700" fill="#4338ca">120°</text>
        <line x1="300" y1="198" x2="344" y2="224" stroke="#6366f1" stroke-width="3" stroke-dasharray="5 4"/>
        <path d="M314 190 Q330 198 314 208" fill="none" stroke="#312e81" stroke-width="3" stroke-linecap="round"/>
        <text x="350" y="194" font-size="10" font-weight="700" fill="#312e81">exterior</text>
        <text x="350" y="208" font-size="10.5" font-weight="700" fill="#312e81">60°</text>
      </svg>`;

  const createGeometryAngleFactsVisual = ({ accent = "#0ea5e9" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f6fbff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#075985">Write the total first</text>
        <text x="28" y="58" font-size="12" fill="#475569">Then subtract the known angles.</text>
        <text x="40" y="96" font-size="13" font-weight="700" fill="#0369a1">Straight line</text>
        <text x="96" y="82" text-anchor="middle" font-size="10.5" font-weight="700" fill="#0369a1">180° total</text>
        <line x1="42" y1="126" x2="158" y2="126" stroke="#0f172a" stroke-width="3"/>
        <line x1="100" y1="126" x2="144" y2="88" stroke="#0f172a" stroke-width="3"/>
        <path d="M80 126 Q88 118 94 108" fill="none" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M108 112 Q120 116 128 126" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
        <text x="64" y="112" font-size="12" fill="#334155">65°</text>
        <text x="116" y="112" font-size="12" fill="#334155">x</text>
        <text x="40" y="168" font-size="11.5" fill="#334155">x = 180 - 65 = 115°</text>
        <text x="236" y="96" font-size="13" font-weight="700" fill="#0369a1">Triangle</text>
        <text x="306" y="82" text-anchor="middle" font-size="10.5" font-weight="700" fill="#0369a1">180° total</text>
        <polygon points="306,92 262,170 350,170" fill="#e0f2fe" stroke="#0284c7" stroke-width="3"/>
        <path d="M274 170 Q278 162 284 158" fill="none" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M298 106 Q306 114 314 106" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M328 158 Q336 162 340 170" fill="none" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round"/>
        <text x="270" y="162" font-size="12" fill="#334155">40°</text>
        <text x="332" y="162" font-size="12" fill="#334155">70°</text>
        <text x="300" y="126" font-size="12" fill="#334155">x</text>
        <text x="236" y="194" font-size="11.5" fill="#334155">x = 180 - 40 - 70 = 70°</text>
      </svg>`;

  const createGeometryParallelVisual = ({ accent = "#f59e0b" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fffaf5" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#9a3412">Parallel lines pattern</text>
        <text x="28" y="58" font-size="12" fill="#475569">Match the position of the angle.</text>
        <line x1="62" y1="100" x2="358" y2="100" stroke="#334155" stroke-width="4"/>
        <line x1="62" y1="156" x2="358" y2="156" stroke="#334155" stroke-width="4"/>
        <line x1="176" y1="76" x2="284" y2="178" stroke="#ea580c" stroke-width="4"/>
        <path d="M202 100 Q214 106 224 118" fill="none" stroke="#4338ca" stroke-width="3" stroke-linecap="round"/>
        <text x="226" y="118" font-size="12" font-weight="700" fill="#4338ca">55°</text>
        <path d="M262 156 Q274 162 284 174" fill="none" stroke="#4338ca" stroke-width="3" stroke-linecap="round"/>
        <text x="286" y="174" font-size="12" font-weight="700" fill="#4338ca">55°</text>
        <path d="M286 156 A26 26 0 0 0 243 140" fill="none" stroke="#c2410c" stroke-width="3" stroke-linecap="round"/>
        <text x="292" y="138" font-size="12" font-weight="700" fill="#c2410c">125°</text>
        <text x="40" y="194" font-size="11.5" fill="#334155">Same position gives matching corresponding angles: 55° and 55°.</text>
        <text x="40" y="212" font-size="11.5" fill="#334155">Inside on the same side: 55° + 125° = 180°.</text>
      </svg>`;

  const createGeometryCoordinateVisual = ({ accent = "#22c55e" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f7fff8" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#166534">Coordinates and reflection</text>
        <text x="28" y="58" font-size="12" fill="#475569">Count across first, then up.</text>
        <text x="38" y="98" font-size="13" font-weight="700" fill="#166534">Coordinate rule</text>
        <text x="38" y="120" font-size="11.5" fill="#334155">(x, y)</text>
        <text x="38" y="138" font-size="11.5" fill="#334155">x = across</text>
        <text x="38" y="156" font-size="11.5" fill="#334155">y = up</text>
        <text x="38" y="184" font-size="11.5" fill="#334155">Reflection keeps the same</text>
        <text x="38" y="200" font-size="11.5" fill="#334155">distance from the mirror line.</text>
        <g transform="translate(172 86)">
          <line x1="0" y1="110" x2="208" y2="110" stroke="#334155" stroke-width="2"/>
          <line x1="18" y1="0" x2="18" y2="110" stroke="#334155" stroke-width="2"/>
          <text x="198" y="104" font-size="10.5" fill="#334155">x</text>
          <text x="8" y="12" font-size="10.5" fill="#334155">y</text>
          <line x1="104" y1="0" x2="104" y2="110" stroke="#16a34a" stroke-dasharray="6 4" stroke-width="2"/>
          <circle cx="62" cy="46" r="6" fill="#2563eb"/>
          <circle cx="146" cy="46" r="6" fill="#ef4444"/>
          <line x1="62" y1="46" x2="104" y2="46" stroke="#2563eb" stroke-width="2" stroke-dasharray="4 4"/>
          <line x1="104" y1="46" x2="146" y2="46" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 4"/>
          <line x1="83" y1="40" x2="83" y2="52" stroke="#166534" stroke-width="2"/>
          <line x1="125" y1="40" x2="125" y2="52" stroke="#166534" stroke-width="2"/>
          <text x="48" y="34" font-size="11" fill="#334155">A(3,5)</text>
          <text x="130" y="34" font-size="11" fill="#334155">A'(9,5)</text>
          <text x="104" y="66" text-anchor="middle" font-size="10" font-weight="700" fill="#166534">same distance</text>
          <text x="84" y="104" font-size="10.5" fill="#166534">mirror line</text>
        </g>
      </svg>`;

  const createRatioPartsVisual = ({ accent = "#0ea5e9" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f8fbff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#075985">Parts method for 2:3</text>
        <text x="28" y="58" font-size="12" fill="#475569">Share £30 in the ratio 2:3.</text>
        <rect x="44" y="96" width="62" height="36" rx="10" fill="#bae6fd" stroke="#0ea5e9" stroke-width="2"/>
        <rect x="106" y="96" width="62" height="36" rx="10" fill="#bae6fd" stroke="#0ea5e9" stroke-width="2"/>
        <rect x="190" y="96" width="62" height="36" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
        <rect x="252" y="96" width="62" height="36" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
        <rect x="314" y="96" width="62" height="36" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
        <text x="210" y="88" text-anchor="middle" font-size="12" font-weight="700" fill="#334155">5 equal parts altogether</text>
        <text x="86" y="118" text-anchor="middle" font-size="12" fill="#075985">1 part</text>
        <text x="148" y="118" text-anchor="middle" font-size="12" fill="#075985">1 part</text>
        <text x="220" y="118" text-anchor="middle" font-size="12" fill="#1d4ed8">1 part</text>
        <text x="282" y="118" text-anchor="middle" font-size="12" fill="#1d4ed8">1 part</text>
        <text x="344" y="118" text-anchor="middle" font-size="12" fill="#1d4ed8">1 part</text>
        <line x1="44" y1="146" x2="168" y2="146" stroke="#0ea5e9" stroke-width="2"/>
        <line x1="44" y1="142" x2="44" y2="150" stroke="#0ea5e9" stroke-width="2"/>
        <line x1="168" y1="142" x2="168" y2="150" stroke="#0ea5e9" stroke-width="2"/>
        <line x1="190" y1="146" x2="376" y2="146" stroke="#2563eb" stroke-width="2"/>
        <line x1="190" y1="142" x2="190" y2="150" stroke="#2563eb" stroke-width="2"/>
        <line x1="376" y1="142" x2="376" y2="150" stroke="#2563eb" stroke-width="2"/>
        <text x="106" y="166" text-anchor="middle" font-size="11.5" font-weight="700" fill="#075985">2 parts = £12</text>
        <text x="283" y="166" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1d4ed8">3 parts = £18</text>
        <text x="210" y="196" text-anchor="middle" font-size="12" fill="#334155">1 part = £30 ÷ 5 = £6</text>
      </svg>`;

  const createRatioSimplifyVisual = ({ accent = "#f59e0b" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fffaf5" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#9a3412">Simplify a ratio</text>
        <text x="28" y="58" font-size="12" fill="#475569">Divide every part by the same highest common factor.</text>
        <rect x="56" y="94" width="90" height="34" rx="10" fill="#ffedd5"/><text x="101" y="116" text-anchor="middle" font-size="16" font-weight="800" fill="#9a3412">6 : 9</text>
        <text x="168" y="116" font-size="16" font-weight="800" fill="#9a3412">÷ 3</text>
        <rect x="224" y="94" width="90" height="34" rx="10" fill="#fed7aa"/><text x="269" y="116" text-anchor="middle" font-size="16" font-weight="800" fill="#9a3412">2 : 3</text>
        <text x="46" y="168" font-size="12" fill="#334155">Highest common factor of 6 and 9 is 3.</text>
        <text x="46" y="190" font-size="12" fill="#334155">Keep the order the same while dividing both parts.</text>
      </svg>`;

  const createRatioScaleVisual = ({ accent = "#22c55e" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f7fff8" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#166534">Scale every part together</text>
        <text x="28" y="58" font-size="12" fill="#475569">2:3 grows to 8:12 with scale factor ×4.</text>
        <rect x="62" y="96" width="72" height="32" rx="10" fill="#dcfce7"/><text x="98" y="117" text-anchor="middle" font-size="16" font-weight="800" fill="#166534">2 : 3</text>
        <rect x="174" y="96" width="72" height="32" rx="10" fill="#bbf7d0"/><text x="210" y="117" text-anchor="middle" font-size="16" font-weight="800" fill="#166534">× 4</text>
        <rect x="286" y="96" width="92" height="32" rx="10" fill="#dcfce7"/><text x="332" y="117" text-anchor="middle" font-size="16" font-weight="800" fill="#166534">8 : 12</text>
        <text x="62" y="164" font-size="12" fill="#334155">If red = 8, the scale factor from 2 to 8 is 4.</text>
        <text x="62" y="186" font-size="12" fill="#334155">So blue = 3 × 4 = 12.</text>
      </svg>`;

  const createRatioUnitaryVisual = ({ accent = "#ef4444" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fff8f8" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#991b1b">Unitary method</text>
        <text x="28" y="58" font-size="12" fill="#475569">Find 1 first, then scale to the target.</text>
        <rect x="40" y="88" width="102" height="34" rx="10" fill="#fee2e2"/><text x="91" y="110" text-anchor="middle" font-size="12" font-weight="700" fill="#991b1b">5 books cost £20</text>
        <text x="160" y="111" font-size="16" font-weight="800" fill="#991b1b">→</text>
        <rect x="184" y="88" width="96" height="34" rx="10" fill="#fecaca"/><text x="232" y="110" text-anchor="middle" font-size="12" font-weight="700" fill="#991b1b">1 book = £4</text>
        <text x="296" y="111" font-size="16" font-weight="800" fill="#991b1b">→</text>
        <rect x="320" y="88" width="76" height="34" rx="10" fill="#fee2e2"/><text x="358" y="110" text-anchor="middle" font-size="12" font-weight="700" fill="#991b1b">7 books</text>
        <text x="42" y="166" font-size="12" fill="#334155">First: £20 ÷ 5 = £4 for one book.</text>
        <text x="42" y="188" font-size="12" fill="#334155">Then: 7 × £4 = £28.</text>
      </svg>`;

  const createSpeedFormulaVisual = ({ accent = "#ef4444" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fff8f8" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#991b1b">Distance, speed, time</text>
        <text x="28" y="58" font-size="12" fill="#475569">Cover the letter you want to find.</text>
        <text x="38" y="98" font-size="13" font-weight="700" fill="#991b1b">Use the triangle</text>
        <text x="38" y="122" font-size="11.5" fill="#334155">Cover S → D ÷ T</text>
        <text x="38" y="142" font-size="11.5" fill="#334155">Cover D → S × T</text>
        <text x="38" y="162" font-size="11.5" fill="#334155">Cover T → D ÷ S</text>
        <text x="38" y="192" font-size="11.5" fill="#334155">Always check the units</text>
        <polygon points="294,86 356,188 232,188" fill="#fee2e2" stroke="#ef4444" stroke-width="4"/>
        <line x1="263" y1="138" x2="325" y2="138" stroke="#ef4444" stroke-width="3"/>
        <line x1="294" y1="138" x2="294" y2="188" stroke="#ef4444" stroke-width="3"/>
        <text x="294" y="126" text-anchor="middle" font-size="22" font-weight="800" fill="#991b1b">D</text>
        <text x="264" y="172" text-anchor="middle" font-size="22" font-weight="800" fill="#991b1b">S</text>
        <text x="324" y="172" text-anchor="middle" font-size="22" font-weight="800" fill="#991b1b">T</text>
      </svg>`;

  const createSpeedTimelineVisual = ({ accent = "#f59e0b" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fffaf5" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#9a3412">Journey timeline</text>
        <text x="28" y="58" font-size="12" fill="#475569">Turn decimal hours into minutes, then add to the start time.</text>
        <line x1="60" y1="130" x2="360" y2="130" stroke="#9a3412" stroke-width="4"/>
        <circle cx="90" cy="130" r="8" fill="#f59e0b"/>
        <circle cx="210" cy="130" r="8" fill="#fbbf24"/>
        <circle cx="330" cy="130" r="8" fill="#f59e0b"/>
        <text x="78" y="110" font-size="12" fill="#334155">10:20</text>
        <text x="190" y="110" font-size="12" fill="#334155">+ 1 hour</text>
        <text x="312" y="110" font-size="12" fill="#334155">+ 30 min</text>
        <text x="74" y="156" font-size="12" fill="#334155">start</text>
        <text x="318" y="156" font-size="12" fill="#334155">11:50</text>
        <text x="42" y="196" font-size="12" fill="#334155">Example: 1.5 hours = 1 hour + 0.5 × 60 = 30 minutes.</text>
      </svg>`;

  const createSpeedUnitsVisual = ({ accent = "#0ea5e9" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f8fbff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#075985">Match the units first</text>
        <text x="28" y="58" font-size="12" fill="#475569">Convert before using the formula.</text>
        <rect x="42" y="90" width="146" height="50" rx="12" fill="#dbeafe" stroke="#60a5fa" stroke-width="2"/>
        <text x="56" y="114" font-size="12" font-weight="700" fill="#1d4ed8">30 min = 30 ÷ 60 = 0.5 h</text>
        <text x="56" y="132" font-size="11.5" fill="#334155">Now km and h match.</text>
        <rect x="228" y="90" width="150" height="50" rx="12" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2"/>
        <text x="242" y="114" font-size="12" font-weight="700" fill="#0369a1">12 m/s = 12 × 3.6</text>
        <text x="242" y="132" font-size="11.5" fill="#334155">= 43.2 km/h</text>
        <text x="42" y="180" font-size="12" fill="#334155">Useful rules: 1 h = 3600 s, 1 km = 1000 m.</text>
      </svg>`;

  const createSpeedAverageVisual = ({ accent = "#22c55e" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f7fff8" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#166534">Average speed uses totals</text>
        <text x="28" y="58" font-size="12" fill="#475569">Use the whole journey, not a quick average.</text>
        <line x1="60" y1="124" x2="352" y2="124" stroke="#bbf7d0" stroke-width="10" stroke-linecap="round"/>
        <line x1="60" y1="124" x2="158" y2="124" stroke="#22c55e" stroke-width="10" stroke-linecap="round"/>
        <line x1="158" y1="124" x2="352" y2="124" stroke="#16a34a" stroke-width="10" stroke-linecap="round"/>
        <circle cx="60" cy="124" r="7" fill="#166534"/>
        <circle cx="158" cy="124" r="7" fill="#166534"/>
        <circle cx="352" cy="124" r="7" fill="#166534"/>
        <text x="109" y="104" text-anchor="middle" font-size="11.5" font-weight="700" fill="#166534">30 km</text>
        <text x="109" y="146" text-anchor="middle" font-size="11" fill="#334155">1 h</text>
        <text x="255" y="104" text-anchor="middle" font-size="11.5" font-weight="700" fill="#166534">60 km</text>
        <text x="255" y="146" text-anchor="middle" font-size="11" fill="#334155">2 h</text>
        <text x="42" y="182" font-size="12" fill="#334155">Total distance = 90 km and total time = 3 h</text>
        <text x="42" y="202" font-size="12" fill="#334155">Average speed = 90 ÷ 3 = 30 km/h</text>
      </svg>`;

  const createMeasurementConversionVisual = ({ accent = "#0ea5e9" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f8fbff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#075985">Unit conversions</text>
        <text x="28" y="58" font-size="12" fill="#475569">Larger unit = divide, smaller unit = multiply.</text>
        <rect x="48" y="92" width="76" height="34" rx="10" fill="#dbeafe"/><text x="86" y="114" text-anchor="middle" font-size="14" font-weight="800" fill="#1d4ed8">250 cm</text>
        <text x="144" y="114" font-size="16" font-weight="800" fill="#0f172a">÷ 100</text>
        <rect x="216" y="92" width="76" height="34" rx="10" fill="#bfdbfe"/><text x="254" y="114" text-anchor="middle" font-size="14" font-weight="800" fill="#1d4ed8">2.5 m</text>
        <text x="312" y="114" font-size="16" font-weight="800" fill="#0f172a">÷ 1000</text>
        <rect x="332" y="92" width="54" height="34" rx="10" fill="#dbeafe"/><text x="359" y="114" text-anchor="middle" font-size="14" font-weight="800" fill="#1d4ed8">km</text>
        <text x="48" y="170" font-size="12" fill="#334155">100 cm = 1 m, so 250 cm = 2.5 m.</text>
        <text x="48" y="192" font-size="12" fill="#334155">Remember: 1 m² = 10,000 cm² for area.</text>
      </svg>`;

  const createMeasurementUnitChoiceVisual = ({ accent = "#06b6d4" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f4fcff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#0f766e">Choose a sensible unit</text>
        <text x="28" y="58" font-size="12" fill="#475569">Match the unit to the size of the object.</text>
        <rect x="42" y="88" width="100" height="50" rx="14" fill="#ccfbf1"/><text x="92" y="110" text-anchor="middle" font-size="13" font-weight="700" fill="#0f766e">Pencil</text><text x="92" y="128" text-anchor="middle" font-size="11.5" fill="#334155">about 15 cm</text>
        <rect x="160" y="88" width="100" height="50" rx="14" fill="#a7f3d0"/><text x="210" y="110" text-anchor="middle" font-size="13" font-weight="700" fill="#0f766e">Classroom</text><text x="210" y="128" text-anchor="middle" font-size="11.5" fill="#334155">about 7 m</text>
        <rect x="278" y="88" width="100" height="50" rx="14" fill="#ccfbf1"/><text x="328" y="110" text-anchor="middle" font-size="13" font-weight="700" fill="#0f766e">Road trip</text><text x="328" y="128" text-anchor="middle" font-size="11.5" fill="#334155">measured in km</text>
        <text x="42" y="178" font-size="12" fill="#334155">Estimate first: a pencil cannot be 15 m long.</text>
      </svg>`;

  const createMeasurementAreaVisual = ({ accent = "#f59e0b" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fffaf5" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#9a3412">Perimeter and area</text>
        <text x="28" y="58" font-size="12" fill="#475569">Perimeter goes around. Area covers the inside.</text>
        <text x="40" y="96" font-size="13" font-weight="700" fill="#b45309">Rectangle example</text>
        <rect x="54" y="112" width="96" height="56" fill="#fde68a" stroke="#f59e0b" stroke-width="3"/>
        <text x="102" y="106" text-anchor="middle" font-size="12" fill="#334155">5 cm</text>
        <text x="158" y="144" font-size="12" fill="#334155">3 cm</text>
        <text x="40" y="188" font-size="11.5" fill="#334155">Perimeter = 2(5 + 3) = 16 cm</text>
        <text x="40" y="204" font-size="11.5" fill="#334155">Area = 5 × 3 = 15 cm²</text>
        <text x="236" y="96" font-size="13" font-weight="700" fill="#c2410c">Triangle example</text>
        <polygon points="304,170 248,170 276,110" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <line x1="276" y1="110" x2="276" y2="170" stroke="#ea580c" stroke-dasharray="4 4" stroke-width="2"/>
        <text x="274" y="186" text-anchor="middle" font-size="11.5" fill="#334155">base 8 cm</text>
        <text x="284" y="140" font-size="11.5" fill="#334155">height 5 cm</text>
        <text x="236" y="204" font-size="11.5" fill="#334155">Area = 1/2 × 8 × 5 = 20 cm²</text>
      </svg>`;

  const createMeasurementScaleVisual = ({ accent = "#22c55e" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f7fff8" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#166534">Read one step first</text>
        <text x="28" y="58" font-size="12" fill="#475569">Do not guess from the picture alone.</text>
        <line x1="58" y1="120" x2="362" y2="120" stroke="#334155" stroke-width="3"/>
        ${Array.from({ length: 11 }, (_, index) => {
          const x = 58 + index * 30;
          const tall = index % 5 === 0;
          return `<line x1="${x}" y1="${tall ? 92 : 102}" x2="${x}" y2="138" stroke="#334155" stroke-width="2"/>`;
        }).join("")}
        <text x="58" y="84" text-anchor="middle" font-size="11" fill="#334155">0</text>
        <text x="208" y="84" text-anchor="middle" font-size="11" fill="#334155">5</text>
        <text x="358" y="84" text-anchor="middle" font-size="11" fill="#334155">10</text>
        <circle cx="148" cy="120" r="6" fill="#16a34a"/>
        <text x="148" y="106" text-anchor="middle" font-size="12" font-weight="700" fill="#166534">6</text>
        <line x1="58" y1="150" x2="88" y2="150" stroke="#16a34a" stroke-width="2"/>
        <line x1="58" y1="146" x2="58" y2="154" stroke="#16a34a" stroke-width="2"/>
        <line x1="88" y1="146" x2="88" y2="154" stroke="#16a34a" stroke-width="2"/>
        <text x="73" y="168" text-anchor="middle" font-size="11.5" font-weight="700" fill="#166534">one gap = 2</text>
        <text x="120" y="192" font-size="12" fill="#334155">The marked point is three gaps after 0, so it shows 6.</text>
      </svg>`;

  const createNumbersPlaceValueVisual = ({ accent = "#4f46e5" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f8faff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#312e81">Place value and rounding</text>
        <text x="28" y="58" font-size="12" fill="#475569">Read the value of the digit, then check the next place for rounding.</text>
        <text x="44" y="100" font-size="13" font-weight="700" fill="#4338ca">408,572</text>
        <rect x="198" y="84" width="40" height="40" rx="10" fill="#c7d2fe"/><text x="218" y="110" text-anchor="middle" font-size="20" font-weight="800" fill="#312e81">8</text>
        <text x="218" y="136" text-anchor="middle" font-size="10.5" font-weight="700" fill="#4338ca">thousands</text>
        <text x="44" y="136" font-size="11.5" fill="#334155">The 8 is worth 8,000.</text>
        <line x1="218" y1="124" x2="122" y2="124" stroke="#6366f1" stroke-width="2" stroke-dasharray="4 4"/>
        <text x="44" y="176" font-size="13" font-weight="700" fill="#4338ca">Round 8,472 to nearest 100</text>
        <text x="44" y="196" font-size="11.5" fill="#334155">Look at the tens digit 7, so 8,472 rounds up to 8,500.</text>
        <text x="288" y="176" font-size="12" fill="#334155">0-4 stay</text>
        <text x="288" y="196" font-size="12" fill="#334155">5-9 round up</text>
      </svg>`;

  const createNumbersCompareVisual = ({ accent = "#0891b2" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f5fbff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#0c4a6e">Compare from the left</text>
        <text x="28" y="58" font-size="12" fill="#475569">Stop at the first place where the digits differ.</text>
        <text x="62" y="118" font-size="30" font-weight="800" fill="#0f172a">5,230</text>
        <text x="62" y="164" font-size="30" font-weight="800" fill="#0f172a">5,203</text>
        <line x1="88" y1="126" x2="88" y2="150" stroke="#94a3b8" stroke-width="2"/>
        <line x1="132" y1="126" x2="132" y2="150" stroke="#94a3b8" stroke-width="2"/>
        <line x1="176" y1="126" x2="176" y2="150" stroke="#06b6d4" stroke-width="3"/>
        <path d="M176 100 Q196 84 216 100" fill="none" stroke="#06b6d4" stroke-width="3"/>
        <text x="224" y="104" font-size="12" font-weight="700" fill="#0c4a6e">tens decide</text>
        <text x="44" y="198" font-size="12" fill="#334155">Thousands and hundreds match. Tens: 3 is greater than 0, so 5,230 &gt; 5,203.</text>
      </svg>`;

  const createNumbersFactorsVisual = ({ accent = "#7c3aed" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fbf7ff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#581c87">Factors, multiples and primes</text>
        <text x="28" y="58" font-size="12" fill="#475569">Factors come in pairs. Prime numbers have exactly two factors.</text>
        <circle cx="208" cy="124" r="34" fill="#ede9fe" stroke="#8b5cf6" stroke-width="3"/>
        <text x="208" y="130" text-anchor="middle" font-size="24" font-weight="800" fill="#581c87">18</text>
        <line x1="208" y1="90" x2="122" y2="72" stroke="#8b5cf6" stroke-width="2"/>
        <line x1="208" y1="96" x2="118" y2="124" stroke="#8b5cf6" stroke-width="2"/>
        <line x1="208" y1="124" x2="124" y2="176" stroke="#8b5cf6" stroke-width="2"/>
        <text x="82" y="74" font-size="12" fill="#334155">1 × 18</text>
        <text x="78" y="126" font-size="12" fill="#334155">2 × 9</text>
        <text x="82" y="178" font-size="12" fill="#334155">3 × 6</text>
        <rect x="272" y="86" width="100" height="34" rx="12" fill="#f5d0fe"/><text x="322" y="108" text-anchor="middle" font-size="12" font-weight="700" fill="#86198f">13 is prime</text>
        <text x="272" y="142" font-size="11.5" fill="#334155">Only 1 and 13 divide exactly.</text>
        <text x="272" y="164" font-size="11.5" fill="#334155">Digits add to 9, so 18 is divisible by 3.</text>
      </svg>`;

  const createNumbersNegativeVisual = ({ accent = "#ef4444" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fff8f8" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#991b1b">Negative numbers on a line</text>
        <text x="28" y="58" font-size="12" fill="#475569">Further right means greater, even for negatives.</text>
        <line x1="48" y1="120" x2="372" y2="120" stroke="#334155" stroke-width="3"/>
        ${Array.from({ length: 10 }, (_, index) => {
          const x = 68 + index * 32;
          const value = index - 4;
          return `<line x1="${x}" y1="108" x2="${x}" y2="132" stroke="#334155" stroke-width="2"/>
            <text x="${x}" y="146" text-anchor="middle" font-size="10.5" fill="#334155">${value}</text>`;
        }).join("")}
        <circle cx="100" cy="120" r="6" fill="#ef4444"/>
        <circle cx="228" cy="120" r="6" fill="#2563eb"/>
        <text x="88" y="100" font-size="11.5" fill="#991b1b">-3</text>
        <text x="216" y="100" font-size="11.5" fill="#1d4ed8">1</text>
        <path d="M260 96 Q292 72 324 96" fill="none" stroke="#dc2626" stroke-width="3"/>
        <text x="292" y="68" text-anchor="middle" font-size="11.5" font-weight="700" fill="#991b1b">subtracting a negative moves right</text>
        <text x="44" y="188" font-size="12" fill="#334155">-3 is greater than -5 because it is closer to zero.</text>
        <text x="44" y="208" font-size="12" fill="#334155">6 - (-4) means jump right 4 places.</text>
      </svg>`;

  const createDecimalsPlaceValueVisual = ({ accent = "#0ea5e9" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f8fbff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#075985">Decimal place value</text>
        <text x="28" y="58" font-size="12" fill="#475569">Each place to the right is 10 times smaller.</text>
        <text x="54" y="118" font-size="34" font-weight="800" fill="#0f172a">5.27</text>
        <line x1="110" y1="86" x2="110" y2="148" stroke="#0ea5e9" stroke-width="3"/>
        <rect x="194" y="82" width="70" height="34" rx="12" fill="#dbeafe"/><text x="229" y="104" text-anchor="middle" font-size="12" font-weight="700" fill="#1d4ed8">5 ones</text>
        <rect x="194" y="124" width="70" height="34" rx="12" fill="#bfdbfe"/><text x="229" y="146" text-anchor="middle" font-size="12" font-weight="700" fill="#1d4ed8">2 tenths</text>
        <rect x="194" y="166" width="96" height="34" rx="12" fill="#dbeafe"/><text x="242" y="188" text-anchor="middle" font-size="12" font-weight="700" fill="#1d4ed8">7 hundredths</text>
        <text x="44" y="192" font-size="12" fill="#334155">0.27 means 2 tenths and 7 hundredths.</text>
      </svg>`;

  const createDecimalsCompareVisual = ({ accent = "#0284c7" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f4fbff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#075985">Compare decimals by columns</text>
        <text x="28" y="58" font-size="12" fill="#475569">Line up the decimal points and compare each place.</text>
        <text x="74" y="108" font-size="26" font-weight="800" fill="#0f172a">0.48</text>
        <text x="74" y="144" font-size="26" font-weight="800" fill="#0f172a">0.50</text>
        <text x="74" y="180" font-size="26" font-weight="800" fill="#0f172a">0.53</text>
        <line x1="116" y1="82" x2="116" y2="190" stroke="#38bdf8" stroke-width="3"/>
        <text x="194" y="110" font-size="12" fill="#334155">48 hundredths</text>
        <text x="194" y="146" font-size="12" fill="#334155">50 hundredths</text>
        <text x="194" y="182" font-size="12" fill="#334155">53 hundredths</text>
        <text x="44" y="210" font-size="12" fill="#334155">Ascending order: 0.48, 0.50, 0.53.</text>
      </svg>`;

  const createDecimalsColumnVisual = ({ accent = "#14b8a6" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f5fffd" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#0f766e">Line the decimal points up</text>
        <text x="28" y="58" font-size="12" fill="#475569">Keep tenths under tenths and hundredths under hundredths.</text>
        <text x="132" y="104" font-size="26" font-weight="800" fill="#0f172a">2.35</text>
        <text x="132" y="140" font-size="26" font-weight="800" fill="#0f172a">+ 1.40</text>
        <line x1="124" y1="150" x2="242" y2="150" stroke="#14b8a6" stroke-width="3"/>
        <text x="132" y="186" font-size="26" font-weight="800" fill="#0f172a">3.75</text>
        <line x1="170" y1="78" x2="170" y2="194" stroke="#5eead4" stroke-width="3"/>
        <text x="264" y="114" font-size="12" fill="#334155">decimal points</text>
        <text x="264" y="132" font-size="12" fill="#334155">stay in one line</text>
      </svg>`;

  const createDecimalsShiftVisual = ({ accent = "#f59e0b" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fffaf5" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#9a3412">Multiplying and dividing by 10</text>
        <text x="28" y="58" font-size="12" fill="#475569">The digits shift place value. Think about the size of the answer.</text>
        <text x="40" y="108" font-size="22" font-weight="800" fill="#0f172a">3.48 × 10</text>
        <text x="196" y="108" font-size="18" font-weight="800" fill="#9a3412">→</text>
        <text x="226" y="108" font-size="22" font-weight="800" fill="#0f172a">34.8</text>
        <text x="40" y="160" font-size="22" font-weight="800" fill="#0f172a">6.2 ÷ 100</text>
        <text x="196" y="160" font-size="18" font-weight="800" fill="#9a3412">→</text>
        <text x="226" y="160" font-size="22" font-weight="800" fill="#0f172a">0.062</text>
        <text x="42" y="196" font-size="12" fill="#334155">×10 makes the number larger. ÷100 makes it smaller.</text>
      </svg>`;

  const createFractionsUnderstandingVisual = ({ accent = "#f97316" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fff9f5" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#9a3412">Numerator and denominator</text>
        <text x="28" y="58" font-size="12" fill="#475569">The denominator names the equal parts. The numerator counts them.</text>
        <rect x="46" y="94" width="180" height="34" rx="10" fill="#ffedd5" stroke="#fb923c" stroke-width="2"/>
        <rect x="46" y="94" width="72" height="34" rx="10" fill="#fdba74"/>
        <text x="136" y="86" text-anchor="middle" font-size="18" font-weight="800" fill="#9a3412">2/5</text>
        <text x="52" y="150" font-size="11.5" fill="#334155">5 equal parts make the whole.</text>
        <text x="52" y="170" font-size="11.5" fill="#334155">2 parts are shaded, so the fraction is 2/5.</text>
        <text x="270" y="112" font-size="20" font-weight="800" fill="#9a3412">7/4 = 1 3/4</text>
        <text x="270" y="144" font-size="11.5" fill="#334155">Four quarters make 1 whole,</text>
        <text x="270" y="162" font-size="11.5" fill="#334155">with 3 quarters left over.</text>
      </svg>`;

  const createFractionsEquivalentVisual = ({ accent = "#0ea5e9" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f8fbff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#075985">Equivalent fractions</text>
        <text x="28" y="58" font-size="12" fill="#475569">The pieces look different, but the shaded amount stays the same.</text>
        <rect x="44" y="92" width="96" height="30" rx="8" fill="#dbeafe"/><rect x="44" y="92" width="48" height="30" rx="8" fill="#60a5fa"/>
        <text x="92" y="144" text-anchor="middle" font-size="16" font-weight="800" fill="#1d4ed8">1/2</text>
        <rect x="162" y="92" width="96" height="30" rx="8" fill="#dbeafe"/>
        <line x1="210" y1="92" x2="210" y2="122" stroke="#93c5fd" stroke-width="2"/>
        <rect x="162" y="92" width="48" height="30" rx="8" fill="#60a5fa"/>
        <text x="210" y="144" text-anchor="middle" font-size="16" font-weight="800" fill="#1d4ed8">2/4</text>
        <rect x="280" y="92" width="96" height="30" rx="8" fill="#dbeafe"/>
        <line x1="312" y1="92" x2="312" y2="122" stroke="#93c5fd" stroke-width="2"/>
        <line x1="344" y1="92" x2="344" y2="122" stroke="#93c5fd" stroke-width="2"/>
        <rect x="280" y="92" width="48" height="30" rx="8" fill="#60a5fa"/>
        <text x="328" y="144" text-anchor="middle" font-size="16" font-weight="800" fill="#1d4ed8">3/6</text>
        <text x="64" y="190" font-size="12" fill="#334155">Multiply or divide top and bottom by the same number.</text>
      </svg>`;

  const createFractionsCompareVisual = ({ accent = "#14b8a6" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f5fffd" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#0f766e">Match the part size first</text>
        <text x="28" y="58" font-size="12" fill="#475569">Use a common denominator or a number line.</text>
        <line x1="52" y1="130" x2="360" y2="130" stroke="#334155" stroke-width="3"/>
        ${Array.from({ length: 7 }, (_, index) => {
          const x = 52 + index * 51.33;
          return `<line x1="${x}" y1="118" x2="${x}" y2="142" stroke="#334155" stroke-width="2"/>`;
        }).join("")}
        <text x="52" y="156" text-anchor="middle" font-size="10.5" fill="#334155">0</text>
        <text x="206" y="156" text-anchor="middle" font-size="10.5" fill="#334155">3/6</text>
        <text x="257" y="156" text-anchor="middle" font-size="10.5" fill="#334155">4/6</text>
        <text x="360" y="156" text-anchor="middle" font-size="10.5" fill="#334155">1</text>
        <circle cx="206" cy="130" r="6" fill="#14b8a6"/>
        <circle cx="257" cy="130" r="6" fill="#0f766e"/>
        <text x="188" y="110" font-size="12" fill="#0f766e">1/2 = 3/6</text>
        <text x="238" y="94" font-size="12" fill="#14b8a6">2/3 = 4/6</text>
        <text x="44" y="196" font-size="12" fill="#334155">Since 4/6 is to the right of 3/6, 2/3 is greater than 1/2.</text>
      </svg>`;

  const createFractionsOfAmountVisual = ({ accent = "#8b5cf6" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#faf7ff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#6d28d9">Fraction of an amount</text>
        <text x="28" y="58" font-size="12" fill="#475569">Divide by the denominator first, then multiply by the numerator.</text>
        ${Array.from({ length: 5 }, (_, index) => {
          const x = 42 + index * 68;
          const fill = index < 3 ? '#c4b5fd' : '#ede9fe';
          return `<rect x="${x}" y="96" width="56" height="42" rx="10" fill="${fill}" stroke="#8b5cf6" stroke-width="2"/>
            <text x="${x + 28}" y="122" text-anchor="middle" font-size="12" font-weight="700" fill="#5b21b6">4</text>`;
        }).join("")}
        <text x="210" y="86" text-anchor="middle" font-size="14" font-weight="800" fill="#6d28d9">3/5 of 20</text>
        <text x="42" y="172" font-size="12" fill="#334155">20 ÷ 5 = 4, so one fifth is 4.</text>
        <text x="42" y="192" font-size="12" fill="#334155">Take 3 groups: 4 + 4 + 4 = 12.</text>
      </svg>`;

  const createPercentMeaningVisual = ({ accent = "#14b8a6" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f5fffd" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#0f766e">Percent means out of 100</text>
        <text x="28" y="58" font-size="12" fill="#475569">35% means 35 parts out of 100 equal parts.</text>
        ${Array.from({ length: 100 }, (_, index) => {
          const col = index % 10;
          const row = Math.floor(index / 10);
          const x = 218 + col * 14;
          const y = 74 + row * 14;
          const fill = index < 35 ? '#14b8a6' : '#d1fae5';
          return `<rect x="${x}" y="${y}" width="10" height="10" rx="2" fill="${fill}"/>`;
        }).join("")}
        <text x="42" y="108" font-size="20" font-weight="800" fill="#0f766e">35% = 35/100</text>
        <text x="42" y="136" font-size="14" fill="#334155">= 7/20 after simplifying</text>
        <text x="42" y="174" font-size="12" fill="#334155">100% is the whole. 50% is half.</text>
      </svg>`;

  const createPercentFormsVisual = ({ accent = "#0ea5e9" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f8fbff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#075985">Same value, three forms</text>
        <text x="28" y="58" font-size="12" fill="#475569">Fractions, decimals and percentages can show exactly the same amount.</text>
        <rect x="44" y="96" width="86" height="38" rx="12" fill="#dbeafe"/><text x="87" y="121" text-anchor="middle" font-size="18" font-weight="800" fill="#1d4ed8">2/5</text>
        <text x="152" y="121" font-size="18" font-weight="800" fill="#075985">=</text>
        <rect x="182" y="96" width="86" height="38" rx="12" fill="#bfdbfe"/><text x="225" y="121" text-anchor="middle" font-size="18" font-weight="800" fill="#1d4ed8">0.4</text>
        <text x="290" y="121" font-size="18" font-weight="800" fill="#075985">=</text>
        <rect x="318" y="96" width="58" height="38" rx="12" fill="#dbeafe"/><text x="347" y="121" text-anchor="middle" font-size="18" font-weight="800" fill="#1d4ed8">40%</text>
        <text x="46" y="174" font-size="12" fill="#334155">Percent to decimal: divide by 100.</text>
        <text x="46" y="194" font-size="12" fill="#334155">Percent to fraction: write over 100 and simplify.</text>
      </svg>`;

  const createPercentAmountVisual = ({ accent = "#f59e0b" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fffaf5" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#9a3412">Build harder percentages from easy ones</text>
        <text x="28" y="58" font-size="12" fill="#475569">Find 10%, then combine to make the percentage you need.</text>
        <rect x="50" y="96" width="84" height="36" rx="12" fill="#ffedd5"/><text x="92" y="119" text-anchor="middle" font-size="16" font-weight="800" fill="#9a3412">60</text>
        <text x="152" y="119" font-size="16" font-weight="800" fill="#9a3412">10% = 6</text>
        <text x="50" y="168" font-size="12" fill="#334155">30% of 60 means three lots of 10%.</text>
        <rect x="266" y="90" width="36" height="84" rx="10" fill="#fde68a"/>
        <rect x="302" y="90" width="36" height="84" rx="10" fill="#fde68a"/>
        <rect x="338" y="90" width="36" height="84" rx="10" fill="#fbbf24"/>
        <text x="320" y="196" text-anchor="middle" font-size="12" font-weight="700" fill="#9a3412">6 + 6 + 6 = 18</text>
      </svg>`;

  const createPercentChangeVisual = ({ accent = "#22c55e" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f7fff8" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#166534">Percentage change</text>
        <text x="28" y="58" font-size="12" fill="#475569">Compare the change with the original amount.</text>
        <rect x="52" y="96" width="84" height="38" rx="12" fill="#dcfce7"/><text x="94" y="121" text-anchor="middle" font-size="16" font-weight="800" fill="#166534">£40</text>
        <text x="154" y="121" font-size="18" font-weight="800" fill="#16a34a">→</text>
        <rect x="192" y="96" width="84" height="38" rx="12" fill="#bbf7d0"/><text x="234" y="121" text-anchor="middle" font-size="16" font-weight="800" fill="#166534">£50</text>
        <text x="296" y="121" font-size="16" font-weight="800" fill="#166534">change = £10</text>
        <text x="52" y="170" font-size="12" fill="#334155">Percentage change = change ÷ original × 100%</text>
        <text x="52" y="192" font-size="12" fill="#334155">= 10 ÷ 40 × 100% = 25% increase</text>
      </svg>`;

  const createBidmasOrderVisual = ({ accent = "#8b5cf6" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#faf7ff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#6d28d9">BIDMAS order</text>
        <text x="28" y="58" font-size="12" fill="#475569">Brackets, indices, divide/multiply, add/subtract.</text>
        <text x="58" y="112" font-size="28" font-weight="800" fill="#0f172a">3 + 4 × 2</text>
        <rect x="156" y="88" width="56" height="32" rx="10" fill="#ddd6fe"/>
        <text x="220" y="110" font-size="16" font-weight="800" fill="#6d28d9">do × first</text>
        <text x="58" y="154" font-size="24" font-weight="800" fill="#0f172a">3 + 8 = 11</text>
        <text x="52" y="196" font-size="12" fill="#334155">If you add first, you change the meaning of the calculation.</text>
      </svg>`;

  const createBidmasBracketsVisual = ({ accent = "#ec4899" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fff7fb" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#9d174d">Brackets first</text>
        <text x="28" y="58" font-size="12" fill="#475569">Finish the inside before you touch the outside.</text>
        <text x="50" y="112" font-size="28" font-weight="800" fill="#0f172a">2 × (3 + 5)</text>
        <rect x="134" y="86" width="64" height="34" rx="12" fill="#fbcfe8"/>
        <text x="234" y="112" font-size="20" font-weight="800" fill="#9d174d">→ 2 × 8</text>
        <text x="234" y="152" font-size="20" font-weight="800" fill="#9d174d">→ 16</text>
        <text x="50" y="190" font-size="12" fill="#334155">Nested brackets start with the innermost bracket.</text>
      </svg>`;

  const createBidmasMiddleVisual = ({ accent = "#0ea5e9" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f7fbff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#075985">Multiply and divide are the same level</text>
        <text x="28" y="58" font-size="12" fill="#475569">Work from left to right.</text>
        <text x="52" y="108" font-size="28" font-weight="800" fill="#0f172a">24 ÷ 3 × 2</text>
        <text x="52" y="154" font-size="22" font-weight="800" fill="#075985">24 ÷ 3 = 8</text>
        <text x="52" y="186" font-size="22" font-weight="800" fill="#075985">8 × 2 = 16</text>
        <path d="M128 118 Q148 132 166 118" fill="none" stroke="#0ea5e9" stroke-width="3"/>
        <text x="218" y="116" font-size="12" fill="#334155">left to right</text>
      </svg>`;

  const createBidmasSignsVisual = ({ accent = "#ef4444" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fff8f8" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#991b1b">Powers and negatives</text>
        <text x="28" y="58" font-size="12" fill="#475569">Brackets decide whether the negative is included in the square.</text>
        <rect x="44" y="90" width="150" height="62" rx="16" fill="#fee2e2"/><text x="119" y="120" text-anchor="middle" font-size="22" font-weight="800" fill="#991b1b">(-3)² = 9</text>
        <text x="64" y="144" font-size="11.5" fill="#334155">The whole negative number is squared.</text>
        <rect x="224" y="90" width="150" height="62" rx="16" fill="#fecaca"/><text x="299" y="120" text-anchor="middle" font-size="22" font-weight="800" fill="#991b1b">-3² = -9</text>
        <text x="238" y="144" font-size="11.5" fill="#334155">Only the 3 is squared, then the minus stays outside.</text>
        <text x="44" y="194" font-size="12" fill="#334155">Signs matter just as much as the numbers.</text>
      </svg>`;

  const createAlgebraExpressionsVisual = ({ accent = "#ec4899" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fff7fb" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#9d174d">Group like terms only</text>
        <text x="28" y="58" font-size="12" fill="#475569">Same letters can combine. Different letters stay separate.</text>
        <text x="44" y="110" font-size="28" font-weight="800" fill="#0f172a">5x + 2x - x</text>
        <line x1="48" y1="118" x2="104" y2="118" stroke="#ec4899" stroke-width="3"/>
        <line x1="132" y1="118" x2="182" y2="118" stroke="#ec4899" stroke-width="3"/>
        <line x1="212" y1="118" x2="244" y2="118" stroke="#ec4899" stroke-width="3"/>
        <text x="44" y="156" font-size="22" font-weight="800" fill="#9d174d">(5 + 2 - 1)x = 6x</text>
        <text x="44" y="190" font-size="12" fill="#334155">Example: 4a + 3b cannot become 7ab because a and b are different terms.</text>
      </svg>`;

  const createAlgebraEquationsVisual = ({ accent = "#8b5cf6" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#faf7ff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#6d28d9">Keep both sides balanced</text>
        <text x="28" y="58" font-size="12" fill="#475569">Whatever you do to one side, do to the other side.</text>
        <line x1="70" y1="124" x2="350" y2="124" stroke="#6d28d9" stroke-width="4"/>
        <line x1="210" y1="78" x2="210" y2="124" stroke="#6d28d9" stroke-width="4"/>
        <rect x="98" y="136" width="48" height="34" rx="10" fill="#ddd6fe"/><text x="122" y="158" text-anchor="middle" font-size="18" font-weight="800" fill="#6d28d9">x</text>
        <rect x="154" y="136" width="36" height="34" rx="10" fill="#ede9fe"/><text x="172" y="158" text-anchor="middle" font-size="16" font-weight="800" fill="#6d28d9">4</text>
        <rect x="248" y="136" width="36" height="34" rx="10" fill="#ddd6fe"/><text x="266" y="158" text-anchor="middle" font-size="16" font-weight="800" fill="#6d28d9">11</text>
        <text x="52" y="194" font-size="12" fill="#334155">x + 4 = 11 → subtract 4 from both sides → x = 7</text>
      </svg>`;

  const createAlgebraSubstitutionVisual = ({ accent = "#0ea5e9" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f8fbff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#075985">Substitute carefully</text>
        <text x="28" y="58" font-size="12" fill="#475569">Replace the letter, then follow BIDMAS.</text>
        <rect x="44" y="92" width="64" height="36" rx="12" fill="#dbeafe"/><text x="76" y="116" text-anchor="middle" font-size="16" font-weight="800" fill="#1d4ed8">a = 4</text>
        <text x="140" y="116" font-size="24" font-weight="800" fill="#0f172a">3a + 2</text>
        <text x="242" y="116" font-size="18" font-weight="800" fill="#075985">→</text>
        <text x="272" y="116" font-size="24" font-weight="800" fill="#0f172a">3 × 4 + 2</text>
        <text x="44" y="168" font-size="22" font-weight="800" fill="#075985">12 + 2 = 14</text>
        <text x="44" y="196" font-size="12" fill="#334155">If the value is negative, use brackets: b² with b = -2 becomes (-2)².</text>
      </svg>`;

  const createAlgebraBracketsVisual = ({ accent = "#f97316" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fff9f5" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#9a3412">Expand and factorise</text>
        <text x="28" y="58" font-size="12" fill="#475569">These are opposite moves.</text>
        <text x="42" y="108" font-size="24" font-weight="800" fill="#0f172a">2(x + 5)</text>
        <text x="152" y="108" font-size="18" font-weight="800" fill="#9a3412">→</text>
        <text x="182" y="108" font-size="24" font-weight="800" fill="#0f172a">2x + 10</text>
        <text x="42" y="156" font-size="24" font-weight="800" fill="#0f172a">8y + 12</text>
        <text x="152" y="156" font-size="18" font-weight="800" fill="#9a3412">→</text>
        <text x="182" y="156" font-size="24" font-weight="800" fill="#0f172a">4(2y + 3)</text>
        <text x="42" y="196" font-size="12" fill="#334155">Factorising takes out the highest common factor.</text>
      </svg>`;

  const createAlgebraFunctionVisual = ({ accent = "#14b8a6" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f5fffd" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#0f766e">Function machine</text>
        <text x="28" y="58" font-size="12" fill="#475569">Follow the rule forwards. Undo it backwards.</text>
        <rect x="42" y="98" width="52" height="34" rx="10" fill="#ccfbf1"/><text x="68" y="120" text-anchor="middle" font-size="16" font-weight="800" fill="#0f766e">4</text>
        <rect x="134" y="92" width="64" height="46" rx="12" fill="#99f6e4"/><text x="166" y="112" text-anchor="middle" font-size="12" font-weight="700" fill="#0f766e">×2</text><text x="166" y="128" text-anchor="middle" font-size="12" font-weight="700" fill="#0f766e">then +3</text>
        <rect x="238" y="98" width="52" height="34" rx="10" fill="#ccfbf1"/><text x="264" y="120" text-anchor="middle" font-size="16" font-weight="800" fill="#0f766e">11</text>
        <line x1="94" y1="115" x2="134" y2="115" stroke="#14b8a6" stroke-width="3"/>
        <line x1="198" y1="115" x2="238" y2="115" stroke="#14b8a6" stroke-width="3"/>
        <text x="42" y="186" font-size="12" fill="#334155">Backward: 17 → subtract 3 → 14 → divide by 2 → 7.</text>
      </svg>`;

  const createAlgebraMagicSquareVisual = ({ accent = "#6366f1" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f8faff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#312e81">Magic square totals</text>
        <text x="28" y="58" font-size="12" fill="#475569">Every row, column and diagonal must have the same total.</text>
        <g transform="translate(56 84)">
          ${Array.from({ length: 4 }, (_, i) => `<line x1="${i * 44}" y1="0" x2="${i * 44}" y2="132" stroke="#6366f1" stroke-width="2"/>`).join("")}
          ${Array.from({ length: 4 }, (_, i) => `<line x1="0" y1="${i * 44}" x2="132" y2="${i * 44}" stroke="#6366f1" stroke-width="2"/>`).join("")}
          <text x="22" y="28" text-anchor="middle" font-size="18" font-weight="800" fill="#312e81">8</text>
          <text x="66" y="28" text-anchor="middle" font-size="18" font-weight="800" fill="#312e81">1</text>
          <text x="110" y="28" text-anchor="middle" font-size="18" font-weight="800" fill="#312e81">6</text>
          <text x="22" y="72" text-anchor="middle" font-size="18" font-weight="800" fill="#312e81">x</text>
          <text x="66" y="72" text-anchor="middle" font-size="18" font-weight="800" fill="#312e81">4</text>
          <text x="110" y="72" text-anchor="middle" font-size="18" font-weight="800" fill="#312e81">6</text>
        </g>
        <text x="248" y="114" font-size="12" fill="#334155">Top row total = 8 + 1 + 6 = 15</text>
        <text x="248" y="136" font-size="12" fill="#334155">So x + 4 + 6 = 15</text>
        <text x="248" y="158" font-size="12" fill="#334155">x + 10 = 15</text>
        <text x="248" y="180" font-size="12" font-weight="700" fill="#312e81">x = 5</text>
      </svg>`;

  const createSequencesJumpVisual = ({ accent = "#22c55e" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f7fff8" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#166534">Spot the jump</text>
        <text x="28" y="58" font-size="12" fill="#475569">Look at how much the terms change each time.</text>
        ${[4,7,10,13].map((value, index) => `<circle cx="${72 + index * 88}" cy="116" r="26" fill="#dcfce7" stroke="#22c55e" stroke-width="3"/><text x="${72 + index * 88}" y="122" text-anchor="middle" font-size="18" font-weight="800" fill="#166534">${value}</text>`).join("")}
        ${[0,1,2].map(index => `<path d="M${96 + index * 88} 116 Q${116 + index * 88} 92 ${136 + index * 88} 116" fill="none" stroke="#16a34a" stroke-width="3"/><text x="${116 + index * 88}" y="88" text-anchor="middle" font-size="12" font-weight="700" fill="#166534">+3</text>`).join("")}
        <text x="44" y="194" font-size="12" fill="#334155">Same jump each time means an arithmetic sequence.</text>
      </svg>`;

  const createSequencesArithmeticVisual = ({ accent = "#0ea5e9" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f8fbff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#075985">Constant difference</text>
        <text x="28" y="58" font-size="12" fill="#475569">Arithmetic sequences change by the same amount every time.</text>
        <text x="54" y="120" font-size="26" font-weight="800" fill="#0f172a">6</text>
        <text x="128" y="120" font-size="26" font-weight="800" fill="#0f172a">10</text>
        <text x="206" y="120" font-size="26" font-weight="800" fill="#0f172a">14</text>
        <text x="284" y="120" font-size="26" font-weight="800" fill="#0f172a">18</text>
        ${[88,166,244].map(x => `<text x="${x}" y="118" font-size="16" font-weight="800" fill="#075985">→</text><text x="${x}" y="92" font-size="12" font-weight="700" fill="#075985">+4</text>`).join("")}
        <text x="44" y="190" font-size="12" fill="#334155">To go backwards, subtract the same difference.</text>
      </svg>`;

  const createSequencesNthVisual = ({ accent = "#f59e0b" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fffaf5" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#9a3412">Find the nth term rule</text>
        <text x="28" y="58" font-size="12" fill="#475569">Match the position number with the term value.</text>
        <text x="58" y="98" font-size="12" font-weight="700" fill="#9a3412">n</text>
        <text x="58" y="130" font-size="12" font-weight="700" fill="#9a3412">term</text>
        ${[1,2,3,4].map((n, index) => `<text x="${120 + index * 58}" y="98" text-anchor="middle" font-size="16" font-weight="800" fill="#0f172a">${n}</text><text x="${120 + index * 58}" y="130" text-anchor="middle" font-size="16" font-weight="800" fill="#0f172a">${3*n+1}</text>`).join("")}
        <text x="44" y="176" font-size="12" fill="#334155">Difference 3 means start with 3n.</text>
        <text x="44" y="196" font-size="12" fill="#334155">Term 1 is 4, so add 1. Rule: 3n + 1.</text>
      </svg>`;

  const createSequencesMissingVisual = ({ accent = "#ef4444" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fff8f8" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#991b1b">Use the rule both ways</text>
        <text x="28" y="58" font-size="12" fill="#475569">The same difference must work before and after the gap.</text>
        <text x="50" y="122" font-size="24" font-weight="800" fill="#0f172a">12</text>
        <text x="124" y="122" font-size="24" font-weight="800" fill="#0f172a">17</text>
        <rect x="190" y="94" width="64" height="38" rx="12" fill="#fee2e2"/><text x="222" y="118" text-anchor="middle" font-size="22" font-weight="800" fill="#991b1b">22</text>
        <text x="292" y="122" font-size="24" font-weight="800" fill="#0f172a">27</text>
        ${[86,160,238].map(x => `<text x="${x}" y="118" font-size="16" font-weight="800" fill="#991b1b">→</text><text x="${x}" y="92" font-size="12" font-weight="700" fill="#991b1b">+5</text>`).join("")}
        <text x="44" y="188" font-size="12" fill="#334155">17 + 5 = 22 and 22 + 5 = 27.</text>
      </svg>`;

  const createProbabilityScaleVisual = ({ accent = "#7c3aed" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fbf7ff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#581c87">Chance scale</text>
        <text x="28" y="58" font-size="12" fill="#475569">Probability goes from 0 to 1.</text>
        <line x1="52" y1="120" x2="360" y2="120" stroke="#581c87" stroke-width="4"/>
        ${[{x:52,l:'0',t:'impossible'},{x:206,l:'1/2',t:'even chance'},{x:360,l:'1',t:'certain'}].map(item => `<circle cx="${item.x}" cy="120" r="7" fill="#7c3aed"/><text x="${item.x}" y="98" text-anchor="middle" font-size="12" font-weight="700" fill="#581c87">${item.l}</text><text x="${item.x}" y="154" text-anchor="middle" font-size="11" fill="#334155">${item.t}</text>`).join("")}
        <text x="44" y="192" font-size="12" fill="#334155">On a fair die, rolling an 8 has probability 0. Rolling less than 7 has probability 1.</text>
      </svg>`;

  const createProbabilityOutcomesVisual = ({ accent = "#0ea5e9" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f8fbff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#075985">Count favourable outcomes</text>
        <text x="28" y="58" font-size="12" fill="#475569">Wanted outcomes over total outcomes.</text>
        ${[1,2,3,4,5,6].map((value, index) => {
          const x = 48 + index * 56;
          const fill = value % 2 === 0 ? '#93c5fd' : '#dbeafe';
          return `<rect x="${x}" y="94" width="42" height="42" rx="10" fill="${fill}" stroke="#60a5fa" stroke-width="2"/><text x="${x+21}" y="121" text-anchor="middle" font-size="18" font-weight="800" fill="#1d4ed8">${value}</text>`;
        }).join("")}
        <text x="44" y="176" font-size="12" fill="#334155">Even numbers are 2, 4 and 6, so there are 3 favourable outcomes.</text>
        <text x="44" y="196" font-size="12" font-weight="700" fill="#075985">P(even) = 3/6 = 1/2</text>
      </svg>`;

  const createProbabilityFormsVisual = ({ accent = "#f59e0b" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fffaf5" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#9a3412">Probability in three forms</text>
        <text x="28" y="58" font-size="12" fill="#475569">Fraction, decimal and percentage can say the same chance.</text>
        <text x="54" y="124" font-size="24" font-weight="800" fill="#0f172a">1/4</text>
        <text x="132" y="124" font-size="18" font-weight="800" fill="#9a3412">=</text>
        <text x="182" y="124" font-size="24" font-weight="800" fill="#0f172a">0.25</text>
        <text x="276" y="124" font-size="18" font-weight="800" fill="#9a3412">=</text>
        <text x="322" y="124" font-size="24" font-weight="800" fill="#0f172a">25%</text>
        <text x="42" y="184" font-size="12" fill="#334155">1 ÷ 4 = 0.25 and 0.25 × 100 = 25%.</text>
      </svg>`;

  const createProbabilityTableVisual = ({ accent = "#22c55e" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f7fff8" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#166534">Organise the outcomes</text>
        <text x="28" y="58" font-size="12" fill="#475569">A table helps you list every pair once.</text>
        <g transform="translate(122 84)">
          ${Array.from({ length: 3 }, (_, i) => `<line x1="${i*52}" y1="0" x2="${i*52}" y2="104" stroke="#22c55e" stroke-width="2"/>`).join("")}
          ${Array.from({ length: 3 }, (_, i) => `<line x1="0" y1="${i*52}" x2="104" y2="${i*52}" stroke="#22c55e" stroke-width="2"/>`).join("")}
          <text x="26" y="30" text-anchor="middle" font-size="18" font-weight="800" fill="#166534">HH</text>
          <text x="78" y="30" text-anchor="middle" font-size="18" font-weight="800" fill="#166534">HT</text>
          <text x="26" y="82" text-anchor="middle" font-size="18" font-weight="800" fill="#166534">TH</text>
          <text x="78" y="82" text-anchor="middle" font-size="18" font-weight="800" fill="#166534">TT</text>
          <rect x="52" y="0" width="52" height="52" fill="#dcfce7" opacity="0.7"/>
          <rect x="0" y="52" width="52" height="52" fill="#dcfce7" opacity="0.7"/>
        </g>
        <text x="248" y="116" font-size="12" fill="#334155">Exactly one head happens in HT and TH.</text>
        <text x="248" y="140" font-size="12" font-weight="700" fill="#166534">P(exactly one head) = 2/4 = 1/2</text>
      </svg>`;

  const createCountingStagesVisual = ({ accent = "#06b6d4" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f4fcff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#0f766e">Stages of choices</text>
        <text x="28" y="58" font-size="12" fill="#475569">Multiply the choices when each stage can pair with every next stage.</text>
        <rect x="44" y="96" width="78" height="42" rx="12" fill="#ccfbf1"/><text x="83" y="121" text-anchor="middle" font-size="12" font-weight="700" fill="#0f766e">3 tops</text>
        <text x="144" y="121" font-size="18" font-weight="800" fill="#0f766e">×</text>
        <rect x="176" y="96" width="78" height="42" rx="12" fill="#99f6e4"/><text x="215" y="121" text-anchor="middle" font-size="12" font-weight="700" fill="#0f766e">4 skirts</text>
        <text x="276" y="121" font-size="18" font-weight="800" fill="#0f766e">=</text>
        <rect x="308" y="96" width="68" height="42" rx="12" fill="#ccfbf1"/><text x="342" y="121" text-anchor="middle" font-size="12" font-weight="700" fill="#0f766e">12 outfits</text>
        <text x="44" y="182" font-size="12" fill="#334155">Each top can go with each skirt, so you multiply 3 × 4.</text>
      </svg>`;

  const createCountingTreeVisual = ({ accent = "#14b8a6" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f5fffd" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#0f766e">Draw the branches</text>
        <text x="28" y="58" font-size="12" fill="#475569">Every complete path is one possible outcome.</text>
        <circle cx="66" cy="126" r="8" fill="#14b8a6"/>
        <circle cx="170" cy="96" r="8" fill="#0d9488"/>
        <circle cx="170" cy="156" r="8" fill="#0d9488"/>
        ${[90,126,162].map(y => `<circle cx="318" cy="${y}" r="7" fill="#5eead4"/>`).join("")}
        ${[90,126,162].map(y => `<circle cx="318" cy="${y+30}" r="7" fill="#99f6e4"/>`).join("")}
        <line x1="74" y1="126" x2="162" y2="96" stroke="#14b8a6" stroke-width="3"/>
        <line x1="74" y1="126" x2="162" y2="156" stroke="#14b8a6" stroke-width="3"/>
        ${[90,126,162].map(y => `<line x1="178" y1="96" x2="311" y2="${y}" stroke="#0d9488" stroke-width="2.5"/>`).join("")}
        ${[120,156,192].map(y => `<line x1="178" y1="156" x2="311" y2="${y}" stroke="#0d9488" stroke-width="2.5"/>`).join("")}
        <text x="154" y="84" font-size="11" fill="#334155">cone A</text><text x="154" y="174" font-size="11" fill="#334155">cone B</text>
        <text x="44" y="206" font-size="12" fill="#334155">2 cone choices and 3 toppings gives 2 × 3 = 6 end branches.</text>
      </svg>`;

  const createCountingRestrictionVisual = ({ accent = "#f59e0b" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fffaf5" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#9a3412">Restrictions change the choices</text>
        <text x="28" y="58" font-size="12" fill="#475569">Choose the restricted position first.</text>
        <rect x="64" y="96" width="48" height="40" rx="10" fill="#ffedd5"/>
        <rect x="126" y="96" width="48" height="40" rx="10" fill="#ffedd5"/>
        <rect x="188" y="96" width="48" height="40" rx="10" fill="#fed7aa"/>
        <text x="212" y="90" text-anchor="middle" font-size="11.5" font-weight="700" fill="#9a3412">must be even</text>
        <text x="64" y="176" font-size="12" fill="#334155">3-digit even number, no repeats:</text>
        <text x="64" y="196" font-size="12" fill="#334155">2 choices for the last digit, then 3, then 2.</text>
        <text x="64" y="214" font-size="12" font-weight="700" fill="#9a3412">Total = 2 × 3 × 2 = 12</text>
      </svg>`;

  const createCountingWordsVisual = ({ accent = "#22c55e" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f7fff8" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#166534">Turn words into stages</text>
        <text x="28" y="58" font-size="12" fill="#475569">Underline each decision, then multiply the choices.</text>
        ${[['3 burgers',44],['2 sides',136],['4 drinks',228],['2 desserts',320]].map(([label,x]) => `<rect x="${x}" y="98" width="68" height="42" rx="12" fill="#dcfce7"/><text x="${Number(x)+34}" y="123" text-anchor="middle" font-size="12" font-weight="700" fill="#166534">${label}</text>`).join("")}
        <text x="210" y="184" text-anchor="middle" font-size="16" font-weight="800" fill="#166534">3 × 2 × 4 × 2 = 48 meals</text>
      </svg>`;

  const createLogicClueVisual = ({ accent = "#f43f5e" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fff7f8" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#9f1239">Read the clue words carefully</text>
        <text x="28" y="58" font-size="12" fill="#475569">Small words like not, before and only carry the rule.</text>
        <rect x="42" y="92" width="78" height="34" rx="12" fill="#ffe4e6"/><text x="81" y="114" text-anchor="middle" font-size="14" font-weight="800" fill="#be123c">not</text>
        <rect x="136" y="92" width="78" height="34" rx="12" fill="#ffe4e6"/><text x="175" y="114" text-anchor="middle" font-size="14" font-weight="800" fill="#be123c">before</text>
        <rect x="230" y="92" width="78" height="34" rx="12" fill="#ffe4e6"/><text x="269" y="114" text-anchor="middle" font-size="14" font-weight="800" fill="#be123c">after</text>
        <rect x="324" y="92" width="54" height="34" rx="12" fill="#ffe4e6"/><text x="351" y="114" text-anchor="middle" font-size="14" font-weight="800" fill="#be123c">only</text>
        <text x="42" y="164" font-size="12" fill="#334155">Example: Sam is not in blue → cross out Sam-blue straight away.</text>
        <text x="42" y="186" font-size="12" fill="#334155">Example: Ben before Ali means Ali cannot be ahead of Ben.</text>
      </svg>`;

  const createLogicGridVisual = ({ accent = "#0ea5e9" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f8fbff" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#075985">Use a logic grid</text>
        <text x="28" y="58" font-size="12" fill="#475569">Tick what must be true. Cross out what cannot be true.</text>
        <g transform="translate(126 82)">
          ${Array.from({ length: 4 }, (_, i) => `<line x1="${i*52}" y1="0" x2="${i*52}" y2="156" stroke="#38bdf8" stroke-width="2"/>`).join("")}
          ${Array.from({ length: 4 }, (_, i) => `<line x1="0" y1="${i*52}" x2="156" y2="${i*52}" stroke="#38bdf8" stroke-width="2"/>`).join("")}
          <text x="26" y="-8" text-anchor="middle" font-size="11" fill="#334155">Red</text>
          <text x="78" y="-8" text-anchor="middle" font-size="11" fill="#334155">Blue</text>
          <text x="130" y="-8" text-anchor="middle" font-size="11" fill="#334155">Green</text>
          <text x="-10" y="30" text-anchor="end" font-size="11" fill="#334155">Ava</text>
          <text x="-10" y="82" text-anchor="end" font-size="11" fill="#334155">Max</text>
          <text x="-10" y="134" text-anchor="end" font-size="11" fill="#334155">Sam</text>
          <text x="26" y="30" text-anchor="middle" font-size="22" font-weight="800" fill="#16a34a">✓</text>
          <text x="78" y="82" text-anchor="middle" font-size="22" font-weight="800" fill="#dc2626">✕</text>
          <text x="130" y="134" text-anchor="middle" font-size="22" font-weight="800" fill="#dc2626">✕</text>
        </g>
        <text x="42" y="206" font-size="12" fill="#334155">A tick often forces crosses in the same row and column.</text>
      </svg>`;

  const createLogicOrderVisual = ({ accent = "#f59e0b" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#fffaf5" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#9a3412">Build the order</text>
        <text x="28" y="58" font-size="12" fill="#475569">Place the certain clue first, then fit the rest around it.</text>
        <rect x="74" y="118" width="72" height="42" rx="12" fill="#fed7aa"/><text x="110" y="144" text-anchor="middle" font-size="16" font-weight="800" fill="#9a3412">Mia</text>
        <rect x="174" y="118" width="72" height="42" rx="12" fill="#fdba74"/><text x="210" y="144" text-anchor="middle" font-size="16" font-weight="800" fill="#9a3412">Ben</text>
        <rect x="274" y="118" width="72" height="42" rx="12" fill="#fed7aa"/><text x="310" y="144" text-anchor="middle" font-size="16" font-weight="800" fill="#9a3412">Sam</text>
        <text x="110" y="104" text-anchor="middle" font-size="11" fill="#334155">1st</text>
        <text x="210" y="104" text-anchor="middle" font-size="11" fill="#334155">2nd</text>
        <text x="310" y="104" text-anchor="middle" font-size="11" fill="#334155">3rd</text>
        <text x="42" y="196" font-size="12" fill="#334155">If Mia is before Ben and Ben is before Sam, then Mia must be before Sam too.</text>
      </svg>`;

  const createLogicPatternVisual = ({ accent = "#22c55e" } = {}) => `
      <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="400" height="220" rx="22" fill="#f7fff8" stroke="${escapeHtml(accent)}" stroke-width="4"/>
        <text x="28" y="38" font-size="18" font-weight="800" fill="#166534">Find the changing rule</text>
        <text x="28" y="58" font-size="12" fill="#475569">Ask what turns, grows or repeats each time.</text>
        ${[70,150,230].map((x, index) => `<rect x="${x}" y="94" width="48" height="48" rx="10" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/><path d="M${x+24} ${index===0?106:index===1?118:130} L${x+14} ${index===0?126:index===1?118:106} L${x+34} ${index===0?126:index===1?130:118} Z" fill="#166534"/>`).join("")}
        <rect x="310" y="94" width="48" height="48" rx="10" fill="#bbf7d0" stroke="#22c55e" stroke-width="2" stroke-dasharray="5 4"/>
        <text x="334" y="124" text-anchor="middle" font-size="22" font-weight="800" fill="#166534">?</text>
        <text x="42" y="186" font-size="12" fill="#334155">Each arrow turns 90° clockwise, so the next arrow also turns 90° clockwise.</text>
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
  root.createStatisticsChartVisual = createStatisticsChartVisual;
  root.createStatisticsSummaryVisual = createStatisticsSummaryVisual;
  root.createStatisticsComparisonVisual = createStatisticsComparisonVisual;
  root.createStatisticsFrequencyVisual = createStatisticsFrequencyVisual;
  root.createGeometryPolygonVisual = createGeometryPolygonVisual;
  root.createGeometryAngleFactsVisual = createGeometryAngleFactsVisual;
  root.createGeometryParallelVisual = createGeometryParallelVisual;
  root.createGeometryCoordinateVisual = createGeometryCoordinateVisual;
  root.createRatioPartsVisual = createRatioPartsVisual;
  root.createRatioSimplifyVisual = createRatioSimplifyVisual;
  root.createRatioScaleVisual = createRatioScaleVisual;
  root.createRatioUnitaryVisual = createRatioUnitaryVisual;
  root.createSpeedFormulaVisual = createSpeedFormulaVisual;
  root.createSpeedTimelineVisual = createSpeedTimelineVisual;
  root.createSpeedUnitsVisual = createSpeedUnitsVisual;
  root.createSpeedAverageVisual = createSpeedAverageVisual;
  root.createMeasurementUnitChoiceVisual = createMeasurementUnitChoiceVisual;
  root.createMeasurementConversionVisual = createMeasurementConversionVisual;
  root.createMeasurementAreaVisual = createMeasurementAreaVisual;
  root.createMeasurementScaleVisual = createMeasurementScaleVisual;
  root.createNumbersPlaceValueVisual = createNumbersPlaceValueVisual;
  root.createNumbersCompareVisual = createNumbersCompareVisual;
  root.createNumbersFactorsVisual = createNumbersFactorsVisual;
  root.createNumbersNegativeVisual = createNumbersNegativeVisual;
  root.createDecimalsPlaceValueVisual = createDecimalsPlaceValueVisual;
  root.createDecimalsCompareVisual = createDecimalsCompareVisual;
  root.createDecimalsColumnVisual = createDecimalsColumnVisual;
  root.createDecimalsShiftVisual = createDecimalsShiftVisual;
  root.createFractionsUnderstandingVisual = createFractionsUnderstandingVisual;
  root.createFractionsEquivalentVisual = createFractionsEquivalentVisual;
  root.createFractionsCompareVisual = createFractionsCompareVisual;
  root.createFractionsOfAmountVisual = createFractionsOfAmountVisual;
  root.createPercentMeaningVisual = createPercentMeaningVisual;
  root.createPercentFormsVisual = createPercentFormsVisual;
  root.createPercentAmountVisual = createPercentAmountVisual;
  root.createPercentChangeVisual = createPercentChangeVisual;
  root.createBidmasOrderVisual = createBidmasOrderVisual;
  root.createBidmasBracketsVisual = createBidmasBracketsVisual;
  root.createBidmasMiddleVisual = createBidmasMiddleVisual;
  root.createBidmasSignsVisual = createBidmasSignsVisual;
  root.createAlgebraExpressionsVisual = createAlgebraExpressionsVisual;
  root.createAlgebraEquationsVisual = createAlgebraEquationsVisual;
  root.createAlgebraSubstitutionVisual = createAlgebraSubstitutionVisual;
  root.createAlgebraBracketsVisual = createAlgebraBracketsVisual;
  root.createAlgebraFunctionVisual = createAlgebraFunctionVisual;
  root.createAlgebraMagicSquareVisual = createAlgebraMagicSquareVisual;
  root.createSequencesJumpVisual = createSequencesJumpVisual;
  root.createSequencesArithmeticVisual = createSequencesArithmeticVisual;
  root.createSequencesNthVisual = createSequencesNthVisual;
  root.createSequencesMissingVisual = createSequencesMissingVisual;
  root.createProbabilityScaleVisual = createProbabilityScaleVisual;
  root.createProbabilityOutcomesVisual = createProbabilityOutcomesVisual;
  root.createProbabilityFormsVisual = createProbabilityFormsVisual;
  root.createProbabilityTableVisual = createProbabilityTableVisual;
  root.createCountingStagesVisual = createCountingStagesVisual;
  root.createCountingTreeVisual = createCountingTreeVisual;
  root.createCountingRestrictionVisual = createCountingRestrictionVisual;
  root.createCountingWordsVisual = createCountingWordsVisual;
  root.createLogicClueVisual = createLogicClueVisual;
  root.createLogicGridVisual = createLogicGridVisual;
  root.createLogicOrderVisual = createLogicOrderVisual;
  root.createLogicPatternVisual = createLogicPatternVisual;
  root.normalizeStudyGuide = normalizeStudyGuide;
  root.registerStudyGuide = guide => {
    if (!guide || !guide.topic) return;
    store[guide.topic] = normalizeStudyGuide(guide);
  };
})();
