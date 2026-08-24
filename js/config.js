/* ═══════════════════════════════════════
   CONFIG — Default settings (editable)
═══════════════════════════════════════ */
const CONFIG = {
  defaultQuestions : 60,   // fallback for any test type missing from `papers`
  defaultTimeLimit : 60,   // minutes
  minQuestions     : 5,
  maxQuestions     : 100,
  minTime          : 1,    // minutes
  maxTime          : 180,  // minutes

  /* ── Paper length and timing, per test type ──────────────────────────
     Edit one row to change that test only; the others are untouched.
     A missing row, or a missing/invalid value inside one, falls back to
     defaultQuestions / defaultTimeLimit above. */
  papers: {
    /* 45 minutes across the board, as the QE papers run. */
    maths:   { questions: 60, timeLimit: 45 },   // minutes
    nvrt:    { questions: 60, timeLimit: 45 },
    english: { questions: 65, timeLimit: 45 }
  },

  /* Topic display names – must match QUESTIONS[i].topic exactly */
  topics: [
    "Numbers",
    "Decimals",
    "Fractions",
    "Percentages",
    "BIDMAS",
    "Algebra",
    "Sequences",
    "Ratio",
    "Speed",
    "Measurement",
    "Geometry",
    "Statistics",
    "Probability",
    "Counting Principle",
    "Logic"
  ],

  /* How many comprehension passages each English paper uses. Passages are
     picked one per category in rotation (Fiction, Non-Fiction, Classic), so
     2 gives two different categories and 3 gives all three. The comprehension
     questions are then shared evenly between them and each passage's questions
     are kept together and consecutive in the paper. */
  comprehensionPassagesPerPaper: 2,

  /* A comprehension text longer than this many printed lines is treated as a
     paper on its own: if one is drawn, it is the only passage that paper uses,
     whatever comprehensionPassagesPerPaper says. Raise it to allow two long
     texts together; set it very high to switch the behaviour off. */
  singlePassageLineLimit: 65,

  /* English section names – must match ENGLISH_QUESTIONS[i].topic exactly.
     Mirrors the Comprehension / Spelling / Punctuation / Word Choice shape of
     the GL-style papers in question-bank/, with Grammar, Vocabulary and
     Literary Devices split out so weak areas show up in the breakdown. */
  englishTopics: [
    "Comprehension",
    "Spelling",
    "Punctuation",
    "Grammar",
    "Vocabulary",
    "Word Choice",
    "Literary Devices"
  ],

  /* Difficulty labels shown to the child */
  difficultyLabel: {
    1: { label: "Easy",   css: "diff-easy"   },
    2: { label: "Medium", css: "diff-medium" },
    3: { label: "Hard",   css: "diff-hard"   },
    4: { label: "Super Hard", css: "diff-superhard" }
  },

  /* ── Which difficulties a paper may draw on ──────────────────────────
     1 = Easy, 2 = Medium, 3 = Hard, 4 = Super Hard.

     While preparing for the QE exam, papers are set to Hard and Super Hard
     only — Easy and Medium are both skipped. To change that, edit the lists
     below; no other file needs touching:

       • put a test type's own list in `allowedDifficulties` to override it
         for that test only, e.g.  english: [1, 2, 3, 4]
       • or change `default` to apply to every test type at once

     To put Medium back, set:
         default: [2, 3, 4]
     and to include Easy as well:
         default: [1, 2, 3, 4]
     Order does not matter, and an empty or invalid list falls back to all
     four levels so a typo can never leave a paper with nothing to draw on. */
  allowedDifficulties: {
    default: [3, 4]          // QE prep: Hard and Super Hard only
    // maths:   [3, 4],
    // nvrt:    [3, 4],
    // english: [3, 4]
  },

  /* ── How much of a paper sits at each level ──────────────────────────
     Shares per difficulty. They do not have to add up to 1: whatever is
     listed is rescaled across the levels `allowedDifficulties` permits, so
     { 3: 0.4, 4: 0.6 } means 40% Hard and 60% Super Hard, which on a
     60-question maths paper is 24 and 36.

     A level that is allowed but not listed here gets NO questions - the mix
     is a statement about what the paper should contain, not a hint. Remove
     the block entirely (or set it to null) to go back to the old behaviour:
     an even split across the allowed levels, tilted by the child's recent
     average.

     Setting this turns OFF that score-based tilt for the band split. The
     tilt eases a struggling child down the levels, so if papers start
     feeling punishing this is the first thing to relax - try
     { 3: 0.5, 4: 0.5 }, or delete it. Topic choice stays adaptive either
     way: the weakest topics still get the most questions. */
  difficultyMix: {
    3: 0.4,                  // Hard
    4: 0.6                   // Super Hard
  },

  /* Grade boundaries (%) */
  grades: [
    { min: 90, label: "Outstanding! 🌟", trophy: "🏆" },
    { min: 75, label: "Excellent! 🎉",   trophy: "🥇" },
    { min: 60, label: "Great Work! 👏",  trophy: "🥈" },
    { min: 45, label: "Good Try! 💪",    trophy: "🥉" },
    { min:  0, label: "Keep Practising! 📚", trophy: "📖" }
  ]
};
