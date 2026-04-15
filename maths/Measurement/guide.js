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
        "Measurement begins with choosing a sensible unit: mm and cm for small lengths, m and km for larger lengths, g and kg for mass, and ml and l for capacity. The chosen unit should fit the size of the object.",
        "Estimating gives a rough target. If your exact answer is wildly different from the estimate, it usually means the wrong unit or the wrong conversion has been used."
      ],
      steps: [
        "Read the question and identify whether it is length, mass, capacity, time or area.",
        "Choose the unit that best matches the size of the object.",
        "Make a rough estimate before doing exact work.",
        "Check the final answer is sensible in that unit."
      ],
      tips: [
        "Use small units for small objects.",
        "Use larger units for long distances or heavy masses.",
        "An estimate can save you from an impossible answer."
      ],
      examples: [
        { title: "Length", text: "A classroom is measured in metres because centimetres would give an awkwardly large number such as 700 cm instead of 7 m." },
        { title: "Estimate", text: "A pencil is about 15 cm long, so an answer of 15 m would clearly be unreasonable." }
      ],
      visualLabel: "A units card showing sensible units for common measurements.",
      visual: createStudyVisualCard({ emoji: "📏", title: "Pick the right unit", subtitle: "Small things use small units", chips: ["cm", "m", "km", "Estimate"], accent: "#06b6d4" })
    },
    {
      title: "Converting Units",
      summary: "Unit conversion is really about changing scale while keeping the same amount.",
      explanation: [
        "Converting units changes the size of the unit but not the amount being measured. Key rules include 10 mm = 1 cm, 100 cm = 1 m, 1000 m = 1 km, 1000 g = 1 kg and 1000 ml = 1 l.",
        "Area and volume conversions are stronger versions of length conversions. For example, 1 m² = 10,000 cm² because both length dimensions scale by 100."
      ],
      steps: [
        "Write the starting measurement clearly.",
        "Choose the correct unit fact, such as 100 cm = 1 m.",
        "Divide when moving to a larger unit and multiply when moving to a smaller unit.",
        "Write the converted answer with the new unit."
      ],
      tips: [
        "100 cm = 1 m.",
        "1000 m = 1 km.",
        "1000 g = 1 kg and 1000 ml = 1 litre."
      ],
      examples: [
        { title: "Length", text: "250 cm = 250 ÷ 100 = 2.5 m because 100 cm = 1 m." },
        { title: "Area", text: "3 m² = 3 × 10,000 = 30,000 cm² because each square metre contains 10,000 square centimetres." }
      ],
      visualLabel: "A conversion card showing common measurement links.",
      visual: createStudyVisualCard({ emoji: "🔄", title: "Convert units", subtitle: "Same amount, different unit", chips: ["100 cm = 1 m", "1000 m = 1 km", "1000 g = 1 kg", "1000 ml = 1 l"], accent: "#0ea5e9" })
    },
    {
      title: "Perimeter & Area",
      summary: "Perimeter is the distance around a shape. Area is the space inside it.",
      explanation: [
        "Perimeter means the total length around a shape, so you add the outside edges. Area measures the surface inside a shape, so formulas depend on the shape type.",
        "Important formulas include rectangle area = length × width, triangle area = 1/2 × base × height, and rectangle perimeter = 2(length + width). Units for area must be squared, such as cm²."
      ],
      steps: [
        "Check whether the question asks for perimeter or area.",
        "Label all known side lengths or the base and height.",
        "For perimeter, add edge lengths or use a perimeter formula.",
        "For area, choose the correct shape formula and include squared units."
      ],
      tips: [
        "Perimeter uses units like cm or m.",
        "Area uses square units like cm².",
        "A rough sketch can stop mix-ups."
      ],
      examples: [
        { title: "Rectangle", text: "A rectangle with length 5 cm and width 3 cm has perimeter 2(5 + 3) = 16 cm and area 5 × 3 = 15 cm²." },
        { title: "Triangle", text: "A triangle with base 8 cm and height 5 cm has area 1/2 × 8 × 5 = 20 cm²." }
      ],
      visualLabel: "A shape card showing the difference between perimeter and area.",
      visual: createStudyVisualCard({ emoji: "⬛", title: "Perimeter or area?", subtitle: "Around or inside?", chips: ["Add edges", "Inside space", "cm", "cm²"], accent: "#f59e0b" })
    },
    {
      title: "Reading Scales & Timetables",
      summary: "Measurement also means reading information carefully from scales, rulers and clocks.",
      explanation: [
        "Some measurement questions are really scale-reading questions. The key method is to work out the value of one small division before you try to read the marked point.",
        "This method also works with timetables and clocks. You find the interval between labelled marks, divide if needed, then read the exact position."
      ],
      steps: [
        "Locate two labelled marks on the scale.",
        "Find the difference between them and count the equal gaps.",
        "Divide to find the value of one gap.",
        "Read the required mark and include the correct unit or time."
      ],
      tips: [
        "The tiny marks matter.",
        "Do not guess from the picture alone.",
        "Always include the correct unit in your answer."
      ],
      examples: [
        { title: "Scale", text: "If 0 and 10 have five equal gaps, each gap is worth 10 ÷ 5 = 2, so the third gap after 0 shows 6." },
        { title: "Ruler", text: "If each small mark is 1 mm, then six small marks after 4 cm gives 4 cm 6 mm = 4.6 cm." }
      ],
      visualLabel: "A reading-scales card showing marked intervals and small steps.",
      visual: createStudyVisualCard({ emoji: "📐", title: "Read the scale", subtitle: "Find one step first", chips: ["Labels", "Equal gaps", "One step", "Then read"], accent: "#22c55e" })
    }
  ]
});
