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
    /* 45 minutes each, matching the QE Boys papers, which run 45 for English
       and 45 for Maths. Maths and NVRT were 40, so those go slightly up. */
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

  /* Grade boundaries (%) */
  grades: [
    { min: 90, label: "Outstanding! 🌟", trophy: "🏆" },
    { min: 75, label: "Excellent! 🎉",   trophy: "🥇" },
    { min: 60, label: "Great Work! 👏",  trophy: "🥈" },
    { min: 45, label: "Good Try! 💪",    trophy: "🥉" },
    { min:  0, label: "Keep Practising! 📚", trophy: "📖" }
  ]
};
