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
        "Probability measures chance. A probability of 0 means impossible, 1 means certain, and numbers in between show different levels of likelihood.",
        "This scale helps you think sensibly before doing any calculations."
      ],
      steps: [
        "Think about what the event means.",
        "Decide if it is impossible, unlikely, even chance, likely or certain.",
        "Place it on the 0 to 1 scale.",
        "Check whether your answer sounds reasonable."
      ],
      tips: [
        "Probability is always between 0 and 1.",
        "1/2 means even chance.",
        "A very likely event is close to 1 but not always equal to 1."
      ],
      examples: [
        { title: "Certain", text: "The probability of getting a number less than 7 on a fair six-sided die is 1." },
        { title: "Impossible", text: "The probability of rolling an 8 on a fair six-sided die is 0." }
      ],
      visualLabel: "A probability scale card from impossible to certain.",
      visual: createStudyVisualCard({ emoji: "🎯", title: "Chance scale", subtitle: "From 0 to 1", chips: ["0", "Unlikely", "1/2", "1"], accent: "#7c3aed" })
    },
    {
      title: "Equally Likely Outcomes",
      summary: "When outcomes are fair, probability is favourable outcomes over total outcomes.",
      explanation: [
        "If each outcome has the same chance, like a fair coin or fair die, you can use simple counting to find the probability.",
        "The top of the fraction counts the outcomes you want, and the bottom counts all the possible outcomes."
      ],
      steps: [
        "List or imagine all possible outcomes.",
        "Count the favourable ones.",
        "Write favourable over total.",
        "Simplify if needed."
      ],
      tips: [
        "A fair coin has 2 equally likely outcomes.",
        "A fair die has 6 equally likely outcomes.",
        "Simplify the fraction if possible."
      ],
      examples: [
        { title: "Coin", text: "The probability of heads from a fair coin is 1/2." },
        { title: "Die", text: "The probability of rolling an even number is 3/6, which simplifies to 1/2." }
      ],
      visualLabel: "A fair-outcomes card showing wanted outcomes over total outcomes.",
      visual: createStudyVisualCard({ emoji: "🎲", title: "Count the outcomes", subtitle: "Wanted over total", chips: ["Favourable", "Total", "Simplify", "Fair"], accent: "#0ea5e9" })
    },
    {
      title: "Probability in Different Forms",
      summary: "Probability can be written as a fraction, decimal or percentage.",
      explanation: [
        "The same probability can be shown in different ways. This is useful because some questions prefer fractions, while others use decimals or percentages.",
        "Changing form does not change the chance itself, only the way you write it."
      ],
      steps: [
        "Start with the probability fraction.",
        "Turn it into a decimal by dividing.",
        "Turn it into a percentage by multiplying by 100.",
        "Check all forms match the same chance."
      ],
      tips: [
        "1/2 = 0.5 = 50%.",
        "1/4 = 0.25 = 25%.",
        "A probability above 1 is impossible."
      ],
      examples: [
        { title: "Quarter chance", text: "1/4 is the same as 0.25 or 25%." },
        { title: "Three in ten", text: "3/10 = 0.3 = 30%." }
      ],
      visualLabel: "A conversion card showing probability in three forms.",
      visual: createStudyVisualCard({ emoji: "🔄", title: "Same chance, new form", subtitle: "Fraction, decimal, percentage", chips: ["1/2", "0.5", "50%", "Equivalent"], accent: "#f59e0b" })
    },
    {
      title: "Combined Outcomes & Simple Tables",
      summary: "Some probability questions need you to organise outcomes carefully.",
      explanation: [
        "When two things happen, like flipping two coins or spinning and rolling, it can help to list the outcomes in a table or neat list.",
        "Organisation is the key. If you miss one outcome, the whole probability can go wrong."
      ],
      steps: [
        "Write all first-step outcomes.",
        "Pair each one with all second-step outcomes.",
        "Count the total number of combinations.",
        "Count how many combinations match the event you want."
      ],
      tips: [
        "A table can stop you missing outcomes.",
        "Order sometimes matters, so read the question carefully.",
        "Check that your list is complete."
      ],
      examples: [
        { title: "Two coins", text: "The outcomes are HH, HT, TH and TT, so the probability of exactly one head is 2/4 = 1/2." },
        { title: "Spinner and die", text: "List every pair so you do not forget any combination." }
      ],
      visualLabel: "A probability table card showing all outcome pairs listed neatly.",
      visual: createStudyVisualCard({ emoji: "🗂️", title: "Organise the outcomes", subtitle: "Tables help you count safely", chips: ["List all", "No gaps", "Count total", "Count wanted"], accent: "#22c55e" })
    }
  ]
});
