/* ═══════════════════════════════════════
   CONFIG — Default settings (editable)
═══════════════════════════════════════ */
const CONFIG = {
  defaultQuestions : 60,   // how many questions per exam
  defaultTimeLimit : 60,   // minutes
  minQuestions     : 5,
  maxQuestions     : 100,
  minTime          : 1,    // minutes
  maxTime          : 180,  // minutes

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
    "Logic"
  ],

  /* Difficulty labels shown to the child */
  difficultyLabel: {
    1: { label: "Easy",   css: "diff-easy"   },
    2: { label: "Medium", css: "diff-medium" },
    3: { label: "Hard",   css: "diff-hard"   }
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
