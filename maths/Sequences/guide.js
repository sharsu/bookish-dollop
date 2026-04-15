registerStudyGuide({
  topic: "Sequences",
  icon: "🔁",
  summary: "Sequences are patterns in numbers, and each pattern follows a rule.",
  intro: "The key is to notice what changes, what stays the same and whether the rule works every time.",
  keyIdea: "Find the rule before finding the answer.",
  visualLabel: "A full-width sequences overview visual mapping the key sequence ideas in this topic.",
  visual: createStudyVisualCard({
    emoji: "🔁",
    title: "Find the rule",
    subtitle: "What changes each time?",
    chips: ["4", "+3", "7", "10"],
    accent: "#22c55e"
  }),
  concepts: [
    {
      title: "Spotting the Rule",
      summary: "The first job is to work out what is happening from one term to the next.",
      explanation: [
        "A sequence rule can be additive, multiplicative or alternating. The quickest first check is to look at the differences between neighbouring terms and see whether they stay constant.",
        "If the differences do not stay constant, try ratios, squares, or a repeating two-step pattern. Writing the jumps above the sequence is often the best detective tool."
      ],
      steps: [
        "Calculate the change from one term to the next.",
        "Check whether the same change happens every time.",
        "If not, test another pattern such as ×, ÷ or alternating steps.",
        "Apply the rule to extend the sequence or fill the blanks."
      ],
      tips: [
        "Write the jumps above the numbers if that helps.",
        "Check whether the pattern repeats.",
        "Do not guess from only one gap."
      ],
      examples: [
        { title: "Add pattern", text: "4, 7, 10, 13 has differences +3, +3, +3, so the next term is 16." },
        { title: "Alternating pattern", text: "2, 5, 4, 7, 6, 9 alternates between +3 and -1, so the next term is 8." }
      ],
      visualLabel: "A full-width sequence visual showing repeated jumps between terms.",
      visual: createSequencesJumpVisual({ accent: "#22c55e" })
    },
    {
      title: "Arithmetic Sequences",
      summary: "An arithmetic sequence changes by the same amount each time.",
      explanation: [
        "An arithmetic sequence has a constant difference d between consecutive terms. This means each term is found by adding or subtracting the same amount each time.",
        "Because the gap is fixed, arithmetic sequences can be written with an nth term of the form dn + c, where d is the common difference and c is the adjustment needed to match the first term."
      ],
      steps: [
        "Find the common difference by subtracting consecutive terms.",
        "Check the difference stays the same across the sequence.",
        "Move forward by adding d or backward by subtracting d.",
        "Use the constant difference to fill missing terms and check the pattern."
      ],
      tips: [
        "A constant difference means arithmetic sequence.",
        "The difference can be negative if the sequence goes down.",
        "Missing values often sit in the middle, so work from both sides if you can."
      ],
      examples: [
        { title: "Forward", text: "9, 14, 19, 24 has common difference 5, so the next term is 29." },
        { title: "Missing term", text: "6, 10, __, 18 has difference 4, so the missing term is 14 because 10 + 4 = 14 and 14 + 4 = 18." }
      ],
      visualLabel: "A full-width arithmetic-sequence visual showing the same difference repeated across the terms.",
      visual: createSequencesArithmeticVisual({ accent: "#0ea5e9" })
    },
    {
      title: "Position Rules",
      summary: "Some sequence questions ask for a rule using the term number.",
      explanation: [
        "A position-to-term rule lets you jump straight to any term number n. For a linear sequence, the nth term is usually written as dn + c, where d is the common difference and c is the constant adjustment.",
        "The derivation method is: find the common difference, write d × n, then compare this with the actual first term to see what needs adding or subtracting."
      ],
      steps: [
        "Write the term numbers 1, 2, 3, 4 beside the sequence.",
        "Find the common difference d and write dn as a first guess.",
        "Test dn on the first term and adjust with +c or -c to make it match.",
        "Check the rule on at least two terms before using it."
      ],
      tips: [
        "If the sequence goes up by 3, the rule often begins with 3n.",
        "Then adjust the rule to match the first term.",
        "Always test the rule on term 1 and another later term."
      ],
      examples: [
        { title: "Deriving a rule", text: "For 4, 7, 10, 13 the difference is 3, so start with 3n. When n = 1 this gives 3, but the first term is 4, so add 1. The nth term is 3n + 1." },
        { title: "Using the rule", text: "For the rule 3n + 1, the 10th term is 3 × 10 + 1 = 31." }
      ],
      visualLabel: "A full-width nth-term visual linking term position n to the sequence values and rule.",
      visual: createSequencesNthVisual({ accent: "#f59e0b" })
    },
    {
      title: "Missing Terms & Pattern Problems",
      summary: "Sometimes the challenge is not the next term, but finding what belongs in a gap.",
      explanation: [
        "Missing-term questions make you use the rule both forwards and backwards. This tests whether you understand the structure of the sequence instead of only spotting the next number.",
        "Worded or shape sequences often hide the same maths idea. You may need to make a table of term number against value before the rule becomes obvious."
      ],
      steps: [
        "Work out the pattern rule before filling any blank.",
        "Use the rule from the left and from the right side of the gap.",
        "Check the missing value fits all neighbouring terms, not just one side.",
        "For worded patterns, turn the information into a table or list."
      ],
      tips: [
        "Working backwards can be just as useful as working forwards.",
        "Use a table if the pattern is messy.",
        "One correct gap should keep the whole pattern tidy."
      ],
      examples: [
        { title: "Gap in the middle", text: "12, 17, __, 27 has common difference 5, so the missing term is 22 because 17 + 5 = 22 and 22 + 5 = 27." },
        { title: "Worded pattern", text: "If a shape pattern starts with 4 sticks and adds 3 sticks each time, the totals are 4, 7, 10, 13, so the nth term is 3n + 1." }
      ],
      visualLabel: "A full-width missing-term visual showing the same difference checked on both sides of the gap.",
      visual: createSequencesMissingVisual({ accent: "#ef4444" })
    }
  ]
});
