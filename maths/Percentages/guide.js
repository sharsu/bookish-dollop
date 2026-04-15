registerStudyGuide({
  topic: "Percentages",
  icon: "💯",
  summary: "Percentages help you compare amounts fairly because they all use the same whole of 100.",
  intro: "This topic becomes much easier when you connect percentages to fractions and decimals you already know.",
  keyIdea: "Percent means 'out of 100'.",
  visualLabel: "A percentages card showing common percentage facts and links to fractions.",
  visual: createStudyVisualCard({
    emoji: "💯",
    title: "Out of 100",
    subtitle: "Use easy percentages to build harder ones",
    chips: ["50% = 1/2", "25% = 1/4", "10% = ÷10", "1% = ÷100"],
    accent: "#14b8a6"
  }),
  concepts: [
    {
      title: "What Percent Means",
      summary: "A percentage is a special way of writing a part out of 100.",
      explanation: [
        "Percentages let us compare different amounts using the same whole. If something is 35%, it means 35 out of every 100 parts.",
        "This is why percentages are helpful in test scores, discounts and data questions."
      ],
      steps: [
        "Read the number before the percent sign.",
        "Think 'out of 100'.",
        "Link it to a familiar fraction or decimal if possible.",
        "Check whether the percentage is less than, equal to or more than the whole."
      ],
      tips: [
        "50% means half.",
        "100% means the whole amount.",
        "A percentage above 100% means more than one whole."
      ],
      examples: [
        { title: "Simple meaning", text: "35% means 35 out of 100." },
        { title: "Whole amount", text: "100% of 24 is 24 because that is the whole amount." }
      ],
      visualLabel: "A percent card explaining that percent means out of 100.",
      visual: createStudyVisualCard({ emoji: "💯", title: "Percent", subtitle: "Always think out of 100", chips: ["25%", "50%", "75%", "100%"], accent: "#14b8a6" })
    },
    {
      title: "Fractions, Decimals & Percentages",
      summary: "These three forms are different ways to show the same amount.",
      explanation: [
        "Many percentage questions become easier when you switch to a fraction or a decimal you know well. For example, 50% = 1/2 = 0.5.",
        "Learning the common links helps you move between forms quickly and confidently."
      ],
      steps: [
        "Write the percentage over 100 as a fraction.",
        "Simplify the fraction if you can.",
        "To make a decimal, divide by 100.",
        "Check all three forms have the same value."
      ],
      tips: [
        "25% = 1/4 = 0.25.",
        "75% = 3/4 = 0.75.",
        "10% = 0.1 and 1% = 0.01."
      ],
      examples: [
        { title: "Convert 40%", text: "40% = 40/100 = 2/5 = 0.4." },
        { title: "Convert 0.6", text: "0.6 = 60% because 0.6 × 100 = 60." }
      ],
      visualLabel: "A card linking fractions, decimals and percentages.",
      visual: createStudyVisualCard({ emoji: "🔄", title: "Same value, new form", subtitle: "Move between F, D and %", chips: ["1/2", "0.5", "50%", "Equivalent"], accent: "#0ea5e9" })
    },
    {
      title: "Finding Percentages of Amounts",
      summary: "Use easy percentages as stepping stones to harder ones.",
      explanation: [
        "A strong way to find percentages is to start with 10%, 1%, 50% or 25%, then build the answer from there.",
        "This method is great for mental maths and helps you understand what the percentage really means."
      ],
      steps: [
        "Choose the easiest percentage to find first.",
        "Find 10%, 1%, 50% or 25% if possible.",
        "Add or combine those parts to make the target percentage.",
        "Check if the answer should be smaller or larger than the original amount."
      ],
      tips: [
        "10% means divide by 10.",
        "5% is half of 10%.",
        "30% can be 10% + 10% + 10%."
      ],
      examples: [
        { title: "30% of 60", text: "10% of 60 is 6, so 30% is 18." },
        { title: "25% of 80", text: "25% means a quarter, so 25% of 80 is 20." }
      ],
      visualLabel: "A percentage strategy card showing easy percentages built into harder ones.",
      visual: createStudyVisualCard({ emoji: "🧩", title: "Build the answer", subtitle: "Find easy percentages first", chips: ["10%", "5%", "1%", "25%"], accent: "#f59e0b" })
    },
    {
      title: "Percentage Change",
      summary: "Percentage change tells you how much something has gone up or down compared with the start.",
      explanation: [
        "Questions about sales, discounts and growth often use percentage change. You must know whether the question wants the change itself or the new amount after the change.",
        "Reading the question carefully matters because increase and decrease lead to different final answers."
      ],
      steps: [
        "Find the percentage change amount first.",
        "Decide whether to add it on or subtract it off.",
        "Keep track of the original amount and the new amount.",
        "Check if the final answer is sensible."
      ],
      tips: [
        "A 20% discount makes the price smaller.",
        "A 15% increase makes the amount larger.",
        "Do not confuse the change with the final total."
      ],
      examples: [
        { title: "Discount", text: "20% off £50 means 10 pounds off, so the new price is £40." },
        { title: "Increase", text: "A 10% increase on 30 adds 3, so the new amount is 33." }
      ],
      visualLabel: "A percentage change card showing increase and decrease.",
      visual: createStudyVisualCard({ emoji: "📈", title: "Percentage change", subtitle: "Know if it goes up or down", chips: ["Increase", "Decrease", "Change", "New amount"], accent: "#22c55e" })
    }
  ]
});
