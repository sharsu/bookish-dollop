registerStudyGuide({
  topic: "Ratio",
  icon: "⚖️",
  summary: "Ratio helps you compare amounts and keep them in the same proportion.",
  intro: "The big idea is that when one part changes, the other parts must change in step.",
  keyIdea: "Keep the order and scale every part in the same way.",
  visualLabel: "A full-width ratio overview visual mapping the main ratio methods in this topic.",
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
        "The worked example below shows the exact simplification move: divide every part by the same highest common factor and keep the order unchanged.",
        "To simplify a ratio, divide every part by the same highest common factor. This is similar to simplifying a fraction, but each part must stay in order."
      ],
      steps: [
        "Write the quantities in the correct order from the question.",
        "Convert units if needed so all parts are measuring the same kind of thing.",
        "Find the highest common factor of all the parts.",
        "Divide every part by that same number."
      ],
      tips: [
        "Always keep the order the same.",
        "Ratios can be simplified like fractions, but they are not written as fractions.",
        "Units must match before you compare."
      ],
      examples: [
        { title: "Writing", text: "If there are 6 red and 9 blue counters, the ratio red:blue is 6:9 because the order is red first, blue second." },
        { title: "Simplifying", text: "6:9 simplifies to 2:3 because the highest common factor is 3 and 6 ÷ 3 = 2 while 9 ÷ 3 = 3." }
      ],
      visualLabel: "A full-width worked example showing 6:9 simplified to 2:3 by dividing both parts by 3.",
      visual: createRatioSimplifyVisual({ accent: "#f59e0b" })
    },
    {
      title: "Sharing in a Ratio",
      summary: "To share in a ratio, split the total into equal-sized parts first.",
      explanation: [
        "The bar model below shows why the parts method works: the whole amount is split into equal parts before you decide who gets how many.",
        "Once one part is known, multiply by each ratio number to find each share. This is one of the main exam methods for ratio."
      ],
      steps: [
        "Add the ratio numbers to get the total number of parts.",
        "Divide the full amount by that total to find the value of one part.",
        "Multiply one part by each ratio number to get each share.",
        "Check the shares add back to the original total."
      ],
      tips: [
        "2:3 means 5 parts altogether.",
        "Find one part before finding the shares.",
        "A final add-back check is very helpful."
      ],
      examples: [
        { title: "Parts method", text: "Share £30 in the ratio 2:3. Total parts = 2 + 3 = 5, so one part = 30 ÷ 5 = 6. The shares are 2 × 6 = 12 and 3 × 6 = 18." },
        { title: "Three-way share", text: "Share 48 in the ratio 1:2:3. Total parts = 6, so one part = 8. The shares are 8, 16 and 24." }
      ],
      visualLabel: "A full-width bar model showing £30 shared in the ratio 2:3 using 5 equal parts.",
      visual: createRatioPartsVisual({ accent: "#0ea5e9" })
    },
    {
      title: "Equivalent Ratios & Scaling",
      summary: "Equivalent ratios keep the same shape, only bigger or smaller.",
      explanation: [
        "The visual below shows the scaling idea directly: if one part is multiplied by 4, the matching part must also be multiplied by 4.",
        "Scaling is useful for recipes, maps and models. If one part changes by a factor of 4, every other part must also change by a factor of 4."
      ],
      steps: [
        "Compare one known part with its matching part to find the scale factor.",
        "Multiply or divide every other part by the same factor.",
        "Keep the ratio order unchanged.",
        "Check the new ratio still simplifies back to the original ratio."
      ],
      tips: [
        "2:3 can grow to 4:6, 6:9 or 10:15.",
        "Scaling up and scaling down both work.",
        "Recipe questions often hide the ratio inside the ingredients."
      ],
      examples: [
        { title: "Scaling up", text: "If red:blue = 2:3 and red becomes 8, the scale factor is 4, so blue becomes 3 × 4 = 12." },
        { title: "Scaling down", text: "If 15:20 is simplified, divide both parts by 5 to get 3:4. This shows the same ratio at a smaller scale." }
      ],
      visualLabel: "A full-width ratio-scaling example showing 2:3 scaled by a factor of 4 to become 8:12.",
      visual: createRatioScaleVisual({ accent: "#22c55e" })
    },
    {
      title: "Proportion Problems",
      summary: "Some ratio questions are hidden inside real-life situations.",
      explanation: [
        "The worked example below shows the unitary method in a straight line: find 1 first, then multiply up to the target amount.",
        "Direct proportion means one quantity changes in step with another, so the ratio stays constant. In simple language, 'double one, double the other' is often the clue."
      ],
      steps: [
        "Underline the two quantities being linked.",
        "Choose unitary method, sharing, or scaling depending on the story.",
        "If using unitary method, find the value of one unit first, then multiply to the target amount.",
        "Check the final answer matches the size and units in the question."
      ],
      tips: [
        "Word problems become easier when you turn them into a simple ratio line.",
        "Keep units consistent.",
        "Ask yourself what one part means in the story."
      ],
      examples: [
        { title: "Unitary method", text: "If 5 books cost £20, then 1 book costs 20 ÷ 5 = £4, so 7 books cost 7 × 4 = £28." },
        { title: "Proportion", text: "If boys:girls = 3:5 in a class of 24, total parts = 8, so one part = 24 ÷ 8 = 3. Boys = 9 and girls = 15." }
      ],
      visualLabel: "A full-width unitary-method example showing 5 books for £20 reduced to 1 book, then scaled to 7 books.",
      visual: createRatioUnitaryVisual({ accent: "#ef4444" })
    }
  ]
});
