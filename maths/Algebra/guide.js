registerStudyGuide({
  topic: "Algebra",
  icon: "✏️",
  summary: "Algebra is made of smaller ideas like expressions, equations and substitution.",
  intro: "Think of Algebra as a toolbox. Each sub-topic teaches you one useful move with letters and numbers.",
  keyIdea: "Letters stand for values, and the rules stay fair all the way through.",
  visual: createStudyVisualCard({
    emoji: "✏️",
    title: "Algebra toolkit",
    subtitle: "Learn one small idea at a time",
    chips: ["Expressions", "Equations", "Substitution", "Function machines"],
    accent: "#ec4899"
  }),
  visualLabel: "An algebra overview card showing the main sub-topics.",
  concepts: [
    {
      title: "Expressions",
      summary: "Expressions are algebra sentences without an equals sign.",
      explanation: [
        "An expression is made from numbers, letters and operations such as +, − and ×. It does not ask you to solve for a final value unless a number is given for the letter.",
        "When you simplify an expression, you tidy it by combining like terms. Like terms have the same letters to the same power, so 3a and 2a can join, but 3a and 2b cannot."
      ],
      steps: [
        "Read the whole expression first and spot the terms.",
        "Group together like terms, such as 4x and 3x.",
        "Add or subtract only the number part of those like terms.",
        "Leave unlike terms as they are."
      ],
      tips: [
        "2a means 2 × a.",
        "A plain a means 1a.",
        "Only like terms can be combined."
      ],
      examples: [
        { title: "Combining like terms", text: "5x + 2x becomes 7x because both terms are x terms." },
        { title: "Not like terms", text: "4a + 3b cannot be joined because a and b are different letters." }
      ],
      visualLabel: "An expressions card showing like terms being grouped together.",
      visual: createStudyVisualCard({ emoji: "🧩", title: "Expressions", subtitle: "Group like terms together", chips: ["5x + 2x", "7x", "4a + 3b", "stay separate"], accent: "#ec4899" })
    },
    {
      title: "Equations",
      summary: "An equation is balanced, so whatever you do to one side must happen to the other side too.",
      explanation: [
        "Equations have an equals sign. Your goal is to find the value of the letter that makes both sides equal.",
        "The balancing idea is the key. If you add 3 on one side, you must add 3 on the other side. If you divide one side by 2, you divide the other side by 2 as well."
      ],
      steps: [
        "Find the operation attached to the letter.",
        "Undo that operation in the reverse order.",
        "Do the same thing to both sides of the equation.",
        "Check your answer by putting it back in."
      ],
      tips: [
        "Undo + with − and undo × with ÷.",
        "Keep the equation balanced at every step.",
        "A quick check at the end can catch mistakes."
      ],
      examples: [
        { title: "One-step equation", text: "If x + 4 = 11, subtract 4 from both sides, so x = 7." },
        { title: "Two-step equation", text: "If 2y + 3 = 13, subtract 3 first to get 2y = 10, then divide by 2 to get y = 5." }
      ],
      visualLabel: "An equations card showing both sides staying balanced.",
      visual: createStudyVisualCard({ emoji: "⚖️", title: "Equations", subtitle: "Keep both sides fair", chips: ["x + 4 = 11", "−4 both sides", "x = 7", "Check"], accent: "#8b5cf6" })
    },
    {
      title: "Substitution",
      summary: "Substitution means replacing a letter with the number it stands for.",
      explanation: [
        "When a question tells you the value of a letter, you can put that value into the expression. This is called substitution.",
        "The most common mistakes are forgetting brackets with negative numbers or forgetting that 3a means 3 × a."
      ],
      steps: [
        "Write the original expression clearly.",
        "Replace each letter with the given value.",
        "Use brackets when the number is negative.",
        "Work out the answer carefully using the correct order."
      ],
      tips: [
        "If a = 4, then 3a means 3 × 4.",
        "If b = -2, write brackets: 5 + (b).",
        "Check that every letter has been replaced."
      ],
      examples: [
        { title: "Positive value", text: "If a = 4, then 3a + 2 becomes 3 × 4 + 2 = 14." },
        { title: "Negative value", text: "If b = -2, then b² means (-2) × (-2) = 4." }
      ],
      visualLabel: "A substitution card showing letters being replaced with values.",
      visual: createStudyVisualCard({ emoji: "🔁", title: "Substitution", subtitle: "Swap the letter for its value", chips: ["a = 4", "3a + 2", "3 × 4 + 2", "14"], accent: "#0ea5e9" })
    },
    {
      title: "Factorising & Expansion",
      summary: "Expansion opens brackets out. Factorising packs terms back into brackets.",
      explanation: [
        "These two ideas are opposites. Expansion means multiplying through a bracket, while factorising means spotting a common factor and taking it outside the bracket.",
        "In 11+ work, this often starts with one bracket and a single common factor, such as 3(x + 4) or 6a + 12."
      ],
      steps: [
        "For expansion, multiply the outside number by each term inside the bracket.",
        "For factorising, find the biggest common factor first.",
        "Write the common factor outside the bracket.",
        "Check by expanding again to see if you get back to the start."
      ],
      tips: [
        "3(x + 4) becomes 3x + 12.",
        "6a + 12 factorises to 6(a + 2).",
        "A quick expand-back check is very helpful."
      ],
      examples: [
        { title: "Expansion", text: "2(x + 5) becomes 2x + 10 because 2 multiplies both x and 5." },
        { title: "Factorising", text: "8y + 12 becomes 4(2y + 3) because 4 is the largest common factor." }
      ],
      visualLabel: "A brackets card showing expansion and factorising as opposite moves.",
      visual: createStudyVisualCard({ emoji: "📦", title: "Brackets", subtitle: "Open out or factor back", chips: ["2(x + 5)", "2x + 10", "8y + 12", "4(2y + 3)"], accent: "#f97316" })
    },
    {
      title: "Function Machines",
      summary: "A function machine follows a rule to turn an input into an output.",
      explanation: [
        "Function machines are like maths robots. A number goes in, the rule happens, and a new number comes out.",
        "To work backwards, you undo the rule in reverse order. This helps you find a missing input or a missing step."
      ],
      steps: [
        "Read the rule on the machine carefully.",
        "If you know the input, follow the rule forward.",
        "If you know the output, work backwards by undoing the rule.",
        "Check your answer by sending it through the machine again."
      ],
      tips: [
        "Forward and backward methods are both useful.",
        "Undo +5 with −5 and undo ×3 with ÷3.",
        "Write each step so you do not mix up the order."
      ],
      examples: [
        { title: "Forward", text: "If the rule is ×2 then +3, an input of 4 gives 11." },
        { title: "Backward", text: "If the output is 17 and the rule is ×2 then +3, subtract 3 first to get 14, then divide by 2 to get 7." }
      ],
      visualLabel: "A function machine card showing numbers going in and out.",
      visual: createStudyVisualCard({ emoji: "⚙️", title: "Function machines", subtitle: "Follow the rule, then undo it backwards", chips: ["Input 4", "×2", "+3", "Output 11"], accent: "#14b8a6" })
    },
    {
      title: "Magic Squares",
      summary: "In a magic square, each row, column and diagonal has the same total.",
      explanation: [
        "Algebra magic squares mix number patterns and equations. Missing boxes might contain letters or expressions, and you use the equal totals to work out what fits.",
        "The clever move is to find one complete row or column first, then use that total to solve the missing parts in the other rows."
      ],
      steps: [
        "Find a row, column or diagonal where the total is easiest to work out.",
        "Use that total as the target for the other rows and columns.",
        "Form small equations for the missing boxes.",
        "Check every row, column and diagonal at the end."
      ],
      tips: [
        "Look for the row with the most known values first.",
        "One solved box can unlock several others.",
        "Always do a full final check of all totals."
      ],
      examples: [
        { title: "Finding the target total", text: "If one full row adds to 15, every row, column and diagonal must also add to 15." },
        { title: "Using algebra", text: "If a row is x, 4 and 6 and the magic total is 15, then x + 4 + 6 = 15 so x = 5." }
      ],
      visualLabel: "A magic square card showing equal totals in every direction.",
      visual: createStudyVisualCard({ emoji: "✨", title: "Magic squares", subtitle: "Every line must match the same total", chips: ["Rows match", "Columns match", "Diagonals match", "Solve the blanks"], accent: "#6366f1" })
    }
  ]
});
