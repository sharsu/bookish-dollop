registerStudyGuide({
  topic: "Speed",
  icon: "🚗",
  summary: "Speed questions join distance, time and unit conversion in one clear set of rules.",
  intro: "These questions get much easier when you write down what you know and match the units before you calculate.",
  keyIdea: "Distance, speed and time are linked, so if you know two of them you can find the third.",
  visualLabel: "A speed card showing the speed triangle ideas.",
  visual: createStudyVisualCard({
    emoji: "🚗",
    title: "Distance, speed, time",
    subtitle: "Match the units before solving",
    chips: ["Speed = D ÷ T", "Time = D ÷ S", "Distance = S × T", "Units matter"],
    accent: "#ef4444"
  }),
  concepts: [
    {
      title: "Speed, Distance & Time Basics",
      summary: "The three main rules tell you how fast, how far and how long.",
      explanation: [
        "Speed tells us how far something travels in a certain amount of time. Distance tells us how far it went, and time tells us how long the journey took.",
        "If you know any two of these, you can find the third using the speed triangle or the matching formula."
      ],
      steps: [
        "Write down the numbers you know.",
        "Decide whether you need speed, distance or time.",
        "Choose the correct formula.",
        "Substitute the numbers and calculate carefully."
      ],
      tips: [
        "Speed = distance ÷ time.",
        "Distance = speed × time.",
        "Time = distance ÷ speed."
      ],
      examples: [
        { title: "Find speed", text: "If a car travels 120 km in 2 hours, its speed is 60 km/h." },
        { title: "Find distance", text: "If a cyclist rides at 15 km/h for 3 hours, the distance is 45 km." }
      ],
      visualLabel: "A speed formula card showing the three linked rules.",
      visual: createStudyVisualCard({ emoji: "🚗", title: "Three linked ideas", subtitle: "Know two, find one", chips: ["Speed", "Distance", "Time", "Choose the rule"], accent: "#ef4444" })
    },
    {
      title: "Matching Units",
      summary: "Before you calculate, make sure the time and distance units fit together.",
      explanation: [
        "A speed of kilometres per hour only works neatly if the distance is in kilometres and the time is in hours. If the question uses minutes, metres or seconds, you may need to convert first.",
        "Many mistakes in speed questions happen because the calculation is right but the units are mixed up."
      ],
      steps: [
        "Read the units beside each number.",
        "Convert minutes to hours or seconds to hours if needed.",
        "Convert metres to kilometres if the speed is in km/h.",
        "Then do the main calculation."
      ],
      tips: [
        "60 minutes = 1 hour.",
        "1000 metres = 1 kilometre.",
        "Write the new unit after converting so you do not forget."
      ],
      examples: [
        { title: "Minutes to hours", text: "30 minutes is 0.5 hours, so 20 km in 30 minutes means 20 ÷ 0.5 = 40 km/h." },
        { title: "Metres to kilometres", text: "2500 m is 2.5 km." }
      ],
      visualLabel: "A units card showing common conversions used in speed questions.",
      visual: createStudyVisualCard({ emoji: "⏱️", title: "Match the units", subtitle: "Convert before you solve", chips: ["60 min = 1 h", "1000 m = 1 km", "Check units", "Then calculate"], accent: "#0ea5e9" })
    },
    {
      title: "Finding Time in Journeys",
      summary: "Time questions often need careful division and careful reading.",
      explanation: [
        "If the question asks how long a journey takes, you divide the distance by the speed. This can produce an answer in hours, so you may need to turn part of an hour into minutes.",
        "This is common in travel questions, especially when the final answer needs clock time."
      ],
      steps: [
        "Use time = distance ÷ speed.",
        "Work out the decimal or fraction of an hour.",
        "Convert the leftover part into minutes.",
        "Add it to the start time if the question asks for arrival time."
      ],
      tips: [
        "0.5 hours = 30 minutes.",
        "0.25 hours = 15 minutes.",
        "Clock-time questions often need two steps."
      ],
      examples: [
        { title: "Journey length", text: "If 90 km is travelled at 45 km/h, the journey takes 2 hours." },
        { title: "Arrival time", text: "If a journey lasts 1.5 hours and starts at 10:20, the arrival time is 11:50." }
      ],
      visualLabel: "A travel-time card showing time found from distance and speed.",
      visual: createStudyVisualCard({ emoji: "🕒", title: "Find the time", subtitle: "Divide, then convert if needed", chips: ["Distance ÷ Speed", "Hours", "Minutes", "Arrival time"], accent: "#f59e0b" })
    },
    {
      title: "Average Speed Problems",
      summary: "Average speed looks at the whole journey, not just one part of it.",
      explanation: [
        "Average speed is found by dividing the total distance by the total time. You cannot just average two speeds unless the times or distances work out in a special way.",
        "This is a very common trap, so slow down and add all the journey parts first."
      ],
      steps: [
        "Find the total distance travelled.",
        "Find the total time taken.",
        "Divide total distance by total time.",
        "Check the answer is between the slower and faster parts if that makes sense."
      ],
      tips: [
        "Average speed uses totals, not separate pieces on their own.",
        "Add all parts of the trip first.",
        "Keep the units matched all the way through."
      ],
      examples: [
        { title: "Whole journey", text: "A car travels 30 km in 1 hour and 60 km in 2 hours. Total distance is 90 km and total time is 3 hours, so average speed is 30 km/h." },
        { title: "Common mistake", text: "Do not simply average 30 and 60 unless the question really allows it." }
      ],
      visualLabel: "An average speed card showing totals used for the whole journey.",
      visual: createStudyVisualCard({ emoji: "📊", title: "Average speed", subtitle: "Use total distance and total time", chips: ["Add distances", "Add times", "Then divide", "Whole journey"], accent: "#22c55e" })
    }
  ]
});
