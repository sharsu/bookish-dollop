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
        "An expression is built from numbers, letters and operations, but it has no equals sign. The letter part is called the variable, and the number attached to it is the coefficient, so in 5x the coefficient is 5.",
        "To simplify, combine like terms only. Like terms must have exactly the same letters to the same power, so 3a + 2a = 5a, but 3a + 2b stays separate. The distributive law also helps: a(b + c) = ab + ac."
      ],
      steps: [
        "Split the expression into terms separated by + or − signs.",
        "Group like terms, such as x terms, y terms and plain numbers.",
        "Add or subtract the coefficients of each matching group.",
        "If there are brackets, expand first or factorise first depending on the question."
      ],
      tips: [
        "2a means 2 × a.",
        "A plain a means 1a.",
        "Only like terms can be combined."
      ],
      examples: [
        { title: "Combining like terms", text: "5x + 2x - x = 7x - x = 6x because the coefficients 5, 2 and -1 belong to the same x term." },
        { title: "Using brackets", text: "3(a + 4) expands to 3a + 12 because the 3 multiplies both a and 4." }
      ],
      visualLabel: "A full-width algebra visual showing like terms grouped and simplified while unlike terms stay separate.",
      visual: createAlgebraExpressionsVisual({ accent: "#ec4899" })
    },
    {
      title: "Equations",
      summary: "An equation is balanced, so whatever you do to one side must happen to the other side too.",
      explanation: [
        "An equation has an equals sign, so both sides must stay balanced. To solve it, undo the operations around the variable using inverse operations: subtract to undo add, divide to undo multiply and so on.",
        "The same balancing rule works for inequalities such as x + 3 > 10. The only extra rule is this: if you multiply or divide an inequality by a negative number, the inequality sign reverses direction."
      ],
      steps: [
        "Identify the operations attached to the variable and undo them in reverse order.",
        "Do the same operation to both sides to keep the statement balanced.",
        "For inequalities, remember to flip the sign if you multiply or divide by a negative.",
        "Substitute your answer back to check it makes the equation or inequality true."
      ],
      tips: [
        "Undo + with − and undo × with ÷.",
        "Keep the equation balanced at every step.",
        "A quick check at the end can catch mistakes."
      ],
      examples: [
        { title: "Two-step equation", text: "For 2y + 3 = 13, subtract 3 from both sides to get 2y = 10, then divide by 2 to get y = 5." },
        { title: "Inequality rule", text: "For -2x < 8, divide both sides by -2 and flip the sign: x > -4." }
      ],
      visualLabel: "A full-width balance visual showing the same operation applied to both sides of an equation.",
      visual: createAlgebraEquationsVisual({ accent: "#8b5cf6" })
    },
    {
      title: "Substitution",
      summary: "Substitution means replacing a letter with the number it stands for.",
      explanation: [
        "Substitution means replacing each variable with its given value, then evaluating the expression using BIDMAS. This is how you test formulas and algebra rules with actual numbers.",
        "Use brackets around negative values so the signs stay correct. For example, if b = -2 then b² means (-2)², not -2² by accident."
      ],
      steps: [
        "Copy the expression exactly before changing anything.",
        "Replace each letter with the given value, using brackets for negatives.",
        "Work out powers, brackets and multiplication before addition or subtraction.",
        "Check that every variable has been replaced once and only once."
      ],
      tips: [
        "If a = 4, then 3a means 3 × 4.",
        "If b = -2, write brackets: 5 + (b).",
        "Check that every letter has been replaced."
      ],
      examples: [
        { title: "Positive value", text: "If a = 4, then 3a + 2 = 3 × 4 + 2 = 12 + 2 = 14." },
        { title: "Negative value", text: "If b = -2, then b² + 3 = (-2)² + 3 = 4 + 3 = 7." }
      ],
      visualLabel: "A full-width substitution example showing a value inserted into an expression and then calculated.",
      visual: createAlgebraSubstitutionVisual({ accent: "#0ea5e9" })
    },
    {
      title: "Factorising & Expansion",
      summary: "Expansion opens brackets out. Factorising packs terms back into brackets.",
      explanation: [
        "Expansion uses the distributive law: a(b + c) = ab + ac. This means every term inside the bracket must be multiplied by the outside factor.",
        "Factorising is the reverse move. You look for the highest common factor in every term, take it outside the bracket, and leave the leftover terms inside."
      ],
      steps: [
        "For expansion, multiply the outside factor by each term inside the bracket.",
        "For factorising, find the highest common factor shared by all terms.",
        "Write that common factor outside the bracket and divide each term by it for the inside.",
        "Check by expanding your answer to see if you return to the original expression."
      ],
      tips: [
        "3(x + 4) becomes 3x + 12.",
        "6a + 12 factorises to 6(a + 2).",
        "A quick expand-back check is very helpful."
      ],
      examples: [
        { title: "Expansion", text: "2(x + 5) = 2 × x + 2 × 5 = 2x + 10." },
        { title: "Factorising", text: "8y + 12 = 4(2y + 3) because 4 is the highest common factor and 4 × 2y + 4 × 3 expands back to 8y + 12." }
      ],
      visualLabel: "A full-width brackets visual showing expansion and factorising as opposite moves.",
      visual: createAlgebraBracketsVisual({ accent: "#f97316" })
    },
    {
      title: "Function Machines",
      summary: "A function machine follows a rule to turn an input into an output.",
      explanation: [
        "A function machine is really a rule. If the rule is '×2 then +3', you can write it as 2n + 3. This links function machines to algebra expressions and to nth-term rules for linear sequences.",
        "To find the nth term of a linear sequence, first find the common difference. That number becomes the coefficient of n. Then compare the rule with a known term to find the constant part. For example, 4, 7, 10, 13 has difference 3, so start with 3n. Since 3 × 1 = 3 but the first term is 4, add 1. The nth term is 3n + 1."
      ],
      steps: [
        "Read the machine rule in order from input to output.",
        "For forward questions, apply each operation in order.",
        "For backward questions, undo the operations in reverse order.",
        "For nth-term questions, use difference as the n coefficient, then adjust by adding or subtracting a constant."
      ],
      tips: [
        "Forward and backward methods are both useful.",
        "Undo +5 with −5 and undo ×3 with ÷3.",
        "Write each step so you do not mix up the order."
      ],
      examples: [
        { title: "Backward", text: "If the output is 17 and the rule is ×2 then +3, undo +3 first to get 14, then undo ×2 by dividing: input = 7." },
        { title: "Nth term", text: "For 5, 8, 11, 14 the difference is 3, so start with 3n. Term 1 would be 3, but the sequence starts at 5, so add 2. The nth term is 3n + 2." }
      ],
      visualLabel: "A full-width function-machine visual showing an input transformed step by step, with a backward-thinking reminder.",
      visual: createAlgebraFunctionVisual({ accent: "#14b8a6" })
    },
    {
      title: "Magic Squares",
      summary: "In a magic square, each row, column and diagonal has the same total.",
      explanation: [
        "A magic square gives one fixed total, often called the magic sum. Every row, every column and each main diagonal must equal that same total.",
        "This turns the puzzle into several short equations. First find the magic sum from a complete line, then write equations for the incomplete lines and solve them one by one."
      ],
      steps: [
        "Look for a complete row, column or diagonal to find the magic sum.",
        "Write an equation for a line with a missing number or variable.",
        "Solve each short equation and fill the square gradually.",
        "Check every row, column and diagonal equals the same total."
      ],
      tips: [
        "Look for the row with the most known values first.",
        "One solved box can unlock several others.",
        "Always do a full final check of all totals."
      ],
      examples: [
        { title: "Finding the target total", text: "If the top row is 8, 1 and 6, then the magic sum is 8 + 1 + 6 = 15, so every line must equal 15." },
        { title: "Using algebra", text: "If a row is x, 4 and 6 and the magic sum is 15, write x + 4 + 6 = 15. Then x + 10 = 15, so x = 5." }
      ],
      visualLabel: "A full-width magic-square visual showing the target total found first and then used to solve for the missing value.",
      visual: createAlgebraMagicSquareVisual({ accent: "#6366f1" })
    }
  ]
});
