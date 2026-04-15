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
        "Percent means 'per hundred', so p% always means p/100. This makes percentages a standard way to compare amounts because every question is using the same whole: 100 equal parts.",
        "Once you know this rule, you can swap between percentage language and fraction language. For example, 35% means 35/100, which simplifies to 7/20."
      ],
      steps: [
        "Read the number before the % sign.",
        "Rewrite it as a fraction over 100.",
        "Simplify or convert if the question needs a fraction or decimal.",
        "Check whether the answer should be less than, equal to or greater than the whole."
      ],
      tips: [
        "50% means half.",
        "100% means the whole amount.",
        "A percentage above 100% means more than one whole."
      ],
      examples: [
        { title: "Simple meaning", text: "35% means 35/100. This simplifies by dividing top and bottom by 5 to give 7/20." },
        { title: "Whole amount", text: "100% of 24 is 24 because 100% means one whole amount, and 24 × 100/100 = 24." }
      ],
      visualLabel: "A full-width percent visual showing a 100-grid with 35 shaded and the matching fraction form.",
      visual: createPercentMeaningVisual({ accent: "#14b8a6" })
    },
    {
      title: "Fractions, Decimals & Percentages",
      summary: "These three forms are different ways to show the same amount.",
      explanation: [
        "Fractions, decimals and percentages are equivalent forms of the same value. The key rules are: percentage to decimal means divide by 100, decimal to percentage means multiply by 100, and percentage to fraction means write over 100 and simplify.",
        "These conversions are useful because some methods are easier in one form than another. For example, 75% is often easiest as 3/4 when finding parts of an amount."
      ],
      steps: [
        "For a percentage to a fraction, write it over 100 and simplify.",
        "For a percentage to a decimal, divide by 100.",
        "For a decimal to a percentage, multiply by 100.",
        "Check the three versions describe the same amount."
      ],
      tips: [
        "25% = 1/4 = 0.25.",
        "75% = 3/4 = 0.75.",
        "10% = 0.1 and 1% = 0.01."
      ],
      examples: [
        { title: "Convert 40%", text: "40% = 40/100 = 2/5, and as a decimal it is 0.40 = 0.4." },
        { title: "Convert 0.6", text: "0.6 = 60% because 0.6 × 100 = 60, and it is also 6/10 = 3/5 as a fraction." }
      ],
      visualLabel: "A full-width conversion visual linking fraction, decimal and percentage forms of the same value.",
      visual: createPercentFormsVisual({ accent: "#0ea5e9" })
    },
    {
      title: "Finding Percentages of Amounts",
      summary: "Use easy percentages as stepping stones to harder ones.",
      explanation: [
        "The main formula is p% of an amount = (p/100) × amount. In mental maths, you can often find 10%, 5%, 1%, 50% or 25% first and then combine them.",
        "A second powerful method is the multiplier method: p% of amount = amount × decimal form of the percentage. For example, 30% of 60 = 60 × 0.3."
      ],
      steps: [
        "Choose whether the fraction method, the easy-percentage method or the decimal multiplier method looks quickest.",
        "If using the easy-percentage method, find 10%, 1%, 50% or 25% first.",
        "Combine those smaller percentages to make the target percentage.",
        "Check whether the answer should be smaller than, equal to or bigger than the original amount."
      ],
      tips: [
        "10% means divide by 10.",
        "5% is half of 10%.",
        "30% can be 10% + 10% + 10%."
      ],
      examples: [
        { title: "Easy percentages", text: "To find 30% of 60, first find 10%: 60 ÷ 10 = 6. Then 30% = 3 lots of 10%, so 6 × 3 = 18." },
        { title: "Multiplier method", text: "25% of 80 can be done as 80 × 0.25 = 20. It also works because 25% = 1/4, and a quarter of 80 is 20." }
      ],
      visualLabel: "A full-width strategy visual showing 30% built from three lots of 10%.",
      visual: createPercentAmountVisual({ accent: "#f59e0b" })
    },
    {
      title: "Percentage Change",
      summary: "Percentage change tells you how much something has gone up or down compared with the start.",
      explanation: [
        "The percentage change formula is change/original × 100%. For an increase, change = new amount - original amount. For a decrease, change = original amount - new amount.",
        "For repeated growth or decay, use a multiplier. Increase by r% uses multiplier 1 + r/100, decrease by r% uses 1 - r/100, and repeated change uses new amount = original × multiplier^number of steps. This is the compound growth idea used in interest and population questions."
      ],
      steps: [
        "Decide whether the question wants the amount of change, the percentage change, or the new total after change.",
        "For percentage change, find the change and divide by the original amount.",
        "For one-step increase or decrease, use the correct multiplier once.",
        "For repeated growth, apply the same multiplier again and again or use powers."
      ],
      tips: [
        "A 20% discount makes the price smaller.",
        "A 15% increase makes the amount larger.",
        "Do not confuse the change with the final total."
      ],
      examples: [
        { title: "Percentage change", text: "A price rises from £40 to £50. The change is £10, so percentage change = 10/40 × 100% = 25% increase." },
        { title: "Compound growth", text: "£200 grows by 10% each year for 2 years. Use multiplier 1.10 twice: 200 × 1.1 × 1.1 = 200 × 1.21 = £242." }
      ],
      visualLabel: "A full-width percentage-change visual showing original amount, new amount, change and the percentage-change calculation.",
      visual: createPercentChangeVisual({ accent: "#22c55e" })
    }
  ]
});
