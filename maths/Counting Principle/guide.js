registerStudyGuide({
  topic: "Counting Principle",
  icon: "🌳",
  summary: "Multiply the choices at each stage to find the total number of outcomes.",
  intro: "If one choice can be made in a few ways and the next choice can also be made in a few ways, you can multiply the choices to find the total.",
  keyIdea: "When the stages are independent, multiply the number of choices at each stage.",
  steps: [
    "Split the problem into stages.",
    "Count how many choices there are at each stage.",
    "Multiply the choices together to find the total."
  ],
  tips: [
    "A tree diagram can help you see the stages clearly.",
    "Check whether choices can repeat or not.",
    "Restrictions like even numbers or fixed letters change the count."
  ],
  tryIt: "If there are 3 tops and 4 skirts, there are 3 × 4 = 12 outfits.",
  visualLabel: "A branching counting principle diagram showing choices multiplying together.",
  visual: createCountingVisual({
    first: "3 first choices",
    second: "5 next choices",
    total: "3 × 5 = 15 ways"
  })
});
