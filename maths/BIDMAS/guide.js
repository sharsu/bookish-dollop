registerStudyGuide({
  topic: "BIDMAS",
  icon: "🧮",
  summary: "BIDMAS tells you the order for solving calculations.",
  intro: "When a calculation has different operations, BIDMAS helps everyone solve it in the same order.",
  keyIdea: "Work through the calculation in the correct order instead of left to right every time.",
  steps: [
    "Do brackets first.",
    "Then indices, division and multiplication.",
    "Finish with addition and subtraction."
  ],
  tips: [
    "Division and multiplication are on the same level, so work left to right.",
    "Addition and subtraction are also on the same level.",
    "Rewrite one neat line at a time so you do not lose track."
  ],
  tryIt: "For 3 + 4 × 2, multiply first to get 8, then add 3 to make 11.",
  visualLabel: "A BIDMAS card listing the order of operations.",
  visual: createStudyVisualCard({
    emoji: "🧮",
    title: "Order matters",
    subtitle: "Brackets first, then multiply and divide",
    chips: ["Brackets", "Indices", "÷ and ×", "+ and −"],
    accent: "#8b5cf6"
  })
});
