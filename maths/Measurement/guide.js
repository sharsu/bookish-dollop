registerStudyGuide({
  topic: "Measurement",
  icon: "📏",
  summary: "Measurement includes units, conversions, scales and shape measures such as perimeter and area.",
  intro: "These questions reward neat reading and sensible checking, especially when the numbers look easy but the units are different.",
  keyIdea: "Choose the right unit first, then calculate carefully.",
  visualLabel: "A measurement card showing common unit links.",
  visual: createStudyVisualCard({
    emoji: "📏",
    title: "Choose the right unit",
    subtitle: "Convert carefully and estimate",
    chips: ["cm ↔ m", "g ↔ kg", "ml ↔ l", "Estimate"],
    accent: "#06b6d4"
  }),
  concepts: [
    {
      title: "Choosing Units & Estimating",
      summary: "A sensible unit makes the question easier straight away.",
      explanation: [
        "Measurement starts with choosing a suitable unit. A pencil is measured in centimetres, a road in kilometres and a drink in millilitres or litres.",
        "Estimating helps you catch silly mistakes before they grow into wrong answers."
      ],
      steps: [
        "Read what is being measured.",
        "Choose the most sensible unit.",
        "Estimate roughly before calculating.",
        "Check if the final answer sounds realistic."
      ],
      tips: [
        "Use small units for small objects.",
        "Use larger units for long distances or heavy masses.",
        "An estimate can save you from an impossible answer."
      ],
      examples: [
        { title: "Length", text: "A classroom is better measured in metres, not centimetres." },
        { title: "Mass", text: "A bag of sugar is often measured in kilograms or grams." }
      ],
      visualLabel: "A units card showing sensible units for common measurements.",
      visual: createStudyVisualCard({ emoji: "📏", title: "Pick the right unit", subtitle: "Small things use small units", chips: ["cm", "m", "km", "Estimate"], accent: "#06b6d4" })
    },
    {
      title: "Converting Units",
      summary: "Unit conversion is really about changing scale while keeping the same amount.",
      explanation: [
        "When you convert units, the amount stays the same but the way you write it changes. For example, 250 cm and 2.5 m describe the same length.",
        "Knowing the key conversions helps you move between units quickly and accurately."
      ],
      steps: [
        "Write the starting value and unit.",
        "Choose the correct conversion fact.",
        "Multiply or divide as needed.",
        "Write the new unit clearly."
      ],
      tips: [
        "100 cm = 1 m.",
        "1000 m = 1 km.",
        "1000 g = 1 kg and 1000 ml = 1 litre."
      ],
      examples: [
        { title: "Length", text: "250 cm = 2.5 m because 100 cm make 1 m." },
        { title: "Capacity", text: "1500 ml = 1.5 litres." }
      ],
      visualLabel: "A conversion card showing common measurement links.",
      visual: createStudyVisualCard({ emoji: "🔄", title: "Convert units", subtitle: "Same amount, different unit", chips: ["100 cm = 1 m", "1000 m = 1 km", "1000 g = 1 kg", "1000 ml = 1 l"], accent: "#0ea5e9" })
    },
    {
      title: "Perimeter & Area",
      summary: "Perimeter is the distance around a shape. Area is the space inside it.",
      explanation: [
        "Children often mix up perimeter and area because both use measurements from shapes. Perimeter adds the edges, while area measures the inside surface.",
        "Draw or label the shape clearly before starting so you know which measure the question is asking for."
      ],
      steps: [
        "Check whether the question asks for perimeter or area.",
        "Label the lengths you know.",
        "For perimeter, add the outside edges.",
        "For area of a rectangle, multiply length by width."
      ],
      tips: [
        "Perimeter uses units like cm or m.",
        "Area uses square units like cm².",
        "A rough sketch can stop mix-ups."
      ],
      examples: [
        { title: "Perimeter", text: "A rectangle with sides 5 cm and 3 cm has perimeter 16 cm." },
        { title: "Area", text: "The same rectangle has area 15 cm²." }
      ],
      visualLabel: "A shape card showing the difference between perimeter and area.",
      visual: createStudyVisualCard({ emoji: "⬛", title: "Perimeter or area?", subtitle: "Around or inside?", chips: ["Add edges", "Inside space", "cm", "cm²"], accent: "#f59e0b" })
    },
    {
      title: "Reading Scales & Timetables",
      summary: "Measurement also means reading information carefully from scales, rulers and clocks.",
      explanation: [
        "Not every measurement question needs a formula. Some ask you to read a scale, ruler, thermometer or timetable accurately.",
        "The secret is to find what each small division is worth before reading the answer."
      ],
      steps: [
        "Find the labelled marks first.",
        "Count how many small steps fit between them.",
        "Work out the value of one step.",
        "Read the point carefully and include the unit."
      ],
      tips: [
        "The tiny marks matter.",
        "Do not guess from the picture alone.",
        "Always include the correct unit in your answer."
      ],
      examples: [
        { title: "Scale", text: "If 0 and 10 have five equal gaps, each gap is worth 2." },
        { title: "Ruler", text: "A line ending at the sixth small mark after 4 cm measures 4.6 cm if each mark is one millimetre." }
      ],
      visualLabel: "A reading-scales card showing marked intervals and small steps.",
      visual: createStudyVisualCard({ emoji: "📐", title: "Read the scale", subtitle: "Find one step first", chips: ["Labels", "Equal gaps", "One step", "Then read"], accent: "#22c55e" })
    }
  ]
});
