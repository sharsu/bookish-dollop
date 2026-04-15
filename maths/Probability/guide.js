registerStudyGuide({
  topic: "Probability",
  icon: "🎲",
  summary: "Probability helps you describe how likely events are and count possible outcomes clearly.",
  intro: "This topic works best when you count carefully and keep favourable outcomes separate from all outcomes.",
  keyIdea: "Probability compares what you want with everything that could happen.",
  visualLabel: "A probability card showing chance from impossible to certain.",
  visual: createStudyVisualCard({
    emoji: "🎲",
    title: "How likely?",
    subtitle: "Chance lives between 0 and 1",
    chips: ["Impossible = 0", "Even chance = 1/2", "Certain = 1", "Fair events"],
    accent: "#7c3aed"
  }),
  concepts: [
    {
      title: "Probability Scale",
      summary: "Probability runs from impossible to certain.",
      explanation: [
        "Probability measures chance on a scale from 0 to 1. A probability of 0 means impossible, a probability of 1 means certain, and values between them describe how likely an event is.",
        "This scale is a checking tool. If a calculated answer is negative or bigger than 1, something has gone wrong."
      ],
      steps: [
        "Read the event and imagine what outcomes are possible.",
        "Decide whether it is impossible, unlikely, even chance, likely or certain.",
        "Place it between 0 and 1 on the probability scale.",
        "Use the scale to judge whether a later calculation is sensible."
      ],
      tips: [
        "Probability is always between 0 and 1.",
        "1/2 means even chance.",
        "A very likely event is close to 1 but not always equal to 1."
      ],
      examples: [
        { title: "Certain", text: "On a fair six-sided die, the probability of rolling a number less than 7 is 1 because every possible outcome works." },
        { title: "Impossible", text: "On a fair six-sided die, the probability of rolling an 8 is 0 because 8 is not one of the possible outcomes." }
      ],
      visualLabel: "A full-width chance scale showing impossible, even chance and certain from 0 to 1.",
      visual: createProbabilityScaleVisual({ accent: "#7c3aed" })
    },
    {
      title: "Equally Likely Outcomes",
      summary: "When outcomes are fair, probability is favourable outcomes over total outcomes.",
      explanation: [
        "For fair events, use the formula P(event) = number of favourable outcomes ÷ total number of equally likely outcomes. The word equally likely is important because the method only works fairly when every outcome has the same chance.",
        "After counting, simplify the fraction if possible. You can also check whether the answer feels sensible by comparing it with 0, 1/2 and 1 on the probability scale."
      ],
      steps: [
        "List or imagine all equally likely outcomes.",
        "Count how many outcomes match the event you want.",
        "Write favourable over total as a fraction.",
        "Simplify and, if needed, convert to a decimal or percentage."
      ],
      tips: [
        "A fair coin has 2 equally likely outcomes.",
        "A fair die has 6 equally likely outcomes.",
        "Simplify the fraction if possible."
      ],
      examples: [
        { title: "Coin", text: "A fair coin has outcomes H and T. One of the two outcomes is heads, so P(heads) = 1/2." },
        { title: "Die", text: "A fair die has 6 outcomes. Even numbers are 2, 4 and 6, so P(even) = 3/6 = 1/2." }
      ],
      visualLabel: "A full-width probability visual showing favourable die outcomes highlighted and counted over the total outcomes.",
      visual: createProbabilityOutcomesVisual({ accent: "#0ea5e9" })
    },
    {
      title: "Probability in Different Forms",
      summary: "Probability can be written as a fraction, decimal or percentage.",
      explanation: [
        "A probability fraction can be converted into a decimal by dividing and into a percentage by multiplying by 100. The chance itself stays the same, only the form changes.",
        "This matters because some questions mix formats, for example showing test success as 0.8, 80% or 4/5."
      ],
      steps: [
        "Start with the fraction form if possible.",
        "Divide numerator by denominator to get the decimal.",
        "Multiply the decimal by 100 to get the percentage.",
        "Check all forms represent the same chance on the 0 to 1 scale."
      ],
      tips: [
        "1/2 = 0.5 = 50%.",
        "1/4 = 0.25 = 25%.",
        "A probability above 1 is impossible."
      ],
      examples: [
        { title: "Quarter chance", text: "1/4 = 0.25 because 1 ÷ 4 = 0.25, and 0.25 = 25% after multiplying by 100." },
        { title: "Three in ten", text: "3/10 = 0.3 = 30%, so all three forms describe the same probability." }
      ],
      visualLabel: "A full-width probability-conversion visual linking fraction, decimal and percentage forms of the same chance.",
      visual: createProbabilityFormsVisual({ accent: "#f59e0b" })
    },
    {
      title: "Combined Outcomes & Simple Tables",
      summary: "Some probability questions need you to organise outcomes carefully.",
      explanation: [
        "When two stages happen, list every possible pair of outcomes using a table or systematic list. This avoids missing combinations.",
        "If the events are independent, another useful rule is multiply probabilities: P(A and B) = P(A) × P(B). This works because one event does not change the chance of the other."
      ],
      steps: [
        "List all outcomes for the first stage.",
        "Pair each one with every possible outcome for the second stage.",
        "Count the total combinations and the favourable combinations.",
        "If suitable, use the multiplication rule for independent events to check the answer."
      ],
      tips: [
        "A table can stop you missing outcomes.",
        "Order sometimes matters, so read the question carefully.",
        "Check that your list is complete."
      ],
      examples: [
        { title: "Two coins", text: "The outcomes are HH, HT, TH and TT. Exactly one head happens in HT and TH, so P(exactly one head) = 2/4 = 1/2." },
        { title: "Independent events", text: "Probability of rolling a 6 and then flipping heads = 1/6 × 1/2 = 1/12 because the events are independent." }
      ],
      visualLabel: "A full-width outcome-table visual showing all two-coin outcomes and the highlighted favourable results.",
      visual: createProbabilityTableVisual({ accent: "#22c55e" })
    }
  ]
});
