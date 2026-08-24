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
  /* [[2, 2], [3, 1], [7, 2]] for 588: each prime with the power it appears to.
     Factor-counting questions are answered from this rather than from a list,
     because a list stops being countable long before the numbers get large. */
  const primePowers = n => {
    const out = [];
    let m = n;
    for (let p = 2; p * p <= m; p += 1) {
      let e = 0;
      while (m % p === 0) { m /= p; e += 1; }
      if (e) out.push([p, e]);
    }
    if (m > 1) out.push([m, 1]);
    return out;
  };
  /* "2^2 × 3 × 7^2" */
  const powerString = pp =>
    pp.map(([p, e]) => (e === 1 ? `${p}` : `${p}^${e}`)).join(" × ");
  /* "2 × 2 × 3 × 7 × 7" */
  const longString = pp =>
    pp.flatMap(([p, e]) => Array(e).fill(p)).join(" × ");
  /* "588 = 2 × 2 × 3 × 7 × 7 = 2^2 × 3 × 7^2", or just "66 = 2 × 3 × 11" when
     every prime appears once and the index form would repeat the long one. */
  const factorisationPhrase = (n, pp) => {
    const long = longString(pp), powers = powerString(pp);
    return long === powers ? `${n} = ${long}` : `${n} = ${long} = ${powers}`;
  };

  /* "(1 + 1) × (2 + 1) = 2 × 3 = 6", or just "(2 + 1) = 3" for a single prime. */
  const countFormula = pp => {
    const terms = pp.map(([, e]) => `(${e} + 1)`).join(" × ");
    const values = pp.map(([, e]) => e + 1);
    const total = values.reduce((a, b) => a * b, 1);
    return values.length > 1
      ? `${terms} = ${values.join(" × ")} = ${total}`
      : `${terms} = ${total}`;
  };

  const factorsOf = n => { const out = []; for (let k = 1; k <= n; k++) if (n % k === 0) out.push(k); return out; };
  const isSquare = n => { const r = Math.round(Math.sqrt(n)); return r >= 0 && r * r === n; };
  const isLeap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const simp = (n, d) => { const g = gcd(Math.abs(n), Math.abs(d)) || 1; return `${n / g}/${d / g}`; };
  const fmt = n => { const v = Number(n); return Number.isFinite(v) ? (Number.isInteger(v) ? `${v}` : `${Number(v.toFixed(3))}`) : `${n}`; };
  const fmtMoney = n => `£${Number(n).toFixed(2).replace(/\.00$/, "")}`;
  const comma = n => Number(n).toLocaleString("en-GB");
  /* Money always carries both pence digits. fmt() trims a trailing zero,
     which turns £14.30 into "£14.3", and rounds to three places, which
     allowed "£12.155" into an option list. */
  const money = n => `£${Number(n).toFixed(2)}`;
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
    const q = mk("Numbers", `How many factors does ${n} have?`,
      `${ans}`, [`${ans + 1}`, `${ans - 1}`, `${ans + 2}`], diff(i, 4), i);
    /* The generic METHODS line works through 36, which is not the number being
       asked about. Work through this one. */
    const pp = primePowers(n);
    if (q) q.explain =
      `Step 1. Break ${n} into primes: ${factorisationPhrase(n, pp)}.\n\n` +
      `Step 2. Add 1 to each index and multiply them together: ` +
      `${countFormula(pp)}.\n\n` +
      `So ${n} has ${ans} factors. Adding 1 to each index counts the choices for ` +
      `that prime — a factor can use it 0 times, 1 time, and so on up to the ` +
      `index — and every combination of those choices is a different factor. ` +
      `Pairing factors up from 1 is a good check on a small number, but it is ` +
      `slow and easy to miss one, which is what the formula is for.`;
    return q;
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
      `A price of ${money(v)} is increased by ${p}% and then reduced by ${q}%. What is the final price?`,
      money(final),
      /* The first two were the same expression written differently. Treating
         the two changes as one net change is the real mistake; so is
         applying only one of them. */
      [money(v * (1 + (p - q) / 100)), money(v * (1 - q / 100)),
       money(v * (1 + p / 100)), money(v),
       money(final + 0.5), money(final - 0.5)],
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
      /* "original - discount" treats the percentage as pounds, which is a real
         mistake and a negative price whenever the discount number is the larger
         of the two - so it is offered only when it stays above zero. */
      [fmtMoney(original * discount / 100),
       ...(original - discount > 0 ? [fmtMoney(original - discount)] : []),
       fmtMoney(ans + 5), fmtMoney(original), fmtMoney(ans / 2)],
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

  /* Three angles a > b > c summing to 180, where two of them add up to k times
     the third and the largest is d° more than the second largest.

     WHICH two add up is the question, and the old wording - "two angles sum to
     k times the third" - never said. "The third" only means "the remaining
     one", so the generator and the solver could each pick a different reading
     and both be sure. They did: the generator assumed the pair was the two
     largest, and for k = 2 that is impossible, so half the questions stated a
     condition their own answer did not meet. Each pairing now names its angles.

     `solve` returns the three angles for a pairing; whether a given (k, d) works
     is decided by testing them, not by a remembered range. */
  const ANGLE_PAIRINGS = [
    { pair: "the two largest angles sum to K times the smallest angle",
      ks: [3, 4, 5],
      solve: (k, T, d) => ({ c: T, b: (k * T - d) / 2, a: (k * T - d) / 2 + d }),
      why: (k, T) => `The two largest add up to ${k} times the smallest, so the ` +
        `smallest plus ${k} of itself is the whole 180°: ${k + 1} × smallest = 180, ` +
        `giving a smallest angle of ${T}°.`,
      work: (T, d, a, b) => `The largest and the second largest are what is left, ` +
        `so they come to 180 − ${T} = ${180 - T}° between them, and they differ ` +
        `by ${d}°. Splitting that: the largest is (${180 - T} + ${d}) ÷ 2 = ${a}° ` +
        `and the second largest is ${a} − ${d} = ${b}°.` },
    { pair: "the largest and the smallest angles sum to K times the second largest angle",
      ks: [2, 3, 4, 5],
      solve: (k, T, d) => ({ b: T, a: T + d, c: k * T - (T + d) }),
      why: (k, T) => `The largest and the smallest add up to ${k} times the second ` +
        `largest, so the second largest plus ${k} of itself is the whole 180°: ` +
        `${k + 1} × second largest = 180, giving a second largest of ${T}°.`,
      /* The difference is between the largest and the SECOND largest, and the
         second largest is the one just found - so the largest comes straight
         from it, and the smallest is whatever is left. */
      work: (T, d, a, b, c) => `The difference given is between the largest and ` +
        `the second largest, and the second largest is the one just found — so ` +
        `the largest is ${T} + ${d} = ${a}°. The smallest is then whatever is ` +
        `left: 180 − ${T} − ${a} = ${c}°.` },
    { pair: "the two smallest angles have the same sum as the largest angle",
      ks: [1],
      solve: (k, T, d) => ({ a: T, b: T - d, c: k * T - (T - d) }),
      why: (k, T) => `The two smallest add up to the largest, so the largest is ` +
        `half of the whole 180° — it is ${T}°, a right angle.`,
      work: (T, d, a, b, c) => `The second largest is ${d}° less than the largest, ` +
        `so it is ${T} − ${d} = ${b}°, and the smallest is whatever is left: ` +
        `180 − ${T} − ${b} = ${c}°.` }
  ];

  function algTriangleAngles(i) {
    const P = ANGLE_PAIRINGS[i % ANGLE_PAIRINGS.length];
    const k = P.ks[Math.floor(i / 3) % P.ks.length];
    const T = 180 / (k + 1);
    if (!Number.isInteger(T)) return null;
    /* The values of d that give a genuine triangle with a > b > c, found by
       trying them rather than assumed. */
    const good = [];
    for (let d = 1; d <= 130; d += 1) {
      const { a, b, c } = P.solve(k, T, d);
      if (![a, b, c].every(Number.isInteger)) continue;
      if (a + b + c !== 180) continue;
      if (!(a > b && b > c && c >= 10)) continue;
      good.push(d);
    }
    if (!good.length) return null;
    const d = good[Math.floor(i / 11) % good.length];
    const { a, b, c } = P.solve(k, T, d);
    const asked = ["largest", "second largest", "smallest"][Math.floor(i / 5) % 3];
    const want = asked === "largest" ? a : asked === "second largest" ? b : c;
    const others = [a, b, c].filter(v => v !== want);
    const q = mk("Algebra",
      `In a triangle, ${P.pair.replace("K", k)}. ` +
      `The largest angle is ${d}° more than the second largest.\n\n` +
      `Find the ${asked} angle.`,
      `${want}°`,
      [`${others[0]}°`, `${others[1]}°`,       // the other two angles
       `${want + d}°`, `${want - d}°`, `${180 - want}°`],
      4, i);
    /* The middle step belongs to the pairing: which angle is fixed first decides
       whether the pair left over is the pair the difference is about. Sharing
       one sentence across all three had it claiming a difference of ${d} between
       two angles that differ by something else. */
    if (q) q.explain =
      `${P.why(k, T)} ${P.work(T, d, a, b, c)} So the three angles are ${a}°, ` +
      `${b}° and ${c}°: they add to ${a} + ${b} + ${c} = 180, and ${a} − ${b} = ` +
      `${d} as the question says. The ${asked} of them is ${want}°. Read which ` +
      `two angles are being added before you start — "the two largest" and "the ` +
      `largest and the smallest" lead to completely different triangles.`;
    return q;
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
      [`${fmt(mph * h)} miles`,              // dropped the minutes
       `${fmt(mph * (h + 1))} miles`,        // rounded the minutes up to an hour
       `${fmt(ans + mph / 2)} miles`,
       `${fmt(mph * (h + m / 100))} miles`,  // read the minutes as hundredths
       `${fmt(ans - mph / 4)} miles`],
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
      /* Dividing by 2.5 instead of multiplying is a real mistake and also a
         decimal, so the answer is no longer the only one on the page with a
         point in it - which was letting it be spotted without converting. */
      [`${fmt(askMm ? cm : mm)} ${askMm ? "mm" : "cm"}`,
       /* The wrong factor, 1.5 instead of 2.5: fractional exactly when the
          answer is, so the answer is never the only decimal offered. */
       `${fmt(askMm ? inches * 15 : inches * 1.5)} ${askMm ? "mm" : "cm"}`,
       `${fmt(inches * 2)} ${askMm ? "mm" : "cm"}`,
       `${fmt(inches)} ${askMm ? "mm" : "cm"}`],
      diff(i, 3), i);
  }

  function meaMoneyChange(i) {
    const itemA = 50 + 5 * (i % 12), itemB = 55 + 4 * (i % 9);
    const nA = 3 + (i % 6), nB = 2 + (i % 5);
    const noteP = 1000 * (1 + (i % 2));
    const totalP = nA * itemA + nB * itemB;
    /* There is no change from a note the shopping costs more than. Without this
       the question asked for the change from £10 on an £11.26 purchase, and the
       answer itself came out negative. */
    if (totalP >= noteP) return null;
    const ans = (noteP - totalP) / 100;
    return mk("Measurement",
      `Buy ${nA} bags of crisps at ${itemA} p each and ${nB} bags of nuts at ${itemB} p each. Change from £${noteP / 100}?`,
      `£${ans.toFixed(2)}`,
      [`£${(ans + 0.1).toFixed(2)}`,
       ...(ans - 0.1 > 0 ? [`£${(ans - 0.1).toFixed(2)}`] : []),
       `£${(totalP / 100).toFixed(2)}`, `£${(ans + 1).toFixed(2)}`,
       `£${(noteP / 100).toFixed(2)}`],
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
    /* At p = 0.5 the complement is p, so the distractor that carries the whole
       point of the question - answering with the probability you were given -
       is a duplicate of the answer. mk drops it, is left one short, and pads
       with nudge(), which offered 6.5 as a probability. The question has
       nothing to test at 0.5 either way. */
    if (ans === p) return null;
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
      /* The first is "forgot the discount", which overspends the note whenever
         the full prices come to more than it holds. */
      [...(note - priceA - priceB > 0
        ? [`£${((note - priceA - priceB) / 100).toFixed(2)}`] : []),
       `£${(total / 100).toFixed(2)}`, `£${(ans + discount / 100).toFixed(2)}`,
       `£${(ans + 1).toFixed(2)}`, `£${((note - total * 2) / 100 > 0
        ? (note - total * 2) / 100 : ans + 2).toFixed(2)}`],
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
      /* All integers. The natural mistake here - dividing the square before
         subtracting it - cannot land on a whole number, and a single decimal
         among integers is ruled out on sight whether or not it is wrong. */
      [`${inner + f}`,          // never divided
       `${inner / e * f}`,      // multiplied by f instead of adding it
       `${ans - f}`,            // stopped before the + f
       `${inner - e + f}`,      // subtracted the divisor
       `${inner / e - f}`],
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
    const pairs = [[60, 40], [30, 20], [12, 4], [80, 20], [24, 8], [90, 45], [50, 30],
                   [36, 12], [45, 30], [60, 30], [20, 5], [70, 30], [42, 14], [15, 10]];
    const [u, v] = pairs[axis(i, 0, 14)];
    const harmonic = 2 * u * v / (u + v);
    if (!Number.isInteger(harmonic)) return null;
    const dist = (u + v) * (1 + axis(i, 1, 5));
    return mk("Speed",
      `A cyclist rides ${dist} km to a village at ${u} km/h and returns along the same road at ${v} km/h. What is her average speed for the whole journey?`,
      `${harmonic} km/h`,
      /* Extra candidates: with a wider pool of speed pairs, (u+v)/2 and u-v
         collide often enough that nudge() was inventing a fourth option. */
      [`${(u + v) / 2} km/h`, `${u - v} km/h`, `${fmt(harmonic + 2)} km/h`,
       `${fmt(harmonic - 2)} km/h`, `${u} km/h`, `${v} km/h`],
      4, i);
  }

  function spdCatchUp(i) {
    const u = 20 + 10 * axis(i, 0, 6);
    const v = u + 10 + 10 * axis(i, 1, 4);
    const headStartHours = 1 + axis(i, 2, 4);
    const gap = u * headStartHours;
    const hours = gap / (v - u);
    if (!Number.isInteger(hours * 60) || hours > 12) return null;
    const mins = Math.round(hours * 60);
    const label = mins % 60 === 0 ? `${mins / 60} hours` : `${Math.floor(mins / 60)} hours ${mins % 60} minutes`;
    return mk("Speed",
      `A lorry sets off at ${u} km/h. ${headStartHours} hour${headStartHours > 1 ? "s" : ""} later a car leaves from the same place along the same road at ${v} km/h. How long after the car sets off does it catch the lorry?`,
      label,
      [`${headStartHours} hours`,            // just the head start
       `${fmt(gap / v)} hours`,              // divided by the car's speed, not the gain
       `${fmt(hours + 1)} hours`,
       `${fmt(gap / u)} hours`, `${fmt(hours * 2)} hours`],
      4, i);
  }

  function spdMeetingPoint(i) {
    const u = 30 + 10 * axis(i, 0, 6), v = 40 + 10 * axis(i, 1, 5);
    const t = 2 + axis(i, 2, 5);
    const distance = (u + v) * t;
    const fromA = u * t;
    return mk("Speed",
      `Two towns are ${comma(distance)} km apart. A train leaves the first town at ${u} km/h and, at the same moment, a train leaves the second town towards it at ${v} km/h. How far from the first town do they meet?`,
      `${comma(fromA)} km`,
      [`${comma(distance / 2)} km`,          // assumed they meet in the middle
       `${comma(v * t)} km`,                 // measured from the other town
       `${comma(fromA + u)} km`,
       `${comma(fromA - u)} km`, `${comma(distance - fromA + u)} km`],
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

  /* ── Spatial: solids built from unit cubes ──

     A big cube is built out of small ones and its outside is painted, then the
     child is asked how many small cubes carry paint on exactly so many faces.
     The whole difficulty is seeing WHERE such cubes sit, which is why this
     cannot be answered by pushing the given numbers around: the 3-face ones are
     the 8 corners, the 2-face ones run along the edges between the corners, the
     1-face ones tile the middle of each face, and the unpainted ones form the
     smaller cube hidden inside. Each class is stored with the count it gives and
     the words for where it is, so the hint can explain the picture rather than
     assert a formula. */
  const CUBE_CLASSES = [
    { faces: 3, count: n => 8,
      where: () => "the 8 corners, where three painted faces meet" },
    { faces: 2, count: n => 12 * (n - 2),
      where: n => `the 12 edges, with ${n - 2} ${n - 2 === 1 ? "cube" : "cubes"} ` +
        `left along each edge once the corners are taken out` },
    { faces: 1, count: n => 6 * (n - 2) * (n - 2),
      where: n => `the middle of each of the 6 faces, a ${n - 2} by ${n - 2} square on every one` },
    { faces: 0, count: n => (n - 2) * (n - 2) * (n - 2),
      where: n => `a hidden ${n - 2} by ${n - 2} by ${n - 2} cube inside, which the paint never reaches` }
  ];

  function geoPaintedCube(i) {
    /* Two of the four counts coincide at some sizes — at n = 4 the edge and the
       face counts are both 24, at n = 8 the face and inside counts are both 216
       — and mk compares options by value, so those seeds would lose a distractor
       and have one invented by nudge instead. Scan for the sizes that keep all
       four distinct rather than listing them and hoping. */
    const sizes = [];
    for (let n = 3; n <= 12; n += 1) {
      if (new Set(CUBE_CLASSES.map(c => c.count(n))).size === 4) sizes.push(n);
    }
    const n = sizes[i % sizes.length];
    /* 4 classes and 7 usable sizes share no factor, so both indices turn over
       independently and every combination is reachable. */
    const cls = CUBE_CLASSES[Math.floor(i / 7) % CUBE_CLASSES.length];
    const counts = CUBE_CLASSES.map(c => c.count(n));
    const ans = cls.count(n);
    /* The other three classes are the distractors: mixing up "no faces" with
       "one face" is the actual mistake this question is testing for. */
    const others = counts.filter(c => c !== ans);
    if (others.length !== 3) return null;
    if (counts.reduce((a, b) => a + b, 0) !== n * n * n) return null;

    const asked = cls.faces === 0
      ? "have no paint on them at all"
      : `have paint on exactly ${cls.faces} ${cls.faces === 1 ? "face" : "faces"}`;
    const q = mk("Geometry",
      `Small cubes measuring 1 cm on every edge are glued together to build a ` +
      `solid cube measuring ${n} cm along each edge. The whole of the outside ` +
      `of the big cube is then painted. How many of the small cubes ${asked}?`,
      comma(ans), others.map(c => comma(c)), 4, i);

    if (q) q.explain =
      `Step 1. Picture where each kind of small cube sits. There are only four ` +
      `kinds, and every one of the ${comma(n * n * n)} small cubes is one of them:\n` +
      CUBE_CLASSES.map(c =>
        `  • ${c.faces === 0 ? "no faces" : c.faces + (c.faces === 1 ? " face" : " faces")} painted — ` +
        `${c.where(n)}: ${comma(c.count(n))}`).join("\n") +
      `\n\nStep 2. This question asks for the ones that ${asked}, which is ` +
      `${cls.where(n)}.\n\n` +
      `Step 3. That gives ${comma(ans)}.\n\n` +
      `Check it by adding all four kinds together: ` +
      `${counts.map(c => comma(c)).join(" + ")} = ${comma(n * n * n)}, which is ` +
      `${n} × ${n} × ${n} — every small cube accounted for once. If your four ` +
      `numbers do not add up to that, one of them is wrong. The trap is answering ` +
      `with the wrong kind: ${comma(counts[3])} is the hidden inside block and ` +
      `${comma(counts[2])} is the middle of the faces, and those are easy to swap.`;
    return q;
  }

  /* Cubes glued in a row: the join destroys two faces, not one. Counting 6 faces
     per cube and forgetting the joins altogether is the common mistake, so that
     answer is offered. */
  function geoJoinedCubesSurface(i) {
    const k = 3 + (i % 6);              // how many cubes in the row
    const s = 2 + ((i * 3) % 5);        // edge of one cube, in cm
    const faces = 6 * k - 2 * (k - 1);  // two faces are lost at each join
    const ans = faces * s * s;
    const wrong = [
      6 * k * s * s,                    // forgot the joins
      (6 * k - (k - 1)) * s * s,        // lost one face per join, not two
      faces * s                         // used the edge instead of the face area
    ];
    if (new Set([ans, ...wrong]).size !== 4) return null;
    const q = mk("Geometry",
      `${k} identical cubes, each measuring ${s} cm along every edge, are glued ` +
      `together face to face in a single straight row. What is the surface area ` +
      `of the solid this makes?`,
      `${comma(ans)} cm²`, wrong.map(w => `${comma(w)} cm²`), 4, i);

    if (q) q.explain =
      `Step 1. On their own the ${k} cubes have ${k} × 6 = ${6 * k} faces ` +
      `showing.\n\n` +
      `Step 2. Gluing them in a row makes ${k - 1} joins, and each join hides ` +
      `two faces — one on each of the cubes being stuck together. That is ` +
      `${k - 1} × 2 = ${2 * (k - 1)} faces lost, leaving ${6 * k} − ` +
      `${2 * (k - 1)} = ${faces}.\n\n` +
      `Step 3. One face is ${s} × ${s} = ${s * s} cm², so the surface area is ` +
      `${faces} × ${s * s} = ${comma(ans)} cm².\n\n` +
      `Losing one face per join instead of two gives ${comma(wrong[1])} cm², and ` +
      `forgetting the joins altogether gives ${comma(wrong[0])} cm² — both are ` +
      `offered, so the count of hidden faces is the whole question.`;
    return q;
  }

  /* ── Spatial: nets of a cube ──

     Folding the strip of four into a band makes them the side faces, so squares
     two apart in the strip finish opposite each other; the square above the
     strip becomes the top and the one below becomes the bottom, so those two are
     opposite as well. I and O are kept out of the letter sets because they read
     as 1 and 0 on a diagram. */
  const NET_LETTER_SETS = [
    ["P", "Q", "R", "S", "T", "U"],
    ["A", "B", "C", "D", "E", "F"],
    ["J", "K", "L", "M", "N", "H"],
    ["V", "W", "X", "Y", "Z", "G"]
  ];

  /* Opposite faces in a net: two apart along the strip, or above against below. */
  const netOpposite = (idx, strip) => (idx < 4 ? (idx + 2) % 4 : idx === 4 ? 5 : 4);

  function geoNetOppositeFace(i) {
    if (!D) return null;
    /* Letter set, both attachment points and the face asked about are 4 x 4 x 4
       x 6 = 384 combinations. Reaching them as i % 4, (i * 3) % 4 and
       (i * 5 + 2) % 4 looks varied but is not: every one of those is a function
       of i % 4, so all three turn over together and only 24 questions exist.
       Walking the whole space with a stride coprime to 384 gives a different
       combination for every seed instead. */
    const combo = (i * 97) % 384;
    const set = NET_LETTER_SETS[combo % 4];
    const strip = set.slice(0, 4);
    const above = { label: set[4], at: Math.floor(combo / 4) % 4 };
    const below = { label: set[5], at: Math.floor(combo / 16) % 4 };
    const askIdx = Math.floor(combo / 64) % 6;
    const oppIdx = netOpposite(askIdx, strip);
    const all = [...strip, above.label, below.label];
    const asked = all[askIdx], ans = all[oppIdx];
    /* The faces that merely touch the asked one are the distractors: a child who
       folds the net wrongly lands on a neighbour, not on a random letter. */
    const wrong = all.filter((_, k) => k !== askIdx && k !== oppIdx);
    const q = mkFig("Geometry",
      `The net below folds up to make a cube. Which face ends up opposite the ` +
      `face marked ${asked}?`,
      ans, wrong, 3, i, D.cubeNet({ strip, above, below }));
    if (q) q.explain =
      `Fold the row of four — ${strip.join(", ")} — into a band. Those become the ` +
      `four side faces, and going twice along the band brings you to the face ` +
      `directly across from where you started, so ${strip[0]} faces ${strip[2]} ` +
      `and ${strip[1]} faces ${strip[3]}.\n\n` +
      `${above.label} is attached above the row and ${below.label} below it, so ` +
      `they fold up to be the top and the bottom, which puts them opposite each ` +
      `other.\n\n` +
      `That gives three pairs: ${strip[0]}–${strip[2]}, ${strip[1]}–${strip[3]} ` +
      `and ${above.label}–${below.label}. ${asked} is in the pair with ${ans}.\n\n` +
      `The faces next to ${asked} on the net are the tempting wrong answers, ` +
      `because touching the asked face on the flat net is exactly what a face ` +
      `opposite it cannot do once the cube is folded.`;
    return q;
  }

  /* The same folding, with a number puzzle on top: the pairs are built to add to
     a stated total, so the net really is a consistent die. */
  function geoNetOppositeSum(i) {
    if (!D) return null;
    /* Scan for totals with at least three usable pairs rather than listing them:
       every pair must be positive and all six numbers distinct. */
    const combos = [];
    for (let T = 7; T <= 15; T += 1) {
      const lows = [];
      for (let a = 1; a * 2 < T; a += 1) lows.push(a);
      for (let x = 0; x < lows.length; x++)
        for (let y = x + 1; y < lows.length; y++)
          for (let z = y + 1; z < lows.length; z++) {
            const six = [lows[x], T - lows[x], lows[y], T - lows[y], lows[z], T - lows[z]];
            if (new Set(six).size === 6) combos.push({ T, lows: [lows[x], lows[y], lows[z]] });
          }
    }
    if (!combos.length) return null;
    const { T, lows } = combos[i % combos.length];
    /* Ordered so the net folds to a real die: strip position 0 pairs with 2 and
       1 pairs with 3, which is what netOpposite says, and the last two are the
       top and the bottom. */
    const faces = [lows[0], lows[1], T - lows[0], T - lows[1], lows[2], T - lows[2]];
    const hide = Math.floor(i / 7) % 6;
    const oppIdx = netOpposite(hide, faces);
    const ans = faces[oppIdx] === undefined ? null : T - faces[oppIdx];
    if (ans === null || ans !== faces[hide]) return null;   // the net must be consistent
    const opp = faces[oppIdx];
    const neighbour = faces[[0, 1, 2, 3].find(k => k !== hide && k !== oppIdx)];
    const wrong = [opp, T - neighbour, neighbour, T + opp];
    if (new Set([ans, ...wrong]).size < 4) return null;

    const shown = faces.map((v, k) => (k === hide ? "?" : `${v}`));
    const q = mkFig("Geometry",
      `The net below folds up to make a cube. The numbers on each pair of ` +
      `opposite faces add up to ${T}. What number belongs on the face marked ` +
      `with a question mark?`,
      `${ans}`, wrong.map(w => `${w}`), 4, i,
      D.cubeNet({ strip: shown.slice(0, 4),
                  /* independent of each other and of the combo index above */
                  above: { label: shown[4], at: Math.floor(i / 5) % 4 },
                  below: { label: shown[5], at: Math.floor(i / 11) % 4 } }));
    if (q) q.explain =
      `Step 1. Work out the three pairs of opposite faces. Folding the row of ` +
      `four into a band puts the 1st face opposite the 3rd and the 2nd opposite ` +
      `the 4th; the square above the row and the square below it become the top ` +
      `and the bottom, so they are the third pair.\n\n` +
      `Step 2. Find which face the question mark is paired with. It is ` +
      `${opp}.\n\n` +
      `Step 3. Opposite faces add up to ${T}, so the missing number is ` +
      `${T} − ${opp} = ${ans}.\n\n` +
      `Writing ${opp} again is the mistake to avoid — opposite faces add to ` +
      `${T} here, they are not equal.`;
    return q;
  }

  /* ── Rounding and estimating to a given accuracy ──

     Decimal places and significant figures are Year 8 rows with nothing behind
     them: the only rounding left at Hard was numRoundingBoundsGap, which is
     about bounds rather than rounding to an accuracy. The arithmetic is done on
     integers throughout - rounding a binary float to a decimal place is exactly
     the kind of thing that silently produces 4.8299999999999996. */
  function numRoundDecimalPlaces(i) {
    const whole = 2 + (i % 38);
    const d1 = i % 10, d2 = (i * 3 + 1) % 10, d3 = (i * 7 + 3) % 10;
    const thousandths = whole * 1000 + d1 * 100 + d2 * 10 + d3;
    const places = 1 + (i % 2);
    /* Round by integer arithmetic, then print with a fixed number of places so
       a trailing zero is kept: 4.80 to 2 d.p. must not print as 4.8. */
    const scale = places === 1 ? 100 : 10;
    const rounded = Math.round(thousandths / scale) / (places === 1 ? 10 : 100);
    const ans = rounded.toFixed(places);
    const truncated = (Math.floor(thousandths / scale) / (places === 1 ? 10 : 100)).toFixed(places);
    const other = places === 1
      ? (Math.round(thousandths / 10) / 100).toFixed(2)
      : (Math.round(thousandths / 100) / 10).toFixed(1);
    /* Chopping the digits off gives the same answer as rounding whenever the
       deciding digit is under 5, so that candidate cannot be relied on. mk keeps
       the first three DISTINCT options, so a longer list is offered and the
       question survives either way rather than being dropped for half the seeds. */
    const wrong = [truncated, other, (whole).toFixed(places),
                   (rounded + (places === 1 ? 0.1 : 0.01)).toFixed(places),
                   (whole + 1).toFixed(places)];
    const shown = (thousandths / 1000).toFixed(3);
    const q = mk("Numbers",
      `What is ${shown} rounded to ${places} decimal place${places === 1 ? "" : "s"}?`,
      ans, wrong, 3, i);
    if (q) q.explain =
      `To round to ${places} decimal place${places === 1 ? "" : "s"}, look at ` +
      `the digit in the next place along. ${shown} has ` +
      `${places === 1 ? `${d2} in the hundredths` : `${d3} in the thousandths`} ` +
      `place, and ${(places === 1 ? d2 : d3) >= 5 ? "5 or more rounds up" :
      "less than 5 leaves the digit alone"}, giving ${ans}.\n\n` +
      `Cutting the extra digits off instead of rounding gives ${truncated}, ` +
      `which is offered — chopping and rounding are only the same when the next ` +
      `digit is under 5.`;
    return q;
  }

  function numRoundSigFigs(i) {
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9][i % 9];
    const second = (i * 3) % 10, third = (i * 7 + 1) % 10;
    const magnitude = [100, 1000, 10000][i % 3];
    const n = digits * magnitude + second * (magnitude / 10) + third * (magnitude / 100);
    const sf = 1 + (i % 2);
    /* Round at the right place by integer arithmetic. */
    const place = sf === 1 ? magnitude : magnitude / 10;
    const ans = Math.round(n / place) * place;
    /* As above: truncation coincides with rounding when the deciding digit is
       under 5, so more candidates are offered than are needed. */
    const wrong = [
      Math.floor(n / place) * place,                   // truncated, not rounded
      sf === 1 ? Math.round(n / (magnitude / 10)) * (magnitude / 10)
               : Math.round(n / magnitude) * magnitude, // the other accuracy
      Math.round(n / 10) * 10,                         // rounded to the nearest 10
      ans + place,                                     // rounded the wrong way
      ans - place
    ].filter(v => Number.isInteger(v) && v > 0);
    if (!Number.isInteger(ans)) return null;
    return mk("Numbers",
      `What is ${comma(n)} rounded to ${sf} significant figure${sf === 1 ? "" : "s"}?`,
      comma(ans), wrong.map(w => comma(w)), 3, i);
  }

  /* Estimating by rounding each number to one significant figure. The exact
     answer is offered, because working it out exactly is the mistake. */
  function numEstimateOneSigFig(i) {
    const a = 1000 + (i * 137) % 9000;
    const b = 11 + (i * 7) % 88;
    const round1 = x => {
      const p = Math.pow(10, String(Math.trunc(x)).length - 1);
      return Math.round(x / p) * p;
    };
    const A = round1(a), B = round1(b);
    const ans = A * B;
    const wrong = [a * b, A * b, a * B, A * B * 10, A * B / 10]
      .filter(v => Number.isInteger(v) && v !== ans);
    const q = mk("Numbers",
      `Estimate ${comma(a)} × ${b} by rounding each number to 1 significant figure.`,
      comma(ans), wrong.map(w => comma(w)), 3, i);
    if (q) q.explain =
      `Round each number to its first digit: ${comma(a)} becomes ${comma(A)} ` +
      `and ${b} becomes ${B}.\n\n` +
      `Then ${comma(A)} × ${B} = ${comma(ans)}.\n\n` +
      `The exact answer, ${comma(a * b)}, is offered as well — an estimate is ` +
      `meant to be quick, and if you found yourself doing the full ` +
      `multiplication you answered a different question.`;
    return q;
  }

  /* Fraction to percentage: the FDP row was carried by decOrderMixed alone. */
  function numFractionToPercent(i) {
    const pool = [[1, 8], [3, 8], [5, 8], [7, 8], [1, 4], [3, 4], [1, 5], [2, 5],
                  [3, 5], [4, 5], [1, 20], [7, 20], [9, 20], [13, 20], [17, 20],
                  [1, 25], [6, 25], [1, 40], [7, 40], [1, 50], [3, 50],
                  [1, 2], [1, 10], [3, 10], [7, 10], [9, 10], [11, 20], [19, 20],
                  [2, 25], [11, 25], [13, 25], [21, 25], [3, 20], [9, 40],
                  [11, 40], [7, 50], [9, 50], [21, 50], [1, 16], [3, 16]];
    const [n, d] = pool[i % pool.length];
    const pct = n / d * 100;
    if (!Number.isFinite(pct)) return null;
    const wrong = [
      d / n * 100,           // divided the wrong way round
      n / d,                 // forgot to multiply by 100
      n * 10 + d             // read the digits off as a number
    ];
    if (new Set([pct, ...wrong].map(v => Number(Number(v).toFixed(3)))).size !== 4) return null;
    return mk("Numbers", `What is ${n}/${d} as a percentage?`,
      `${fmt(pct)}%`, wrong.map(w => `${fmt(w)}%`), 3, i);
  }

  /* An LCM word problem that is not a bus timetable: numBusLCM was carrying the
     whole Multiples and LCM row on its own. */
  function numLCMShare(i) {
    const triples = [[4, 6, 9], [4, 6, 8], [6, 8, 9], [3, 4, 10], [4, 5, 6],
                     [6, 9, 12], [4, 9, 12], [8, 10, 12], [3, 8, 10], [5, 6, 9],
                     [4, 10, 12], [6, 8, 10], [2, 9, 12], [8, 9, 12], [5, 8, 12],
                     [3, 5, 8], [4, 7, 10], [6, 10, 15], [5, 9, 12], [8, 12, 15],
                     [3, 7, 12], [5, 10, 14], [6, 14, 21], [9, 10, 12], [4, 11, 12],
                     [7, 8, 12], [5, 12, 15], [6, 15, 20], [8, 14, 21], [9, 12, 15]];
    const [a, b, c] = triples[i % triples.length];
    const ans = lcmAll([a, b, c]);
    /* lcm(a, b) is the answer itself whenever c already divides it, so it
       cannot be relied on; mk takes the first three distinct. */
    const wrong = [a * b * c, lcm(a, b), a + b + c, ans * 2, lcm(b, c)]
      .filter(v => v !== ans);
    const q = mk("Numbers",
      `A teacher wants to buy a box of pencils that can be shared out equally ` +
      `between ${a} children, or ${b} children, or ${c} children, with none ` +
      `left over. What is the smallest number of pencils the box can hold?`,
      comma(ans), wrong.map(w => comma(w)), 3, i);
    if (q) q.explain =
      `A number that divides equally by ${a}, ${b} and ${c} is a common ` +
      `multiple of all three, and the smallest one is the lowest common ` +
      `multiple.\n\n` +
      `Take them two at a time: the LCM of ${a} and ${b} is ${lcm(a, b)}, and ` +
      `the LCM of ${lcm(a, b)} and ${c} is ${ans}.\n\n` +
      `Multiplying all three together gives ${comma(a * b * c)}, which does ` +
      `divide by each of them — but it is not the smallest, and "smallest" is ` +
      `what the question asks for.`;
    return q;
  }

  /* Metric to imperial, which lost its only cover when meaInchConvert - a single
     multiplication - was moved down to Medium. Priced in whole pence so the
     money never lands on a binary rounding error. */
  function meaImperialConvert(i) {
    const gallons = 8 + (i % 9);
    const litresPerGallon = 45;            // tenths of a litre: 4.5
    const pencePerLitre = 130 + (Math.floor(i / 9) % 6) * 5;
    /* 4.5 litres to the gallon puts every odd number of gallons on a half
       litre, which is fine - only the money has to come out whole. */
    const litres = gallons * litresPerGallon / 10;
    const totalPence = Math.round(litres * pencePerLitre * 100) / 100;
    if (!Number.isInteger(totalPence)) return null;
    const money = p => `£${(p / 100).toFixed(2)}`;
    /* Offer spare candidates rather than dropping the seed when two coincide:
       mk keeps the first three that are genuinely distinct. */
    const wrong = [
      gallons * pencePerLitre,              // never converted to litres
      litres * 100,                         // gave the litres, not the cost
      litresPerGallon / 10 * pencePerLitre, // priced one gallon only
      totalPence + pencePerLitre,           // one litre too many
      gallons * litresPerGallon             // multiplied the tenths straight out
    ].filter(v => Number.isInteger(v) && v > 0);
    const q = mk("Measurement",
      `1 gallon is equal to 4.5 litres. A tank holds ${gallons} gallons. ` +
      `Petrol costs ${money(pencePerLitre)} per litre. What does it cost to ` +
      `fill the tank?`,
      money(totalPence), wrong.map(w => money(w)), 4, i);
    if (q) q.explain =
      `Step 1. Turn the gallons into litres, because the price is per litre: ` +
      `${gallons} × 4.5 = ${fmt(litres)} litres.\n\n` +
      `Step 2. Multiply by the price: ${fmt(litres)} × ` +
      `${(pencePerLitre / 100).toFixed(2)} = ${money(totalPence)}.\n\n` +
      `Pricing the gallons directly gives ${money(gallons * pencePerLitre)} — ` +
      `the units have to match before you multiply, and that is the whole point ` +
      `of the question.`;
    return q;
  }

  /* ── Reflections, bearings, brackets, comparing two data sets ──
     Four more KS3 Year 7/8 rows with no cover at Hard or Super Hard. */

  /* Reflecting a point. The mirror is an axis or a line parallel to one, so the
     rule stays arithmetic: the coordinate across the mirror moves to the same
     distance the other side, and the one along it does not move at all. */
  const MIRRORS = [
    { name: () => "the x-axis", of: (x, y) => [x, -y] },
    { name: () => "the y-axis", of: (x, y) => [-x, y] },
    { name: k => `the line x = ${k}`, of: (x, y, k) => [2 * k - x, y] },
    { name: k => `the line y = ${k}`, of: (x, y, k) => [x, 2 * k - y] }
  ];

  function geoReflectPoint(i) {
    const m = MIRRORS[i % MIRRORS.length];
    const x = -8 + (Math.floor(i / 4) % 17);
    const y = -7 + (Math.floor(i / 7) % 15);
    const k = 1 + (Math.floor(i / 11) % 6);
    if (x === 0 || y === 0) return null;         // keep the point off the axes
    const [ax, ay] = m.of(x, y, k);
    const pt = (a, b) => `(${a}, ${b})`;
    /* The other three mirrors are the distractors: choosing the wrong axis is
       the mistake, and it lands exactly on one of these. */
    const others = MIRRORS.filter(o => o !== m).map(o => o.of(x, y, k));
    const cand = others.map(([a, b]) => pt(a, b)).concat([pt(ay, ax), pt(-x, -y)]);
    if (cand.includes(pt(ax, ay))) return null;
    const q = mk("Geometry",
      `The point ${pt(x, y)} is reflected in ${m.name(k)}. What are the ` +
      `coordinates of the reflected point?`,
      pt(ax, ay), cand, 3, i);
    if (q) q.explain =
      `A reflection moves a point straight across the mirror line to the same ` +
      `distance on the other side, and leaves the other coordinate alone.\n\n` +
      (m.name(k) === "the x-axis"
        ? `The x-axis is the line y = 0, so x stays at ${x} and y flips sign: ` +
          `${y} becomes ${ay}.`
        : m.name(k) === "the y-axis"
        ? `The y-axis is the line x = 0, so y stays at ${y} and x flips sign: ` +
          `${x} becomes ${ax}.`
        : m.name(k).startsWith("the line x")
        ? `The mirror is vertical, so y stays at ${y}. The point is ` +
          `${Math.abs(x - k)} across from x = ${k}, so it lands ` +
          `${Math.abs(x - k)} the other side, at x = ${ax}.`
        : `The mirror is horizontal, so x stays at ${x}. The point is ` +
          `${Math.abs(y - k)} away from y = ${k}, so it lands ` +
          `${Math.abs(y - k)} the other side, at y = ${ay}.`) +
      `\n\nThe answer is ${pt(ax, ay)}. Reflecting in the wrong line is what ` +
      `the other options are — each one is the right method applied to a ` +
      `different mirror.`;
    return q;
  }

  /* Scatter graphs and correlation. The points are generated from a rule with a
     small wobble on top, so the correlation the question asks about is a fact
     about the data rather than an impression: the sign of the gradient in the
     rule IS the answer, and the wobble is kept too small to overturn it. */
  const SCATTER_SUBJECTS = [
    { x: "Hours of revision", y: "Test score", xMax: 10, yMax: 100, m: 8, c: 20 },
    { x: "Age of car (years)", y: "Value (£100s)", xMax: 10, yMax: 100, m: -8, c: 95 },
    { x: "Temperature (°C)", y: "Cups of soup sold", xMax: 25, yMax: 100, m: -3, c: 95 },
    /* Arm span against height was dropped: with a gradient of 1 and almost
       no intercept the points sat close enough to a line through the origin
       that "direct proportion" - offered as a distractor - was arguable, and
       spacing the points across the whole axis put children 20 cm tall on
       the graph. */
    { x: "Hours of TV each evening", y: "Test score", xMax: 8, yMax: 100, m: -10, c: 95 },
    { x: "Shoe size", y: "Maths score", xMax: 10, yMax: 100, m: 0, c: 55 },
    { x: "Rainfall (mm)", y: "Visitors to the park", xMax: 20, yMax: 100, m: -4, c: 92 },
    { x: "Minutes of exercise", y: "Resting heart rate", xMax: 60, yMax: 100, m: -0.5, c: 85 },
    { x: "Number of pages", y: "Minutes to read", xMax: 100, yMax: 100, m: 0.9, c: 5 }
  ];

  function statScatterCorrelation(i) {
    if (!D) return null;
    const S = SCATTER_SUBJECTS[i % SCATTER_SUBJECTS.length];
    const n = 8;
    const points = [];
    for (let k = 0; k < n; k++) {
      const x = Math.round(S.xMax * (k + 1) / (n + 1));
      /* A repeatable wobble, small next to the trend over the whole range. */
      const wob = ((i * 7 + k * 13) % 11) - 5;
      const y = Math.round(S.m * x + S.c + wob);
      if (y < 0 || y > S.yMax) return null;
      points.push([x, y]);
    }
    /* Decide the answer from the points, not from the rule that made them: if a
       later point is not reliably higher or lower there is no correlation to
       claim. Guards against a wobble large enough to break the trend. */
    const first = points[0][1], last = points[n - 1][1];
    const rise = last - first;
    const spread = Math.max(...points.map(p => p[1])) - Math.min(...points.map(p => p[1]));
    let kind;
    if (Math.abs(rise) < spread * 0.5) kind = "no";
    else kind = rise > 0 ? "positive" : "negative";
    if (kind !== "no" && S.m === 0) return null;
    if (kind === "no" && S.m !== 0) return null;
    const say = {
      positive: "Positive correlation: as one goes up, so does the other",
      negative: "Negative correlation: as one goes up, the other goes down",
      no: "No correlation: the two are not linked"
    };
    const wrong = Object.keys(say).filter(k2 => k2 !== kind).map(k2 => say[k2])
      .concat(["The two are in direct proportion, so one is a fixed multiple of the other"]);
    const q = mkFig("Statistics",
      `The scatter graph shows ${S.y.toLowerCase()} against ` +
      `${S.x.toLowerCase()} for eight children. Which statement best describes ` +
      `the relationship?`,
      say[kind], wrong, 3, i,
      D.scatter({ points, xLabel: S.x, yLabel: S.y, xMax: S.xMax, yMax: S.yMax }));
    if (q) q.explain =
      `Read the points from left to right and watch what happens to the height.\n\n` +
      `The leftmost point is at ${points[0][0]}, ${points[0][1]} and the ` +
      `rightmost is at ${points[n - 1][0]}, ${points[n - 1][1]}` +
      (kind === "no"
        ? `, and in between the heights go up and down with no pattern, so ` +
          `there is no correlation. Two things can both be measured without ` +
          `being connected at all.`
        : `, so overall the points ${kind === "positive" ? "rise" : "fall"} ` +
          `as you go right. That is ${kind} correlation.`) +
      `\n\nCorrelation is not the same as direct proportion: direct proportion ` +
      `would need the points to sit on a straight line through (0, 0), and ` +
      `these only follow a trend.`;
    return q;
  }

  /* Constructing triangles. The drawing itself cannot be asked for in a multiple
     choice, but the thing the construction teaches can be: which measurements
     pin a triangle down to exactly one, and which leave it free. Three angles
     fix the shape and not the size; two sides on their own fix nothing; and
     three sides only work if the two shorter ones can reach past the longest. */
  function geoTriangleUnique(i) {
    const sides = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [6, 7, 8], [9, 10, 11],
                   [4, 6, 7], [5, 6, 9], [7, 9, 12]][i % 8];
    const angles = [[40, 60, 80], [30, 70, 80], [50, 60, 70], [45, 55, 80],
                    [20, 60, 100], [35, 65, 80]][Math.floor(i / 8) % 6];
    if (angles.reduce((s, x) => s + x, 0) !== 180) return null;
    if (sides[0] + sides[1] <= sides[2]) return null;
    const [p, q2, r] = sides;
    const sss = `sides of ${p} cm, ${q2} cm and ${r} cm`;
    const sas = `sides of ${p} cm and ${q2} cm, with an angle of ${angles[0]}° between them`;
    const asa = `angles of ${angles[0]}° and ${angles[1]}°, with a side of ${r} cm between them`;
    const aaa = `angles of ${angles[0]}°, ${angles[1]}° and ${angles[2]}°`;
    /* Two shorter sides that cannot reach past the longest: no triangle at all. */
    const impossible = `sides of ${p} cm, ${q2} cm and ${p + q2 + 1} cm`;
    const twoSides = `sides of ${p} cm and ${q2} cm, and nothing else`;

    const askUnique = Math.floor(i / 3) % 2 === 1;
    const q = askUnique
      ? mk("Geometry",
          `Which of these sets of measurements describes exactly one triangle?`,
          sss, [aaa, impossible, twoSides], 4, i)
      : mk("Geometry",
          `Which of these sets of measurements does NOT describe exactly one ` +
          `triangle?`, aaa, [sss, sas, asa], 4, i);
    if (q) q.explain = askUnique
      ? `Three sides fix a triangle completely, as long as the two shorter ones ` +
        `add up to more than the longest: ${p} + ${q2} = ${p + q2}, which is ` +
        `more than ${r}, so ${sss} can be built, and only one shape fits.\n\n` +
        `Of the others: ${aaa} fixes the shape but not the size — you could ` +
        `draw it any size you liked and the angles would still be right. ` +
        `${impossible} cannot be built at all, because ${p} + ${q2} = ` +
        `${p + q2} is less than ${p + q2 + 1}, so those two sides cannot reach ` +
        `past the longest one. And two sides with nothing else leaves the angle ` +
        `between them free, so the triangle can be squeezed or opened out.`
      : `Three angles are not enough. They fix the SHAPE, but nothing in them ` +
        `says how big the triangle is: ${aaa} describes a whole family of ` +
        `triangles, every one a different size and all the same shape.\n\n` +
        `Each of the others pins down exactly one triangle. Three sides do it, ` +
        `as long as the two shorter reach past the longest. Two sides with the ` +
        `angle BETWEEN them do it, because the two arms are fixed and so is ` +
        `how far apart they open. Two angles with the side between them do it, ` +
        `because the third angle follows from 180° and the two arms can only ` +
        `meet in one place.`;
    return q;
  }

  /* Angles in parallel lines. Every one of the eight angles is either the marked
     angle or its supplement, and which of the two it is depends only on the
     position: the four that match sit diagonally opposite each other through the
     two crossings. Storing that as a set membership, rather than as a list of
     rules to look up, is what makes the answer derivable for any pair of
     positions the figure can show. */
  const ANGLE_SPOTS = [
    { line: "upper", vert: "above", side: "left",  same: true },
    { line: "upper", vert: "above", side: "right", same: false },
    { line: "upper", vert: "below", side: "left",  same: false },
    { line: "upper", vert: "below", side: "right", same: true },
    { line: "lower", vert: "above", side: "left",  same: true },
    { line: "lower", vert: "above", side: "right", same: false },
    { line: "lower", vert: "below", side: "left",  same: false },
    { line: "lower", vert: "below", side: "right", same: true }
  ];

  /* Why the two positions are related, in the language a child is taught. */
  function parallelReason(g, a) {
    if (g.line === a.line) {
      return g.vert !== a.vert && g.side !== a.side
        ? { name: "vertically opposite", equal: true }
        : { name: "angles on a straight line", equal: false };
    }
    if (g.vert === a.vert && g.side === a.side)
      return { name: "corresponding angles, in an F shape", equal: true };
    if (g.vert !== a.vert && g.side !== a.side)
      return { name: "alternate angles, in a Z shape", equal: true };
    return { name: "co-interior angles, in a C shape", equal: false };
  }

  function geoParallelLineAngles(i) {
    if (!D) return null;
    /* 8 given positions x 7 others x a set of angles: strides coprime with 8 and
       7 keep the three from turning over together. */
    const given = ANGLE_SPOTS[i % 8];
    const others = ANGLE_SPOTS.filter(p => p !== given);
    const ask = others[Math.floor(i / 8) % others.length];
    const theta = 34 + (Math.floor(i / 3) % 9) * 7;      // 34..90, never exactly 90
    if (theta === 90) return null;
    const ans = given.same === ask.same ? theta : 180 - theta;
    const why = parallelReason(given, ask);
    /* Sanity: the words and the set membership must agree, or the hint would
       explain a different relationship from the one the answer uses. */
    if (why.equal !== (given.same === ask.same)) return null;
    const cand = [180 - ans, 90, ans > 90 ? ans - 90 : ans + 90, 360 - ans]
      .filter(v => v !== ans && v > 0 && v < 180);
    const q = mkFig("Geometry",
      `The diagram shows two parallel lines crossed by a straight line. ` +
      `What is the size of the angle marked x?`,
      `${ans}°`, cand.map(v => `${v}°`), 3, i,
      D.parallelAngles({ given, givenValue: theta, ask, askLabel: "x" }));
    if (q) q.explain =
      `The two angles are ${why.name}.\n\n` +
      (why.equal
        ? `${why.name.startsWith("vertically")
            ? "Vertically opposite angles are equal, so x is the same as the " +
              "angle given."
            : why.name.startsWith("corresponding")
            ? "Corresponding angles sit in matching positions at the two " +
              "crossings, and because the lines are parallel they are equal."
            : "Alternate angles sit on opposite sides of the slanted line, one " +
              "at each crossing, and they are equal when the lines are parallel."}` +
          `\n\nSo x = ${theta}°.`
        : `${why.name.startsWith("angles on")
            ? "Angles on a straight line add up to 180°."
            : "Co-interior angles are between the two parallel lines on the " +
              "same side of the slanted line, and they add up to 180°."}` +
          `\n\nSo x = 180 − ${theta} = ${ans}°.`) +
      `\n\nEvery one of the eight angles in a diagram like this is either ` +
      `${theta}° or ${180 - theta}°, so the whole question is deciding which of ` +
      `the two this one is. ${180 - ans}° is offered, and it is the other one.`;
    return q;
  }

  /* Three-figure bearings: measured clockwise from north, always three digits. */
  /* Named BEARING_POINTS, not COMPASS: a COMPASS array of the eight direction
     names already exists further down this file, and two consts of the same name
     in one scope is a syntax error that takes the whole bank down. */
  const BEARING_POINTS = [["north", 0], ["north-east", 45], ["east", 90],
                   ["south-east", 135], ["south", 180], ["south-west", 225],
                   ["west", 270], ["north-west", 315]];
  const bearing3 = b => `${String(((b % 360) + 360) % 360).padStart(3, "0")}°`;

  function geoBearing(i) {
    const kind = i % 3;
    const [name, deg] = BEARING_POINTS[Math.floor(i / 3) % BEARING_POINTS.length];
    if (kind === 0) {
      /* A compass direction as a three-figure bearing. */
      const cand = [deg + 45, deg - 45, deg + 180, 360 - deg]
        .map(d => bearing3(d)).filter(o => o !== bearing3(deg));
      return mk("Geometry",
        `Bearings are measured clockwise from north and written with three ` +
        `figures. What is the bearing of ${name}?`,
        bearing3(deg), cand, 3, i);
    }
    if (kind === 1) {
      const cand = BEARING_POINTS.filter(([, d]) => d !== deg).map(([n]) => n);
      return mk("Geometry",
        `A ship sails on a bearing of ${bearing3(deg)}. In which direction ` +
        `is it sailing?`, name, cand, 3, i);
    }
    /* The way back: turn through half a full turn. */
    const out = 15 + (Math.floor(i / 3) % 23) * 10;
    if (out % 180 === 0) return null;
    const back = (out + 180) % 360;
    const cand = [360 - out, out, (out + 90) % 360, (out - 90 + 360) % 360]
      .map(d => bearing3(d)).filter(o => o !== bearing3(back));
    const q = mk("Geometry",
      `A walker sets off from her camp on a bearing of ${bearing3(out)}. ` +
      `What bearing must she walk on to return straight back to the camp?`,
      bearing3(back), cand, 3, i);
    if (q) q.explain =
      `Walking back is walking the opposite way, which is half a full turn ` +
      `from the way she came: add 180° to the bearing.\n\n` +
      `${out} + 180 = ${out + 180}${out + 180 >= 360 ?
        `, and a bearing is never 360° or more, so take a full turn off: ` +
        `${out + 180} − 360 = ${back}` : ""}. The bearing back is ` +
      `${bearing3(back)}.\n\n` +
      `Bearings are always written with three figures, which is why it is ` +
      `${bearing3(back)} and not ${back}°.`;
    return q;
  }

  /* Expanding two brackets and collecting the terms. */
  function algExpandBrackets(i) {
    const minus = i % 2 === 1;
    const a = 3 + (i % 5);                       // 3..7
    /* When the second bracket is subtracted its multiplier is kept below the
       first, so the x term stays positive. */
    const c = minus ? 2 + (Math.floor(i / 5) % (a - 2))
                    : 2 + (Math.floor(i / 5) % 5);
    const b = 1 + (Math.floor(i / 6) % 8), d = 1 + (Math.floor(i / 9) % 7);
    /* BOTH terms of a subtracted bracket change sign - the whole point of the
       question, and the thing this template originally got wrong. */
    const xs = minus ? a - c : a + c;
    const con = minus ? a * b - c * d : a * b + c * d;
    if (xs < 1) return null;
    /* One renderer for the answer and every distractor, so a sign or a
       coefficient of 1 is printed the same way everywhere. */
    const poly = (k, n) => {
      const head = k === 1 ? "x" : `${k}x`;
      return n === 0 ? head : n > 0 ? `${head} + ${n}` : `${head} − ${-n}`;
    };
    const ans = poly(xs, con);
    const cand = [
      poly(a + c, con),                    // added the x terms whatever the sign
      poly(xs, minus ? a * b + c * d : a * b - c * d),   // only one sign flipped
      poly(a + c, minus ? a * b + c * d : a * b - c * d),
      poly(a * c, con),                    // multiplied the two x terms
      poly(xs, con + 1)
    ].filter(o => o !== ans);
    const q = mk("Algebra",
      `Expand and simplify: ${a}(x + ${b}) ${minus ? "−" : "+"} ${c}(x + ${d})`,
      ans, cand, 3, i);
    if (q) q.explain =
      `Multiply everything inside each bracket by the number outside it.\n\n`+
      `${a}(x + ${b}) becomes ${a}x + ${a * b}, and ${c}(x + ${d}) becomes ` +
      `${c}x + ${c * d}.\n\n`+
      (minus
        ? `The second bracket is being SUBTRACTED, so both of its terms change ` +
          `sign — the x term as well as the number:\n`+
          `${a}x + ${a * b} − ${c}x − ${c * d}.\n\n`+
          `Collecting up: ${a}x − ${c}x = ${xs === 1 ? "x" : `${xs}x`}, and ` +
          `${a * b} − ${c * d} = ${con}.`
        : `Collecting up: ${a}x + ${c}x = ${xs}x, and ${a * b} + ${c * d} = ` +
          `${con}.`) +
      `\n\nSo the answer is ${ans}.` +
      (minus
        ? ` Subtracting only the number and still adding the x terms gives ` +
          `${poly(a + c, con)}, which is offered — it is the commonest slip ` +
          `there is with a subtracted bracket.`
        : "");
    return q;
  }

  /* Factorising fully: the options include partly-factorised forms, so "fully"
     has to be in the question or two of them would also be correct. */
  function algFactoriseSimple(i) {
    const f = [4, 6, 8, 9, 10, 12, 14, 15][i % 8];
    const p = 2 + (Math.floor(i / 8) % 7), r = 1 + (Math.floor(i / 5) % 9);
    if (gcd(p, r) !== 1) return null;          // or f is not the whole factor
    const A = f * p, B = f * r;
    const smaller = factorsOf(f).filter(g => g > 1 && g < f);
    if (!smaller.length) return null;
    const partial = smaller.map(g => `${g}(${A / g}x + ${B / g})`);
    const ans = `${f}(${p}x + ${r})`;
    const cand = partial.concat([`${f}(${p}x + ${B})`, `${f}x(${p} + ${r})`])
      .filter(o => o !== ans);
    const q = mk("Algebra", `Factorise fully: ${A}x + ${B}`, ans, cand, 3, i);
    if (q) q.explain =
      `Find the largest number that divides both ${A} and ${B}. ` +
      `${A} = ${f} × ${p} and ${B} = ${f} × ${r}, and ${p} and ${r} share no ` +
      `factor, so ${f} is as large as it goes.\n\n` +
      `Take ${f} outside the bracket and divide both terms by it: ` +
      `${A}x + ${B} = ${ans}.\n\n` +
      `"Fully" is doing work in this question. ${partial[0]} multiplies back ` +
      `out correctly too, but ${partial[0].slice(0, partial[0].indexOf("("))} ` +
      `is not the largest common factor, so the bracket can still be broken ` +
      `down further.`;
    return q;
  }

  /* Comparing two sets with an average AND the range: the Year 8 row is about
     holding both at once, so the sets are built to differ in only one of them. */
  function statCompareDistributions(i) {
    const mid = 8 + (i % 9);
    const spread = 2 + (Math.floor(i / 9) % 5);
    const wide = spread + 2 + (Math.floor(i / 5) % 4);
    /* Same mean by construction, symmetric about mid; the ranges differ. */
    const A = [mid - wide, mid - 1, mid, mid + 1, mid + wide];
    const B = [mid - spread, mid - 1, mid, mid + 1, mid + spread];
    const mean = xs => xs.reduce((s, x) => s + x, 0) / xs.length;
    const range = xs => Math.max(...xs) - Math.min(...xs);
    if (mean(A) !== mean(B)) return null;
    if (range(A) <= range(B)) return null;
    if (A.some(v => v <= 0) || B.some(v => v <= 0)) return null;
    const ans = "The two means are equal, but Alex's scores are more spread out";
    const cand = [
      "Alex has the higher mean, and his scores are more spread out",
      "Beth has the higher mean, and her scores are more spread out",
      "The two means are equal, and the two ranges are equal too",
      "Beth has the higher mean, but the two ranges are equal"
    ];
    const q = mk("Statistics",
      `Alex scored ${A.join(", ")} in five games. Beth scored ${B.join(", ")} ` +
      `in her five games. Which statement is true?`,
      ans, cand, 4, i);
    if (q) q.explain =
      `Two things have to be checked, not one.\n\n` +
      `Means: Alex totals ${A.reduce((s, x) => s + x, 0)} over 5 games, so his ` +
      `mean is ${mean(A)}. Beth totals ${B.reduce((s, x) => s + x, 0)}, so her ` +
      `mean is ${mean(B)} — the same.\n\n` +
      `Ranges: Alex spans ${Math.max(...A)} − ${Math.min(...A)} = ` +
      `${range(A)}. Beth spans ${Math.max(...B)} − ${Math.min(...B)} = ` +
      `${range(B)}. Alex's is wider.\n\n` +
      `So the averages say the two are equally good, and the range says Alex ` +
      `is the less reliable of the two. An average on its own hides that, ` +
      `which is why the two are always reported together.`;
    return q;
  }

  /* ── More Super Hard ──

     Decimals and Probability had no difficulty-4 template at all, and Sequences
     and Counting Principle had one each. These are written to 4 or more
     computations so they earn the band rather than being promoted into it.
     Money is counted in whole pence throughout: 0.2 has no exact binary form,
     so a bill worked in pounds lands on 15.360000000000001 sooner or later. */

  function decMultiStepBill(i) {
    /* Both prices are whole multiples of 20p, so the bill is too - and a
       multiple of 20 divides exactly by 10, by 5 and by 4, which is every
       discount this template uses. Without that the discount lands on a
       fraction of a penny and most seeds are thrown away. */
    const mainP = 240 + (i % 12) * 20;          // pence
    const sideP = 100 + (Math.floor(i / 12) % 9) * 20;
    const mains = 2 + (Math.floor(i / 5) % 4);
    const sides = 2 + (Math.floor(i / 7) % 4);
    const off = [10, 20, 25][Math.floor(i / 9) % 3];
    const grossP = mains * mainP + sides * sideP;
    const discountP = grossP * off / 100;
    if (!Number.isInteger(discountP)) return null;
    const netP = grossP - discountP;
    const noteP = [2000, 3000, 5000].find(n => n > netP);
    if (!noteP) return null;
    const money = p => `£${(p / 100).toFixed(2)}`;
    const wrong = [
      noteP - grossP,   // forgot the discount
      netP,             // gave the bill, not the change
      discountP,        // gave the saving
      grossP
    ].filter(v => v > 0 && v !== noteP - netP);
    const q = mk("Decimals",
      `A café sells jacket potatoes at ${money(mainP)} and side salads at ` +
      `${money(sideP)}. Nadia buys ${mains} jacket potatoes and ${sides} side ` +
      `salads. She has a voucher for ${off}% off the whole bill. She pays with ` +
      /* Notes are whole pounds: "a £20.00 note" is not how anyone says it. */
      `a £${noteP / 100} note. How much change should she get?`,
      money(noteP - netP), wrong.map(money), 4, i);
    if (q) q.explain =
      `Step 1. The potatoes: ${mains} × ${money(mainP)} = ${money(mains * mainP)}.\n\n` +
      `Step 2. The salads: ${sides} × ${money(sideP)} = ${money(sides * sideP)}. ` +
      `So the bill before the voucher is ${money(grossP)}.\n\n` +
      `Step 3. Take ${off}% off: ${off}% of ${money(grossP)} is ` +
      `${money(discountP)}, leaving ${money(grossP)} − ${money(discountP)} = ` +
      `${money(netP)}.\n\n` +
      `Step 4. Change from ${money(noteP)}: ${money(noteP)} − ${money(netP)} = ` +
      `${money(noteP - netP)}.\n\n` +
      `Every step is a place to stop too early. ${money(netP)} is the bill, ` +
      `${money(discountP)} is the saving, and ${money(noteP - grossP)} is the ` +
      `change if the voucher is forgotten — all three are offered.`;
    return q;
  }

  /* "At least one" is the question that is far easier backwards: count the ways
     it does NOT happen and take them off 1. */
  function probAtLeastOneOfColour(i) {
    const red = 2 + (i % 6);
    const blue = 3 + (Math.floor(i / 6) % 8);
    const total = red + blue;
    if (total < 5 || blue < 2) return null;
    /* P(no red) = both drawn from the blues. */
    const noRedNum = blue * (blue - 1), den = total * (total - 1);
    const ans = simp(den - noRedNum, den);
    const cand = [
      simp(noRedNum, den),                  // the complement, not the answer
      simp(red, total),                     // one draw only
      simp(red * (red - 1), den),           // both red
      simp(total - red, total)
    ].filter(o => o !== ans);
    const q = mk("Probability",
      `A bag holds ${red} red counters and ${blue} blue counters. Two counters ` +
      `are taken out at random, without replacement. What is the probability ` +
      `that at least one of them is red?`,
      ans, cand, 4, i);
    if (q) q.explain =
      `"At least one" covers one red or two reds, and adding those two cases up ` +
      `is slow. Turn it round: the only way to get NO red is to draw two blues.\n\n` +
      `Step 1. First counter blue: ${blue} of the ${total}.\n\n` +
      `Step 2. Second counter blue: one blue and one counter have gone, so ` +
      `${blue - 1} of the remaining ${total - 1}.\n\n` +
      `Step 3. Both blue: ${blue}/${total} × ${blue - 1}/${total - 1} = ` +
      `${simp(noRedNum, den)}.\n\n` +
      `Step 4. At least one red is everything else: 1 − ${simp(noRedNum, den)} = ` +
      `${ans}.\n\n` +
      `${simp(noRedNum, den)} is offered on its own — it is the probability of ` +
      `no red at all, which is the step before the answer, not the answer.`;
    return q;
  }

  /* Two sequences running towards each other: the rules have to be found before
     the question can even be started. */
  function seqTwoSequencesMeet(i) {
    const aStart = 3 + (i % 9), aStep = 4 + (Math.floor(i / 9) % 5);
    const bStart = 80 + (Math.floor(i / 4) % 9) * 5, bStep = 3 + (Math.floor(i / 7) % 4);
    let n = 1;
    while (n < 200 && aStart + (n - 1) * aStep <= bStart - (n - 1) * bStep) n += 1;
    if (n >= 200 || n < 3) return null;
    const term = k => [aStart + (k - 1) * aStep, bStart - (k - 1) * bStep];
    const cand = [n - 1, n + 1, n - 2, term(n)[0]].filter(v => v !== n && v > 0);
    const seqA = [0, 1, 2, 3].map(k => aStart + k * aStep).join(", ");
    const seqB = [0, 1, 2, 3].map(k => bStart - k * bStep).join(", ");
    const q = mk("Sequences",
      `Sequence A starts ${seqA} and carries on in the same way. Sequence B ` +
      `starts ${seqB} and carries on in the same way. At which term number is ` +
      `sequence A first greater than sequence B?`,
      `${n}`, cand.map(v => `${v}`), 4, i);
    if (q) q.explain =
      `Step 1. Find both rules. A goes up in ${aStep}s, so its nth term is ` +
      `${aStep}n ${aStart - aStep >= 0 ? "+ " + (aStart - aStep) : "− " + (aStep - aStart)}. ` +
      `B goes down in ${bStep}s, so its nth term is ` +
      `${bStart + bStep} − ${bStep}n.\n\n` +
      `Step 2. A gains on B by ${aStep} + ${bStep} = ${aStep + bStep} each term, ` +
      `and it starts ${bStart - aStart} behind.\n\n` +
      `Step 3. Check around where they cross. At term ${n - 1}, A is ` +
      `${term(n - 1)[0]} and B is ${term(n - 1)[1]}. At term ${n}, A is ` +
      `${term(n)[0]} and B is ${term(n)[1]}.\n\n` +
      `So term ${n} is the first where A is greater. The question asks WHICH ` +
      `TERM, not what the term is — ${term(n)[0]} is the value there, and it is ` +
      `offered as a trap.`;
    return q;
  }

  /* Two restrictions at once. The count is built by listing, because a formula
     for "even AND above a bound with no repeats" is easy to get wrong and the
     list is the thing a child is actually taught to organise. */
  function countTwoRestrictions(i) {
    const pools = [[1, 2, 3, 4, 5], [2, 3, 4, 5, 6], [1, 3, 4, 6, 7],
                   [2, 4, 5, 7, 8], [1, 2, 5, 6, 8], [3, 4, 5, 6, 9],
                   [1, 4, 6, 7, 8], [2, 3, 6, 7, 9], [1, 2, 4, 7, 9],
                   [2, 5, 6, 8, 9], [3, 4, 7, 8, 9], [1, 5, 6, 7, 8],
                   [2, 3, 4, 8, 9], [1, 2, 6, 7, 9], [3, 5, 6, 7, 8],
                   [1, 4, 5, 8, 9]][i % 16];
    const bound = pools[1 + (Math.floor(i / 16) % 3)] * 100;
    let count = 0;
    for (const a of pools) for (const b of pools) for (const c of pools) {
      if (a === b || b === c || a === c) continue;
      const v = a * 100 + b * 10 + c;
      if (v > bound && c % 2 === 0) count += 1;
    }
    if (count < 4) return null;
    const cand = [count + 4, count - 4, count * 2, count + 8]
      .filter(v => v > 0 && v !== count);
    const q = mk("Counting Principle",
      `Using the digits ${pools.join(", ")}, how many three-digit numbers ` +
      `greater than ${comma(bound)} can be made that are even, if no digit may ` +
      `be used more than once?`,
      `${count}`, cand.map(v => `${v}`), 4, i);
    return q;
  }

  /* Two reductions, worked backwards. Each stage has to be undone separately -
     the two percentages cannot be added together and taken off in one go. */
  function pctSuccessiveReverse(i) {
    const first = [10, 20, 25][i % 3];
    const second = [10, 20, 25][Math.floor(i / 3) % 3];
    const startP = (60 + (Math.floor(i / 9) % 12) * 10) * 100;   // whole pounds, in pence
    const afterFirst = startP * (100 - first) / 100;
    const finalP = afterFirst * (100 - second) / 100;
    if (!Number.isInteger(afterFirst) || !Number.isInteger(finalP)) return null;
    const money = p => `£${(p / 100).toFixed(2)}`;
    const wrong = [
      finalP * (100 + first + second) / 100,   // added the two percentages back
      afterFirst,                              // stopped one stage early
      finalP * (100 + second) / 100,
      startP - finalP
    ].filter(v => Number.isInteger(v) && v > 0 && v !== startP);
    const q = mk("Percentages",
      `A coat is reduced by ${first}% in a sale. In a later sale the new price ` +
      `is reduced by a further ${second}%. The coat now costs ${money(finalP)}. ` +
      `What did it cost before either reduction?`,
      money(startP), wrong.map(money), 4, i);
    if (q) q.explain =
      `Work backwards one sale at a time, undoing the later one first.\n\n` +
      `Step 1. The second sale took ${second}% off, so ${money(finalP)} is ` +
      `${100 - second}% of the price before it. Divide: ${money(finalP)} ÷ ` +
      `${(100 - second) / 100} = ${money(afterFirst)}.\n\n` +
      `Step 2. The first sale took ${first}% off, so ${money(afterFirst)} is ` +
      `${100 - first}% of the original. Divide again: ${money(afterFirst)} ÷ ` +
      `${(100 - first) / 100} = ${money(startP)}.\n\n` +
      `The two percentages cannot be added and taken off in one go, because the ` +
      `second one is a percentage of an already-reduced price, not of the ` +
      `original. Adding them gives ${money(finalP * (100 + first + second) / 100)}, ` +
      `which is offered.`;
    return q;
  }

  /* ── More Decimals ──

     The topic was broad at the bottom and thin at the top: eighteen templates,
     but only one above Hard. All the arithmetic below is done on integers and
     the decimal point is put in at the end, because 0.8 x 0.8 x 0.8 in binary
     floating point is 0.5120000000000001. */

  /* A quantity shrinking by the same factor each time - the shape behind bounce
     heights, depreciation and half-lives. The drop height is chosen so the
     answer comes out exact rather than rounded. */
  function decBounceHeight(i) {
    const FACTORS = [[1, 2, "half"], [3, 5, "three fifths"], [4, 5, "four fifths"],
                     [3, 4, "three quarters"]];
    const [p, den, words] = FACTORS[i % FACTORS.length];
    const bounces = 2 + (Math.floor(i / 4) % 2);
    const unit = Math.pow(den, bounces);          // makes the answer whole
    /* Cap k by what the unit allows rather than rejecting the seed afterwards:
       five cubed is already 125, so a fixed range of six would put most drops
       past 500 cm and throw them away. */
    const room = Math.max(1, Math.floor(500 / unit));
    const k = 1 + (Math.floor(i / 8) % room);
    const drop = unit * k;
    if (drop < 20) return null;
    const ans = Math.pow(p, bounces) * k;
    const dec = n => `${Number(n.toFixed(3))}`;
    const one = drop * p / den;
    const wrong = [
      one,                                        // stopped after one bounce
      drop * p * bounces / den,                   // multiplied instead of repeating
      Math.pow(p, bounces + 1) * k / den * den,   // one bounce too many
      drop - ans
    ].filter(v => v > 0 && Math.abs(v - ans) > 1e-9);
    const q = mk("Decimals",
      `A ball is dropped from a height of ${drop} cm. After every bounce it ` +
      `rises to ${words} (${dec(p / den)}) of the height it fell from. How high ` +
      `does it rise after the ${bounces === 2 ? "second" : "third"} bounce?`,
      `${dec(ans)} cm`, wrong.map(v => `${dec(v)} cm`), 4, i);
    if (q) q.explain =
      `Each bounce takes ${dec(p / den)} of the height before it, so the ` +
      `multiplying happens ${bounces} times over — it does not add up.\n\n` +
      `Bounce 1: ${drop} × ${dec(p / den)} = ${dec(one)} cm.\n` +
      `Bounce 2: ${dec(one)} × ${dec(p / den)} = ${dec(one * p / den)} cm.` +
      (bounces === 3
        ? `\nBounce 3: ${dec(one * p / den)} × ${dec(p / den)} = ${dec(ans)} cm.`
        : "") +
      `\n\nSo it reaches ${dec(ans)} cm. Multiplying the drop by ` +
      `${dec(p / den)} × ${bounces} instead gives ${dec(drop * p * bounces / den)} cm, ` +
      `which is offered — but the ball does not lose the same NUMBER of ` +
      `centimetres each time, it loses the same FRACTION, and the fraction is of ` +
      `a smaller height every bounce.`;
    return q;
  }

  /* A division handed over, then the place value moved. The digits never change;
     only where the point sits does. */
  function decDivideGivenFact(i) {
    const b = 12 + (i % 38);
    const c = 3 + (Math.floor(i / 38) % 12);
    const a = b * c;
    /* Shift the dividend down by 10 and the divisor stays, so the answer moves
       down by 10 as well - one clean step from the fact given. */
    const shown = a / 10, ansV = c / 10;
    const dec = n => `${Number(n.toFixed(4))}`;
    const wrong = [c, c / 100, c * 10].filter(v => Math.abs(v - ansV) > 1e-9);
    const q = mk("Decimals",
      `Given that ${comma(a)} ÷ ${b} = ${c}, work out ${dec(shown)} ÷ ${b}.`,
      dec(ansV), wrong.map(dec), 3, i);
    if (q) q.explain =
      `Nothing needs dividing again — the digits of the answer are already ` +
      `known, and only the place value changes.\n\n` +
      `${dec(shown)} is ${comma(a)} divided by 10, and the number being divided ` +
      `BY has not moved. Divide something 10 times smaller and the answer is 10 ` +
      `times smaller too: ${c} ÷ 10 = ${dec(ansV)}.\n\n` +
      `Answering ${c} is forgetting the shift altogether, and it is offered.`;
    return q;
  }

  /* Undoing a multiplication by a decimal below 1, where the answer is BIGGER
     than the number you started with. */
  function decReverseMultiply(i) {
    /* All multiples of 5, so n x hundredths is always a multiple of 5 and the
       product lands on at most two decimal places for every seed. */
    const hundredths = [15, 25, 35, 45, 55, 65, 75, 85, 95, 20, 40, 60, 80, 5][i % 14];
    const n = 12 + (Math.floor(i / 14) % 24);
    const productH = n * hundredths;                 // in hundredths
    const dec = v => `${Number(v.toFixed(4))}`;
    const mult = hundredths / 100, product = productH / 100;
    const wrong = [product * mult, product + mult, product / hundredths]
      .filter(v => Math.abs(v - n) > 1e-9);
    const q = mk("Decimals",
      `When a number is multiplied by ${dec(mult)}, the answer is ` +
      `${dec(product)}. What is the number?`,
      dec(n), wrong.map(dec), 3, i);
    if (q) q.explain =
      `Multiplying is undone by dividing, so the number is ${dec(product)} ÷ ` +
      `${dec(mult)} = ${n}.\n\n` +
      `Notice the answer is BIGGER than ${dec(product)}. That looks wrong until ` +
      `you see that multiplying by ${dec(mult)} — a number below 1 — makes ` +
      `things smaller, so undoing it has to make them bigger again. Multiplying ` +
      `by ${dec(mult)} a second time gives ${dec(product * mult)}, which is ` +
      `offered and is the wrong direction.`;
    return q;
  }

  /* Place value on its own: what does this have to be multiplied by? */
  function decPlaceValueChain(i) {
    const digits = [45, 6, 125, 3, 72, 8, 15, 24, 9, 36][i % 10];
    const downs = 2 + (i % 3);                        // 10^2 .. 10^4
    const ups = 1 + (Math.floor(i / 10) % 2);
    const small = digits / Math.pow(10, downs);
    const big = digits * Math.pow(10, ups);
    const factor = Math.pow(10, downs + ups);
    const dec = v => `${Number(v.toFixed(6))}`;
    const wrong = [factor / 10, factor * 10, Math.pow(10, downs)]
      .filter(v => v !== factor);
    const q = mk("Decimals",
      `What must ${dec(small)} be multiplied by to give ${comma(big)}?`,
      comma(factor), wrong.map(v => comma(v)), 3, i);
    if (q) q.explain =
      `Both numbers are made of the same digits, so this is only about how far ` +
      `the point has to move.\n\n` +
      `${dec(small)} → ${comma(big)} moves the digits ${downs + ups} places to ` +
      `the left, and every place to the left is another × 10. So the factor is ` +
      `10 multiplied by itself ${downs + ups} times, which is ${comma(factor)}.\n\n` +
      `Counting the places is the whole job — count one too few and you get ` +
      `${comma(factor / 10)}, which is offered.`;
    return q;
  }

  /* ── More Probability ── */

  /* The probabilities of everything that can happen add to 1, and two of the
     outcomes are tied together by a ratio - so the leftover has to be shared,
     not just read off. Worked in whole percentage points. */
  function probSumToOneUnknown(i) {
    const RATIOS = [[2, 1], [3, 1], [3, 2], [4, 1], [5, 1], [5, 3]];
    const [hi, lo] = RATIOS[i % RATIOS.length];
    const parts = hi + lo;
    /* Choose what green and yellow share FIRST, as a multiple of both the number
       of parts and 5, then split the rest between red and blue. Picking red and
       blue first and hoping the remainder divides threw away most seeds. */
    const step = lcm(parts, 5);
    const rest = step * (1 + (Math.floor(i / 6) % Math.max(1, Math.floor(65 / step))));
    const forRedBlue = 100 - rest;
    if (forRedBlue < 20) return null;
    const red = 5 * (1 + (Math.floor(i / 5) % Math.max(1, Math.floor(forRedBlue / 5) - 1)));
    const blue = forRedBlue - red;
    if (red <= 0 || blue <= 0) return null;
    const green = rest / parts * hi, yellow = rest / parts * lo;
    if (green === yellow) return null;
    const dec = v => `${Number((v / 100).toFixed(4))}`;
    const wrong = [yellow, rest, red + blue, green / 2, red, blue,
                   100 - green]
      .filter(v => v > 0 && v < 100 && v !== green);
    const q = mk("Probability",
      `A spinner has red, blue, green and yellow sections. The probability of ` +
      `red is ${dec(red)} and the probability of blue is ${dec(blue)}. The ` +
      `probabilities of green and yellow are in the ratio ${hi} : ${lo}. What ` +
      `is the probability of green?`,
      dec(green), wrong.map(dec), 4, i);
    if (q) q.explain =
      `Step 1. Everything that can happen adds to 1, so red, blue, green and ` +
      `yellow together make 1.\n\n` +
      `Step 2. Red and blue take ${dec(red)} + ${dec(blue)} = ${dec(red + blue)}, ` +
      `so green and yellow share what is left: 1 − ${dec(red + blue)} = ` +
      `${dec(rest)}.\n\n` +
      `Step 3. That ${dec(rest)} is split in the ratio ${hi} : ${lo}, which is ` +
      `${parts} equal parts. One part is ${dec(rest / parts)}.\n\n` +
      `Step 4. Green takes ${hi} of them: ${hi} × ${dec(rest / parts)} = ` +
      `${dec(green)}.\n\n` +
      `${dec(rest)} on its own is offered — that is green AND yellow together, ` +
      `which is the step before the answer.`;
    return q;
  }

  /* Expected frequency, asked backwards: not "how many would you expect" but
     "how many goes would it take". */
  function probExpectedReverse(i) {
    const sections = [4, 5, 6, 8, 10, 12][i % 6];
    const wanted = 1 + (Math.floor(i / 6) % (sections - 1));
    const target = sections * (2 + (Math.floor(i / 4) % 8));
    const spins = target / (wanted / sections);
    if (!Number.isInteger(spins) || spins > 2000) return null;
    const wrong = [target * wanted / sections, target * sections, target + sections,
                   spins / 2].filter(v => Number.isInteger(v) && v > 0 && v !== spins);
    const q = mk("Probability",
      `A fair spinner has ${sections} equal sections, ${wanted} of which are ` +
      `red. How many times would the spinner have to be spun to expect ` +
      `${comma(target)} reds?`,
      comma(spins), wrong.map(v => comma(v)), 3, i);
    if (q) q.explain =
      `The probability of red is ${wanted}/${sections}, so red is expected on ` +
      `${wanted} out of every ${sections} spins.\n\n` +
      `Turn it round: ${comma(target)} reds need ${comma(target)} ÷ ` +
      `${wanted}/${sections} spins, and dividing by a fraction means ` +
      `multiplying by it upside down: ${comma(target)} × ${sections}/${wanted} = ` +
      `${comma(spins)}.\n\n` +
      `Multiplying by ${wanted}/${sections} instead gives ` +
      `${comma(target * wanted / sections)}, which is how many reds you would ` +
      `expect in ${comma(target)} spins — the question the other way round, and ` +
      `it is offered.`;
    return q;
  }

  /* Two bags with unlike denominators: the comparison is the question. */
  function probCompareChances(i) {
    const rA = 2 + (i % 6), bA = 3 + (Math.floor(i / 6) % 7);
    const rB = 2 + (Math.floor(i / 5) % 6), bB = 3 + (Math.floor(i / 9) % 7);
    const tA = rA + bA, tB = rB + bB;
    if (rA * tB === rB * tA) return null;             // a tie has no answer
    const better = rA * tB > rB * tA ? "A" : "B";
    const ans = `Bag ${better}, with a probability of ${simp(better === "A" ? rA : rB, better === "A" ? tA : tB)}`;
    const other = `Bag ${better === "A" ? "B" : "A"}, with a probability of ` +
      `${simp(better === "A" ? rB : rA, better === "A" ? tB : tA)}`;
    const cand = [other,
      `Bag ${better}, with a probability of ${simp(better === "A" ? rA : rB, better === "A" ? bA : bB)}`,
      `The two bags give exactly the same chance`,
      `Bag ${better === "A" ? "B" : "A"}, with a probability of ${simp(better === "A" ? rB : rA, better === "A" ? bB : bA)}`
    ].filter(o => o !== ans);
    const q = mk("Probability",
      `Bag A holds ${rA} red and ${bA} blue counters. Bag B holds ${rB} red and ` +
      `${bB} blue counters. One counter is taken at random from each bag. Which ` +
      `bag gives the better chance of a red, and what is that probability?`,
      ans, cand, 3, i);
    if (q) q.explain =
      `Bag A gives ${rA} reds out of ${tA} counters, so ${simp(rA, tA)}. Bag B ` +
      `gives ${rB} out of ${tB}, so ${simp(rB, tB)}.\n\n` +
      `The denominators are different, so compare them across: ${rA} × ${tB} = ` +
      `${rA * tB} against ${rB} × ${tA} = ${rB * tA}. ` +
      `${better === "A" ? `${rA * tB} is the larger, so bag A` : `${rB * tA} is the larger, so bag B`} ` +
      `gives the better chance.\n\n` +
      `Comparing reds against BLUES rather than against the whole bag is the ` +
      `trap: the probability is reds out of everything in the bag, not reds for ` +
      `every blue.`;
    return q;
  }

  /* Three independent goes at the same thing. */
  function probThreeIndependent(i) {
    /* Every one of these leaves a whole number of tenths after subtracting, so
       squaring or cubing it stays inside three decimal places. */
    /* 50 is left out on purpose: at p = 0.5 the probability and its
       complement are the same number, so several distractors collapse into
       each other and mk is left short - which is when nudge() starts
       inventing values like 7.25 for a probability. */
    const pct = [10, 20, 30, 40, 60, 70][i % 6];
    const notPct = 100 - pct;
    const days = 2 + (Math.floor(i / 6) % 2);
    const askNone = Math.floor(i / 4) % 2 === 0;
    /* 6 x 2 x 2 is only 24 questions, so the setting varies too. 7 shares no
       factor with 6, 2 or 4, so it turns over independently of the rest. */
    const SETTINGS = [
      { thing: "a bus", bad: "late", verb: "is" },
      { thing: "a train", bad: "cancelled", verb: "is" },
      { thing: "a machine at a factory", bad: "faulty", verb: "is" }
    ];
    const S = SETTINGS[Math.floor(i / 7) % SETTINGS.length];
    const none = Math.pow(notPct, days) / Math.pow(100, days);
    const atLeast = 1 - none;
    const ans = askNone ? none : atLeast;
    const dec = v => `${Number(v.toFixed(6))}`;
    /* Every candidate is between 0 and 1 by construction, and there are enough
       of them that mk never has to invent one: nudge() knows nothing about
       probabilities and was offering 7.064 as an answer. */
    const wrong = [askNone ? atLeast : none,
                   Math.pow(pct / 100, days),          // the bad day every day
                   1 - Math.pow(pct / 100, days),      // its complement
                   days * pct / 100,                   // added, not multiplied
                   1 - days * pct / 100,
                   pct / 100,                          // just one day
                   notPct / 100]
      .filter(v => v > 0 && v < 1 && Math.abs(v - ans) > 1e-9);
    const q = mk("Probability",
      `The probability that ${S.thing} ${S.verb} ${S.bad} on any given day is ` +
      `${dec(pct / 100)}, and each day is independent of the others. What is ` +
      `the probability that it ${askNone
        ? `${S.verb} not ${S.bad} on any of the next ${days === 2 ? "two" : "three"} days`
        : `${S.verb} ${S.bad} on at least one of the next ${days === 2 ? "two" : "three"} days`}?`,
      dec(ans), wrong.map(dec), 4, i);
    if (q) q.explain =
      `Step 1. Not ${S.bad} on one day has probability 1 − ${dec(pct / 100)} = ` +
      `${dec(notPct / 100)}.\n\n` +
      `Step 2. Independent days multiply, so not ${S.bad} on any of them is ` +
      `${Array(days).fill(dec(notPct / 100)).join(" × ")} = ${dec(none)}.\n\n` +
      (askNone
        ? `That is what was asked, so the answer is ${dec(none)}.`
        : `Step 3. "At least one" is everything else: 1 − ${dec(none)} = ` +
          `${dec(atLeast)}.`) +
      `\n\nAdding ${dec(pct / 100)} ${days === 2 ? "twice" : "three times"} ` +
      `would give ${dec(days * pct / 100)}, ` +
      `and it is offered — but probabilities of separate days are multiplied, ` +
      `not added, and adding them can even take you past 1, which no ` +
      `probability can be.`;
    return q;
  }

  /* ── Circles ──

     KS3 Year 8, and a gap the bank had no cover for at all: not one question
     mentioned a circumference. QE Mock Paper 9 asked two circle questions and
     printed the formula in the question both times, so it is printed here too.
     At 11+ the thing being tested is whether the child works from the radius
     rather than the diameter, not whether they have memorised pi, and 3.14 is
     the value that paper used. */
  const PI = 3.14;
  /* Radii that keep both the area and the circumference tidy. */
  const tidyRadius = i => [5, 10, 15, 20, 25, 50][i % 6];

  function geoCircleArea(i) {
    /* 19 radii x 2 ways of stating them; the form must not be i % 2 or it would
       turn over in step with the radius and halve the variety. */
    const r = 2 + (i % 19);
    const asDiameter = Math.floor(i / 19) % 2 === 1;
    const ans = PI * r * r;
    const wrong = [
      PI * (2 * r) * (2 * r),   // squared the diameter instead of the radius
      2 * PI * r,               // gave the circumference
      PI * r                    // forgot to square at all
    ];
    if (new Set([ans, ...wrong]).size !== 4) return null;
    return mk("Geometry",
      `A circle has a ${asDiameter ? "diameter" : "radius"} of ` +
      `${asDiameter ? 2 * r : r} cm. What is its area? ` +
      `(Area of a circle = 3.14 × radius × radius)`,
      `${fmt(ans)} cm²`, wrong.map(w => `${fmt(w)} cm²`), 3, i);
  }

  function geoCircleCircumference(i) {
    const r = 2 + (i % 19);
    const asDiameter = Math.floor(i / 19) % 2 === 0;
    const ans = 2 * PI * r;
    const wrong = [
      PI * r,                   // forgot to double
      PI * r * r,               // gave the area
      2 * PI * (2 * r)          // doubled the diameter as well
    ];
    if (new Set([ans, ...wrong]).size !== 4) return null;
    return mk("Geometry",
      `A circle has a ${asDiameter ? "diameter" : "radius"} of ` +
      `${asDiameter ? 2 * r : r} cm. What is its circumference? ` +
      `(Circumference = 2 × 3.14 × radius)`,
      `${fmt(ans)} cm`, wrong.map(w => `${fmt(w)} cm`), 3, i);
  }

  /* Mock Paper 9 Q39: the circumference is given and the area is wanted, so the
     radius has to be recovered first. */
  function geoCircleAreaFromCircumference(i) {
    const r = 3 + (i % 23);
    const C = 2 * PI * r;
    const ans = PI * r * r;
    /* Using the circumference itself as a radius gives numbers in the tens of
       thousands with a third decimal place - implausible as an answer, so it
       teaches nothing and only clutters the options. These are the mistakes a
       child actually makes. */
    const wrong = [
      r * r,             // dropped pi
      2 * PI * r * r,    // doubled, mixing the two formulas
      PI * r,            // used the radius once, not twice
      C                  // restated the circumference
    ];
    const q = mk("Geometry",
      `The circumference of a circle is ${fmt(C)} cm. What is its area? ` +
      `(Circumference = 2 × 3.14 × radius, Area = 3.14 × radius × radius)`,
      `${fmt(ans)} cm²`, wrong.map(w => `${fmt(w)} cm²`), 4, i);
    if (q) q.explain =
      `Step 1. The circumference is 2 × 3.14 × radius, which is ` +
      `6.28 × radius. So work backwards to the radius: ` +
      `${fmt(C)} ÷ 6.28 = ${r} cm.\n\n` +
      `Step 2. Now use the radius in the area formula: ` +
      `3.14 × ${r} × ${r} = ${fmt(ans)} cm².\n\n` +
      `The radius is the bridge between the two formulas — there is no way ` +
      `from a circumference straight to an area, and putting ${fmt(C)} into ` +
      `the area formula gives ${fmt(PI * C * C)} cm², which is one of the ` +
      `options offered.`;
    return q;
  }

  /* Mock Paper 9 Q31: a circle cut out of a square, so the shaded part is what
     is left. Choosing the side as twice the radius makes the circle touch all
     four sides, which is what makes the side length knowable. */
  function geoCircleInSquare(i) {
    const r = 3 + (i % 12);
    const s = 2 * r;
    const bySide = Math.floor(i / 12) % 2 === 1;
    const ans = s * s - PI * r * r;
    const wrong = [
      PI * r * r,               // gave the circle, not what is left
      s * s,                    // forgot to take the circle away
      s * s - 2 * PI * r        // took away the circumference instead of the area
    ];
    if (new Set([ans, ...wrong]).size !== 4) return null;
    const q = mk("Geometry",
      `A circle is drawn inside a square so that it just touches all four ` +
      `sides. The ${bySide ? `square has a side of ${s} cm` :
        `circle has a radius of ${r} cm`}. What area of the square is ` +
      `left uncovered? (Area of a circle = 3.14 × radius × radius)`,
      `${fmt(ans)} cm²`, wrong.map(w => `${fmt(w)} cm²`), 4, i);
    if (q) q.explain =
      (bySide
        ? `Step 1. The circle touches all four sides, so the circle is as wide ` +
          `as the square: its diameter is ${s} cm, and its radius is half of ` +
          `that, ${r} cm.\n\n`
        : `Step 1. The circle touches all four sides, so the square's side is ` +
          `two radiuses across: 2 × ${r} = ${s} cm.\n\n`) +
      `Step 2. Area of the square: ${s} × ${s} = ${s * s} cm².\n\n` +
      `Step 3. Area of the circle: 3.14 × ${r} × ${r} = ${fmt(PI * r * r)} cm².\n\n` +
      `Step 4. What is left is the square minus the circle: ` +
      `${s * s} − ${fmt(PI * r * r)} = ${fmt(ans)} cm².\n\n` +
      (bySide
        ? `Halving is the step that is easy to miss. The side is given, not the ` +
          `radius, and putting ${s} into the area formula instead of ${r} would ` +
          `make the circle four times too big.`
        : `Finding the side length is the step that is easy to miss. The radius ` +
          `is given, not the side, and the circle touching all four sides is ` +
          `what tells you the side must be ${s} cm.`);
    return q;
  }

  /* ── Areas the bank had no cover for: trapezium, and working an area back ── */
  function meaTrapeziumArea(i) {
    const a = 4 + (i % 9);
    const b = a + 2 + ((i * 3) % 8);        // the longer parallel side
    const h = 2 * (2 + ((i * 5) % 6));      // even, so halving stays whole
    const ans = (a + b) / 2 * h;
    const wrong = [
      (a + b) * h,          // forgot to halve
      a * b,                // multiplied the parallel sides
      (a + b) / 2 + h       // added the height instead of multiplying
    ];
    if (!Number.isInteger(ans)) return null;
    if (new Set([ans, ...wrong]).size !== 4) return null;
    const q = mk("Measurement",
      `A trapezium has two parallel sides of ${a} cm and ${b} cm, and a ` +
      `perpendicular height of ${h} cm. What is its area?`,
      `${comma(ans)} cm²`, wrong.map(w => `${comma(w)} cm²`), 3, i);
    if (q) q.explain =
      `Add the two parallel sides, halve the total, then multiply by the ` +
      `height: (${a} + ${b}) ÷ 2 × ${h} = ${(a + b) / 2} × ${h} = ` +
      `${comma(ans)} cm².\n\n` +
      `Halving is the step that gets dropped — leaving it out gives ` +
      `${comma((a + b) * h)} cm², which is offered. Averaging the two parallel ` +
      `sides is what turns the trapezium into a rectangle of the same area, ` +
      `which is why the formula works.`;
    return q;
  }

  /* An area is given and a length is wanted, which is the half that gets
     practised least. The triangle's halving has to be undone, not applied. */
  function meaAreaFindMissingSide(i) {
    /* Base and height must not both turn on i % 8, or they move together and
       only eight questions exist. */
    const base = 2 * (3 + (i % 8));
    const height = 4 + (Math.floor(i / 8) % 12);
    /* A parallelogram as well as a triangle: "Area - parallelograms,
       trapeziums" is its own Year 8 row, and the pair makes the halving the
       thing that tells them apart rather than a rule to be recalled. */
    const triangle = i % 2 === 0;
    const area = triangle ? base * height / 2 : base * height;
    if (!Number.isInteger(area)) return null;
    const wrong = triangle
      ? [area / base, area * 2 * base, area - base, height + 2]
      : [2 * area / base, area - base, area / (2 * base), height + 2];
    const q = mk("Measurement",
      `A ${triangle ? "triangle" : "parallelogram"} has an area of ` +
      `${comma(area)} cm² and a base of ${base} cm. What is its ` +
      `perpendicular height?`,
      `${fmt(height)} cm`, wrong.map(w => `${fmt(w)} cm`), 3, i);
    if (q) q.explain = triangle
      ? `The area of a triangle is base × height ÷ 2, so going backwards the ` +
        `÷ 2 has to be undone first: double the area, then divide by the base.\n\n` +
        `${comma(area)} × 2 = ${comma(area * 2)}, and ${comma(area * 2)} ÷ ` +
        `${base} = ${fmt(height)} cm.\n\n` +
        `Dividing the area by the base without doubling gives ` +
        `${fmt(area / base)} cm — exactly half the right answer, and offered here.`
      : `The area of a parallelogram is base × height, with no halving, so ` +
        `going backwards is a single division: ${comma(area)} ÷ ${base} = ` +
        `${fmt(height)} cm.\n\n` +
        `A triangle would need the area doubled first, which here would give ` +
        `${fmt(2 * area / base)} cm — twice the right answer, and offered. A ` +
        `parallelogram is two of that triangle put together, which is why its ` +
        `formula has no half in it.`;
    return q;
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
    const speed = 10 * (2 + axis(i, 0, 8));
    const hours = 2 + axis(i, 1, 4);
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
    const q = mk("Statistics",
      `One angle of a scalene triangle is ${largest}°. Which of these could be the median ` +
      `of the three angles of the triangle?`,
      `${ans}°`, bad.map(b => `${b}°`),
      4, i);
    /* bad[0] is below the range and bad[1] and bad[2] are above it, which is
       what the guards above have just established - so each can be ruled out by
       name instead of in general. */
    if (q) q.explain =
      `Step 1. ${largest}° is more than half of 180°, so it must be the largest ` +
      `of the three: the other two have only 180 − ${largest} = ${rest}° to ` +
      `share between them.\n\n` +
      `Step 2. The triangle is scalene, so those two differ, and the median is ` +
      `the larger of them. Being the larger it must be more than half of ` +
      `${rest}, which is ${fmt(low)}°; and it must be less than ${rest}° ` +
      `itself, because the smallest angle still needs something. So the median ` +
      `lies between ${fmt(low)}° and ${rest}°.\n\n` +
      `Step 3. ${ans}° fits: the third angle is ${rest} − ${ans} = ` +
      `${rest - ans}°, and ${largest}, ${ans} and ${rest - ans} are all ` +
      `different and add to 180.\n\n` +
      `Why ${bad[0]}° cannot be it, even though it is small enough to be an ` +
      `angle: the third angle would be ${rest} − ${bad[0]} = ${rest - bad[0]}°, ` +
      `and ${rest - bad[0]} is bigger than ${bad[0]} — so ${rest - bad[0]}° ` +
      `would be the median instead. ${bad[1]}° and ${bad[2]}° are both larger ` +
      `than ${rest}°, which would leave the third angle at zero or below.`;
    return q;
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
    const n = 5 + axis(i, 0, 4);
    const ds = digitSet(axis(i, 1, 9), n);
    const k = 3 + (i % 2);
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
    const letters = 1 + axis(i, 0, 3), digits = 2 + axis(i, 1, 4);
    /* Which of the two may repeat is varied too: nine questions became
       twenty-four, and it is the rule itself the question is testing. */
    const lettersRepeat = axis(i, 2, 2) === 0;
    const ans = lettersRepeat ? 26 ** letters * nPr(10, digits)
                              : nPr(26, letters) * 10 ** digits;
    return mk("Counting Principle",
      `A code is made from ${letters} letter${letters > 1 ? "s" : ""} followed by ` +
      `${digits} digit${digits > 1 ? "s" : ""}. The ${lettersRepeat ? "letters" : "digits"} ` +
      `may be repeated but the ${lettersRepeat ? "digits" : "letters"} may not. How many ` +
      `different codes are possible?`,
      comma(ans),
      [comma(26 ** letters * 10 ** digits),  // let both repeat
       comma(nPr(26, letters) * nPr(10, digits)),   // let neither repeat
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
    const n = 5 + (i % 26);
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
                        "COFFEE", "BALLOON", "TOMATO", "ADDRESS", "MIRROR", "TATTOO",
                        "SETTEE", "CANNON", "PUPPET", "RABBIT", "KITTEN", "MITTEN",
                        "BUTTON", "CARROT", "PARROT", "FERRET", "TUNNEL", "SUMMER",
                        "WINNER", "BOTTLE", "KETTLE", "PUDDLE"];

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
      /* Six candidates, because ans x 2 and len!/2 coincide for several of the
         longer words now in the pool. */
      [comma(fact(word.length)),             // treated the repeats as different
       comma(ans * 2),
       comma(fact(word.length) / 2),
       comma(ans / 2), comma(ans + word.length), comma(fact(word.length - 1))],
      4, i);
  }

  /* Round a table there is no first seat, so one person is fixed. */
  function countCircular(i) {
    const n = 4 + (i % 8);
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
    const right = 2 + axis(i, 0, 6), down = 2 + axis(i, 1, 6);
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
    const fast = 15 + axis(i, 0, 6) * 5, slow = 5 + axis(i, 1, 4) * 5;
    if (fast <= slow) return null;
    const at = 1 + axis(i, 2, 4);
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
      /* ans/10 comes before ans*10 because mk() keeps only the first three
         distinct candidates: with the order the other way round, "50 x 0.01"
         offered 0.5 against 5000, 50 and 5, and the answer was the only option
         on the page with a decimal point in it. */
      [tidy(divide ? value * small : value / small),   // shifted the wrong way
       tidy(value),                                    // did not shift at all
       tidy(ans / 10), tidy(ans * 10)],
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

  /* ═══════════════════ HARDER PERCENTAGES, FRACTIONS, ALGEBRA ═══════════════════
     and one apiece for Speed, Numbers and Statistics. Nothing repeats an
     existing template: pctReverse works back from a plain percentage of a
     number, so the new one works back through a CHANGE; fracOfX takes a
     fraction of a number, so the new one is given the result; algInequalityInteger
     has a single solution, so the new one counts a range; spdAverageTwoLegs does
     two legs, so the new one does three; statMissingMean finds a missing value
     from a fixed count, so the new one changes the count. */

  /* Working back through a rise or a fall to what it was before. */
  function pctReverseAfterChange(i) {
    const original = 20 + 4 * axis(i, 0, 20);
    const pct = [10, 20, 25, 5, 50][axis(i, 1, 5)];
    const rise = axis(i, 2, 2) === 0;
    const after = rise ? original * (100 + pct) / 100 : original * (100 - pct) / 100;
    if (!Number.isInteger(after) || after <= 0) return null;
    return mk("Percentages",
      `After ${rise ? "an increase" : "a decrease"} of ${pct}%, a price is ` +
      `${fmtMoney(after)}. What was the price before the change?`,
      fmtMoney(original),
      [fmtMoney(rise ? after * (100 - pct) / 100 : after * (100 + pct) / 100),  // undid it the wrong way
       fmtMoney(after),                                                        // no change at all
       ...(rise && after - pct <= 0 ? [] :
         [fmtMoney(rise ? after - pct : after + pct)]),   // took off the percent as money
       fmtMoney(original + pct), fmtMoney(original - pct)],
      4, i);
  }

  /* Two changes one after the other, described as a single change. */
  function pctSingleEquivalent(i) {
    const up = [10, 20, 25, 50][axis(i, 0, 4)];
    const down = [10, 20, 25, 50][axis(i, 1, 4)];
    const factor = (100 + up) / 100 * (100 - down) / 100;
    const net = Math.round((factor - 1) * 1000) / 10;      // one decimal place
    if (!Number.isInteger(net) || net === 0) return null;
    const word = net > 0 ? "increase" : "decrease";
    return mk("Percentages",
      `A price is increased by ${up}% and then reduced by ${down}%. What single percentage ` +
      `change would have the same effect?`,
      `${Math.abs(net)}% ${word}`,
      [`${Math.abs(up - down)}% ${up > down ? "increase" : "decrease"}`,   // subtracted the percentages
       `${Math.abs(net)}% ${net > 0 ? "decrease" : "increase"}`,           // right size, wrong direction
       `${up + down}% increase`,
       `0% change`, `${Math.abs(net) + 1}% ${word}`],
      4, i);
  }

  /* Profit as a percentage of what it cost, not of what it sold for. */
  function pctProfitPercent(i) {
    const cost = 20 + 4 * axis(i, 0, 20);
    const pct = [10, 15, 20, 25, 30, 40, 50][axis(i, 1, 7)];
    const profit = cost * pct / 100;
    if (!Number.isInteger(profit)) return null;
    const sell = cost + profit;
    return mk("Percentages",
      `A shop buys a chair for ${fmtMoney(cost)} and sells it for ${fmtMoney(sell)}. ` +
      `What is the percentage profit?`,
      `${pct}%`,
      [`${Math.round(profit / sell * 1000) / 10}%`,   // over the selling price
       `${profit}%`,                                  // the profit in pounds as a percentage
       `${pct + 5}%`, `${pct - 5 > 0 ? pct - 5 : pct + 10}%`, `${100 - pct}%`],
      4, i);
  }

  /* ── Fractions ── */

  const mixed = (whole, n, d) => {
    if (!n) return `${whole}`;
    const g = gcd(n, d) || 1;
    return whole ? `${whole} ${n / g}/${d / g}` : `${n / g}/${d / g}`;
  };

  /* Mixed numbers with different denominators, added or taken away. */
  function fracMixedAddSubtract(i) {
    const d1 = 2 + axis(i, 0, 5), d2 = 2 + axis(i, 1, 6);
    if (d1 === d2) return null;
    const w1 = 1 + (i % 4), w2 = 1 + ((i + 1) % 3);
    const n1 = 1 + (i % (d1 - 1 || 1)), n2 = 1 + (i % (d2 - 1 || 1));
    if (n1 >= d1 || n2 >= d2) return null;
    const add = i % 2 === 0;
    const den = d1 * d2;
    const topA = w1 * den + n1 * d2, topB = w2 * den + n2 * d1;
    const total = add ? topA + topB : topA - topB;
    if (total <= 0) return null;
    const whole = Math.floor(total / den), rest = total - whole * den;
    const ans = mixed(whole, rest, den);
    const wrongTop = add ? topA + topB + d2 : topA - topB + d2;
    return mk("Fractions",
      `What is ${mixed(w1, n1, d1)} ${add ? "+" : "−"} ${mixed(w2, n2, d2)}?`,
      ans,
      [mixed(add ? w1 + w2 : w1 - w2, add ? n1 + n2 : Math.abs(n1 - n2), Math.max(d1, d2)),
       mixed(Math.floor(wrongTop / den), wrongTop - Math.floor(wrongTop / den) * den, den),
       mixed(whole + 1, rest, den), mixed(whole, rest + 1, den),
       mixed(whole - 1 >= 0 ? whole - 1 : whole + 2, rest, den)],
      3 + (i % 2), i);
  }

  /* Dividing a mixed number by a fraction: turn it improper first, then flip. */
  function fracDivideMixed(i) {
    const w = 1 + axis(i, 0, 4), d1 = 2 + axis(i, 1, 4);
    const n1 = 1 + (i % (d1 - 1 || 1));
    const n2 = 1 + (i % 3), d2 = n2 + 1 + axis(i, 2, 3);
    if (n1 >= d1 || n2 >= d2) return null;
    const top = (w * d1 + n1) * d2, bottom = d1 * n2;
    const g = gcd(top, bottom) || 1;
    const num2 = top / g, den2 = bottom / g;
    const whole = Math.floor(num2 / den2), rest = num2 - whole * den2;
    const ans = den2 === 1 ? `${num2}` : mixed(whole, rest, den2);
    /* Multiplying instead of dividing is the mistake worth showing. */
    const mt = (w * d1 + n1) * n2, mb = d1 * d2, mg = gcd(mt, mb) || 1;
    const mulTop = mt / mg, mulDen = mb / mg;
    const mulWhole = Math.floor(mulTop / mulDen);
    return mk("Fractions",
      `What is ${mixed(w, n1, d1)} ÷ ${n2}/${d2}?`,
      ans,
      [mulDen === 1 ? `${mulTop}` : mixed(mulWhole, mulTop - mulWhole * mulDen, mulDen),
       mixed(whole + 1, rest, den2), mixed(whole, rest + 1, den2 + 1),
       `${num2}/${den2}`, mixed(whole - 1 >= 0 ? whole - 1 : whole + 2, rest, den2)],
      4, i);
  }

  /* The fraction and the result are given; the number itself is wanted. */
  function fracReverseOf(i) {
    const d = 2 + axis(i, 0, 7), n = 1 + axis(i, 1, 6);
    if (n >= d) return null;
    const whole = d * (2 + axis(i, 2, 9));
    const part = whole * n / d;
    if (!Number.isInteger(part)) return null;
    return mk("Fractions",
      `${n}/${d} of a number is ${comma(part)}. What is the number?`,
      comma(whole),
      /* All whole numbers: part x n / d is a recurring decimal, and a single
         untidy option among four tidy ones is a giveaway. */
      [comma(part * d),                      // forgot to divide by the numerator
       comma(part * n),                      // multiplied by the numerator instead
       comma(part + d), comma(whole - d), comma(whole + d)],
      4, i);
  }

  /* ── Algebra ── */

  /* A shape's perimeter turned into an equation and solved. */
  function algPerimeterEquation(i) {
    const width = 4 + axis(i, 0, 12);
    const extra = 2 + axis(i, 1, 8);
    const perimeter = 2 * (width + width + extra);
    return mk("Algebra",
      `A rectangle is ${extra} cm longer than it is wide. Its perimeter is ${comma(perimeter)} cm. ` +
      `How wide is it?`,
      `${width} cm`,
      [`${width + extra} cm`,                // gave the length instead
       `${perimeter / 4} cm`,                // treated it as a square
       `${perimeter / 2 - extra} cm`,        // forgot to halve again
       `${width + 1} cm`, `${width - 1 > 0 ? width - 1 : width + 2} cm`],
      4, i);
  }

  /* How many whole numbers satisfy a compound inequality. */
  function algInequalityCount(i) {
    const k = 2 + axis(i, 0, 5);
    const lo = k * (2 + axis(i, 1, 6));
    const hi = lo + k * (3 + axis(i, 2, 6));
    /* Strict on both sides, so the ends are excluded. */
    let count = 0;
    for (let n = Math.floor(lo / k); n <= Math.ceil(hi / k); n++) if (k * n > lo && k * n < hi) count++;
    if (count < 2) return null;
    return mk("Algebra",
      `How many whole numbers n satisfy ${comma(lo)} < ${k}n < ${comma(hi)}?`,
      `${count}`,
      [`${count + 1}`,                       // counted an endpoint
       `${count + 2}`, `${(hi - lo) / k}`,
       `${count - 1}`, `${hi - lo}`],
      4, i);
  }

  /* ── One each for Speed, Numbers and Statistics ── */

  /* Average speed across three legs: total distance over total time. */
  function spdAverageThreeLegs(i) {
    const speeds = [[10, 20, 30], [20, 30, 60], [12, 24, 8], [15, 30, 10], [6, 12, 4],
                    [10, 15, 30], [20, 60, 30], [9, 18, 6], [30, 45, 90], [8, 24, 12],
                    [5, 10, 20], [14, 28, 7]][axis(i, 0, 12)];
    const dist = speeds.reduce((a, b) => a * b, 1) / 6 * (1 + axis(i, 1, 4));
    const times = speeds.map(s => dist / s);
    const total = times.reduce((a, b) => a + b, 0);
    const ans = 3 * dist / total;
    if (!Number.isInteger(ans) || !times.every(t => Number.isInteger(t * 60))) return null;
    return mk("Speed",
      `A cyclist rides ${comma(dist)} km at ${speeds[0]} km/h, then ${comma(dist)} km at ` +
      `${speeds[1]} km/h, then ${comma(dist)} km at ${speeds[2]} km/h. What is the average ` +
      `speed for the whole ride?`,
      `${comma(ans)} km/h`,
      [`${comma(Math.round(speeds.reduce((a, b) => a + b, 0) / 3))} km/h`,   // mean of the speeds
       `${comma(Math.max(...speeds))} km/h`, `${comma(Math.min(...speeds))} km/h`,
       `${comma(ans + 1)} km/h`, `${comma(ans - 1)} km/h`],
      4, i);
  }

  /* Kilometres per hour into metres per second. */
  function spdUnitConvert(i) {
    const kmh = 18 * (1 + axis(i, 0, 22));                // divides by 3.6 exactly
    const toMs = axis(i, 1, 2) === 0;
    const ms = kmh / 3.6;
    if (!Number.isInteger(ms)) return null;
    return toMs
      ? mk("Speed", `A train travels at ${comma(kmh)} km/h. What is that in metres per second?`,
          `${fmt(ms)} m/s`,
          [`${fmt(kmh / 60)} m/s`,           // divided by 60 once
           `${fmt(kmh * 3.6)} m/s`, `${fmt(kmh / 36)} m/s`,
           `${fmt(ms + 1)} m/s`, `${fmt(ms * 2)} m/s`],
          3 + (i % 2), i)
      : mk("Speed", `A train travels at ${fmt(ms)} m/s. What is that in kilometres per hour?`,
          `${comma(kmh)} km/h`,
          [`${fmt(ms * 60)} km/h`, `${fmt(ms / 3.6)} km/h`, `${comma(kmh / 2)} km/h`,
           `${comma(kmh + 10)} km/h`, `${fmt(ms * 36)} km/h`],
          3 + (i % 2), i);
  }

  /* Divisibility by 3, 9 or 11 without doing the division. */
  function numDivisibilityRule(i) {
    const by = [3, 9, 11, 6][axis(i, 0, 4)];
    const base = 1000 + axis(i, 1, 40) * 37;
    const good = base - (base % by);
    const bad = [good + 1, good + 2, good + by - 1].filter(v => v % by !== 0);
    if (bad.length < 3 || good < 100) return null;
    return mk("Numbers",
      `Which of these numbers divides exactly by ${by}?`,
      comma(good), bad.slice(0, 3).map(v => comma(v)).concat([comma(good + by + 1)]),
      3 + (i % 2), i);
  }

  /* The mean changes because the count changes too. */
  function statMeanAfterChange(i) {
    const count = 5 + axis(i, 0, 8);
    const meanBefore = 8 + axis(i, 1, 10);
    const meanAfter = meanBefore + 1 + axis(i, 2, 3);
    const added = (count + 1) * meanAfter - count * meanBefore;
    if (added <= 0) return null;
    return mk("Statistics",
      `The mean of ${count} numbers is ${meanBefore}. One more number is added and the mean ` +
      `becomes ${meanAfter}. What was the number that was added?`,
      comma(added),
      [comma(meanAfter),                     // just the new mean
       comma(meanAfter - meanBefore),        // just the change in the mean
       comma(count * meanBefore),            // the old total
       comma(added + 1), comma(added - 1)],
      4, i);
  }

  /* The smallest number having exactly so many factors. Searched rather than
     looked up, so the answer cannot drift from the question. */
  function numSmallestWithFactors(i) {
    const want = [4, 6, 8, 9, 10, 12, 5, 16][axis(i, 0, 8)];
    const countFactors = n => {
      let c = 0;
      for (let k = 1; k * k <= n; k++) {
        if (n % k) continue;
        c += (k * k === n) ? 1 : 2;
      }
      return c;
    };
    let ans = 0;
    for (let n = 1; n <= 4000; n++) if (countFactors(n) === want) { ans = n; break; }
    if (!ans) return null;
    /* Distractors are other numbers with a factor count near the target, so
       none of them is a second correct answer. */
    const near = [];
    for (let n = 2; n <= 200 && near.length < 5; n++) {
      if (n !== ans && countFactors(n) !== want) near.push(n);
    }
    const wrong = [ans + 1, ans - 1, ans * 2, want * 2, want * want]
      .filter(v => v > 0 && v !== ans && countFactors(v) !== want);
    if (wrong.length < 3) return null;
    return mk("Numbers",
      `What is the smallest whole number that has exactly ${want} factors?`,
      comma(ans), wrong.slice(0, 5).map(v => comma(v)),
      4, i);
  }

  /* ═══════════════════ SPEED AND COUNTING: FOUR MORE SHAPES ═══════════════════
     Widening the existing templates lifted both topics a long way, but these
     four are question shapes the bank could not ask at all. */

  /* Timetable arithmetic: the minutes cross the hour, which is the difficulty. */
  function spdTimetable(i) {
    const depH = 6 + axis(i, 0, 14), depM = 5 * axis(i, 1, 12);
    const runM = 35 + 5 * axis(i, 2, 14);
    const total = depH * 60 + depM + runM;
    if (total >= 24 * 60) return null;
    const arrH = Math.floor(total / 60), arrM = total % 60;
    const pad = n => `${n}`.padStart(2, "0");
    const askDuration = i % 2 === 0;
    const hrs = Math.floor(runM / 60), mins = runM % 60;
    const spell = (h, m) => (h ? `${h} hour${h > 1 ? "s" : ""}` : "") +
                            (h && m ? " " : "") + (m ? `${m} minutes` : "");
    return askDuration
      ? mk("Speed",
          `A train leaves at ${pad(depH)}:${pad(depM)} and arrives at ${pad(arrH)}:${pad(arrM)}. ` +
          `How long does the journey take?`,
          spell(hrs, mins),
          [spell(hrs, mins + 10 <= 59 ? mins + 10 : mins - 10),
           spell(hrs + 1, mins),
           /* Subtracting the clock digits as if they were decimals. */
           spell(arrH - depH, Math.abs(arrM - depM)),
           spell(hrs, 60 - mins || 30), spell(hrs - 1 >= 0 ? hrs - 1 : hrs + 2, mins)],
          3 + (i % 2), i)
      : mk("Speed",
          `A train leaves at ${pad(depH)}:${pad(depM)} and the journey takes ${spell(hrs, mins)}. ` +
          `What time does it arrive?`,
          `${pad(arrH)}:${pad(arrM)}`,
          [`${pad(depH + hrs)}:${pad(depM + mins > 59 ? depM + mins - 60 : depM + mins)}`,
           `${pad(arrH)}:${pad((arrM + 10) % 60)}`,
           `${pad(arrH + 1)}:${pad(arrM)}`,
           `${pad(arrH - 1 >= 0 ? arrH - 1 : arrH + 2)}:${pad(arrM)}`,
           `${pad(arrH)}:${pad((arrM + 30) % 60)}`],
          3 + (i % 2), i);
  }

  /* Out at one speed, back at another, total time known: find the distance.
     The pairs are chosen so that uv/(u+v) is a whole number, which makes the
     distance a whole number of kilometres for every whole number of hours. */
  const RETURN_PAIRS = [[20, 30], [12, 24], [10, 15], [30, 60], [6, 12],
                        [15, 30], [40, 60], [20, 80], [24, 8], [18, 9]];

  function spdReturnUnknownDistance(i) {
    const [u, v] = RETURN_PAIRS[axis(i, 0, 10)];
    const step = u * v / (u + v);
    if (!Number.isInteger(step)) return null;
    const hours = 2 + axis(i, 1, 6);
    const dist = step * hours;
    return mk("Speed",
      `A cyclist rides to a village at ${u} km/h and returns along the same road at ${v} km/h. ` +
      `The whole journey takes ${hours} hours. How far away is the village?`,
      `${comma(dist)} km`,
      [`${comma(dist * 2)} km`,              // gave the whole journey, not one way
       `${comma(Math.round((u + v) / 2 * hours))} km`,   // used the mean speed
       `${comma(u * hours)} km`, `${comma(v * hours)} km`,
       `${comma(Math.round(dist / 2))} km`],
      4, i);
  }

  /* A bracelet can be turned over as well as turned round, so each arrangement
     is counted twice by the round-table formula. */
  function countCircularReflect(i) {
    const n = 4 + (i % 7);
    const ans = fact(n - 1) / 2;
    if (!Number.isInteger(ans)) return null;
    return mk("Counting Principle",
      `${n} different beads are threaded onto a bracelet. Bracelets that are rotations of ` +
      `each other, or the same bracelet turned over, count as the same. How many different ` +
      `bracelets can be made?`,
      comma(ans),
      [comma(fact(n - 1)),                   // forgot it can be turned over
       comma(fact(n)),                       // treated it as a row
       comma(fact(n) / 2),
       comma(ans * 2), comma(fact(n - 2))],
      4, i);
  }

  /* Two independent choices, each a selection where order does not matter. */
  function countChooseFromTwoGroups(i) {
    const boys = 4 + axis(i, 0, 5), girls = 4 + axis(i, 1, 5);
    const pickB = 2 + axis(i, 2, 2), pickG = 2 + (i % 2);
    if (pickB >= boys || pickG >= girls) return null;
    const ans = nCr(boys, pickB) * nCr(girls, pickG);
    return mk("Counting Principle",
      `A team of ${pickB} boys and ${pickG} girls is chosen from ${boys} boys and ` +
      `${girls} girls. In how many ways can the team be chosen?`,
      comma(ans),
      [comma(nCr(boys, pickB) + nCr(girls, pickG)),        // added the two choices
       comma(nCr(boys + girls, pickB + pickG)),            // ignored the split
       comma(nPr(boys, pickB) * nPr(girls, pickG)),        // counted the orders
       comma(ans * 2), comma(nCr(boys, pickG) * nCr(girls, pickB))],
      4, i);
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

    /* speed and counting: four more shapes */
    spdTimetable: "Count on in two steps: first to the next whole hour, then the rest. Subtracting the clock digits as if they were ordinary numbers goes wrong, because an hour is 60 minutes and not 100.",
    spdReturnUnknownDistance: "Call the distance one way d. The time out is d divided by the first speed, the time back is d divided by the second, and those add to the total. Do not use the average of the two speeds.",
    countCircularReflect: "Start with the round-table count, (n - 1) factorial. A bracelet can also be turned over, so every arrangement has been counted twice - halve it.",
    countChooseFromTwoGroups: "The two choices are separate, so work each out and MULTIPLY. Order does not matter within either group, so both are choosing questions, not arranging ones.",

    /* harder percentages, fractions, algebra and the rest */
    pctReverseAfterChange: "After a 20% rise the price is 120% of what it was, so divide by 1.2 to get back - do not take 20% off the new price, because that 20% is of the wrong amount.",
    pctSingleEquivalent: "Percentages do not add. Turn each change into a multiplier and multiply those: a 20% rise means multiplying by 1.2, a 10% fall means multiplying by 0.9, and 1.2 × 0.9 = 1.08, which is an 8% rise overall.",
    pctProfitPercent: "Profit as a percentage is always OF THE COST, not of the selling price. Work out the profit, divide by what it cost, then multiply by 100.",
    fracMixedAddSubtract: "Turn both mixed numbers into improper fractions, put them over a common denominator, then combine. Adding the whole numbers and the fractions separately goes wrong as soon as the fractions carry over.",
    fracDivideMixed: "Make the mixed number improper first, then keep-flip-multiply. Dividing by a fraction below 1 makes the answer bigger, which is a useful check.",
    fracReverseOf: "You are given the part and want the whole, so work backwards. Divide by the numerator to find one part of the fraction, then multiply by the denominator.",
    algPerimeterEquation: "Call the width w, write the length as w plus the difference, and remember the perimeter counts each of them twice. Halve the perimeter first and the equation becomes much simpler.",
    algInequalityCount: "Divide right through by the number in front of n to get the range for n itself, then count the whole numbers strictly inside it. Both ends are excluded, so do not count them.",
    spdUnitConvert: "A kilometre is 1,000 metres and an hour is 3,600 seconds, so km/h to m/s means dividing by 3.6. Going the other way, multiply by 3.6.",
    spdAverageThreeLegs: "Average speed is the whole distance divided by the whole time, never the average of the speeds. Work out the time for each leg, add them up, then divide the total distance by that.",
    numDivisibilityRule: "You do not need to divide. A number divides by 3 if its digits add to a multiple of 3, and by 9 if they add to a multiple of 9. For 6 it must pass the test for 2 and for 3.",
    statMeanAfterChange: "Turn both means back into totals. The old total is the count times the old mean; the new total is one more item times the new mean. The number added is the difference.",
    numSmallestWithFactors: "Count the factors in pairs so none are missed. A number with an odd number of factors is a square. Work upwards and stop at the first one that has exactly the count asked for.",

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


  /* ═══════════ from the second question-bank/NewText scan ═══════════ */

  /* Examberry QE 14 Q59: "Tap A can fill 1/3 of a tank in 4 minutes. Tap B can
     fill 1/2 of the same tank in 3 minutes. How many minutes will it take to
     fill the empty tank if both taps are turned on?"

     The pool stores the two whole-tank times, chosen so that the combined time
     T1*T2/(T1+T2) is a whole number - a child who has done the work correctly
     should not then have to round. */
  const TAP_POOL = [
    [12, 3, 6, 2], [12, 3, 4, 2], [20, 4, 5, 5], [30, 5, 20, 4], [15, 3, 10, 2],
    [18, 3, 9, 3], [24, 4, 8, 2], [40, 5, 10, 2], [21, 3, 28, 4], [36, 4, 12, 3],
    [10, 2, 15, 5], [6, 2, 12, 4], [8, 2, 24, 3], [45, 5, 9, 3], [16, 4, 48, 6],
    [20, 5, 30, 5], [9, 3, 18, 6], [30, 6, 15, 3], [10, 5, 40, 8],
    [35, 5, 14, 7], [60, 6, 12, 4], [12, 6, 24, 8]
  ];

  function spdCombinedTaps(i) {
    const [t1, a, t2, b] = TAP_POOL[i % TAP_POOL.length];
    const ans = (t1 * t2) / (t1 + t2);
    if (!Number.isInteger(ans)) return null;
    const p = t1 / a, q = t2 / b;
    if (!Number.isInteger(p) || !Number.isInteger(q)) return null;
    const q1 = mk("Speed",
      `Tap A can fill 1/${a} of a tank in ${p} minutes. ` +
      `Tap B can fill 1/${b} of the same tank in ${q} minutes.\n\n` +
      `How many minutes will it take to fill the empty tank if both taps are ` +
      `turned on at the same time?`,
      `${ans} minutes`,
      [`${p + q} minutes`,                  // added the two times given
       /* "it takes as long as the quicker tap" - a plausible option BELOW the
          true answer, without which every distractor is larger and the answer
          can be picked out by "two taps must beat one" alone. */
       `${Math.min(p, q)} minutes`,
       `${t1 + t2} minutes`,                // added the two whole-tank times
       `${fmt((t1 + t2) / 2)} minutes`,     // averaged them
       `${Math.min(t1, t2)} minutes`,
       `${fmt(Math.abs(t1 - t2))} minutes`],
      4, i);
    if (q1) q1.explain =
      `Work out how long each tap needs for the WHOLE tank first: tap A fills ` +
      `1/${a} in ${p} minutes, so a full tank takes ${a} × ${p} = ${t1} minutes, ` +
      `and tap B takes ${b} × ${q} = ${t2} minutes. In one minute tap A fills ` +
      `1/${t1} of the tank and tap B fills 1/${t2}, so together they fill ` +
      `1/${t1} + 1/${t2} = 1/${ans} of it. Filling 1/${ans} each minute means the ` +
      `tank is full after ${ans} minutes. Adding the two times given (${p} + ${q}) ` +
      `is the trap: two taps together are always faster than either one alone.`;
    return q1;
  }

  /* Examberry 16 Q53: "The ages of a family of five add up to 84. The two
     youngest are 6 and 14. What was the sum of the ages of the family eight
     years ago?"

     The whole question turns on the youngest child not having been born yet,
     so the pool keeps youngest < gap <= second youngest, and that member is
     dropped from the total rather than counted as a negative age. */
  const AGE_POOL = [
    [5, 84, 6, 14, 8], [4, 96, 3, 12, 5], [5, 90, 4, 11, 7], [6, 120, 2, 15, 6],
    [4, 78, 5, 13, 9], [5, 105, 7, 16, 10], [6, 132, 3, 14, 8], [4, 88, 6, 12, 7],
    [5, 96, 2, 13, 6], [6, 108, 4, 17, 9], [4, 72, 3, 10, 5], [5, 110, 5, 15, 8],
    [5, 100, 4, 12, 9], [6, 126, 5, 16, 11], [4, 84, 2, 11, 6], [5, 88, 6, 15, 9],
    [6, 114, 3, 13, 7], [4, 92, 7, 14, 10], [5, 120, 5, 18, 12], [6, 140, 4, 15, 8]
  ];

  function logSumOfAgesAgo(i) {
    const [n, total, young, second, gap] = AGE_POOL[i % AGE_POOL.length];
    /* Exactly one member must be unborn, or the arithmetic below is wrong. */
    if (!(young < gap && gap <= second)) return null;
    const ans = (total - young) - (n - 1) * gap;
    if (ans <= 0) return null;
    const words = ["", "one", "two", "three", "four", "five", "six", "seven"];
    const q1 = mk("Logic",
      `The ages of a family of ${words[n]} add up to ${total}. ` +
      `The two youngest members of the family are ${young} and ${second}.\n\n` +
      `What was the sum of the ages of the family ${gap} years ago?`,
      `${ans}`,
      [`${total - n * gap}`,                    // counted all n, so the youngest went negative
       `${total - young - n * gap}`,            // dropped the youngest AND aged them down too
       `${total - (n - 1) * gap}`,              // aged n-1 down but left the youngest in
       `${total - young}`,
       `${ans + gap}`],
      4, i);
    if (q1) q1.explain =
      `${gap} years ago the youngest member, now ${young}, had not been born, so ` +
      `that family had only ${n - 1} people in it. Take the youngest out of the ` +
      `total first: ${total} − ${young} = ${total - young}. Each of the remaining ` +
      `${n - 1} people was ${gap} years younger, which is ${n - 1} × ${gap} = ` +
      `${(n - 1) * gap} years in all, so the sum was ${total - young} − ` +
      `${(n - 1) * gap} = ${ans}. Taking ${n} × ${gap} = ${n * gap} off the ` +
      `${total} gives ${total - n * gap}, which counts the youngest as having a ` +
      `negative age.`;
    return q1;
  }

  /* Examberry QE 13 Q50: a symbol is given a made-up meaning and then applied
     twice, the second time to its own result. The rule is printed in words
     because the paper prints it as a small worked example. */
  /* Every rule here has to stay sensible when it is applied to its OWN result,
     because the question always nests. A rule that squares - "a × a − b", or
     "(a − b) × (a + b)" - reaches five figures on the second step, which is out
     of register for the paper and, worse, leaves the answer as the only large
     option on the page. */
  const OP_POOL = [
    { sym: "⊕", rule: "a ⊕ b = (a × b) − (a + b)",
      f: (a, b) => a * b - (a + b) },
    { sym: "⊗", rule: "a ⊗ b = (a + b) × 2 − b",
      f: (a, b) => (a + b) * 2 - b },
    { sym: "⊙", rule: "a ⊙ b = (a − b) × 4 + b",
      f: (a, b) => (a - b) * 4 + b },
    { sym: "∆", rule: "a ∆ b = a × 3 − b × 2",
      f: (a, b) => a * 3 - b * 2 },
    { sym: "□", rule: "a □ b = a × 2 + b × 3",
      f: (a, b) => a * 2 + b * 3 }
  ];

  function logDefinedOperator(i) {
    const op = OP_POOL[i % OP_POOL.length];
    const a = 4 + axis(i, 0, 6), b = 2 + axis(i, 1, 5), c = 2 + axis(i, 2, 4);
    const inner = op.f(a, b);
    const ans = op.f(inner, c);
    if (!Number.isInteger(ans) || !Number.isInteger(inner)) return null;
    /* Both steps have to land somewhere a child could reach on paper, and the
       answer must not be the only option of a different magnitude. */
    if (inner < 2 || inner > 60 || ans < 2 || ans > 400) return null;
    /* The mistake worth catching is working left to right without the bracket,
       or applying the rule to the two original numbers and forgetting c. */
    const q1 = mk("Logic",
      `The symbol ${op.sym} has a special meaning:\n\n${op.rule}\n\n` +
      `What is the value of (${a} ${op.sym} ${b}) ${op.sym} ${c}?`,
      `${ans}`,
      [`${inner}`,                       // stopped after the bracket
       `${op.f(a, op.f(b, c))}`,         // bracketed the other pair
       `${op.f(a, b + c)}`,              // added c to b first
       `${ans + c}`, `${ans - c}`, `${inner + c}`],
      4, i);
    if (q1) q1.explain =
      `Do the bracket first, exactly as the rule is written: ${a} ${op.sym} ${b} ` +
      `= ${inner}. That answer now becomes the left-hand number, so the second ` +
      `step is ${inner} ${op.sym} ${c} = ${ans}. The symbol means nothing on its ` +
      `own — read the rule again for each step rather than guessing at it.`;
    return q1;
  }

  /* QE 14 EPP Q56: "the largest number of cubes of volume 8 cm3 that can fit
     into the 19 cm x 19 cm x 20 cm box. You cannot cut the cubes up."

     Dividing the volumes gives 902 and is offered as an option in the paper;
     the answer is 810, because 19 does not divide by 2 and the leftover
     1 cm slice is wasted. The pool therefore only holds boxes where at least
     one side leaves a remainder, or the trap would not be a trap. */
  const CUBE_BOX_POOL = [
    [2, 19, 19, 20], [2, 15, 11, 20], [3, 20, 20, 20], [3, 11, 14, 21],
    [2, 13, 17, 18], [4, 15, 18, 20], [3, 25, 16, 22], [2, 9, 21, 15],
    [5, 22, 18, 26], [4, 19, 22, 25], [3, 17, 19, 23], [2, 27, 13, 11],
    [2, 11, 13, 25], [3, 22, 17, 19], [4, 21, 23, 18], [2, 17, 15, 23],
    [5, 27, 24, 33], [3, 14, 16, 26], [2, 25, 19, 21], [4, 26, 30, 23]
  ];

  function meaCubePacking(i) {
    const [side, w, d, h] = CUBE_BOX_POOL[i % CUBE_BOX_POOL.length];
    const fit = Math.floor(w / side) * Math.floor(d / side) * Math.floor(h / side);
    const naive = Math.floor((w * d * h) / (side ** 3));
    if (naive === fit) return null;          // no trap, so not this question
    const q1 = mk("Measurement",
      `What is the largest number of cubes of volume ${side ** 3} cm³ that can ` +
      `fit into a ${w} cm × ${d} cm × ${h} cm box?\n\nYou cannot cut the cubes up.`,
      `${comma(fit)}`,
      [`${comma(naive)}`,                    // divided the volumes
       `${comma(naive + 1)}`,
       `${comma(Math.floor(w / side) * Math.floor(d / side) * Math.ceil(h / side))}`,
       `${comma(fit + Math.floor(w / side))}`, `${comma(fit - Math.floor(w / side))}`],
      4, i);
    if (q1) q1.explain =
      `A cube of volume ${side ** 3} cm³ has sides of ${side} cm. Work along each ` +
      `edge of the box separately and take the whole number of cubes that fits: ` +
      `${w} ÷ ${side} gives ${Math.floor(w / side)}, ${d} ÷ ${side} gives ` +
      `${Math.floor(d / side)}, ${h} ÷ ${side} gives ${Math.floor(h / side)}. ` +
      `That is ${Math.floor(w / side)} × ${Math.floor(d / side)} × ` +
      `${Math.floor(h / side)} = ${comma(fit)} cubes. Dividing the box's volume by ` +
      `the cube's volume gives ${comma(naive)}, but that answer quietly assumes the ` +
      `leftover slices can be melted together, and they cannot.`;
    return q1;
  }

  /* QE 16 EPP Q46: "how many factors of 400 are odd". Every odd factor of n is
     a factor of n with all its 2s stripped out, which is the whole method. */
  function numOddFactorCount(i) {
    const pool = [400, 360, 500, 144, 600, 200, 288, 900, 480, 252,
                  1000, 96, 540, 224, 756, 320, 588, 176, 648, 792];
    const n = pool[i % pool.length];
    let odd = n;
    while (odd % 2 === 0) odd /= 2;
    const ans = factorsOf(odd).length;
    const all = factorsOf(n).length;
    if (ans === all) return null;            // n is odd, so the question is empty
    const q1 = mk("Numbers",
      `How many factors of ${n} are odd?`,
      `${ans}`,
      [`${all}`,                             // every factor, not just the odd ones
       `${all - ans}`,                        // counted the even ones instead
       `${ans + 1}`, `${ans - 1}`, `${ans + 2}`],
      4, i);
    const pp = primePowers(n);
    const oddPP = pp.filter(([p]) => p !== 2);
    const twos = pp.find(([p]) => p === 2);
    /* A power of 2 has only one odd factor, 1, which is not a question. */
    if (!oddPP.length) return null;
    if (q1) q1.explain =
      `Work from the prime factors, not from a list — a list stops being ` +
      `countable as soon as the numbers grow.\n\n` +
      `Step 1. Break ${n} into primes: ${factorisationPhrase(n, pp)}.\n\n` +
      `Step 2. An odd number cannot have 2 as a factor, so throw the ` +
      `${twos[1] === 1 ? "2" : `2^${twos[1]}`} away and keep only the odd ` +
      `primes: ${powerString(oddPP)}.\n\n` +
      `Step 3. To count the factors of that, add 1 to each index and multiply ` +
      `them together: ${countFormula(oddPP)}.\n\n` +
      `So ${n} has ${ans} odd factors, and they are ` +
      `${factorsOf(odd).join(", ")}. ` +
      `Counting every factor of ${n} would give ${all}; the other ${all - ans} ` +
      `are even, and this question does not want them.`;
    return q1;
  }

  /* QE 14 EPP Q11: "the sum of the factors of 18 that are not factors of 9".
     The pool keeps b dividing a, so every factor of b really is a factor of a
     and the answer is the difference of the two factor sums. */
  const FACTOR_PAIR_POOL = [
    [18, 9], [20, 10], [24, 12], [30, 15], [36, 18], [28, 14], [40, 20],
    [45, 15], [50, 25], [54, 27], [48, 24], [42, 21], [60, 30], [32, 16],
    [63, 21], [56, 28], [72, 36], [44, 22], [66, 33], [75, 25]
  ];

  function numFactorsNotFactors(i) {
    const [a, b] = FACTOR_PAIR_POOL[i % FACTOR_PAIR_POOL.length];
    if (a % b !== 0) return null;
    const fa = factorsOf(a), fb = factorsOf(b);
    const kept = fa.filter(f => b % f !== 0);
    if (!kept.length) return null;
    const ans = kept.reduce((t, v) => t + v, 0);
    const sumA = fa.reduce((t, v) => t + v, 0);
    const sumB = fb.reduce((t, v) => t + v, 0);
    const q1 = mk("Numbers",
      `What is the sum of the factors of ${a} that are not factors of ${b}?`,
      `${ans}`,
      [`${sumA}`,                            // added every factor of a
       `${sumB}`,                            // added the factors of b instead
       `${kept.length}`,                     // counted them instead of adding
       `${sumA + sumB}`, `${ans - 1}`, `${ans + b}`],
      4, i);
    if (q1) q1.explain =
      `List both sets. The factors of ${a} are ${fa.join(", ")}; the factors of ` +
      `${b} are ${fb.join(", ")}. Cross out of the first list anything that ` +
      `appears in the second, which leaves ${kept.join(", ")}. Adding those gives ` +
      `${kept.join(" + ")} = ${ans}. The question asks for the total, not how many ` +
      `there are — that would be ${kept.length}.`;
    return q1;
  }

  /* QE 16 EPP Q10: "how many DIFFERENT prime factors does 60 have". Separate
     from numPrimeFactorCount, which asks for the count including repeats -
     for 60 those are 3 and 4, so the distinction is the question. */
  function numDistinctPrimeFactors(i) {
    const pool = [60, 72, 90, 84, 96, 210, 120, 126, 150, 198, 234, 100,
                  180, 66, 154, 105, 168, 220, 273, 350];
    const n = pool[i % pool.length];
    const primes = [];
    let m = n;
    for (let k = 2; k * k <= m; k++) while (m % k === 0) { if (!primes.includes(k)) primes.push(k); m /= k; }
    if (m > 1 && !primes.includes(m)) primes.push(m);
    const ans = primes.length;
    /* The count with repeats - the answer to the other question - is the
       distractor the papers rely on. */
    let repeats = 0, r = n;
    for (let k = 2; k * k <= r; k++) while (r % k === 0) { repeats++; r /= k; }
    if (r > 1) repeats++;
    const q1 = mk("Numbers",
      `How many different prime factors does ${n} have?`,
      `${ans}`,
      [`${repeats}`,                         // counted the repeats too
       `${factorsOf(n).length}`,             // counted all the factors
       `${ans + 1}`, `${ans - 1}`, `${ans + 2}`],
      4, i);
    if (q1) q1.explain =
      `Break ${n} into primes: ${n} = ${primes.map(p => {
        let e = 0, t = n; while (t % p === 0) { e++; t /= p; }
        return e > 1 ? `${p}^${e}` : `${p}`;
      }).join(" × ")}. The word "different" means count each prime once ` +
      `however often it appears, so the primes are ${primes.join(", ")} — ` +
      `that is ${ans}. Counting the repeats as well would give ${repeats}.`;
    return q1;
  }


  /* ═══ second NewText scan, batch 2 ═══ */

  /* A negative number inside a sum needs its brackets, or a hint reads
     "-1 - -6" at exactly the step children get wrong. */
  const neg = n => (n < 0 ? `(${n})` : `${n}`);
  const cap = w => w.charAt(0).toUpperCase() + w.slice(1);

  /* Spell a small count, for questions the papers write out in words. */
  const spellCount = n => n < 20 ? UNITS[n]
    : n % 10 === 0 ? TENS[Math.floor(n / 10)]
      : `${TENS[Math.floor(n / 10)]}-${UNITS[n % 10]}`;

  /* Examberry 16 Q44: a recipe for N items, a list of what is in the cupboard,
     and the most that can be made. Three ingredients have to be checked and the
     smallest wins; checking only the one with the biggest number is the trap,
     and one quantity is given in kilograms so the units have to be squared up
     first.

     Every pool row is chosen so the limiting ingredient divides exactly. A
     limit of three-and-a-half batches would leave "can she make half a batch?"
     to the reader, and that is an ambiguity, not a difficulty. */
  /* Every row divides exactly for ALL three ingredients, not only the limiting
     one: an ingredient that stretched to four and a half lots would put "45
     cookies" in the option list, and half a cookie is not an answer. */
  const RECIPE_POOL = [
    { made: 10, item: "cookies", ing: [["butter", 250, "g", 1500], ["eggs", 3, "", 9],
                                       ["chocolate chips", 200, "g", 800]] },
    { made: 12, item: "buns", ing: [["flour", 200, "g", 1400], ["eggs", 2, "", 8],
                                    ["sugar", 150, "g", 900]] },
    { made: 8, item: "muffins", ing: [["flour", 180, "g", 900], ["eggs", 3, "", 15],
                                      ["butter", 120, "g", 480]] },
    { made: 6, item: "pancakes", ing: [["flour", 150, "g", 1200], ["eggs", 2, "", 6],
                                       ["milk", 100, "ml", 500]] },
    { made: 20, item: "biscuits", ing: [["flour", 300, "g", 2100], ["eggs", 4, "", 20],
                                        ["butter", 250, "g", 1000]] },
    { made: 15, item: "scones", ing: [["flour", 220, "g", 1760], ["eggs", 3, "", 12],
                                      ["butter", 180, "g", 900]] },
    { made: 10, item: "jam tarts", ing: [["pastry", 240, "g", 1680], ["eggs", 5, "", 20],
                                         ["jam", 160, "g", 640]] },
    { made: 12, item: "bread rolls", ing: [["flour", 320, "g", 1920], ["eggs", 2, "", 10],
                                           ["milk", 200, "ml", 1000]] },
    { made: 24, item: "flapjacks", ing: [["oats", 400, "g", 2400], ["butter", 150, "g", 1050],
                                         ["syrup", 100, "g", 300]] },
    { made: 9, item: "brownies", ing: [["chocolate", 180, "g", 1440], ["eggs", 3, "", 9],
                                       ["flour", 120, "g", 720]] },
    { made: 18, item: "shortbreads", ing: [["butter", 280, "g", 1680], ["flour", 350, "g", 1750],
                                           ["sugar", 90, "g", 720]] },
    { made: 16, item: "cupcakes", ing: [["flour", 240, "g", 1200], ["eggs", 4, "", 24],
                                        ["butter", 200, "g", 1400]] },
    { made: 14, item: "crumpets", ing: [["flour", 260, "g", 2080], ["milk", 180, "ml", 540],
                                        ["yeast", 20, "g", 120]] },
    { made: 30, item: "oatcakes", ing: [["oats", 250, "g", 2000], ["butter", 100, "g", 400],
                                        ["salt", 10, "g", 70]] },
    { made: 25, item: "doughnuts", ing: [["flour", 300, "g", 1800], ["eggs", 5, "", 15],
                                         ["sugar", 150, "g", 1050]] },
    { made: 21, item: "waffles", ing: [["flour", 210, "g", 1470], ["eggs", 3, "", 18],
                                       ["milk", 160, "ml", 640]] },
    { made: 11, item: "eclairs", ing: [["pastry", 220, "g", 1320], ["cream", 150, "ml", 1200],
                                       ["chocolate", 110, "g", 330]] },
    { made: 13, item: "macarons", ing: [["ground almonds", 190, "g", 1520], ["eggs", 2, "", 8],
                                        ["sugar", 140, "g", 980]] }
  ];

  function ratLimitingIngredient(i) {
    const r = RECIPE_POOL[i % RECIPE_POOL.length];
    const batches = r.ing.map(([, per, , have]) => have / per);
    const limit = Math.min(...batches);
    /* Every ingredient, not only the limiting one, or a distractor comes out as
       a fraction of a cookie. */
    if (batches.some(b => !Number.isInteger(b)) || limit < 2) return null;
    const ans = limit * r.made;
    /* Mass in grams reads as kilograms once it passes 1000, the way a cupboard
       is actually labelled - and that conversion is half the question. */
    const amount = (n, unit) => unit === "g" && n >= 1000 ? `${n / 1000} kg`
      : unit ? `${comma(n)} ${unit}` : `${n}`;
    const needs = r.ing.map(([name, per, unit]) => `• ${amount(per, unit)} ${name}`).join("\n");
    const has = r.ing.map(([name, , unit, have]) => `• ${amount(have, unit)} ${name}`).join("\n");
    const sorted = [...batches].sort((a, b) => a - b);
    const q = mk("Ratio",
      `A recipe for ${r.made} ${r.item} needs:\n${needs}\n\n` +
      `Sarah's cupboard contains:\n${has}\n\n` +
      `What is the largest number of ${r.item} she can make?`,
      `${comma(ans)}`,
      [`${comma(Math.max(...batches) * r.made)}`,   // used only the roomiest ingredient
       `${comma(sorted[1] * r.made)}`,              // used the middle one
       `${comma(ans + r.made)}`,                    // one batch too many
       `${comma(limit)}`,                           // gave the batches, not the items
       `${comma(ans - r.made)}`],
      4, i);
    if (q) {
      /* Spell the conversion out. "1.2 kg ÷ 240 g" divides kilograms by grams,
         and squaring the units up is half of what this question is testing. */
      const lines = r.ing.map(([name, per, unit, have], k) => {
        const shown = amount(have, unit);
        const inBase = unit ? `${comma(have)} ${unit}` : `${have}`;
        const convert = shown === inBase ? "" : `${shown} is ${inBase}, and `;
        return `${name}: ${convert}${inBase} ÷ ${amount(per, unit)} = ` +
               `${fmt(batches[k])} lot${batches[k] === 1 ? "" : "s"}`;
      });
      const short = r.ing[batches.indexOf(limit)][0];
      q.explain =
        `Work out how many lots of the recipe each ingredient allows, then take ` +
        `the smallest — one ingredient running out stops everything. ` +
        `${lines.join("; ")}. The ${short} runs out first at ${limit} lots, so she ` +
        `can make ${limit} × ${r.made} = ${comma(ans)} ${r.item}. Answering ` +
        `${comma(Math.max(...batches) * r.made)} means only the ingredient she has ` +
        `most of was checked.`;
    }
    return q;
  }

  /* Examberry 16 Q48: rows 1 to N, one block closed, another block with fewer
     seats, the rest full. Three bands have to be kept apart, and the short
     block sits inside the open rows, not inside the closed ones. */
  const SEAT_POOL = [
    { rows: 80, shut: [15, 32], few: [36, 43], small: 5, full: 8 },
    { rows: 60, shut: [10, 21], few: [40, 45], small: 4, full: 7 },
    { rows: 100, shut: [25, 40], few: [70, 79], small: 6, full: 9 },
    { rows: 75, shut: [8, 19], few: [50, 58], small: 5, full: 10 },
    { rows: 90, shut: [30, 44], few: [60, 68], small: 4, full: 8 },
    { rows: 50, shut: [12, 20], few: [30, 36], small: 3, full: 6 },
    { rows: 120, shut: [40, 59], few: [95, 108], small: 7, full: 12 },
    { rows: 64, shut: [17, 28], few: [45, 52], small: 5, full: 9 },
    { rows: 70, shut: [20, 31], few: [50, 57], small: 4, full: 9 },
    { rows: 110, shut: [45, 62], few: [80, 91], small: 6, full: 11 },
    { rows: 55, shut: [14, 25], few: [35, 40], small: 3, full: 7 },
    { rows: 96, shut: [33, 50], few: [70, 81], small: 5, full: 10 },
    { rows: 45, shut: [9, 16], few: [28, 33], small: 4, full: 8 },
    { rows: 130, shut: [50, 71], few: [100, 113], small: 6, full: 12 },
    { rows: 85, shut: [22, 37], few: [60, 69], small: 5, full: 11 },
    { rows: 72, shut: [18, 29], few: [48, 55], small: 4, full: 9 },
    { rows: 66, shut: [11, 22], few: [40, 49], small: 3, full: 8 },
    { rows: 105, shut: [36, 53], few: [75, 86], small: 7, full: 10 }
  ];

  function logBandedSeatCount(i) {
    const b = SEAT_POOL[i % SEAT_POOL.length];
    const shut = b.shut[1] - b.shut[0] + 1;
    const few = b.few[1] - b.few[0] + 1;
    /* The short block must lie wholly outside the closed block, or a row would
       be counted in two bands at once. */
    if (b.few[0] <= b.shut[1] && b.few[1] >= b.shut[0]) return null;
    if (b.few[1] > b.rows) return null;
    const open = b.rows - shut;
    const normal = open - few;
    const ans = few * b.small + normal * b.full;
    const q = mk("Logic",
      `In a theatre the rows are numbered from 1 to ${b.rows}. ` +
      `Rows ${b.shut[0]} to ${b.shut[1]} are closed. ` +
      `Rows ${b.few[0]} to ${b.few[1]} have only ${b.small} seats each, ` +
      `while every other row has ${b.full} seats.\n\n` +
      `How many seats are available?`,
      `${comma(ans)}`,
      [`${comma(open * b.full)}`,                    // forgot the short rows
       `${comma(b.rows * b.full)}`,                  // forgot both bands
       `${comma((b.rows - few) * b.full + few * b.small)}`,  // forgot the closed rows
       `${comma(ans + b.full)}`, `${comma(ans - b.small)}`],
      4, i);
    if (q) q.explain =
      `Count the rows in each band before counting a single seat. Rows ` +
      `${b.shut[0]} to ${b.shut[1]} is ${b.shut[1]} − ${b.shut[0]} + 1 = ${shut} ` +
      `closed rows, so ${b.rows} − ${shut} = ${open} rows are open. Of those, ` +
      `rows ${b.few[0]} to ${b.few[1]} is ${few} rows with ${b.small} seats — ` +
      `${few} × ${b.small} = ${comma(few * b.small)} — and the remaining ` +
      `${open} − ${few} = ${normal} rows have ${b.full} seats, which is ` +
      `${normal} × ${b.full} = ${comma(normal * b.full)}. Together that is ` +
      `${comma(ans)}. Watch the "+ 1": a block from ${b.shut[0]} to ${b.shut[1]} ` +
      `includes both end rows.`;
    return q;
  }

  /* Examberry 16 Q46: two exchange rates between three toys, then four
     collections to value. Nothing can be compared until everything is priced in
     the same toy, which is the whole point. */
  const VALUE_POOL = [
    { a: "teddy bear", b: "toy car", c: "action figure", nb: 2, nc: 4, cd: 2, dd: 6 },
    { a: "kite", b: "marble", c: "yo-yo", nb: 3, nc: 6, cd: 3, dd: 12 },
    { a: "puzzle", b: "sticker", c: "badge", nb: 2, nc: 10, cd: 2, dd: 8 },
    { a: "drum", b: "whistle", c: "rattle", nb: 4, nc: 12, cd: 3, dd: 6 },
    { a: "robot", b: "counter", c: "dice", nb: 2, nc: 8, cd: 4, dd: 12 },
    { a: "train", b: "block", c: "flag", nb: 3, nc: 15, cd: 2, dd: 10 }
  ];

  function ratRelativeValueChain(i) {
    const v = VALUE_POOL[i % VALUE_POOL.length];
    /* Price everything in the middle toy: nb of A cost nc of B, and cd of C
       cost dd of B. */
    const aInB = v.nc / v.nb, cInB = v.dd / v.cd;
    if (!Number.isInteger(aInB) || !Number.isInteger(cInB)) return null;
    const plural = (n, word) => `${spellCount(n)} ${word}${n === 1 ? "" : "s"}`;
    /* A wide candidate list, then four collections whose values differ. Building
       exactly four straight from the seed made most seeds tie and threw them
       away: 13 questions survived out of 50, and only two distinct texts. */
    const shapes = [
      [0, 4, 3], [2, 0, 1], [1, 3, 0], [0, 2, 1], [3, 1, 1], [1, 0, 4],
      [0, 6, 2], [2, 2, 0], [4, 0, 2], [1, 5, 1], [0, 3, 4], [3, 0, 3],
      [2, 4, 1], [0, 8, 1], [5, 2, 0], [1, 1, 5], [0, 10, 3], [6, 0, 1]
    ];
    const seen = new Set();
    const sets = [];
    for (let k = 0; k < shapes.length && sets.length < 4; k++) {
      const [na, nbb, nc] = shapes[(k * 5 + i) % shapes.length];
      const worth = na * aInB + nbb + nc * cInB;
      if (seen.has(worth)) continue;
      seen.add(worth);
      const parts = [];
      if (na) parts.push(plural(na, v.a));
      if (nbb) parts.push(plural(nbb, v.b));
      if (nc) parts.push(plural(nc, v.c));
      sets.push({ label: parts.join(" and "), worth });
    }
    if (sets.length < 4) return null;
    const best = sets.reduce((x, y) => (y.worth > x.worth ? y : x));
    const rest = sets.filter(x => x !== best).sort((x, y) => y.worth - x.worth);
    const q = mk("Ratio",
      `${cap(spellCount(v.nb))} ${v.a}s cost the same as ${plural(v.nc, v.b)}. ` +
      `${cap(spellCount(v.cd))} ${v.c}s cost the same as ${plural(v.dd, v.b)}.\n\n` +
      `Which of these collections is worth the most?`,
      best.label, rest.map(x => x.label), 4, i);
    if (q) q.explain =
      `Put a price on everything in ${v.b}s first, because that is the only toy ` +
      `both facts mention. ${cap(spellCount(v.nb))} ${v.a}s cost ${v.nc} ${v.b}s, so ` +
      `one ${v.a} is worth ${aInB} ${v.b}s; ${spellCount(v.cd)} ${v.c}s cost ` +
      `${v.dd} ${v.b}s, so one ${v.c} is worth ${cInB} ${v.b}s. Now every ` +
      `collection can be added up in ${v.b}s: ${sets.map(x => `${x.label} = ${x.worth}`).join("; ")}. ` +
      `The largest is ${best.worth}, so the answer is ${best.label}. Counting the ` +
      `number of toys instead of their value is the trap.`;
    return q;
  }

  /* Examberry 16 Q45: the usual journey, then half the speed and some extra
     stops. Half the speed is twice the time - not half the time - and that is
     the one step the question is really asking about. */
  /* The journey time must be even. One distractor halves it - the "half the
     time" mistake the question is built around - and an odd run printed options
     like "10:50.5 am". */
  const BUS_POOL = [
    [8, 16, 140, 3, 10], [7, 45, 100, 2, 15], [9, 20, 90, 4, 5], [6, 50, 160, 3, 10],
    [8, 5, 80, 2, 20], [10, 35, 120, 3, 5], [7, 12, 110, 4, 10], [9, 48, 90, 2, 10],
    [6, 30, 130, 3, 10], [8, 40, 96, 2, 10], [7, 5, 146, 4, 5], [9, 55, 70, 3, 15],
    [6, 15, 174, 2, 10], [10, 10, 106, 4, 10], [8, 25, 130, 2, 15], [7, 50, 116, 3, 10],
    [9, 5, 80, 4, 15], [6, 45, 156, 2, 20]
  ];

  function spdHalfSpeedWithStops(i) {
    const [h, m, run, stops, each] = BUS_POOL[i % BUS_POOL.length];
    const usual = h * 60 + m + run;
    const late = h * 60 + m + run * 2 + stops * each;
    if (late >= 24 * 60 || run % 2) return null;
    const clock = t => {
      const hh = Math.floor(t / 60) % 24, mm = t % 60;
      const ampm = hh < 12 ? "am" : "pm";
      const show = hh % 12 === 0 ? 12 : hh % 12;
      return `${show}:${`${mm}`.padStart(2, "0")} ${ampm}`;
    };
    const q = mk("Speed",
      `A bus leaves its depot at ${clock(h * 60 + m)} each day and usually ` +
      `reaches its destination at ${clock(usual)}. One Monday, because of ice on ` +
      `the road, it travelled at half its usual speed for the whole journey. It ` +
      `also made ${spellCount(stops)} extra stops of ${each} minutes each.\n\n` +
      `What time did the bus reach its destination that Monday?`,
      clock(late),
      [clock(h * 60 + m + run * 2),                       // forgot the stops
       clock(h * 60 + m + run + stops * each),            // forgot the speed
       clock(h * 60 + m + run / 2 + stops * each),        // halved the time, not the speed
       clock(late + each), clock(late - each)],
      4, i);
    if (q) q.explain =
      `The usual journey takes ${clock(usual)} − ${clock(h * 60 + m)} = ${run} ` +
      `minutes. Half the speed means TWICE the time, not half of it: ` +
      `${run} × 2 = ${run * 2} minutes. The ${spellCount(stops)} stops add ` +
      `${stops} × ${each} = ${stops * each} minutes, giving ` +
      `${run * 2} + ${stops * each} = ${run * 2 + stops * each} minutes ` +
      `altogether. From ${clock(h * 60 + m)} that is ${clock(late)}. Halving the ` +
      `time instead of doubling it gives ${clock(h * 60 + m + run / 2 + stops * each)}, ` +
      `which has the bus arriving early on the day it was delayed.`;
    return q;
  }

  /* Examberry 16 Q49: a cuboid built from n identical cubes, its total volume
     given, and the surface area of ONE cube wanted. Divide first, then take the
     cube root, then six faces - three steps in a fixed order. */
  /* Count and side are paired explicitly rather than drawn from two indices.
     Taking the count from i % 14 and the side from axis(i, 1, 4) looked like it
     covered every combination and in fact never produced (24 cubes, side 3) -
     the paper's own question - because the two indices never coincided there. */
  const CLUSTER_POOL = [
    [24, 3], [8, 2], [12, 4], [16, 3], [18, 2], [27, 2], [32, 5], [36, 3],
    [40, 2], [48, 4], [54, 3], [60, 2], [64, 3], [72, 2], [20, 4], [30, 3],
    [45, 2], [50, 3], [90, 2], [21, 4]
  ];

  function meaCubeFromCluster(i) {
    const [n, side] = CLUSTER_POOL[i % CLUSTER_POOL.length];
    const one = side ** 3;
    const total = n * one;
    const ans = 6 * side * side;
    const q = mk("Measurement",
      `A sculpture in the shape of a cuboid is built from ${n} identical glass ` +
      `cubes. The volume of the whole sculpture is ${comma(total)} cm³.\n\n` +
      `What is the surface area of one glass cube?`,
      `${comma(ans)} cm²`,
      [`${comma(one)} cm²`,                    // gave the volume of one cube
       `${comma(side * side)} cm²`,            // one face, not six
       `${comma(6 * side)} cm²`,               // six times the side
       `${comma(n * ans)} cm²`,                // every cube's surface added up
       `${comma(4 * side * side)} cm²`],
      4, i);
    if (q) q.explain =
      `Three steps, in this order. One cube's volume is ` +
      `${comma(total)} ÷ ${n} = ${comma(one)} cm³. A cube of volume ${comma(one)} ` +
      `has sides of ${side} cm, because ${side} × ${side} × ${side} = ${comma(one)}. ` +
      `A cube has six square faces, so the surface area is 6 × ${side} × ${side} = ` +
      `${comma(ans)} cm². Stopping at ${comma(one)} gives the volume, not the ` +
      `surface area, and one face alone is ${comma(side * side)} cm².`;
    return q;
  }

  /* Examberry 16 Q47: one end of a line and its midpoint are given, and the far
     end is wanted. The midpoint is not "the difference" - it is halfway, so the
     step from A to the midpoint has to be taken twice. */
  function geoMissingEndpoint(i) {
    const ax = -6 + axis(i, 0, 12), ay = -6 + axis(i, 1, 12);
    const dx = 1 + axis(i, 2, 6), dy = 1 + ((i + 3) % 6);
    const mx = ax + dx, my = ay + dy;
    const bx = mx + dx, by = my + dy;
    if (Math.abs(bx) > 20 || Math.abs(by) > 20) return null;
    const askX = i % 2 === 0;
    const known = askX ? by : bx;
    const q = mk("Geometry",
      `Point A has coordinates (${ax}, ${ay}). ` +
      `Point B has coordinates ${askX ? `(d, ${known})` : `(${known}, d)`}. ` +
      `The midpoint of the line joining A and B is (${mx}, ${my}).\n\n` +
      `What is the value of d?`,
      `${askX ? bx : by}`,
      /* Integers only: averaging A with the midpoint - the other obvious
         mistake - lands on a half whenever the step is odd, and one decimal
         among three whole numbers is discounted on sight. */
      [`${askX ? dx : dy}`,                       // gave the step, not the far end
       `${askX ? mx : my}`,                       // gave the midpoint back
       `${askX ? mx + 2 * dx : my + 2 * dy}`,     // stepped twice from the midpoint
       `${askX ? ax : ay}`,                       // gave A's coordinate
       `${askX ? ax - dx : ay - dy}`],            // stepped the wrong way
      4, i);
    if (q) q.explain =
      `The midpoint is halfway, so whatever step takes you from A to it takes ` +
      `you the same distance again to B. Along the ${askX ? "x" : "y"}-axis, A is ` +
      `at ${askX ? ax : ay} and the midpoint is at ${askX ? mx : my}, a step of ` +
      `${askX ? mx : my} − ${neg(askX ? ax : ay)} = ${askX ? dx : dy}. Take that step ` +
      `again: ${askX ? mx : my} + ${askX ? dx : dy} = ${askX ? bx : by}, so ` +
      `d = ${askX ? bx : by}. Checking it the other way round, ` +
      `(${askX ? ax : ay} + ${neg(askX ? bx : by)}) ÷ 2 = ${askX ? mx : my}. ` +
      `Answering ${askX ? dx : dy} gives the step rather than the point.`;
    return q;
  }


  /* ═══════════ single-occurrence gaps from the NewText scan ═══════════ */

  /* Examberry 16 Q51: "When it is 3 o'clock in the afternoon in New York, it is
     8 o'clock in the evening in London. The time in Los Angeles is 3 hours
     behind New York. John started his workout in Los Angeles at 7 o'clock
     yesterday morning. What was the time in London at that moment?"

     Two offsets, and only one of them is stated. The other has to be read off a
     pair of clock times, which is what makes this harder than logTimeZone -
     and the answer can land on a different day, so the day is part of it. */
  const ZONE_CHAIN = [
    { hub: "New York", far: "London", near: "Los Angeles", hubToFar: 5, nearToHub: 3 },
    { hub: "London", far: "Tokyo", near: "New York", hubToFar: 9, nearToHub: -5 },
    { hub: "Paris", far: "Delhi", near: "Rio", hubToFar: 4, nearToHub: -5 },
    { hub: "London", far: "Sydney", near: "Chicago", hubToFar: 10, nearToHub: -6 },
    { hub: "New York", far: "Berlin", near: "Denver", hubToFar: 6, nearToHub: 2 },
    { hub: "Cairo", far: "Beijing", near: "Lisbon", hubToFar: 6, nearToHub: -2 },
    { hub: "London", far: "Nairobi", near: "Toronto", hubToFar: 3, nearToHub: -5 },
    { hub: "Madrid", far: "Karachi", near: "Reykjavik", hubToFar: 4, nearToHub: -1 }
  ];

  /* 14 -> "2 o'clock in the afternoon", so the printed clock times read the way
     the paper writes them rather than as 24-hour numbers. */
  const spellClock = h => {
    const part = h === 0 ? "midnight" : h === 12 ? "midday"
      : h < 12 ? "in the morning" : h < 18 ? "in the afternoon" : "in the evening";
    if (h === 0 || h === 12) return part;
    const twelve = h % 12 === 0 ? 12 : h % 12;
    return `${twelve} o'clock ${part}`;
  };
  /* The answer has to say WHICH day when the chain crosses midnight. */
  const dayWord = d => (d === 0 ? "" : d > 0 ? " the next day" : " the day before");

  function logTimeZoneChain(i) {
    const z = ZONE_CHAIN[i % ZONE_CHAIN.length];
    /* A clock time in the hub, and the same moment in the far city, from which
       the child derives hubToFar without being told it. */
    const hubHour = 9 + axis(i, 0, 8);
    const farHour = ((hubHour + z.hubToFar) % 24 + 24) % 24;
    /* The moment asked about, given in the near city. */
    const nearHour = 5 + axis(i, 1, 10);
    const hubAt = nearHour + z.nearToHub;
    const farAt = hubAt + z.hubToFar;
    const day = Math.floor(farAt / 24);
    const farClock = ((farAt % 24) + 24) % 24;
    /* Keep the two illustrating clock times on the same day, or the sentence
       that sets the offset up needs a day label of its own and stops being a
       clean way to state it. */
    if (hubHour + z.hubToFar < 0 || hubHour + z.hubToFar > 23) return null;
    if (Math.abs(day) > 1) return null;
    const said = z.nearToHub >= 0
      ? `${z.nearToHub} hours behind ${z.hub}`
      : `${-z.nearToHub} hours ahead of ${z.hub}`;
    const label = (h, d) => spellClock(h) + dayWord(d);
    const wrongDir = ((nearHour - z.nearToHub + z.hubToFar) % 24 + 24) % 24;
    const onlyOne = ((nearHour + z.hubToFar) % 24 + 24) % 24;
    const q = mk("Logic",
      `When it is ${spellClock(hubHour)} in ${z.hub}, it is ${spellClock(farHour)} ` +
      `in ${z.far}. The time in ${z.near} is ${said}.\n\n` +
      `A runner sets off in ${z.near} at ${spellClock(nearHour)}. ` +
      `What is the time in ${z.far} at that moment?`,
      label(farClock, day),
      [label(wrongDir, 0),                                  // stepped the wrong way
       label(onlyOne, 0),                                   // used only the stated offset
       label(((nearHour + z.nearToHub) % 24 + 24) % 24, 0), // stopped at the hub
       label(farClock, 0),                                  // right time, wrong day
       label(((farClock + 12) % 24), day)],
      4, i);
    if (q) q.explain =
      `Work out the missing offset first. It is ${spellClock(hubHour)} in ${z.hub} ` +
      `and ${spellClock(farHour)} in ${z.far} at the same moment, so ${z.far} is ` +
      `${z.hubToFar} hours ahead of ${z.hub}. Now go through the hub rather than ` +
      `jumping straight across: ${z.near} is ${said}, so when it is ` +
      `${spellClock(nearHour)} in ${z.near} it is ${spellClock(((hubAt % 24) + 24) % 24)} ` +
      `in ${z.hub}; add the ${z.hubToFar} hours to reach ${z.far} and you get ` +
      `${label(farClock, day)}. Two steps, each in the right direction — and ` +
      `check whether the second one has taken you past midnight.`;
    return q;
  }

  /* Examberry 16: a target for the month, some days already done, and the
     average needed from here. statMissingMean finds ONE missing number given
     the mean, which is a different question. */
  function statRequiredAverage(i) {
    const days = 4 + axis(i, 0, 4);            // days already done
    const left = 3 + axis(i, 1, 5);            // days remaining
    const doneEach = 12 + axis(i, 2, 9);
    const needEach = 15 + (i % 11);
    const done = days * doneEach;
    const target = done + left * needEach;
    /* If the rate needed happens to equal the rate already managed, or the
       whole-month average, then a distractor is the answer - and the hint goes
       on to call the answer a mistake. */
    if (needEach === doneEach) return null;
    if (Math.round(target / (days + left)) === needEach) return null;
    const q = mk("Statistics",
      `Ravi wants to read ${comma(target)} pages this month. ` +
      `He has read ${doneEach} pages on each of the first ${days} days.\n\n` +
      `There are ${left} days of the month left. How many pages a day must he ` +
      `average over those ${left} days to reach his target?`,
      `${needEach}`,
      [`${Math.round(target / (days + left))}`,   // averaged over the whole month
       `${Math.round(target / left)}`,            // forgot what he has already read
       `${doneEach}`,                             // kept going at the same rate
       `${needEach + 1}`, `${needEach - 1}`],
      4, i);
    if (q) q.explain =
      `Two steps. He has read ${days} × ${doneEach} = ${comma(done)} pages, so he ` +
      `still needs ${comma(target)} − ${comma(done)} = ${comma(target - done)}. ` +
      `Spread that over the ${left} days left: ${comma(target - done)} ÷ ${left} = ` +
      `${needEach} pages a day. Dividing the whole target by the whole month gives ` +
      `${Math.round(target / (days + left))}, which ignores the days already gone.`;
    return q;
  }

  /* Examberry QE 13: "what is the mean of the remaining 8 numbers".
     statMeanAfterChange adds a number; this takes some away. */
  /* Built so that nothing has to be rejected. Both means are printed, so both
     have to be whole numbers, and choosing the removed values freely made that
     a coincidence: 45 of 50 seeds were thrown away. Working from the original
     mean instead, a removed total of gone*mean + keep*j leaves keep*(mean - j),
     so the remaining mean is mean - j exactly, for any j. */
  function statMeanOfRemaining(i) {
    const keep = 6 + axis(i, 0, 5);            // how many are left
    const gone = 2 + (i % 2);                  // how many are removed
    const startMean = 12 + axis(i, 1, 9);
    const n = keep + gone;
    const total = n * startMean;
    /* j is how far the mean moves once they are gone; 0 would leave the mean
       unchanged, which makes one distractor the answer. */
    const j = [1, 2, -1, -2, 3][i % 5];
    const keepMean = startMean - j;
    const goneTotal = gone * startMean + keep * j;
    if (goneTotal < gone * 2 || keepMean < 2) return null;
    /* Split the removed total into distinct plausible values. */
    const base = Math.floor(goneTotal / gone);
    const spread = 1 + (i % 3);
    const removed = [];
    for (let k = 0; k < gone - 1; k++) {
      removed.push(base + (k % 2 === 0 ? spread : -spread));
    }
    removed.push(goneTotal - removed.reduce((a, b) => a + b, 0));
    if (removed.some(v => v < 1) || new Set(removed).size !== removed.length) return null;
    const q = mk("Statistics",
      `The mean of ${n} numbers is ${startMean}. ` +
      `${gone === 2 ? "Two" : "Three"} of them — ` +
      `${removed.slice(0, -1).join(", ")} and ${removed[removed.length - 1]} — ` +
      `are taken away.\n\nWhat is the mean of the remaining ${keep} numbers?`,
      `${keepMean}`,
      /* Whole numbers only. Both of the "divided by the wrong count" mistakes
         land on a fraction, and one decimal among three integers is ruled out
         on sight whether or not it is wrong. */
      [`${startMean}`,                                    // assumed the mean does not move
       `${Math.round((total - goneTotal) / n)}`,           // divided by the old count
       `${Math.round(total / keep)}`,                      // forgot to take the total down
       `${keepMean + 1}`, `${keepMean - 1}`, `${keepMean + 2}`],
      4, i);
    if (q) q.explain =
      `Turn the mean back into a total before you do anything else: ${n} numbers ` +
      `with a mean of ${startMean} come to ${n} × ${startMean} = ${comma(total)}. ` +
      `Take away ${removed.join(" + ")} = ${goneTotal}, leaving ` +
      `${comma(total)} − ${goneTotal} = ${comma(total - goneTotal)} shared between ` +
      `${keep} numbers, so the new mean is ${comma(total - goneTotal)} ÷ ${keep} = ` +
      `${keepMean}. The count changes as well as the total, and forgetting that is ` +
      `the whole trap.`;
    return q;
  }

  /* Examberry QE 11: "how much can Shikha earn in 4 weeks if she works 6 days a
     week from 11am to 8pm". A shift read off two clock times, then three
     multiplications - and the clock times are where it goes wrong. */
  function meaEarningsPattern(i) {
    const start = 7 + axis(i, 0, 5);           // 7am to 11am
    const finish = 16 + axis(i, 1, 6);         // 4pm to 9pm
    const hours = finish - start;
    if (hours < 5) return null;
    const daysWeek = 4 + (i % 3);
    const weeks = 2 + axis(i, 2, 4);
    const rate = 8 + (i % 7);
    const total = hours * daysWeek * weeks * rate;
    const clock = h => `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? "am" : "pm"}`;
    const q = mk("Measurement",
      `Shikha works from ${clock(start)} until ${clock(finish)}, ` +
      `${daysWeek} days a week, and is paid £${rate} an hour.\n\n` +
      `How much does she earn in ${weeks} weeks?`,
      money(total),
      [money(hours * daysWeek * rate),                 // one week only
       /* Subtracting the clock numbers - 9 pm minus 10 am read as 9 − 10 - is
          the mistake worth offering, but it can come out negative, and a
          negative wage is a broken option rather than a wrong one. */
       money(Math.abs((finish % 12 || 12) - (start % 12 || 12)) * daysWeek * weeks * rate),
       money(hours * 7 * weeks * rate),                // counted seven days a week
       money(hours * daysWeek * weeks * rate / 2),
       money((hours + 1) * daysWeek * weeks * rate)],
      4, i);
    if (q) q.explain =
      `Get the shift right first: ${clock(start)} to ${clock(finish)} is ${hours} ` +
      `hours, not ${Math.abs((finish % 12) - (start % 12))} — subtracting the clock ` +
      `numbers is the mistake to avoid, because ${clock(finish)} is ` +
      `${finish} o'clock on a 24-hour clock. Then multiply the whole way through: ` +
      `${hours} hours × ${daysWeek} days = ${hours * daysWeek} hours a week, ` +
      `× ${weeks} weeks = ${comma(hours * daysWeek * weeks)} hours, ` +
      `× £${rate} = ${money(total)}.`;
    return q;
  }

  /* Examberry QE 13: one clock gains, another loses, and they are asked when
     they will agree again. They agree when the gap between them reaches a whole
     twelve hours, because a twelve-hour face cannot tell those apart. */
  /* Every pair sums to a divisor of 720, so the answer is always a whole number
     of hours - a child who has done the work should not then have to round. */
  const CLOCK_DRIFT = [[2, 3], [1, 3], [3, 3], [4, 2], [2, 6], [5, 5], [1, 5],
                       [3, 9], [6, 6], [4, 8], [2, 10], [5, 10], [3, 5], [7, 8],
                       [1, 4], [2, 4], [3, 6], [4, 5], [2, 7], [1, 8], [4, 6],
                       [3, 7], [2, 8], [5, 7], [6, 9], [8, 8], [7, 9], [9, 9],
                       [8, 10], [10, 10]];

  function logClocksCoincide(i) {
    const [gain, loss] = CLOCK_DRIFT[i % CLOCK_DRIFT.length];
    const apart = gain + loss;
    const hours = 720 / apart;                 // 12 hours of drift, in minutes
    if (!Number.isInteger(hours)) return null;
    const q = mk("Logic",
      `Two twelve-hour clocks are set to the correct time at midday. ` +
      `One gains ${gain} minutes every hour. The other loses ${loss} minutes every hour.\n\n` +
      `After how many hours will the two clocks next show the same time as each other?`,
      `${comma(hours)} hours`,
      /* "used only one clock" is the right mistake to offer, but 720 / 7 is
         102.857, and a three-decimal artefact nobody would arrive at is not a
         wrong answer - it is a broken option. Offered only when it divides. */
      [...(720 % gain === 0 ? [`${comma(720 / gain)} hours`] : []),
       ...(720 % loss === 0 ? [`${comma(720 / loss)} hours`] : []),
       `${comma(1440 / apart)} hours`,          // drifted a whole day instead of half
       `${comma(hours * 2)} hours`, `${comma(hours / 2)} hours`,
       `${comma(hours + apart)} hours`],
      4, i);
    if (q) q.explain =
      `The clocks do not have to be right — they only have to agree with each ` +
      `other. Every hour, one runs ${gain} minutes fast and the other ` +
      `${loss} minutes slow, so the gap between them opens by ` +
      `${gain} + ${loss} = ${apart} minutes an hour. A twelve-hour face shows the ` +
      `same time again once that gap reaches 12 hours, which is 720 minutes: ` +
      `720 ÷ ${apart} = ${comma(hours)} hours. It is 720 and not 1440, because a ` +
      `clock twelve hours out looks exactly like a clock that is right.`;
    return q;
  }

  /* Examberry QE 13: "in how many minutes will it next show all the digits
     0 1 1 2 in any order". The digits are the ones on the clock now, so the
     question is self-contained: when does this set of four come round again? */
  function logClockDigits(i) {
    const startH = 9 + axis(i, 0, 12), startM = axis(i, 1, 12) * 5;
    if (startH > 23) return null;
    const key = t => {
      const h = Math.floor(t / 60), m = t % 60;
      return `${h}`.padStart(2, "0").split("").concat(`${m}`.padStart(2, "0").split(""))
        .sort().join("");
    };
    const show = t => `${`${Math.floor(t / 60)}`.padStart(2, "0")}:${`${t % 60}`.padStart(2, "0")}`;
    const from = startH * 60 + startM;
    const want = key(from);
    let found = -1;
    for (let k = 1; k <= 24 * 60; k++) {
      const t = (from + k) % (24 * 60);
      if (key(t) === want) { found = k; break; }
    }
    if (found < 0) return null;
    const at = (from + found) % (24 * 60);
    const q = mk("Logic",
      `A digital clock shows ${show(from)}.\n\n` +
      `In how many minutes will it next show the same four digits, in any order?`,
      `${found} minutes`,
      [`${found + 1} minutes`, `${found - 1} minutes`,
       `${60 - startM || 60} minutes`,          // just the wait to the next hour
       `${found + 10} minutes`, `${Math.max(found - 10, 2)} minutes`],
      4, i);
    if (q) q.explain =
      `The four digits on the clock now are ${show(from).replace(":", ", ")
        .split(", ").join("").split("").join(", ")} — any order will do, so you are ` +
      `looking for the next time made of that same set. Work forward in whole ` +
      `hours first and check the minutes each time, rather than counting up one ` +
      `minute at a time. The next one is ${show(at)}, which is ${found} minutes ` +
      `after ${show(from)}.`;
    return q;
  }

  /* Examberry QE 11: "how many pupils scored above average". The mean has to be
     worked out before the counting can start, and the bars are what it is
     worked out from. */
  function statAboveMean(i) {
    if (!D) return null;
    /* Bar heights from two independent parts of the seed, and a class that is
       sometimes five and sometimes six: taking the heights from i % 13 alone
       gave the same thirteen charts over and over. */
    const names = ["Ali", "Bea", "Cai", "Dee", "Eli", "Fay"];
    const labels = names.slice(0, 5 + (i % 2));
    const values = labels.map((_, k) =>
      3 + ((i * 7 + k * 5 + Math.floor(i / 17) * 6) % 17));
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    /* A value sitting exactly on the mean makes "above" a matter of opinion. */
    if (values.some(v => v === mean)) return null;
    const above = values.filter(v => v > mean).length;
    if (above === 0 || above === values.length) return null;
    const q = mkFig("Statistics",
      `The bar chart shows the score each pupil got in a spelling test.\n\n` +
      `How many pupils scored above the mean score?`,
      `${above}`,
      [`${values.length - above}`,               // counted the ones below instead
       `${values.length}`, `${above + 1}`, `${above - 1}`,
       `${Math.round(mean)}`],                   // gave the mean rather than a count
      4, i, D.barChart({ labels, values, axisLabel: "Score" }));
    if (q) q.explain =
      `Read every bar off the chart first: ${values.join(", ")}. They come to ` +
      `${values.reduce((a, b) => a + b, 0)}, and there are ${values.length} pupils, ` +
      `so the mean is ${values.reduce((a, b) => a + b, 0)} ÷ ${values.length} = ` +
      `${fmt(mean)}. Now count only the bars taller than ${fmt(mean)} — there are ` +
      `${above}. The question asks how MANY are above the mean, not what the mean is.`;
    return q;
  }


  /* ═══════════ shapes the scan attests more than once ═══════════ */

  /* Examberry 16 and QE 12: "what direction will he be facing after making a
     405 degree clockwise turn followed by a 315 degree anticlockwise turn and
     then a 540 degree clockwise turn?"

     geoCompassTurn does a single turn of at most three right angles. Three
     turns, each possibly more than a full revolution, is a different question:
     the angles have to be reduced and composed, and a full turn counts for
     nothing. Every angle is a multiple of 45 so the answer lands on a named
     point. */
  const TURN_ANGLES = [405, 315, 540, 450, 630, 225, 270, 720, 495, 585, 360, 135];

  function geoCompassTurnSequence(i) {
    const from = i % 8;
    /* A stride for each angle, each coprime with the pool length, so the three
       do not move in lockstep. With (i * 3 + k * 5) they did: i * 3 mod 12
       reaches only four values, and fifty seeds gave seven questions. */
    const pickAngle = k => TURN_ANGLES[(i * [5, 7, 11][k]) % TURN_ANGLES.length];
    const turns = [0, 1, 2].map(k => ({
      deg: pickAngle(k),
      cw: ((i >> k) & 1) === 0
    }));
    /* In eighths of a turn, so the arithmetic stays whole. */
    const netPoints = turns.reduce((t, x) => t + (x.cw ? 1 : -1) * (x.deg / 45), 0);
    const to = ((from + netPoints) % 8 + 8) % 8;
    if (to === from) return null;              // "no change" is a poor question
    const spell = t => `${t.deg}° ${t.cw ? "clockwise" : "anticlockwise"}`;
    /* Every distractor is itself a compass point, and each is a real mistake:
       ignoring the direction of the turns, or forgetting that a whole
       revolution changes nothing. */
    const allCw = ((from + turns.reduce((t, x) => t + x.deg / 45, 0)) % 8 + 8) % 8;
    const noReduce = ((from + turns.reduce((t, x) =>
      t + (x.cw ? 1 : -1) * ((x.deg % 360) / 45), 0)) % 8 + 8) % 8;
    const q = mk("Geometry",
      `A walker is facing ${COMPASS[from]}. She makes a ${spell(turns[0])} turn, ` +
      `then a ${spell(turns[1])} turn, and finally a ${spell(turns[2])} turn.\n\n` +
      `Which direction is she facing now?`,
      COMPASS[to],
      [COMPASS[allCw], COMPASS[noReduce],
       COMPASS[(to + 4) % 8], COMPASS[(to + 1) % 8], COMPASS[(to + 7) % 8],
       COMPASS[(to + 2) % 8]],
      4, i);
    if (q) {
      const parts = turns.map(t => `${t.cw ? "+" : "−"}${t.deg}`).join(" ");
      q.explain =
        `Add the turns up as one, counting clockwise as positive and ` +
        `anticlockwise as negative: ${parts} = ` +
        `${netPoints * 45 >= 0 ? "+" : "−"}${Math.abs(netPoints * 45)}°. ` +
        `Now take off whole revolutions, because 360° brings you back to where ` +
        `you started: that leaves ${((netPoints * 45) % 360 + 360) % 360}° ` +
        `clockwise. From ${COMPASS[from]}, turning ` +
        `${((netPoints * 45) % 360 + 360) % 360}° clockwise ` +
        `(${((netPoints % 8) + 8) % 8} eighths of a turn) faces you ` +
        `${COMPASS[to]}. Reducing each turn before adding them works just as ` +
        `well — what does not work is ignoring which way each one goes.`;
    }
    return q;
  }

  /* QE 13: "what coordinates would Jack have ended up at if he had turned 810
     degrees clockwise instead, then walked the same distance?" The same
     reduction, with the answer as a point rather than a compass name. */
  function geoTurnThenWalk(i) {
    const x = -4 + axis(i, 0, 9), y = -4 + axis(i, 1, 9);
    const quarters = [450, 540, 630, 720, 810, 900, 990, 1080][(i * 3) % 8];
    const cw = i % 2 === 0;
    const dist = 2 + axis(i, 2, 7);
    /* Facing north to begin with; quarter turns keep the walk on an axis. */
    const steps = ((cw ? 1 : -1) * (quarters / 90)) % 4;
    const facing = ((steps % 4) + 4) % 4;                 // 0 N, 1 E, 2 S, 3 W
    const move = [[0, 1], [1, 0], [0, -1], [-1, 0]][facing];
    const ex = x + move[0] * dist, ey = y + move[1] * dist;
    if (Math.abs(ex) > 20 || Math.abs(ey) > 20) return null;
    const at = f => {
      const m = [[0, 1], [1, 0], [0, -1], [-1, 0]][((f % 4) + 4) % 4];
      return `(${x + m[0] * dist}, ${y + m[1] * dist})`;
    };
    const q = mk("Geometry",
      `Jack is standing at (${x}, ${y}), facing north. ` +
      `He turns ${quarters}° ${cw ? "clockwise" : "anticlockwise"} and then ` +
      `walks ${dist} units forwards.\n\nWhat are his coordinates now?`,
      at(facing),
      [at(facing + 2),                         // ended up facing the opposite way
       at(-steps),                             // turned the wrong way
       at(facing + 1), at(facing + 3),
       `(${x}, ${y})`],                        // never moved
      4, i);
    if (q) q.explain =
      `${quarters}° is ${quarters / 90} quarter turns, and four of those bring ` +
      `you back to the start — so take off whole revolutions first: ` +
      `${quarters} ÷ 360 leaves ${quarters % 360}°, which is ` +
      `${(quarters % 360) / 90} quarter turn${(quarters % 360) / 90 === 1 ? "" : "s"} ` +
      `${cw ? "clockwise" : "anticlockwise"}. From north that leaves him facing ` +
      `${["north", "east", "south", "west"][facing]}, so walking ${dist} units ` +
      `changes only the ${facing % 2 === 0 ? "y" : "x"}-coordinate: ` +
      `(${x}, ${y}) becomes ${at(facing)}.`;
    return q;
  }

  /* QE 10 and QE 12: "after how many days will he have finished the packet of
     flour", "for how many complete days will the 5 packs of treats last".

     Those two wordings have different answers - one is a floor and the other a
     ceiling - so each question asks one of them plainly and offers the other as
     the distractor, which is the mistake actually worth catching. */
  const SUPPLY_POOL = [
    { thing: "flour", packs: 1, each: 2000, unit: "g", perDay: 150, holder: "sack" },
    { thing: "rice", packs: 1, each: 1500, unit: "g", perDay: 220, holder: "bag" },
    { thing: "dog treats", packs: 5, each: 12, unit: "", perDay: 7, holder: "box" },
    { thing: "cat biscuits", packs: 4, each: 250, unit: "g", perDay: 90, holder: "tub" },
    { thing: "oats", packs: 1, each: 3000, unit: "g", perDay: 175, holder: "sack" },
    { thing: "birdseed", packs: 3, each: 400, unit: "g", perDay: 130, holder: "bag" },
    { thing: "tea bags", packs: 2, each: 80, unit: "", perDay: 9, holder: "box" },
    { thing: "washing powder", packs: 1, each: 2400, unit: "g", perDay: 140, holder: "drum" },
    { thing: "hamster food", packs: 6, each: 45, unit: "g", perDay: 24, holder: "packet" },
    { thing: "coffee", packs: 2, each: 227, unit: "g", perDay: 18, holder: "tin" },
    { thing: "chicken feed", packs: 4, each: 900, unit: "g", perDay: 260, holder: "sack" },
    { thing: "sugar cubes", packs: 3, each: 60, unit: "", perDay: 11, holder: "box" }
  ];

  function numSupplyDuration(i) {
    const p = SUPPLY_POOL[i % SUPPLY_POOL.length];
    const total = p.packs * p.each;
    const full = Math.floor(total / p.perDay);
    const runsOut = Math.ceil(total / p.perDay);
    /* If it divides exactly the two answers are the same and the question has
       nothing in it. */
    if (full === runsOut) return null;
    /* Not i % 2: the pool row is i % 12 and 12 is even, so i % 2 carried no
       information the row did not already carry, and each row only ever asked
       one of the two questions. */
    const askComplete = Math.floor(i / SUPPLY_POOL.length) % 2 === 0;
    const amount = n => (p.unit ? `${comma(n)} ${p.unit}` : `${comma(n)}`);
    const stock = p.packs === 1
      ? `A ${p.holder} of ${p.thing} holds ${amount(p.each)}.`
      : `${p.packs} ${p.holder}s of ${p.thing} hold ${amount(p.each)} each.`;
    const q = mk("Numbers",
      `${stock} ${amount(p.perDay)} of ${p.thing} ${p.unit ? "is" : "are"} used ` +
      `every day.\n\n` +
      (askComplete
        ? `For how many complete days will the ${p.thing} last?`
        : `On which day will the ${p.thing} run out?`),
      askComplete ? `${full}` : `day ${runsOut}`,
      askComplete
        ? [`${runsOut}`,                         // the day it runs out, not the last full one
           `${Math.round(total / p.perDay)}`,
           `${full + 2}`, `${full - 1}`, `${p.each}`]
        : [`day ${full}`,                        // the last complete day
           `day ${Math.round(total / p.perDay)}`,
           `day ${runsOut + 1}`, `day ${runsOut - 2}`, `day ${p.packs * p.perDay}`],
      4, i);
    if (q) q.explain =
      `There ${p.packs === 1 ? "is" : "are"} ${p.packs === 1 ? "" : `${p.packs} × ` +
      `${amount(p.each)} = `}${amount(total)} altogether, and ` +
      `${amount(total)} ÷ ${amount(p.perDay)} = ${fmt(total / p.perDay)}. ` +
      (askComplete
        ? `That means ${full} whole days are covered, with some left over but not ` +
          `enough for another full day — so the answer is ${full}. Day ${runsOut} ` +
          `is the day it runs out, which is the other question.`
        : `Day ${full} is the last day there is enough for, so it runs out ` +
          `during day ${runsOut} — round UP for this one. ${full} would be the ` +
          `answer to "how many complete days will it last".`);
    return q;
  }

  /* QE 10 and QE 14: "what is the smallest possible range of this set of
     numbers", "what is the greatest possible range of these three numbers".
     One member of the set is unknown within stated limits, so the range is not
     one number but a span, and the question asks for an end of it. */
  function statPossibleRange(i) {
    const a = 3 + axis(i, 0, 8);
    const b = a + 3 + (i % 5);
    const c = b + 2 + axis(i, 1, 6);
    const known = [a, b, c];
    const lo = 1 + (i % 3), hi = c + 2 + axis(i, 2, 9);
    const spans = [];
    for (let n = lo; n <= hi; n++) {
      const set = [...known, n];
      spans.push(Math.max(...set) - Math.min(...set));
    }
    const least = Math.min(...spans), most = Math.max(...spans);
    if (least === most) return null;
    const askLeast = i % 2 === 0;
    const plain = Math.max(...known) - Math.min(...known);
    const q = mk("Statistics",
      `A set of four numbers is ${known.join(", ")} and n, where n is a whole ` +
      `number from ${lo} to ${hi}.\n\n` +
      `What is the ${askLeast ? "smallest" : "greatest"} possible range of the set?`,
      `${askLeast ? least : most}`,
      [`${askLeast ? most : least}`,             // the other end of the span
       `${plain}`,                               // ignored n altogether
       `${hi - lo}`,                             // the range of n itself
       `${(askLeast ? least : most) + 1}`, `${(askLeast ? least : most) - 1}`],
      4, i);
    if (q) q.explain =
      `The range is the largest number minus the smallest, and n can move, so ` +
      `try n at each end of what it is allowed to be. ` +
      (askLeast
        ? `To make the range as SMALL as possible, put n between the numbers you ` +
          `already have — anywhere from ${Math.min(...known)} to ` +
          `${Math.max(...known)} leaves the range at ${Math.max(...known)} − ` +
          `${Math.min(...known)} = ${plain}, and n can reach that, so the smallest ` +
          `possible range is ${least}.`
        : `To make the range as LARGE as possible, push n to whichever limit is ` +
          `further from the others: n = ${spans.indexOf(most) + lo} gives a range ` +
          `of ${most}. Ignoring n altogether gives ${plain}, which is the range ` +
          `of the three numbers you were shown rather than of the set.`);
    return q;
  }


  /* ── the clockwork toy in the maze ────────────────────────────────────
     Cells are (x, y), x left to right and y top to bottom. A wall in vWalls at
     [x, y] closes the right edge of that cell; one in hWalls closes its bottom
     edge. Directions are indexed up, right, down, left, so turning clockwise is
     simply +1. */
  const MAZE_DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const MAZE_DIR_NAMES = ["up", "right", "down", "left"];

  function runMaze(m) {
    const wall = (list, x, y) => list.some(p => p[0] === x && p[1] === y);
    let x = m.start.x, y = m.start.y;
    let d = MAZE_DIR_NAMES.indexOf(m.facing || "up");
    const seen = new Set();
    const legs = [];
    let leg = { dir: d, steps: 0 };
    for (let n = 0; n < 5000; n++) {
      const key = `${x},${y},${d}`;
      /* The toy is deterministic, so being in a cell facing a direction it has
         already faced there means the whole path from here repeats: it is in a
         loop and will never get out. */
      if (seen.has(key)) {
        legs.push(leg);
        return { escaped: null, legs, loop: true };
      }
      seen.add(key);
      const [dx, dy] = MAZE_DIRS[d];
      const nx = x + dx, ny = y + dy;
      let blocked;
      if (nx < 0 || ny < 0 || nx >= m.cols || ny >= m.rows) {
        const out = nx < 0 ? m.exits.find(e => e.side === "left" && e.at === y)
          : nx >= m.cols ? m.exits.find(e => e.side === "right" && e.at === y)
            : ny < 0 ? m.exits.find(e => e.side === "top" && e.at === x)
              : m.exits.find(e => e.side === "bottom" && e.at === x);
        if (out) {
          leg.steps += 1;
          legs.push(leg);
          return { escaped: out.label, legs, loop: false };
        }
        blocked = true;
      } else if (dx === 1) blocked = wall(m.vWalls, x, y);
      else if (dx === -1) blocked = wall(m.vWalls, nx, y);
      else if (dy === 1) blocked = wall(m.hWalls, x, y);
      else blocked = wall(m.hWalls, x, ny);

      if (blocked) {
        /* Pushed even when it moved nowhere: a turn into a wall is part of the
           path, and without it the hint reads "down, then up", which is not a
           clockwise turn. What to say about them is the hint's business. */
        legs.push(leg);
        d = (d + 1) % 4;
        leg = { dir: d, steps: 0 };
      } else { x = nx; y = ny; leg.steps += 1; }
    }
    return { escaped: null, legs, loop: true };
  }

  /* Laid out by hand rather than generated, so every picture is a maze a person
     would draw. The answer to each comes from the simulation, not from the
     layout being designed backwards from an answer.

     The release points, though, WERE chosen: every cell and every starting
     direction was searched, paths of fewer than three turns thrown out, and the
     rest picked to spread the answers across all five options. Left to a
     plausible-looking guess the pool had one maze the toy walked straight out
     of without turning once, three more that escaped after a single turn, no
     maze at all whose answer was Exit 1, and a third answering "never escapes"
     - which is a third of the marks for choosing the same option every time. */
  const MAZE_POOL = [
    { cols: 6, rows: 5, vWalls: [[1, 1], [3, 2], [3, 3]], hWalls: [[2, 1], [4, 2]],
      exits: [{ side: "left", at: 1, label: 1 }, { side: "top", at: 4, label: 2 },
              { side: "right", at: 2, label: 3 }, { side: "bottom", at: 2, label: 4 }],
      start: { x: 1, y: 4 }, facing: "up" },
    { cols: 6, rows: 5, vWalls: [[2, 0], [2, 1], [4, 3]], hWalls: [[1, 2], [3, 1]],
      exits: [{ side: "left", at: 3, label: 1 }, { side: "top", at: 1, label: 2 },
              { side: "right", at: 0, label: 3 }, { side: "bottom", at: 4, label: 4 }],
      start: { x: 3, y: 0 }, facing: "down" },
    { cols: 5, rows: 5, vWalls: [[1, 2], [3, 0], [1, 3]], hWalls: [[2, 2], [0, 1]],
      exits: [{ side: "left", at: 4, label: 1 }, { side: "top", at: 2, label: 2 },
              { side: "right", at: 3, label: 3 }, { side: "bottom", at: 1, label: 4 }],
      start: { x: 0, y: 0 }, facing: "down" },
    { cols: 6, rows: 4, vWalls: [[1, 0], [3, 2], [4, 1]], hWalls: [[2, 0], [4, 2]],
      exits: [{ side: "left", at: 2, label: 1 }, { side: "top", at: 3, label: 2 },
              { side: "right", at: 1, label: 3 }, { side: "bottom", at: 1, label: 4 }],
      start: { x: 0, y: 1 }, facing: "right" },
    { cols: 5, rows: 6, vWalls: [[2, 1], [1, 4], [3, 3]], hWalls: [[1, 1], [3, 4]],
      exits: [{ side: "left", at: 0, label: 1 }, { side: "top", at: 1, label: 2 },
              { side: "right", at: 4, label: 3 }, { side: "bottom", at: 3, label: 4 }],
      start: { x: 0, y: 1 }, facing: "right" },
    { cols: 6, rows: 5, vWalls: [[0, 2], [2, 3], [4, 0], [4, 4]], hWalls: [[3, 2]],
      exits: [{ side: "left", at: 4, label: 1 }, { side: "top", at: 2, label: 2 },
              { side: "right", at: 3, label: 3 }, { side: "bottom", at: 0, label: 4 }],
      start: { x: 0, y: 1 }, facing: "up" },
    { cols: 5, rows: 5, vWalls: [[1, 1], [2, 3], [3, 2]], hWalls: [[0, 3], [2, 0], [4, 2]],
      exits: [{ side: "left", at: 2, label: 1 }, { side: "top", at: 4, label: 2 },
              { side: "right", at: 4, label: 3 }, { side: "bottom", at: 3, label: 4 }],
      start: { x: 0, y: 0 }, facing: "down" },
    { cols: 6, rows: 6, vWalls: [[1, 2], [3, 1], [4, 4], [2, 5]], hWalls: [[0, 0], [3, 3]],
      exits: [{ side: "left", at: 5, label: 1 }, { side: "top", at: 0, label: 2 },
              { side: "right", at: 2, label: 3 }, { side: "bottom", at: 4, label: 4 }],
      start: { x: 1, y: 0 }, facing: "up" },
    { cols: 5, rows: 4, vWalls: [[2, 0], [1, 2], [3, 3]], hWalls: [[1, 0], [3, 1]],
      exits: [{ side: "left", at: 1, label: 1 }, { side: "top", at: 4, label: 2 },
              { side: "right", at: 2, label: 3 }, { side: "bottom", at: 2, label: 4 }],
      start: { x: 1, y: 1 }, facing: "up" },
    { cols: 6, rows: 5, vWalls: [[1, 3], [3, 0], [4, 2]], hWalls: [[2, 3], [0, 1], [5, 1]],
      exits: [{ side: "left", at: 0, label: 1 }, { side: "top", at: 5, label: 2 },
              { side: "right", at: 4, label: 3 }, { side: "bottom", at: 3, label: 4 }],
      start: { x: 0, y: 1 }, facing: "right" },
    { cols: 5, rows: 6, vWalls: [[1, 0], [2, 2], [3, 4]], hWalls: [[0, 2], [2, 4], [4, 1]],
      exits: [{ side: "left", at: 3, label: 1 }, { side: "top", at: 3, label: 2 },
              { side: "right", at: 5, label: 3 }, { side: "bottom", at: 0, label: 4 }],
      start: { x: 0, y: 0 }, facing: "down" },
    { cols: 6, rows: 4, vWalls: [[0, 1], [2, 2], [4, 0], [3, 3]], hWalls: [[1, 1], [4, 1]],
      exits: [{ side: "left", at: 0, label: 1 }, { side: "top", at: 2, label: 2 },
              { side: "right", at: 2, label: 3 }, { side: "bottom", at: 5, label: 4 }],
      start: { x: 4, y: 2 }, facing: "down" }
  ];

  function logMazeBounce(i) {
    if (!D) return null;
    const m = MAZE_POOL[i % MAZE_POOL.length];
    const run = runMaze(m);
    const NEVER = "It never escapes from the maze";
    const answer = run.escaped ? `Exit ${run.escaped}` : NEVER;
    /* The other four possibilities, in the paper's own order, minus whichever
       one is right. The "never escapes" option always stays on the page: it is
       the answer a child reaches by giving up on the tracing, and leaving it
       out would make the question easier than the paper's. */
    const all = ["Exit 1", "Exit 2", "Exit 3", "Exit 4", NEVER];
    const wrong = all.filter(o => o !== answer);
    const q = mkFig("Logic",
      `A clockwork toy is released into the maze shown, at the dot, travelling ` +
      `in the direction of the arrow.\n\n` +
      `Every time it meets a wall it turns 90° clockwise and carries on ` +
      `forwards. It escapes only by travelling out through an exit — passing ` +
      `alongside one does not count.\n\n` +
      `Through which exit does the toy escape?`,
      answer,
      [wrong[wrong.length - 1], wrong[0], wrong[1], wrong[2]],
      4, i, D.maze(m));
    if (q) {
      /* A leg on which the toy moved nowhere - blocked the moment it turned -
         still has to be reported, or consecutive legs look like an
         anticlockwise turn. Dropping them described "down, then up", which is
         two clockwise turns and reads as one anticlockwise one. */
      const parts = [];
      let extraTurns = 0;
      run.legs.forEach(l => {
        if (!l.steps) { extraTurns += 1; return; }
        if (!parts.length && extraTurns) {
          parts.push(`cannot move at first, so turns clockwise ` +
            `${extraTurns === 1 ? "once" : extraTurns === 2 ? "twice" : `${extraTurns} times`}`);
          extraTurns = 0;
        } else if (parts.length) {
          const t = extraTurns + 1;
          parts.push(`turns clockwise ${t === 1 ? "once" : t === 2 ? "twice" : `${t} times`}`);
        }
        parts.push(`goes ${l.steps} ${l.steps === 1 ? "square" : "squares"} ${MAZE_DIR_NAMES[l.dir]}`);
        extraTurns = 0;
      });
      const path = parts.join(", ");
      q.explain =
        `Trace it one leg at a time, and remember that clockwise from up is ` +
        `right, then down, then left. Do not try to see the answer — the path ` +
        `is the only way to it. This toy ${path}` +
        (run.escaped
          ? `, and that last leg takes it out through Exit ${run.escaped}.`
          : `, and then arrives back in a square it has already been in, facing ` +
            `the same way as before. From there the whole path repeats, so it ` +
            `circles for ever and never escapes.`) +
        ` A toy running alongside an opening does not leave through it: it has ` +
        `to be travelling at the wall the opening is in.`;
    }
    return q;
  }


  /* ═══════════ from question-bank/20260823-Onwards ═══════════ */

  /* MKT Estimation Q1-3: "which is the most reasonable estimate for the height
     of a classroom door?" The bank had meaEstimateWeight, which is mass only;
     these are lengths, heights and capacities. Every wrong option is the right
     answer moved by a power of ten or a small factor, because the skill being
     tested is recognising the order of magnitude, not the exact figure. */
  /* No two options in a row may share a numeral. mk() compares options by
     value, so "3 litres" and "3 ml" are one option to it, and a row that
     offered both ran short of distractors and had nudge() invent "307 ml".
     The unit-confusion distractor is the most useful one here, so it stays -
     it just cannot reuse the number the answer already uses. */
  const SIZE_ESTIMATES = [
    ["the height of a classroom door", "2 m", ["20 cm", "10 m", "25 m", "1 m"]],
    ["the length of a new pencil", "18 cm", ["2 cm", "180 cm", "90 cm", "5 m"]],
    ["the length of a double-decker bus", "11 m", ["1 m", "110 m", "35 m", "60 cm"]],
    ["the width of a front door", "80 cm", ["8 m", "300 cm", "20 cm", "2 mm"]],
    ["the length of a swimming pool", "25 m", ["2 m", "250 m", "80 m", "5 cm"]],
    ["the capacity of a teaspoon", "5 ml", ["50 ml", "500 ml", "2 litres", "1 mm"]],
    ["the capacity of a bath", "150 litres", ["15 litres", "1,500 litres", "20 ml", "500 litres"]],
    ["the capacity of a mug", "300 ml", ["30 ml", "3 litres", "20 litres", "5 ml"]],
    ["the length of a football pitch", "100 m", ["10 m", "1,000 m", "30 m", "400 cm"]],
    ["the length of a house brick", "22 cm", ["2 cm", "220 cm", "70 cm", "3 m"]],
    ["the height of a classroom ceiling", "3 m", ["30 cm", "25 m", "10 m", "1 m"]],
    ["the height of an adult", "1.7 m", ["17 m", "70 cm", "7 m", "20 cm"]],
    ["the length of a family car", "4 m", ["40 cm", "45 m", "12 m", "1 m"]],
    ["the height of a kitchen worktop", "90 cm", ["9 m", "300 cm", "30 cm", "2 mm"]],
    ["the thickness of a pound coin", "3 mm", ["2 cm", "30 mm", "1 cm", "20 mm"]],
    ["the capacity of a kettle", "1.7 litres", ["17 litres", "170 ml", "20 ml", "10 litres"]]
  ];

  function meaEstimateSize(i) {
    const [thing, ans, wrong] = SIZE_ESTIMATES[i % SIZE_ESTIMATES.length];
    /* Refuse a row that reuses a numeral rather than letting mk() drop the
       duplicate and nudge() invent a replacement. */
    const numerals = [ans, ...wrong].map(o => Number(String(o).replace(/[^0-9.]/g, "")));
    if (new Set(numerals).size !== numerals.length) return null;
    const q = mk("Measurement",
      `Which of these is the most reasonable estimate for ${thing}?`,
      ans, wrong, 3 + (i % 2), i);
    if (q) q.explain =
      `Nobody expects you to know this exactly — the options are a factor of ten ` +
      `or more apart, so the question is which one is the right SIZE. Picture ` +
      `${thing.replace(/^the /, "")} against something you know: ${ans} is the ` +
      `only estimate that is not absurd. Check the unit as well as the number, ` +
      `because that is where most of these go wrong.`;
    return q;
  }

  /* MKT Estimation Q4-5: "using sensible real-life estimates, approximately what
     is the difference between the mass of a pony and the mass of a goat?" Two
     estimates are needed before any arithmetic, and the answer guide prints the
     figures it used - so the hint does too, otherwise the question looks like
     guesswork rather than method. */
  const COMBINE_ESTIMATES = [
    { a: "a pony", av: 300, b: "a goat", bv: 50, unit: "kg", what: "mass" },
    { a: "a city minibus", av: 6, b: "a touring caravan", bv: 7, unit: "m", what: "length" },
    { a: "an adult", av: 70, b: "a five-year-old child", bv: 20, unit: "kg", what: "mass" },
    { a: "a double-decker bus", av: 11, b: "a family car", bv: 4, unit: "m", what: "length" },
    { a: "a filled bath", av: 150, b: "a household bucket", bv: 10, unit: "litres", what: "capacity" },
    { a: "a bag of cement", av: 25, b: "a bag of sugar", bv: 1, unit: "kg", what: "mass" },
    { a: "a tennis court", av: 24, b: "a family car", bv: 4, unit: "m", what: "length" },
    { a: "a car fuel tank", av: 50, b: "a watering can", bv: 8, unit: "litres", what: "capacity" },
    { a: "an adult cow", av: 600, b: "a large dog", bv: 40, unit: "kg", what: "mass" },
    { a: "a lamp post", av: 8, b: "a front door", bv: 2, unit: "m", what: "height" },
    { a: "a wheelie bin", av: 240, b: "a kettle", bv: 2, unit: "litres", what: "capacity" },
    { a: "a piano", av: 300, b: "a bicycle", bv: 12, unit: "kg", what: "mass" }
  ];

  function meaEstimateCombine(i) {
    const e = COMBINE_ESTIMATES[i % COMBINE_ESTIMATES.length];
    const add = i % 2 === 0;
    const ans = add ? e.av + e.bv : e.av - e.bv;
    if (ans <= 0) return null;
    const amount = n => `${comma(n)} ${e.unit}`;
    const q = mk("Measurement",
      `Using sensible real-life estimates, approximately what is the ` +
      `${add ? "combined" : "difference between the"} ${e.what} ` +
      `${add ? `of ${e.a} and ${e.b}` : `of ${e.a} and the ${e.what} of ${e.b}`}?`,
      amount(ans),
      [amount(add ? e.av - e.bv : e.av + e.bv),   // did the other operation
       amount(e.av), amount(e.bv),                // gave one estimate on its own
       amount(ans * 10), amount(Math.round(ans / 10))],
      4, i);
    if (q) q.explain =
      `Estimate each one first, then do the arithmetic — and a sensible estimate ` +
      `is all that is wanted. Take ${e.a} at about ${amount(e.av)} and ${e.b} at ` +
      `about ${amount(e.bv)}. Then ${e.av} ${add ? "+" : "−"} ${e.bv} = ` +
      `${amount(ans)}. The options are far enough apart that a rough estimate ` +
      `still lands on the right one.`;
    return q;
  }

  /* MKT Maths 9 Q1: "how many three-digit numbers can have the product of the
     digits equal 16?" Counted rather than reasoned about - the arrangements of
     1, 2 and 8 alongside 1, 4, 4 and 2, 2, 4 are easy to half-count. */
  function countDigitProduct(i) {
    const targets = [16, 12, 8, 18, 24, 6, 32, 36, 20, 27, 4, 48];
    const target = targets[i % targets.length];
    let count = 0;
    for (let n = 100; n <= 999; n += 1) {
      const d = [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10];
      if (d[0] * d[1] * d[2] === target) count += 1;
    }
    if (count < 4) return null;
    const q = mk("Counting Principle",
      `How many three-digit numbers have digits whose product is ${target}?`,
      `${count}`,
      [`${count - 3}`, `${count + 3}`, `${count - 1}`, `${count + 1}`, `${count * 2}`],
      4, i);
    if (q) q.explain =
      `Work out which SETS of three digits multiply to ${target}, then count the ` +
      `arrangements of each set — that is where these go wrong, because a set ` +
      `with three different digits has 6 arrangements but a set with a repeated ` +
      `digit has only 3. Remember a digit cannot be 0 (the product would be 0) ` +
      `and the first digit cannot be 0 anyway. Altogether there are ${count}.`;
    return q;
  }

  /* MKT Maths 9 Q42: "the sum of the smallest 4-digit number divisible by 3 and
     the largest 4-digit number divisible by 5". Both ends have to be stepped in
     from 1000 and 9999 to the nearest multiple, and in opposite directions. */
  function numExtremeDivisible(i) {
    /* Three indices that all reduce to i % 8 give eight questions out of fifty.
       The digit count is taken from a different part of the seed. */
    const digits = 3 + (Math.floor(i / 8) % 2);
    const lo = 10 ** (digits - 1), hi = 10 ** digits - 1;
    const p = [3, 4, 6, 7, 8, 9, 11, 12][(i * 3) % 8];
    const qd = [5, 3, 4, 6, 7, 9, 8, 11][(i * 5) % 8];
    if (p === qd) return null;
    const smallest = Math.ceil(lo / p) * p;
    const largest = Math.floor(hi / qd) * qd;
    const ans = smallest + largest;
    const q = mk("Numbers",
      `What is the sum of the smallest ${digits}-digit number divisible by ${p} ` +
      `and the largest ${digits}-digit number divisible by ${qd}?`,
      `${comma(ans)}`,
      [`${comma(lo + hi)}`,                       // never stepped to a multiple
       `${comma(lo + largest)}`,                  // only stepped the top end
       `${comma(smallest + hi)}`,                 // only stepped the bottom end
       `${comma(ans + p)}`, `${comma(ans - qd)}`],
      4, i);
    if (q) q.explain =
      `Take the two ends separately, and step INWARDS from each. The smallest ` +
      `${digits}-digit number is ${comma(lo)}; ${comma(lo)} ÷ ${p} is not whole, ` +
      `so go up to the next multiple of ${p}, which is ${comma(smallest)}. The ` +
      `largest is ${comma(hi)}; come down to the previous multiple of ${qd}, ` +
      `which is ${comma(largest)}. Then ${comma(smallest)} + ${comma(largest)} = ` +
      `${comma(ans)}. Using ${comma(lo)} and ${comma(hi)} unchanged gives ` +
      `${comma(lo + hi)}, and neither of those is a multiple.`;
    return q;
  }

  /* MKT Maths 9 Q41: "if x is an even number then 3x + 6 is ...". A property of
     the whole expression, not a value, so testing one number is not enough -
     though testing one number does rule options out, which is the method. */
  const EXPR_PROPERTIES = [
    { given: "even", expr: "3x + 6", right: "even and divisible by 6",
      wrong: ["odd and divisible by 3", "odd and divisible by 9",
              "divisible by 3 but never by 2"],
      why: "x is even, so x = 2k and 3x + 6 = 6k + 6 = 6(k + 1) — a multiple of 6, and every multiple of 6 is even" },
    { given: "odd", expr: "3x + 3", right: "even and divisible by 6",
      wrong: ["odd and divisible by 3", "odd but never divisible by 3",
              "divisible by 9"],
      why: "3x + 3 = 3(x + 1), and x is odd so x + 1 is even — three times an even number is a multiple of 6" },
    { given: "even", expr: "4x + 8", right: "divisible by 8",
      wrong: ["odd", "divisible by 3", "divisible by 5"],
      why: "4x + 8 = 4(x + 2), and x is even so x + 2 is even — four times an even number is a multiple of 8" },
    { given: "odd", expr: "2x + 1", right: "always odd",
      wrong: ["always even", "always divisible by 3", "always prime"],
      why: "2x is even whatever x is, and one more than an even number is odd" },
    { given: "even", expr: "5x + 10", right: "divisible by 10",
      wrong: ["odd", "divisible by 3", "never divisible by 5"],
      why: "5x + 10 = 5(x + 2), and x is even so x + 2 is even — five times an even number is a multiple of 10" },
    { given: "odd", expr: "x + 1", right: "always even",
      wrong: ["always odd", "always divisible by 4", "always prime"],
      why: "one more than an odd number is always even" },
    { given: "even", expr: "x² + x", right: "always even",
      wrong: ["always odd", "always divisible by 4", "always a square number"],
      why: "x² + x = x(x + 1), and one of any two consecutive numbers is even, so the product always is" },
    { given: "odd", expr: "4x + 2", right: "even but never divisible by 4",
      wrong: ["divisible by 4", "always odd", "always divisible by 3"],
      why: "4x + 2 = 2(2x + 1), and 2x + 1 is odd — twice an odd number is even but not a multiple of 4" }
  ];

  function algExpressionProperty(i) {
    const e = EXPR_PROPERTIES[i % EXPR_PROPERTIES.length];
    const q = mk("Algebra",
      `x is ${e.given === "even" ? "an even" : "an odd"} whole number.\n\n` +
      `Which of these is true of ${e.expr} for every such x?`,
      e.right, e.wrong, 4, i);
    if (q) q.explain =
      `Try a number first to throw options out — but one number cannot prove an ` +
      `option right, so finish with the algebra. ${e.why}. So ${e.expr} is ` +
      `${e.right}.`;
    return q;
  }

  /* MKT Maths 9: a week of lowest and highest temperatures, and the largest
     daily range. The range of one day, not of the week, and the minima go below
     zero - which is where it goes wrong. */
  function statLargestDailyRange(i) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const mins = days.map((_, k) => -5 + ((i * 3 + k * 5) % 11));
    const maxes = mins.map((m, k) => m + 3 + ((i * 2 + k * 7) % 9));
    const spans = mins.map((m, k) => maxes[k] - m);
    const best = Math.max(...spans);
    if (spans.filter(v => v === best).length > 1) return null;   // one clear answer
    const overall = Math.max(...maxes) - Math.min(...mins);
    const table = `        ${days.join("   ")}\n` +
      `lowest  ${mins.map(v => `${v}°C`.padStart(5)).join(" ")}\n` +
      `highest ${maxes.map(v => `${v}°C`.padStart(5)).join(" ")}`;
    const q = mk("Statistics",
      `The table shows the lowest and highest temperature recorded on each day ` +
      `of one week.\n\n${table}\n\nWhat is the largest range of temperature ` +
      `recorded in a single day?`,
      `${best}°C`,
      [`${overall}°C`,                                   // the whole week's range
       `${Math.min(...spans)}°C`,                        // the smallest daily range
       `${Math.max(...maxes) - Math.max(...mins)}°C`,     // ranges of each row
       `${best + 1}°C`, `${best - 1}°C`],
      4, i);
    if (q) q.explain =
      `Work out the range for each day on its own — highest minus lowest — and ` +
      `then take the biggest of those. The daily ranges are ` +
      `${spans.map((v, k) => `${days[k]} ${v}`).join(", ")}, so the answer is ` +
      `${best}°C. Watch the days with a lowest temperature below zero: ` +
      `subtracting a negative number makes the range LARGER, not smaller. ` +
      `Taking the highest of the week away from the lowest of the week gives ` +
      `${overall}°C, which is the range across the whole week rather than in one day.`;
    return q;
  }


  /* MKT Maths 9 Q24: the options are sums of region labels, not numbers - the
     question is which parts of the diagram make up one circle. */
  const VENN3_SETS = [
    ["Apples", "Grapes", "Peaches", "students"],
    ["Football", "Chess", "Swimming", "pupils"],
    ["French", "German", "Spanish", "students"],
    ["Cats", "Dogs", "Rabbits", "households"],
    ["Cycling", "Running", "Rowing", "members"],
    ["Piano", "Violin", "Guitar", "children"]
  ];

  function statVennThreeRegions(i) {
    if (!D) return null;
    const [nameA, nameB, nameC, who] = VENN3_SETS[i % VENN3_SETS.length];
    /* The letters rotate so the answer is not always the same set of them. */
    const alphabet = "ABCDEFGH".split("");
    const shift = Math.floor(i / VENN3_SETS.length) % 7;
    const letters = alphabet.slice(0, 7).map((_, k) => alphabet[(k + shift) % 7]);
    const outside = alphabet[7];
    /* Region order is onlyA, onlyB, onlyC, AB, AC, BC, ABC. */
    const ofA = [0, 3, 4, 6], ofB = [1, 3, 5, 6], ofC = [2, 4, 5, 6];
    const which = i % 3;
    const wanted = [ofA, ofB, ofC][which];
    const other = [ofB, ofC, ofA][which];
    const name = [nameA, nameB, nameC][which];
    const sum = idx => idx.map(k => letters[k]).sort().join(" + ");
    const q = mkFig("Statistics",
      `The Venn diagram shows how many ${who} like each kind of fruit or ` +
      `activity, with a letter standing for the number in each region.\n\n` +
      `Which expression gives the total number of ${who} who like ${name}?`,
      sum(wanted),
      [sum(wanted.slice(0, 3)),                 // forgot the middle region
       sum(other),                              // the wrong circle
       letters[wanted[0]],                      // only the region that is in nothing else
       sum([wanted[0], wanted[3]]),
       sum(wanted.slice(1))],
      4, i,
      D.vennThree({ labelA: nameA, labelB: nameB, labelC: nameC, letters, outside }));
    if (q) q.explain =
      `Everybody inside the ${name} circle likes ${name}, however many other ` +
      `circles they are also inside — so add up EVERY region within it, not just ` +
      `the part that belongs to ${name} alone. There are four such regions: ` +
      `${sum(wanted)}. The commonest slip is leaving out the middle region, ` +
      `where all three circles overlap, which gives ${sum(wanted.slice(0, 3))}.`;
    return q;
  }

  /* MKT Maths 9 Q2: a pie chart labelled in percentages, and the DIFFERENCE
     between two of the sectors once the total is known. */
  const PIE_PCT_SETS = [
    { what: "drinks chosen at a party", who: "people", total: 200,
      parts: [["Cola", 50], ["Squash", 20], ["Pepsi", 15], ["Milkshake", 10], ["Sprite", 5]] },
    { what: "colours of T-shirt in a shop", who: "shirts", total: 400,
      parts: [["Grey", 35], ["Red", 25], ["Blue", 20], ["Green", 15], ["Black", 5]] },
    { what: "ways pupils travel to school", who: "pupils", total: 300,
      parts: [["Walk", 40], ["Bus", 30], ["Car", 20], ["Cycle", 10]] },
    { what: "books borrowed from a library", who: "books", total: 500,
      parts: [["Fiction", 45], ["History", 25], ["Science", 20], ["Poetry", 10]] },
    { what: "pets owned by a class", who: "pets", total: 240,
      parts: [["Dog", 40], ["Cat", 25], ["Fish", 20], ["Rabbit", 15]] },
    { what: "fruit sold by a market stall", who: "items", total: 600,
      parts: [["Apples", 35], ["Bananas", 30], ["Pears", 20], ["Plums", 15]] },
    { what: "sandwiches sold by a cafe", who: "sandwiches", total: 800,
      parts: [["Cheese", 30], ["Ham", 25], ["Tuna", 25], ["Egg", 20]] },
    { what: "instruments played in an orchestra", who: "players", total: 120,
      parts: [["Strings", 50], ["Brass", 20], ["Woodwind", 20], ["Percussion", 10]] },
    { what: "sports chosen for games afternoon", who: "pupils", total: 360,
      parts: [["Rugby", 35], ["Hockey", 30], ["Netball", 25], ["Tennis", 10]] },
    { what: "types of tree in a wood", who: "trees", total: 1000,
      parts: [["Oak", 40], ["Ash", 25], ["Birch", 20], ["Beech", 15]] },
    { what: "flavours of ice cream sold in a week", who: "tubs", total: 240,
      parts: [["Vanilla", 40], ["Chocolate", 25], ["Strawberry", 20], ["Mint", 15]] },
    { what: "coats handed in to lost property", who: "coats", total: 80,
      parts: [["Black", 45], ["Navy", 25], ["Grey", 20], ["Brown", 10]] }
  ];

  const piePercentSectors = set =>
    set.parts.map(([label, pct]) => [`${label} — ${pct}%`, pct * 3.6]);

  function statPieDifference(i) {
    if (!D) return null;
    const set = PIE_PCT_SETS[i % PIE_PCT_SETS.length];
    if (set.parts.reduce((t, p) => t + p[1], 0) !== 100) return null;
    /* Both sectors from a part of the seed that does not move with the set
       index, or each set only ever produces the same pairing. */
    const n = set.parts.length;
    const bi = Math.floor(i / PIE_PCT_SETS.length) % n;
    const si = (bi + 1 + Math.floor(i / (PIE_PCT_SETS.length * n)) % (n - 1)) % n;
    /* Order them rather than rejecting the seed: "how many more" just needs to
       name the larger one first, and rejecting threw away two seeds in three. */
    const pair = [set.parts[bi], set.parts[si]].sort((x, y) => y[1] - x[1]);
    const big = pair[0], small = pair[1];
    if (big[1] === small[1]) return null;         // no difference to ask about
    const gap = big[1] - small[1];
    const ans = (gap / 100) * set.total;
    if (!Number.isInteger(ans) || ans <= 0) return null;
    const at = pct => (pct / 100) * set.total;
    const q = mkFig("Statistics",
      `The pie chart shows the ${set.what}.\n\n` +
      `There were ${comma(set.total)} ${set.who} altogether. How many more were ` +
      `${big[0]} than ${small[0]}?`,
      `${comma(ans)} ${set.who}`,
      [`${comma(at(big[1]))} ${set.who}`,        // just the larger sector
       `${comma(at(small[1]))} ${set.who}`,      // just the smaller one
       `${comma(at(big[1] + small[1]))} ${set.who}`,   // added them instead
       `${comma(gap)} ${set.who}`,               // gave the percentage difference
       `${comma(ans / 2)} ${set.who}`],
      4, i, D.pieChart(piePercentSectors(set)));
    if (q) q.explain =
      `Find the difference in PERCENTAGE first, then turn it into ` +
      `${set.who}: ${big[0]} is ${big[1]}% and ${small[0]} is ${small[1]}%, a gap ` +
      `of ${gap}%. Now ${gap}% of ${comma(set.total)} = ${comma(ans)}. Working out ` +
      `each sector separately and subtracting gives the same answer — ` +
      `${comma(at(big[1]))} − ${comma(at(small[1]))} = ${comma(ans)} — but the ` +
      `${gap}% itself is not the answer, because the question asks for ${set.who}.`;
    return q;
  }

  /* MKT Maths 9 Q15: two sectors are worth N between them; how many altogether?
     The whole from a part, which is the reverse of the usual pie question. */
  function statPieTotalFromPart(i) {
    if (!D) return null;
    const set = PIE_PCT_SETS[(i + 3) % PIE_PCT_SETS.length];
    if (set.parts.reduce((t, p) => t + p[1], 0) !== 100) return null;
    const n = set.parts.length;
    const ai = Math.floor(i / PIE_PCT_SETS.length) % n;
    const bi = (ai + 1) % n;
    const a = set.parts[ai], b = set.parts[bi];
    const share = a[1] + b[1];
    if (share >= 100) return null;
    const known = (share / 100) * set.total;
    if (!Number.isInteger(known)) return null;
    const q = mkFig("Statistics",
      `The pie chart shows the ${set.what}.\n\n` +
      `The ${a[0].toLowerCase()} and the ${b[0].toLowerCase()} come to ` +
      `${comma(known)} ${set.who} between them. How many ${set.who} are there in total?`,
      `${comma(set.total)} ${set.who}`,
      [`${comma(known * 2)} ${set.who}`,                       // doubled it
       `${comma(Math.round(known * 100 / a[1]))} ${set.who}`,  // used one sector only
       `${comma(known + share)} ${set.who}`,
       `${comma(Math.round(set.total / 2))} ${set.who}`,
       `${comma(set.total + known)} ${set.who}`],
      4, i, D.pieChart(piePercentSectors(set)));
    if (q) q.explain =
      `The two sectors named come to ${a[1]}% + ${b[1]}% = ${share}% of ` +
      `everything, and that ${share}% is ${comma(known)} ${set.who}. So 1% is ` +
      `${comma(known)} ÷ ${share} = ${comma(known / share)}, and 100% is ` +
      `${comma(known / share)} × 100 = ${comma(set.total)}. Going from a part to ` +
      `the whole means dividing by the part's percentage and multiplying by 100 — ` +
      `not doubling, which is only right when the part happens to be half.`;
    return q;
  }


  /* MKT Maths 9 Q5: a journey in words, and four speed-time graphs to choose
     between. The distractors are the mistakes the question is built around -
     the two speeds the wrong way round, the stop left out, and the stop put in
     the wrong place - so every graph is a plausible reading of the words. */
  const JOURNEY_POOL = [
    { legs: [[20, 20], [30, 0], [60, 30]], maxSpeed: 40 },
    { legs: [[15, 10], [15, 0], [30, 20]], maxSpeed: 30 },
    { legs: [[30, 30], [20, 0], [40, 10]], maxSpeed: 40 },
    { legs: [[10, 20], [20, 0], [30, 40]], maxSpeed: 50 },
    { legs: [[25, 15], [25, 0], [50, 25]], maxSpeed: 30 },
    { legs: [[40, 25], [10, 0], [20, 15]], maxSpeed: 30 },
    { legs: [[20, 30], [40, 0], [30, 20]], maxSpeed: 40 },
    { legs: [[30, 10], [15, 0], [45, 30]], maxSpeed: 40 }
  ];

  function spdSpeedTimeMatch(i) {
    if (!D) return null;
    const j = JOURNEY_POOL[i % JOURNEY_POOL.length];
    const [[t1, v1], [t2], [t3, v3]] = j.legs;
    const right = j.legs;
    /* Three wrong graphs, each a specific misreading. */
    const swapped = [[t1, v3], [t2, 0], [t3, v1]];
    const noStop = [[t1, v1], [t3, v3]];
    const stopFirst = [[t2, 0], [t1, v1], [t3, v3]];
    const candidates = [right, swapped, noStop, stopFirst];
    /* Rotate which lettered graph is correct, or the answer is always A. */
    const shift = Math.floor(i / JOURNEY_POOL.length) % 4;
    const graphs = candidates.map((_, k) => candidates[(k - shift + 4) % 4]);
    const answerIndex = shift;
    const maxTime = t1 + t2 + t3;
    const spell = m => (m % 60 === 0 && m >= 60
      ? `${m / 60} hour${m === 60 ? "" : "s"}` : `${m} minutes`);
    const q = mkFig("Speed",
      `A car travelled at ${v1} m/s for ${spell(t1)}. It then stopped at a ` +
      `service station for ${spell(t2)}. Finally it travelled at ${v3} m/s for ` +
      `${spell(t3)}.\n\nWhich graph shows the car's journey?`,
      `Graph ${"ABCD"[answerIndex]}`,
      ["ABCD".split("").filter((_, k) => k !== answerIndex).map(L => `Graph ${L}`)].flat(),
      4, i,
      D.speedTimeChoices(graphs, { maxTime, maxSpeed: j.maxSpeed }));
    if (q) q.explain =
      `On a SPEED-time graph a steady speed is a flat line, not a sloping one — ` +
      `a sloping line would mean the speed itself was changing. So the journey ` +
      `is three flat runs: one at ${v1} m/s lasting ${spell(t1)}, one at 0 for ` +
      `${spell(t2)} while it is stopped, and one at ${v3} m/s lasting ` +
      `${spell(t3)}. Check the heights and the widths in that order, and watch ` +
      `for the graph that has the two speeds the wrong way round.`;
    return q;
  }


  /* MKT Maths 9 Q55: a hexagonal pyramid, and the ratio of its faces to its
     vertices. geoPrismFEV covers prisms - F = n + 2, E = 3n, V = 2n - and a
     pyramid is not the same shape of formula: F = n + 1, E = 2n, V = n + 1, so
     its faces and vertices are always equal. That last fact is worth a question
     of its own, because "the same" is a surprising answer. */
  /* The base's own noun is stored rather than derived from the adjective:
     stripping "al" and adding "on" turned decagonal into "decagonon". */
  const PYRAMID_BASES = [
    [3, "triangular", "triangle"], [4, "square", "square"],
    [5, "pentagonal", "pentagon"], [6, "hexagonal", "hexagon"],
    [7, "heptagonal", "heptagon"], [8, "octagonal", "octagon"],
    [9, "nonagonal", "nonagon"], [10, "decagonal", "decagon"]
  ];

  function geoPyramidFEV(i) {
    const [n, name, base] = PYRAMID_BASES[i % PYRAMID_BASES.length];
    const F = n + 1, E = 2 * n, V = n + 1;
    const asks = [
      ["how many faces does it have", `${F}`, [`${n}`, `${E}`, `${F + 1}`, `${n + 2}`]],
      ["how many edges does it have", `${E}`, [`${n}`, `${F}`, `${E + 1}`, `${3 * n}`]],
      ["how many vertices does it have", `${V}`, [`${n}`, `${E}`, `${2 * n}`, `${V + 1}`]],
      ["what is the ratio of its faces to its vertices", "1 : 1",
       [`${F} : ${E}`, `${n} : ${F}`, `${E} : ${F}`, "2 : 1"]]
    ];
    const [phrase, ans, wrong] = asks[Math.floor(i / PYRAMID_BASES.length) % asks.length];
    const q = mk("Geometry",
      `A ${name} pyramid has a ${base} for its base and a single apex.\n\n` +
      `${phrase[0].toUpperCase() + phrase.slice(1)}?`,
      ans, wrong, 4, i);
    if (q) q.explain =
      `A pyramid on an ${n}-sided base has ${n} triangular faces plus the base, ` +
      `so F = ${n} + 1 = ${F}. It has the ${n} edges of the base plus ${n} sloping ` +
      `up to the apex, so E = 2 × ${n} = ${E}. And it has the ${n} corners of the ` +
      `base plus the apex, so V = ${n} + 1 = ${V}. Notice that F and V come out ` +
      `equal for every pyramid — the ratio of faces to vertices is always 1 : 1, ` +
      `whatever the base. Do not use the prism formulas: a prism has F = n + 2, ` +
      `E = 3n and V = 2n.`;
    return q;
  }

  /* A triangular prism: the cross-section is a triangle, so its area is halved
     before the length is applied. Forgetting the half is the whole question. */
  function meaTriangularPrismVolume(i) {
    const b = 4 + 2 * axis(i, 0, 8);
    const hgt = 3 + axis(i, 1, 9);
    const len = 5 + 2 * axis(i, 2, 8);
    if ((b * hgt) % 2) return null;                 // keep the answer whole
    const ans = (b * hgt / 2) * len;
    const q = mk("Measurement",
      `A prism has a triangular cross-section with a base of ${b} cm and a ` +
      `height of ${hgt} cm. The prism is ${len} cm long.\n\n` +
      `What is its volume?`,
      `${comma(ans)} cm³`,
      [`${comma(b * hgt * len)} cm³`,               // forgot to halve the triangle
       `${comma(Math.round(b * hgt * len / 3))} cm³`,  // used a third, as for a pyramid
       `${comma(b * hgt / 2)} cm³`,                 // stopped at the cross-section
       `${comma(ans * 2)} cm³`, `${comma((b + hgt) * len)} cm³`],
      4, i);
    if (q) q.explain =
      `The volume of any prism is the area of its cross-section times its ` +
      `length. The cross-section here is a triangle, so its area is ` +
      `½ × ${b} × ${hgt} = ${comma(b * hgt / 2)} cm², not ${comma(b * hgt)} cm². ` +
      `Then ${comma(b * hgt / 2)} × ${len} = ${comma(ans)} cm³. Leaving the half ` +
      `out gives ${comma(b * hgt * len)}, which is the volume of the box the ` +
      `prism would fit inside.`;
    return q;
  }

  /* MKT Maths 9: "by what percentage should the car decrease its speed so that
     the speed becomes 80 m/s?" The percentage is of the ORIGINAL, and dividing
     by the new figure instead is the mistake worth offering. */
  function pctDecreaseToTarget(i) {
    /* Both from i % 10 gave ten combinations and eight surviving questions. */
    const from = [100, 200, 250, 400, 500, 50, 300, 80, 120, 150][i % 10];
    const drop = [10, 20, 25, 40, 50, 5, 30, 15, 60, 75][Math.floor(i / 10) % 10];
    const to = from * (100 - drop) / 100;
    if (!Number.isInteger(to) || to <= 0) return null;
    const wrongWay = Math.round((from - to) / to * 1000) / 10;
    const q = mk("Percentages",
      `A car is travelling at ${from} m/s.\n\n` +
      `By what percentage must its speed decrease so that it is travelling at ` +
      `${to} m/s?`,
      `${drop}%`,
      [`${fmt(wrongWay)}%`,                  // divided by the new speed, not the old
       `${from - to}%`,                      // gave the drop in m/s as a percentage
       `${100 - drop}%`,                     // gave what is left rather than what goes
       `${drop / 2}%`, `${drop * 2}%`],
      4, i);
    if (q) q.explain =
      `A percentage change is always measured against what you STARTED with. ` +
      `The speed falls by ${from} − ${to} = ${from - to} m/s, and that has to be ` +
      `written as a fraction of the original ${from}: ${from - to} ÷ ${from} = ` +
      `${fmt((from - to) / from)}, which is ${drop}%. Dividing by the new speed ` +
      `instead gives ${fmt(wrongWay)}%, and that is the answer to a different ` +
      `question — by what percentage would ${to} have to INCREASE to reach ${from}.`;
    return q;
  }

  /* "How much will it cost to buy enough paint to cover shape B, if each 1 litre
     tin costs 3?" Tins come whole, so the division has to round UP however small
     the leftover is - and then the cost follows. */
  function meaPaintTins(i) {
    const area = 20 + 3 * axis(i, 0, 20);
    const covers = 4 + axis(i, 1, 5);
    const cost = 3 + axis(i, 2, 6);
    const tins = Math.ceil(area / covers);
    if (area % covers === 0) return null;           // no rounding up to do
    const total = tins * cost;
    const q = mk("Measurement",
      `A wall has an area of ${area} m². One tin of paint covers ${covers} m², ` +
      `and a tin costs £${cost}.\n\n` +
      `What is the least it can cost to buy enough paint for the whole wall?`,
      money(total),
      [money(Math.floor(area / covers) * cost),      // rounded the tins down
       money(Math.round(area / covers * cost * 100) / 100),  // bought part of a tin
       money(area * cost),                           // a tin per square metre
       money(total + cost), money(tins)],
      4, i);
    if (q) q.explain =
      `Work out the tins first, and round UP. ${tins - 1} tins cover ` +
      `${comma((tins - 1) * covers)} m², which is not enough for ${area} m², and ` +
      `${tins} tins cover ${comma(tins * covers)} m², which is — so ${tins} tins ` +
      `have to be bought, and the last one is mostly unused. Then ${tins} × ` +
      `£${cost} = ${money(total)}. Rounding down to ${tins - 1} gives ` +
      `${money((tins - 1) * cost)} and leaves part of the wall bare.`;
    return q;
  }

  /* MKT Maths 9: "the difference between the largest and the smallest whole
     numbers that round to 45,650 to the nearest 50". The bounds are half a step
     either side, and the gap between the whole numbers inside them is one less
     than the step - which is the part that surprises. */
  function numRoundingBoundsGap(i) {
    const step = [10, 50, 100, 20, 500, 1000, 5, 200][i % 8];
    const target = step * (12 + axis(i, 1, 90));
    const lowest = target - step / 2;               // rounds up by convention
    const highest = target + step / 2 - 1;
    if (!Number.isInteger(lowest)) return null;
    const ans = highest - lowest;
    const q = mk("Numbers",
      `A whole number is rounded to the nearest ${step} and the answer is ` +
      `${comma(target)}.\n\n` +
      `What is the difference between the largest and the smallest whole number ` +
      `it could have been?`,
      `${comma(ans)}`,
      [`${comma(step)}`,                             // gave the step itself
       `${comma(step / 2)}`,                         // gave half the step
       `${comma(ans + 1)}`, `${comma(step - 2)}`, `${comma(step * 2)}`],
      4, i);
    if (q) q.explain =
      `Anything from half a step below to half a step above rounds to ` +
      `${comma(target)}. Half of ${step} is ${step / 2}, so the smallest is ` +
      `${comma(target)} − ${step / 2} = ${comma(lowest)}, which rounds up, and ` +
      `the largest is ${comma(target)} + ${step / 2} − 1 = ${comma(highest)}, ` +
      `because ${comma(target + step / 2)} would round up to the next ${step} ` +
      `instead. The difference is ${comma(highest)} − ${comma(lowest)} = ` +
      `${comma(ans)} — one less than ${step}, not ${step}.`;
    return q;
  }

  /* MKT Maths 9 Q13: Mark's scale of 'ticks' and 'tocks'. Two invented units and
     a rate between them, which is a ratio question wearing a disguise - and the
     disguise is what makes it hard, because there is no familiar unit to lean on. */
  function ratInventedScale(i) {
    const NAMES = [["ticks", "tocks"], ["glips", "glops"], ["zags", "zigs"],
                   ["murps", "murks"], ["blens", "blons"], ["quils", "quals"]];
    const [a, b] = NAMES[i % NAMES.length];
    const na = 2 + axis(i, 0, 5), nb = 2 + axis(i, 1, 6);
    if (na === nb) return null;                     // a 1:1 scale asks nothing
    const given = nb * (2 + axis(i, 2, 9));         // a whole number of the second unit
    const ans = given / nb * na;
    if (!Number.isInteger(ans)) return null;
    const q = mk("Ratio",
      `On Mark's scale, ${na} ${a} measure the same length as ${nb} ${b}.\n\n` +
      `How many ${a} are there in ${given} ${b}?`,
      `${comma(ans)} ${a}`,
      [`${comma(given / na * nb)} ${b === a ? "" : a}`.trim(),   // used the ratio upside down
       `${comma(given)} ${a}`,                                   // assumed they are the same
       `${comma(given * na)} ${a}`, `${comma(Math.round(given / na))} ${a}`,
       `${comma(ans + na)} ${a}`],
      4, i);
    if (q) q.explain =
      `Work in whole lots and no decimals are needed. ${nb} ${b} make ${na} ${a}, ` +
      `so first ask how many lots of ${nb} there are: ${given} ÷ ${nb} = ` +
      `${comma(given / nb)}. Each of those lots is worth ${na} ${a}, so ` +
      `${comma(given / nb)} × ${na} = ${comma(ans)} ${a}. Finding what one ` +
      `${b.replace(/s$/, "")} is worth first also works, but it can give a ` +
      `recurring decimal — and rounding it before you multiply will not land on ` +
      `the exact answer. Check the direction too: there are ` +
      `${na < nb ? "fewer" : "more"} ${a} than ${b}, so the answer should be ` +
      `${na < nb ? "smaller" : "larger"} than ${given}.`;
    return q;
  }

  /* ═══════════════════ DRIVER ═══════════════════ */

  /* Each entry is [template, easiest level, hardest level].

     The band — not the template's own diff(i) call — decides what the child is
     told. Difficulty has to describe the skill being tested, and the skill is a
     property of the template, not of where a variation landed in the loop:
     "What is the LCM of 6 and 9?" is not harder than "the LCM of 15 and 20?"
     just because it was generated on a multiple of 5. Where a band spans more
     than one level, the variations are spread evenly through it.

     The bands are calibrated against MKT QE Maths Mock Paper 9, by counting the
     computations a question needs to reach its answer. All 60 of the paper's
     questions average 2.65 such steps, so:

         1 step   → [2, 2]   below the paper's floor; not served in QE prep
         2 steps  → [2, 3]   half its variations serve Hard
         3 steps  → [3, 3]   the paper's own standard
         4+ steps → [4, 4]   deliberately above the paper

     That puts Hard at 2.67 steps against the paper's 2.65, and Super Hard at
     4.00 — which is the point: Hard should feel like the real thing and Super
     Hard should be harder than it.

     A new template belongs in the band its step count earns. Note the paper does
     NOT get harder by adding steps (its thirds run 2.85 → 2.55 → 2.55) — the late
     questions are harder because the TYPE is unfamiliar, so step count sets the
     band but is not on its own a measure of how hard a question is. */
  const generators = {
    Numbers: [
      [numPlaceValue, 1, 2],              // read one digit's value
      [numPlaceValueDiff, 3, 3],          // two place values, then subtract
      [numRounding, 1, 2],
      [numRoundingBounds, 2, 2],          // rounding worked backwards
      [numIsPrime, 1, 2],
      [numLCM, 2, 2],
      [numHCF, 2, 2],
      [numHCFofFour, 3, 3],               // four numbers at once
      [numPowers, 1, 1],
      [numFactorCount, 3, 3],
      [numPrimeFactorCount, 2, 2],        // index notation
      [numArithmetic, 1, 2],
      [numWordProblem, 1, 1],
      [numBusLCM, 3, 3],                  // LCM of three, applied
      [numSmallestEvenFromDigits, 2, 3],
      [numCubeMissing, 2, 2],
      [numPrimeSumSquare, 4, 4],          // search over a range
      [numFourConsecOdd, 2, 3],
      [numCompareExpressions, 4, 4],      // four calculations, then compare
      [numRoundLargePlace, 2, 2], [numDigitProductCount, 4, 4], [numClosestToTarget, 2, 3],
      [numRemainderPuzzle, 3, 3],         // common multiple, then adjust
      [numLastDigitPower, 3, 3],  // spot the repeating cycle
      [numWordsToDigits, 2, 2],           // words to digits, empty hundreds column
      [numSquaresMinusCubes, 3, 3],       // count squares and cubes in one list
      [numFactorStatements, 3, 3],        // which claim about factors is false
      [numDivisibilityRule, 3, 3],        // divides exactly, without dividing
      [numSmallestWithFactors, 4, 4],     // fewest number with that many factors
      /* question-bank/NewText, second scan */
      [numOddFactorCount, 3, 3],          // strip the 2s out first
      [numFactorsNotFactors, 4, 4],       // two factor lists, then subtract
      [numDistinctPrimeFactors, 2, 3],    // different primes, not counting repeats
      [numSupplyDuration, 3, 3],          // complete days, or the day it runs out
      [numExtremeDivisible, 4, 4],        // step inwards from each end
      [numRoundingBoundsGap, 3, 3],       // the gap is one less than the step
      /* KS3 Year 7/8 rows the bank had no cover for. Bands follow the step
         count, as documented at the top of this registry. */
      [numRoundDecimalPlaces, 2, 3],      // chopping is not rounding
      [numRoundSigFigs, 2, 3],            // significant figures, not places
      [numEstimateOneSigFig, 3, 3],       // round both, then multiply
      [numFractionToPercent, 2, 3],       // divide, then x 100
      [numLCMShare, 3, 3]                 // smallest, not just any common multiple
    ],
    Decimals: [
      [decAdd, 1, 1], [decSubtract, 1, 2], [decMultiply, 2, 2], [decDivide, 2, 2],
      [decCompare, 1, 2], [decRound, 1, 2], [decToFrac, 2, 2],
      [decHalfway, 2, 2],                 // midpoint of two decimals
      [decMultFactReuse, 2, 3],           // reuse a known product, shift place value
      [decPriceChange, 2, 3],             // increase then decrease
      [decDivideByDecimal, 2, 3],         // dividing by a number below 1
      [decChainedOf, 2, 3],               // decimal of a decimal of a whole
      /* harder decimals */
      [decMultiplyBySmall, 2, 2],         // the point shifts, the digits do not
      [decOrderMixed, 2, 3],              // decimals against percentages
      [decUnitPrice, 3, 3],               // better value, per 100 g
      [decMultiplyGivenFact, 2, 3],       // a whole-number product handed over
      [decMoneySplit, 3, 3],              // shared out, with pence left over
      /* Decimals had no Super Hard template at all. */
      [decMultiStepBill, 4, 4],           // two prices, a discount, then change
      [decBounceHeight, 4, 4],            // the same fraction of a smaller number
      [decDivideGivenFact, 2, 3],         // the digits are known, the point moves
      [decReverseMultiply, 3, 3],         // undoing x0.35 makes it bigger
      [decPlaceValueChain, 2, 3]          // how many places, and which way
    ],
    Fractions: [
      [fracAdd, 2, 2], [fracSubtract, 2, 3], [fracMultiply, 1, 2], [fracDivide, 2, 2],
      [fracSimplify, 1, 1], [fracImproperToMixed, 1, 2], [fracOfX, 2, 2],
      [fracMixedMultiply, 3, 3],          // convert, multiply, simplify
      [fracOfFrac, 2, 3],                 // fraction of a fraction, in words
      [fracReverseTwoStage, 4, 4],        // two fractions removed, worked back
      [fracOfRemainderMoney, 4, 4],       // fraction of what was left
      [fracBetweenTwo, 3, 3],             // strictly between two fractions
      [fracOfCapacity, 2, 3], [figShadedFraction, 2, 3],
      /* harder fractions */
      [fracMixedAddSubtract, 3, 3],       // mixed numbers, unlike denominators
      [fracDivideMixed, 3, 3],            // improper first, then flip
      [fracReverseOf, 2, 3],              // given the part, find the whole
      [figShadedTriangles, 2, 3]          // a shape cut into equal triangles
    ],
    Percentages: [
      [pctDecreaseToTarget, 2, 3],        // the percentage is of the ORIGINAL
      [pctOf, 1, 1], [pctFracToPct, 2, 2], [pctDecToPct, 1, 2],
      [pctSalePrice, 2, 2], [pctIncrease, 2, 2], [pctSimpleInterest, 2, 3],
      [pctReverse, 2, 2],                 // work back to the original
      [pctChained, 3, 3],                 // percentage of a percentage of a percentage
      [pctSaleChange, 3, 3],              // discount, total, then change
      [pctVennNeither, 4, 4],             // overlapping sets
      [pctProfitAfterLoss, 4, 4], [pctProfitPerItem, 2, 3],
      /* harder percentages */
      [pctReverseAfterChange, 2, 3],      // back through a rise or a fall
      [pctSingleEquivalent, 3, 3],        // two changes as one
      [pctProfitPercent, 2, 3],           // profit as a percentage of cost
      [pctSuccessiveReverse, 4, 4]        // undo two sales, later one first
    ],
    BIDMAS: [
      [bidSimple, 1, 1], [bidBrackets, 1, 1], [bidPowers, 2, 2],
      [bidMixed, 3, 3], [bidNegative, 2, 3], [bidTempChange, 2, 2],
      [bidNestedBrackets, 4, 4],          // brackets inside brackets, with a power
      [bidMissingOperator, 3, 3],         // choose the operations
      [bidInsertBrackets, 3, 3],
      /* harder BIDMAS */
      [bidFractionBar, 2, 3],             // the bar groups top and bottom
      [bidNegativePower, 2, 3],           // -3 squared is not (-3) squared
      [bidRootsAndPowers, 3, 3],          // a root and a power together
      [bidNotEqual, 4, 4],                // three are equal, one is not
      [bidBracketsFourTerms, 3, 3]        // place brackets in four terms           // place the brackets
    ],
    Algebra: [
      [algExpressionProperty, 3, 3],      // a property of the expression, not a value
      [algSubLinear, 1, 1], [algSubMulti, 2, 3], [algSubQuadratic, 2, 3],
      [algSolve1Step, 1, 1], [algSolve2Step, 2, 2], [algSolveBothSides, 2, 3],
      [algSimplifyTerms, 2, 2], [algCustomOp, 2, 3],
      [algWeightPair, 2, 3],              // sum and difference
      [algTriangleAngles, 4, 4],          // several constraints at once
      [algThreeItemPricing, 4, 4],        // three unknowns
      [algSimultaneous, 3, 3],            // two equations, two unknowns
      [algChainSubstitute, 2, 3], [algFunctionMachine, 2, 3],
      /* August QE/EPP papers */
      [algPowerEquation, 2, 2],           // 2^x = 64
      [algExpressionChange, 2, 2],        // build the expression, do not evaluate
      [algRemainderDivisor, 2, 3],        // 40 / N = 3 remainder 4
      [algInequalityInteger, 2, 3],       // 41 < 3y < 43
      [algPerimeterEquation, 3, 3],       // form the equation from a perimeter
      [algInequalityCount, 2, 3],         // how many whole numbers fit
      /* Year 8 brackets, which the bank could not pose at all. */
      [algExpandBrackets, 3, 3],          // a subtracted bracket flips both signs
      [algFactoriseSimple, 2, 3]          // fully means the largest common factor
    ],
    Sequences: [
      [seqArithNext, 1, 1], [seqArithNth, 2, 2], [seqArithNthFormula, 2, 3],
      [seqFibLike, 2, 2], [seqGeomNext, 2, 2], [seqBallPattern, 2, 2],
      [seqMatchstickNth, 2, 3],           // nth term as an expression
      [seqQuadraticNext, 3, 3],           // the gaps themselves grow
      [seqNthFromTwoTerms, 3, 3],         // rule from two scattered terms
      [seqFibMissingStart, 2, 3],         // Fibonacci-like, worked backwards
      [seqQuadraticDecreasing, 3, 3],
      /* harder sequences */
      [seqWhichTerm, 2, 3],               // which position holds this value
      [seqTriangular, 2, 3],              // dot patterns, drawn
      [seqRecurrenceMissing, 2, 2],       // a rule using the term before
      [seqQuadraticNth, 4, 4],            // nth term with a constant 2nd difference
      [seqArithSum, 3, 3],                // total of the first n terms
      [seqInterleaved, 3, 3],             // two sequences laid alternately
      [seqTwoSequencesMeet, 4, 4]         // find both rules, then the crossing
    ],
    Ratio: [
      [ratInventedScale, 2, 3],           // two invented units and a rate
      [ratSimplify, 1, 1], [ratSplit, 2, 2], [ratWordTotal, 2, 2],
      [ratDifference, 2, 3], [ratRecipe, 2, 2], [ratMapScale, 2, 2],
      [ratInverseProp, 2, 3],             // inverse proportion
      [ratChained, 3, 3],                 // link two ratios
      [ratAfterChange, 4, 4],             // ratio before and after a change
      [ratMapReverse, 2, 2],
      [ratThreeCategories, 4, 4],         // three kinds, a ratio across another split
      [ratInverseTime, 2, 3],             // more power, less time
      /* harder ratio */
      [ratThreePart, 3, 3],               // three parts, not two
      [ratFractionOfWhole, 2, 3],         // fraction of the whole, and back
      [ratBestValue, 3, 3],               // per-item cost across pack sizes
      [ratCompareTwoRatios, 2, 3],        // equivalent, or one larger
      /* question-bank/NewText, second scan */
      [ratLimitingIngredient, 4, 4],      // the ingredient that runs out first
      [ratRelativeValueChain, 4, 4],      // price everything in one currency
      [ratEqualise, 2, 3]                 // move enough to even them up
    ],
    Speed: [
      [spdCombinedTaps, 4, 4],            // two taps filling one tank
      [spdHalfSpeedWithStops, 4, 4],      // half the speed is twice the time
      [spdSpeedTimeMatch, 3, 3],          // steady speed is a FLAT line here
      [spdFindSpeed, 1, 1], [spdFindDistance, 1, 2], [spdFindTime, 2, 2],
      [spdMphHoursMin, 2, 3],             // mixed hours and minutes
      [spdGapBetweenTwo, 3, 3],
      [spdAverageTwoLegs, 4, 4],          // average speed is not the mean speed
      [spdCatchUp, 3, 3],                 // closing a head start
      [spdMeetingPoint, 3, 3],            // travelling towards each other
      [figDistanceTimeStationary, 2, 2], [figDistanceTimeSpeed, 2, 3],
      [spdSpeedFromMinutes, 2, 3],        // the time is given in minutes
      [figTwoTravellersGraph, 2, 3],      // two journeys on one graph
      [spdUnitConvert, 2, 3],             // km/h into m/s
      [spdAverageThreeLegs, 4, 4],        // three legs, not two
      [spdTimetable, 2, 2],               // minutes crossing the hour
      [spdReturnUnknownDistance, 4, 4]    // out and back, total time known
    ],
    Measurement: [
      [meaUnitConvert, 1, 1], [meaAreaPerim, 1, 2], [meaVolumeCube, 2, 2],
      [meaTempDiff, 2, 2], [meaInchConvert, 2, 2], [meaMoneyChange, 2, 2],
      [meaOverlapArea, 3, 3],
      [meaCompoundVolume, 4, 4],          // L-shaped cross-section
      [meaSurfaceAreaFromVolume, 4, 4],   // volume back to surface area
      [meaScaleArea, 2, 3],               // areas scale by the square
      [meaFoldPaper, 3, 3], [meaFrameWidth, 3, 3], [meaSquaresInRectangle, 2, 2],
      [figCompoundPerimeter, 3, 3],       // L-shape drawn, area or perimeter
      /* question-bank/20260822 */
      [meaPourFromContainer, 2, 3],       // litres in, millilitres out
      [meaEstimateWeight, 2, 2],          // is a banana 20 g or 200 g
      [numMultiItemTotal, 2, 3],          // one of one thing, several of another
      [meaCubePacking, 4, 4],             // whole cubes only, so the leftover is wasted
      [meaCubeFromCluster, 4, 4],         // one cube out of a cuboid of cubes
      [meaEarningsPattern, 3, 3],         // a shift, days a week, and a rate
      /* question-bank/20260823-Onwards */
      [meaEstimateSize, 2, 2],            // a sensible length, height or capacity
      [meaEstimateCombine, 2, 3],         // estimate two things, then combine
      [meaTriangularPrismVolume, 2, 3],   // halve the cross-section first
      [meaPaintTins, 3, 3],               // tins come whole, so round up
      /* KS3 Year 8: trapezium area, an area worked backwards, and the
         metric-imperial row, which lost its only cover when meaInchConvert
         went down to Medium. */
      [meaTrapeziumArea, 3, 3],           // halving is the step that gets dropped
      [meaAreaFindMissingSide, 3, 3],     // undo the triangle's half
      [meaImperialConvert, 3, 3]          // match the units before multiplying
    ],
    Geometry: [
      [geoMissingEndpoint, 2, 3],         // one end and the midpoint, find the far end
      [geoCompassTurnSequence, 3, 3],     // three turns, angles over a full revolution
      [geoTurnThenWalk, 3, 3],            // reduce the turn, then walk
      [geoPyramidFEV, 2, 2],              // a pyramid is not a prism
      [geoAngleSum, 1, 1], [geoAngleType, 1, 1], [geoShapeAngle, 2, 2],
      [geoComplementary, 1, 2], [geoTriangleArea, 2, 2], [geoLinesSymmetry, 1, 2],
      [geoRotSymmetry, 2, 2], [geoPrismFEV, 2, 2], [geoCuboidMissingEdge, 2, 2],
      [geoRotationCoords, 2, 3],          // rotation about a point
      [geoShapeProperty, 2, 2], [geoShapeSplit, 2, 3],
      [geoPolygonFromAngleSum, 3, 3],     // angle sum back to side count
      [geoShadedArea, 3, 3],              // what is left after a cut-out
      [figAnglesOnLine, 2, 3], [figAnglesAtPoint, 2, 3],
      [figCoordinatesRead, 2, 2], [figCoordinatesMidpoint, 2, 3],
      /* question-bank/20260822 */
      [geoShapeFromSymmetry, 2, 2],       // which drawn shape fits both properties
      [geoNameTriangles, 2, 3],           // name four triangles from pictures
      [geoSplitPolygon, 2, 3],            // cut a corner off a regular polygon
      /* August QE/EPP papers */
      [geoCompassTurn, 2, 2],             // direction after turning right angles
      [geoCompassAngle, 2, 2],            // smallest turn between compass points
      [geoSymmetryCombined, 2, 3],        // lines of symmetry of two named shapes
      [geoSymmetryLetters, 2, 3],         // vertical mirror line in capitals
      [geoParallelogramVertex, 2, 3],     // fourth vertex from three
      [geoTriangleInequality, 3, 3],      // can these lengths make a triangle
      [geoPolygonMissingAngle, 2, 3],     // angle sum with a reflex angle
      [geoTransformCompose, 3, 3],        // translate, then rotate
      /* Spatial work, appended so no earlier entry's gIdx — and so no earlier
         template's seeds — moves. QE Mock Paper 9 Q50 is the painted cube. */
      [geoPaintedCube, 4, 4],             // where each kind of small cube sits
      [geoJoinedCubesSurface, 4, 4],      // a join hides two faces, not one
      [geoNetOppositeFace, 3, 3],         // fold the net, find the far face
      [geoNetOppositeSum, 4, 4],          // the same fold, then a total to hit
      /* Circles: a Year 8 row with nothing behind it at all, and two of
         Mock Paper 9's questions. The formula is given in the question,
         as that paper gave it. */
      [geoCircleArea, 2, 3],              // radius or diameter, then square it
      [geoCircleCircumference, 2, 3],     // 2 x pi x r, not pi x r
      [geoCircleAreaFromCircumference, 4, 4],  // back to the radius first
      [geoCircleInSquare, 4, 4],          // the side comes from the radius
      /* Reflections and bearings: two more Year 7/8 rows with no cover. */
      [geoReflectPoint, 2, 3],            // across the mirror, same distance
      [geoBearing, 3, 3],                 // clockwise from north, three figures
      [geoParallelLineAngles, 3, 3],      // F, Z and C shapes on parallel lines
      [geoTriangleUnique, 4, 4]           // what pins a triangle down to one
    ],
    Statistics: [
      /* question-bank/NewText, single-occurrence shapes */
      [statRequiredAverage, 4, 4],        // what average is needed from here on
      [statMeanOfRemaining, 4, 4],        // the mean after some are taken out
      [statAboveMean, 3, 3],              // count the bars above the mean
      [statPossibleRange, 3, 3],          // one member unknown, so the range is a span
      [statLargestDailyRange, 3, 3],      // the range of one day, not of the week
      [statVennThreeRegions, 3, 3],       // which regions make up one circle
      [statPieDifference, 3, 3],          // the gap between two sectors
      [statPieTotalFromPart, 4, 4],       // the whole from a part
      [statMean, 1, 1], [statMedian, 2, 2], [statMode, 1, 1], [statRange, 1, 1],
      [statMissingMean, 2, 3],            // mean worked backwards
      [statFreqMidpoint, 2, 2], [statPieAngle, 1, 2], [statPictogram, 2, 2],
      [statCorrelation, 1, 1], [statPieFromAngle, 2, 3], [statFreqTotal, 2, 3],
      [statMeanOfFactors, 3, 3],          // list factors, then average them
      [statCombinedMean, 4, 4],           // weighted, not halfway
      [statMedianFromFreq, 3, 3],         // median out of a frequency table
      [figBarChartTotal, 2, 3], [figBarChartDifference, 2, 3], [figPictogram, 2, 3],
      [figPieChart, 2, 3], [figVennOnly, 2, 3],
      [statMedianAngleTriangle, 3, 3],    // which value could be the median
      [figBarChartMode, 2, 2],            // the modal height on a bar chart
      [statMeanAfterChange, 3, 3],        // the count changes as well as the mean
      /* Comparing distributions: an average and a range, held at once. */
      [statCompareDistributions, 4, 4],
      [statScatterCorrelation, 3, 3]      // read the trend, left to right
    ],
    "Counting Principle": [
      [countDigitProduct, 4, 4],          // digit sets, then their arrangements
      /* The topic had only hand-written questions before, and none that a
         generator could vary. Pitched where the papers set it. */
      [countHandshakes, 2, 3],                // pairs, so halve the double count
      [countArrangeNoRepeat, 2, 3],           // n x (n-1) x (n-2)
      [countArrangeFirstRestrict, 3, 3],      // zero may not lead
      [countPlateLettersDigits, 3, 3],        // letters repeat, digits do not
      [countChooseCommittee, 2, 3],           // order does not matter
      [countEvenNoRepeat, 3, 3],              // fill the restricted place first
      [countGreaterThan, 3, 3],               // only the leading digit is bound
      [countWordRepeatedLetters, 3, 3],       // divide the repeats out
      [countCircular, 3, 3],                  // no first seat round a table
      [countGridPaths, 3, 3],                 // choose which moves go sideways
      [countCircularReflect, 3, 3],           // a bracelet can be turned over
      [countChooseFromTwoGroups, 3, 3],       // two selections multiplied
      [countTwoRestrictions, 4, 4]            // even AND above a bound
    ],
    Probability: [
      [probBagPick, 1, 1], [probDie, 2, 2], [probCoin, 1, 1], [probComplement, 1, 2],
      [probExpected, 2, 2], [probIndependent, 2, 2],
      [probWithoutReplacement, 3, 3],     // the pool changes between picks
      [probTwoDiceSum, 3, 3],             // count the favourable pairs
      [probAtLeastOne, 2, 3],             // easier via the complement
      /* Harder two-stage and complement work */
      [probTwoSameColour, 2, 3],          // both red, nothing put back
      [probConditionalSecond, 2, 2],      // the first pick has already happened
      [probTwoWayTable, 2, 3],            // overlap taken off one group
      [probFindOtherIndependent, 2, 2],   // worked backwards to the missing one
      [probAtLeastOneSix, 3, 3],          // complement of "none at all"
      [probOneOfEach, 3, 3],              // both orders count
      [probTwoSpinnersSum, 3, 3],         // count the pairs making the total
      [probAddToTarget, 3, 3],            // backwards from the probability
      [probNotAllSame, 2, 3],             // 1 minus the two matching ways
      [probThreeDrawsAllSame, 3, 3],      // three shrinking denominators
      /* Probability had no Super Hard template at all. */
      [probAtLeastOneOfColour, 4, 4],     // easier backwards, from 1
      [probSumToOneUnknown, 4, 4],        // the leftover is shared, not read off
      [probExpectedReverse, 3, 3],        // how many goes, not how many hits
      [probCompareChances, 3, 3],         // unlike denominators, compared across
      [probThreeIndependent, 4, 4]        // multiplied, never added
    ],
    Logic: [
      [logConsecutiveIntSum, 2, 2], [logConsecutiveEvenSum, 2, 3],
      [logConsecutiveOddPuzzle, 3, 3], [logPalindromeYesNo, 1, 1],
      [logNextPalindrome, 2, 2], [logSquarePalindromesInRange, 3, 3],
      [logDayOfWeek, 2, 2], [logDayWeeksAgo, 2, 2], [logDayShiftAcrossYear, 2, 3],
      [logLeapYearPick, 1, 2], [logLeapBirthday, 3, 3],
      [logClockAngleAtHour, 3, 3], [logClockMirror, 2, 2], [logSumAndDiff, 2, 2],
      [logArithmagonProduct, 3, 3], [logAdditionPyramid, 3, 3],
      [logLetterPuzzle, 2, 2], [logMagicSquareRow, 2, 2], [logDigitSumOfSum, 2, 2],
      [logTimeZone, 2, 2],                // hours ahead or behind, across midnight
      [logClockReflexAngle, 2, 3],        // the reflex angle between the hands
      [logSumOfAgesAgo, 4, 4],            // one member not yet born
      [logDefinedOperator, 3, 3],         // an invented symbol, applied twice
      [logBandedSeatCount, 4, 4],         // rows closed, rows short, rest full
      [logTimeZoneChain, 3, 3],           // two offsets, one of them implied
      [logClocksCoincide, 4, 4],          // one gains, one loses
      [logClockDigits, 4, 4],             // the next time with the same digits
      [logMazeBounce, 4, 4]               // turn clockwise at every wall
    ]
  };

  /* ── Pool sizes ──

     These templates are still producing a different question on every seed
     when the default 50 run out, so they are given more. Each number is the
     seed at which that template first repeats itself, measured with an
     oversized probe pool, capped at 150.

     Only templates already in the Super Hard band are listed. Adding seeds
     here grows Super Hard without lowering it: every extra question comes
     from a template that was scored at 4 or more computations against QE
     Mock Paper 9. */
  algThreeItemPricing.poolSize = 126;
  bidNestedBrackets.poolSize = 150;  // clean to 183
  fracReverseTwoStage.poolSize = 60;
  geoNetOppositeSum.poolSize = 150;  // clean to 260
  logClockDigits.poolSize = 84;
  meaCompoundVolume.poolSize = 150;  // clean to 168
  numCompareExpressions.poolSize = 57;
  pctProfitAfterLoss.poolSize = 81;
  pctVennNeither.poolSize = 150;  // clean to 260
  ratAfterChange.poolSize = 60;
  spdAverageTwoLegs.poolSize = 65;
  statCompareDistributions.poolSize = 150;  // clean to 160
  statMeanOfRemaining.poolSize = 55;
  statRequiredAverage.poolSize = 150;  // clean to 236

  // Single scale knob — produces ~140 generators × N variations questions.
  const VARIATIONS_PER_TEMPLATE = 50;

  Object.values(generators).forEach(gens => {
    gens.forEach(([gen, lo, hi], gIdx) => {
      const span = hi - lo + 1;
      /* A template whose combinations are far from exhausted at 50 seeds can ask
         for more, by setting `poolSize` on itself. Only ever more, never fewer:
         the loop starts at v = 0 either way, so the questions already in the
         bank are unchanged and a longer pool simply appends. Worth doing only
         where the extra seeds give DIFFERENT questions - past a template's
         ceiling they repeat, which is worse than nothing. */
      const variations = Math.max(VARIATIONS_PER_TEMPLATE, gen.poolSize || 0);
      for (let v = 0; v < variations; v++) {
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
