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
        "Decimals are based on powers of 10. The first place after the decimal point is tenths, which means parts out of 10; then hundredths, which means parts out of 100; then thousandths, which means parts out of 1000.",
        "This means 0.4 = 4/10, 0.04 = 4/100 and 0.004 = 4/1000. Reading the place name correctly is the key tool for comparing, rounding and converting decimals."
      ],
      steps: [
        "Find the decimal point first and mark the ones place.",
        "Name the places to the right: tenths, hundredths, thousandths.",
        "Read each digit with its place value, not as a whole number stuck together.",
        "Link the decimal to a fraction if that makes the value clearer."
      ],
      tips: [
        "0.4 means 4 tenths, not 4 wholes.",
        "0.04 means 4 hundredths.",
        "A zero can hold a place without changing the value."
      ],
      examples: [
        { title: "Place value", text: "In 5.27 the 2 is in the tenths place, so it is worth 0.2, and the 7 is in the hundredths place, so it is worth 0.07." },
        { title: "Fraction link", text: "0.306 means 306/1000, so it is 3 tenths, 0 hundredths and 6 thousandths." }
      ],
      visualLabel: "A decimal place value visual with ones, tenths and hundredths.",
      visual: createStudyVisualCard({ emoji: "🔢", title: "Decimal places", subtitle: "Each step right is smaller", chips: ["Ones", "Tenths", "Hundredths", "Thousandths"], accent: "#0ea5e9" })
    },
    {
      title: "Comparing & Ordering Decimals",
      summary: "Compare decimals by lining up the places, not by counting digits.",
      explanation: [
        "To compare decimals, line up the decimal points and compare place by place: ones first, then tenths, then hundredths, then thousandths. The first place that differs decides which number is larger.",
        "Zeros may be added at the end without changing the value, so 0.7 = 0.70. This makes ordering easier because every number can be written to the same number of decimal places."
      ],
      steps: [
        "Write the decimals in a column with decimal points under each other.",
        "Add zeros at the end so the decimal lengths match.",
        "Compare the ones column, then tenths, then hundredths.",
        "Once one number is bigger at a place, you can stop and order them."
      ],
      tips: [
        "0.7 = 0.70.",
        "1.05 is smaller than 1.5 because 1.05 = 1.50? No, 1.05 = 1.05 and 1.50 is larger.",
        "Do not compare only the final digits."
      ],
      examples: [
        { title: "Ordering", text: "Write 0.48, 0.50 and 0.53. Then ascending order is 0.48, 0.50, 0.53." },
        { title: "Comparing", text: "2.16 > 2.09 because the ones digits are both 2, but in the tenths place 1 is greater than 0, so 2.16 is larger." }
      ],
      visualLabel: "A decimal comparison card showing decimal points lined up.",
      visual: createStudyVisualCard({ emoji: "↕️", title: "Compare decimals", subtitle: "Line up the points", chips: ["0.5", "0.50", "0.53", "0.48"], accent: "#0284c7" })
    },
    {
      title: "Adding & Subtracting Decimals",
      summary: "Keep the decimal points in one straight line so the places match.",
      explanation: [
        "Adding and subtracting decimals uses the same column method as whole numbers, but the place values must match. Tenths go under tenths, hundredths under hundredths, and the decimal points stay in one vertical line.",
        "If one decimal has fewer places, add zeros as place holders. This does not change the value but it stops place-value mistakes."
      ],
      steps: [
        "Write the decimals in a column and align the decimal points.",
        "Add zeros if one number has fewer decimal places.",
        "Add or subtract from right to left, carrying or exchanging if needed.",
        "Bring the decimal point straight down into the answer."
      ],
      tips: [
        "3.4 can be written as 3.40.",
        "Estimate with whole numbers before calculating.",
        "Check if your answer should be bigger or smaller than the starting number."
      ],
      examples: [
        { title: "Addition", text: "2.35 + 1.4 becomes 2.35 + 1.40. Add hundredths, tenths and ones to get 3.75." },
        { title: "Subtraction", text: "6.2 - 0.85 becomes 6.20 - 0.85. After exchanging, the answer is 5.35." }
      ],
      visualLabel: "A decimal calculation card showing columns lined up by decimal point.",
      visual: createStudyVisualCard({ emoji: "➕", title: "Line them up", subtitle: "Decimal points must match", chips: ["2.35", "+1.40", "= 3.75", "Check"], accent: "#14b8a6" })
    },
    {
      title: "Multiplying & Dividing Decimals",
      summary: "Understand when the number should grow and when it should shrink.",
      explanation: [
        "For ×10, ×100 and ×1000, each digit shifts left one, two or three places in value, so the number gets larger. For ÷10, ÷100 and ÷1000, the digits shift right one, two or three places in value, so the number gets smaller.",
        "For decimal multiplication such as 0.4 × 0.3, multiply as whole numbers first, then place the decimal point by counting the total number of decimal places in the factors."
      ],
      steps: [
        "Decide whether the question is using ×10/÷10 rules or an ordinary decimal multiplication/division.",
        "For powers of 10, move the digits the required number of places and use zeros if needed.",
        "For decimal multiplication, ignore the points first, multiply, then count decimal places.",
        "Estimate the size of the answer to check it makes sense."
      ],
      tips: [
        "÷10 makes the number ten times smaller.",
        "×100 moves digits two places left in value, so the number gets larger.",
        "Think about the size, not only the rule."
      ],
      examples: [
        { title: "Powers of ten", text: "3.48 × 10 = 34.8 and 6.2 ÷ 100 = 0.062 because the digits move two places to the right in value." },
        { title: "Decimal multiplication", text: "0.4 × 0.3 = 12 hundredths = 0.12 because 4 × 3 = 12 and there are two decimal places altogether." }
      ],
      visualLabel: "A decimal movement card showing places shifting for multiplying and dividing by powers of ten.",
      visual: createStudyVisualCard({ emoji: "↔️", title: "Move by place value", subtitle: "Digits shift when ×10 or ÷10", chips: ["×10", "÷10", "×100", "÷100"], accent: "#f59e0b" })
    }
  ]
});
