registerStudyGuide({
  topic: "BIDMAS",
  icon: "🧮",
  summary: "BIDMAS helps you solve mixed calculations in a fair and sensible order.",
  intro: "This topic is all about knowing what to do first, what can wait, and how to avoid left-to-right mistakes.",
  keyIdea: "Order matters.",
  visualLabel: "A full-width BIDMAS overview visual mapping the key operation-order ideas in this topic.",
  visual: createStudyVisualCard({
    emoji: "🧮",
    title: "Order matters",
    subtitle: "Brackets first, then multiply and divide",
    chips: ["Brackets", "Indices", "÷ and ×", "+ and −"],
    accent: "#8b5cf6"
  }),
  concepts: [
    {
      title: "The Order of Operations",
      summary: "BIDMAS tells you which jobs to do first in a mixed calculation.",
      explanation: [
        "Without an agreed order, the same calculation could give different answers. BIDMAS fixes that by giving one order: Brackets, Indices, Division and Multiplication, then Addition and Subtraction.",
        "Division and multiplication are on the same level, and so are addition and subtraction. When operations are on the same level, work from left to right."
      ],
      steps: [
        "Read the whole calculation before starting.",
        "Mark brackets and powers because they must be done before the rest.",
        "Work through any × and ÷ from left to right.",
        "Finish with + and − from left to right."
      ],
      tips: [
        "Do not always work left to right from the start.",
        "Cover finished parts to help you focus.",
        "Rewrite one neat line at a time."
      ],
      examples: [
        { title: "Simple order", text: "3 + 4 × 2 = 3 + 8 = 11 because multiplication comes before addition." },
        { title: "Longer example", text: "12 - 3 × 2 + 5 becomes 12 - 6 + 5. Then work left to right: 12 - 6 = 6 and 6 + 5 = 11." }
      ],
      visualLabel: "A full-width BIDMAS visual showing multiplication highlighted before addition in a mixed calculation.",
      visual: createBidmasOrderVisual({ accent: "#8b5cf6" })
    },
    {
      title: "Brackets First",
      summary: "Anything inside brackets must be worked out before the outside operations.",
      explanation: [
        "Brackets create a smaller calculation that must be completed first. This is why 2 × (3 + 5) is not the same as 2 × 3 + 5.",
        "If brackets are nested, solve the innermost bracket first, then move outward one layer at a time."
      ],
      steps: [
        "Identify all brackets in the calculation.",
        "Complete the calculation inside the innermost bracket.",
        "Rewrite the line using the bracket answer.",
        "Apply BIDMAS again to the simplified expression."
      ],
      tips: [
        "Finish one complete bracket before moving on.",
        "Nested brackets start from the middle.",
        "Check the sign in front of the bracket carefully."
      ],
      examples: [
        { title: "Single bracket", text: "2 × (3 + 5) = 2 × 8 = 16, because the bracket must be finished before multiplying." },
        { title: "Nested brackets", text: "18 - (4 + (6 - 1)) becomes 18 - (4 + 5) = 18 - 9 = 9." }
      ],
      visualLabel: "A full-width brackets example showing the inside of the brackets completed before multiplying outside.",
      visual: createBidmasBracketsVisual({ accent: "#ec4899" })
    },
    {
      title: "Multiply & Divide in the Middle",
      summary: "Multiplication and division are on the same level, so work through them from left to right.",
      explanation: [
        "After brackets and indices, multiplication and division come next. Because they are equal in rank, you do not choose multiplication first every time; you move from left to right.",
        "This left-to-right rule matters because 24 ÷ 3 × 2 is not the same as 24 ÷ 6 if you group it wrongly."
      ],
      steps: [
        "Find the first multiplication or division sign from the left.",
        "Do that single calculation and rewrite the line.",
        "Repeat for the next × or ÷.",
        "Only switch to + or − when the middle operations are finished."
      ],
      tips: [
        "Division does not wait behind multiplication.",
        "Left to right matters when the level is the same.",
        "Write the new line after each step."
      ],
      examples: [
        { title: "Left to right", text: "24 ÷ 3 × 2 = 8 × 2 = 16. If you did 3 × 2 first, you would break BIDMAS." },
        { title: "Mixed middle", text: "5 + 18 ÷ 3 × 2 = 5 + 6 × 2 = 5 + 12 = 17." }
      ],
      visualLabel: "A full-width middle-operations visual showing division and multiplication worked left to right.",
      visual: createBidmasMiddleVisual({ accent: "#0ea5e9" })
    },
    {
      title: "Indices, Negatives & Careful Signs",
      summary: "Powers and negative signs can change the answer a lot, so slow down.",
      explanation: [
        "An index tells you repeated multiplication, so 3² means 3 × 3 and 2³ means 2 × 2 × 2. Indices are done before ordinary multiplication and addition.",
        "Negative signs need special care. (-3)² = 9 because the whole negative number is squared, but -3² = -(3²) = -9 because the square only applies to the 3."
      ],
      steps: [
        "Work out any powers first.",
        "Check whether a negative sign sits inside brackets or outside them.",
        "Rewrite the expression one step at a time.",
        "Check both the size and the sign of the answer."
      ],
      tips: [
        "(-2)² = 4 because the negative is inside the brackets.",
        "-2² means -(2²) = -4 when there are no brackets.",
        "Signs matter just as much as numbers."
      ],
      examples: [
        { title: "Index", text: "3² + 4 = 9 + 4 = 13 because the square is done before the addition." },
        { title: "Negative with brackets", text: "(-3)² = (-3) × (-3) = 9, but -3² = -(3 × 3) = -9." }
      ],
      visualLabel: "A full-width powers-and-negatives visual comparing (-3)² and -3² so the bracket effect is clear.",
      visual: createBidmasSignsVisual({ accent: "#ef4444" })
    }
  ]
});
