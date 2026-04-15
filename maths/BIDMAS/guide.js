registerStudyGuide({
  topic: "BIDMAS",
  icon: "🧮",
  summary: "BIDMAS helps you solve mixed calculations in a fair and sensible order.",
  intro: "This topic is all about knowing what to do first, what can wait, and how to avoid left-to-right mistakes.",
  keyIdea: "Order matters.",
  visualLabel: "A BIDMAS card listing the order of operations.",
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
        "Without an agreed order, people could get different answers to the same calculation. BIDMAS stops that confusion.",
        "The letters remind you to do Brackets, Indices, Division and Multiplication, then Addition and Subtraction."
      ],
      steps: [
        "Scan the whole calculation first.",
        "Mark the brackets and powers if there are any.",
        "Do division and multiplication next.",
        "Finish with addition and subtraction."
      ],
      tips: [
        "Do not always work left to right from the start.",
        "Cover finished parts to help you focus.",
        "Rewrite one neat line at a time."
      ],
      examples: [
        { title: "Simple order", text: "3 + 4 × 2 = 11 because you multiply first, then add." },
        { title: "With division", text: "18 ÷ 3 + 5 = 11 because 18 ÷ 3 = 6, then 6 + 5 = 11." }
      ],
      visualLabel: "A BIDMAS overview card showing the order of operations.",
      visual: createStudyVisualCard({ emoji: "🧮", title: "BIDMAS", subtitle: "Follow the order calmly", chips: ["B", "I", "D/M", "A/S"], accent: "#8b5cf6" })
    },
    {
      title: "Brackets First",
      summary: "Anything inside brackets must be worked out before the outside operations.",
      explanation: [
        "Brackets act like a little box telling you to finish that part first. Once the brackets are solved, you can continue with the rest of the calculation.",
        "Sometimes there are brackets inside brackets, so you work from the innermost set outward."
      ],
      steps: [
        "Find every bracket in the calculation.",
        "Solve the inside first.",
        "Replace the bracket with its answer.",
        "Continue using BIDMAS on the new line."
      ],
      tips: [
        "Finish one complete bracket before moving on.",
        "Nested brackets start from the middle.",
        "Check the sign in front of the bracket carefully."
      ],
      examples: [
        { title: "Single bracket", text: "2 × (3 + 5) = 2 × 8 = 16." },
        { title: "Nested style", text: "(10 - (2 + 3)) = 10 - 5 = 5." }
      ],
      visualLabel: "A brackets card showing inner steps completed first.",
      visual: createStudyVisualCard({ emoji: "( )", title: "Brackets first", subtitle: "Finish the inside before the outside", chips: ["Inner first", "Rewrite", "Check sign", "Then continue"], accent: "#ec4899" })
    },
    {
      title: "Multiply & Divide in the Middle",
      summary: "Multiplication and division are on the same level, so work through them from left to right.",
      explanation: [
        "After brackets and powers, multiplication and division come next. Because they are on the same level, you do whichever comes first as you move left to right.",
        "This is a place where many children accidentally multiply first just because they like times more than divide."
      ],
      steps: [
        "Find the first × or ÷ from the left.",
        "Do that step.",
        "Move to the next × or ÷.",
        "Only move to + and − when all × and ÷ are done."
      ],
      tips: [
        "Division does not wait behind multiplication.",
        "Left to right matters when the level is the same.",
        "Write the new line after each step."
      ],
      examples: [
        { title: "Left to right", text: "24 ÷ 3 × 2 = 8 × 2 = 16." },
        { title: "Mixed middle", text: "5 + 18 ÷ 3 × 2 = 5 + 12 = 17." }
      ],
      visualLabel: "A middle-operations card showing division and multiplication worked left to right.",
      visual: createStudyVisualCard({ emoji: "×÷", title: "Same level", subtitle: "Work left to right", chips: ["÷ first?", "Then ×", "Rewrite", "Then add/subtract"], accent: "#0ea5e9" })
    },
    {
      title: "Indices, Negatives & Careful Signs",
      summary: "Powers and negative signs can change the answer a lot, so slow down.",
      explanation: [
        "An index tells you how many times a number is multiplied by itself. Negative signs need special care because they can change a result completely.",
        "Brackets can make the difference between a positive answer and a negative one, so read the whole expression carefully."
      ],
      steps: [
        "Do indices before ordinary multiplication or addition.",
        "Check whether the negative sign is inside or outside brackets.",
        "Work one line at a time.",
        "Check the sign of your final answer."
      ],
      tips: [
        "(-2)² = 4 because the negative is inside the brackets.",
        "-2² means -(2²) = -4 when there are no brackets.",
        "Signs matter just as much as numbers."
      ],
      examples: [
        { title: "Index", text: "3² + 4 = 9 + 4 = 13." },
        { title: "Negative with brackets", text: "(-3)² = 9, but -3² = -9." }
      ],
      visualLabel: "A powers and negatives card showing how brackets change the meaning.",
      visual: createStudyVisualCard({ emoji: "⚠️", title: "Watch the signs", subtitle: "Brackets can change everything", chips: ["3²", "(-3)²", "-3²", "Check"], accent: "#ef4444" })
    }
  ]
});
