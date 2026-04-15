registerStudyGuide({
  topic: "Speed",
  icon: "🚗",
  summary: "Speed tells us how fast something is moving.",
  intro: "Speed links three ideas: distance, time and how quickly something travels.",
  keyIdea: "Use the speed triangle to remember which operation to use.",
  steps: [
    "Write down the distance and time with units.",
    "Choose the correct formula: speed = distance ÷ time.",
    "Make sure your units match before you calculate."
  ],
  tips: [
    "If you need time, use time = distance ÷ speed.",
    "If you need distance, use distance = speed × time.",
    "Convert minutes to hours when the units need it."
  ],
  tryIt: "If a car travels 120 km in 2 hours, its speed is 60 km/h.",
  visualLabel: "A speed card showing the speed triangle ideas.",
  visual: createStudyVisualCard({
    emoji: "🚗",
    title: "Distance, speed, time",
    subtitle: "Match the units before solving",
    chips: ["Speed = D ÷ T", "Time = D ÷ S", "Distance = S × T", "Units matter"],
    accent: "#ef4444"
  })
});
