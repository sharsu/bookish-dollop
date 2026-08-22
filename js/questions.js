/* ═══════════════════════════════════════════════════════════════════
   CONSOLIDATED MATHS QUESTION BANK – template generators only
   All 14 topics in one file. No hardcoded questions.
   Format: { id, topic, question, options:[A,B,C,D], answer(0-3), difficulty(1-3) }
   Scale knob: VARIATIONS_PER_TEMPLATE near the bottom.
═══════════════════════════════════════════════════════════════════ */
const QUESTIONS = [];

(() => {
  let id = 1;

  /* ────────── shared helpers ────────── */
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
  const lcmAll = arr => arr.reduce((acc, x) => lcm(acc, x), 1);
  const isPrime = n => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true; };
  const primesBetween = (a, b) => { const out = []; for (let k = a; k <= b; k++) if (isPrime(k)) out.push(k); return out; };
  const factorsOf = n => { const out = []; for (let k = 1; k <= n; k++) if (n % k === 0) out.push(k); return out; };
  const isSquare = n => { const r = Math.round(Math.sqrt(n)); return r >= 0 && r * r === n; };
  const isLeap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const simp = (n, d) => { const g = gcd(Math.abs(n), Math.abs(d)) || 1; return `${n / g}/${d / g}`; };
  const fmt = n => { const v = Number(n); return Number.isFinite(v) ? (Number.isInteger(v) ? `${v}` : `${Number(v.toFixed(3))}`) : `${n}`; };
  const fmtMoney = n => `£${Number(n).toFixed(2).replace(/\.00$/, "")}`;
  const comma = n => Number(n).toLocaleString("en-GB");
  const sum = arr => arr.reduce((a, b) => a + b, 0);
  const mean = arr => sum(arr) / arr.length;
  const median = arr => { const s = arr.slice().sort((a, b) => a - b), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
  const range = arr => Math.max(...arr) - Math.min(...arr);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const wrapDay = idx => dayNames[((idx % 7) + 7) % 7];
  const fmtTime = (h, m) => `${h}:${`${m}`.padStart(2, "0")}`;
  const mirrorClock = (hour, minute) => {
    const total = (hour === 12 ? 720 : hour * 60) + minute;
    let mirror = 720 - total;
    if (mirror <= 0) mirror += 720;
    if (mirror === 720) return { hour: 12, minute: 0 };
    return { hour: Math.floor(mirror / 60) || 12, minute: mirror % 60 };
  };
  const nextPalindrome = n => { let c = n + 1; while (`${c}` !== `${c}`.split("").reverse().join("")) c += 1; return c; };

  /* pickWording(i, variants) → cycles through equivalent phrasings.
     Uses i/3 so consecutive variations within a small window get different wording. */
  const pickWording = (i, variants) => variants[Math.floor(i / 3) % variants.length];

  /* nudge("540 cm³", 7) → "547 cm³";  nudge("£8.64", 3) → "£11.64"
     Shifts the number inside an answer while keeping its units, currency
     symbol, thousands separators and decimal places, so a made-up option is
     indistinguishable in shape from a real one. Returns null when the answer
     holds no number to shift. */
  const nudge = (text, step) => {
    /* A bare fraction is nudged within its own bounds. Shifting the numerator
       blindly turned 2/5 into 7/5, so probability questions offered 7/5 and
       1/1 as options and shaded-shape questions offered 19/1. */
    const frac = `${text}`.trim().match(/^(\d+)\/(\d+)$/);
    if (frac) {
      const den = Number(frac[2]), num = Number(frac[1]);
      if (den < 3) return null;                  // no room for a proper alternative
      /* Cancelled down, so an invented option is written the same way as a
         real one: nudging 1/12 to "2/12" left an uncancelled fraction sitting
         beside three cancelled ones. */
      for (let delta = 1; delta < den; delta++) {
        for (const cand of [num + delta, num - delta]) {
          if (cand > 0 && cand < den && cand !== num) {
            const shown = simp(cand, den);
            if (shown !== `${num}/${den}`) return shown;
          }
        }
      }
      return null;
    }

    /* A thousands separator is a comma followed by exactly three digits. The
       looser [\d,]* also swallowed the comma in a coordinate pair, so nudging
       "(-1, 1)" matched "-1," and produced "(6 1)" - a malformed option that
       shipped in two templates. */
    const match = `${text}`.match(/-?\d+(?:,\d{3})*(?:\.\d+)?/);
    if (!match) return null;
    const raw = match[0];
    const value = Number(raw.replace(/,/g, ""));
    if (!Number.isFinite(value)) return null;
    const next = value + step;
    const decimals = (raw.split(".")[1] || "").length;
    const shown = decimals ? next.toFixed(decimals)
      : (raw.includes(",") ? comma(next) : `${next}`);
    return `${text}`.replace(raw, shown);
  };

  /* mk(topic, question, correct, distractors, difficulty, seed) → MCQ object.
     Returns null if four genuinely distinct options cannot be built, so the
     driver drops the question rather than shipping a filler option. */
  /* "1/6" and "2/6" are the same answer however differently they are printed,
     so options are compared by value as well as by text. Without this a
     question can ship with two correct options, which is unanswerable. */
  const optionValue = text => {
    const t = `${text}`.replace(/[£$,%\s]/g, "")
      .replace(/°|cm2|cm3|cm|km\/h|km|mph|kg|ml|litres?|m|g|p$/gi, "");
    if (/^-?\d+\/\d+$/.test(t)) {
      const [a, b] = t.split("/").map(Number);
      return b ? `#${a / b}` : null;
    }
    return /^-?\d*\.?\d+$/.test(t) ? `#${Number(t)}` : null;
  };

  const mk = (topic, question, correct, distractors, difficulty, seed) => {
    const uniq = [];
    const values = new Set();
    [correct, ...distractors].map(v => `${v}`).forEach(v => {
      if (uniq.includes(v)) return;
      const val = optionValue(v);
      if (val !== null && values.has(val)) return;   // same number, different text
      if (val !== null) values.add(val);
      uniq.push(v);
    });

    /* The padding loop must apply the same value test as the list above, not
       just a string test: nudging 7/12 produced 8/12 while 2/3 was already an
       option, and the two are the same number. */
    for (let pad = 1; uniq.length < 4 && pad <= 40; pad++) {
      const cand = nudge(uniq[0], pad * 3 + difficulty);
      if (!cand || uniq.includes(cand)) continue;
      const val = optionValue(cand);
      if (val !== null && values.has(val)) continue;
      if (val !== null) values.add(val);
      uniq.push(cand);
    }
    if (uniq.length < 4) return null;

    const pos = ((seed % 4) + 4) % 4;
    const opts = uniq.slice(1, 4);
    opts.splice(pos, 0, uniq[0]);
    return { id: id++, topic, question, options: opts, answer: pos, difficulty };
  };

  const diff = (i, hardCycle = 5) => (i % hardCycle === 0 ? 3 : (i % 2 === 0 ? 2 : 1));

  /* "a" or "an" for a word or a number read aloud: 8, 11 and 18 begin with a
     vowel sound, 13 to 17 do not. */
  const article = value => (/^(?:[aeiou]|8|11|18)/i.test(String(value).trim()) ? "an" : "a");

  /* ═══════════════════ NUMBERS ═══════════════════ */

  function numPlaceValue(i) {
    const digits = [4, 7, 3, 9, 2, 5, 8, 6, 1];
    const target = digits[i % digits.length];
    const pos = i % 5;
    const others = digits.filter(d => d !== target);
    const arr = Array.from({ length: 5 }, (_, k) => others[(i + k) % others.length]);
    arr[4 - pos] = target;
    const num = Number(arr.join(""));
    const ans = target * 10 ** pos;
    return mk("Numbers",
      `What is the value of the digit ${target} in the number ${comma(num)}?`,
      comma(ans),
      /* ans is target x 10^pos, so "ans * 10" and "target x 10^(pos+1)" are
         the same number; and at pos 0 the face value IS the answer. */
      [comma(ans * 10), comma(ans * 100),
       pos > 0 ? comma(target) : comma(target * 1000)],
      diff(i, 4), i);
  }

  function numPlaceValueDiff(i) {
    const d = 3 + (i % 6);
    const hi = 4 + (i % 4);
    const lo = i % 3;
    const baseDigits = [1, 7, 2, 4, 5, 8, 9, 3];
    const arr = baseDigits.slice(0, hi + 2);
    arr[arr.length - 1 - hi] = d;
    arr[arr.length - 1 - lo] = d;
    const num = Number(arr.join(""));
    const ans = d * (10 ** hi - 10 ** lo);
    return mk("Numbers",
      `In the number ${comma(num)}, what is the difference between the place values of the two ${d}s?`,
      comma(ans),
      /* ans is d x 10^hi - d x 10^lo, so "ans + 10^lo x d" is d x 10^hi:
         the first and third distractors were the same number. */
      [comma(d * 10 ** hi), comma(ans - 10 ** lo),
       comma(10 ** hi - 10 ** lo)],
      diff(i), i);
  }

  function numRounding(i) {
    const places = [10, 100, 1000];
    const labels = ["ten", "hundred", "thousand"];
    const idx = i % 3;
    const p = places[idx];
    const n = 1000 + 17 * (i + 3) + 3 * i;
    const ans = Math.round(n / p) * p;
    return mk("Numbers", `What is ${comma(n)} rounded to the nearest ${labels[idx]}?`,
      comma(ans),
      [comma(ans + p), comma(ans - p), comma(Math.floor(n / p) * p === ans ? ans + 2 * p : Math.floor(n / p) * p)],
      diff(i, 5), i);
  }

  function numRoundingBounds(i) {
    const target = 100 + 10 * (i % 50);
    const wantSmall = i % 2 === 0;
    const ans = wantSmall ? target - 5 : target + 4;
    return mk("Numbers",
      `A whole number rounded to the nearest 10 gives ${target}. What is the ${wantSmall ? "smallest" : "largest"} whole number it could have been?`,
      `${ans}`, [`${ans - 1}`, `${ans + 1}`, `${target}`], diff(i), i);
  }

  function numIsPrime(i) {
    const starts = [10, 20, 30, 40, 50, 60, 70, 80];
    const start = starts[i % starts.length];
    const window = primesBetween(start, start + 14);
    const prime = window[i % window.length];
    const composites = [];
    for (let k = start; k <= start + 14 && composites.length < 3; k++) if (!isPrime(k) && k !== prime) composites.push(k);
    while (composites.length < 3) composites.push(prime + composites.length + 1);
    const wording = pickWording(i, [
      `Which of these numbers is a prime number?`,
      `Identify the prime number from these options.`,
      `Which one of the following is prime?`,
      `Pick the prime number from the list.`,
      `Which number below is prime?`,
      `Select the prime number.`,
      `Which of the following is a prime number?`
    ]);
    return mk("Numbers", wording, `${prime}`, composites.map(c => `${c}`), diff(i, 5), i);
  }

  function numLCM(i) {
    const pairs = [
      [4, 6], [6, 8], [3, 5], [4, 10], [8, 12], [9, 12], [5, 7], [6, 10], [4, 5], [3, 8],
      [10, 15], [8, 14], [6, 9], [10, 12], [15, 20], [7, 14], [8, 10], [6, 15], [9, 15],
      [12, 18], [14, 21], [10, 25], [3, 7], [5, 8], [6, 7], [9, 10], [12, 15], [8, 18],
      [10, 14], [15, 18], [20, 24], [12, 16], [11, 22], [14, 28], [16, 20], [18, 24],
      [5, 9], [7, 9], [7, 11], [13, 26], [11, 33], [12, 20], [9, 24], [14, 35], [16, 24],
      [18, 30], [21, 28], [22, 33], [24, 36], [25, 30]
    ];
    const [a, b] = pairs[i % pairs.length];
    const ans = lcm(a, b);
    return mk("Numbers", `What is the Lowest Common Multiple (LCM) of ${a} and ${b}?`,
      `${ans}`, [`${a * b}`, `${ans + a}`, `${gcd(a, b) * (a + b)}`], diff(i, 4), i);
  }

  function numHCF(i) {
    const k = 2 + (i % 6);
    const a = k * (2 + (i % 5));
    const b = k * (3 + ((i + 1) % 5));
    if (a === b) return numHCF(i + 1);
    const ans = gcd(a, b);
    return mk("Numbers", `What is the Highest Common Factor (HCF) of ${a} and ${b}?`,
      `${ans}`, [`${k}`, `${ans * 2}`, `${ans + 2}`], diff(i, 4), i);
  }

  function numHCFofFour(i) {
    const g = 2 + (i % 13);
    const a = g * (4 + (i % 17)), b = g * (7 + ((i * 2) % 19)), c = g * (11 + ((i * 3) % 13)), d = g * (15 + ((i * 5) % 11));
    /* The four multipliers can coincide, which printed "32, 40, 68 and 68". */
    if (new Set([a, b, c, d]).size !== 4) return null;
    return mk("Numbers", `What is the Highest Common Factor (HCF) of ${a}, ${b}, ${c} and ${d}?`,
      `${g}`, [`${g * 2}`, `${g * 3}`, `${g + 1}`], diff(i, 3), i);
  }

  function numPowers(i) {
    const kind = i % 4;
    if (kind === 0) {
      const x = 4 + (i % 11);
      return mk("Numbers", `What is ${x}² (${x} squared)?`, `${x * x}`,
        [`${x * 2}`, `${(x + 1) ** 2}`, `${x * x - x}`], diff(i, 4), i);
    } else if (kind === 1) {
      const x = 2 + (i % 6);
      return mk("Numbers", `What is ${x}³ (${x} cubed)?`, `${x * x * x}`,
        [`${x * 3}`, `${x * x}`, `${(x + 1) ** 3}`], diff(i, 4), i);
    } else if (kind === 2) {
      const x = 4 + (i % 12);
      return mk("Numbers", `What is the square root of ${x * x}?`, `${x}`,
        [`${x - 1}`, `${x + 1}`, `${Math.floor(x * x / 2)}`], diff(i, 4), i);
    } else {
      const x = 2 + (i % 6);
      return mk("Numbers", `What is the cube root of ${x * x * x}?`, `${x}`,
        [`${x - 1}`, `${x + 1}`, `${x * x}`], diff(i, 4), i);
    }
  }

  function numFactorCount(i) {
    const pool = [
      12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 50, 54, 56, 60, 63, 64, 66, 70, 72,
      75, 78, 80, 81, 84, 88, 90, 96, 99, 100, 108, 112, 120, 126, 128, 132, 140, 144,
      150, 160, 168, 180, 192, 196, 200, 210, 216, 224, 240, 256
    ];
    const n = pool[i % pool.length];
    const ans = factorsOf(n).length;
    return mk("Numbers", `How many factors does ${n} have?`,
      `${ans}`, [`${ans + 1}`, `${ans - 1}`, `${ans + 2}`], diff(i, 4), i);
  }

  function numPrimeFactorCount(i) {
    const a = 2 + (i % 4), b = 1 + ((i + 1) % 4), c = 1 + ((i + 2) % 3);
    const x = a + b + c;
    return mk("Numbers", `How many prime factors does 2^${a} × 3^${b} × 5^${c} have, counting repeats?`,
      `${x}`, [`${x - 1}`, `${x + 1}`, `${a * b * c}`], diff(i, 3), i);
  }

  function numArithmetic(i) {
    const op = i % 4;
    if (op === 0) {
      const a = 1000 + 137 * (i + 1), b = 2000 + 211 * (i + 2);
      return mk("Numbers", `What is ${comma(a)} + ${comma(b)}?`, comma(a + b),
        [comma(a + b + 100), comma(a + b - 100), comma(a + b + 10)], diff(i, 4), i);
    } else if (op === 1) {
      const a = 8000 + 173 * (i + 1), b = 1000 + 89 * (i + 1);
      return mk("Numbers", `What is ${comma(a)} − ${comma(b)}?`, comma(a - b),
        [comma(a - b + 100), comma(a - b - 10), comma(a - b + 1)], diff(i, 4), i);
    } else if (op === 2) {
      const a = 20 + (i % 80), b = 3 + (i % 9);
      return mk("Numbers", `What is ${a} × ${b}?`, comma(a * b),
        [comma(a * b + b), comma(a * b - b), comma(a * b + a)], diff(i, 4), i);
    } else {
      const b = 3 + (i % 9), ansBase = 30 + (i % 90);
      return mk("Numbers", `What is ${comma(ansBase * b)} ÷ ${b}?`, `${ansBase}`,
        [`${ansBase + 1}`, `${ansBase - 1}`, `${ansBase + 10}`], diff(i, 4), i);
    }
  }

  function numWordProblem(i) {
    const perDay = 200 + 50 * (i % 8) + (i % 3);
    const days = 5 + (i % 6);
    return mk("Numbers",
      `A shop sells ${perDay} items every day. How many items does it sell in ${days} days?`,
      comma(perDay * days),
      [comma(perDay * days + perDay), comma(perDay * days - perDay), comma(perDay + days)],
      diff(i, 3), i);
  }

  function numBusLCM(i) {
    const triplets = [
      [3, 5, 8], [4, 6, 9], [2, 5, 6], [3, 4, 7], [5, 6, 8], [2, 3, 7],
      [4, 5, 6], [3, 5, 7], [2, 4, 9], [3, 6, 8], [4, 7, 9], [2, 5, 9],
      [3, 4, 5], [5, 7, 8], [4, 6, 7], [3, 8, 9], [2, 6, 9], [5, 6, 9],
      [4, 5, 8], [3, 7, 8], [2, 7, 9], [4, 5, 7], [6, 8, 9], [3, 5, 9]
    ];
    const [p, q, r] = triplets[i % triplets.length];
    const start = 7 + (i % 8);
    const totalMin = lcmAll([p, q, r]);
    const endMin = start * 60 + totalMin;
    const eh = Math.floor(endMin / 60), em = endMin % 60;
    const pad = n => `${n}`.padStart(2, "0");
    const tStr = (h, m) => `${((h - 1) % 12) + 1}:${pad(m)} ${h < 12 ? "a.m." : "p.m."}`;
    return mk("Numbers",
      `Three buses leave a stop together at ${tStr(start, 0)}. Bus A runs every ${p} min, Bus B every ${q} min, Bus C every ${r} min. When do all three next leave together?`,
      tStr(eh, em),
      [tStr(eh, (em + 30) % 60), tStr(eh + 1, em), `${p * q * r} min later`],
      diff(i, 3), i);
  }

  function numSmallestEvenFromDigits(i) {
    const pools = [
      [5, 3, 9, 4, 8], [7, 2, 5, 4, 6], [1, 3, 8, 5, 2], [9, 4, 7, 6, 2], [3, 1, 8, 5, 6], [2, 7, 4, 9, 3],
      [6, 1, 3, 5, 8], [4, 7, 2, 9, 5], [8, 3, 1, 6, 7], [2, 5, 9, 4, 7], [1, 6, 8, 3, 9], [4, 2, 7, 5, 8],
      [9, 1, 6, 4, 3], [7, 3, 2, 8, 5], [3, 9, 6, 1, 4], [5, 8, 2, 7, 6], [6, 4, 9, 1, 2], [8, 5, 3, 7, 4],
      [2, 1, 5, 9, 6], [7, 4, 3, 8, 1], [9, 2, 6, 5, 3], [4, 8, 1, 7, 9], [5, 6, 2, 3, 8], [1, 9, 7, 4, 6]
    ];
    const digits = pools[i % pools.length].slice();
    const evens = digits.filter(d => d % 2 === 0).sort((a, b) => a - b);
    const units = evens[0];
    const rest = digits.filter(d => d !== units).sort((a, b) => a - b);
    const ans = Number([...rest, units].join(""));
    return mk("Numbers",
      `Using each of the digits ${digits.join(", ")} once, what is the smallest even ${digits.length}-digit number you can make?`,
      `${comma(ans)}`,
      /* Rebuilding rest in its own order just reproduced the answer. Putting
         the two largest of the remaining digits the wrong way round is the
         mistake a child actually makes. */
      [comma(ans + 10), comma(ans - 10),
       comma(Number([...rest.slice(0, -2), rest[rest.length - 1],
                     rest[rest.length - 2], units].join(""))),
       comma(Number([units, ...rest].join("")))],
      diff(i, 3), i);
  }

  function numCubeMissing(i) {
    const r = 3 + (i % 13);
    return mk("Numbers",
      `The same whole number is missing from each box: □ × □ × □ = ${r ** 3}. What is that number?`,
      `${r}`, [`${r - 1}`, `${r + 1}`, `${Math.round(Math.sqrt(r ** 3))}`], diff(i), i);
  }

  function numPrimeSumSquare(i) {
    const ranges = [
      [10, 20], [20, 40], [40, 60], [5, 25], [30, 50], [50, 80], [60, 100],
      [2, 30], [15, 45], [25, 55], [35, 65], [45, 75], [55, 95], [70, 110]
    ];
    const [a, b] = ranges[i % ranges.length];
    const ps = primesBetween(a, b);
    let foundSum = 36;
    for (let x = 0; x < ps.length; x++) for (let y = x + 1; y < ps.length; y++) {
      if (isSquare(ps[x] + ps[y])) { foundSum = ps[x] + ps[y]; x = ps.length; break; }
    }
    return mk("Numbers",
      `Two prime numbers between ${a} and ${b} are added to give a square number. Which square number is it?`,
      `${foundSum}`, [`${foundSum + 1}`, `${foundSum - 4}`, `${foundSum + 13}`], diff(i), i);
  }

  function numFourConsecOdd(i) {
    const small = 2 * (5 + (i % 45)) + 1;                 // odd ≥ 11, up to ~99
    const total = small + (small + 2) + (small + 4) + (small + 6);
    return mk("Numbers",
      `Four consecutive odd numbers add up to ${total}. What is the largest of them?`,
      `${small + 6}`, [`${small + 4}`, `${small + 8}`, `${total / 4}`], diff(i, 3), i);
  }

  /* ═══════════════════ DECIMALS ═══════════════════ */

  function decAdd(i) {
    const a = +(1.5 + 0.3 * (i % 9)).toFixed(2);
    const b = +(2.4 + 0.13 * (i % 7)).toFixed(2);
    const ans = +(a + b).toFixed(2);
    return mk("Decimals", `What is ${fmt(a)} + ${fmt(b)}?`, `${fmt(ans)}`,
      [`${fmt(ans + 0.1)}`, `${fmt(ans - 0.01)}`, `${fmt(a - b)}`], diff(i, 4), i);
  }

  function decSubtract(i) {
    const a = +(8.5 + 0.27 * (i % 12)).toFixed(2);
    const b = +(2.18 + 0.13 * (i % 9)).toFixed(2);
    const ans = +(a - b).toFixed(2);
    return mk("Decimals", `What is ${fmt(a)} − ${fmt(b)}?`, `${fmt(ans)}`,
      [`${fmt(ans + 0.1)}`, `${fmt(ans - 0.1)}`, `${fmt(a + b)}`], diff(i, 4), i);
  }

  function decMultiply(i) {
    const a = +(0.7 + 0.23 * (i % 25)).toFixed(2);
    const b = 2 + (i % 12);
    const ans = +(a * b).toFixed(2);
    return mk("Decimals", `What is ${fmt(a)} × ${b}?`, `${fmt(ans)}`,
      [`${fmt(ans + 0.5)}`, `${fmt(ans / 2)}`, `${fmt(a + b)}`], diff(i, 4), i);
  }

  function decDivide(i) {
    const b = 2 + (i % 11);
    const ansBase = +(0.8 + 0.17 * (i % 23)).toFixed(2);
    const a = +(ansBase * b).toFixed(2);
    const ans = +(a / b).toFixed(2);
    return mk("Decimals", `What is ${fmt(a)} ÷ ${b}?`, `${fmt(ans)}`,
      [`${fmt(ans + 0.1)}`, `${fmt(ans * 2)}`, `${fmt(a - b)}`], diff(i, 4), i);
  }

  function decCompare(i) {
    const sets = [
      [0.35, 0.305, 0.53, 0.503], [0.71, 0.107, 0.7, 0.17], [0.82, 0.28, 0.802, 0.208],
      [0.64, 0.046, 0.604, 0.46], [0.93, 0.039, 0.309, 0.7], [0.27, 0.702, 0.072, 0.6],
      [0.45, 0.405, 0.54, 0.045], [0.18, 0.81, 0.108, 0.801], [0.39, 0.093, 0.309, 0.93],
      [0.56, 0.065, 0.506, 0.65], [0.42, 0.024, 0.204, 0.402], [0.88, 0.088, 0.808, 0.18],
      [0.61, 0.106, 0.16, 0.601], [0.74, 0.047, 0.407, 0.47], [0.25, 0.052, 0.502, 0.205],
      [0.96, 0.069, 0.69, 0.906], [0.31, 0.013, 0.103, 0.301], [0.58, 0.085, 0.508, 0.805],
      [0.43, 0.034, 0.304, 0.403], [0.67, 0.076, 0.607, 0.706], [0.29, 0.092, 0.209, 0.902],
      [0.84, 0.048, 0.408, 0.804]
    ];
    const s = sets[i % sets.length];
    const askLargest = i % 2 === 0;
    const ans = askLargest ? Math.max(...s) : Math.min(...s);
    return mk("Decimals",
      `Which is the ${askLargest ? "largest" : "smallest"}: ${s.map(fmt).join(", ")}?`,
      `${fmt(ans)}`, s.filter(x => x !== ans).slice(0, 3).map(fmt), diff(i, 3), i);
  }

  function decRound(i) {
    const dp = (i % 3) + 1;
    const raw = 1.2345 + 0.731 * (i % 9) + 0.0123 * (i % 7);
    const ans = +raw.toFixed(dp);
    /* The number must be printed with more decimals than the question asks for,
       and fmt() caps at three, so it cannot be used here. */
    const shown = Number(raw.toFixed(dp + 2));
    const shownDp = (`${shown}`.split(".")[1] || "").length;
    if (shownDp <= dp) return null;
    return mk("Decimals",
      `Round ${shown} to ${dp} decimal place${dp === 1 ? "" : "s"}.`,
      `${fmt(ans)}`,
      [`${fmt(ans + 10 ** -dp)}`, `${fmt(ans - 10 ** -dp)}`, `${fmt(+raw.toFixed(dp + 1))}`],
      diff(i, 4), i);
  }

  function decToFrac(i) {
    const pairs = [
      { d: 0.25, f: "1/4" }, { d: 0.5, f: "1/2" }, { d: 0.75, f: "3/4" },
      { d: 0.2, f: "1/5" }, { d: 0.4, f: "2/5" }, { d: 0.6, f: "3/5" }, { d: 0.8, f: "4/5" },
      { d: 0.125, f: "1/8" }, { d: 0.375, f: "3/8" }, { d: 0.625, f: "5/8" }, { d: 0.875, f: "7/8" },
      { d: 0.1, f: "1/10" }, { d: 0.3, f: "3/10" }, { d: 0.7, f: "7/10" }, { d: 0.9, f: "9/10" },
      { d: 0.05, f: "1/20" }, { d: 0.15, f: "3/20" }, { d: 0.35, f: "7/20" }, { d: 0.45, f: "9/20" },
      { d: 0.55, f: "11/20" }, { d: 0.65, f: "13/20" }, { d: 0.85, f: "17/20" }, { d: 0.95, f: "19/20" },
      { d: 0.04, f: "1/25" }, { d: 0.08, f: "2/25" }, { d: 0.12, f: "3/25" }, { d: 0.16, f: "4/25" },
      { d: 0.24, f: "6/25" }, { d: 0.28, f: "7/25" }, { d: 0.36, f: "9/25" }, { d: 0.44, f: "11/25" },
      { d: 0.02, f: "1/50" }, { d: 0.06, f: "3/50" }, { d: 0.14, f: "7/50" }, { d: 0.22, f: "11/50" },
      { d: 0.32, f: "8/25" }, { d: 0.48, f: "12/25" }, { d: 0.52, f: "13/25" }, { d: 0.56, f: "14/25" },
      { d: 0.64, f: "16/25" }, { d: 0.68, f: "17/25" }, { d: 0.72, f: "18/25" }, { d: 0.76, f: "19/25" },
      { d: 0.84, f: "21/25" }, { d: 0.88, f: "22/25" }, { d: 0.92, f: "23/25" }, { d: 0.96, f: "24/25" }
    ];
    const p = pairs[i % pairs.length];
    return mk("Decimals", `Express ${fmt(p.d)} as a fraction in simplest form.`,
      p.f, pairs.filter(x => x.f !== p.f).slice(0, 3).map(x => x.f), diff(i, 4), i);
  }

  function decHalfway(i) {
    /* Built outwards from the midpoint, so it is exact. Choosing the two ends
       first gave midpoints like 1.6445, which fmt() rounds to three decimals
       and printed as 1.645 - a wrong answer marked correct. */
    const mid = 1 + 0.05 * (1 + (i % 18));            // two decimal places
    const half = 0.01 * (1 + (i % 9));                // two decimal places
    const a = Math.round((mid - half) * 100) / 100;
    const b = Math.round((mid + half) * 100) / 100;
    const ans = Math.round(mid * 100) / 100;
    if (a <= 0 || a === b) return null;
    return mk("Decimals", `What number is halfway between ${fmt(a)} and ${fmt(b)}?`,
      `${fmt(ans)}`,
      [`${fmt((b - a) / 2)}`, `${fmt(a + b)}`, `${fmt(ans + 0.01)}`],
      diff(i, 3), i);
  }

  function decMultFactReuse(i) {
    const a = 12 + (i % 30), b = 8 + (i % 20);
    const c = a * b;
    const ans = c / (b * 10);
    return mk("Decimals", `Given that ${a} × ${b} = ${c}, work out ${c} ÷ ${b * 10}.`,
      /* ans is a/10, so offering a/10 as a distractor offered the answer. */
      `${fmt(ans)}`, [`${fmt(ans * 10)}`, `${fmt(ans / 10)}`, `${fmt(ans * 100)}`],
      diff(i, 4), i);
  }

  function decPriceChange(i) {
    const v = +((125 + i % 20) / 10).toFixed(1);
    const p = 10 + 5 * (i % 5);
    const q = 5 + 5 * (i % 4);
    const final = +(v * (1 + p / 100) * (1 - q / 100)).toFixed(2);
    return mk("Decimals",
      `A price of £${fmt(v)} is increased by ${p}% and then reduced by ${q}%. What is the final price?`,
      `£${fmt(final)}`,
      /* The first two were the same expression written differently. Treating
         the two changes as one net change is the real mistake; so is
         applying only one of them. */
      [`£${fmt(v * (1 + (p - q) / 100))}`, `£${fmt(v * (1 - q / 100))}`,
       `£${fmt(v * (1 + p / 100))}`, `£${fmt(v)}`],
      diff(i, 3), i);
  }

  /* ═══════════════════ FRACTIONS ═══════════════════ */

  const fracWordings = (op, opSym, a, b, c, d) => [
    `What is ${a}/${b} ${opSym} ${c}/${d}?`,
    `Calculate ${a}/${b} ${opSym} ${c}/${d}, giving your answer in simplest form.`,
    `${a}/${b} ${opSym} ${c}/${d} = ?`,
    `Work out ${a}/${b} ${opSym} ${c}/${d}.`,
    `Simplify ${a}/${b} ${opSym} ${c}/${d}.`,
    `${op} the fractions ${a}/${b} and ${c}/${d}.`,
    `Find ${a}/${b} ${opSym} ${c}/${d}.`
  ];

  function fracAdd(i) {
    const a = 1 + (i % 7), b = 2 + ((i * 3) % 9);
    const c = 1 + ((i * 5 + 1) % 7), d = 3 + ((i * 7 + 2) % 9);
    if (a >= b || c >= d) return fracAdd(i + 1);
    if (a / b + c / d >= 1) return fracAdd(i + 5);
    const n = a * d + c * b, m = b * d;
    const wording = pickWording(i, fracWordings("Add", "+", a, b, c, d));
    return mk("Fractions", wording, simp(n, m),
      [simp(a + c, b + d), simp(n + b, m), simp(n - 1, m)], diff(i, 4), i);
  }

  function fracSubtract(i) {
    const b = 3 + ((i * 3) % 9), a = 2 + (i % Math.max(b - 1, 1));
    const d = 4 + ((i * 5) % 11), c = 1 + ((i * 7) % Math.max(d - 2, 1));
    if (a >= b || c >= d) return fracSubtract(i + 1);
    if (a / b - c / d <= 0) return fracSubtract(i + 5);
    const n = a * d - c * b, m = b * d;
    const wording = pickWording(i, fracWordings("Subtract", "−", a, b, c, d));
    return mk("Fractions", wording, simp(n, m),
      [simp(Math.abs(a - c), Math.max(b - d, 1)), simp(n + 1, m), simp(c, d)], diff(i, 4), i);
  }

  function fracMultiply(i) {
    const a = 1 + (i % 7), b = 2 + ((i * 3) % 9);
    const c = 1 + ((i * 5 + 2) % 7), d = 2 + ((i * 7 + 1) % 9);
    if (a >= b || c >= d) return fracMultiply(i + 1);
    const wording = pickWording(i, fracWordings("Multiply", "×", a, b, c, d));
    return mk("Fractions", wording, simp(a * c, b * d),
      [simp(a + c, b + d), simp(a * c, b + d), simp(a, b)], diff(i, 4), i);
  }

  function fracDivide(i) {
    const a = 1 + (i % 7), b = 2 + ((i * 3) % 9);
    const c = 1 + ((i * 5 + 1) % 7), d = 2 + ((i * 7 + 3) % 9);
    if (a >= b || c >= d) return fracDivide(i + 1);
    const wording = pickWording(i, fracWordings("Divide", "÷", a, b, c, d));
    return mk("Fractions", wording, simp(a * d, b * c),
      [simp(a * c, b * d), simp(a + d, b + c), simp(a, b)], diff(i, 4), i);
  }

  function fracSimplify(i) {
    const k = 2 + (i % 6);
    const a = 1 + (i % 4), b = 2 + ((i + 1) % 5);
    if (gcd(a, b) !== 1) return fracSimplify(i + 3);
    return mk("Fractions", `Simplify ${a * k}/${b * k}.`, simp(a, b),
      [simp(a + 1, b), simp(a, b + 1), simp(a * k, b * k - 1)], diff(i, 4), i);
  }

  function fracImproperToMixed(i) {
    const whole = 1 + (i % 4), d = 3 + (i % 5), n = 1 + (i % (d - 1));
    const improper = whole * d + n;
    return mk("Fractions",
      `Convert ${improper}/${d} to a mixed number in simplest form.`,
      `${whole} ${simp(n, d)}`,
      [`${whole + 1} ${simp(n, d)}`, `${whole} ${simp(n + 1, d)}`, `${whole} ${simp(n, d + 1)}`],
      diff(i, 4), i);
  }

  function fracOfX(i) {
    const fracs = [[3, 7], [2, 5], [3, 8], [5, 6], [4, 9], [3, 10]];
    const [n, d] = fracs[i % fracs.length];
    const x = d * (10 + (i % 20));
    const ans = (n * x) / d;
    return mk("Fractions", `How much is ${n}/${d} of ${x}?`,
      `${ans}`, [`${ans + n}`, `${ans - n}`, `${x / d}`], diff(i, 5), i);
  }

  function fracMixedMultiply(i) {
    const w1 = 1 + (i % 6), n1 = 1 + (i % 5), d1 = 3 + (i % 7);
    const w2 = 1 + ((i + 1) % 4), n2 = 1 + ((i + 2) % 4), d2 = 2 + ((i + 3) % 5);
    if (n1 >= d1 || n2 >= d2) return fracMixedMultiply(i + 1);
    const num = (w1 * d1 + n1) * (w2 * d2 + n2);
    const den = d1 * d2;
    const wholePart = Math.floor(num / den);
    const remPart = num % den;
    const ansStr = remPart === 0 ? `${wholePart}` : `${wholePart} ${simp(remPart, den)}`;
    return mk("Fractions",
      `Calculate ${w1} ${n1}/${d1} × ${w2} ${n2}/${d2} in simplest form.`,
      ansStr,
      [`${wholePart + 1} ${simp(remPart || 1, den)}`, `${wholePart} ${simp((remPart + 1) % den || 1, den)}`, `${w1 + w2} ${simp(n1 + n2, d1 + d2)}`],
      diff(i, 3), i);
  }

  /* ═══════════════════ PERCENTAGES ═══════════════════ */

  function pctOf(i) {
    const pcts = [10, 15, 20, 25, 30, 40, 50, 60, 75];
    const p = pcts[i % pcts.length];
    const base = 40 + 20 * (i % 8);
    const ans = (p * base) / 100;
    return mk("Percentages", `What is ${p}% of ${base}?`, `${fmt(ans)}`,
      [`${fmt(ans + 5)}`, `${fmt(base - ans)}`, `${fmt(base / p)}`], diff(i, 4), i);
  }

  function pctFracToPct(i) {
    const pairs = [
      [1, 2, 50], [1, 4, 25], [3, 4, 75], [1, 5, 20], [2, 5, 40], [3, 5, 60], [4, 5, 80],
      [1, 10, 10], [3, 10, 30], [7, 10, 70], [9, 10, 90], [1, 8, 12.5], [3, 8, 37.5],
      [5, 8, 62.5], [7, 8, 87.5], [1, 20, 5], [3, 20, 15], [7, 20, 35], [9, 20, 45],
      [11, 20, 55], [13, 20, 65], [17, 20, 85], [19, 20, 95], [1, 25, 4], [3, 25, 12],
      [7, 25, 28], [9, 25, 36], [11, 25, 44], [13, 25, 52], [17, 25, 68], [19, 25, 76],
      [21, 25, 84], [23, 25, 92], [1, 50, 2], [3, 50, 6], [7, 50, 14], [11, 50, 22],
      [13, 50, 26], [17, 50, 34], [19, 50, 38], [23, 50, 46], [27, 50, 54], [29, 50, 58],
      [31, 50, 62], [33, 50, 66], [37, 50, 74], [39, 50, 78], [41, 50, 82], [43, 50, 86]
    ];
    const [n, d, p] = pairs[i % pairs.length];
    return mk("Percentages", `Express ${n}/${d} as a percentage.`, `${fmt(p)}%`,
      [`${fmt(p + 5)}%`, `${fmt(p - 5)}%`, `${fmt(n * 10)}%`], diff(i, 4), i);
  }

  function pctDecToPct(i) {
    const decs = [0.05, 0.1, 0.125, 0.2, 0.25, 0.375, 0.4, 0.5, 0.625, 0.7, 0.75, 0.8, 0.875, 0.9];
    const d = decs[i % decs.length];
    const ans = d * 100;
    return mk("Percentages", `Express ${fmt(d)} as a percentage.`, `${fmt(ans)}%`,
      [`${fmt(ans + 5)}%`, `${fmt(ans / 10)}%`, `${fmt(ans * 10)}%`], diff(i, 4), i);
  }

  function pctSalePrice(i) {
    const original = 20 + 10 * (i % 12);
    const discount = [10, 15, 20, 25, 30, 40, 50][i % 7];
    const ans = original * (1 - discount / 100);
    return mk("Percentages",
      `An item costs £${original}. It is reduced by ${discount}%. What is the sale price?`,
      fmtMoney(ans),
      [fmtMoney(original * discount / 100), fmtMoney(original - discount), fmtMoney(ans + 5)],
      diff(i, 4), i);
  }

  function pctIncrease(i) {
    const original = 20 + 12 * (i % 25);
    const p = [4, 5, 8, 10, 12, 15, 18, 20, 22, 25, 30, 35, 40][i % 13];
    const newPrice = original * (1 + p / 100);
    return mk("Percentages",
      `A price of £${original} is increased by ${p}%. What is the new price?`,
      fmtMoney(newPrice),
      [fmtMoney(original + p), fmtMoney(original * p / 100), fmtMoney(newPrice + 10)],
      diff(i, 4), i);
  }

  function pctSimpleInterest(i) {
    const principal = 500 + 200 * (i % 10);
    const rate = 2 + (i % 6);
    const years = 1 + (i % 4);
    const ans = (principal * rate * years) / 100;
    return mk("Percentages",
      `Simple interest on £${comma(principal)} at ${rate}% per year for ${years} year${years === 1 ? "" : "s"}?`,
      fmtMoney(ans),
      [fmtMoney(ans * 2), fmtMoney(principal * rate / 100), fmtMoney(ans + rate)],
      diff(i, 4), i);
  }

  function pctReverse(i) {
    const ps = [10, 20, 25, 40, 50, 75];
    const p = ps[i % ps.length], n = 5 + (i % 18);
    const y = (p * n) / 100;
    return mk("Percentages", `${p}% of a number is ${fmt(y)}. What is the number?`,
      `${fmt(n)}`, [`${fmt(y * 4)}`, `${fmt(n / 2)}`, `${fmt(y + p)}`], diff(i, 3), i);
  }

  function pctChained(i) {
    const aPool = [10, 20, 25, 30, 40, 50, 60, 75, 80];
    const bPool = [20, 25, 30, 40, 50, 60, 80];
    const cPool = [10, 20, 25, 40, 50, 80];
    const a = aPool[i % aPool.length];
    const b = bPool[(i * 3) % bPool.length];
    const c = cPool[(i * 7) % cPool.length];
    const total = 100 + 50 * (i % 12);
    const ans = (a / 100) * (b / 100) * (c / 100) * total;
    return mk("Percentages", `What is ${a}% of ${b}% of ${c}% of ${total}?`,
      `${fmt(ans)}`,
      [`${fmt(ans * 10)}`, `${fmt(ans / 10)}`, `${fmt((a + b + c) / 100 * total)}`],
      diff(i, 2), i);
  }

  /* ═══════════════════ BIDMAS ═══════════════════ */

  function bidSimple(i) {
    const a = 3 + (i % 8), b = 2 + (i % 6), c = 2 + (i % 5);
    return mk("BIDMAS", `What is ${a} + ${b} × ${c}?`, `${a + b * c}`,
      [`${(a + b) * c}`, `${a + b * c + 1}`, `${a + b * c - 1}`], diff(i, 4), i);
  }

  function bidBrackets(i) {
    const a = 3 + (i % 7), b = 2 + (i % 6), c = 2 + (i % 5);
    const ans = (a + b) * c;
    return mk("BIDMAS", `What is (${a} + ${b}) × ${c}?`, `${ans}`,
      [`${a + b * c}`, `${ans + c}`, `${ans - c}`], diff(i, 4), i);
  }

  function bidPowers(i) {
    const a = 10 + 5 * (i % 8), b = 2 + (i % 4), c = 1 + (i % 5);
    const ans = a - b * b + c;
    return mk("BIDMAS", `What is ${a} − ${b}² + ${c}?`, `${ans}`,
      [`${(a - b) * b + c}`, `${a - (b + c) ** 2}`, `${ans + 5}`], diff(i, 4), i);
  }

  function bidMixed(i) {
    const a = 5 + (i % 6), b = 2 + (i % 5), c = 2 + (i % 4), d = 4 + (i % 6), e = 2;
    const ans = a + b * c - d / e;
    return mk("BIDMAS", `What is ${a} + ${b} × ${c} − ${d} ÷ ${e}?`, `${ans}`,
      [`${ans + 2}`, `${ans - 2}`, `${(a + b) * c - d / e}`], diff(i, 4), i);
  }

  function bidNegative(i) {
    const a = 2 + (i % 5), b = 3 + (i % 4), c = 2 + (i % 5);
    const ans = -a + b * -c;
    return mk("BIDMAS", `What is −${a} + ${b} × (−${c})?`, `${ans}`,
      /* ans is -(a + bc), so the third distractor was the answer itself. */
      [`${ans + 2}`, `${a + b * c}`, `${b * c - a}`], diff(i, 4), i);
  }

  function bidTempChange(i) {
    const start = 1 + (i % 18);
    const endTemp = -(3 + ((i * 3) % 17));
    return mk("BIDMAS",
      `If the temperature drops from ${start}°C to ${endTemp}°C, by how many degrees did it drop?`,
      `${start - endTemp}°C`,
      [`${start + endTemp}°C`, `${endTemp}°C`, `${start - endTemp + 1}°C`],
      diff(i, 4), i);
  }

  /* ═══════════════════ ALGEBRA ═══════════════════ */

  function algSubLinear(i) {
    const x = 2 + (i % 8), a = 2 + (i % 5), b = 1 + (i % 7);
    return mk("Algebra", `If x = ${x}, what is ${a}x + ${b}?`, `${a * x + b}`,
      [`${a * x + b + a}`, `${a * x + b - a}`, `${a + x + b}`], diff(i, 4), i);
  }

  function algSubMulti(i) {
    const x = -3 - (i % 4), y = 1 + (i % 3), z = -2 - (i % 3);
    const a = 2 + (i % 3);
    const ans = a * x - y + z;
    return mk("Algebra", `If x = ${x}, y = ${y} and z = ${z}, find ${a}x − y + z.`,
      `${ans}`, [`${ans + 2}`, `${ans - 2}`, `${a * x + y - z}`], diff(i, 3), i);
  }

  function algSubQuadratic(i) {
    const x = -2 - (i % 11);
    const k = 2 + (i % 9);
    const ans = -k * x * x;
    return mk("Algebra", `If x = ${x}, find the value of −${k}x².`,
      `${ans}`, [`${-ans}`, `${k * x}`, `${ans + k}`], diff(i, 3), i);
  }

  function algSolve1Step(i) {
    const op = i % 2;
    if (op === 0) {
      const x = 3 + (i % 12), c = 5 + (i % 10);
      return mk("Algebra", `Solve: x + ${c} = ${x + c}`, `x = ${x}`,
        [`x = ${x + 1}`, `x = ${x - 1}`, `x = ${c}`], diff(i, 4), i);
    } else {
      const x = 2 + (i % 9), c = 2 + (i % 7);
      return mk("Algebra", `Solve: ${c}x = ${c * x}`, `x = ${x}`,
        [`x = ${x + 1}`, `x = ${c}`, `x = ${c * x}`], diff(i, 4), i);
    }
  }

  function algSolve2Step(i) {
    const x = 2 + (i % 9), a = 2 + (i % 5), b = 1 + (i % 8);
    return mk("Algebra", `Solve: ${a}x + ${b} = ${a * x + b}`, `x = ${x}`,
      [`x = ${x + 1}`, `x = ${x - 1}`, `x = ${a * x + b - b}`], diff(i, 3), i);
  }

  function algSolveBothSides(i) {
    const x = 2 + (i % 7);
    const a = 3 + (i % 4), c = 1 + (i % 3);
    /* With a === c the two sides become identical and every x is a solution,
       which is not a question. It happened once every twelve seeds. */
    if (a <= c) return null;
    const b = 1 + (i % 5), d = (a - c) * x + b;
    return mk("Algebra", `Solve: ${a}x + ${b} = ${c}x + ${d}`, `x = ${x}`,
      [`x = ${x + 1}`, `x = ${x - 1}`, `x = ${b + d}`], diff(i, 3), i);
  }

  function algSimplifyTerms(i) {
    const a = 2 + (i % 5), b = 1 + (i % 4), c = 1 + (i % 3), d = 1 + (i % 4);
    if (a - c <= 0) return algSimplifyTerms(i + 1);
    return mk("Algebra", `Simplify: ${a}a + ${b}b − ${c}a + ${d}b`,
      `${a - c}a + ${b + d}b`,
      [`${a + c}a + ${b + d}b`, `${a - c}a − ${b + d}b`, `${a}a + ${b}b`],
      diff(i, 4), i);
  }

  function algCustomOp(i) {
    const k = 2 + (i % 4), a = 4 + (i % 5), b = 2 + (i % 4);
    const ans = a * a + k * b;
    return mk("Algebra", `Define a ⊗ b = a² + ${k}b. What is ${a} ⊗ ${b}?`,
      `${ans}`, [`${ans + k}`, `${ans - k}`, `${a * a * k + b}`], diff(i, 3), i);
  }

  function algWeightPair(i) {
    const total = 100 + 20 * (i % 8) + (i % 3);
    const d = 5 + 2 * (i % 7);
    const heavier = (total + d) / 2, lighter = (total - d) / 2;
    const askH = i % 2 === 0;
    return mk("Algebra",
      `Two people weigh ${fmt(total)} kg in total. One is ${d} kg heavier than the other. How heavy is the ${askH ? "heavier" : "lighter"} person?`,
      `${fmt(askH ? heavier : lighter)} kg`,
      [`${fmt(askH ? lighter : heavier)} kg`, `${fmt(total - d)} kg`, `${fmt(total / 2)} kg`],
      diff(i, 3), i);
  }

  function algTriangleAngles(i) {
    const kPool = [3, 4, 5, 2];
    const k = kPool[i % kPool.length];
    const d = 5 + 3 * (i % 30);
    const C = 180 / (k + 1);
    const A = (k * C + d) / 2, B = k * C - A;
    if (B <= 0) return algTriangleAngles(i + 1);
    return mk("Algebra",
      `In a triangle, two angles sum to ${k} times the third. The largest is ${d}° more than the second largest. Find the largest angle.`,
      `${fmt(A)}°`, [`${fmt(B)}°`, `${fmt(C)}°`, `${fmt(A + 10)}°`],
      diff(i, 3), i);
  }

  /* ═══════════════════ SEQUENCES ═══════════════════ */

  function seqArithNext(i) {
    const a = 1 + (i % 8), d = 2 + (i % 7);
    const terms = [a, a + d, a + 2 * d, a + 3 * d];
    return mk("Sequences", `What is the next term in: ${terms.join(", ")}, ...?`,
      `${a + 4 * d}`, [`${a + 5 * d}`, `${a + 3 * d}`, `${a + 4 * d + 1}`], diff(i, 4), i);
  }

  function seqArithNth(i) {
    const a = 2 + (i % 9), d = 2 + (i % 6), n = 8 + (i % 12);
    return mk("Sequences",
      `What is the ${n}th term of the sequence ${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, ...?`,
      `${a + (n - 1) * d}`,
      [`${a + n * d}`, `${a + (n - 1) * d - d}`, `${a * n}`],
      diff(i, 3), i);
  }

  function seqArithNthFormula(i) {
    const d = 2 + (i % 11), a = 1 + (i % 13);
    const first4 = [a, a + d, a + 2 * d, a + 3 * d];
    const intercept = a - d;
    const ansStr = intercept === 0 ? `${d}n` : (intercept > 0 ? `${d}n+${intercept}` : `${d}n${intercept}`);
    return mk("Sequences", `What is the nth term of ${first4.join(", ")}, ...?`,
      ansStr, [`${d + 1}n`, `${d}n+${a}`, `${d * 2}n`], diff(i, 3), i);
  }

  function seqFibLike(i) {
    const a = 1 + (i % 9), b = 1 + ((i * 3 + 1) % 11);
    const t3 = a + b, t4 = b + t3, t5 = t3 + t4, t6 = t4 + t5;
    return mk("Sequences",
      `Each term is the sum of the previous two: ${a}, ${b}, ${t3}, ${t4}, ${t5}, ... What is the next term?`,
      `${t6}`, [`${t6 + 1}`, `${t6 - 1}`, `${t5 * 2}`], diff(i, 3), i);
  }

  function seqGeomNext(i) {
    const a = 1 + (i % 9), r = 2 + (i % 5);
    const terms = [a, a * r, a * r * r, a * r ** 3];
    return mk("Sequences", `What is the next term in: ${terms.join(", ")}, ...?`,
      `${a * r ** 4}`,
      [`${a * r ** 5}`, `${terms[3] + r}`, `${terms[3] * 2}`],
      diff(i, 4), i);
  }

  function seqBallPattern(i) {
    const a = 1 + (i % 4), d = 3 + (i % 5), n = 8 + (i % 8);
    const ans = a + d * (n - 1);
    return mk("Sequences",
      `A pattern has ${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, ... balls (adding ${d} each time). How many balls in the ${n}th pattern?`,
      `${ans}`, [`${ans + d}`, `${ans - d}`, `${a * n}`], diff(i, 3), i);
  }

  /* ═══════════════════ RATIO ═══════════════════ */

  function ratSimplify(i) {
    const k = 2 + (i % 6), a = 1 + (i % 5), b = a + 1 + (i % 4);
    if (gcd(a, b) !== 1) return ratSimplify(i + 1);
    return mk("Ratio", `Simplify the ratio ${a * k} : ${b * k}.`, `${a}:${b}`,
      [`${a + 1}:${b}`, `${a}:${b + 1}`, `${a * k}:${b * k - 1}`], diff(i, 4), i);
  }

  function ratSplit(i) {
    const a = 2 + (i % 4), b = a + 1 + (i % 4), perPart = 6 + (i % 10);
    const total = (a + b) * perPart;
    return mk("Ratio", `Split £${total} in the ratio ${a} : ${b}.`,
      `£${a * perPart} and £${b * perPart}`,
      [`£${b * perPart} and £${a * perPart}`, `£${(a + 1) * perPart} and £${(b - 1) * perPart}`, `£${total / 2} and £${total / 2}`],
      diff(i, 3), i);
  }

  function ratWordTotal(i) {
    const a = 2 + (i % 4), b = a + 1 + (i % 4), perPart = 3 + (i % 5);
    const total = (a + b) * perPart;
    const askBoys = i % 2 === 0;
    return mk("Ratio",
      `In a class, boys to girls is ${a} : ${b}. There are ${total} pupils. How many ${askBoys ? "boys" : "girls"}?`,
      `${(askBoys ? a : b) * perPart}`,
      [`${(askBoys ? b : a) * perPart}`, `${(a + 1) * perPart}`, `${total / 2}`],
      diff(i, 3), i);
  }

  function ratDifference(i) {
    const a = 2 + (i % 3), b = a + 1 + (i % 4);
    const diffParts = b - a, perPart = 4 + 2 * (i % 8);
    return mk("Ratio",
      `Years 7 and 8 are entered in the ratio ${a}:${b}. There are ${diffParts * perPart} more Year 8 pupils. How many in total?`,
      `${(a + b) * perPart}`,
      [`${(a + b) * perPart + (a + b)}`, `${(a + b) * perPart - (a + b)}`, `${diffParts * perPart * (a + b)}`],
      diff(i, 3), i);
  }

  function ratRecipe(i) {
    const baseSrv = 4 + 2 * (i % 4), baseAmt = 200 + 100 * (i % 5);
    const newSrv = baseSrv + 2 + 2 * (i % 4);
    const ans = (baseAmt * newSrv) / baseSrv;
    return mk("Ratio",
      `A recipe for ${baseSrv} people uses ${baseAmt} g of flour. How much for ${newSrv} people?`,
      `${fmt(ans)} g`,
      [`${fmt(ans + baseAmt / 4)} g`, `${fmt(baseAmt + newSrv)} g`, `${fmt(ans / 2)} g`],
      diff(i, 3), i);
  }

  function ratMapScale(i) {
    const realM = 4 + (i % 10), planCm = 3 + (i % 8);
    return mk("Ratio",
      `A plan uses a scale of 1 cm to ${realM} m. A playground is ${planCm} cm on the plan. What is its real length?`,
      `${planCm * realM} m`,
      [`${(planCm + 1) * realM} m`, `${(planCm - 1) * realM} m`, `${planCm + realM} m`],
      diff(i, 3), i);
  }

  function ratInverseProp(i) {
    const w1 = 2 + (i % 5), h1 = 6 + 2 * (i % 6), w2 = w1 + 1 + (i % 4);
    const ans = (w1 * h1) / w2;
    return mk("Ratio",
      `${w1} builders take ${h1} hours to build a wall. How long would ${w2} builders take at the same rate?`,
      `${fmt(ans)} hours`,
      [`${fmt(h1)} hours`, `${fmt(ans + 1)} hours`, `${fmt(w2 * h1 / w1)} hours`],
      diff(i, 3), i);
  }

  function ratChained(i) {
    const a = 2 + (i % 4), b = a + 1 + (i % 3);
    const c = 3 + (i % 4), d = c + 1 + (i % 4);
    const A = a * c, C = b * d, g = gcd(A, C);
    return mk("Ratio",
      `Blue to red pens is ${a}:${b} and red to green is ${c}:${d}. What is blue to green in simplest form?`,
      `${A / g}:${C / g}`,
      [`${a}:${d}`, `${A}:${C}`, `${b}:${c}`],
      diff(i, 3), i);
  }

  /* ═══════════════════ SPEED ═══════════════════ */

  function spdFindSpeed(i) {
    const d = 60 + 30 * (i % 8), t = 1 + (i % 6);
    const ans = d / t;
    return mk("Speed",
      `A car travels ${d} km in ${t} hour${t === 1 ? "" : "s"}. What is its average speed?`,
      `${fmt(ans)} km/h`,
      [`${fmt(ans + 10)} km/h`, `${fmt(ans - 10)} km/h`, `${fmt(d * t)} km/h`],
      diff(i, 4), i);
  }

  function spdFindDistance(i) {
    const s = 25 + 7 * (i % 18), t = 1 + (i % 12);
    return mk("Speed",
      `A train travels at ${s} km/h for ${t} hour${t === 1 ? "" : "s"}. What distance does it cover?`,
      `${s * t} km`, [`${s * t + s} km`, `${s * t - s} km`, `${s + t} km`],
      diff(i, 4), i);
  }

  function spdFindTime(i) {
    const s = 8 + 4 * (i % 17), t = 1 + (i % 11);
    return mk("Speed", `A cyclist covers ${s * t} km at ${s} km/h. How long does it take?`,
      `${t} h`, [`${t + 1} h`, `${t - 1 || t + 2} h`, `${s + t * s} h`],
      diff(i, 4), i);
  }

  function spdMphHoursMin(i) {
    const mph = 30 + 5 * (i % 10), h = 1 + (i % 4), m = 10 * (i % 6);
    const total = h + m / 60;
    const ans = mph * total;
    return mk("Speed",
      `A car travels at ${mph} mph. How far will it travel in ${h} hour${h === 1 ? "" : "s"} ${m} minutes?`,
      `${fmt(ans)} miles`,
      [`${fmt(mph * h)} miles`, `${fmt(mph * (h + 1))} miles`, `${fmt(ans + mph / 2)} miles`],
      diff(i, 3), i);
  }

  /* ═══════════════════ MEASUREMENT ═══════════════════ */

  function meaUnitConvert(i) {
    const kind = i % 4;
    if (kind === 0) {
      const cm = 200 + 50 * (i % 10);
      return mk("Measurement", `Convert ${cm} cm to metres.`, `${cm / 100} m`,
        [`${cm * 100} m`, `${cm / 10} m`, `${cm / 1000} m`], diff(i, 4), i);
    } else if (kind === 1) {
      const g = 1000 + 250 * (i % 8) + 100 * (i % 5);
      return mk("Measurement", `Convert ${comma(g)} grams to kilograms.`, `${fmt(g / 1000)} kg`,
        [`${fmt(g * 1000)} kg`, `${fmt(g / 100)} kg`, `${fmt(g / 10)} kg`], diff(i, 4), i);
    } else if (kind === 2) {
      const L = 2 + 0.5 * (i % 8);
      return mk("Measurement", `How many millilitres are in ${fmt(L)} litres?`, `${comma(L * 1000)} ml`,
        [`${comma(L * 100)} ml`, `${comma(L * 10)} ml`, `${comma(L / 1000)} ml`], diff(i, 4), i);
    } else {
      const m = 100 * (1 + (i % 50));
      return mk("Measurement", `How many metres is ${comma(m * 1000)} mm?`, `${comma(m)} m`,
        [`${comma(m * 10)} m`, `${comma(m / 10)} m`, `${comma(m * 100)} m`], diff(i, 4), i);
    }
  }

  function meaAreaPerim(i) {
    const w = 4 + (i % 8), h = 3 + (i % 7);
    const askArea = i % 2 === 0;
    if (askArea) {
      return mk("Measurement", `What is the area of a rectangle ${w} cm × ${h} cm?`,
        `${w * h} cm²`,
        [`${2 * (w + h)} cm²`, `${w * h + w} cm²`, `${(w + 1) * h} cm²`],
        diff(i, 4), i);
    } else {
      return mk("Measurement", `What is the perimeter of a rectangle ${w} cm × ${h} cm?`,
        `${2 * (w + h)} cm`,
        [`${w * h} cm`, `${2 * (w + h) + 2} cm`, `${w + h} cm`],
        diff(i, 4), i);
    }
  }

  function meaVolumeCube(i) {
    const s = 2 + (i % 19);
    return mk("Measurement", `What is the volume of a cube with side ${s} cm?`,
      `${s ** 3} cm³`,
      [`${6 * s * s} cm³`, `${s * s} cm³`, `${s ** 3 + s} cm³`],
      diff(i, 4), i);
  }

  function meaTempDiff(i) {
    const cold = -3 - (i % 12), warm = 2 + (i % 12);
    return mk("Measurement",
      `City A shows ${cold}°C and City B shows ${warm}°C. What is the difference in temperature?`,
      `${warm - cold}°C`,
      [`${warm + cold}°C`, `${Math.abs(warm) + Math.abs(cold) - 1}°C`, `${warm - cold - 2}°C`],
      diff(i, 3), i);
  }

  function meaInchConvert(i) {
    const inches = 2 + (i % 23);
    const askMm = i % 2 === 0;
    const cm = inches * 2.5, mm = cm * 10;
    return mk("Measurement",
      `Given 1 inch = 2.5 cm, what is ${inches} inches in ${askMm ? "millimetres" : "centimetres"}?`,
      `${fmt(askMm ? mm : cm)} ${askMm ? "mm" : "cm"}`,
      [`${fmt(askMm ? cm : mm)} ${askMm ? "mm" : "cm"}`, `${fmt(inches * 2)} ${askMm ? "mm" : "cm"}`, `${fmt(inches)} ${askMm ? "mm" : "cm"}`],
      diff(i, 3), i);
  }

  function meaMoneyChange(i) {
    const itemA = 50 + 5 * (i % 12), itemB = 55 + 4 * (i % 9);
    const nA = 3 + (i % 6), nB = 2 + (i % 5);
    const noteP = 1000 * (1 + (i % 2));
    const totalP = nA * itemA + nB * itemB;
    const ans = (noteP - totalP) / 100;
    return mk("Measurement",
      `Buy ${nA} bags of crisps at ${itemA} p each and ${nB} bags of nuts at ${itemB} p each. Change from £${noteP / 100}?`,
      `£${ans.toFixed(2)}`,
      [`£${(ans + 0.1).toFixed(2)}`, `£${(ans - 0.1).toFixed(2)}`, `£${(totalP / 100).toFixed(2)}`],
      diff(i, 3), i);
  }

  /* ═══════════════════ GEOMETRY ═══════════════════ */

  function geoAngleSum(i) {
    // Use formula (n-2)*180 for any n-gon
    const n = 3 + (i % 18);                                // 3..20 sides
    const names = { 3: "a triangle", 4: "a quadrilateral", 5: "a pentagon", 6: "a hexagon",
                    7: "a heptagon", 8: "an octagon", 9: "a nonagon", 10: "a decagon",
                    11: "an 11-sided polygon", 12: "a dodecagon", 13: "a 13-sided polygon",
                    14: "a 14-sided polygon", 15: "a 15-sided polygon", 16: "a 16-sided polygon",
                    17: "a 17-sided polygon", 18: "an 18-sided polygon", 19: "a 19-sided polygon",
                    20: "a 20-sided polygon" };
    const sumDeg = (n - 2) * 180;
    return mk("Geometry", `What is the sum of interior angles in ${names[n]}?`,
      `${sumDeg}°`, [`${sumDeg + 180}°`, `${sumDeg - 180}°`, `${sumDeg / 2}°`], diff(i, 4), i);
  }

  function geoAngleType(i) {
    const a = 5 + 7 * (i % 50);                            // 5..348°
    let t;
    if (a === 90) t = "Right";
    else if (a === 180) t = "Straight";
    else if (a < 90) t = "Acute";
    else if (a < 180) t = "Obtuse";
    else t = "Reflex";
    return mk("Geometry", `What type of angle is ${a}°?`, t,
      ["Acute", "Obtuse", "Right", "Reflex", "Straight"].filter(x => x !== t).slice(0, 3),
      diff(i, 4), i);
  }

  function geoShapeAngle(i) {
    // Interior angle of regular n-gon = (n-2)*180/n
    const n = 3 + (i % 13);                                // 3..15 sides
    const names = { 3: "equilateral triangle", 4: "square", 5: "regular pentagon",
                    6: "regular hexagon", 7: "regular heptagon", 8: "regular octagon",
                    9: "regular nonagon", 10: "regular decagon", 11: "regular 11-gon",
                    12: "regular dodecagon", 13: "regular 13-gon", 14: "regular 14-gon",
                    15: "regular 15-gon" };
    const val = (n - 2) * 180 / n;
    return mk("Geometry", `Each interior angle of ${article(names[n])} ${names[n]} is:`, `${fmt(val)}°`,
      [`${fmt(val + 30)}°`, `${fmt(val - 30)}°`, `${fmt(360 / n)}°`], diff(i, 4), i);
  }

  function geoComplementary(i) {
    const a = 10 + 5 * (i % 32);                           // 10..165°
    const onStraight = i % 2 === 0;
    const ans = onStraight ? 180 - a : 360 - a;
    return mk("Geometry",
      `Two angles ${onStraight ? "on a straight line" : "around a point"} include one of ${a}°. What is the other?`,
      `${ans}°`, [`${ans + 10}°`, `${ans - 10}°`, `${90 - a}°`],
      diff(i, 4), i);
  }

  function geoTriangleArea(i) {
    const b = 4 + (i % 9), h = 3 + (i % 8);
    return mk("Geometry",
      `What is the area of a triangle with base ${b} cm and height ${h} cm?`,
      `${fmt((b * h) / 2)} cm²`,
      [`${b * h} cm²`, `${fmt((b * h) / 2 + 2)} cm²`, `${b + h} cm²`],
      diff(i, 4), i);
  }

  function geoLinesSymmetry(i) {
    const shapes = [
      { n: "regular pentagon", l: 5 }, { n: "regular hexagon", l: 6 },
      { n: "equilateral triangle", l: 3 }, { n: "square", l: 4 },
      { n: "rectangle (not a square)", l: 2 },
      { n: "parallelogram (not a rectangle or rhombus)", l: 0 },
      { n: "isosceles triangle (not equilateral)", l: 1 },
      { n: "regular octagon", l: 8 }, { n: "rhombus (not a square)", l: 2 },
      { n: "regular heptagon", l: 7 }, { n: "regular nonagon", l: 9 },
      { n: "regular decagon", l: 10 }, { n: "regular dodecagon", l: 12 },
      { n: "kite (not a rhombus)", l: 1 }, { n: "scalene triangle", l: 0 },
      { n: "trapezium (non-isosceles)", l: 0 }, { n: "isosceles trapezium", l: 1 },
      { n: "regular 11-gon", l: 11 }, { n: "right-angled (non-isosceles) triangle", l: 0 },
      { n: "regular 14-gon", l: 14 }, { n: "regular 16-gon", l: 16 },
      { n: "circle", l: -1 }
    ];
    const s = shapes[i % shapes.length];
    const ansText = s.l === -1 ? "infinitely many" : `${s.l}`;
    return mk("Geometry", `How many lines of symmetry does ${article(s.n)} ${s.n} have?`,
      ansText,
      s.l === -1 ? ["0", "4", "8"] : [`${s.l + 1}`, `${Math.max(s.l - 1, 0)}`, `${s.l + 2}`],
      diff(i, 4), i);
  }

  function geoRotSymmetry(i) {
    const shapes = [
      { n: "equilateral triangle", o: 3 }, { n: "square", o: 4 },
      { n: "regular pentagon", o: 5 }, { n: "regular hexagon", o: 6 },
      { n: "rectangle (not a square)", o: 2 }, { n: "parallelogram", o: 2 },
      { n: "regular octagon", o: 8 }, { n: "trapezium (non-isosceles)", o: 1 },
      { n: "regular heptagon", o: 7 }, { n: "regular nonagon", o: 9 },
      { n: "regular decagon", o: 10 }, { n: "regular dodecagon", o: 12 },
      { n: "regular 11-gon", o: 11 }, { n: "rhombus (not a square)", o: 2 },
      { n: "kite (not a rhombus)", o: 1 }, { n: "scalene triangle", o: 1 },
      { n: "isosceles trapezium", o: 1 }, { n: "regular 14-gon", o: 14 },
      { n: "regular 16-gon", o: 16 }, { n: "regular 18-gon", o: 18 }
    ];
    const s = shapes[i % shapes.length];
    return mk("Geometry", `What is the order of rotational symmetry of ${article(s.n)} ${s.n}?`,
      `${s.o}`, [`${s.o + 1}`, `${Math.max(s.o - 1, 1)}`, `${s.o * 2}`],
      diff(i, 4), i);
  }

  function geoPrismFEV(i) {
    const n = 3 + (i % 13);                                // 3..15-gonal base
    const names = { 3: "triangular", 4: "rectangular", 5: "pentagonal", 6: "hexagonal",
                    7: "heptagonal", 8: "octagonal", 9: "nonagonal", 10: "decagonal",
                    11: "11-gonal", 12: "dodecagonal", 13: "13-gonal", 14: "14-gonal",
                    15: "15-gonal" };
    const choose = i % 3;
    const f = n + 2, e = 3 * n, v = 2 * n;
    const labels = ["faces", "edges", "vertices"];
    const ans = [f, e, v][choose];
    const q = mk("Geometry", `How many ${labels[choose]} does ${article(names[n])} ${names[n]} prism have?`,
      `${ans}`, [`${ans + 1}`, `${ans - 1}`, `${ans + n}`],
      diff(i, 3), i);
    /* Give the formula, not "count them" — for a 14-gonal prism counting is
       hopeless. Which formula depends on what was asked, so it is set here where
       both the measure and n are known. */
    if (q) {
      q.explain = [
        `For an n-gonal prism the number of faces is F = n + 2: one rectangular face for each side of the base, plus the two ends. Here n = ${n}, so F = ${n} + 2 = ${f}.`,
        `For an n-gonal prism the number of edges is E = 3n: n edges round the top, n round the bottom, and n joining them. Here n = ${n}, so E = 3 × ${n} = ${e}.`,
        `For an n-gonal prism the number of vertices is V = 2n: the two identical bases each have n corners. Here n = ${n}, so V = 2 × ${n} = ${v}.`
      ][choose];
    }
    return q;
  }

  function geoCuboidMissingEdge(i) {
    const a = 2 + (i % 5), b = 3 + (i % 6), x = 2 + (i % 8);
    return mk("Geometry",
      `A cuboid has volume ${a * b * x} cm³. Two edges are ${a} cm and ${b} cm. What is the third edge?`,
      `${x} cm`, [`${x + 1} cm`, `${x - 1} cm`, `${a + b} cm`],
      diff(i, 3), i);
  }

  /* ═══════════════════ STATISTICS ═══════════════════ */

  function statMean(i) {
    const n = 4 + (i % 4);
    const data = Array.from({ length: n }, (_, k) => 2 + ((i * 7 + k * 3 + 1) % 12));
    const ans = mean(data);
    const wording = pickWording(i, statMeanWording(data));
    return mk("Statistics", wording,
      `${fmt(ans)}`, [`${fmt(ans + 1)}`, `${fmt(ans - 1)}`, `${median(data)}`],
      diff(i, 4), i);
  }

  function statMedian(i) {
    const n = 5 + (i % 3);
    const data = Array.from({ length: n }, (_, k) => 1 + ((i * 5 + k * 4 + 2) % 14));
    const ans = median(data);
    return mk("Statistics", `Find the median of: ${data.join(", ")}.`,
      `${fmt(ans)}`, [`${fmt(mean(data))}`, `${fmt(ans + 1)}`, `${fmt(ans - 1)}`],
      diff(i, 4), i);
  }

  function statMode(i) {
    const n = 7 + (i % 3);
    const dup = 2 + ((i * 3) % 8);
    const data = Array.from({ length: n }, (_, k) =>
      k === 1 || k === 4 || k === 6 ? dup : 1 + ((i * 5 + k * 2 + 1) % 9));
    return mk("Statistics", `Find the mode of: ${data.join(", ")}.`,
      `${dup}`, [`${dup + 1}`, `${dup - 1}`, `${fmt(mean(data))}`],
      diff(i, 4), i);
  }

  function statRange(i) {
    const n = 5 + (i % 4);
    const data = Array.from({ length: n }, (_, k) => 2 + ((i * 13 + k * 7) % 23));
    return mk("Statistics", `Find the range of: ${data.join(", ")}.`,
      `${range(data)}`, [`${range(data) + 1}`, `${range(data) - 1}`, `${Math.max(...data)}`],
      diff(i, 4), i);
  }

  function statMissingMean(i) {
    const n = 4 + (i % 5);
    const targetMean = 5 + (i % 15);
    const known = Array.from({ length: n - 1 }, (_, k) => 2 + ((i * 7 + k * 11 + k) % 18));
    const missing = targetMean * n - sum(known);
    if (missing <= 0 || missing > 40) return statMissingMean(i + 3);
    return mk("Statistics",
      `The mean of ${n} numbers is ${targetMean}. ${n - 1} of them are ${known.join(", ")}. What is the missing number?`,
      `${missing}`, [`${missing + 1}`, `${Math.max(missing - 1, 1)}`, `${targetMean}`],
      diff(i, 3), i);
  }

  function statFreqMidpoint(i) {
    const widths = [5, 10, 15, 20, 25];
    const width = widths[i % widths.length];
    const lo = width * (1 + (i % 10));
    const hi = lo + width;
    return mk("Statistics",
      `In a grouped frequency table, the class ${lo} ≤ x < ${hi} has midpoint:`,
      `${(lo + hi) / 2}`, [`${lo}`, `${hi}`, `${(lo + hi) / 2 + 5}`],
      diff(i, 5), i);
  }

  function statPieAngle(i) {
    const sectors = [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60][i % 18];
    const ans = 360 / sectors;
    return mk("Statistics",
      `A pie chart is divided into ${sectors} equal sectors. What angle is each sector?`,
      `${ans}°`, [`${ans * 2}°`, `${fmt(ans / 2)}°`, `${360 - ans}°`],
      diff(i, 5), i);
  }

  function statPictogram(i) {
    const each = 2 + (i % 14), symbols = 3 + (i % 11);
    return mk("Statistics",
      `A pictogram uses a star for students. ${symbols} stars represent ${each * symbols} students. How many students per star?`,
      `${each}`, [`${each + 1}`, `${each - 1 || each + 2}`, `${each * symbols}`],
      diff(i, 5), i);
  }

  function statMeanWording(data) {
    return [
      `Find the mean of: ${data.join(", ")}.`,
      `Calculate the average (mean) of these numbers: ${data.join(", ")}.`,
      `What is the mean of ${data.join(", ")}?`,
      `The numbers ${data.join(", ")} have what mean?`,
      `Work out the mean of the data set: ${data.join(", ")}.`
    ];
  }

  function statCorrelation(i) {
    const kinds = [
      { q: "A positive correlation on a scatter graph means:", a: "As x increases, y increases", d: ["As x increases, y decreases", "No relationship", "All points are zero"] },
      { q: "A negative correlation on a scatter graph means:", a: "As x increases, y decreases", d: ["As x increases, y increases", "No relationship", "All points are zero"] },
      { q: "If points on a scatter graph are scattered randomly, the correlation is:", a: "None", d: ["Positive", "Negative", "Perfect"] },
      { q: "A scatter graph with all points on a single rising line shows what correlation?", a: "Perfect positive", d: ["Perfect negative", "None", "Weak positive"] },
      { q: "A scatter graph with all points on a single falling line shows what correlation?", a: "Perfect negative", d: ["Perfect positive", "None", "Weak negative"] },
      { q: "Which would you expect to show a positive correlation?", a: "Height and shoe size", d: ["Outdoor temperature and heater use", "Car age and resale value", "Speed and travel time"] },
      { q: "Which would you expect to show a negative correlation?", a: "Car age and resale value", d: ["Height and shoe size", "Hours studied and test mark", "Number of hours and pay"] },
      { q: "Which would you expect to show no correlation?", a: "Shoe size and exam mark", d: ["Height and shoe size", "Age and weight in children", "Distance and travel time"] }
    ];
    const k = kinds[i % kinds.length];
    return mk("Statistics", k.q, k.a, k.d, diff(i, 5), i);
  }

  /* ═══════════════════ PROBABILITY ═══════════════════ */

  function probBagPick(i) {
    const r = 2 + (i % 6), b = 3 + ((i + 1) % 7);
    if (r === b) return null;               // the other colour would be the answer
    const total = r + b;
    const askRed = i % 2 === 0;
    const numerator = askRed ? r : b;
    return mk("Probability",
      `A bag has ${r} red and ${b} blue balls. What is the probability of picking ${askRed ? "red" : "blue"}?`,
      simp(numerator, total),
      [simp(askRed ? b : r, total),          // the other colour
       simp(numerator + 1, total),           // miscounted by one
       simp(numerator, total - 1)],          // forgot to count its own colour
      diff(i, 4), i);
  }

  function probDie(i) {
    const targets = [
      { q: "rolling a 4", a: "1/6", d: ["1/3", "1/2", "1/4"] },
      { q: "rolling a 2", a: "1/6", d: ["1/3", "1/2", "1/5"] },
      { q: "rolling a 5", a: "1/6", d: ["5/6", "1/2", "1/5"] },
      { q: "rolling an even number", a: "1/2", d: ["1/3", "1/6", "2/3"] },
      { q: "rolling an odd number", a: "1/2", d: ["1/3", "2/3", "1/6"] },
      { q: "rolling a number greater than 4", a: "1/3", d: ["1/2", "2/3", "1/6"] },
      { q: "rolling a number less than 3", a: "1/3", d: ["1/2", "1/6", "2/3"] },
      { q: "rolling a number greater than 2", a: "2/3", d: ["1/3", "1/2", "1/6"] },
      { q: "rolling a number less than 5", a: "2/3", d: ["1/3", "1/2", "5/6"] },
      { q: "rolling a multiple of 3", a: "1/3", d: ["1/2", "1/6", "2/3"] },
      { q: "rolling a multiple of 2", a: "1/2", d: ["1/3", "1/6", "2/3"] },
      { q: "rolling a 1 or a 6", a: "1/3", d: ["1/6", "1/2", "2/3"] },
      { q: "rolling a 1, 2 or 3", a: "1/2", d: ["1/3", "1/6", "2/3"] },
      { q: "rolling a prime number", a: "1/2", d: ["1/3", "1/6", "2/3"] },
      { q: "rolling a square number", a: "1/3", d: ["1/2", "1/6", "2/3"] },
      { q: "rolling a number ≤ 4", a: "2/3", d: ["1/3", "1/2", "5/6"] },
      { q: "not rolling a 6", a: "5/6", d: ["1/6", "1/2", "2/3"] },
      { q: "not rolling a 1", a: "5/6", d: ["1/6", "1/2", "2/3"] }
    ];
    const t = targets[i % targets.length];
    return mk("Probability", `A fair die is rolled. What is the probability of ${t.q}?`,
      t.a, t.d, diff(i, 5), i);
  }

  function probCoin(i) {
    const opts = [
      { q: "tails", a: "1/2", d: ["1/3", "1/4", "1"] },
      { q: "heads", a: "1/2", d: ["1/3", "1/4", "0"] },
      { q: "heads on two flips", a: "1/4", d: ["1/2", "1/3", "1/8"] },
      { q: "tails on two flips", a: "1/4", d: ["1/2", "1/3", "1/8"] },
      { q: "exactly one head in two flips", a: "1/2", d: ["1/4", "1/3", "1/8"] },
      { q: "exactly one tail in two flips", a: "1/2", d: ["1/4", "1/3", "1/8"] },
      { q: "no heads in two flips", a: "1/4", d: ["1/2", "1/3", "0"] },
      { q: "at least one head in two flips", a: "3/4", d: ["1/2", "1/4", "1/3"] },
      { q: "at least one tail in two flips", a: "3/4", d: ["1/2", "1/4", "1/3"] },
      { q: "three heads in three flips", a: "1/8", d: ["1/4", "1/2", "3/8"] },
      { q: "exactly two heads in three flips", a: "3/8", d: ["1/4", "1/2", "1/8"] },
      { q: "no heads in three flips", a: "1/8", d: ["1/4", "1/2", "3/8"] },
      { q: "at least two heads in three flips", a: "1/2", d: ["3/8", "1/4", "1/8"] }
    ];
    const o = opts[i % opts.length];
    return mk("Probability", `A fair coin is flipped. What is the probability of ${o.q}?`,
      o.a, o.d, diff(i, 5), i);
  }

  function probComplement(i) {
    const granularity = [10, 20, 100][i % 3];
    const num = 1 + (i % (granularity - 1));
    const p = +(num / granularity).toFixed(3);
    const ans = +(1 - p).toFixed(3);
    const wording = pickWording(i, [
      `The probability of an event is ${fmt(p)}. What is the probability it does NOT happen?`,
      `P(A) = ${fmt(p)}. What is P(not A)?`,
      `If the probability of rain is ${fmt(p)}, what is the probability of no rain?`,
      `An event has probability ${fmt(p)}. Find the probability it fails to occur.`,
      `Given P(success) = ${fmt(p)}, what is P(failure)?`,
      `If P(event) = ${fmt(p)}, the probability of the event not happening is:`
    ]);
    /* Offsetting the answer must not walk outside 0..1: with p = 0.05 the old
       "ans + 0.1" distractor was 1.05, which is not a probability. */
    const near = [];
    [0.1, -0.1, 0.05, -0.05, 0.2, -0.2].forEach(d => {
      const v = +(ans + d).toFixed(3);
      if (v > 0 && v < 1 && v !== ans && v !== p && !near.includes(`${fmt(v)}`)) near.push(`${fmt(v)}`);
    });
    if (near.length < 2) return null;
    return mk("Probability", wording,
      `${fmt(ans)}`, [`${fmt(p)}`, near[0], near[1]],
      diff(i, 5), i);
  }

  function probExpected(i) {
    const trials = 20 + 20 * (i % 25);
    const ps = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.6, 0.7, 0.75, 0.8];
    const p = ps[i % ps.length];
    const ans = +(trials * p).toFixed(2);
    return mk("Probability",
      `In ${trials} trials, P(A) = ${fmt(p)}. How many times would A be expected to occur?`,
      `${fmt(ans)}`, [`${fmt(ans + 10)}`, `${fmt(Math.max(ans - 10, 0))}`, `${fmt(trials - ans)}`],
      diff(i, 4), i);
  }

  function probIndependent(i) {
    const aPool = [0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
    const bPool = [0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
    const a = aPool[axis(i, 0, 9)];
    const b = bPool[axis(i, 1, 9)];
    const ans = +(a * b).toFixed(3);
    return mk("Probability",
      `P(A) = ${fmt(a)}, P(B) = ${fmt(b)}. If independent, find P(A and B).`,
      `${fmt(ans)}`,
      [a + b <= 1 ? `${fmt(a + b)}` : `${fmt(+Math.abs(a - b).toFixed(3))}`,
       `${fmt(+(ans + 0.05).toFixed(3))}`, `${fmt(Math.max(a, b))}`],
      diff(i, 3), i);
  }

  /* ═══════════════════ LOGIC ═══════════════════ */

  function logConsecutiveIntSum(i) {
    const small = 30 + (i % 60);
    return mk("Logic",
      `Find two consecutive integers whose sum is ${small + (small + 1)}.`,
      `${small} and ${small + 1}`,
      [`${small - 1} and ${small + 2}`, `${small - 2} and ${small + 3}`, `${small + 1} and ${small + 2}`],
      diff(i), i);
  }

  function logConsecutiveEvenSum(i) {
    const m = 2 * (15 + (i % 40));
    return mk("Logic",
      `Find three consecutive even integers whose sum is ${3 * m}.`,
      `${m - 2}, ${m} and ${m + 2}`,
      [`${m - 4}, ${m - 2} and ${m}`, `${m}, ${m + 2} and ${m + 4}`, `${m - 3}, ${m} and ${m + 3}`],
      diff(i), i);
  }

  function logConsecutiveOddPuzzle(i) {
    const a = 2 * (3 + (i % 50)) + 1;
    const target = a + 3 * (a + 2);
    return mk("Logic",
      `Find two consecutive odd integers such that the smaller plus three times the larger equals ${target}.`,
      `${a} and ${a + 2}`,
      [`${a - 2} and ${a}`, `${a + 2} and ${a + 4}`, `${a - 1} and ${a + 1}`],
      diff(i, 3), i);
  }

  function logPalindromeYesNoWordings(p) {
    return [
      `Is ${p} a palindromic number?`,
      `Does ${p} read the same forwards and backwards?`,
      `Is ${p} a palindrome?`,
      `Would ${p} look the same if its digits were reversed?`,
      `Is ${p} the same when read in reverse?`,
      `Is the number ${p} palindromic?`
    ];
  }
  function logPalindromeYesNo(i) {
    const pals = [
      11, 22, 33, 44, 55, 66, 77, 88, 99, 101, 111, 121, 131, 141, 151, 161, 171, 181,
      191, 202, 212, 222, 232, 242, 252, 262, 272, 282, 292, 303, 313, 323, 343, 353,
      363, 373, 383, 393, 404, 414, 424, 434, 454, 464, 474, 484, 494, 505, 515, 525,
      535, 545, 555, 565, 575, 585, 595, 606, 616, 626, 1001, 1111, 1221, 1331, 1441, 1551
    ];
    const nonPals = [
      12, 13, 24, 36, 47, 58, 69, 102, 120, 132, 145, 158, 167, 198, 246, 257, 348,
      357, 468, 479, 481, 562, 673, 784, 895, 916, 1023, 1234, 1357, 2468, 3579
    ];
    const isPalin = i % 2 === 0;
    const n = isPalin ? pals[i % pals.length] : nonPals[i % nonPals.length];
    const wording = pickWording(i, logPalindromeYesNoWordings(n));
    return mk("Logic", wording,
      isPalin ? "Yes" : "No",
      [isPalin ? "No" : "Yes", "Only with even digits", "Sometimes"],
      diff(i, 5), i);
  }

  function logNextPalindrome(i) {
    const base = 1000 + 123 * (i % 30) + 7 * i;
    const ans = nextPalindrome(base);
    return mk("Logic", `What is the first palindrome greater than ${base}?`,
      `${ans}`, [`${ans + 10}`, `${ans - 10}`, `${ans + 100}`],
      diff(i, 3), i);
  }

  function logSquarePalindromesInRange(i) {
    const sqPals = [1, 4, 9, 121, 484, 676, 10201, 12321, 14641, 40804, 44944, 69696, 94249,
                    698896, 1002001, 1234321, 4008004, 5221225, 6948496];
    // Multiple distinct ranges with different hit sets
    const ranges = [
      { lo: 1, hi: 100 },     { lo: 100, hi: 1000 },   { lo: 1000, hi: 20000 },
      { lo: 20000, hi: 100000 }, { lo: 100000, hi: 1000000 }, { lo: 1, hi: 1000 },
      { lo: 1, hi: 10000 },   { lo: 100, hi: 100000 }, { lo: 10000, hi: 1000000 },
      { lo: 1, hi: 500 },     { lo: 1, hi: 700 },      { lo: 400, hi: 100000 }
    ].map(r => ({ ...r, hits: sqPals.filter(x => x >= r.lo && x < r.hi) }))
     .filter(r => r.hits.length);
    const r = ranges[i % ranges.length];
    return mk("Logic",
      `Which square numbers between ${r.lo.toLocaleString()} and ${r.hi.toLocaleString()} are also palindromes?`,
      r.hits.join(", "),
      [r.hits.slice(0, -1).concat([r.hits[r.hits.length - 1] + 1]).join(", "),
       r.hits.slice(1).concat([r.hits[0] + 23]).join(", "),
       `${r.hits[0]}, ${r.hits[0] + 100} and ${r.hits[0] + 200}`],
      diff(i, 3), i);
  }

  function logDayOfWeek(i) {
    const startDay = i % 7, offset = 10 + (i % 50);
    const endDay = (startDay + offset) % 7;
    return mk("Logic",
      `If today is ${dayNames[startDay]}, what day is it in ${offset} days?`,
      dayNames[endDay],
      [dayNames[(endDay + 1) % 7], dayNames[(endDay + 6) % 7], dayNames[(endDay + 3) % 7]],
      diff(i, 4), i);
  }

  function logDayWeeksAgo(i) {
    const given = i % 7, weeks = 1 + (i % 4), extra = i % 7;
    const ansIdx = ((given - (weeks * 7 + extra)) % 7 + 7) % 7;
    return mk("Logic",
      `If the ${10 + (i % 18)}th of a month is a ${wrapDay(given)}, what day was it ${weeks} week${weeks === 1 ? "" : "s"} and ${extra} day${extra === 1 ? "" : "s"} earlier?`,
      wrapDay(ansIdx),
      [wrapDay(ansIdx + 1), wrapDay(ansIdx - 1), wrapDay(ansIdx + 3)],
      diff(i, 3), i);
  }

  function logDayShiftAcrossYear(i) {
    const year = 1980 + (i % 40), given = i % 7;
    const shift = isLeap(year) ? 2 : 1;
    const ansIdx = (given + shift) % 7;
    /* Keep the "forgot to shift at all" day as a distractor, but only when it
       is not already the answer or one of the neighbours — in a common year
       the shift is 1, so the starting day IS the day before the answer. */
    const wrong = [];
    [given, (ansIdx + 1) % 7, (ansIdx + 6) % 7, (ansIdx + 2) % 7, (ansIdx + 3) % 7]
      .forEach(idx => {
        const day = wrapDay(idx);
        if (idx !== ansIdx && !wrong.includes(day)) wrong.push(day);
      });
    return mk("Logic",
      `A date in ${year} fell on a ${wrapDay(given)}. On which day will the same date fall in ${year + 1}?`,
      wrapDay(ansIdx), wrong.slice(0, 3), diff(i, 3), i);
  }

  function logLeapYearPick(i) {
    const leap = [1600, 2000, 1996, 2004, 2024, 2400, 2008, 2016, 2020];
    const nonLeap = [1700, 1800, 1900, 2100, 2200, 1999, 2001, 2023, 2025];
    const ans = leap[i % leap.length];
    const distractors = [
      nonLeap[i % nonLeap.length],
      nonLeap[(i + 3) % nonLeap.length],
      nonLeap[(i + 7) % nonLeap.length]
    ].filter(y => !isLeap(y));
    const wording = pickWording(i, [
      `Which of these years is a leap year?`,
      `Identify the leap year from these options.`,
      `Which year below is a leap year?`,
      `Pick the leap year.`,
      `Select the leap year from the list.`,
      `Which of the following years is a leap year?`
    ]);
    return mk("Logic", wording, `${ans}`, distractors.map(y => `${y}`), diff(i, 3), i);
  }

  function logLeapBirthday(i) {
    /* Counting the celebrations, rather than naming the nth one, removes the
       ambiguity: does the day you are born count as a birthday? The old wording
       assumed it did, and so answered four years later than the ordinary
       reading of the words.

       Only leap years after the birth year count, and a century year is not one
       unless it divides by 400 - so the window is kept inside 1904-2096, where
       every fourth year really is a leap year. */
    const birth = 1904 + 4 * (i % 20);
    const until = birth + 4 * (2 + (i % 12));
    if (until > 2096) return null;
    const times = (until - birth) / 4;
    return mk("Logic",
      `A person was born on 29 February ${birth}, so they can only celebrate a birthday ` +
      `on 29 February. How many birthdays had they celebrated by the end of ${until}?`,
      `${times}`,
      [`${times + 1}`,                     // counted the birth year as well
       `${times - 1}`,
       `${until - birth}`,                 // counted every year, not every fourth
       `${Math.round((until - birth) / 2)}`],
      diff(i, 3), i);
  }

  function logClockAngleAtHour(i) {
    // Add quarter-hour minute positions so 12 hours × 4 minute settings = 48 distinct
    const hour = 1 + (i % 12);
    const minutePool = [0, 15, 30, 45];
    const minute = minutePool[Math.floor(i / 12) % minutePool.length];
    const hourDeg = ((hour % 12) * 30) + (minute * 0.5);
    const minuteDeg = minute * 6;
    let raw = Math.abs(hourDeg - minuteDeg);
    const ans = +Math.min(raw, 360 - raw).toFixed(1);
    const timeStr = `${hour}:${minute === 0 ? "00" : minute}`;
    return mk("Logic",
      `What is the smaller angle between the hour and minute hands of a clock at ${timeStr}?`,
      `${fmt(ans)}°`,
      [`${fmt((ans + 30) % 360)}°`, `${fmt((ans + 60) % 360)}°`, `${fmt((360 - ans) % 360 || 180)}°`],
      diff(i, 3), i);
  }

  function logClockMirror(i) {
    const askActual = i % 2 === 0;
    const h = 1 + (i % 11), m = 5 * (i % 12);
    const flipped = mirrorClock(h, m);
    if (askActual) {
      return mk("Logic",
        `When viewed in a mirror, a clock appears to show ${fmtTime(h, m)}. What is the actual time?`,
        fmtTime(flipped.hour, flipped.minute),
        [fmtTime(h, m), fmtTime((flipped.hour % 12) + 1, flipped.minute), fmtTime(flipped.hour, (flipped.minute + 5) % 60)],
        diff(i, 3), i);
    } else {
      return mk("Logic",
        `A clock shows ${fmtTime(h, m)}. What time appears in its mirror image?`,
        fmtTime(flipped.hour, flipped.minute),
        [fmtTime(h, m), fmtTime((flipped.hour % 12) + 1, flipped.minute), fmtTime(flipped.hour, (flipped.minute + 15) % 60)],
        diff(i, 3), i);
    }
  }

  function logSumAndDiff(i) {
    const a = 10 + 5 * (i % 8), b = 2 + 3 * (i % 7);
    const big = a + b, small = a - b;
    if (small <= 0) return logSumAndDiff(i + 1);
    return mk("Logic",
      `The sum of two numbers is ${big + small} and their difference is ${big - small}. What are the two numbers?`,
      `${small} and ${big}`,
      [`${big} and ${big + 1}`, `${small - 1} and ${big + 1}`, `${big + small} and 0`],
      diff(i, 3), i);
  }

  function logArithmagonProduct(i) {
    const a = 2 + (i % 5), b = 3 + (i % 4), c = 4 + (i % 6);
    return mk("Logic",
      `In a multiplication arithmagon, the side products are ab = ${a * b}, bc = ${b * c}, ac = ${a * c}. What is a?`,
      `${a}`, [`${b}`, `${c}`, `${a + 1}`],
      diff(i, 2), i);
  }

  function logAdditionPyramid(i) {
    const w = 5 + (i % 30), x = 5 + ((i * 2) % 25), y = 5 + ((i * 3) % 28);
    const top = w + 2 * x + y;
    return mk("Logic",
      `In an addition pyramid, each block equals the sum of the two below. Bottom row is ${w}, ${x}, ${y}. What is the top block?`,
      `${top}`, [`${w + x + y}`, `${w + 2 * y + x}`, `${top + 10}`],
      diff(i, 3), i);
  }

  function logLetterPuzzle(i) {
    const extra = 4 + (i % 9), base = 18 + (i % 12);
    return mk("Logic",
      `If C + A + T + S = ${base} and C + A + T + S + S = ${base + extra}, what is C + A + T?`,
      `${base - extra}`,
      /* base - extra + extra is just base, so two distractors were equal. */
      [`${base}`, `${extra}`, `${base + extra}`],
      diff(i, 3), i);
  }

  function logMagicSquareRow(i) {
    const target = 60 + 5 * (i % 12);
    const a = 5 + (i % 20), b = 5 + ((i * 3) % 25);
    const blank = target - a - b;
    if (blank <= 0 || blank === a || blank === b) return logMagicSquareRow(i + 1);
    return mk("Logic",
      `In a 3×3 magic square each row sums to ${target}. One row contains ${a}, ${b} and a blank. What is the blank?`,
      `${blank}`, [`${target - a}`, `${target - b}`, `${blank + 5}`],
      diff(i, 3), i);
  }

  function logDigitSumOfSum(i) {
    const a = 100 + 137 * (i % 9), b = 23 + 41 * (i % 7);
    const total = a + b;
    const ds = `${total}`.split("").reduce((s, d) => s + Number(d), 0);
    return mk("Logic",
      `What is the digit sum of ${comma(a)} + ${comma(b)}?`,
      `${ds}`, [`${ds + 1}`, `${ds - 1}`, `${ds + 9}`],
      diff(i, 4), i);
  }

  /* ═══════════════════ FROM THE SCANNED PAPERS ═══════════════════
     Question shapes taken from the QE / Examberry / Exam Papers Plus papers
     and screenshots in question-bank/ that the templates above did not
     already cover. */

  /* Fraction of a fraction — "3/7 of the toys are unicorns, 2/9 of those are
     faulty". Distinct from fracMultiply, which asks for the bare product. */
  function fracOfFrac(i) {
    const a = 1 + (i % 5), b = 3 + ((i * 3) % 7);
    const c = 1 + ((i * 2) % 4), d = 3 + ((i * 5) % 8);
    if (a >= b || c >= d) return null;
    const items = ["pink unicorns", "wooden trains", "toy robots", "blue kites", "rubber ducks"];
    const item = items[i % items.length];
    return mk("Fractions",
      `Of all the toys produced in a factory, ${simp(a, b)} of them are ${item}. ${simp(c, d)} of the ${item} are faulty. What fraction of all the toys are faulty ${item}?`,
      simp(a * c, b * d),
      [simp(a + c, b + d), simp(a * c, b + d), simp(a * d, b * c)],
      diff(i, 3), i);
  }

  /* Sale discount followed by change from a note. */
  function pctSaleChange(i) {
    const discount = [10, 20, 25, 50][i % 4];
    const priceA = 500 + 20 * (i % 35);   // pence, kept a multiple of 20 so
    const priceB = 620 + 20 * ((i * 3) % 30); // every discount stays whole pence
    const note = 2000;
    const total = (priceA + priceB) * (100 - discount) / 100;
    if (total >= note) return null;
    const ans = (note - total) / 100;
    return mk("Percentages",
      `A shop has a ${discount}% off sale. Lisa buys a kettle normally priced at ${fmtMoney(priceA / 100)} and a CD normally priced at ${fmtMoney(priceB / 100)}. How much change should she receive from a £${note / 100} note?`,
      `£${ans.toFixed(2)}`,
      [`£${((note - priceA - priceB) / 100).toFixed(2)}`, `£${(total / 100).toFixed(2)}`, `£${(ans + discount / 100).toFixed(2)}`],
      diff(i, 3), i);
  }

  /* Rotation of a point about a centre. Anticlockwise 90° about (cx, cy):
     (x, y) → (cx − (y − cy), cy + (x − cx)). */
  function geoRotationCoords(i) {
    const cx = i % 4, cy = 1 + (i % 3);
    const px = cx + 1 + (i % 5), py = cy + 2 + (i % 4);
    const anticlockwise = i % 2 === 0;
    const dx = px - cx, dy = py - cy;
    const ans = anticlockwise ? [cx - dy, cy + dx] : [cx + dy, cy - dx];
    const wrongWay = anticlockwise ? [cx + dy, cy - dx] : [cx - dy, cy + dx];
    const pt = ([x, y]) => `(${x}, ${y})`;
    const q = mk("Geometry",
      `A shape is rotated 90° ${anticlockwise ? "anticlockwise" : "clockwise"} about the point ${pt([cx, cy])}. One corner of the shape is at ${pt([px, py])}. What are its new coordinates?`,
      pt(ans), [pt(wrongWay), pt([-px, -py]), pt([py, px])],
      diff(i, 3), i);
    if (!q) return null;

    /* Give the child the formula and then substitute into it. "Swap and flip"
       on its own is useless: the whole difficulty is knowing WHICH of the two
       numbers changes sign, and that is the only thing telling the two
       directions apart. */
    const sign = n => (n < 0 ? `${n}` : `+ ${n}`);
    const swapped = anticlockwise ? [-dy, dx] : [dy, -dx];
    q.explain =
      `A quarter turn ${anticlockwise ? "anticlockwise" : "clockwise"} about the centre (h, k) sends (x, y) to ` +
      (anticlockwise ? `(−(y − k) + h,  (x − h) + k).` : `((y − k) + h,  −(x − h) + k).`) + "\n" +
      `Step 1 — how far the point is from the centre: across = ${px} − ${cx} = ${dx}, up = ${py} − ${cy} = ${dy}.\n` +
      `Step 2 — swap those two, then change the sign of the ${anticlockwise ? "first" : "second"} one: ` +
      `(${dx}, ${dy}) becomes (${swapped[0]}, ${swapped[1]}).\n` +
      `Step 3 — add the centre back on: (${swapped[0]} ${sign(cx)}, ${swapped[1]} ${sign(cy)}) = ${pt(ans)}.`;

    /* The centre and the corner drawn on a grid, so the child can see what is
       being turned around what. */
    if (D && cx <= 8 && cy <= 8 && px <= 8 && py <= 8) {
      const figure = D.coordGrid({ points: [[cx, cy, "centre"], [px, py, "corner"]] });
      q.questionImage = figure.image;
      q.questionImageAlt = `A coordinate grid with the centre of rotation marked at ${pt([cx, cy])} ` +
                           `and the corner of the shape at ${pt([px, py])}.`;
    }
    return q;
  }

  /* Two identical rectangles laid one over the other, overlap given. */
  function meaOverlapArea(i) {
    const w = 6 + (i % 10), h = 10 + ((i * 3) % 12);
    const one = w * h;
    const overlap = 12 + 6 * (i % 8);
    if (overlap >= one) return null;
    const ans = 2 * one - overlap;
    return mk("Measurement",
      `Two identical rectangles measuring ${w} cm by ${h} cm are placed one on top of the other so that they overlap. The overlapping region has an area of ${overlap} cm². What is the area of the combined shape?`,
      `${ans} cm²`,
      [`${2 * one} cm²`, `${one} cm²`, `${one - overlap} cm²`],
      diff(i, 3), i);
  }

  /* Pie chart: scale a known sector up to another sector. */
  function statPieFromAngle(i) {
    const knownAngle = [30, 36, 40, 45, 60, 72, 90, 120][i % 8];
    const per = 2 + (i % 6);                     // people per degree
    const knownCount = knownAngle * per;
    const askAngle = [60, 90, 120, 150, 180][i % 5];
    if (askAngle === knownAngle) return null;
    const ans = askAngle * per;
    return mk("Statistics",
      `In a pie chart showing how a group of students voted, a sector of ${knownAngle}° represents ${knownCount} students. How many students does a sector of ${askAngle}° represent?`,
      comma(ans),
      [comma(knownCount), comma(ans + per * 10), comma(Math.round(ans / 2))],
      diff(i, 3), i);
  }

  /* Bar chart total: Σ (value × frequency). */
  function statFreqTotal(i) {
    const freqs = [8 + (i % 5), 14 + ((i * 3) % 6), 9 + ((i * 5) % 5), 2 + (i % 4)];
    const total = freqs.reduce((acc, f, value) => acc + value * f, 0);
    const students = sum(freqs);
    return mk("Statistics",
      `A class was asked to bring in school vouchers. ${freqs[0]} students brought 0 vouchers, ${freqs[1]} brought 1, ${freqs[2]} brought 2 and ${freqs[3]} brought 3. How many vouchers did the class bring in altogether?`,
      `${total}`,
      [`${students}`, `${total - freqs[3]}`, `${total + freqs[1]}`],
      diff(i, 3), i);
  }

  /* "Which of these is NOT true of a …" – shape property recall. */
  const SHAPE_FACTS = [
    { shape: "rhombus",
      truths: ["It has two pairs of parallel sides", "It has two pairs of equal angles", "It has exactly two lines of symmetry", "It has rotational symmetry of order 2"],
      falsehood: "It has exactly two sides of equal length" },
    { shape: "square",
      truths: ["It has four lines of symmetry", "Its diagonals cross at right angles", "It has rotational symmetry of order 4", "All four of its angles are 90°"],
      falsehood: "It has exactly two lines of symmetry" },
    { shape: "parallelogram",
      truths: ["Opposite sides are equal in length", "Opposite angles are equal", "It has rotational symmetry of order 2", "Its angles add up to 360°"],
      falsehood: "It has two lines of symmetry" },
    { shape: "kite",
      truths: ["It has exactly one line of symmetry", "It has two pairs of adjacent equal sides", "One pair of opposite angles is equal", "Its diagonals cross at right angles"],
      falsehood: "It has two pairs of parallel sides" },
    { shape: "regular hexagon",
      truths: ["It has six lines of symmetry", "It has rotational symmetry of order 6", "Each interior angle is 120°", "Its interior angles add up to 720°"],
      falsehood: "Its interior angles add up to 540°" },
    { shape: "isosceles trapezium",
      truths: ["It has exactly one pair of parallel sides", "It has one line of symmetry", "It has two pairs of equal angles", "Its angles add up to 360°"],
      falsehood: "It has rotational symmetry of order 2" }
  ];

  function geoShapeProperty(i) {
    const fact = SHAPE_FACTS[i % SHAPE_FACTS.length];
    const start = i % fact.truths.length;
    const truths = [0, 1, 2].map(k => fact.truths[(start + k) % fact.truths.length]);
    const article = /^[aeiou]/i.test(fact.shape) ? "an" : "a";
    return mk("Geometry",
      `Which of the following is NOT true of ${article} ${fact.shape}?`,
      fact.falsehood, truths, diff(i, 3), i);
  }

  /* Overlapping-sets percentage: neither = 100 − (A + B − both). */
  function pctVennNeither(i) {
    const total = 200 + 50 * (i % 5);
    const both = 12 + 2 * (i % 9);
    const onlyPlusBothA = both + 10 + 2 * (i % 8);
    const onlyPlusBothB = both + 6 + 2 * ((i * 3) % 7);
    const union = onlyPlusBothA + onlyPlusBothB - both;
    if (union >= 100) return null;
    const neitherPct = 100 - union;
    const ans = total * neitherPct / 100;
    if (!Number.isInteger(ans)) return null;
    return mk("Percentages",
      `Out of ${total} students in a school, ${both}% of them play both rugby and cricket. ${onlyPlusBothA}% of students play rugby and ${onlyPlusBothB}% of students play cricket. How many students play neither rugby nor cricket?`,
      comma(ans),
      [comma(total * union / 100), comma(total * both / 100), comma(total * (100 - onlyPlusBothA - onlyPlusBothB) / 100)],
      diff(i, 2), i);
  }

  /* Matchstick-style growing pattern — the nth term as an expression. */
  function seqMatchstickNth(i) {
    const d = 2 + (i % 4);
    const first = d + 1 + (i % 3);
    const c = first - d;
    const term = n => `${d}${n}${c === 0 ? "" : (c > 0 ? ` + ${c}` : ` - ${-c}`)}`;
    return mk("Sequences",
      `A pattern is made from matchsticks. Pattern 1 uses ${first} matches, pattern 2 uses ${first + d} matches and pattern 3 uses ${first + 2 * d} matches. Assuming the pattern continues in the same way, how many matches are in pattern n?`,
      term("n"),
      [`${d}n - ${Math.abs(c) || 1}`, `${first}n`, `${d + 1}n + ${c}`],
      diff(i, 3), i);
  }

  /* Mean of the factors of a number, answered as a mixed number where needed. */
  function statMeanOfFactors(i) {
    const candidates = [12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 50, 54, 56, 60, 66, 70, 72];
    const n = candidates[i % candidates.length];
    const factors = factorsOf(n);
    const totalOfFactors = sum(factors);
    const mixed = value => {
      const whole = Math.floor(value);
      const frac = value - whole;
      if (frac === 0) return `${whole}`;
      const denom = factors.length / gcd(totalOfFactors % factors.length, factors.length);
      const numer = Math.round(frac * denom);
      return `${whole} ${numer}/${denom}`;
    };
    const ans = totalOfFactors / factors.length;
    return mk("Statistics",
      `What is the mean of the factors of ${n}?`,
      mixed(ans),
      [mixed(ans + 1), `${factors.length}`, `${totalOfFactors}`],
      diff(i, 2), i);
  }

  /* Two picks without replacement. */
  function probWithoutReplacement(i) {
    const odds = 2 + (i % 5);
    const evens = 2 + ((i * 3 + 1) % 6);
    const total = odds + evens;
    const probability = (odds / total) * (evens / (total - 1));
    // The papers only ever set these up so the answer lands on a tidy decimal;
    // skip the seeds that would give a recurring one.
    if (Math.abs(probability * 100 - Math.round(probability * 100)) > 1e-9) return null;
    // Start from an odd number so the two runs stay genuinely odd and even.
    const base = 1 + 2 * (i % 3);
    const oddNumbers = Array.from({ length: odds }, (_, k) => base + 2 * k);
    const evenNumbers = Array.from({ length: evens }, (_, k) => base + 1 + 2 * k);
    const sorted = [...oddNumbers, ...evenNumbers].sort((a, b) => a - b);
    return mk("Probability",
      `There are ${total} numbers in a pot: ${sorted.join(", ")}. Summer picks one and then, without replacing it, picks another. What is the chance of her picking an odd number and then an even number?`,
      fmt(Number(probability.toFixed(4))),
      [fmt(Number(((odds / total) * (evens / total)).toFixed(4))),
       fmt(Number(((odds / total) * ((evens - 1) / (total - 1))).toFixed(4))),
       fmt(Number((odds / total).toFixed(4)))],
      diff(i, 2), i);
  }

  /* Compare several expressions and pick the largest / smallest. */
  function numCompareExpressions(i) {
    const specs = [
      { label: `1/6 of ${42 + 6 * (i % 4)}`, value: (42 + 6 * (i % 4)) / 6 },
      { label: `${20 + 5 * (i % 3)}% of ${32 + 8 * (i % 3)}`, value: (20 + 5 * (i % 3)) * (32 + 8 * (i % 3)) / 100 },
      { label: `${(1.3 + 0.2 * (i % 4)).toFixed(1)} × ${(5.3 + 0.4 * (i % 3)).toFixed(1)}`, value: (1.3 + 0.2 * (i % 4)) * (5.3 + 0.4 * (i % 3)) },
      { label: `${60 + 7 * (i % 4)} ÷ 7`, value: (60 + 7 * (i % 4)) / 7 },
      { label: `the square root of ${[36, 49, 64, 81][i % 4]}`, value: Math.sqrt([36, 49, 64, 81][i % 4]) }
    ];
    const chosen = [0, 1, 2, 3, 4].map(k => specs[(i + k) % specs.length]).slice(0, 4);
    const values = chosen.map(s => Number(s.value.toFixed(6)));
    if (new Set(values).size !== 4) return null;
    const wantLargest = i % 2 === 0;
    const best = chosen.reduce((acc, s) => (wantLargest ? s.value > acc.value : s.value < acc.value) ? s : acc, chosen[0]);
    return mk("Numbers",
      `Which of these expressions has the ${wantLargest ? "greatest" : "smallest"} value?`,
      best.label, chosen.filter(s => s !== best).map(s => s.label),
      diff(i, 3), i);
  }

  /* Three pairwise prices — adding all three gives 3(c + p + o). */
  function algThreeItemPricing(i) {
    const carrot = 20 + 3 * (i % 9);
    const potato = 26 + 4 * ((i * 3) % 7);
    const onion = 30 + 5 * ((i * 5) % 6);
    const p1 = 2 * carrot + potato;
    const p2 = 2 * potato + onion;
    const p3 = 2 * onion + carrot;
    const ans = carrot + potato + onion;
    const asMoney = pence => pence < 100 ? `${pence}p` : `£${(pence / 100).toFixed(2)}`;
    return mk("Algebra",
      `${asMoney(p1)} buys 2 carrots and 1 potato. ${asMoney(p2)} buys 2 potatoes and 1 onion. ${asMoney(p3)} buys 2 onions and 1 carrot. How much does it cost to buy 1 carrot, 1 potato and 1 onion?`,
      asMoney(ans),
      [asMoney(ans + 3), asMoney(ans - 3), asMoney(Math.round((p1 + p2 + p3) / 2))],
      diff(i, 3), i);
  }

  /* Distance–time comparison: how far apart after a further stretch of time. */
  function spdGapBetweenTwo(i) {
    const startA = 60 + 5 * (i % 8);
    const startB = 20 + 5 * (i % 6);
    const speedA = 8 + (i % 5);
    const speedB = speedA + 2 + (i % 6);
    const hours = 2 + (i % 4);
    const posA = startA + speedA * hours;
    const posB = startB + speedB * hours;
    const ans = Math.abs(posA - posB);
    if (ans === 0) return null;
    return mk("Speed",
      `Two cyclists ride the same route out of a city. At 12:00 the first is ${startA} miles from the city travelling at ${speedA} mph, and the second is ${startB} miles from the city travelling at ${speedB} mph. If both keep to the same speed, how far apart will they be ${hours} hours later?`,
      `${ans} miles`,
      [`${Math.abs(startA - startB)} miles`, `${ans + hours} miles`, `${posA + posB} miles`],
      diff(i, 3), i);
  }

  /* Splitting a regular polygon with a single straight cut. */
  const SHAPE_SPLITS = [
    { shape: "regular pentagon", known: "an isosceles triangle", other: "an isosceles trapezium",
      wrong: ["a rectangle", "a parallelogram", "an irregular pentagon"] },
    { shape: "regular hexagon", known: "an isosceles trapezium", other: "an isosceles trapezium",
      wrong: ["a square", "a right-angled triangle", "a regular pentagon"] },
    { shape: "square", known: "a right-angled triangle", other: "a right-angled triangle",
      wrong: ["a rhombus", "a regular pentagon", "an isosceles trapezium"] },
    { shape: "rectangle", known: "a right-angled triangle", other: "a right-angled triangle",
      wrong: ["a kite", "an equilateral triangle", "a regular hexagon"] },
    { shape: "regular octagon", known: "an isosceles trapezium", other: "an irregular hexagon",
      wrong: ["a circle", "an equilateral triangle", "a square"] }
  ];

  function geoShapeSplit(i) {
    const item = SHAPE_SPLITS[i % SHAPE_SPLITS.length];
    return mk("Geometry",
      `A ${item.shape} is divided into two by a single straight cut. One of the shapes formed is ${item.known}. What is the other shape?`,
      item.other, item.wrong, diff(i, 3), i);
  }

  /* ═══════════════════ SUPER HARD ═══════════════════
     Level-4 templates. Every topic needs its own: without these, the quiz
     selector has nothing to reach for when a child is doing well and quietly
     fills the super-hard slots with level-3 questions instead.

     What makes these level 4 rather than 3 is that none of them can be
     answered by carrying out one remembered procedure — each needs a chain of
     steps, a step worked backwards, or a well-known trap avoided. */

  /* ── Fractions ── */

  /* Two successive fractions removed, only the remainder given: the child has
     to work the whole chain backwards. */
  function fracReverseTwoStage(i) {
    const a = 3 + (i % 3);          // first fraction is 1/a
    const b = 3 + ((i * 2) % 3);    // then 1/b of what is left
    const t = 2 + (i % 5);
    const total = a * b * t * 10;
    const left = total * (a - 1) * (b - 1) / (a * b);
    const liquids = ["toad juice", "elderflower cordial", "ginger beer", "barley water"];
    return mk("Fractions",
      `A bottle of ${liquids[i % liquids.length]} is ${simp(1, a)} syrup. ${simp(1, b)} of the rest is water, leaving ${left} ml of juice. How much does the full bottle hold?`,
      `${total} ml`,
      [`${left * a} ml`, `${Math.round(left * b * (a / (a - 1)))} ml`, `${total - left} ml`],
      4, i);
  }

  /* Spend a fraction, then a fraction of the remainder. */
  function fracOfRemainderMoney(i) {
    const a = 3 + (i % 4), b = 2 + ((i * 3) % 4);
    const t = 1 + (i % 6);
    const start = a * b * t * 5;
    const afterFirst = start * (a - 1) / a;
    const spentSecond = afterFirst / b;
    const left = afterFirst - spentSecond;
    if (!Number.isInteger(left) || !Number.isInteger(spentSecond)) return null;
    return mk("Fractions",
      `Priya spends ${simp(1, a)} of her savings on a bike, then ${simp(1, b)} of what is left on a helmet. She has ${fmtMoney(left)} left. How much did she have at the start?`,
      fmtMoney(start),
      [fmtMoney(afterFirst), fmtMoney(left * b), fmtMoney(start - spentSecond)],
      4, i);
  }

  /* Which fraction lies strictly between two others. The mediant always does;
     one option is an endpoint, which "between" excludes. */
  function fracBetweenTwo(i) {
    const q = 3 + (i % 5), s = 2 + ((i * 3) % 4);
    const p = 1 + (i % (q - 1)), r = 1 + ((i * 2) % (s - 1 || 1));
    if (s < 2 || p / q >= r / s) return null;
    const answer = simp(p + r, q + s);
    const below = simp(p, q + 1), above = simp(r, s - 1), edge = simp(p, q);
    const all = [answer, below, above, edge];
    if (new Set(all).size !== 4) return null;
    return mk("Fractions",
      `Which of these fractions lies between ${simp(p, q)} and ${simp(r, s)}?`,
      answer, [below, above, edge], 4, i);
  }

  /* ── BIDMAS ── */

  function bidNestedBrackets(i) {
    const a = 2 + (i % 7), b = 3 + ((i * 3) % 8), c = 2 + (i % 5), d = 2 + (i % 4);
    const inner = (a + b) * c - d * d;
    const e = [2, 3, 4, 5].find(k => inner % k === 0 && inner / k > 0);
    if (!e) return null;
    const f = 3 + (i % 9);
    const ans = inner / e + f;
    return mk("BIDMAS",
      `What is ((${a} + ${b}) × ${c} − ${d}²) ÷ ${e} + ${f}?`,
      `${ans}`,
      [`${(a + b) * c - d * d / e + f}`, `${inner / e * f}`, `${ans - f}`],
      4, i);
  }

  /* Evaluate `a o1 b o2 c` honouring BIDMAS. */
  const evalPair = (a, o1, b, o2, c) => {
    const ap = (x, o, y) => o === "+" ? x + y : o === "−" ? x - y : o === "×" ? x * y : x / y;
    const high = o => o === "×" || o === "÷";
    if (!high(o1) && high(o2)) return ap(a, o1, ap(b, o2, c));
    return ap(ap(a, o1, b), o2, c);
  };

  function bidMissingOperator(i) {
    const a = 12 + 4 * (i % 6), b = 2 + (i % 4), c = 3 + (i % 5);
    const ops = ["+", "−", "×", "÷"];
    const combos = [];
    ops.forEach(o1 => ops.forEach(o2 => combos.push([o1, o2])));
    const scored = combos
      .map(([o1, o2]) => ({ o1, o2, v: evalPair(a, o1, b, o2, c) }))
      .filter(x => Number.isInteger(x.v) && x.v > 0);
    const target = scored[i % scored.length];
    // Only usable when exactly one pair of operations hits the target.
    if (scored.filter(x => x.v === target.v).length !== 1) return null;
    const wrong = scored.filter(x => x.v !== target.v).slice(0, 3);
    if (wrong.length < 3) return null;
    const label = x => `${x.o1} and ${x.o2}`;
    return mk("BIDMAS",
      `Which pair of operations makes this true?\n${a} ? ${b} ? ${c} = ${target.v}`,
      label(target), wrong.map(label), 4, i);
  }

  function bidInsertBrackets(i) {
    const a = 2 + (i % 8), b = 3 + ((i * 3) % 7), c = 2 + (i % 6), d = 1 + (i % 5);
    if (c <= d) return null;
    const placements = [
      { text: `(${a} + ${b}) × ${c} − ${d}`, v: (a + b) * c - d },
      { text: `${a} + ${b} × (${c} − ${d})`, v: a + b * (c - d) },
      { text: `(${a} + ${b}) × (${c} − ${d})`, v: (a + b) * (c - d) },
      { text: `${a} + (${b} × ${c}) − ${d}`, v: a + b * c - d }
    ];
    if (new Set(placements.map(p => p.v)).size !== 4) return null;
    const target = placements[i % 4];
    return mk("BIDMAS",
      `Where must the brackets go to make this calculation equal ${target.v}?\n${a} + ${b} × ${c} − ${d}`,
      target.text, placements.filter(p => p !== target).map(p => p.text), 4, i);
  }

  /* ── Sequences ── */

  /* Second differences are constant, so the gaps themselves grow. */
  function seqQuadraticNext(i) {
    const first = 2 + (i % 6), d1 = 3 + (i % 4), d2 = 2 + (i % 3);
    const terms = [first];
    let step = d1;
    for (let k = 1; k < 6; k++) { terms.push(terms[k - 1] + step); step += d2; }
    const ans = terms[5];
    return mk("Sequences",
      `What is the next term in this sequence?\n${terms.slice(0, 5).join(", ")}, ...`,
      `${ans}`,
      /* The loop leaves step at d1 + 5*d2, so "step - d2" is exactly the gap
         used to reach the answer - the first distractor was the answer, every
         time. Repeating the previous gap is the mistake worth offering. */
      [`${terms[4] + d1 + 3 * d2}`, `${terms[4] + d1}`, `${ans + d2}`, `${ans - d2}`],
      4, i);
  }

  function seqNthFromTwoTerms(i) {
    const a1 = 1 + (i % 9), d = 2 + (i % 7);
    const m = 3 + (i % 3), n = m + 3 + (i % 4);
    const tm = a1 + (m - 1) * d, tn = a1 + (n - 1) * d;
    const c = a1 - d;
    const formula = c === 0 ? `${d}n` : (c > 0 ? `${d}n + ${c}` : `${d}n − ${-c}`);
    return mk("Sequences",
      `In an arithmetic sequence the ${m}th term is ${tm} and the ${n}th term is ${tn}. What is the nth term?`,
      formula,
      [`${d}n + ${a1}`, `${d}n − ${d}`, `${tm}n + ${d}`],
      4, i);
  }

  /* Fibonacci-like, but the given terms start partway in. */
  function seqFibMissingStart(i) {
    const t1 = 1 + (i % 7), t2 = 2 + ((i * 3) % 9);
    const t3 = t1 + t2, t4 = t2 + t3, t5 = t3 + t4, t6 = t4 + t5;
    const q = mk("Sequences",
      `In this sequence each term is the sum of the two terms before it. The 3rd, 4th, 5th and 6th terms are ${t3}, ${t4}, ${t5} and ${t6}. What is the 1st term?`,
      /* t3 - t1 is t2, so two distractors were the same number. t5 - t4 is the
         3rd term, which is the answer a child gets by stopping one step early. */
      `${t1}`, [`${t2}`, `${t5 - t4}`, `${Math.abs(t2 - t1)}`, `${t2 + 1}`],
      4, i);
    if (!q) return null;

    /* Getting back to the 1st term takes TWO subtractions, and saying only
       "subtract one term from the next" stops a child at the 2nd. The hint
       walks both steps with this question's own numbers, and names what
       stopping early gives. */
    q.explain =
      `Each term is the two before it added, so going backwards you subtract — but it takes ` +
      `two steps, not one.
` +
      `Step 1 — the 2nd term: 4th − 3rd = ${t4} − ${t3} = ${t2}.
` +
      `Step 2 — the 1st term: 3rd − 2nd = ${t3} − ${t2} = ${t1}.
` +
      `Stopping after one subtraction gives ${t5 - t4}, which is just the 3rd term ` +
      `printed in the question.`;
    return q;
  }

  /* ── Speed ── */

  /* The classic trap: the average of the two speeds is not the average speed. */
  function spdAverageTwoLegs(i) {
    const pairs = [[60, 40], [30, 20], [12, 4], [80, 20], [24, 8], [90, 45], [50, 30], [36, 12]];
    const [u, v] = pairs[i % pairs.length];
    const harmonic = 2 * u * v / (u + v);
    if (!Number.isInteger(harmonic)) return null;
    const dist = (u + v) * (1 + (i % 4));
    return mk("Speed",
      `A cyclist rides ${dist} km to a village at ${u} km/h and returns along the same road at ${v} km/h. What is her average speed for the whole journey?`,
      `${harmonic} km/h`,
      [`${(u + v) / 2} km/h`, `${u - v} km/h`, `${fmt(harmonic + 2)} km/h`],
      4, i);
  }

  function spdCatchUp(i) {
    const u = 20 + 10 * (i % 5);
    const v = u + 10 + 10 * (i % 3);
    const headStartHours = 1 + (i % 3);
    const gap = u * headStartHours;
    const hours = gap / (v - u);
    if (!Number.isInteger(hours * 60) || hours > 12) return null;
    const mins = Math.round(hours * 60);
    const label = mins % 60 === 0 ? `${mins / 60} hours` : `${Math.floor(mins / 60)} hours ${mins % 60} minutes`;
    return mk("Speed",
      `A lorry sets off at ${u} km/h. ${headStartHours} hour${headStartHours > 1 ? "s" : ""} later a car leaves from the same place along the same road at ${v} km/h. How long after the car sets off does it catch the lorry?`,
      label,
      [`${headStartHours} hours`, `${fmt(gap / v)} hours`, `${fmt(hours + 1)} hours`],
      4, i);
  }

  function spdMeetingPoint(i) {
    const u = 30 + 10 * (i % 5), v = 40 + 10 * ((i * 3) % 4);
    const t = 2 + (i % 4);
    const distance = (u + v) * t;
    const fromA = u * t;
    return mk("Speed",
      `Two towns are ${comma(distance)} km apart. A train leaves the first town at ${u} km/h and, at the same moment, a train leaves the second town towards it at ${v} km/h. How far from the first town do they meet?`,
      `${comma(fromA)} km`,
      [`${comma(distance / 2)} km`, `${comma(v * t)} km`, `${comma(fromA + u)} km`],
      4, i);
  }

  /* ── Measurement ── */

  /* L-shaped prism: cross-sectional area first, then multiply by the length. */
  function meaCompoundVolume(i) {
    const W = 8 + (i % 7), H = 6 + ((i * 3) % 6);
    const w = 2 + (i % 3), h = 2 + ((i * 2) % 3);
    if (w >= W || h >= H) return null;
    const len = 4 + (i % 8);
    const area = W * H - w * h;
    const ans = area * len;
    return mk("Measurement",
      `A prism is ${len} cm long. Its cross-section is an L-shape made by cutting ${article(w)} ${w} cm by ${h} cm rectangle out of the corner of ${article(W)} ${W} cm by ${H} cm rectangle. What is the volume of the prism?`,
      `${comma(ans)} cm³`,
      /* ans + w x h x len is exactly W x H x len, so the third distractor was
         the first. Forgetting to multiply the cut-out by the length is a
         different slip. */
      [`${comma(W * H * len)} cm³`, `${comma(area)} cm³`,
       `${comma(ans + w * h)} cm³`, `${comma(area * (len - 1))} cm³`],
      4, i);
  }

  function meaSurfaceAreaFromVolume(i) {
    const s = 2 + (i % 6);
    const len = 4 + (i % 9);
    const volume = s * s * len;
    const ans = 2 * s * s + 4 * s * len;
    return mk("Measurement",
      `A cuboid has a square cross-section of side ${s} cm and a volume of ${comma(volume)} cm³. What is its total surface area?`,
      `${comma(ans)} cm²`,
      [`${comma(4 * s * len)} cm²`, `${comma(2 * s * s + 2 * s * len)} cm²`, `${comma(6 * s * s)} cm²`],
      4, i);
  }

  /* Lengths scale by k, areas by k² — the standard trap. */
  function meaScaleArea(i) {
    const k = 2 + (i % 5);
    const area = 12 + 6 * (i % 10);
    const ans = area * k * k;
    return mk("Measurement",
      `A photograph is enlarged so that every length is ${k} times as long as before. The original photograph covered ${area} cm². What area does the enlarged photograph cover?`,
      `${comma(ans)} cm²`,
      [`${comma(area * k)} cm²`, `${comma(area * k * k * k)} cm²`, `${comma(area + k * k)} cm²`],
      4, i);
  }

  /* ── Probability ── */

  function probTwoDiceSum(i) {
    const ways = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1 };
    const target = 2 + (i % 11);
    const n = ways[target];
    return mk("Probability",
      `Two fair six-sided dice are rolled and their scores are added. What is the probability that the total is ${target}?`,
      simp(n, 36),
      [simp(n, 12), simp(n + 1, 36), simp(1, target)],
      4, i);
  }

  function probAtLeastOne(i) {
    const flips = 2 + (i % 5);
    const total = 2 ** flips;
    return mk("Probability",
      `A fair coin is flipped ${flips} times. What is the probability of getting at least one head?`,
      simp(total - 1, total),
      [simp(1, total), simp(1, 2), simp(total - 2, total)],
      4, i);
  }

  /* ── Numbers ── */

  function numRemainderPuzzle(i) {
    const sets = [[4, 5, 6], [3, 4, 5], [4, 6, 9], [5, 6, 8], [3, 5, 7], [4, 5, 9]];
    const divisors = sets[i % sets.length];
    const base = lcmAll(divisors);
    const ans = base + 1;
    return mk("Numbers",
      `What is the smallest number greater than 1 that leaves a remainder of 1 when it is divided by ${divisors[0]}, ${divisors[1]} and ${divisors[2]}?`,
      comma(ans),
      [comma(base), comma(base * 2 + 1), comma(divisors.reduce((a, b) => a * b, 1) + 1)],
      4, i);
  }

  /* Last digits repeat in a short cycle, so the exponent can be huge. */
  function numLastDigitPower(i) {
    const base = [2, 3, 4, 7, 8, 9, 12, 13][i % 8];
    const exponent = 20 + 3 * (i % 15);
    let last = 1;
    for (let k = 0; k < exponent; k++) last = (last * base) % 10;
    return mk("Numbers",
      `What is the last digit of ${base}^${exponent}?`,
      `${last}`,
      [`${(last + 1) % 10}`, `${base % 10}`, `${(last + 5) % 10}`],
      4, i);
  }

  /* ── Decimals ── */

  function decDivideByDecimal(i) {
    const ans = 200 + 50 * (i % 9);
    const divisor = [0.015, 0.025, 0.04, 0.05, 0.002][i % 5];
    const dividend = Number((ans * divisor).toFixed(4));
    return mk("Decimals",
      `What is ${fmt(dividend)} ÷ ${fmt(divisor)}?`,
      comma(ans),
      [comma(ans / 10), comma(ans * 10), fmt(Number((dividend * divisor).toFixed(6)))],
      4, i);
  }

  function decChainedOf(i) {
    const a = [0.4, 0.25, 0.6, 0.75, 0.8][i % 5];
    const b = [0.25, 0.5, 0.2, 0.4, 0.75][(i * 3) % 5];
    const start = 240 + 40 * (i % 8);
    const ans = Number((start * a * b).toFixed(4));
    if (!Number.isInteger(ans)) return null;
    return mk("Decimals",
      `What is ${fmt(a)} of ${fmt(b)} of ${comma(start)}?`,
      comma(ans),
      [comma(Number((start * a).toFixed(2))), comma(Number((start * b).toFixed(2))), fmt(Number((start * (a + b)).toFixed(2)))],
      4, i);
  }

  /* ── Geometry ── */

  function geoPolygonFromAngleSum(i) {
    const sides = 5 + (i % 10);
    const total = (sides - 2) * 180;
    return mk("Geometry",
      `The interior angles of a regular polygon add up to ${comma(total)}°. How many sides does it have?`,
      `${sides}`,
      /* total is (sides - 2) x 180, so total / 180 IS sides - 2. */
      [`${sides - 2}`, `${sides + 2}`, `${sides - 1}`],
      4, i);
  }

  function geoShadedArea(i) {
    const s = 8 + (i % 9);
    const b = 2 + (i % (s - 2)), h = 2 + ((i * 3) % (s - 2));
    const triangle = b * h / 2;
    if (!Number.isInteger(triangle)) return null;
    const ans = s * s - triangle;
    return mk("Geometry",
      `A triangle with base ${b} cm and height ${h} cm is cut out of a square of side ${s} cm. What area of the square is left?`,
      `${fmt(ans)} cm²`,
      [`${fmt(s * s - b * h)} cm²`, `${fmt(triangle)} cm²`, `${fmt(s * s)} cm²`],
      4, i);
  }

  /* ── Statistics ── */

  /* Combining two group means: the answer is weighted, not the halfway point. */
  function statCombinedMean(i) {
    /* Sizes in the ratio p : q and a gap of (p + q) × k between the means keep
       the weighted mean whole for every seed. p ≠ q so the halfway value — the
       distractor the question is really testing — is never also the answer. */
    const ratios = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 2], [2, 5], [3, 4], [4, 1]];
    const [p, q] = ratios[i % ratios.length];
    const t = 5 * (1 + (i % 5));
    const nA = p * t, nB = q * t;
    const k = 1 + (i % 4);
    const mA = 45 + 2 * (i % 10);
    const mB = mA + (p + q) * k;
    const combined = mA + q * k;
    return mk("Statistics",
      `Class A has ${nA} pupils with a mean score of ${mA}. Class B has ${nB} pupils with a mean score of ${mB}. What is the mean score of all ${nA + nB} pupils together?`,
      `${combined}`,
      [`${fmt((mA + mB) / 2)}`, `${mB}`, `${combined + 1}`],
      4, i);
  }

  function statMedianFromFreq(i) {
    const freqs = [3 + (i % 4), 5 + ((i * 3) % 5), 4 + ((i * 5) % 4), 2 + (i % 3), 1 + (i % 4)];
    const n = sum(freqs);
    if (n % 2 === 0) freqs[0] += 1;
    const total = sum(freqs);
    const position = (total + 1) / 2;
    let running = 0, median = 1;
    for (let k = 0; k < freqs.length; k++) { running += freqs[k]; if (running >= position) { median = k + 1; break; } }
    const rows = freqs.map((f, k) => `${k + 1} goal${k ? "s" : ""}: ${f} matches`).join("\n");
    return mk("Statistics",
      `A team recorded the goals it scored in each of ${total} matches:\n${rows}\nWhat is the median number of goals?`,
      `${median}`,
      [`${median + 1}`, `${Math.max(1, median - 1)}`, `${fmt(Number((sum(freqs.map((f, k) => f * (k + 1))) / total).toFixed(2)))}`],
      4, i);
  }

  /* ── Ratio ── */

  function ratAfterChange(i) {
    const a = 2 + (i % 4), b = a + 1 + (i % 4);
    const d = 1 + (i % 3), c = d + 1 + (i % 3);
    if (c * b <= a * d) return null;
    const t = 1 + (i % 5);
    const x = d * t;
    const first = a * x, second = b * x;
    const added = t * (c * b - a * d);
    return mk("Ratio",
      `A box holds red and blue counters in the ratio ${a} : ${b}. When ${comma(added)} more red counters are added, the ratio becomes ${c} : ${d}. How many red counters were in the box to begin with?`,
      comma(first),
      [comma(second), comma(first + added), comma(added * a)],
      4, i);
  }

  /* ── Algebra ── */

  function algSimultaneous(i) {
    const x = 2 + (i % 8), y = 1 + ((i * 3) % 7);
    const a = 2 + (i % 3), b = 3 + (i % 4);
    const c = 4 + (i % 5), d = 1 + (i % 3);
    if (a * d + b * c === 0) return null;
    const p = a * x + b * y, q = c * x - d * y;
    return mk("Algebra",
      `Solve these two equations to find x.\n${a}x + ${b}y = ${p}\n${c}x − ${d}y = ${q}`,
      `${x}`, [`${y}`, `${x + y}`, `${x + 1}`], 4, i);
  }

  /* ═══════════════════ FROM THE NEWTEXT PAPERS ═══════════════════
     Question shapes taken from the GL practice papers and MKT/QE mocks in
     question-bank/NewText that the templates above did not already cover. */

  function numRoundLargePlace(i) {
    const places = [[1000, "thousand"], [10000, "ten thousand"],
                    [100000, "hundred thousand"], [1000000, "million"]];
    const [unit, label] = places[i % places.length];
    const n = 1234567 + 111111 * (i % 9) + 4321 * (i % 7);
    const ans = Math.round(n / unit) * unit;
    return mk("Numbers",
      `What is ${comma(n)} rounded to the nearest ${label}?`,
      comma(ans), [comma(ans + unit), comma(ans - unit), comma(Math.floor(n / unit) * unit + unit * 2)],
      i % 4 === 0 ? 3 : 2, i);
  }

  /* How many three-digit numbers have digits multiplying to a given total.
     Counted directly so the answer cannot drift from the question. */
  function numDigitProductCount(i) {
    const targets = [16, 12, 24, 8, 18, 36, 6, 20];
    const target = targets[i % targets.length];
    let count = 0;
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        for (let c = 1; c <= 9; c++) if (a * b * c === target) count++;
      }
    }
    if (count < 3) return null;
    return mk("Numbers",
      `How many three-digit numbers have digits that multiply together to give ${target}? (No digit may be zero.)`,
      `${count}`, [`${count + 1}`, `${count - 1}`, `${count + 3}`], 4, i);
  }

  function numClosestToTarget(i) {
    const target = -1;
    const offsets = [[0.02, 0.11, 0.09, 0.2], [0.01, 0.15, 0.08, 0.3], [0.03, 0.12, 0.07, 0.25]];
    const set = offsets[i % offsets.length];
    const values = [target + set[0], target - set[1], target + set[2], target - set[3]];
    const best = values.reduce((a, b) => Math.abs(b - target) < Math.abs(a - target) ? b : a);
    const show = v => fmt(Number(v.toFixed(3)));
    return mk("Numbers",
      `Which of these numbers is closest to ${target}?`,
      show(best), values.filter(v => v !== best).map(show), 3, i);
  }

  /* Two linked statements: solve the second, then feed it into the first. */
  function algChainSubstitute(i) {
    const multiple = 2 + (i % 5);
    const y = 5 + (i % 12);
    const add = 3 + (i % 9);
    const x = multiple * y;
    return mk("Algebra",
      `x is ${multiple} times y, and y added to ${add} gives ${y + add}. What is x?`,
      `${x}`, [`${y}`, `${y + add}`, `${multiple * (y + add)}`], 3, i);
  }

  function algFunctionMachine(i) {
    const mul = 2 + (i % 5), add = 1 + (i % 9);
    const inA = 3 + (i % 7), inB = inA + 1 + (i % 4);
    const outA = mul * inA + add, outB = mul * inB + add;
    return mk("Algebra",
      `A number machine multiplies the number put in by ${mul} and then adds ${add}. If ${inA} and ${inB} are put in, what comes out?`,
      `${outA} and ${outB}`,
      [`${outB} and ${outA}`, `${mul * (inA + add)} and ${mul * (inB + add)}`, `${outA + 1} and ${outB + 1}`],
      3, i);
  }

  /* Buy a batch, lose some to damage, sell the rest at a mark-up. */
  function pctProfitAfterLoss(i) {
    const bought = 20 + 10 * (i % 5);
    const cost = 8 + 2 * (i % 7);
    const spoiled = 2 + (i % 4);
    const markup = [25, 50, 20, 10][i % 4];
    const sellPrice = cost * (1 + markup / 100);
    const revenue = (bought - spoiled) * sellPrice;
    const outlay = bought * cost;
    const profit = revenue - outlay;
    if (!Number.isInteger(profit) || profit <= 0) return null;
    return mk("Percentages",
      `A trader bought ${bought} tickets at £${cost} each. ${spoiled} were damaged and thrown away. The rest were sold at ${markup}% more than they cost. What was the profit?`,
      fmtMoney(profit),
      [fmtMoney(revenue), fmtMoney(outlay), fmtMoney(bought * sellPrice - outlay)],
      4, i);
  }

  function pctProfitPerItem(i) {
    const packs = 4 + (i % 6);
    const perPack = 5 + (i % 8);
    const costEach = 6 + (i % 9);                // pence, chosen first
    const packCost = costEach * perPack;         // so the pack price divides exactly
    const sellEach = costEach + 3 + (i % 8);
    const profit = sellEach - costEach;
    return mk("Percentages",
      `A shop buys pencils in packs of ${perPack} for ${packCost}p a pack and sells them at ${sellEach}p each. How much profit is made on each pencil?`,
      `${profit}p`, [`${sellEach}p`, `${costEach}p`, `${profit * perPack}p`],
      3, i);
  }

  /* Folding halves the longer side each time. */
  function meaFoldPaper(i) {
    const folds = 2 + (i % 3);
    const result = 3 + (i % 9);                  // the length left at the end
    const longSide = result * Math.pow(2, folds);  // so every fold halves exactly
    const shortSide = 4 + 2 * (i % 4);
    return mk("Measurement",
      `A sheet of paper measures ${longSide} cm by ${shortSide} cm. It is folded in half ${folds} times, each time halving the longer side. How long is the longer side now?`,
      `${fmt(result)} cm`,
      [`${fmt(longSide / folds)} cm`, `${fmt(result * 2)} cm`, `${fmt(longSide - folds * 2)} cm`],
      3, i);
  }

  /* Outer perimeter = 2(w + h) + 8x for a frame of uniform width x. */
  function meaFrameWidth(i) {
    const w = 15 + 5 * (i % 6), h = 10 + 5 * (i % 5);
    const x = 2 + (i % 5);
    const outer = 2 * (w + h) + 8 * x;
    return mk("Measurement",
      `A picture measuring ${w} cm by ${h} cm is placed in a frame of the same width all the way round. The outer perimeter of the frame is ${outer} cm. How wide is the frame?`,
      /* (outer - 2(w+h))/4 is 2x, the first distractor. Dividing the whole
         outer perimeter by 4 is the mistake worth offering instead. */
      `${x} cm`, [`${x * 2} cm`, `${x + 1} cm`, `${fmt(outer / 4)} cm`,
                  `${fmt(outer / 8)} cm`],
      4, i);
  }

  function meaSquaresInRectangle(i) {
    const side = 2 + (i % 5);
    const across = 3 + (i % 7), down = 2 + (i % 6);
    const W = side * across, H = side * down;
    return mk("Measurement",
      `How many squares of side ${side} cm fit exactly into a rectangle measuring ${W} cm by ${H} cm?`,
      /* W x H / side is across x down x side written another way. Forgetting
         to divide at all is a different mistake, and a real one. */
      `${across * down}`, [`${across + down}`, `${across * down * side}`, `${W * H}`],
      2, i);
  }

  /* Map scale worked backwards: real distance to distance on the map. */
  function ratMapReverse(i) {
    const cmToKm = 2 + (i % 9);
    const mapCm = 3 + (i % 12);
    const realKm = cmToKm * mapCm;
    return mk("Ratio",
      `On a map, 1 cm represents ${cmToKm} km. Two towns are ${realKm} km apart in real life. How far apart are they on the map?`,
      `${mapCm} cm`, [`${realKm} cm`, `${fmt(realKm * cmToKm)} cm`, `${mapCm + 1} cm`],
      3, i);
  }

  /* Gaps that shrink rather than grow — the mirror of seqQuadraticNext. */
  function seqQuadraticDecreasing(i) {
    const first = 20 + 5 * (i % 6);
    const d1 = 4 + (i % 4), d2 = 1 + (i % 3);
    const terms = [first];
    let step = d1;
    for (let k = 1; k < 6; k++) { terms.push(terms[k - 1] - step); step += d2; }
    if (terms.some(t => t < -50)) return null;
    const ans = terms[5];
    return mk("Sequences",
      `What is the next number in this sequence?\n${terms.slice(0, 5).join(", ")}, ...`,
      `${ans}`, [`${terms[4] - d1}`, `${terms[4] - step + d2 * 2}`, `${ans - d2}`],
      4, i);
  }

  function logTimeZone(i) {
    const cities = [["London", "New York", -5], ["London", "Sydney", 9],
                    ["Sydney", "Chicago", -15], ["London", "Tokyo", 9],
                    ["New York", "Paris", 6], ["London", "Delhi", 5]];
    const [from, to, shift] = cities[i % cities.length];
    const hour = 6 + (i % 16);
    const raw = ((hour + shift) % 24 + 24) % 24;
    const pad = h => `${h}`.padStart(2, "0") + ":00";
    return mk("Logic",
      `${to} is ${Math.abs(shift)} hours ${shift > 0 ? "ahead of" : "behind"} ${from}. When it is ${pad(hour)} in ${from}, what is the local time in ${to}?`,
      pad(raw),
      [pad(((hour - shift) % 24 + 24) % 24), pad((hour + 12) % 24), pad((raw + 1) % 24)],
      4, i);
  }

  /* Half of a half, expressed as a capacity. */
  function fracOfCapacity(i) {
    const litres = [2.5, 3, 1.5, 4, 5, 2][i % 6];
    const filled = [1 / 2, 1 / 4, 3 / 4][i % 3];
    const drunk = [1 / 2, 1 / 4, 3 / 4][(i + 1) % 3];
    const start = litres * filled;
    const left = start * (1 - drunk);
    if (Math.abs(left * 1000 - Math.round(left * 1000)) > 1e-9 || left <= 0) return null;
    const asFrac = f => (f === 1 / 2 ? "half" : f === 1 / 4 ? "a quarter" : f === 3 / 4 ? "three quarters" : "a third");
    return mk("Fractions",
      `A ${fmt(litres)} litre bottle is ${asFrac(filled)} full of water. Joe drinks ${asFrac(drunk)} of what is in it. How much water is left?`,
      `${fmt(Number(left.toFixed(3)))} litres`,
      [`${fmt(Number(start.toFixed(3)))} litres`, `${fmt(Number((litres * drunk).toFixed(3)))} litres`,
       `${fmt(Number((start * drunk).toFixed(3)))} litres`],
      4, i);
  }

  /* ═══════════════════ DIAGRAM QUESTIONS ═══════════════════
     Question types from the papers that cannot be asked in words alone. The
     figure is drawn by js/diagrams.js and carried on the question as
     questionImage, the same mechanism the NVRT bank uses, so js/app.js renders
     it without any change. mkFig() is mk() plus the picture. */

  const D = (typeof window !== "undefined" ? window : globalThis).DIAGRAMS || null;

  const mkFig = (topic, question, correct, distractors, difficulty, seed, figure) => {
    if (!figure) return null;
    const q = mk(topic, question, correct, distractors, difficulty, seed);
    if (q) { q.questionImage = figure.image; q.questionImageAlt = figure.alt; }
    return q;
  };

  function figShadedFraction(i) {
    if (!D) return null;
    const cols = 3 + (i % 4), rows = 2 + (i % 3);
    const total = cols * rows;
    const shaded = 1 + (i % (total - 1));
    if (shaded + 1 >= total) return null;   // the "one more" distractor would be 1/1
    return mkFig("Fractions",
      "What fraction of this shape is shaded? Give your answer in its simplest form.",
      simp(shaded, total),
      /* "shaded/total" is only a distinct option when the answer cancels
         down; otherwise it IS the answer, which left this template padding
         every question. The extra candidates cover that case. */
      [simp(total - shaded, total),          // counted the unshaded squares
       `${shaded}/${total}`,                 // right count, never cancelled down
       simp(shaded + 1, total),              // miscounted by one
       simp(shaded - 1, total),              // miscounted the other way
       /* shaded against unshaded, but only while that is still under 1: with
          half the shape shaded it reads 3/3, which is the whole shape. */
       ...(shaded < total - shaded ? [`${shaded}/${total - shaded}`] : [])],

      diff(i, 3), i, D.shadedGrid({ cols, rows, shaded }));
  }

  function figBarChartTotal(i) {
    if (!D) return null;
    const labels = ["Mon", "Tue", "Wed", "Thu"];
    const values = [4 + (i % 7), 6 + ((i * 3) % 8), 3 + ((i * 5) % 6), 5 + ((i * 7) % 9)];
    const total = sum(values);
    return mkFig("Statistics",
      "The bar chart shows how many books were borrowed each day. How many were borrowed altogether?",
      `${total}`, [`${total - values[0]}`, `${Math.max(...values)}`, `${total + values[1]}`],
      diff(i, 3), i, D.barChart({ labels, values, axisLabel: "Books" }));
  }

  function figBarChartDifference(i) {
    if (!D) return null;
    const labels = ["Ash", "Beech", "Elm", "Oak"];
    const values = [5 + (i % 8), 9 + ((i * 3) % 7), 4 + ((i * 5) % 5), 11 + ((i * 2) % 6)];
    const gap = Math.max(...values) - Math.min(...values);
    return mkFig("Statistics",
      "The bar chart shows how many trees of each kind were counted. What is the difference between the most and the least common?",
      `${gap}`, [`${Math.max(...values)}`, `${Math.min(...values)}`, `${gap + 2}`],
      diff(i, 3), i, D.barChart({ labels, values, axisLabel: "Trees" }));
  }

  function figPictogram(i) {
    if (!D) return null;
    const per = [4, 5, 10, 2][i % 4];
    const rows = [["Monday", 3 + (i % 3)], ["Tuesday", 2 + ((i * 3) % 4)], ["Wednesday", 4 + ((i * 5) % 3)]];
    const target = rows[i % 3];
    const ans = target[1] * per;
    return mkFig("Statistics",
      `The pictogram shows how many parcels were delivered. How many were delivered on ${target[0]}?`,
      comma(ans), [comma(target[1]), comma(ans + per), comma(per)],
      diff(i, 3), i, D.pictogram({ rows, per: `${per} parcels` }));
  }

  function figPieChart(i) {
    if (!D) return null;
    const per = 2 + (i % 6);                       // people per degree
    const parts = [[120, "Football"], [90, "Netball"], [60, "Hockey"], [90, "Tennis"]];
    const order = i % 4;
    const sectors = parts.map((p, k) => [parts[(k + order) % 4][1], p[0]]);
    const pick = sectors[i % 4];
    const ans = pick[1] * per;
    const total = 360 * per;
    return mkFig("Statistics",
      `${comma(total)} pupils chose a favourite sport. How many chose ${pick[0]}?`,
      comma(ans), [comma(total - ans), comma(pick[1]), comma(Math.round(ans / 2))],
      diff(i, 2), i, D.pieChart(sectors));
  }

  function figDistanceTimeStationary(i) {
    if (!D) return null;
    const d1 = 20 + 10 * (i % 5);
    const stopFrom = 1 + (i % 2), stopFor = 1 + (i % 3);
    const points = [[0, 0], [stopFrom, d1], [stopFrom + stopFor, d1], [stopFrom + stopFor + 2, d1 + 40]];
    return mkFig("Speed",
      "The graph shows a lorry's journey. For how long was the lorry stopped?",
      `${stopFor} hour${stopFor > 1 ? "s" : ""}`,
      [`${stopFrom} hour${stopFrom > 1 ? "s" : ""}`, `${stopFor + 1} hours`, "It did not stop"],
      diff(i, 2), i, D.distanceTime({ points }));
  }

  function figDistanceTimeSpeed(i) {
    if (!D) return null;
    const speed = 10 * (2 + (i % 6));
    const hours = 2 + (i % 3);
    const points = [[0, 0], [hours, speed * hours], [hours + 1, speed * hours], [hours + 3, speed * hours + speed * 2]];
    return mkFig("Speed",
      "The graph shows a cyclist's journey. What was her speed during the first part of the journey?",
      `${speed} km/h`, [`${speed * hours} km/h`, `${speed / 2} km/h`, `${speed + 10} km/h`],
      diff(i, 3), i, D.distanceTime({ points }));
  }

  function figVennOnly(i) {
    if (!D) return null;
    const onlyA = 4 + (i % 9), both = 2 + (i % 7), onlyB = 3 + ((i * 3) % 8), outside = 1 + (i % 5);
    const asks = [
      ["like only football", `${onlyA}`, [`${onlyA + both}`, `${both}`, `${onlyB}`]],
      ["like both sports", `${both}`, [`${onlyA}`, `${onlyA + both}`, `${onlyB + both}`]],
      ["like football", `${onlyA + both}`, [`${onlyA}`, `${both}`, `${onlyA + both + onlyB}`]],
      ["were asked altogether", `${onlyA + both + onlyB + outside}`, [`${onlyA + both + onlyB}`, `${both}`, `${outside}`]]
    ];
    const [phrase, ans, wrong] = asks[i % asks.length];
    return mkFig("Statistics",
      `The Venn diagram shows which sports a group of pupils like. How many ${phrase}?`,
      ans, wrong, diff(i, 3), i,
      D.vennTwo({ labelA: "Football", labelB: "Cricket", onlyA, both, onlyB, outside }));
  }

  function figCompoundPerimeter(i) {
    if (!D) return null;
    const W = 8 + (i % 8), H = 6 + ((i * 3) % 6);
    const w = 2 + (i % 3), h = 2 + ((i * 2) % 3);
    if (w >= W || h >= H) return null;
    /* An L-shape cut from a corner has the same perimeter as the whole
       rectangle: the two new edges replace exactly what they removed. */
    const perimeter = 2 * (W + H);
    const area = W * H - w * h;
    const askArea = i % 2 === 0;
    return mkFig("Measurement",
      askArea ? "What is the area of this L-shaped figure?" : "What is the perimeter of this L-shaped figure?",
      askArea ? `${area} cm²` : `${perimeter} cm`,
      askArea ? [`${W * H} cm²`, `${w * h} cm²`, `${perimeter} cm²`]
              : [`${perimeter - 2 * w} cm`, `${area} cm`, `${perimeter + 2 * h} cm`],
      askArea ? diff(i, 3) : 4, i, D.lShape({ W, H, w, h }));
  }

  function figAnglesOnLine(i) {
    if (!D) return null;
    const a = 30 + 5 * (i % 12), b = 25 + 5 * ((i * 3) % 10);
    if (a + b >= 175) return null;
    const x = 180 - a - b;
    return mkFig("Geometry",
      "The angles shown lie on a straight line. What is the size of angle x?",
      `${x}°`, [`${180 - a}°`, `${a + b}°`, `${360 - a - b}°`],
      diff(i, 3), i, D.anglesOnLine({ known: [{ deg: a }, { deg: b }], unknownLabel: "x" }));
  }

  function figAnglesAtPoint(i) {
    if (!D) return null;
    const a = 60 + 10 * (i % 8), b = 50 + 10 * ((i * 3) % 7), c = 40 + 10 * ((i * 5) % 6);
    if (a + b + c >= 350) return null;
    const x = 360 - a - b - c;
    return mkFig("Geometry",
      "The angles shown meet at a point. What is the size of angle x?",
      /* 180 - (a+b+c) mod 180 is 360 - (a+b+c) once the three angles pass
         180, so it was the answer in 49 of 50 questions. Using 180 instead
         of 360, or missing an angle out, are the real errors. */
      `${x}°`, [`${a + b + c}°`, `${x + 10}°`, `${360 - a - b}°`,
                `${Math.abs(180 - a - b - c)}°`],
      4, i, D.anglesOnLine({ known: [{ deg: a }, { deg: b }, { deg: c }], unknownLabel: "x", onLine: false }));
  }

  function figCoordinatesRead(i) {
    if (!D) return null;
    const x = 1 + (i % 7), y = 1 + ((i * 3) % 7);
    return mkFig("Geometry",
      "What are the coordinates of point P?",
      `(${x}, ${y})`, [`(${y}, ${x})`, `(${x + 1}, ${y})`, `(${x}, ${y + 1})`],
      diff(i, 4), i, D.coordGrid({ points: [[x, y, "P"]] }));
  }

  function figCoordinatesMidpoint(i) {
    if (!D) return null;
    const ax = 1 + (i % 3), ay = 1 + (i % 3);
    const bx = ax + 2 + 2 * (i % 3), by = ay + 2 + 2 * ((i * 3) % 3);
    if (bx > 8 || by > 8) return null;
    const mx = (ax + bx) / 2, my = (ay + by) / 2;
    if (!Number.isInteger(mx) || !Number.isInteger(my)) return null;
    return mkFig("Geometry",
      "What are the coordinates of the midpoint of the line joining A and B?",
      `(${mx}, ${my})`, [`(${my}, ${mx})`, `(${bx - ax}, ${by - ay})`, `(${mx + 1}, ${my})`],
      4, i, D.coordGrid({ points: [[ax, ay, "A"], [bx, by, "B"]] }));
  }

  /* ═══════════════════ FROM THE AUGUST QE/EPP PAPERS ═══════════════════
     Shapes the QE Boys and Examberry papers set repeatedly that the bank had
     no template for. Each answer is recomputed from the printed question in
     verify.js rather than trusted. */

  const COMPASS = ["north", "north-east", "east", "south-east",
                   "south", "south-west", "west", "north-west"];

  /* "You are facing south and turn clockwise through three right angles." */
  function geoCompassTurn(i) {
    const from = i % 8;
    const quarters = 1 + (i % 3);                     // a full turn would be no turn at all
    const clockwise = i % 2 === 0;
    const step = quarters * 2;                        // a right angle is two points
    const to = ((from + (clockwise ? step : -step)) % 8 + 8) % 8;

    /* Turning the wrong way is the mistake worth offering, but for a two-right-
       angle turn it lands on the same point as the answer, so the distractors
       are collected by hand and de-duplicated rather than assumed distinct. */
    const wrongWay = ((from + (clockwise ? -step : step)) % 8 + 8) % 8;
    const options = [];
    [wrongWay, (to + 1) % 8, (to + 7) % 8, (to + 4) % 8].forEach(k => {
      if (k !== to && !options.includes(COMPASS[k])) options.push(COMPASS[k]);
    });
    if (options.length < 3) return null;
    return mk("Geometry",
      `You are facing ${COMPASS[from]}. You turn ${clockwise ? "clockwise" : "anticlockwise"} ` +
      `through ${["one", "two", "three"][quarters - 1]} right angle${quarters > 1 ? "s" : ""}. ` +
      `Which direction are you facing now?`,
      COMPASS[to], options.slice(0, 3),
      diff(i, 3), i);
  }

  /* The smaller of the two angles between two of the eight compass points. */
  function geoCompassAngle(i) {
    const from = i % 8;
    const to = (from + 1 + (i % 7)) % 8;
    const gap = Math.abs(to - from);
    const points = Math.min(gap, 8 - gap);
    const ans = points * 45;
    if (ans === 0) return null;
    /* Every distractor must itself be a turn between compass points, so they
       are drawn from the multiples of 45 and de-duplicated against the answer
       rather than assumed distinct. */
    const options = [];
    [360 - ans, gap * 45, 45, 90, 135, 180, 225].forEach(v => {
      const label = `${v}°`;
      if (v !== ans && v > 0 && v < 360 && !options.includes(label)) options.push(label);
    });
    if (options.length < 3) return null;
    return mk("Geometry",
      `You are facing ${COMPASS[from]}. What is the smallest angle you must turn through to face ${COMPASS[to]}?`,
      `${ans}°`, options.slice(0, 3),
      diff(i, 3), i);
  }

  /* Fourth vertex of a parallelogram. Naming the vertices in order makes the
     answer unique: ABCD has AC and BD sharing a midpoint, so D = A + C - B.
     Without the ordering there are three possible answers. */
  function geoParallelogramVertex(i) {
    const ax = i % 4, ay = 1 + (i % 3);
    const bx = ax + 2 + (i % 4), by = ay;
    const cx = bx + 1 + (i % 3), cy = by + 2 + (i % 4);
    const dx = ax + cx - bx, dy = ay + cy - by;
    const pt = (x, y) => `(${x}, ${y})`;
    return mk("Geometry",
      `Three vertices of a parallelogram ABCD are A${pt(ax, ay)}, B${pt(bx, by)} and C${pt(cx, cy)}. ` +
      `What are the coordinates of D?`,
      pt(dx, dy),
      [pt(bx + cx - ax, by + cy - ay), pt(ax + bx - cx, ay + by - cy), pt(dy, dx)],
      diff(i, 2) + 2, i);
  }

  /* Three lengths make a triangle only if the two shorter ones together beat
     the longest. Every distractor genuinely fails that test. */
  function geoTriangleInequality(i) {
    const set = (a, b, c) => `${a} cm, ${b} cm, ${c} cm`;
    const s = 2 + (i % 5);
    const good = [s + 2, s + 3, s + 4];
    const candidates = [[1, s + 1, s + 3], [2, s + 2, s + 5], [1, 1, s + 3], [2, 3, s + 6]];
    const seen = new Set();
    const options = [];
    candidates.forEach(([a, b, c]) => {
      if (a + b > c) return;                          // must genuinely fail
      const t = set(a, b, c);
      if (!seen.has(t)) { seen.add(t); options.push(t); }
    });
    if (options.length < 3) return null;
    return mk("Geometry",
      `Which of these sets of three lengths could be the sides of a triangle?`,
      set(good[0], good[1], good[2]), options.slice(0, 3),
      diff(i, 2) + 2, i);
  }

  /* Lines of symmetry of the named shapes, which the papers ask for combined. */
  const SYMMETRY_LINES = {
    square: 4, rectangle: 2, rhombus: 2, kite: 1, parallelogram: 0,
    "equilateral triangle": 3, "isosceles triangle": 1, "regular pentagon": 5,
    "regular hexagon": 6, "regular octagon": 8
  };

  function geoSymmetryCombined(i) {
    const names = Object.keys(SYMMETRY_LINES);
    const a = names[i % names.length];
    const b = names[(i + 3 + (i % 4)) % names.length];
    if (a === b) return null;
    const x = SYMMETRY_LINES[a], y = SYMMETRY_LINES[b];
    const sum = i % 2 === 0;
    const ans = sum ? x + y : x * y;
    return mk("Geometry",
      `What is the ${sum ? "sum" : "product"} of the number of lines of symmetry of ${article(a)} ${a} ` +
      `and the number of lines of symmetry of ${article(b)} ${b}?`,
      `${ans}`,
      [`${sum ? x * y : x + y}`, `${ans + 1}`, `${Math.abs(x - y)}`],
      diff(i, 3) + 1, i);
  }

  /* Capital letters with a mirror line straight down the middle. */
  const VERTICAL_SYMMETRY = ["A", "H", "I", "M", "O", "T", "U", "V", "W", "X", "Y"];
  const NO_VERTICAL_SYMMETRY = ["B", "C", "D", "E", "F", "G", "J", "K", "L",
                                "N", "P", "Q", "R", "S", "Z"];

  function geoSymmetryLetters(i) {
    const pick = (arr, n, off) => Array.from({ length: n }, (_, k) => arr[(off + k * 3) % arr.length]);
    const good = pick(VERTICAL_SYMMETRY, 3, i);
    if (new Set(good).size < 3) return null;
    const options = [];
    for (let k = 1; k <= 3; k++) {
      const two = pick(VERTICAL_SYMMETRY, 2, i + k);
      const bad = NO_VERTICAL_SYMMETRY[(i + k * 5) % NO_VERTICAL_SYMMETRY.length];
      const trio = two.concat(bad);
      if (new Set(trio).size === 3) options.push(trio.join(", "));
    }
    if (options.length < 3) return null;
    return mk("Geometry",
      `Which of these sets of capital letters all have a vertical line of symmetry?`,
      good.join(", "), options, diff(i, 3) + 1, i);
  }

  /* A polygon carrying one reflex angle. The angle sum still holds, which is
     the whole point: the reflex angle is not an exception to the rule. */
  function geoPolygonMissingAngle(i) {
    const sides = 5 + (i % 2);                        // pentagon or hexagon
    const total = (sides - 2) * 180;
    const given = [];
    let running = 0;
    for (let k = 0; k < sides - 2; k++) {
      const a = 80 + ((i + k * 7) % 40);
      given.push(a); running += a;
    }
    const reflex = 190 + ((i * 3) % 60);
    given.push(reflex); running += reflex;
    const ans = total - running;
    if (ans < 20 || ans > 175) return null;
    const named = sides === 5 ? "pentagon" : "hexagon";
    return mk("Geometry",
      `${sides - 1} of the ${sides} interior angles of a ${named} are ` +
      `${given.slice(0, -1).join("°, ")}° and ${reflex}°. What is the size of the last angle?`,
      `${ans}°`,
      [`${ans + 10}°`, `${total - running + 30}°`, `${180 - (ans % 180)}°`],
      diff(i, 2) + 2, i);
  }

  /* The reflex angle between the hands: 360 minus the smaller one. */
  function logClockReflexAngle(i) {
    const hour = 1 + (i % 12);
    const minute = [0, 30, 15, 45][i % 4];
    const hourHand = (hour % 12) * 30 + minute * 0.5;
    const minuteHand = minute * 6;
    const raw = Math.abs(hourHand - minuteHand);
    const small = Math.min(raw, 360 - raw);
    const ans = 360 - small;
    if (small === 0 || small === 180) return null;    // no distinct reflex angle
    const show = n => `${Number.isInteger(n) ? n : n.toFixed(1)}°`;
    return mk("Logic",
      `What is the size of the reflex angle between the hands of a clock at ` +
      `${`${hour}`.padStart(2, "0")}:${`${minute}`.padStart(2, "0")}?`,
      show(ans), [show(small), show(ans - 30), show(small + 180)],
      diff(i, 2) + 2, i);
  }

  /* The papers print this as "2x = 64", meaning 2 to the power x. */
  function algPowerEquation(i) {
    const base = [2, 3, 5, 2, 4, 10][i % 6];
    const exp = base === 2 ? 3 + (i % 5) : base === 3 ? 2 + (i % 3) : 2 + (i % 2);
    const value = base ** exp;
    return mk("Algebra",
      `If ${base}^x = ${comma(value)}, what is the value of x?`,
      `${exp}`,
      [`${value / base}`, `${exp + 1}`, `${base}`],
      diff(i, 3) + 1, i);
  }

  /* "40 ÷ N = 3 remainder 4" rearranges to 40 = 3N + 4. */
  function algRemainderDivisor(i) {
    const divisor = 6 + (i % 9);
    const quotient = 2 + (i % 5);
    const remainder = 1 + (i % (divisor - 1));
    if (remainder >= divisor) return null;
    const total = divisor * quotient + remainder;
    return mk("Algebra",
      `${total} ÷ N = ${quotient} remainder ${remainder}. What is the value of N?`,
      `${divisor}`,
      [`${quotient}`, `${Math.floor(total / quotient)}`, `${divisor + 1}`],
      diff(i, 2) + 2, i);
  }

  /* An integer trapped between two neighbours of a multiple: 41 < 3y < 43
     leaves 3y = 42 as the only possibility. */
  function algInequalityInteger(i) {
    const mult = 3 + (i % 6);
    const y = 4 + (i % 12);
    const product = mult * y;
    const lo = product - 1, hi = product + 1;
    const nearMiss = y > 1 ? y - 1 : y + 2;
    return mk("Algebra",
      `${lo} < ${mult}y < ${hi}, where y is a whole number. What is the value of y?`,
      `${y}`,
      [`${y + 1}`, `${product}`, `${nearMiss}`],
      diff(i, 2) + 2, i);
  }

  /* Building the expression rather than evaluating it. */
  function algExpressionChange(i) {
    const count = 2 + (i % 6);
    const note = [5, 10, 20][i % 3];
    const pence = note * 100;
    return mk("Algebra",
      `A pen costs p pence. Ravi buys ${count} pens and pays with a £${note} note. ` +
      `Which expression shows his change, in pence?`,
      `${comma(pence)} − ${count}p`,
      [`${count}p − ${comma(pence)}`, `${comma(pence)} − p`, `${comma(pence * count)} − ${count}p`],
      diff(i, 2) + 2, i);
  }

  /* Words to digits. The trap is the empty hundreds column, which invites a
     nought too few or too many. */
  const UNITS = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
                 "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
                 "seventeen", "eighteen", "nineteen"];
  const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

  function spellUnder1000(n) {
    if (n === 0) return "";
    const parts = [];
    if (n >= 100) { parts.push(`${UNITS[Math.floor(n / 100)]} hundred`); n %= 100; }
    if (n) {
      if (parts.length) parts.push("and");
      if (n < 20) parts.push(UNITS[n]);
      else parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? `-${UNITS[n % 10]}` : ""));
    }
    return parts.join(" ");
  }

  function numWordsToDigits(i) {
    const thousands = 100 + (i * 37) % 900;
    const rest = 1 + (i * 53) % 99;                   // deliberately under 100
    const value = thousands * 1000 + rest;
    const words = `${spellUnder1000(thousands)} thousand and ${spellUnder1000(rest)}`;
    return mk("Numbers",
      `Which of these is the number "${words}"?`,
      comma(value),
      [comma(thousands * 1000 + rest * 10), comma(thousands * 1000 + rest * 100),
       comma(thousands * 100 + rest)],
      diff(i, 3) + 1, i);
  }

  /* A translation followed by a rotation, in the order given. Doing them the
     other way round lands somewhere else, which is the distractor. */
  function geoTransformCompose(i) {
    const px = 1 + (i % 5), py = 2 + (i % 4);
    const down = 1 + (i % 6);
    const clockwise = i % 2 === 0;
    const midY = py - down;
    const ans = clockwise ? [midY, -px] : [-midY, px];
    const pt = ([x, y]) => `(${x}, ${y})`;
    const rotate = ([x, y]) => (clockwise ? [y, -x] : [-y, x]);

    /* The three mistakes worth offering: turning the wrong way, doing the two
       steps in the wrong order, and forgetting the move altogether. */
    const wrongWay = clockwise ? [-midY, px] : [midY, -px];
    const rotatedFirst = rotate([px, py]);
    const wrongOrder = [rotatedFirst[0], rotatedFirst[1] - down];
    const forgotMove = rotatedFirst;
    const options = [];
    [wrongWay, wrongOrder, forgotMove, [px, midY]].forEach(cand => {
      const label = pt(cand);
      if (label !== pt(ans) && !options.includes(label)) options.push(label);
    });
    if (options.length < 3) return null;
    return mk("Geometry",
      `The point ${pt([px, py])} is moved down ${down} unit${down > 1 ? "s" : ""}, then rotated ` +
      `90° ${clockwise ? "clockwise" : "anticlockwise"} about the origin. Where does it end up?`,
      pt(ans), options.slice(0, 3),
      4, i);
  }

  /* One angle of a scalene triangle is given. The other two add to the rest,
     are different, and are both smaller, so the median sits strictly between
     half the remainder and the whole remainder. */
  function statMedianAngleTriangle(i) {
    const largest = 96 + (i % 40);
    const rest = 180 - largest;
    const low = rest / 2;
    const ans = Math.floor(low) + 1 + (i % 3);
    if (!(ans > low && ans < rest && ans < largest)) return null;
    const bad = [Math.floor(low) - 2 - (i % 3), rest + 2 + (i % 4), largest + 5];
    if (bad.some(b => b > low && b < rest)) return null;   // a distractor must be wrong
    if (new Set(bad).size < 3 || bad.some(b => b <= 0)) return null;
    return mk("Statistics",
      `One angle of a scalene triangle is ${largest}°. Which of these could be the median ` +
      `of the three angles of the triangle?`,
      `${ans}°`, bad.map(b => `${b}°`),
      4, i);
  }

  /* ═══════════════════ COUNTING PRINCIPLE ═══════════════════
     The topic had no generators at all - only 44 hand-written questions - so it
     was the one topic that could not fill a paper. These are pitched at Hard and
     Super Hard, which is where the QE and EPP papers set them.

     Every distractor is a named mistake: allowing repeats when the question
     forbids them, ignoring order when it matters, or forgetting the restricted
     position. */

  /* Two parameters taken off the same modulus move together, so 50 seeds
     collapse to a handful of questions. axis() spreads one seed across several
     parameters instead.

     There are only VARIATIONS_PER_TEMPLATE seeds - 50 - so the budget is small
     and honesty about it matters. Dividing by span-to-the-power-place, as the
     first version did, meant axis(i, 2, 9) divided by 81 and never moved at
     all: one template's answer was the same number in all 50 questions. Place 0
     and place 1 are genuinely independent, seven seeds apart; place 2 is instead
     phase-shifted by a stride coprime to most spans, which is the most a
     50-seed budget can honestly give. */
  const axis = (i, place, span) =>
    place === 0 ? i % span
      : place === 1 ? Math.floor(i / 7) % span
        : (i * 3 + 1) % span;

  const fact = n => { let r = 1; for (let k = 2; k <= n; k++) r *= k; return r; };
  const nPr = (n, r) => { let v = 1; for (let k = 0; k < r; k++) v *= (n - k); return v; };
  const nCr = (n, r) => Math.round(nPr(n, r) / fact(r));

  /* A rotation of 1-9 cut to length, so there are many more sets than a fixed
     list would give, while every set stays free of 0. */
  const digitSet = (i, n) => {
    const all = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const off = i % 9;
    return Array.from({ length: n }, (_, k) => all[(off + k) % 9]).sort((a, b) => a - b);
  };
  const listDigits = ds => ds.slice(0, -1).join(", ") + " and " + ds[ds.length - 1];

  /* n digits, choose k, order matters, nothing reused: n x (n-1) x ... */
  function countArrangeNoRepeat(i) {
    const n = 5 + axis(i, 0, 3);
    const ds = digitSet(axis(i, 1, 9) * 3 + axis(i, 0, 3), n);
    const k = 3 + axis(i, 2, 2);
    if (k >= n) return null;
    const ans = nPr(n, k);
    return mk("Counting Principle",
      `How many ${k}-digit numbers can be made from the digits ${listDigits(ds)} ` +
      `if no digit may be used more than once?`,
      comma(ans),
      [comma(n ** k),                        // let the digits repeat
       comma(nCr(n, k)),                     // ignored the order
       comma(fact(n)),                       // arranged all of them
       comma(nPr(n, k) / k)],
      3 + (i % 2), i);
  }

  /* The same count, but zero is in the set and may not lead. */
  function countArrangeFirstRestrict(i) {
    const n = 5 + axis(i, 0, 4);
    const ds = [0, ...digitSet(axis(i, 1, 9), n - 1)];
    const k = 3 + axis(i, 2, 2);
    if (k >= n) return null;
    const ans = (n - 1) * nPr(n - 1, k - 1);
    return mk("Counting Principle",
      `How many ${k}-digit numbers can be made from the digits ${listDigits(ds)} ` +
      `if no digit is repeated and the number cannot begin with 0?`,
      comma(ans),
      [comma(nPr(n, k)),                     // forgot the leading-zero rule
       comma((n - 1) ** k),
       comma(nPr(n - 1, k)),                 // left 0 out altogether
       comma(ans - nPr(n - 1, k - 1))],
      3 + (i % 2), i);
  }

  /* An even number has to end in an even digit, so that place is filled first. */
  function countEvenNoRepeat(i) {
    const n = 5 + axis(i, 0, 3);
    const ds = digitSet(axis(i, 1, 9), n);
    const k = 3;
    const evens = ds.filter(d => d % 2 === 0).length;
    const odds = n - evens;
    if (!evens || !odds || k >= n) return null;
    const ans = evens * nPr(n - 1, k - 1);
    return mk("Counting Principle",
      `How many ${k}-digit even numbers can be made from the digits ${listDigits(ds)} ` +
      `if no digit is repeated?`,
      comma(ans),
      [comma(nPr(n, k)),                     // ignored the "even" rule
       comma(odds * nPr(n - 1, k - 1)),      // filled the last place with an odd digit
       comma(evens * nPr(n - 1, k - 1) / 2),
       comma(evens * n ** (k - 1))],
      4, i);
  }

  /* Bigger than a round hundred: only the leading digit is constrained. */
  function countGreaterThan(i) {
    const n = 5 + axis(i, 0, 3);
    const ds = digitSet(axis(i, 1, 9), n);
    const k = 3;
    const t = ds[1 + (axis(i, 2, 3) % (n - 2))];
    const big = ds.filter(d => d >= t).length;
    if (big < 2 || big === n) return null;
    const ans = big * nPr(n - 1, k - 1);
    return mk("Counting Principle",
      `How many ${k}-digit numbers greater than ${t}00 can be made from the digits ` +
      `${listDigits(ds)} if no digit is repeated?`,
      comma(ans),
      [comma(nPr(n, k)),                     // ignored the size rule
       comma((big - 1) * nPr(n - 1, k - 1)), // missed the boundary digit
       comma(big * nPr(n - 1, k)),
       comma((n - big) * nPr(n - 1, k - 1))],
      4, i);
  }

  /* Letters may repeat, digits may not - two rules in one question. */
  function countPlateLettersDigits(i) {
    const letters = 1 + axis(i, 0, 3), digits = 2 + axis(i, 1, 3);
    const ans = 26 ** letters * nPr(10, digits);
    return mk("Counting Principle",
      `A code is made from ${letters} letter${letters > 1 ? "s" : ""} followed by ` +
      `${digits} digit${digits > 1 ? "s" : ""}. The letters may be repeated but the digits ` +
      `may not. How many different codes are possible?`,
      comma(ans),
      [comma(26 ** letters * 10 ** digits),  // let the digits repeat too
       comma(nPr(26, letters) * nPr(10, digits)),
       comma(26 * letters * 10 * digits),
       comma(26 ** letters * 9 ** digits)],
      3 + (i % 2), i);
  }

  /* Choosing a group: order does not matter, so divide the arrangements out. */
  function countChooseCommittee(i) {
    const n = 6 + axis(i, 0, 6), k = 2 + axis(i, 1, 3);
    if (k >= n) return null;
    const ans = nCr(n, k);
    const roles = ["a team", "a committee", "a panel", "a group"][i % 4];
    return mk("Counting Principle",
      `${roles.charAt(0).toUpperCase() + roles.slice(1)} of ${k} is chosen from ${n} people. ` +
      `The order of choosing does not matter. How many different selections are possible?`,
      comma(ans),
      [comma(nPr(n, k)),                     // counted the orders as different
       comma(n ** k),
       comma(nCr(n, k - 1)),
       comma(nCr(n, k) * k)],
      3 + (i % 2), i);
  }

  /* Handshakes are pairs, so each one gets counted twice before halving. */
  function countHandshakes(i) {
    const n = 5 + (i % 16);
    const ans = nCr(n, 2);
    return mk("Counting Principle",
      `Everyone in a group of ${n} people shakes hands exactly once with everyone else. ` +
      `How many handshakes take place altogether?`,
      comma(ans),
      [comma(n * (n - 1)),                   // counted each handshake twice
       comma(n * n),
       comma(n - 1),
       comma(nCr(n, 2) + n)],
      3, i);
  }

  /* Repeated letters cannot be told apart, so the arrangements divide out. */
  const REPEAT_WORDS = ["BANANA", "LEVEL", "ERROR", "PEPPER", "LETTER", "SUCCESS",
                        "COFFEE", "BALLOON", "TOMATO", "ADDRESS"];

  function countWordRepeatedLetters(i) {
    const word = REPEAT_WORDS[i % REPEAT_WORDS.length];
    const counts = {};
    word.split("").forEach(c => { counts[c] = (counts[c] || 0) + 1; });
    const repeats = Object.values(counts).filter(c => c > 1);
    if (!repeats.length) return null;
    const divisor = Object.values(counts).reduce((p, c) => p * fact(c), 1);
    const ans = fact(word.length) / divisor;
    return mk("Counting Principle",
      `How many different arrangements are there of all the letters of the word ${word}?`,
      comma(ans),
      [comma(fact(word.length)),             // treated the repeats as different
       comma(ans * 2),
       comma(fact(word.length) / 2),
       comma(ans / 2)],
      4, i);
  }

  /* Round a table there is no first seat, so one person is fixed. */
  function countCircular(i) {
    const n = 4 + (i % 7);
    const ans = fact(n - 1);
    return mk("Counting Principle",
      `In how many different ways can ${n} people be seated around a round table, ` +
      `if seatings that are rotations of each other count as the same?`,
      comma(ans),
      [comma(fact(n)),                       // treated it as a row
       comma(fact(n - 2)),
       comma(fact(n - 1) / 2),
       comma(n * (n - 1))],
      4, i);
  }

  /* Routes on a grid: choose which of the moves are the sideways ones. */
  function countGridPaths(i) {
    const right = 2 + axis(i, 0, 4), down = 2 + axis(i, 1, 4);
    const ans = nCr(right + down, right);
    return mk("Counting Principle",
      `A counter starts in the top-left corner of a grid and must reach the bottom-right ` +
      `corner by moving ${right} squares right and ${down} squares down, in any order. ` +
      `How many different routes are there?`,
      comma(ans),
      [comma(right * down),
       comma(right + down),
       comma(fact(right + down)),            // forgot the moves of a kind are alike
       comma(nCr(right + down, right) * 2)],
      4, i);
  }

  /* ═══════════════════ HARDER PROBABILITY ═══════════════════
     The topic had 123 questions a paper could use, only 31 of them above
     Medium. These add the two-stage and complement work the papers actually
     set. Fractions are always given in their lowest terms, and every distractor
     is itself a probability. */

  /* Two picks, nothing put back: the second denominator has shrunk. */
  function probTwoSameColour(i) {
    const r = 2 + axis(i, 0, 6), b = 2 + axis(i, 1, 6);
    const n = r + b;
    if (r < 2) return null;
    return mk("Probability",
      `A bag holds ${r} red and ${b} blue counters. Two are taken out at random ` +
      `without replacement. What is the probability that both are red?`,
      simp(r * (r - 1), n * (n - 1)),
      [simp(r * r, n * n),                   // treated the picks as independent
       simp(r * (r - 1), n * n),             // shrank the top but not the bottom
       simp(r, n),                           // answered for one pick
       simp(2 * r * (r - 1), n * (n - 1))],
      3 + (i % 2), i);
  }

  /* One of each: the two orders both count. */
  function probOneOfEach(i) {
    const r = 2 + axis(i, 0, 6), b = 2 + axis(i, 1, 6);
    const n = r + b;
    return mk("Probability",
      `A bag holds ${r} red and ${b} blue counters. Two are taken out at random ` +
      `without replacement. What is the probability of getting one of each colour?`,
      simp(2 * r * b, n * (n - 1)),
      [simp(r * b, n * (n - 1)),             // counted only one order
       simp(2 * r * b, n * n),
       simp(r * b, n * n),
       simp(r + b, n * (n - 1))],
      4, i);
  }

  /* Conditional: the first pick has already happened. */
  function probConditionalSecond(i) {
    const r = 2 + axis(i, 0, 6), b = 2 + axis(i, 1, 6);
    const n = r + b;
    if (r < 2) return null;
    return mk("Probability",
      `A bag holds ${r} red and ${b} blue counters. One counter is taken out and it is red. ` +
      `It is not put back. What is the probability that the next counter taken is also red?`,
      simp(r - 1, n - 1),
      [simp(r, n),                           // ignored the counter already taken
       simp(r, n - 1),                       // shrank the bag but not the reds
       simp(r - 1, n),                       // shrank the reds but not the bag
       simp(b, n - 1)],
      3 + (i % 2), i);
  }

  /* A two-way count in words: the overlap has to be taken off one group. */
  function probTwoWayTable(i) {
    const total = 24 + 4 * (i % 5);
    const girls = Math.floor(total / 2) + 1 + (i % 3);
    const boys = total - girls;
    const glasses = 8 + (i % 5);
    const girlsGlasses = 3 + (i % 4);
    const boysGlasses = glasses - girlsGlasses;
    if (boysGlasses < 1 || girlsGlasses > girls || boysGlasses > boys) return null;
    return mk("Probability",
      `In a class of ${total} pupils, ${girls} are girls. ${glasses} pupils wear glasses, ` +
      `and ${girlsGlasses} of those are girls. One pupil is chosen at random. What is the ` +
      `probability that the pupil is a boy who wears glasses?`,
      simp(boysGlasses, total),
      [simp(glasses, total),                 // all the glasses-wearers
       simp(girlsGlasses, total),            // the girls instead
       simp(boys, total),                    // all the boys
       simp(boysGlasses, boys)],             // out of the boys, not the class
      3 + (i % 2), i);
  }

  /* Two spinners: count the pairs that make the total. */
  function probTwoSpinnersSum(i) {
    const a = 3 + axis(i, 0, 3), b = 3 + axis(i, 1, 4);
    const t = 3 + (axis(i, 2, 5) % (a + b - 3));
    let ways = 0;
    for (let x = 1; x <= a; x++) for (let y = 1; y <= b; y++) if (x + y === t) ways++;
    if (!ways || ways === a * b) return null;
    return mk("Probability",
      `One spinner is numbered 1 to ${a} and another is numbered 1 to ${b}. Both are spun ` +
      `and the two numbers are added. What is the probability that the total is ${t}?`,
      simp(ways, a * b),
      [simp(1, a * b),                       // thought there was only one way
       simp(ways, a + b),                    // added the sections instead
       simp(ways + 1, a * b),
       simp(t, a * b)],
      4, i);
  }

  /* Working backwards from the probability to the number added. */
  function probAddToTarget(i) {
    const r = 2 + axis(i, 0, 4), b = 3 + axis(i, 1, 4), x = 1 + axis(i, 2, 4);
    const n = r + b;
    const target = simp(r + x, n + x);
    if (simp(r, n) === target) return null;
    return mk("Probability",
      `A bag holds ${r} red and ${b} blue counters. Some more red counters are added, and ` +
      `the probability of picking a red counter becomes ${target}. How many red counters ` +
      `were added?`,
      `${x}`,
      [`${x + 1}`, `${x - 1 > 0 ? x - 1 : x + 2}`, `${x * 2}`, `${b - x > 0 ? b - x : x + 3}`],
      4, i);
  }

  /* "Not all the same" is quicker as 1 minus the two ways they can match. */
  function probNotAllSame(i) {
    /* A die as well as a coin, and a wider range of throws: with only a coin
       and three lengths this produced three distinct questions in total. */
    const useDie = i % 3 === 2;
    const trials = useDie ? 2 + (i % 2) : 3 + (i % 4);
    const faces = useDie ? 6 : 2;
    const total = faces ** trials;
    const same = faces;                      // one way per face to match throughout
    const thing = useDie ? `A fair die is rolled ${trials} times`
                         : `A fair coin is flipped ${trials} times`;
    return mk("Probability",
      `${thing}. What is the probability that the results are NOT all the same?`,
      simp(total - same, total),
      [simp(same, total),                    // the chance they ARE all the same
       simp(total - 1, total),               // took off only one way
       simp(1, total),
       simp(total - same, total - 1)],
      4, i);
  }

  /* Independent events, worked backwards to the missing one. */
  function probFindOtherIndependent(i) {
    const pool = [[0.4, 0.1, 0.25], [0.5, 0.2, 0.4], [0.8, 0.2, 0.25], [0.6, 0.3, 0.5],
                  [0.25, 0.1, 0.4], [0.5, 0.35, 0.7], [0.4, 0.3, 0.75], [0.8, 0.6, 0.75],
                  [0.2, 0.1, 0.5], [0.5, 0.1, 0.2], [0.4, 0.2, 0.5], [0.6, 0.15, 0.25],
                  [0.8, 0.4, 0.5], [0.5, 0.4, 0.8], [0.25, 0.2, 0.8], [0.6, 0.45, 0.75],
                  [0.2, 0.05, 0.25], [0.4, 0.16, 0.4], [0.5, 0.05, 0.1], [0.8, 0.16, 0.2]];
    const [pa, pab, pb] = pool[i % pool.length];
    return mk("Probability",
      `A and B are independent events. P(A) = ${fmt(pa)} and P(A and B) = ${fmt(pab)}. ` +
      `What is P(B)?`,
      `${fmt(pb)}`,
      /* Every candidate has to be a probability itself: pa + pab reached 1.4. */
      [`${fmt(+(pa * pab).toFixed(3))}`,     // multiplied instead of divided
       `${fmt(+(pa - pab).toFixed(3))}`,     // subtracted
       `${fmt(pa)}`, `${fmt(pab)}`,
       `${fmt(+(1 - pb).toFixed(3))}`],
      3 + (i % 2), i);
  }

  /* Three picks, nothing put back: three shrinking denominators. */
  function probThreeDrawsAllSame(i) {
    const r = 3 + axis(i, 0, 5), b = 2 + axis(i, 1, 5);
    const n = r + b;
    if (r < 3) return null;
    return mk("Probability",
      `A bag holds ${r} red and ${b} blue counters. Three are taken out at random without ` +
      `replacement. What is the probability that all three are red?`,
      simp(r * (r - 1) * (r - 2), n * (n - 1) * (n - 2)),
      [simp(r * r * r, n * n * n),           // treated the picks as independent
       simp(r * (r - 1) * (r - 2), n * n * n),
       simp(r * (r - 1), n * (n - 1)),       // stopped after two picks
       simp(3 * r, n * (n - 1) * (n - 2))],
      4, i);
  }

  /* "At least one" is the complement of "none at all". */
  /* `phrase` reads after "at least one", so it carries no article of its own. */
  const AT_LEAST_EVENTS = [
    { phrase: "6", miss: 5 },
    { phrase: "even number", miss: 3 },
    { phrase: "number greater than 4", miss: 4 },
    { phrase: "1 or 2", miss: 4 }
  ];

  function probAtLeastOneSix(i) {
    /* Several events, not just a six: two variants was not enough to fill a
       revision run once duplicates were dropped. */
    const ev = AT_LEAST_EVENTS[axis(i, 0, 4)];
    const rolls = 2 + (axis(i, 1, 4) % 2);   // same span, so genuinely independent
    const total = 6 ** rolls;
    const none = ev.miss ** rolls;
    return mk("Probability",
      `A fair die is rolled ${rolls} times. What is the probability of getting ` +
      `at least one ${ev.phrase}?`,
      simp(total - none, total),
      /* Each candidate is kept only while it is still a probability: adding the
         single chances gave 6/6 for "1 or 2" over three rolls, and
         (total - none)/none reached 3 for an even number. */
      [[none, total],                        // the chance of missing every time
       [6 - ev.miss, 6],                     // answered for one roll
       [(6 - ev.miss) * rolls, 6],           // added the single chances
       [total - none - 1, total],
       [none + 1, total]]
        .filter(([a, b]) => a > 0 && a < b)
        .map(([a, b]) => simp(a, b)),
      3 + (i % 2), i);
  }

  /* ═══════════════════ FROM question-bank/20260822 ═══════════════════
     Shapes the bank had no template for. The visual ones use js/diagrams.js
     the way the NVRT bank does: the figure carries the drawing and the options
     are the letters, so nothing new is needed in the renderer. */

  const LETTERS = ["A", "B", "C", "D", "E"];

  /* Which shape has BOTH a given number of lines of symmetry and a given order
     of rotational symmetry? Exactly one option may qualify, so the shapes that
     share the target - a rectangle and a rhombus both have 2 and 2 - must never
     appear together. */
  const SYMMETRY_TARGETS = [
    { lines: 2, order: 2, matches: ["rectangle", "rhombus"] },
    { lines: 1, order: 1, matches: ["kite", "isosceles trapezium", "isosceles triangle", "arrowhead"] },
    { lines: 4, order: 4, matches: ["square"] },
    { lines: 3, order: 3, matches: ["equilateral triangle"] },
    { lines: 0, order: 2, matches: ["parallelogram"] },
    { lines: 6, order: 6, matches: ["regular hexagon"] },
    { lines: 5, order: 5, matches: ["regular pentagon"] }
  ];
  const ALL_SHAPES = ["square", "rectangle", "rhombus", "parallelogram", "kite",
                      "isosceles trapezium", "equilateral triangle", "isosceles triangle",
                      "scalene triangle", "right-angled triangle", "regular pentagon",
                      "regular hexagon", "arrowhead", "L-shape"];

  function geoShapeFromSymmetry(i) {
    if (!D) return null;
    const target = SYMMETRY_TARGETS[i % SYMMETRY_TARGETS.length];
    const answerShape = target.matches[Math.floor(i / SYMMETRY_TARGETS.length) % target.matches.length];

    /* Anything else that also matches the target is barred, or the question
       would have two right answers. */
    const others = ALL_SHAPES.filter(n => !target.matches.includes(n));
    const chosen = [];
    for (let k = 0; chosen.length < 4 && k < others.length * 2; k++) {
      const cand = others[(i * 3 + k) % others.length];
      if (!chosen.includes(cand)) chosen.push(cand);
    }
    if (chosen.length < 4) return null;

    const slot = i % 5;
    const names = chosen.slice();
    names.splice(slot, 0, answerShape);
    return mkFig("Geometry",
      `A shape has ${target.lines} line${target.lines === 1 ? "" : "s"} of symmetry and ` +
      `rotational symmetry of order ${target.order}. Which of these shapes is it?`,
      `Shape ${LETTERS[slot]}`,
      LETTERS.filter((_, k) => k !== slot).map(L => `Shape ${L}`),
      3 + (i % 2), i, D.shapeChoices({ names }));
  }

  /* Naming triangles from their pictures, left to right. */
  const TRIANGLE_KINDS = ["equilateral", "isosceles", "scalene", "right-angled"];

  function geoNameTriangles(i) {
    if (!D) return null;
    /* A fixed rotation of the four names, so the order differs run to run. */
    const shift = i % 4;
    const kinds = TRIANGLE_KINDS.map((_, k) => TRIANGLE_KINDS[(k + shift) % 4]);
    const asList = arr => arr.join(", ");
    const wrongs = [
      [kinds[1], kinds[0], kinds[2], kinds[3]],
      [kinds[0], kinds[1], kinds[3], kinds[2]],
      [kinds[3], kinds[2], kinds[1], kinds[0]],
      [kinds[2], kinds[3], kinds[0], kinds[1]]
    ].map(asList).filter(t => t !== asList(kinds));
    if (wrongs.length < 3) return null;
    return mkFig("Geometry",
      `The four triangles above are numbered 1 to 4 from left to right. Which of these ` +
      `names them in the right order?`,
      asList(kinds), wrongs.slice(0, 3),
      3 + (i % 2), i, D.triangleRow({ kinds }));
  }

  /* A shape cut into equal triangles, some shaded. */
  function figShadedTriangles(i) {
    if (!D) return null;
    const total = 6 + (i % 7);
    const shaded = 1 + (i % (total - 2));
    if (shaded >= total) return null;
    return mkFig("Fractions",
      "What fraction of this shape is shaded? Give your answer in its simplest form.",
      simp(shaded, total),
      [simp(total - shaded, total),          // counted the unshaded triangles
       `${shaded}/${total}`,                 // right count, never cancelled
       simp(shaded + 1, total),
       simp(shaded, total + 1)],
      3, i, D.triangleStrip({ total, shaded }));
  }

  /* Two journeys on one pair of axes: how far apart at a given time. */
  function figTwoTravellersGraph(i) {
    if (!D) return null;
    const hours = 4;
    const fast = 15 + (i % 4) * 5, slow = 5 + (i % 3) * 5;
    if (fast === slow) return null;
    const at = 2 + (i % 2);
    const seriesA = Array.from({ length: hours + 1 }, (_, k) => [k, fast * k]);
    const seriesB = Array.from({ length: hours + 1 }, (_, k) => [k, slow * k]);
    const gap = (fast - slow) * at;
    return mkFig("Speed",
      `The graph shows two cyclists setting out from the same place along the same road. ` +
      `How many miles apart are they after ${at} hours?`,
      `${gap} miles`,
      [`${(fast + slow) * at} miles`,        // added the distances
       `${fast * at} miles`,                 // read only the faster one
       `${fast - slow} miles`,               // the gap after one hour
       `${gap + slow} miles`],
      4, i, D.distanceTimeTwo({ seriesA, seriesB, labelA: "Ann", labelB: "Ben" }));
  }

  /* The modal value read off a bar chart: the height that occurs most often. */
  function figBarChartMode(i) {
    if (!D) return null;
    const labels = ["Mar", "Apr", "May", "Jun", "Jul"];
    const mode = 20 + (i % 5) * 10;
    const others = [mode + 10, mode - 10, mode + 20].map(v => (v <= 0 ? mode + 30 : v));
    /* The modal value appears three times and nothing else more than once. */
    const values = [mode, others[0], mode, others[1], mode];
    if (new Set(others).size < 3) return null;
    return mkFig("Statistics",
      `The bar chart shows the number of customers each month. What is the modal number ` +
      `of customers?`,
      `${mode}`,
      [`${Math.max(...values)}`,             // the tallest bar
       `${Math.round(values.reduce((a, b) => a + b, 0) / values.length)}`,  // the mean
       `${values.slice().sort((a, b) => a - b)[2]}`,                        // the median
       `${others[0]}`],
      3, i, D.barChart({ labels, values, axisLabel: "Customers" }));
  }

  /* Counting square and cube numbers in a list, then combining the counts.
     1 is both, and is counted in both, which is the trap. */
  function numSquaresMinusCubes(i) {
    const squares = [4, 9, 16, 25, 36, 49, 64, 81, 100];
    const cubes = [8, 27, 64, 125];
    const plain = [10, 15, 20, 22, 29, 33, 40, 45, 50, 55];
    const sq = squares.filter((_, k) => (k + i) % 3 === 0).slice(0, 3);
    const cu = [cubes[i % cubes.length]];
    const filler = plain.filter((_, k) => (k + i) % 4 === 0).slice(0, 2);
    const list = [...new Set([1, ...sq, ...cu, ...filler])].sort((a, b) => a - b);

    /* Count from the finished list, never from the pieces it was built out of:
       1 is both a square and a cube, and so is 64, so adding up the parts
       double-counted and produced a difference that was not even prime. */
    const cubeRoot = n => Math.round(Math.cbrt(n));
    const nSquares = list.filter(n => isSquare(n)).length;
    const nCubes = list.filter(n => cubeRoot(n) ** 3 === n).length;
    const ans = nSquares - nCubes;
    if (ans < 2 || !isPrime(ans)) return null;
    return mk("Numbers",
      `Look at this list of numbers: ${list.join(", ")}. Subtracting the number of cube ` +
      `numbers in the list from the number of square numbers gives a prime number. ` +
      `What is that prime number?`,
      `${ans}`,
      [`${nSquares}`, `${nCubes}`, `${ans + 1}`, `${ans + 2}`],
      4, i);
  }


  /* Litres in, millilitres out: the conversion is the whole difficulty. */
  function meaPourFromContainer(i) {
    const litres = [0.5, 0.7, 0.8, 1.2, 1.5, 0.9][i % 6];
    const total = Math.round(litres * 1000);
    const poured = 125 + (i % 8) * 25;
    if (poured >= total) return null;
    const left = total - poured;
    return mk("Measurement",
      `A beaker holds ${fmt(litres)} litres of water. ${poured} ml is poured out of it. ` +
      `How much water is left in the beaker?`,
      `${comma(left)} ml`,
      [`${comma(total - poured * 2)} ml`, `${comma(poured)} ml`,
       `${comma(Math.round(litres * 100) - poured)} ml`,   // treated litres as 100 ml
       `${comma(left + 100)} ml`],
      3, i);
  }

  /* Three kinds in a box, a ratio across a different split, and a subtraction. */
  function ratThreeCategories(i) {
    const ratio = 3 + (i % 4);                   // without : with
    const total = (ratio + 1) * (6 + (i % 4));   // divides exactly
    const withNuts = total / (ratio + 1);
    const first = 5 + (i % 5), second = Math.floor(total / 2) - (i % 4);
    const third = total - first - second;
    const ans = third - withNuts;
    if (third <= 0 || ans <= 0 || withNuts >= third) return null;
    return mk("Ratio",
      `A box of ${total} chocolates holds white, dark and milk chocolates. Only the milk ` +
      `ones can contain nuts. There are ${ratio} times as many chocolates without nuts as ` +
      `with nuts. There are ${first} white and ${second} dark chocolates. How many milk ` +
      `chocolates in the box have no nuts?`,
      `${ans}`,
      [`${third}`,          // all the milk chocolates
       `${withNuts}`,       // the ones with nuts
       `${total - withNuts}`,
       `${ans + 1}`],
      4, i);
  }

  /* True or false about factors, odd, even and square numbers. */
  const FACTOR_CLAIMS = {
    true: [
      "Every number is a factor of itself.",
      "1 is a factor of every whole number.",
      "Square numbers always have an odd number of factors.",
      "Even numbers always have 2 as one of their factors.",
      "A prime number has exactly two factors.",
      "The factors of a number are never larger than the number itself."
    ],
    false: [
      "Even numbers only have even numbers as factors.",
      "Odd numbers only have odd numbers as factors.",
      "Every number has an even number of factors.",
      "A number always has more factors than the number before it.",
      "Prime numbers are all odd."
    ]
  };

  function numFactorStatements(i) {
    /* "Odd numbers only have odd factors" is in fact true, so it must not be
       offered as the false one - only the genuinely false claims are. */
    const wrong = FACTOR_CLAIMS.false.filter(c => !/^Odd numbers only/.test(c));
    const ans = wrong[i % wrong.length];
    const rights = [];
    for (let k = 0; rights.length < 3; k++) {
      const cand = FACTOR_CLAIMS.true[(i + k) % FACTOR_CLAIMS.true.length];
      if (!rights.includes(cand)) rights.push(cand);
      if (k > 20) break;
    }
    if (rights.length < 3) return null;
    return mk("Numbers",
      "Which one of these statements is FALSE?",
      ans, rights, 4, i);
  }

  /* Speed where the time is given in minutes, so it has to become hours first. */
  function spdSpeedFromMinutes(i) {
    const minutes = [12, 15, 20, 24, 30, 6, 10][i % 7];
    const speed = (60 + (i % 8) * 30);
    const distance = speed * minutes / 60;
    if (!Number.isInteger(distance)) return null;
    return mk("Speed",
      `A jet travels ${comma(distance)} km in ${minutes} minutes. What is its average speed?`,
      `${comma(speed)} km/h`,
      [`${comma(distance)} km/h`,                       // forgot to convert at all
       `${comma(Math.round(distance / minutes))} km/h`, // km per minute
       `${comma(speed / 2)} km/h`,
       `${comma(distance * minutes)} km/h`],
      3 + (i % 2), i);
  }

  /* Everyday quantities: is a banana 20 g, 200 g or 2 kg? */
  const ESTIMATES = [
    ["an unpeeled banana", "200 g", ["20 g", "600 g", "2 kg", "50 g"]],
    ["a full can of drink", "330 g", ["33 g", "3 kg", "10 g", "900 g"]],
    ["a bag of sugar", "1 kg", ["10 g", "100 g", "50 kg", "5 g"]],
    ["a large watermelon", "5 kg", ["500 g", "50 g", "50 kg", "5 g"]],
    ["a chicken egg", "60 g", ["6 g", "600 g", "6 kg", "2 kg"]],
    ["an adult bicycle", "12 kg", ["1 kg", "120 kg", "120 g", "500 g"]],
    ["a paperback book", "300 g", ["30 g", "3 kg", "30 kg", "3 g"]],
    ["a teaspoon of salt", "5 g", ["50 g", "500 g", "5 kg", "1 kg"]]
  ];

  function meaEstimateWeight(i) {
    const [thing, ans, wrong] = ESTIMATES[i % ESTIMATES.length];
    return mk("Measurement",
      `Which of these is the best estimate for the weight of ${thing}?`,
      ans, wrong.slice(0, 3), 3, i);
  }

  /* Cutting the corner off a regular polygon: what is left has one more side
     than a child expects, because the cut replaces one vertex with an edge. */
  /* Joining the two neighbours of one vertex removes that vertex and adds none,
     so the piece left always has one side fewer than the polygon. A square was
     wrongly listed as leaving a trapezium: it leaves a triangle, and that
     triangle is both isosceles and right-angled, so the square is left out
     rather than asked with two defensible answers. */
  const POLYGON_CUTS = [
    ["regular pentagon", 5, "isosceles trapezium"],
    ["regular hexagon", 6, "irregular pentagon"],
    ["regular heptagon", 7, "irregular hexagon"],
    ["regular octagon", 8, "irregular heptagon"]
  ];

  function geoSplitPolygon(i) {
    const [poly, , rest] = POLYGON_CUTS[i % POLYGON_CUTS.length];
    const wrong = ["isosceles triangle", "rectangle", "parallelogram", "rhombus",
                   "irregular pentagon", "isosceles trapezium", "irregular hexagon"]
      .filter(n => n !== rest);
    return mk("Geometry",
      `A ${poly} is cut into two pieces by a single straight line joining the two vertices ` +
      `either side of one corner. One piece is an isosceles triangle. What is the other piece?`,
      rest,
      [wrong[i % wrong.length], wrong[(i + 3) % wrong.length], wrong[(i + 5) % wrong.length]],
      4, i);
  }

  /* One of one thing and several of another: the trap is multiplying both. */
  function numMultiItemTotal(i) {
    const brush = 89 + (i % 8) * 10;             // pence
    const paints = 379 + (i % 6) * 50;
    const count = 2 + (i % 3);
    const total = paints + brush * count;
    return mk("Measurement",
      `A paintbrush costs ${fmtMoney(brush / 100)} and a set of paints costs ` +
      `${fmtMoney(paints / 100)}. Oliver buys one set of paints and ${count} paintbrushes. ` +
      `How much does he pay altogether?`,
      fmtMoney(total / 100),
      [fmtMoney((paints * count + brush * count) / 100),   // multiplied both
       fmtMoney((paints + brush) / 100),                   // only one brush
       fmtMoney((paints * count + brush) / 100),
       fmtMoney((total + brush) / 100)],
      3, i);
  }

  /* Inverse proportion from a table of settings: more power, less time. */
  function ratInverseTime(i) {
    const powers = [600, 650, 700, 750, 800, 900];
    const a = powers[i % powers.length];
    const b = powers[(i + 2 + (i % 3)) % powers.length];
    if (a === b) return null;
    const seconds = 60 + (i % 5) * 30;
    const needed = a * seconds;
    if (needed % b !== 0) return null;
    const ans = needed / b;
    return mk("Ratio",
      `A pudding needs ${seconds} seconds in ${article(`${a}`)} ${a} watt microwave. ` +
      `The same pudding needs the same total energy in any oven. How long should it be ` +
      `cooked in ${article(`${b}`)} ${b} watt microwave?`,
      `${ans} seconds`,
      [`${seconds} seconds`,                                  // ignored the change
       `${Math.round(seconds * b / a)} seconds`,              // scaled the wrong way
       `${ans + 10} seconds`,
       `${Math.round(seconds + (b - a) / 10)} seconds`],
      4, i);
  }

  /* ═══════════════════ HARDER SEQUENCES AND BIDMAS ═══════════════════
     These two topics had the thinnest top end in the bank: Sequences had two
     templates at Hard and BIDMAS two, against thirteen for Geometry. Parameters
     are taken off independent axes so each template yields tens of distinct
     questions rather than a handful, and each passes four or five candidate
     distractors so nudge() never has to invent one. */

  /* "n² + 3n − 2", with the coefficients that read as 1 or 0 left out. */
  const quadraticTerm = (a, b, c) => {
    const parts = [];
    parts.push(a === 1 ? "n²" : `${a}n²`);
    if (b) parts.push(`${b < 0 ? "− " : "+ "}${Math.abs(b) === 1 ? "n" : `${Math.abs(b)}n`}`);
    if (c) parts.push(`${c < 0 ? "− " : "+ "}${Math.abs(c)}`);
    return parts.join(" ");
  };

  /* The nth term of a sequence whose SECOND differences are constant. */
  function seqQuadraticNth(i) {
    const a = 1 + axis(i, 0, 3);              // second difference is 2a
    const b = axis(i, 1, 5) - 1;
    const c = axis(i, 2, 4) - 1;
    const term = n => a * n * n + b * n + c;
    const shown = [1, 2, 3, 4, 5].map(term);
    if (shown.some(v => v <= 0) || shown[0] === shown[1]) return null;
    const ans = quadraticTerm(a, b, c);
    const wrong = [quadraticTerm(a, b + 1, c), quadraticTerm(a + 1, b, c),
                   quadraticTerm(a, b, c + 1), quadraticTerm(a === 1 ? 2 : 1, b, c)]
      .filter(t => t !== ans);
    if (wrong.length < 3) return null;
    return mk("Sequences",
      `What is the nth term of this sequence?\n${shown.join(", ")}, ...`,
      ans, wrong.slice(0, 4), 4, i);
  }

  /* Which position holds a given value: the nth term run backwards. */
  function seqWhichTerm(i) {
    const first = 2 + axis(i, 0, 8), step = 3 + axis(i, 1, 7);
    const pos = 12 + axis(i, 2, 9) * 4;
    const value = first + (pos - 1) * step;
    return mk("Sequences",
      `A sequence starts ${first}, ${first + step}, ${first + 2 * step}, ${first + 3 * step}, ` +
      `and carries on in the same way. Which term is ${comma(value)}?`,
      `the ${pos}th term`,
      [`the ${pos + 1}th term`,              // forgot the sequence starts at term 1
       `the ${pos - 1}th term`,
       `the ${Math.round(value / step)}th term`,
       `the ${pos + 2}th term`],
      3 + (i % 2), i);
  }

  /* The sum of the first n terms, which is n lots of the average of the ends. */
  function seqArithSum(i) {
    const first = 1 + axis(i, 0, 9), step = 2 + axis(i, 1, 6);
    const n = 10 + axis(i, 2, 5) * 5;
    const last = first + (n - 1) * step;
    const total = n * (first + last) / 2;
    if (!Number.isInteger(total)) return null;
    return mk("Sequences",
      `A sequence starts ${first}, ${first + step}, ${first + 2 * step}, and goes up in ` +
      `${step}s. What is the total of its first ${n} terms?`,
      comma(total),
      [comma(n * last),                       // n lots of the last term
       comma(n * first),                      // n lots of the first
       comma(total - last),
       comma((first + last) / 2)],            // just the average
      4, i);
  }

  /* Triangular numbers, drawn as the papers draw them. */
  function seqTriangular(i) {
    if (!D) return null;
    const shown = 4 + (i % 2);                // how many patterns are pictured
    const want = 9 + axis(i, 1, 8);
    const tri = n => n * (n + 1) / 2;
    const ans = tri(want);
    return mkFig("Sequences",
      `The patterns above are made of dots. How many dots are in pattern ${want}?`,
      comma(ans),
      [comma(want * want),                    // squared instead
       comma(tri(want - 1)),                  // one pattern short
       comma(want * (want + 1)),              // forgot to halve
       comma(ans + want)],
      3 + (i % 2), i, D.dotTriangles({ upto: shown }));
  }

  /* Two sequences laid alternately in one list. */
  function seqInterleaved(i) {
    const oddStart = 1 + axis(i, 0, 5), oddStep = 2 + axis(i, 1, 4);
    const evenStart = 10 + axis(i, 2, 5) * 5, evenStep = 5 + axis(i, 0, 4) * 5;
    const at = k => (k % 2 === 1
      ? oddStart + ((k - 1) / 2) * oddStep
      : evenStart + (k / 2 - 1) * evenStep);
    const shown = [1, 2, 3, 4, 5, 6].map(at);
    const want = 9;
    const ans = at(want);
    if (new Set(shown).size !== shown.length) return null;
    return mk("Sequences",
      `Two sequences have been placed alternately in this list.\n${shown.join(", ")}, ...\n` +
      `What is the ${want}th number in the list?`,
      `${ans}`,
      [`${at(want + 1)}`,                     // read the other sequence
       `${ans + oddStep}`,
       `${at(want - 2)}`,
       `${ans - oddStep}`],
      4, i);
  }

  /* A rule that uses the term before it, with one term left out. */
  function seqRecurrenceMissing(i) {
    const mult = 2 + axis(i, 0, 2), add = 1 + axis(i, 1, 6);
    const start = 1 + axis(i, 2, 5);
    const terms = [start];
    for (let k = 1; k < 5; k++) terms.push(terms[k - 1] * mult + add);
    const hole = 2 + (i % 2);                 // index of the hidden term
    const shown = terms.map((v, k) => (k === hole ? "?" : `${v}`));
    const ans = terms[hole];
    return mk("Sequences",
      `In this sequence each term is ${mult === 2 ? "double" : `${mult} times`} the term ` +
      `before it, plus ${add}.\n${shown.join(", ")}\nWhat is the missing term?`,
      comma(ans),
      [comma(terms[hole - 1] * mult),         // forgot to add
       comma(terms[hole - 1] + add),          // forgot to multiply
       comma(terms[hole + 1] - add),
       comma(ans + add)],
      3 + (i % 2), i);
  }

  /* ── BIDMAS ── */

  /* A fraction bar groups everything above it and everything below it. */
  function bidFractionBar(i) {
    /* Build the top FROM the bottom so the division always comes out exactly;
       filtering for it instead threw away two seeds in three. */
    const c = 1 + axis(i, 0, 5), d = 1 + axis(i, 1, 5);
    const bottom = c + d;
    const ans = 2 + axis(i, 2, 9);
    const top = bottom * ans;
    const b = 2 + (i % (top - 2 > 1 ? Math.min(top - 2, 9) : 1));
    const a = top - b;
    if (a < 2 || b < 2) return null;
    return mk("BIDMAS",
      `What is the value of (${a} + ${b}) ÷ (${c} + ${d})?`,
      `${ans}`,
      /* Rounded, or these print as 23.666666666666668 beside a whole number and
         give the answer away by their shape alone. */
      [`${fmt(+(a + b / c + d).toFixed(2))}`,     // ignored both brackets
       `${fmt(+(a + b / (c + d)).toFixed(2))}`,   // ignored the first
       `${fmt(+((a + b) / c + d).toFixed(2))}`,   // ignored the second
       `${ans + 1}`, `${ans - 1}`],
      3 + (i % 2), i);
  }

  /* A square root and a power inside the same calculation. */
  function bidRootsAndPowers(i) {
    const roots = [[9, 16, 25], [16, 9, 25], [36, 64, 100], [25, 144, 169], [4, 21, 25]];
    const [p, q, sum] = roots[i % roots.length];
    if (p + q !== sum) return null;
    const power = 2 + axis(i, 1, 3);
    const base = 2 + axis(i, 2, 3);
    const ans = Math.sqrt(sum) + base ** power;
    return mk("BIDMAS",
      `What is the value of √(${p} + ${q}) + ${base}${power === 2 ? "²" : power === 3 ? "³" : `^${power}`}?`,
      `${comma(ans)}`,
      [`${comma(Math.sqrt(p) + Math.sqrt(q) + base ** power)}`,   // rooted each part
       `${comma(Math.sqrt(sum) + base * power)}`,                 // multiplied instead
       `${comma(Math.sqrt(sum + base ** power))}`,                // rooted the lot
       `${comma(ans + base)}`],
      4, i);
  }

  /* Three of these are equal; which is the odd one out? */
  function bidNotEqual(i) {
    const a = 2 + axis(i, 0, 5), b = 3 + axis(i, 1, 5), c = 2 + axis(i, 2, 4);
    const value = a * (b + c);
    const same = [`${a} × (${b} + ${c})`, `${a} × ${b} + ${a} × ${c}`, `(${b} + ${c}) × ${a}`];
    const odd = `${a} × ${b} + ${c}`;
    if (a * b + c === value) return null;      // it has to differ
    return mk("BIDMAS",
      "Three of these expressions have the same value. Which is the odd one out?",
      odd, same, 4, i);
  }

  /* Where the minus sign sits changes everything: −3² is not (−3)². */
  function bidNegativePower(i) {
    const a = 2 + axis(i, 0, 7), b = 2 + axis(i, 1, 6);
    if (a === b) return null;
    const ans = -(a * a) + b * b;
    return mk("BIDMAS",
      `What is the value of −${a}² + (−${b})²?`,
      `${ans}`,
      [`${a * a + b * b}`,                    // read both as positive
       `${-(a * a) - b * b}`,                 // read both as negative
       `${(a * a) - b * b}`,
       `${ans + 2 * a}`],
      3 + (i % 2), i);
  }

  /* Insert brackets into a four-term calculation to reach a target. */
  function bidBracketsFourTerms(i) {
    const a = 2 + axis(i, 0, 6), b = 1 + axis(i, 1, 6),
          c = 2 + axis(i, 2, 5), d = 1 + axis(i, 0, 5);
    const forms = [
      { text: `(${a} + ${b}) × (${c} + ${d})`, value: (a + b) * (c + d) },
      { text: `${a} + ${b} × (${c} + ${d})`,   value: a + b * (c + d) },
      { text: `(${a} + ${b} × ${c}) + ${d}`,   value: a + b * c + d },
      { text: `(${a} + ${b}) × ${c} + ${d}`,   value: (a + b) * c + d }
    ];
    const target = forms[0].value;
    /* Only one arrangement may reach the target, or there are two right answers. */
    if (forms.filter(f => f.value === target).length !== 1) return null;
    return mk("BIDMAS",
      `Where must the brackets go for this calculation to equal ${comma(target)}?\n` +
      `${a} + ${b} × ${c} + ${d}`,
      forms[0].text, forms.slice(1).map(f => f.text), 4, i);
  }

  /* ═══════════════════ HARDER DECIMALS AND RATIO ═══════════════════
     Both topics had three templates at Hard, against thirteen for Geometry.
     Nothing here repeats an existing template: decMultFactReuse already divides
     using a given fact, so the new one multiplies; ratAfterChange already
     changes both parts of a ratio, so the new one adds to just one; and
     ratRecipe already scales a recipe. */

  /* Multiplying or dividing by a tenth or a hundredth: the digits do not
     change, only where the point sits. */
  function decMultiplyBySmall(i) {
    const value = (12 + axis(i, 0, 40)) / 10 * (i % 2 ? 1 : 10);   // one or two dp
    const smalls = [0.1, 0.01, 0.001];
    const small = smalls[axis(i, 1, 3)];
    const divide = axis(i, 2, 2) === 0;
    const ans = divide ? value / small : value * small;
    const tidy = n => fmt(Number(n.toFixed(6)));
    if (`${tidy(ans)}`.replace(/[^0-9]/g, "").length > 7) return null;
    return mk("Decimals",
      `What is ${fmt(value)} ${divide ? "÷" : "×"} ${small}?`,
      tidy(ans),
      [tidy(divide ? value * small : value / small),   // shifted the wrong way
       tidy(value),                                    // did not shift at all
       tidy(ans * 10), tidy(ans / 10)],
      3 + (i % 2), i);
  }

  /* One list, three different notations: they have to be compared in a single
     form before any of them can be ordered. */
  function decOrderMixed(i) {
    const base = 55 + axis(i, 0, 35);                  // percent, 55..89
    const spread = [4, 6, 8, 11][axis(i, 1, 4)];
    const asPercents = [base, base + spread, base + 2 * spread, base + 3 * spread];
    if (asPercents.some(p => p >= 100)) return null;
    const forms = asPercents.map((p, k) => {
      if (k === 0) return { text: `${fmt(p / 100)}`, value: p };
      if (k === 1) return { text: `${p}%`, value: p };
      if (k === 2) return { text: `${fmt(p / 100)}`, value: p };
      return { text: `${p}%`, value: p };
    });
    const wantLargest = i % 2 === 0;
    const sorted = forms.slice().sort((a, b) => a.value - b.value);
    const ans = wantLargest ? sorted[sorted.length - 1] : sorted[0];
    const others = forms.filter(f => f.text !== ans.text).map(f => f.text);
    if (new Set(forms.map(f => f.text)).size !== 4) return null;
    return mk("Decimals",
      `Which of these is the ${wantLargest ? "largest" : "smallest"}?`,
      ans.text, others, 3 + (i % 2), i);
  }

  /* Which is better value: the comparison has to be made per gram, not per pack. */
  function decUnitPrice(i) {
    const gramsA = 100 * (2 + axis(i, 0, 4));
    const perHundredA = 40 + axis(i, 1, 30);           // pence per 100 g
    const gramsB = 100 * (3 + axis(i, 2, 5));
    const perHundredB = perHundredA + (i % 2 ? 6 : -6);
    if (gramsA === gramsB || perHundredB <= 0) return null;
    const costA = gramsA / 100 * perHundredA, costB = gramsB / 100 * perHundredB;
    const cheaper = perHundredA < perHundredB ? "A" : "B";
    const per = perHundredA < perHundredB ? perHundredA : perHundredB;
    return mk("Decimals",
      `Pack A holds ${comma(gramsA)} g and costs ${fmtMoney(costA / 100)}. ` +
      `Pack B holds ${comma(gramsB)} g and costs ${fmtMoney(costB / 100)}. ` +
      `Which is better value, and what does 100 g cost in that pack?`,
      `Pack ${cheaper}, at ${per}p per 100 g`,
      [`Pack ${cheaper === "A" ? "B" : "A"}, at ${perHundredA < perHundredB ? perHundredB : perHundredA}p per 100 g`,
       `Pack ${cheaper}, at ${per + 5}p per 100 g`,
       `Pack ${cheaper === "A" ? "B" : "A"}, at ${per}p per 100 g`,
       `Pack ${cheaper}, at ${per - 5 > 0 ? per - 5 : per + 10}p per 100 g`],
      3 + (i % 2), i);
  }

  /* A whole-number product handed over, and a decimal one asked for. */
  function decMultiplyGivenFact(i) {
    const a = 12 + axis(i, 0, 40), b = 14 + axis(i, 1, 30);
    const product = a * b;
    const shiftA = 1 + axis(i, 2, 2), shiftB = 1 + (i % 2);
    const da = a / 10 ** shiftA, db = b / 10 ** shiftB;
    const ans = product / 10 ** (shiftA + shiftB);
    const tidy = n => fmt(Number(n.toFixed(6)));
    return mk("Decimals",
      `Given that ${comma(a)} × ${comma(b)} = ${comma(product)}, what is ${fmt(da)} × ${fmt(db)}?`,
      tidy(ans),
      [tidy(ans * 10),                       // one place out
       tidy(ans / 10),
       comma(product),                       // ignored the decimal points
       tidy(ans * 100)],
      4, i);
  }

  /* Money shared out where the division does not come out evenly. */
  function decMoneySplit(i) {
    const people = 3 + axis(i, 0, 6);
    const pence = people * (120 + axis(i, 1, 60)) + (1 + axis(i, 2, 8));
    const each = Math.floor(pence / people);
    const over = pence - each * people;
    if (!over) return null;
    return mk("Decimals",
      `${fmtMoney(pence / 100)} is shared as equally as possible between ${people} people, ` +
      `in whole pence. How much is left over?`,
      `${over}p`,
      [`${people - over}p`, `${over + 1}p`, `${each}p`, `${people}p`],
      4, i);
  }

  /* ── Ratio ── */

  /* Three parts, not two: the number of shares is the sum of all three. */
  function ratThreePart(i) {
    const p = 1 + axis(i, 0, 5), q = 2 + axis(i, 1, 5), r = 3 + axis(i, 2, 4);
    const shares = p + q + r;
    const unit = 4 + (i % 9);
    const total = shares * unit;
    const askDifference = i % 2 === 0;
    const biggest = Math.max(p, q, r), smallest = Math.min(p, q, r);
    if (biggest === smallest) return null;
    const ans = askDifference ? (biggest - smallest) * unit : q * unit;
    return mk("Ratio",
      askDifference
        ? `${comma(total)} sweets are shared in the ratio ${p} : ${q} : ${r}. What is the ` +
          `difference between the largest share and the smallest share?`
        : `${comma(total)} sweets are shared in the ratio ${p} : ${q} : ${r}. How many are ` +
          `in the second share?`,
      comma(ans),
      /* Extra candidates so a collision between equal parts never falls through
         to an invented option. */
      [comma(total / shares),                // one share
       comma(askDifference ? biggest * unit : p * unit),
       comma(askDifference ? (biggest + smallest) * unit : r * unit),
       comma(ans + unit), comma(ans - unit), comma(total - ans)],
      3 + (i % 2), i);
  }

  /* A fraction of the whole, turned into a ratio of the two parts, or back. */
  function ratFractionOfWhole(i) {
    const part = 1 + axis(i, 0, 6), whole = part + 1 + axis(i, 1, 6);
    const other = whole - part;
    const g = gcd(part, other) || 1;
    const toRatio = i % 2 === 0;
    if (part >= whole) return null;
    return toRatio
      ? mk("Ratio",
          `In a class, ${part}/${whole} of the pupils are boys. What is the ratio of boys ` +
          `to girls, in its simplest form?`,
          `${part / g} : ${other / g}`,
          [`${part} : ${whole}`,             // boys to everyone, not to girls
           `${other / g} : ${part / g}`,     // the wrong way round
           `${part} : ${other + 1}`,
           /* When the ratio is 1 : 1 most of the candidates above collapse into
              each other, and nudge() invented "7 : 1". These two always differ. */
           `${whole} : ${part}`, `${part + 1} : ${other}`, `${whole} : ${other}`,
           `${part} : ${other + 2}`, `${part + 2} : ${other}`],
          3 + (i % 2), i)
      : mk("Ratio",
          `In a class the ratio of boys to girls is ${part / g} : ${other / g}. What ` +
          `fraction of the class are boys?`,
          simp(part, whole),
          [simp(part, other),                // boys over girls, not over the class
           simp(other, whole),
           simp(other, part),
           simp(part + 1, whole), simp(part, whole + 1), simp(whole, part + other)],
          3 + (i % 2), i);
  }

  /* Better value across different pack sizes, where neither is a round multiple. */
  function ratBestValue(i) {
    const unitPence = 7 + axis(i, 0, 9);
    const sizeA = 4 + axis(i, 1, 5), sizeB = sizeA + 2 + axis(i, 2, 4);
    const costA = sizeA * unitPence;
    const costB = sizeB * (unitPence - 1);                 // B is the better value
    if (unitPence <= 1) return null;
    return mk("Ratio",
      `A pack of ${sizeA} pens costs ${fmtMoney(costA / 100)} and a pack of ${sizeB} pens ` +
      `costs ${fmtMoney(costB / 100)}. How much cheaper is one pen from the better-value pack?`,
      `1p`,
      [`${unitPence}p`, `${unitPence - 1}p`, `2p`, `${sizeB - sizeA}p`],
      3 + (i % 2), i);
  }

  /* How much has to move from one side to the other to even them up. */
  function ratEqualise(i) {
    const each = 12 + axis(i, 0, 20);
    const gap = 2 * (1 + axis(i, 1, 8));                  // even, so it halves
    const a = each + gap / 2, b = each - gap / 2;
    if (b <= 0) return null;
    return mk("Ratio",
      `Amir has ${a} marbles and Beth has ${b}. How many must Amir give Beth so that they ` +
      `have the same number each?`,
      `${gap / 2}`,
      [`${gap}`,                             // moved the whole difference
       `${gap / 2 + 1}`,
       `${a - b + 1}`,
       `${Math.round(a / 2)}`],
      4, i);
  }

  /* Two ratios written differently: are they the same, and which is bigger? */
  function ratCompareTwoRatios(i) {
    const p = 2 + axis(i, 0, 5), q = 3 + axis(i, 1, 5);
    const k = 2 + axis(i, 2, 4);
    const equivalent = i % 2 === 0;
    const r = equivalent ? p * k : p * k + 1, s = q * k;
    const ans = equivalent ? "They are equivalent"
      : (p / q > r / s ? `${p} : ${q} is the larger` : `${r} : ${s} is the larger`);
    const others = ["They are equivalent",
                    `${p} : ${q} is the larger`,
                    `${r} : ${s} is the larger`].filter(t => t !== ans);
    if (others.length < 2) return null;
    return mk("Ratio",
      `Compare the ratios ${p} : ${q} and ${r} : ${s}. Which statement is true?`,
      ans, others.concat(["Neither can be compared"]),
      3 + (i % 2), i);
  }

  /* ═══════════════════ METHODS ═══════════════════
     The technique for each template, shown in the review when a child gets the
     question wrong. Keyed by generator name so the generators themselves stay
     untouched. Where a template has a well-known trap, the method names it —
     that is usually the whole lesson. A generator may also set q.explain itself
     to give a worked hint using the actual numbers; that wins over this. */
  const METHODS = {
    /* Numbers */
    figShadedFraction: "Count the shaded squares and the squares altogether, write one over the other, then cancel down by the highest common factor.",
    figBarChartTotal: "Read the height of every bar off the scale, then add them. Check what one gridline is worth first \u2014 it is not always 1.",
    figBarChartDifference: "Find the tallest and the shortest bar, read both off the scale, then subtract. Do not count the bars themselves.",
    figPictogram: "Check the key first to see what one symbol is worth, then multiply by the number of symbols in that row.",
    figPieChart: "A full circle is 360 degrees. Work out how many the whole chart represents per degree, then multiply by the angle of the sector you need.",
    figDistanceTimeStationary: "A flat, horizontal line means the distance is not changing, so the object is stopped. Read off where that line begins and ends.",
    figDistanceTimeSpeed: "Speed is the steepness of the line: the distance covered divided by the time taken. Read both off the axes for that section only.",
    figVennOnly: "The middle of the overlap counts for both groups. 'Only football' is the left part alone; 'football' altogether means the left part plus the overlap.",
    figCompoundPerimeter: "For area, take the missing corner away from the whole rectangle. For perimeter, notice the two new edges replace exactly the lengths they removed, so it equals the perimeter of the full rectangle.",
    figAnglesOnLine: "Angles on a straight line add to 180 degrees, so subtract the ones you are given from 180.",
    figAnglesAtPoint: "Angles meeting at a point add to 360 degrees, so subtract the ones you are given from 360.",
    figCoordinatesRead: "Read the across value first and then the up value: x before y. Going up before across is the usual mistake.",
    figCoordinatesMidpoint: "The midpoint is halfway in each direction, so average the two x values and average the two y values.",
    numRoundLargePlace: "Find the digit in the place you are rounding to, then look only at the digit immediately to its right. Everything after the rounding place becomes zero.",
    numDigitProductCount: "Find every set of three digits whose product is the target, then count how many orders each set can be written in. A set of three different digits gives 6 arrangements; two the same gives 3.",
    numClosestToTarget: "Work out the distance from the target for each option, ignoring whether it is above or below. The smallest distance wins, so -0.98 beats -0.91 when the target is -1.",
    algChainSubstitute: "Solve the second statement first to find y, then put that value into the first statement to get x. Do not try to do both at once.",
    algFunctionMachine: "Apply the operations in the order given, to each input separately. Multiplying first and then adding is not the same as adding first.",
    pctProfitAfterLoss: "Profit is money in minus money out. Work out the total spent on the whole batch, then the money taken from only the items actually sold.",
    pctProfitPerItem: "Divide the pack price by the number in the pack to find what one costs, then subtract that from the selling price.",
    meaFoldPaper: "Each fold halves the longer side, so after n folds it has been divided by 2 to the power n. Dividing by the number of folds is the usual mistake.",
    meaFrameWidth: "The frame adds its width twice to each dimension, so the outer perimeter is the picture's perimeter plus 8 frame widths. Subtract and divide by 8.",
    meaSquaresInRectangle: "Divide each side of the rectangle by the side of the square to see how many fit across and how many down, then multiply those two counts.",
    ratMapReverse: "This is the scale worked backwards, so divide the real distance by the number of kilometres each centimetre represents.",
    seqQuadraticDecreasing: "The gaps are growing while the terms fall. Find the differences, then the differences between those, and continue both patterns.",
    logTimeZone: "Add the difference if the second place is ahead, subtract it if behind. If you pass midnight, wrap around the 24-hour clock.",

    /* harder decimals and ratio */
    decMultiplyBySmall: "Multiplying by 0.1 makes a number ten times SMALLER, and dividing by 0.1 makes it ten times bigger. The digits never change - only where the point sits. Count the places: 0.01 is two, 0.001 is three.",
    decOrderMixed: "Put them all in one form before comparing. Percentages become decimals by moving the point two places left, so 88% is 0.88. Then compare place by place from the left.",
    decUnitPrice: "Work out what the same amount costs in each pack — per 100 g is easiest. Divide the price by the number of hundreds of grams. The bigger pack is not always the better value.",
    decMultiplyGivenFact: "Use the product you are given and then count decimal places. 4.7 has one and 0.41 has two, so the answer has three: 1927 becomes 1.927.",
    decMoneySplit: "Work in pence throughout. Divide to find the whole pence each, multiply back to see how much that used, and the rest is what is left over. The leftover is always less than the number of people.",
    ratThreePart: "Add all three parts to find how many shares there are, divide the total by that to get one share, then multiply. For the difference, use the largest part minus the smallest.",
    ratFractionOfWhole: "A fraction compares a part with the WHOLE; a ratio compares the two parts with each other. If 3/8 are boys then 5/8 are girls, so the ratio is 3 : 5 — not 3 : 8.",
    ratBestValue: "Find the cost of one item in each pack by dividing the price by how many are in it. Compare those, then take one from the other.",
    ratEqualise: "Only half the difference has to move. Giving away the whole difference overshoots and leaves the other person ahead by the same amount.",
    ratCompareTwoRatios: "Turn each ratio into a single number by dividing the first part by the second, then compare. Or scale both ratios so one side matches, and look at the other side.",

    /* harder sequences and BIDMAS */
    seqQuadraticNth: "The differences are not constant, so look at the differences BETWEEN the differences. That second difference is twice the number in front of n squared. Then work out the rest by putting n = 1 into what you have so far.",
    seqWhichTerm: "Find the rule first, then run it backwards. Take the first term off the value, divide by the step, and add 1 back on because the first term is term 1, not term 0.",
    seqArithSum: "Do not add them one at a time. Pair the first term with the last: every such pair makes the same total, and there are half as many pairs as terms. So the sum is the number of terms times the average of the two ends.",
    seqTriangular: "Each pattern adds one more row than the last, so pattern n has 1 + 2 + ... + n dots. That total is n × (n + 1) ÷ 2 — do not forget to halve.",
    seqRecurrenceMissing: "Apply the rule to the term just before the gap: multiply first, then add. Doing only one of the two steps is the usual slip.",
    seqInterleaved: "There are two sequences here, not one. Read every other number: the 1st, 3rd, 5th belong together and the 2nd, 4th, 6th belong together. Work out which one the position you want falls in.",
    bidFractionBar: "A bracket, or a fraction bar, means work that part out completely first. Add the top, add the bottom, then divide — never divide before adding.",
    bidRootsAndPowers: "The root sign is a bracket: add what is under it before rooting. Roots and powers both come before adding, so do them, then add. The square root of a sum is not the sum of the square roots.",
    bidNotEqual: "Work every option out fully before comparing. Multiplying out a bracket gives the same answer as the bracket did, so the odd one out is usually the one missing its bracket.",
    bidNegativePower: "Where the minus sign sits changes everything. − 3² means take 3 squared and make it negative, so −9; but (−3)² means −3 times −3, which is +9.",
    bidBracketsFourTerms: "Work out what each arrangement of brackets would give, then match against the target. Brackets change which operation happens first, and only one placement hits the number.",

    /* question-bank/20260822 */
    geoShapeFromSymmetry: "Test both properties, not just one. Lines of symmetry are mirror lines; the order of rotational symmetry is how many times the shape looks the same in a full turn. A rectangle has 2 and 2; a square has 4 and 4; a parallelogram has 0 lines but order 2.",
    geoNameTriangles: "Compare the sides and the angles. Equilateral has three equal sides, isosceles exactly two, scalene none. A right-angled triangle is marked with a small square at the corner — and it is scalene as well unless two sides match.",
    geoSplitPolygon: "Joining the two corners either side of one vertex cuts that vertex off, so the piece left has one side fewer than the shape started with. A pentagon leaves a four-sided shape, a hexagon leaves a five-sided one.",
    figBarChartMode: "The mode is the value that comes up most often, not the tallest bar and not the average. Read every bar off the scale, then look for the height that repeats.",
    numSquaresMinusCubes: "Go through the list twice, once for each kind. Remember 1 is both a square number and a cube number, and 64 is too, so those get counted in both lists.",
    numFactorStatements: "Try each claim on a small number before believing it. 6 is even but has 3 as a factor, which kills \"even numbers only have even factors\"; and every number has 1 as a factor.",
    meaPourFromContainer: "Put both amounts in the same unit before subtracting. 1 litre is 1,000 ml, so 0.7 litres is 700 ml — not 70 and not 7.",
    meaEstimateWeight: "Compare against something you have held. A bag of sugar is 1 kg, a can of drink about 330 g, an egg about 60 g. Then pick the option nearest in size.",
    numMultiItemTotal: "Only the item bought several times gets multiplied. Work out that part first, then add the single item once.",
    ratThreeCategories: "Two separate splits are going on. The ratio tells you how many have nuts out of the whole box; the counts tell you how many are milk. Take the first from the second.",
    ratInverseTime: "More power means less time, so this is inverse proportion. Multiply the watts by the seconds to get the energy, then divide by the new wattage.",
    spdSpeedFromMinutes: "Speed per hour needs the time in hours. Divide the minutes by 60 first: 12 minutes is 0.2 hours, so 120 km in 12 minutes is 120 ÷ 0.2 = 600 km/h.",
    figTwoTravellersGraph: "Read both lines at the time you are asked about, then subtract. Adding them gives the total distance travelled, which is not the gap between them.",
    figShadedTriangles: "Count the shaded triangles and the triangles altogether, write one over the other, then cancel down. Every triangle is the same size, so counting is enough.",

    /* Counting Principle, and the harder probability work */
    countArrangeNoRepeat: "Fill the places one at a time and multiply. With nothing reused the choices shrink by one each time: 6 digits into 4 places is 6 × 5 × 4 × 3 = 360, not 6 to the power 4.",
    countArrangeFirstRestrict: "Deal with the restricted place first. The leading digit has one fewer choice because 0 is barred, then the remaining places draw from everything left including 0: 6 x (6 x 5 x 4).",
    countEvenNoRepeat: "An even number must end in an even digit, so fill the units place first: count the even digits available, then arrange the rest into the places in front.",
    countGreaterThan: "Only the leading digit decides whether the number clears the threshold. Count how many digits are big enough, then arrange the others freely behind it.",
    countPlateLettersDigits: "Take the two rules separately and multiply the results. Letters that may repeat keep all 26 choices every time; digits that may not lose one each time.",
    countChooseCommittee: "Order does not matter, so count the arrangements and then divide by the number of ways the chosen group could itself be ordered: 8 x 7 x 6 for three places, divided by 3 x 2 x 1.",
    countHandshakes: "Every handshake involves two people, so n x (n - 1) counts each one twice - once from each end. Halve it: n(n - 1) / 2.",
    countWordRepeatedLetters: "Start with the arrangements of all the letters, then divide by the arrangements of each repeated letter among itself. BANANA is 6! divided by 3! for the As and 2! for the Ns, giving 60.",
    countCircular: "Round a table there is no first seat, so fix one person and arrange the rest relative to them: (n - 1)! rather than n!.",
    countGridPaths: "Every route uses the same moves in a different order, so it is a choosing question: out of all the moves, choose which ones go right. 3 right and 2 down is 5 moves, choose 2, which is 10.",
    probTwoSameColour: "Multiply the two picks, but the bag has changed in between: one fewer of that colour on top and one fewer counter altogether underneath.",
    probOneOfEach: "Red then blue and blue then red are both 'one of each', so work out one order and double it.",
    probConditionalSecond: "The first pick has already happened, so start from the bag as it is now: one fewer red and one fewer counter altogether.",
    probTwoWayTable: "Split the group into the four boxes before you start. The glasses-wearers who are boys are the glasses-wearers minus the girls among them; that count goes over the whole class.",
    probTwoSpinnersSum: "The total number of outcomes is the two spinners multiplied. Then list the pairs that make the target and count them - do not guess that there is only one.",
    probAddToTarget: "Work backwards. Adding x reds makes the probability (r + x) over (total + x); set that equal to the target fraction and solve for x. Cross-multiplying is quickest.",
    probNotAllSame: "Go at it backwards: there are only two ways they can all match, all heads or all tails. Take those off the total and the rest is your answer.",
    probFindOtherIndependent: "For independent events P(A and B) = P(A) x P(B), so P(B) is P(A and B) divided by P(A). Dividing, not subtracting.",
    probThreeDrawsAllSame: "Three picks, and the bag shrinks at every one: r/(n) x (r-1)/(n-1) x (r-2)/(n-2). Both the top and the bottom come down by one each time.",
    probAtLeastOneSix: "'At least one' is much quicker backwards. The chance of no six in one roll is 5/6, so for n rolls it is (5/6) to the power n. Take that from 1.",

    /* August QE/EPP papers */
    geoCompassTurn: "The eight compass points are 45° apart, so one right angle is two points round. Count that many points in the direction of the turn, wrapping past north.",
    geoCompassAngle: "Count the points between the two directions, then multiply by 45°. Going the short way round is always 4 points or fewer.",
    geoParallelogramVertex: "In a parallelogram ABCD the diagonals cross at the same midpoint, so D = A + C − B. Add A and C, then take B away, one coordinate at a time.",
    geoTriangleInequality: "The two shorter sides added together must be longer than the longest side. If they are equal or shorter the shape collapses flat.",
    geoSymmetryCombined: "Work out each shape separately first. Square 4, rectangle 2, rhombus 2, kite 1, parallelogram 0, equilateral triangle 3, isosceles triangle 1, and a regular polygon has as many as it has sides.",
    geoSymmetryLetters: "Picture a mirror straight down the middle of each letter. A, H, I, M, O, T, U, V, W, X and Y match; B, C, D, E and K have a line across instead, not down.",
    geoPolygonMissingAngle: "The interior angles still add to (sides − 2) × 180° — 540° for a pentagon, 720° for a hexagon. A reflex angle is no exception, so add what you are given and subtract from the total.",
    geoTransformCompose: "Do the two steps in the order written. Move the point first, then rotate that new position — rotating first lands somewhere else.",
    logClockReflexAngle: "Find the smaller angle first: the minute hand is at 6° a minute and the hour hand at 30° an hour plus 0.5° a minute. The reflex angle is 360° minus that.",
    algPowerEquation: "Ask how many times the base multiplies by itself to reach the total. Keep doubling or tripling and count the steps: 2, 4, 8, 16, 32, 64 is six steps, so x = 6.",
    algRemainderDivisor: "Turn it back into a multiplication: total = N × quotient + remainder. Take the remainder off the total, then divide by the quotient.",
    algInequalityInteger: "Only one multiple of the number in front of y sits between the two ends. Find it, then divide by that number.",
    algExpressionChange: "Change = what you handed over − what you spent, so put the money in first. Work in pence throughout: £20 is 2,000p, not 20.",
    numWordsToDigits: "Write the thousands, then fill every column down to the units. \"and forty-two\" means the hundreds column is empty, so it needs a nought as a place holder.",
    statMedianAngleTriangle: "The other two angles add to 180° minus the one you are given, and they are different, so the larger of them — the median — must be more than half that remainder and less than all of it.",
    fracOfCapacity: "Work out how much is actually in the bottle first, then take the fraction of that amount \u2014 not of the bottle's full capacity.",
    numPlaceValue: "Name the column the digit sits in — units, tens, hundreds, thousands — then multiply the digit by that column's value.",
    numPlaceValueDiff: "Work out what each of the two digits is worth on its own, then subtract the smaller from the larger. Don't subtract the digits themselves.",
    numRounding: "Look only at the digit immediately to the right of the place you are rounding to. 5 or more rounds up, 4 or less rounds down.",
    numRoundingBounds: "Work backwards. The smallest number is half a unit below the rounded value; the largest is just under half a unit above it.",
    numIsPrime: "A prime has exactly two factors, 1 and itself. Test each option against 2, 3, 5 and 7 — if none divide in, it is prime.",
    numLCM: "Either list the multiples of the larger number until the smaller divides in, or use LCM = (a × b) ÷ HCF, which is far quicker for big numbers.",
    numHCF: "List the factors of both numbers and take the largest they share. Or split each into primes and multiply the primes they have in common.",
    numHCFofFour: "Find the HCF of the first two, then the HCF of that answer with the third, and so on. Working in pairs keeps it manageable.",
    numPowers: "A small raised number tells you how many times to multiply the number by itself — 9² means 9 × 9, not 9 × 2.",
    numFactorCount: "Split the number into prime factors, add 1 to each index and multiply those together — 36 = 2² × 3² gives 3 × 3 = 9 factors. Pairing up from 1 is a good check on small numbers.",
    numPrimeFactorCount: "The index tells you how many times that prime appears. Add the indices together to count the prime factors including repeats.",
    numArithmetic: "Set the calculation out in columns, keeping place values lined up, and work one column at a time.",
    numWordProblem: "Decide what one lot is worth, then multiply by how many lots there are.",
    numBusLCM: "They meet again after the lowest common multiple of the three intervals. Find the LCM of two, then bring in the third.",
    numSmallestEvenFromDigits: "For the smallest number, put the smallest digits at the front — but an even number must end in an even digit, so reserve one for the units column first.",
    numCubeMissing: "You need the number that multiplies by itself three times to give the total — the cube root. Try small numbers: 3 × 3 × 3 = 27.",
    numPrimeSumSquare: "List the primes in the range, then test pairs. Only a few sums are square numbers, so check each sum against 4, 9, 16, 25, 36…",
    numFourConsecOdd: "Consecutive odd numbers rise by 2. Divide the total by how many there are to find the middle, then step out from there.",
    numCompareExpressions: "Work every option out fully before comparing. A fraction of a big number can easily beat a percentage of a small one.",
    numRemainderPuzzle: "A number leaving remainder 1 for all three divisors is one more than a common multiple. Find the LCM, then add 1.",
    numLastDigitPower: "Last digits repeat in a short cycle. Work out the first four or five powers, spot the cycle length, then find where the exponent lands in it.",

    /* Decimals */
    decAdd: "Line the decimal points up underneath each other before adding, filling empty places with zeros.",
    decSubtract: "Line the decimal points up and pad the shorter number with zeros so both have the same number of decimal places.",
    decMultiply: "Ignore the decimal point and multiply as whole numbers. Then count the decimal places in the question and put that many into the answer.",
    decDivide: "Keep the decimal point in the answer directly above the point in the number you are dividing, then divide as usual.",
    decCompare: "Compare place by place from the left — tenths first, then hundredths. More digits does not mean a bigger number.",
    decRound: "Count decimal places from the point, then look at the next digit along to decide whether to round up.",
    decToFrac: "Write the digits over 10, 100 or 1000 depending on how many decimal places there are, then cancel down.",
    decHalfway: "The halfway value is the two numbers added together and divided by 2.",
    decMultFactReuse: "Use the fact you are given. Compare it with what is asked and adjust by powers of ten — you should not need to calculate from scratch.",
    decPriceChange: "Apply the changes one after the other. A rise then a fall of the same percentage does not return you to the start, because the second is taken from a different amount.",
    decDivideByDecimal: "Dividing by a number below 1 makes the answer bigger. Multiply both numbers by 10, 100 or 1000 until the divisor is whole, then divide.",
    decChainedOf: "Work left to right, one step at a time. 'Of' means multiply.",

    /* Fractions */
    fracAdd: "Make the denominators the same, add only the numerators, then cancel down.",
    fracSubtract: "Make the denominators the same, subtract only the numerators, then cancel down.",
    fracMultiply: "Multiply the numerators together and the denominators together. Cancel before multiplying if you can — it keeps the numbers small.",
    fracDivide: "Turn the second fraction upside down and multiply. Keep, flip, multiply.",
    fracSimplify: "Divide the top and the bottom by their highest common factor.",
    fracImproperToMixed: "Divide the top by the bottom. The whole-number part is the answer to the division; the remainder stays over the same denominator.",
    fracOfX: "'Of' means multiply. Divide by the denominator to find one part, then multiply by the numerator.",
    fracMixedMultiply: "Turn both mixed numbers into improper fractions first, then multiply and simplify. Do not multiply the whole numbers separately.",
    fracOfFrac: "A fraction of a fraction means multiply the two together — the answer is smaller than either of them.",
    fracReverseTwoStage: "Work backwards. Decide what fraction of the whole is left after both removals, then scale that back up to find the total.",
    fracOfRemainderMoney: "The second fraction is taken from what was left, not from the original amount. Work backwards one stage at a time.",
    fracBetweenTwo: "Put both fractions over a common denominator so you can see the gap, then find one that sits inside it. 'Between' does not include the two ends.",

    /* Percentages */
    pctOf: "Find 10% by dividing by 10, or 1% by dividing by 100, then build the percentage you need from those.",
    pctFracToPct: "Divide the top by the bottom to get a decimal, then multiply by 100.",
    pctDecToPct: "Multiply by 100 — the digits stay the same, the point moves two places right.",
    pctSalePrice: "Either find the discount and subtract it, or go straight to what is left: 30% off means paying 70%.",
    pctIncrease: "Find the increase and add it on, or multiply by 1 plus the percentage as a decimal.",
    pctSimpleInterest: "Simple interest is the same each year. Find one year's interest, then multiply by the number of years.",
    pctReverse: "Work back to 100%. If you know what 10% is worth, multiply by 10; if you know 1%, multiply by 100.",
    pctChained: "Apply each percentage in turn to the answer before it. You cannot add the percentages together.",
    pctSaleChange: "Three steps: take the discount off each price, add the totals, then subtract from the money handed over.",
    pctVennNeither: "Add the two groups, then subtract the overlap once — it was counted twice. Take that total from 100% to find those in neither.",

    /* BIDMAS */
    bidSimple: "Multiply and divide before you add and subtract, whatever order they appear in.",
    bidBrackets: "Work out the brackets first, then the rest.",
    bidPowers: "Powers come after brackets but before multiplying and dividing. Square the number first.",
    bidMixed: "Brackets, Indices, Division and Multiplication, then Addition and Subtraction — and left to right within each pair.",
    bidNegative: "Do the multiplication first. Two negatives multiplied give a positive; a negative and a positive give a negative.",
    bidTempChange: "The size of the drop = starting temperature − finishing temperature. Subtracting a negative adds it, so a drop from 12°C to −11°C is 12 − (−11) = 12 + 11 = 23°C.",
    bidNestedBrackets: "Start with the innermost bracket and work outwards, dealing with the power before you divide.",
    bidMissingOperator: "Test each pair of operations, remembering that × and ÷ are done before + and −. Only one pair gives the target.",
    bidInsertBrackets: "Work out what each bracket position would give, then match against the target. Brackets change which operation happens first.",

    /* Algebra */
    algSubLinear: "Replace the letter with its value, then work the arithmetic out in BIDMAS order.",
    algSubMulti: "Substitute every letter before calculating, and keep the signs — subtracting a negative adds.",
    algSubQuadratic: "Square the value first, then multiply by the number in front. With a negative value, the square is positive.",
    algSolve1Step: "Do the opposite operation to both sides to get the letter on its own.",
    algSolve2Step: "Undo the addition or subtraction first, then undo the multiplication or division.",
    algSolveBothSides: "Collect the letters on one side and the numbers on the other, doing the same thing to both sides each time.",
    algSimplifyTerms: "Only collect terms with the same letter. The a terms and the b terms stay separate.",
    algCustomOp: "The definition tells you what to do. Substitute the two values into the pattern exactly as written.",
    algWeightPair: "Subtract the difference from the total and halve it to find the lighter one, then add the difference back for the heavier.",
    algTriangleAngles: "Turn each sentence into an equation, remembering the three angles add to 180°, then solve.",
    algThreeItemPricing: "Add all three statements. Each item appears three times, so dividing the total by 3 gives the price of one of each.",
    algSimultaneous: "Match the coefficients of one letter, then add or subtract the equations to remove it. Solve for what is left, then substitute back.",

    /* Sequences */
    seqArithNext: "Find the difference between terms and continue it.",
    seqArithNth: "The nth term is the first term + (n − 1) × the common difference. So the 20th term of a sequence starting at 5 going up in 3s is 5 + 19 × 3 = 62 — no need to write out all twenty.",
    seqArithNthFormula: "The number in front of n is the common difference. Then work out what to add or subtract to make the first term come out right.",
    seqFibLike: "Each term is the two before it added together.",
    seqGeomNext: "Divide one term by the one before to find what it is being multiplied by, then multiply on.",
    seqBallPattern: "Find how many are added each time, then use the first term plus that many steps — not the pattern number multiplied.",
    seqMatchstickNth: "The number in front of n is how many are added for each new pattern. Then adjust so pattern 1 comes out right.",
    seqQuadraticNext: "The differences are not constant, so look at the differences between the differences. Continue that, then work back up.",
    seqNthFromTwoTerms: "Divide the gap between the two values by the gap between their positions to get the common difference, then work back to the first term.",
    seqFibMissingStart: "Work backwards with two subtractions, not one. The 4th minus the 3rd gives the 2nd term; then the 3rd minus that 2nd gives the 1st. One subtraction only gets you as far as the 2nd term.",

    /* Ratio */
    ratSimplify: "Divide both sides by their highest common factor.",
    ratSplit: "Add the parts to find how many there are altogether, divide the total by that to get one part, then multiply out.",
    ratWordTotal: "Add the ratio parts to find the total number of shares, find what one share is worth, then multiply by the shares you were asked for.",
    ratDifference: "The difference in the ratio parts matches the difference given. Find one share from that, then use it for whatever the question asks.",
    ratRecipe: "Scale by the same factor throughout. Find the amount for one person if that makes the numbers easier.",
    ratMapScale: "Multiply the map measurement by the scale to get the real length, keeping the units straight.",
    ratInverseProp: "More workers means less time, so this is inverse. Find the total work first — workers × time — then divide by the new number of workers.",
    ratChained: "Scale both ratios so the shared quantity has the same number in each, then read the two outer numbers off and simplify.",
    ratAfterChange: "Write the original amounts as a multiple of the ratio parts, form an equation from the new ratio, and solve for the multiplier.",

    /* Speed */
    spdFindSpeed: "Speed is distance divided by time.",
    spdFindDistance: "Distance is speed multiplied by time.",
    spdFindTime: "Time is distance divided by speed.",
    spdMphHoursMin: "Turn the minutes into a fraction of an hour before multiplying — 30 minutes is 0.5 hours, not 0.3.",
    spdGapBetweenTwo: "Work out where each one is after the time given, then subtract the two positions.",
    spdAverageTwoLegs: "Average speed is the total distance divided by the total time, never the average of the two speeds. Find the time for each leg, add them, then divide the whole distance by that.",
    spdCatchUp: "Find the head start in distance, then divide by the difference in the two speeds — that is how fast the gap closes.",
    spdMeetingPoint: "Travelling towards each other, they close the gap at the sum of their speeds. Find the time to meet, then multiply by one speed to see how far that one went.",

    /* Measurement */
    meaUnitConvert: "Decide whether the new unit is bigger or smaller, then multiply or divide by the right power of ten. Check the answer looks sensible.",
    meaAreaPerim: "Perimeter is the distance all the way round; area is the space inside. Add for perimeter, multiply for area.",
    meaVolumeCube: "Volume of a cube is the side length multiplied by itself three times.",
    meaTempDiff: "Difference = warmer − colder. Subtracting a negative adds it, so 5 − (−3) becomes 5 + 3 = 8. Counting up to zero and on past it gives the same answer, but the subtraction is quicker and does not slip.",
    meaInchConvert: "Convert in the order the question sets out, one unit at a time, and check what unit the answer is wanted in.",
    meaMoneyChange: "Work out each amount, add them, then subtract from the money handed over. Keep everything in the same units.",
    meaOverlapArea: "Add both rectangles, then subtract the overlap once — it was counted twice, once in each rectangle.",
    meaCompoundVolume: "Find the cross-sectional area first by subtracting the cut-out from the whole rectangle, then multiply by the length.",
    meaSurfaceAreaFromVolume: "Use the volume to find the missing length, then add up the areas of all six faces.",
    meaScaleArea: "Lengths scale by the factor, but areas scale by the factor squared. Multiplying the area by the factor once is the usual mistake.",

    /* Geometry */
    geoAngleSum: "The angles in a triangle add to 180°, and in a quadrilateral to 360°.",
    geoAngleType: "Acute is under 90°, right is exactly 90°, obtuse is between 90° and 180°, reflex is over 180°.",
    geoShapeAngle: "For a regular polygon, the interior angles add to (sides − 2) × 180°, then divide by the number of sides.",
    geoComplementary: "Angles round a point add to 360°, and angles on a straight line add to 180°. Subtract what you know.",
    geoTriangleArea: "Area of a triangle is base × height ÷ 2. Forgetting to halve is the usual slip.",
    geoLinesSymmetry: "A regular polygon with n sides has exactly n lines of symmetry, and a circle has infinitely many. For irregular shapes, test each fold: a rectangle has 2, a parallelogram none, a kite 1.",
    geoRotSymmetry: "Count how many times the shape looks the same in one full turn. For a regular polygon it equals the number of sides.",
    geoPrismFEV: "Use the formulas for an n-gonal prism: faces F = n + 2, edges E = 3n, vertices V = 2n. Counting only works for small bases.",
    geoCuboidMissingEdge: "Volume is length × width × height, so divide the volume by the two edges you know.",
    /* geoRotationCoords and geoPrismFEV build their own explain, because a
       worked substitution beats a general sentence. These entries are the
       fallback if that ever stops happening, so they must not drift. */
    geoRotationCoords: "About the centre (h, k): anticlockwise sends (x, y) to (−(y − k) + h, (x − h) + k); clockwise sends it to ((y − k) + h, −(x − h) + k). Take the centre off, swap the two, negate the first for anticlockwise or the second for clockwise, then add the centre back.",
    geoShapeProperty: "Check each statement against the shape one at a time. The question asks which is NOT true, so three will be correct.",
    geoShapeSplit: "Picture the cut. Count the sides of the piece that is left and check whether any are parallel or equal.",
    geoPolygonFromAngleSum: "The angles add to (sides − 2) × 180°, so divide the total by 180 and add 2.",
    geoShadedArea: "Find the whole area, find the area cut out, then subtract. Remember the triangle needs halving.",

    /* Statistics */
    statMean: "Add all the values and divide by how many there are.",
    statMedian: "Put the values in order first, then take the middle one. With an even count, average the middle two.",
    statMode: "The mode is the value that appears most often. It is not the middle and not the average.",
    statRange: "Range is the largest value minus the smallest.",
    statMissingMean: "Multiply the mean by how many values there are to get the total, then subtract the values you know.",
    statFreqMidpoint: "The midpoint is the two class boundaries added together and halved.",
    statPieAngle: "A full circle is 360°, so divide 360 by the number of equal sectors.",
    statPictogram: "Work out what one symbol stands for first, then multiply by the number of symbols.",
    statCorrelation: "Positive correlation means both rise together; negative means one rises as the other falls.",
    statPieFromAngle: "Find how many the sector represents per degree, then multiply by the angle you are asked about.",
    statFreqTotal: "Multiply each value by how many times it occurred, then add those products. Adding the frequencies alone counts children, not items.",
    statMeanOfFactors: "List the factors in pairs so none are missed, add them, then divide by how many there are.",
    statCombinedMean: "Turn each mean back into a total, add the totals, then divide by the combined number. Averaging the two means only works if the groups are the same size.",
    statMedianFromFreq: "Add the frequencies to find how many there are, work out the middle position, then count through the table until you reach it.",

    /* Probability */
    probBagPick: "Probability is the number of ways you want over the total number of ways.",
    probDie: "List which of the six faces count, then put that over 6.",
    probCoin: "A fair coin has two equally likely results.",
    probComplement: "The chance of something not happening is 1 minus the chance that it does.",
    probExpected: "Multiply the probability by the number of trials.",
    probIndependent: "For both to happen, multiply the two probabilities together.",
    probWithoutReplacement: "The first pick changes what is left, so the second fraction has a smaller total underneath. Multiply the two fractions.",
    probTwoDiceSum: "There are 36 equally likely pairs, and the number giving a total t is 6 − |7 − t| — most ways for 7, fewest for 2 and 12. Put that count over 36 and cancel.",
    probAtLeastOne: "'At least one' is easier backwards: find the chance of none, then subtract from 1.",

    /* Logic */
    logConsecutiveIntSum: "Divide the total by how many numbers there are to find the middle, then step out either side.",
    logConsecutiveEvenSum: "Consecutive even numbers rise by 2. Divide the total by how many there are to find the middle one.",
    logConsecutiveOddPuzzle: "Call the smaller number n, write the larger as n + 2, turn the sentence into an equation and solve.",
    logPalindromeYesNo: "Read the digits backwards and compare with the original.",
    logNextPalindrome: "Count upwards, checking each number reads the same both ways. Fixing the first digits and mirroring them is quicker.",
    logSquarePalindromesInRange: "List the square numbers in the range first, then test each one for reading the same backwards.",
    logDayOfWeek: "Days repeat every 7. Divide by 7 and use only the remainder to count forward.",
    logDayWeeksAgo: "Whole weeks land on the same day, so only the extra days shift it.",
    logDayShiftAcrossYear: "A date moves on one day each year, or two across a leap year. Check whether February 29 falls between the two dates.",
    logLeapYearPick: "A leap year divides by 4, except century years, which must divide by 400.",
    logLeapBirthday: "February 29 comes every 4 years, so count in fours from the birth year — but check whether a century year interrupts the pattern.",
    logClockAngleAtHour: "The minute hand moves 6° a minute; the hour hand moves 0.5° a minute and drifts past the hour. Find both positions, then subtract.",
    logClockMirror: "A mirrored clock time and the real time add to 12:00. Subtract the shown time from 12 hours.",
    logSumAndDiff: "Subtract the difference from the sum and halve it for the smaller number, then add the difference back.",
    logArithmagonProduct: "Multiply all three side products together — that gives the square of a × b × c. Take the square root, then divide by the product of the other two.",
    logAdditionPyramid: "Work upwards, adding each neighbouring pair. The middle number of the bottom row is used twice.",
    logLetterPuzzle: "Compare the two statements. The difference between them tells you the value of the extra letter.",
    logMagicSquareRow: "Every row adds to the same total, so subtract the numbers you know from that total.",
    logDigitSumOfSum: "Do the addition first, then add the digits of the answer together."
  };

  /* ═══════════════════ DRIVER ═══════════════════ */

  /* Each entry is [template, easiest level, hardest level].

     The band — not the template's own diff(i) call — decides what the child is
     told. Difficulty has to describe the skill being tested, and the skill is a
     property of the template, not of where a variation landed in the loop:
     "What is the LCM of 6 and 9?" is not harder than "the LCM of 15 and 20?"
     just because it was generated on a multiple of 5. Where a band spans more
     than one level, the variations are spread evenly through it. */
  const generators = {
    Numbers: [
      [numPlaceValue, 1, 2],              // read one digit's value
      [numPlaceValueDiff, 2, 3],          // two place values, then subtract
      [numRounding, 1, 2],
      [numRoundingBounds, 2, 3],          // rounding worked backwards
      [numIsPrime, 1, 2],
      [numLCM, 2, 2],
      [numHCF, 2, 2],
      [numHCFofFour, 3, 3],               // four numbers at once
      [numPowers, 1, 1],
      [numFactorCount, 2, 3],
      [numPrimeFactorCount, 3, 3],        // index notation
      [numArithmetic, 1, 2],
      [numWordProblem, 1, 1],
      [numBusLCM, 3, 3],                  // LCM of three, applied
      [numSmallestEvenFromDigits, 2, 3],
      [numCubeMissing, 2, 2],
      [numPrimeSumSquare, 4, 4],          // search over a range
      [numFourConsecOdd, 3, 3],
      [numCompareExpressions, 3, 3],      // four calculations, then compare
      [numRoundLargePlace, 2, 3], [numDigitProductCount, 4, 4], [numClosestToTarget, 3, 3],
      [numRemainderPuzzle, 4, 4],         // common multiple, then adjust
      [numLastDigitPower, 4, 4],  // spot the repeating cycle
      [numWordsToDigits, 2, 2],           // words to digits, empty hundreds column
      [numSquaresMinusCubes, 4, 4],       // count squares and cubes in one list
      [numFactorStatements, 4, 4]         // which claim about factors is false
    ],
    Decimals: [
      [decAdd, 1, 1], [decSubtract, 1, 2], [decMultiply, 2, 2], [decDivide, 2, 2],
      [decCompare, 1, 2], [decRound, 1, 2], [decToFrac, 2, 2],
      [decHalfway, 3, 3],                 // midpoint of two decimals
      [decMultFactReuse, 3, 4],           // reuse a known product, shift place value
      [decPriceChange, 3, 3],             // increase then decrease
      [decDivideByDecimal, 4, 4],         // dividing by a number below 1
      [decChainedOf, 4, 4],               // decimal of a decimal of a whole
      /* harder decimals */
      [decMultiplyBySmall, 3, 4],         // the point shifts, the digits do not
      [decOrderMixed, 3, 4],              // decimals against percentages
      [decUnitPrice, 3, 4],               // better value, per 100 g
      [decMultiplyGivenFact, 4, 4],       // a whole-number product handed over
      [decMoneySplit, 4, 4]               // shared out, with pence left over
    ],
    Fractions: [
      [fracAdd, 2, 2], [fracSubtract, 2, 3], [fracMultiply, 1, 2], [fracDivide, 2, 2],
      [fracSimplify, 1, 1], [fracImproperToMixed, 1, 2], [fracOfX, 2, 2],
      [fracMixedMultiply, 3, 3],          // convert, multiply, simplify
      [fracOfFrac, 3, 3],                 // fraction of a fraction, in words
      [fracReverseTwoStage, 4, 4],        // two fractions removed, worked back
      [fracOfRemainderMoney, 4, 4],       // fraction of what was left
      [fracBetweenTwo, 4, 4],             // strictly between two fractions
      [fracOfCapacity, 4, 4], [figShadedFraction, 2, 3],
      [figShadedTriangles, 3, 3]          // a shape cut into equal triangles
    ],
    Percentages: [
      [pctOf, 1, 1], [pctFracToPct, 2, 2], [pctDecToPct, 1, 2],
      [pctSalePrice, 2, 2], [pctIncrease, 2, 2], [pctSimpleInterest, 2, 3],
      [pctReverse, 2, 3],                 // work back to the original
      [pctChained, 3, 4],                 // percentage of a percentage of a percentage
      [pctSaleChange, 3, 3],              // discount, total, then change
      [pctVennNeither, 3, 4],             // overlapping sets
      [pctProfitAfterLoss, 4, 4], [pctProfitPerItem, 3, 3]
    ],
    BIDMAS: [
      [bidSimple, 1, 1], [bidBrackets, 1, 1], [bidPowers, 2, 2],
      [bidMixed, 2, 3], [bidNegative, 3, 3], [bidTempChange, 2, 2],
      [bidNestedBrackets, 4, 4],          // brackets inside brackets, with a power
      [bidMissingOperator, 4, 4],         // choose the operations
      [bidInsertBrackets, 4, 4],
      /* harder BIDMAS */
      [bidFractionBar, 3, 4],             // the bar groups top and bottom
      [bidNegativePower, 3, 4],           // -3 squared is not (-3) squared
      [bidRootsAndPowers, 4, 4],          // a root and a power together
      [bidNotEqual, 4, 4],                // three are equal, one is not
      [bidBracketsFourTerms, 4, 4]        // place brackets in four terms           // place the brackets
    ],
    Algebra: [
      [algSubLinear, 1, 1], [algSubMulti, 2, 3], [algSubQuadratic, 3, 3],
      [algSolve1Step, 1, 1], [algSolve2Step, 2, 2], [algSolveBothSides, 2, 3],
      [algSimplifyTerms, 2, 2], [algCustomOp, 2, 3],
      [algWeightPair, 3, 3],              // sum and difference
      [algTriangleAngles, 4, 4],          // several constraints at once
      [algThreeItemPricing, 4, 4],        // three unknowns
      [algSimultaneous, 4, 4],            // two equations, two unknowns
      [algChainSubstitute, 3, 3], [algFunctionMachine, 3, 3],
      /* August QE/EPP papers */
      [algPowerEquation, 2, 3],           // 2^x = 64
      [algExpressionChange, 3, 3],        // build the expression, do not evaluate
      [algRemainderDivisor, 3, 3],        // 40 / N = 3 remainder 4
      [algInequalityInteger, 3, 4]        // 41 < 3y < 43
    ],
    Sequences: [
      [seqArithNext, 1, 1], [seqArithNth, 2, 2], [seqArithNthFormula, 2, 3],
      [seqFibLike, 2, 2], [seqGeomNext, 2, 2], [seqBallPattern, 2, 2],
      [seqMatchstickNth, 3, 3],           // nth term as an expression
      [seqQuadraticNext, 4, 4],           // the gaps themselves grow
      [seqNthFromTwoTerms, 4, 4],         // rule from two scattered terms
      [seqFibMissingStart, 4, 4],         // Fibonacci-like, worked backwards
      [seqQuadraticDecreasing, 4, 4],
      /* harder sequences */
      [seqWhichTerm, 3, 4],               // which position holds this value
      [seqTriangular, 3, 4],              // dot patterns, drawn
      [seqRecurrenceMissing, 3, 4],       // a rule using the term before
      [seqQuadraticNth, 4, 4],            // nth term with a constant 2nd difference
      [seqArithSum, 4, 4],                // total of the first n terms
      [seqInterleaved, 4, 4]              // two sequences laid alternately      // falling terms, growing gaps
    ],
    Ratio: [
      [ratSimplify, 1, 1], [ratSplit, 2, 2], [ratWordTotal, 2, 2],
      [ratDifference, 3, 3], [ratRecipe, 2, 2], [ratMapScale, 2, 2],
      [ratInverseProp, 3, 3],             // inverse proportion
      [ratChained, 4, 4],                 // link two ratios
      [ratAfterChange, 4, 4],             // ratio before and after a change
      [ratMapReverse, 3, 3],
      [ratThreeCategories, 4, 4],         // three kinds, a ratio across another split
      [ratInverseTime, 4, 4],             // more power, less time
      /* harder ratio */
      [ratThreePart, 3, 4],               // three parts, not two
      [ratFractionOfWhole, 3, 4],         // fraction of the whole, and back
      [ratBestValue, 3, 4],               // per-item cost across pack sizes
      [ratCompareTwoRatios, 3, 4],        // equivalent, or one larger
      [ratEqualise, 4, 4]                 // move enough to even them up
    ],
    Speed: [
      [spdFindSpeed, 1, 1], [spdFindDistance, 1, 2], [spdFindTime, 2, 2],
      [spdMphHoursMin, 2, 3],             // mixed hours and minutes
      [spdGapBetweenTwo, 3, 3],
      [spdAverageTwoLegs, 4, 4],          // average speed is not the mean speed
      [spdCatchUp, 4, 4],                 // closing a head start
      [spdMeetingPoint, 4, 4],            // travelling towards each other
      [figDistanceTimeStationary, 2, 2], [figDistanceTimeSpeed, 3, 3],
      [spdSpeedFromMinutes, 3, 4],        // the time is given in minutes
      [figTwoTravellersGraph, 4, 4]       // two journeys on one graph
    ],
    Measurement: [
      [meaUnitConvert, 1, 1], [meaAreaPerim, 1, 2], [meaVolumeCube, 2, 2],
      [meaTempDiff, 2, 2], [meaInchConvert, 2, 3], [meaMoneyChange, 2, 2],
      [meaOverlapArea, 3, 3],
      [meaCompoundVolume, 4, 4],          // L-shaped cross-section
      [meaSurfaceAreaFromVolume, 4, 4],   // volume back to surface area
      [meaScaleArea, 4, 4],               // areas scale by the square
      [meaFoldPaper, 3, 3], [meaFrameWidth, 4, 4], [meaSquaresInRectangle, 2, 2],
      [figCompoundPerimeter, 3, 4],       // L-shape drawn, area or perimeter
      /* question-bank/20260822 */
      [meaPourFromContainer, 3, 3],       // litres in, millilitres out
      [meaEstimateWeight, 3, 3],          // is a banana 20 g or 200 g
      [numMultiItemTotal, 3, 3]           // one of one thing, several of another
    ],
    Geometry: [
      [geoAngleSum, 1, 1], [geoAngleType, 1, 1], [geoShapeAngle, 2, 2],
      [geoComplementary, 1, 2], [geoTriangleArea, 2, 2], [geoLinesSymmetry, 1, 2],
      [geoRotSymmetry, 2, 2], [geoPrismFEV, 2, 2], [geoCuboidMissingEdge, 2, 2],
      [geoRotationCoords, 3, 4],          // rotation about a point
      [geoShapeProperty, 3, 3], [geoShapeSplit, 3, 3],
      [geoPolygonFromAngleSum, 4, 4],     // angle sum back to side count
      [geoShadedArea, 4, 4],              // what is left after a cut-out
      [figAnglesOnLine, 2, 3], [figAnglesAtPoint, 4, 4],
      [figCoordinatesRead, 2, 2], [figCoordinatesMidpoint, 4, 4],
      /* question-bank/20260822 */
      [geoShapeFromSymmetry, 3, 4],       // which drawn shape fits both properties
      [geoNameTriangles, 3, 4],           // name four triangles from pictures
      [geoSplitPolygon, 4, 4],            // cut a corner off a regular polygon
      /* August QE/EPP papers */
      [geoCompassTurn, 2, 3],             // direction after turning right angles
      [geoCompassAngle, 2, 3],            // smallest turn between compass points
      [geoSymmetryCombined, 2, 3],        // lines of symmetry of two named shapes
      [geoSymmetryLetters, 2, 3],         // vertical mirror line in capitals
      [geoParallelogramVertex, 3, 4],     // fourth vertex from three
      [geoTriangleInequality, 3, 4],      // can these lengths make a triangle
      [geoPolygonMissingAngle, 3, 4],     // angle sum with a reflex angle
      [geoTransformCompose, 4, 4]         // translate, then rotate
    ],
    Statistics: [
      [statMean, 1, 1], [statMedian, 2, 2], [statMode, 1, 1], [statRange, 1, 1],
      [statMissingMean, 3, 3],            // mean worked backwards
      [statFreqMidpoint, 2, 2], [statPieAngle, 1, 2], [statPictogram, 2, 2],
      [statCorrelation, 1, 1], [statPieFromAngle, 3, 3], [statFreqTotal, 2, 3],
      [statMeanOfFactors, 3, 4],          // list factors, then average them
      [statCombinedMean, 4, 4],           // weighted, not halfway
      [statMedianFromFreq, 4, 4],         // median out of a frequency table
      [figBarChartTotal, 2, 3], [figBarChartDifference, 2, 3], [figPictogram, 2, 3],
      [figPieChart, 2, 3], [figVennOnly, 3, 4],
      [statMedianAngleTriangle, 4, 4],    // which value could be the median
      [figBarChartMode, 3, 3]             // the modal height on a bar chart
    ],
    "Counting Principle": [
      /* The topic had only hand-written questions before, and none that a
         generator could vary. Pitched where the papers set it. */
      [countHandshakes, 3, 3],                // pairs, so halve the double count
      [countArrangeNoRepeat, 3, 4],           // n x (n-1) x (n-2)
      [countArrangeFirstRestrict, 3, 4],      // zero may not lead
      [countPlateLettersDigits, 3, 4],        // letters repeat, digits do not
      [countChooseCommittee, 3, 4],           // order does not matter
      [countEvenNoRepeat, 4, 4],              // fill the restricted place first
      [countGreaterThan, 4, 4],               // only the leading digit is bound
      [countWordRepeatedLetters, 4, 4],       // divide the repeats out
      [countCircular, 4, 4],                  // no first seat round a table
      [countGridPaths, 4, 4]                  // choose which moves go sideways
    ],
    Probability: [
      [probBagPick, 1, 1], [probDie, 2, 2], [probCoin, 1, 1], [probComplement, 1, 2],
      [probExpected, 2, 2], [probIndependent, 3, 3],
      [probWithoutReplacement, 3, 4],     // the pool changes between picks
      [probTwoDiceSum, 4, 4],             // count the favourable pairs
      [probAtLeastOne, 4, 4],             // easier via the complement
      /* Harder two-stage and complement work */
      [probTwoSameColour, 3, 4],          // both red, nothing put back
      [probConditionalSecond, 3, 4],      // the first pick has already happened
      [probTwoWayTable, 3, 4],            // overlap taken off one group
      [probFindOtherIndependent, 3, 4],   // worked backwards to the missing one
      [probAtLeastOneSix, 3, 4],          // complement of "none at all"
      [probOneOfEach, 4, 4],              // both orders count
      [probTwoSpinnersSum, 4, 4],         // count the pairs making the total
      [probAddToTarget, 4, 4],            // backwards from the probability
      [probNotAllSame, 4, 4],             // 1 minus the two matching ways
      [probThreeDrawsAllSame, 4, 4]       // three shrinking denominators
    ],
    Logic: [
      [logConsecutiveIntSum, 2, 2], [logConsecutiveEvenSum, 2, 3],
      [logConsecutiveOddPuzzle, 3, 4], [logPalindromeYesNo, 1, 1],
      [logNextPalindrome, 2, 2], [logSquarePalindromesInRange, 3, 3],
      [logDayOfWeek, 2, 2], [logDayWeeksAgo, 2, 2], [logDayShiftAcrossYear, 3, 3],
      [logLeapYearPick, 1, 2], [logLeapBirthday, 4, 4],
      [logClockAngleAtHour, 3, 3], [logClockMirror, 3, 3], [logSumAndDiff, 2, 2],
      [logArithmagonProduct, 3, 4], [logAdditionPyramid, 2, 3],
      [logLetterPuzzle, 2, 2], [logMagicSquareRow, 2, 2], [logDigitSumOfSum, 2, 2],
      [logTimeZone, 4, 4],                // hours ahead or behind, across midnight
      [logClockReflexAngle, 3, 4]         // the reflex angle between the hands
    ]
  };

  // Single scale knob — produces ~140 generators × N variations questions.
  const VARIATIONS_PER_TEMPLATE = 50;

  Object.values(generators).forEach(gens => {
    gens.forEach(([gen, lo, hi], gIdx) => {
      const span = hi - lo + 1;
      for (let v = 0; v < VARIATIONS_PER_TEMPLATE; v++) {
        try {
          const q = gen(v + gIdx * 13);
          if (!q) continue;
          q.difficulty = lo + (v % span);
          q.template = gen.name;
          if (!q.explain && METHODS[gen.name]) q.explain = METHODS[gen.name];
          QUESTIONS.push(q);
        } catch (e) { /* skip bad seed */ }
      }
    });
  });
})();
