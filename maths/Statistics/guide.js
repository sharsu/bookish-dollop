registerStudyGuide({
  topic: "Statistics",
  icon: "📊",
  summary: "Statistics helps us collect, organise and understand data.",
  intro: "Statistics questions often ask you to read charts, compare data and find useful summary values.",
  keyIdea: "Read the data carefully before doing any calculation.",
  steps: [
    "Look at the title, labels and scale first.",
    "Choose the right method, such as mean, median, mode or range.",
    "Check that your answer matches the data shown."
  ],
  tips: [
    "Mean means total ÷ number of values.",
    "Median is the middle value when the data is ordered.",
    "Range means biggest value minus smallest value."
  ],
  tryIt: "For 3, 5, 5, 8, the mode is 5 and the range is 5.",
  visualLabel: "A statistics card showing common data skills.",
  visual: createStudyVisualCard({
    emoji: "📊",
    title: "Read the data",
    subtitle: "Then choose the right summary",
    chips: ["Mean", "Median", "Mode", "Range"],
    accent: "#0f766e"
  })
});
