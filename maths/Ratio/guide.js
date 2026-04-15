registerStudyGuide({
  topic: "Ratio",
  icon: "⚖️",
  summary: "Ratio helps you compare amounts and keep them in the same proportion.",
  intro: "The big idea is that when one part changes, the other parts must change in step.",
  keyIdea: "Keep the order and scale every part in the same way.",
  visualLabel: "A ratio card showing parts and scaling.",
  visual: createStudyVisualCard({
    emoji: "⚖️",
    title: "Keep the same proportion",
    subtitle: "Scale every part together",
    chips: ["2:3", "5 parts", "Share first", "Scale"],
    accent: "#f59e0b"
  }),
  concepts: [
    {
      title: "Writing & Simplifying Ratios",
      summary: "A ratio compares one part with another part in a set order.",
      explanation: [
        "Ratios can compare parts to parts, such as red marbles to blue marbles, or parts to the whole. The order matters because 2:3 is not the same as 3:2.",
        "Simplifying a ratio is like simplifying a fraction: divide each part by the same number."
      ],
      steps: [
        "Write the amounts in the order the question gives.",
        "Check both parts use the same unit.",
        "Find a common factor.",
        "Divide each part by that factor."
      ],
      tips: [
        "Always keep the order the same.",
        "Ratios can be simplified like fractions, but they are not written as fractions.",
        "Units must match before you compare."
      ],
      examples: [
        { title: "Writing", text: "If there are 6 red and 9 blue counters, red:blue = 6:9." },
        { title: "Simplifying", text: "6:9 simplifies to 2:3 by dividing both parts by 3." }
      ],
      visualLabel: "A ratio card showing parts written in order and simplified.",
      visual: createStudyVisualCard({ emoji: "⚖️", title: "Write it in order", subtitle: "Then simplify", chips: ["6:9", "÷3", "2:3", "Order matters"], accent: "#f59e0b" })
    },
    {
      title: "Sharing in a Ratio",
      summary: "To share in a ratio, split the total into equal-sized parts first.",
      explanation: [
        "When a question asks you to share an amount in a ratio, the numbers in the ratio tell you how many parts there are altogether.",
        "Once you know the size of one part, you can build the full share for each person or group."
      ],
      steps: [
        "Add the ratio parts to find the total number of parts.",
        "Divide the total amount by that number.",
        "Multiply by each ratio number.",
        "Check the two shares add back to the original total."
      ],
      tips: [
        "2:3 means 5 parts altogether.",
        "Find one part before finding the shares.",
        "A final add-back check is very helpful."
      ],
      examples: [
        { title: "Simple share", text: "Share 30 in the ratio 2:3. There are 5 parts, so one part is 6. The shares are 12 and 18." },
        { title: "Check", text: "12 + 18 = 30, so the share works." }
      ],
      visualLabel: "A sharing ratio card showing total parts and equal part size.",
      visual: createStudyVisualCard({ emoji: "🍰", title: "Share fairly", subtitle: "Find one part first", chips: ["2:3", "5 parts", "30 ÷ 5", "6 each part"], accent: "#0ea5e9" })
    },
    {
      title: "Equivalent Ratios & Scaling",
      summary: "Equivalent ratios keep the same shape, only bigger or smaller.",
      explanation: [
        "If every part of a ratio is multiplied or divided by the same number, the ratio stays equivalent. This is useful for recipes, maps and scale drawings.",
        "The key is that every part must change in the same way."
      ],
      steps: [
        "Spot the scale factor from one part.",
        "Apply the same scale factor to the other part or parts.",
        "Check the order stays the same.",
        "Make sure the final values are sensible."
      ],
      tips: [
        "2:3 can grow to 4:6, 6:9 or 10:15.",
        "Scaling up and scaling down both work.",
        "Recipe questions often hide the ratio inside the ingredients."
      ],
      examples: [
        { title: "Scaling up", text: "If red:blue = 2:3, then 8 red needs 12 blue because the scale factor is 4." },
        { title: "Recipe", text: "If a recipe for 2 people uses 3 cups of flour, then for 4 people it needs 6 cups." }
      ],
      visualLabel: "A scaling card showing equivalent ratios growing by the same factor.",
      visual: createStudyVisualCard({ emoji: "📈", title: "Scale together", subtitle: "Every part changes the same way", chips: ["2:3", "×2", "4:6", "Same proportion"], accent: "#22c55e" })
    },
    {
      title: "Proportion Problems",
      summary: "Some ratio questions are hidden inside real-life situations.",
      explanation: [
        "Proportion questions may talk about ingredients, people, distances or money, but the same idea stays true: if one part changes, the matching part changes with it.",
        "Reading carefully helps you work out whether the numbers should go up, go down or be shared."
      ],
      steps: [
        "Underline what is being compared.",
        "Write the ratio clearly.",
        "Choose whether to share, scale or simplify.",
        "Check the final answer matches the story in the question."
      ],
      tips: [
        "Word problems become easier when you turn them into a simple ratio line.",
        "Keep units consistent.",
        "Ask yourself what one part means in the story."
      ],
      examples: [
        { title: "Paint mix", text: "If yellow:blue = 1:4 and you use 3 cups of yellow, you need 12 cups of blue." },
        { title: "Class groups", text: "If boys:girls = 3:5 in a class of 24, there are 9 boys and 15 girls." }
      ],
      visualLabel: "A proportion card showing ratio methods used in real-life situations.",
      visual: createStudyVisualCard({ emoji: "🧪", title: "Ratio in real life", subtitle: "Share, scale or simplify", chips: ["Recipe", "Class", "Paint", "Map"], accent: "#ef4444" })
    }
  ]
});
