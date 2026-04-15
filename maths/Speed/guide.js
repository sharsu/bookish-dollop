registerStudyGuide({
  topic: "Speed",
  icon: "🚗",
  summary: "Speed questions join distance, time and unit conversion in one clear set of rules.",
  intro: "These questions get much easier when you write down what you know and match the units before you calculate.",
  keyIdea: "Distance, speed and time are linked, so if you know two of them you can find the third.",
  visualLabel: "A full-width speed overview visual mapping the main distance-speed-time ideas in this topic.",
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
        "The triangle below shows the three linked formulas in one picture. Cover the letter you need to find, and the remaining letters show whether to multiply or divide.",
        "Choose the formula that puts the unknown on its own. If you know two values, substitute them carefully with their units and solve for the third."
      ],
      steps: [
        "Write the known distance, speed and time values with their units.",
        "Decide which of the three formulas matches the unknown.",
        "Substitute the values into the formula.",
        "Calculate and write the answer with the correct compound unit, such as km/h or m/s."
      ],
      tips: [
        "Speed = distance ÷ time.",
        "Distance = speed × time.",
        "Time = distance ÷ speed."
      ],
      examples: [
        { title: "Find speed", text: "Use speed = distance ÷ time. For 120 km in 2 h, speed = 120 ÷ 2 = 60 km/h." },
        { title: "Find distance", text: "Use distance = speed × time. For 15 km/h over 3 h, distance = 15 × 3 = 45 km." }
      ],
      visualLabel: "A full-width distance-speed-time triangle showing how to choose the correct formula.",
      visual: createSpeedFormulaVisual({ accent: "#ef4444" })
    },
    {
      title: "Matching Units",
      summary: "Before you calculate, make sure the time and distance units fit together.",
      explanation: [
        "The examples below show the two most common unit fixes: turning minutes into hours and turning m/s into km/h.",
        "Two especially useful conversion rules are 1 hour = 3600 seconds and 1 kilometre = 1000 metres. From these, 1 m/s = 3.6 km/h and 1 km/h = 5/18 m/s."
      ],
      steps: [
        "Read the unit on every number before starting the formula.",
        "Convert time units so they match the speed unit, such as minutes to hours or hours to seconds.",
        "Convert distance units so they match too, such as metres to kilometres.",
        "Only then use the speed-distance-time formula."
      ],
      tips: [
        "60 minutes = 1 hour.",
        "1000 metres = 1 kilometre.",
        "Write the new unit after converting so you do not forget."
      ],
      examples: [
        { title: "Minutes to hours", text: "30 minutes = 30/60 h = 0.5 h. So 20 km in 30 minutes gives speed = 20 ÷ 0.5 = 40 km/h." },
        { title: "m/s to km/h", text: "12 m/s = 12 × 3.6 = 43.2 km/h because 1 m/s = 3.6 km/h." }
      ],
      visualLabel: "A full-width unit-conversion example showing minutes changed to hours and m/s changed to km/h.",
      visual: createSpeedUnitsVisual({ accent: "#0ea5e9" })
    },
    {
      title: "Finding Time in Journeys",
      summary: "Time questions often need careful division and careful reading.",
      explanation: [
        "The journey timeline below shows how a decimal time answer is turned into hours and minutes, then added to the start time.",
        "Clock-time questions use the same maths but add one more step: once you know the journey length, add it to the start time."
      ],
      steps: [
        "Use time = distance ÷ speed.",
        "Write the answer in hours first.",
        "Convert any decimal part of an hour into minutes using ×60.",
        "If needed, add the journey time to the start time to find the finishing clock time."
      ],
      tips: [
        "0.5 hours = 30 minutes.",
        "0.25 hours = 15 minutes.",
        "Clock-time questions often need two steps."
      ],
      examples: [
        { title: "Journey length", text: "Time = 90 ÷ 45 = 2, so the journey takes 2 hours." },
        { title: "Decimal hours", text: "If time = 75 ÷ 50 = 1.5 h, that is 1 hour and 0.5 × 60 = 30 minutes, so the journey lasts 1 h 30 min." }
      ],
      visualLabel: "A full-width journey timeline showing 1.5 hours split into 1 hour and 30 minutes before finding arrival time.",
      visual: createSpeedTimelineVisual({ accent: "#f59e0b" })
    },
    {
      title: "Average Speed Problems",
      summary: "Average speed looks at the whole journey, not just one part of it.",
      explanation: [
        "The worked example below shows why average speed uses total distance and total time, not a quick average of the two speeds.",
        "A common trap is to average the separate speeds directly. That only works in special cases, so the safe method is always total distance over total time."
      ],
      steps: [
        "Add all distances travelled.",
        "Add all times taken, making sure units match.",
        "Use average speed = total distance ÷ total time.",
        "Check whether the answer is sensible for the journey as a whole."
      ],
      tips: [
        "Average speed uses totals, not separate pieces on their own.",
        "Add all parts of the trip first.",
        "Keep the units matched all the way through."
      ],
      examples: [
        { title: "Whole journey", text: "A car travels 30 km in 1 h and 60 km in 2 h. Total distance = 90 km and total time = 3 h, so average speed = 90 ÷ 3 = 30 km/h." },
        { title: "Why not average the speeds?", text: "If one stage is 20 km/h and another is 60 km/h, do not just say 40 km/h. First add the total distance and total time, then divide." }
      ],
      visualLabel: "A full-width worked example showing two journey stages combined before calculating average speed.",
      visual: createSpeedAverageVisual({ accent: "#22c55e" })
    }
  ]
});
