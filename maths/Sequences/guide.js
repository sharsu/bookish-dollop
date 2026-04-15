registerStudyGuide({
  topic: "Sequences",
  icon: "🔁",
  summary: "Sequences are patterns in numbers, and each pattern follows a rule.",
  intro: "The key is to notice what changes, what stays the same and whether the rule works every time.",
  keyIdea: "Find the rule before finding the answer.",
  visualLabel: "A sequences card showing a repeating increase pattern.",
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
        "A sequence can go up, go down or change in a more interesting pattern. Looking carefully at the jumps between terms helps you see the rule.",
        "Some patterns use the same change each time, while others might double, square or switch between two moves."
      ],
      steps: [
        "Compare one term with the next.",
        "Look for the change or operation.",
        "Check the same rule works again.",
        "Use it to continue the sequence."
      ],
      tips: [
        "Write the jumps above the numbers if that helps.",
        "Check whether the pattern repeats.",
        "Do not guess from only one gap."
      ],
      examples: [
        { title: "Add pattern", text: "4, 7, 10, 13 goes up by 3 each time." },
        { title: "Subtract pattern", text: "20, 16, 12, 8 goes down by 4 each time." }
      ],
      visualLabel: "A sequence card showing jumps between terms.",
      visual: createStudyVisualCard({ emoji: "🔁", title: "Spot the jump", subtitle: "What changes each time?", chips: ["+3", "-4", "repeat", "check"], accent: "#22c55e" })
    },
    {
      title: "Arithmetic Sequences",
      summary: "An arithmetic sequence changes by the same amount each time.",
      explanation: [
        "These are the most common sequences in 11+ work. The difference between terms stays constant, which makes missing values easier to spot.",
        "Once you know the common difference, you can move forward or backward through the pattern."
      ],
      steps: [
        "Find the difference between two terms.",
        "Check the next gap matches.",
        "Use the same difference again and again.",
        "Fill in missing terms carefully."
      ],
      tips: [
        "A constant difference means arithmetic sequence.",
        "The difference can be negative if the sequence goes down.",
        "Missing values often sit in the middle, so work from both sides if you can."
      ],
      examples: [
        { title: "Forward", text: "9, 14, 19, 24 has a common difference of 5." },
        { title: "Missing term", text: "6, 10, __, 18 must have 14 in the gap because the pattern is +4." }
      ],
      visualLabel: "An arithmetic sequence card showing a constant difference.",
      visual: createStudyVisualCard({ emoji: "➕", title: "Same difference", subtitle: "Arithmetic means steady change", chips: ["+4", "+4", "+4", "constant"], accent: "#0ea5e9" })
    },
    {
      title: "Position Rules",
      summary: "Some sequence questions ask for a rule using the term number.",
      explanation: [
        "Instead of only saying what happens each time, a position rule tells you how to jump straight to any term. This is sometimes called a term-to-term rule and a position-to-term rule.",
        "For simple sequences, you can often build the rule from the common difference and the starting point."
      ],
      steps: [
        "Write the term positions 1, 2, 3, 4...",
        "Look for a pattern linking the position to the term.",
        "Test your rule on more than one term.",
        "Use the rule to find the term you need."
      ],
      tips: [
        "If the sequence goes up by 3, the rule often begins with 3n.",
        "Then adjust the rule to match the first term.",
        "Always test the rule on term 1 and another later term."
      ],
      examples: [
        { title: "Simple rule", text: "For 4, 7, 10, 13 the rule is 3n + 1." },
        { title: "Check", text: "If n = 4, then 3n + 1 = 13, which matches the fourth term." }
      ],
      visualLabel: "A position rule card showing n linked to the term value.",
      visual: createStudyVisualCard({ emoji: "n", title: "Position rule", subtitle: "Jump straight to the term", chips: ["n", "3n", "+1", "Check"], accent: "#f59e0b" })
    },
    {
      title: "Missing Terms & Pattern Problems",
      summary: "Sometimes the challenge is not the next term, but finding what belongs in a gap.",
      explanation: [
        "Missing-term questions make you use the rule both forwards and backwards. This is a good test of whether you really understand the pattern.",
        "Pattern problems can also hide the rule in words, pictures or shapes, so careful reading matters."
      ],
      steps: [
        "Work out the rule first.",
        "Use the rule on both sides of the gap.",
        "Check that the missing value fits all nearby terms.",
        "Read worded pattern clues slowly."
      ],
      tips: [
        "Working backwards can be just as useful as working forwards.",
        "Use a table if the pattern is messy.",
        "One correct gap should keep the whole pattern tidy."
      ],
      examples: [
        { title: "Gap in the middle", text: "12, 17, __, 27 must have 22 because the pattern is +5." },
        { title: "Worded pattern", text: "If each shape has 3 more sticks than the last, the totals form an arithmetic sequence." }
      ],
      visualLabel: "A pattern problem card showing missing terms found by using the rule.",
      visual: createStudyVisualCard({ emoji: "🕵️", title: "Find the missing term", subtitle: "Use the rule both ways", chips: ["Gap", "Rule", "Check both sides", "Solve"], accent: "#ef4444" })
    }
  ]
});
