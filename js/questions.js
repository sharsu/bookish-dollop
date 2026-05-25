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

  /* mk(topic, question, correct, distractors, difficulty, seed) → MCQ object */
  const mk = (topic, question, correct, distractors, difficulty, seed) => {
    const uniq = [];
    [correct, ...distractors].map(v => `${v}`).forEach(v => { if (!uniq.includes(v)) uniq.push(v); });
    const num = Number(correct);
    let pad = 1;
    while (uniq.length < 4) {
      const cand = Number.isFinite(num) ? fmt(num + pad * 3 + difficulty) : `${uniq[0]} v${pad}`;
      if (!uniq.includes(cand)) uniq.push(cand);
      pad++;
      if (pad > 30) uniq.push(`${uniq[0]}_${uniq.length}`);
    }
    const pos = ((seed % 4) + 4) % 4;
    const opts = uniq.slice(1, 4);
    opts.splice(pos, 0, uniq[0]);
    return { id: id++, topic, question, options: opts, answer: pos, difficulty };
  };

  const diff = (i, hardCycle = 5) => (i % hardCycle === 0 ? 3 : (i % 2 === 0 ? 2 : 1));

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
      [comma(target), comma(ans * 10), comma(target * 10 ** (pos + 1))],
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
      [comma(ans + 10 ** lo * d), comma(ans - 10 ** lo), comma(d * 10 ** hi)],
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
      [comma(ans + 10), comma(ans - 10), comma(Number([...rest.slice(0, -1), rest[rest.length - 1], units].join("")))],
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
    return mk("Decimals",
      `Round ${fmt(+raw.toFixed(4))} to ${dp} decimal place${dp === 1 ? "" : "s"}.`,
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
    const a = 1 + 0.1 * (i % 9);
    const b = a + 0.05 + 0.013 * ((i % 7) + 1);
    const ans = (a + b) / 2;
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
      `${fmt(ans)}`, [`${fmt(ans * 10)}`, `${fmt(ans / 10)}`, `${fmt(a / 10)}`], diff(i, 4), i);
  }

  function decPriceChange(i) {
    const v = +((125 + i % 20) / 10).toFixed(1);
    const p = 10 + 5 * (i % 5);
    const q = 5 + 5 * (i % 4);
    const final = +(v * (1 + p / 100) * (1 - q / 100)).toFixed(2);
    return mk("Decimals",
      `A price of £${fmt(v)} is increased by ${p}% and then reduced by ${q}%. What is the final price?`,
      `£${fmt(final)}`,
      [`£${fmt(v * (1 + (p - q) / 100))}`, `£${fmt(v * (1 + p / 100 - q / 100))}`, `£${fmt(v * (1 - q / 100))}`],
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
      [`${ans + 2}`, `${a + b * c}`, `${-(a + b * c)}`], diff(i, 4), i);
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
    return mk("Geometry", `Each interior angle of a ${names[n]} is:`, `${fmt(val)}°`,
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
    return mk("Geometry", `How many lines of symmetry does a ${s.n} have?`,
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
    return mk("Geometry", `What is the order of rotational symmetry of a ${s.n}?`,
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
    return mk("Geometry", `How many ${labels[choose]} does a ${names[n]} prism have?`,
      `${ans}`, [`${ans + 1}`, `${ans - 1}`, `${ans + n}`],
      diff(i, 3), i);
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
    const total = r + b;
    const askRed = i % 2 === 0;
    const numerator = askRed ? r : b;
    return mk("Probability",
      `A bag has ${r} red and ${b} blue balls. What is the probability of picking ${askRed ? "red" : "blue"}?`,
      simp(numerator, total),
      [simp(askRed ? b : r, total), simp(numerator, numerator), simp(numerator + 1, total)],
      diff(i, 4), i);
  }

  function probDie(i) {
    const targets = [
      { q: "rolling a 4", a: "1/6", d: ["1/3", "1/2", "1/4"] },
      { q: "rolling a 2", a: "1/6", d: ["1/3", "1/2", "2/6"] },
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
    return mk("Probability", wording,
      `${fmt(ans)}`, [`${fmt(p)}`, `${fmt(ans + 0.1)}`, `${fmt(ans - 0.1)}`],
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
    const a = aPool[i % aPool.length];
    const b = bPool[(i * 3 + 1) % bPool.length];
    const ans = +(a * b).toFixed(3);
    return mk("Probability",
      `P(A) = ${fmt(a)}, P(B) = ${fmt(b)}. If independent, find P(A and B).`,
      `${fmt(ans)}`, [`${fmt(a + b)}`, `${fmt(ans + 0.05)}`, `${fmt(Math.max(a, b))}`],
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
    return mk("Logic",
      `A date in ${year} fell on a ${wrapDay(given)}. On which day will the same date fall in ${year + 1}?`,
      wrapDay(ansIdx),
      [wrapDay((ansIdx + 1) % 7), wrapDay((ansIdx + 6) % 7), wrapDay(given)],
      diff(i, 3), i);
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
    const cels = 2 + (i % 12);                            // 2nd .. 13th celebration
    const recent = 1992 + 4 * (i % 20);                    // wider window of leap years
    const ans = recent - 4 * (cels - 1);
    const suf = cels === 1 ? "st" : cels === 2 ? "nd" : cels === 3 ? "rd" : "th";
    return mk("Logic",
      `A person born on 29 February celebrated their Feb-29 birthday for the ${cels}${suf} time in ${recent}. In which year were they born?`,
      `${ans}`, [`${ans - 4}`, `${ans + 4}`, `${recent - cels}`],
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
      [`${base}`, `${extra}`, `${base - extra + extra}`],
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

  /* ═══════════════════ DRIVER ═══════════════════ */

  const generators = {
    Numbers: [numPlaceValue, numPlaceValueDiff, numRounding, numRoundingBounds, numIsPrime,
              numLCM, numHCF, numHCFofFour, numPowers, numFactorCount, numPrimeFactorCount,
              numArithmetic, numWordProblem, numBusLCM, numSmallestEvenFromDigits,
              numCubeMissing, numPrimeSumSquare, numFourConsecOdd],
    Decimals: [decAdd, decSubtract, decMultiply, decDivide, decCompare, decRound, decToFrac,
               decHalfway, decMultFactReuse, decPriceChange],
    Fractions: [fracAdd, fracSubtract, fracMultiply, fracDivide, fracSimplify,
                fracImproperToMixed, fracOfX, fracMixedMultiply],
    Percentages: [pctOf, pctFracToPct, pctDecToPct, pctSalePrice, pctIncrease,
                  pctSimpleInterest, pctReverse, pctChained],
    BIDMAS: [bidSimple, bidBrackets, bidPowers, bidMixed, bidNegative, bidTempChange],
    Algebra: [algSubLinear, algSubMulti, algSubQuadratic, algSolve1Step, algSolve2Step,
              algSolveBothSides, algSimplifyTerms, algCustomOp, algWeightPair, algTriangleAngles],
    Sequences: [seqArithNext, seqArithNth, seqArithNthFormula, seqFibLike, seqGeomNext, seqBallPattern],
    Ratio: [ratSimplify, ratSplit, ratWordTotal, ratDifference, ratRecipe,
            ratMapScale, ratInverseProp, ratChained],
    Speed: [spdFindSpeed, spdFindDistance, spdFindTime, spdMphHoursMin],
    Measurement: [meaUnitConvert, meaAreaPerim, meaVolumeCube, meaTempDiff,
                  meaInchConvert, meaMoneyChange],
    Geometry: [geoAngleSum, geoAngleType, geoShapeAngle, geoComplementary, geoTriangleArea,
               geoLinesSymmetry, geoRotSymmetry, geoPrismFEV, geoCuboidMissingEdge],
    Statistics: [statMean, statMedian, statMode, statRange, statMissingMean,
                 statFreqMidpoint, statPieAngle, statPictogram, statCorrelation],
    Probability: [probBagPick, probDie, probCoin, probComplement, probExpected, probIndependent],
    Logic: [logConsecutiveIntSum, logConsecutiveEvenSum, logConsecutiveOddPuzzle,
            logPalindromeYesNo, logNextPalindrome, logSquarePalindromesInRange,
            logDayOfWeek, logDayWeeksAgo, logDayShiftAcrossYear, logLeapYearPick, logLeapBirthday,
            logClockAngleAtHour, logClockMirror, logSumAndDiff, logArithmagonProduct,
            logAdditionPyramid, logLetterPuzzle, logMagicSquareRow, logDigitSumOfSum]
  };

  // Single scale knob — produces ~110 generators × N variations questions.
  const VARIATIONS_PER_TEMPLATE = 50;

  Object.entries(generators).forEach(([topic, gens]) => {
    gens.forEach((gen, gIdx) => {
      for (let v = 0; v < VARIATIONS_PER_TEMPLATE; v++) {
        try {
          const q = gen(v + gIdx * 13);
          if (q) QUESTIONS.push(q);
        } catch (e) { /* skip bad seed */ }
      }
    });
  });
})();
