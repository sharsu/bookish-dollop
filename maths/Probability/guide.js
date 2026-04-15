registerStudyGuide({
  topic: "Probability",
  icon: "🎲",
  summary: "Probability measures how likely something is to happen.",
  intro: "Probability goes from impossible to certain and helps you talk about chance in a clear way.",
  keyIdea: "Count the favourable outcomes and compare them with all the possible outcomes.",
  steps: [
    "Work out how many outcomes are possible.",
    "Count how many of those outcomes you want.",
    "Write the probability in the form the question asks for."
  ],
  tips: [
    "Probability can be written as a fraction, decimal or percentage.",
    "A fair event gives equal chance to each outcome.",
    "Probability is always between 0 and 1."
  ],
  tryIt: "If a fair coin is flipped, the probability of heads is 1/2.",
  visualLabel: "A probability card showing chance from impossible to certain.",
  visual: createStudyVisualCard({
    emoji: "🎲",
    title: "How likely?",
    subtitle: "Chance lives between 0 and 1",
    chips: ["Impossible = 0", "Even chance = 1/2", "Certain = 1", "Fair events"],
    accent: "#7c3aed"
  })
});
