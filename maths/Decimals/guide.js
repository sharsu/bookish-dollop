registerStudyGuide({
  topic: "Decimals",
  icon: "🔟",
  summary: "Decimals help you work with tenths, hundredths and small parts of a whole in a clear way.",
  intro: "This topic is easier when you keep each digit in the correct place and work neatly.",
  keyIdea: "Decimal points are like anchors that keep every place in line.",
  visualLabel: "A decimal place value card showing ones, tenths, hundredths and thousandths.",
  visual: createStudyVisualCard({
    emoji: "🔟",
    title: "Decimal places",
    subtitle: "Keep each place in the right column",
    chips: ["Ones", "Tenths", "Hundredths", "Thousandths"],
    accent: "#0ea5e9"
  }),
  concepts: [
    {
      title: "Decimal Place Value",
      summary: "Every place to the right of the decimal point is a smaller part of the whole.",
      explanation: [
        "Decimals show parts of a whole using place value. The first place after the decimal point is tenths, then hundredths, then thousandths.",
        "Reading decimals correctly helps with comparing, rounding and calculating. A common mistake is reading the digits without thinking about the place names."
      ],
      steps: [
        "Find the decimal point first.",
        "Name each place from left to right.",
        "Read the digit and its place together.",
        "Check whether the number is more or less than 1."
      ],
      tips: [
        "0.4 means 4 tenths, not 4 wholes.",
        "0.04 means 4 hundredths.",
        "A zero can hold a place without changing the value."
      ],
      examples: [
        { title: "Place value", text: "In 5.27 the 2 is worth 2 tenths and the 7 is worth 7 hundredths." },
        { title: "Small value", text: "0.306 means 3 tenths, 0 hundredths and 6 thousandths." }
      ],
      visualLabel: "A decimal place value visual with ones, tenths and hundredths.",
      visual: createStudyVisualCard({ emoji: "🔢", title: "Decimal places", subtitle: "Each step right is smaller", chips: ["Ones", "Tenths", "Hundredths", "Thousandths"], accent: "#0ea5e9" })
    },
    {
      title: "Comparing & Ordering Decimals",
      summary: "Compare decimals by lining up the places, not by counting digits.",
      explanation: [
        "When decimals are lined up, each place is easy to compare. You start with the ones, then tenths, then hundredths and so on.",
        "Zeros can be added at the end if that helps you see the places. This does not change the value."
      ],
      steps: [
        "Write the decimals in a column.",
        "Line up the decimal points.",
        "Add placeholder zeros if needed.",
        "Compare from left to right."
      ],
      tips: [
        "0.7 = 0.70.",
        "1.05 is smaller than 1.5 because 1.05 = 1.50? No, 1.05 = 1.05 and 1.50 is larger.",
        "Do not compare only the final digits."
      ],
      examples: [
        { title: "Ordering", text: "In ascending order: 0.48, 0.5, 0.53." },
        { title: "Comparing", text: "2.16 > 2.09 because the tenths digits are the same, then 1 hundredth is bigger than 0 hundredths? Better: 16 hundredths is bigger than 9 hundredths." }
      ],
      visualLabel: "A decimal comparison card showing decimal points lined up.",
      visual: createStudyVisualCard({ emoji: "↕️", title: "Compare decimals", subtitle: "Line up the points", chips: ["0.5", "0.50", "0.53", "0.48"], accent: "#0284c7" })
    },
    {
      title: "Adding & Subtracting Decimals",
      summary: "Keep the decimal points in one straight line so the places match.",
      explanation: [
        "Adding and subtracting decimals works just like whole numbers once the places are lined up correctly. Tenths must sit under tenths and hundredths under hundredths.",
        "Neat columns help you avoid sliding a digit into the wrong place, which is one of the most common mistakes."
      ],
      steps: [
        "Write the decimals in a column.",
        "Line up the decimal points.",
        "Add placeholder zeros if needed.",
        "Calculate from right to left and bring the decimal point straight down."
      ],
      tips: [
        "3.4 can be written as 3.40.",
        "Estimate with whole numbers before calculating.",
        "Check if your answer should be bigger or smaller than the starting number."
      ],
      examples: [
        { title: "Addition", text: "2.35 + 1.4 becomes 2.35 + 1.40 = 3.75." },
        { title: "Subtraction", text: "6.2 - 0.85 becomes 6.20 - 0.85 = 5.35." }
      ],
      visualLabel: "A decimal calculation card showing columns lined up by decimal point.",
      visual: createStudyVisualCard({ emoji: "➕", title: "Line them up", subtitle: "Decimal points must match", chips: ["2.35", "+1.40", "= 3.75", "Check"], accent: "#14b8a6" })
    },
    {
      title: "Multiplying & Dividing Decimals",
      summary: "Understand when the number should grow and when it should shrink.",
      explanation: [
        "Multiplying or dividing by 10, 100 or 1000 changes the place value of every digit. The decimal point stays still while the digits move.",
        "In other decimal calculations, estimating first helps you notice if your answer is wildly too big or too small."
      ],
      steps: [
        "Decide whether the digits move left or right.",
        "Count the places carefully.",
        "Use zeros as place holders if needed.",
        "Estimate to check that the final answer feels sensible."
      ],
      tips: [
        "÷10 makes the number ten times smaller.",
        "×100 moves digits two places left in value, so the number gets larger.",
        "Think about the size, not only the rule."
      ],
      examples: [
        { title: "Multiply", text: "3.48 × 10 = 34.8." },
        { title: "Divide", text: "6.2 ÷ 100 = 0.062." }
      ],
      visualLabel: "A decimal movement card showing places shifting for multiplying and dividing by powers of ten.",
      visual: createStudyVisualCard({ emoji: "↔️", title: "Move by place value", subtitle: "Digits shift when ×10 or ÷10", chips: ["×10", "÷10", "×100", "÷100"], accent: "#f59e0b" })
    }
  ]
});
