registerStudyGuide({
  topic: "Measurement",
  icon: "📏",
  summary: "Measurement helps us describe length, mass, capacity, area and more.",
  intro: "Measurement questions ask you to choose sensible units, read scales and convert between units accurately.",
  keyIdea: "Pick the right unit, then check if a conversion is needed.",
  steps: [
    "Read the scale or unit carefully.",
    "Write the conversion you need before calculating.",
    "Ask yourself if the answer sounds sensible in real life."
  ],
  tips: [
    "100 cm = 1 m and 1000 m = 1 km.",
    "1000 g = 1 kg and 1000 ml = 1 litre.",
    "A rough estimate can help you spot a silly mistake."
  ],
  tryIt: "250 cm is the same as 2.5 m because 100 cm make 1 m.",
  visualLabel: "A measurement card showing common unit links.",
  visual: createStudyVisualCard({
    emoji: "📏",
    title: "Choose the right unit",
    subtitle: "Convert carefully and estimate",
    chips: ["cm ↔ m", "g ↔ kg", "ml ↔ l", "Estimate"],
    accent: "#06b6d4"
  })
});
