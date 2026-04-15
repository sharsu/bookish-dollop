registerStudyGuide({
  topic: "Algebra",
  icon: "✏️",
  summary: "Algebra uses letters to stand for numbers we do not know yet.",
  intro: "Algebra is like a puzzle. The letter is a box holding a value, and your job is to work out what belongs there.",
  keyIdea: "Treat the letter as one value all the way through the question.",
  steps: [
    "Read the rule carefully and spot what the letter stands for.",
    "Substitute the value neatly if one is given.",
    "Keep both sides balanced when solving simple equations."
  ],
  tips: [
    "2a means 2 × a, not 2 and a separately.",
    "Check your answer by putting it back into the equation.",
    "Work one small step at a time."
  ],
  tryIt: "If a = 4, then 3a + 2 means 3 × 4 + 2 = 14.",
  visualLabel: "An algebra card showing substitution and balance.",
  visual: createStudyVisualCard({
    emoji: "✏️",
    title: "Letters stand for numbers",
    subtitle: "Substitute, simplify, then check",
    chips: ["a = 4", "3a = 12", "Balance both sides", "Check"],
    accent: "#ec4899"
  })
});
