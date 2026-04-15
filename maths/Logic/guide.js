registerStudyGuide({
  topic: "Logic",
  icon: "🧩",
  summary: "Logic questions reward calm thinking and careful checking.",
  intro: "Logic is about using clues, spotting patterns and ruling out impossible answers one step at a time.",
  keyIdea: "Do not guess quickly. Test each clue carefully.",
  steps: [
    "Read every clue slowly.",
    "Write down what must be true and what cannot be true.",
    "Use elimination until only one answer works."
  ],
  tips: [
    "A neat table can help you organise the clues.",
    "If one answer breaks a clue, cross it out.",
    "Go back and check that your final answer fits every clue."
  ],
  tryIt: "If Sam is taller than Ali and Ali is taller than Ben, then Sam is taller than Ben.",
  visualLabel: "A logic card showing clue, rule out and check.",
  visual: createStudyVisualCard({
    emoji: "🧩",
    title: "Use the clues",
    subtitle: "Rule out what cannot work",
    chips: ["Read", "Rule out", "Check again", "One answer"],
    accent: "#f43f5e"
  })
});
