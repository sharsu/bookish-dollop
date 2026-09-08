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
    /* The QE papers run 45 minutes. Maths is set shorter on purpose: it now
       includes Medium questions, which are quicker, and the tighter clock is
       what makes the paper feel like the real thing. 60 questions in 35
       minutes is 35 seconds each. */
    maths:   { questions: 60, timeLimit: 35 },   // minutes
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

     Maths already uses Medium; to give NVRT and English it too, set:
         default: [2, 3, 4]
     and to include Easy as well:
         default: [1, 2, 3, 4]
     Whatever a test is allowed, `difficultyMix` below decides how much of
     its paper sits at each level.
     Order does not matter, and an empty or invalid list falls back to all
     four levels so a typo can never leave a paper with nothing to draw on. */
  allowedDifficulties: {
    default: [3, 4],         // NVRT and English: Hard and Super Hard only
    maths:   [2, 3, 4]       // maths also uses Medium, in the mix below
    // nvrt:    [3, 4],
    // english: [3, 4]
  },

  /* ── How much of a paper sits at each level ──────────────────────────
     Shares per difficulty, written the same way as `allowedDifficulties`
     above: a `default` for every test type, plus overrides by name.

     The shares do not have to add up to 1 - whatever is listed is rescaled
     across the levels `allowedDifficulties` permits for that test. On a
     60-question maths paper, { 2: 0.10, 3: 0.50, 4: 0.40 } is 6 Medium,
     30 Hard and 24 Super Hard - so 90% of the paper is Hard or above.

     A level that is allowed but not listed gets NO questions: the mix is a
     statement about what the paper should contain, not a hint. Remove the
     block entirely (or set it to null) to go back to an even split across
     the allowed levels, tilted by the child's recent average.

     Setting this turns OFF that score-based tilt for the band split. The
     tilt eases a struggling child down the levels, so if papers start
     feeling punishing this is the first thing to relax. Topic choice stays
     adaptive either way: the weakest topics still get the most questions. */
  difficultyMix: {
    default: {
      3: 0.4,                // Hard
      4: 0.6                 // Super Hard
    },
    maths: {
      2: 0.10,               // Medium
      3: 0.50,               // Hard
      4: 0.40                // Super Hard
    }
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
