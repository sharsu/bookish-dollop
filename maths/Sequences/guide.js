registerStudyGuide({
  topic: "Sequences",
  icon: "🔁",
  summary: "Sequences are number patterns that follow a rule.",
  intro: "A sequence grows or changes in a regular way, and the rule tells you what happens from one term to the next.",
  keyIdea: "Look for the pattern before rushing to the next number.",
  steps: [
    "Compare one term to the next to spot the change.",
    "Check if the same rule keeps happening each time.",
    "Use the rule to find missing terms or the next term."
  ],
  tips: [
    "An arithmetic sequence changes by the same amount each time.",
    "Write the difference above the numbers if it helps.",
    "Check whether the pattern is going up or down."
  ],
  tryIt: "In 4, 7, 10, 13 the rule is add 3 each time.",
  visualLabel: "A sequences card showing a repeating increase pattern.",
  visual: createStudyVisualCard({
    emoji: "🔁",
    title: "Find the rule",
    subtitle: "What changes each time?",
    chips: ["4", "+3", "7", "10"],
    accent: "#22c55e"
  })
});
