registerStudyGuide({
  topic: "Logic",
  icon: "🧩",
  summary: "Logic is about using clues, spotting what must be true and ruling out what cannot work.",
  intro: "These questions are less about calculation and more about organised thinking.",
  keyIdea: "Go step by step and let the clues do the work.",
  visualLabel: "A logic card showing clue, rule out and check.",
  visual: createStudyVisualCard({
    emoji: "🧩",
    title: "Use the clues",
    subtitle: "Rule out what cannot work",
    chips: ["Read", "Rule out", "Check again", "One answer"],
    accent: "#f43f5e"
  }),
  concepts: [
    {
      title: "Reading Clues Carefully",
      summary: "The first skill in logic is understanding exactly what each clue says.",
      explanation: [
        "Logic clues may sound simple, but one small word can change the whole puzzle. Words like before, after, not, only and exactly matter a lot.",
        "Reading slowly at the start often saves a lot of confusion later."
      ],
      steps: [
        "Read one clue at a time.",
        "Underline key words like not, before or only.",
        "Rewrite the clue in simpler words if helpful.",
        "Keep the clue visible while you solve."
      ],
      tips: [
        "Do not trust memory when there are several clues.",
        "A negative clue can be very powerful.",
        "Short notes help keep the puzzle organised."
      ],
      examples: [
        { title: "Order clue", text: "If Ben finishes before Ali, then Ali cannot be first if Ben is also in the race." },
        { title: "Negative clue", text: "If Sam is not wearing blue, you can cross blue off for Sam straight away." }
      ],
      visualLabel: "A clue-reading card showing key words highlighted.",
      visual: createStudyVisualCard({ emoji: "🔍", title: "Read the clue", subtitle: "Little words matter", chips: ["not", "before", "after", "only"], accent: "#f43f5e" })
    },
    {
      title: "Elimination Tables",
      summary: "A table can help you organise what is possible and what is impossible.",
      explanation: [
        "Many logic puzzles become easier when you draw a grid or table. You can tick what must be true and cross what cannot be true.",
        "This stops you carrying too much in your head and makes patterns easier to spot."
      ],
      steps: [
        "Draw the categories in a simple grid.",
        "Add ticks for certain matches.",
        "Add crosses for impossible matches.",
        "Use new information from each clue to update the table."
      ],
      tips: [
        "A neat grid can save a messy puzzle.",
        "One definite answer can remove several wrong choices.",
        "Keep the table tidy enough to read at a glance."
      ],
      examples: [
        { title: "Clothing puzzle", text: "If Ava wears red, cross out red for everyone else if each colour can only be used once." },
        { title: "Pet puzzle", text: "If Max does not own the rabbit, mark that box with a cross immediately." }
      ],
      visualLabel: "A logic-grid card showing ticks and crosses used to solve clues.",
      visual: createStudyVisualCard({ emoji: "☑️", title: "Use a grid", subtitle: "Tick what fits, cross what does not", chips: ["Grid", "Tick", "Cross", "Update clues"], accent: "#0ea5e9" })
    },
    {
      title: "Ordering and Ranking Problems",
      summary: "Some logic puzzles ask you to place people or objects in the correct order.",
      explanation: [
        "These puzzles may be about races, heights, birthdays or positions in a line. The clues tell you who is before, after, taller, shorter or next to someone else.",
        "The best method is often to build the order gradually instead of trying to guess the full answer at once."
      ],
      steps: [
        "Draw spaces for the positions.",
        "Place any clues that are certain first.",
        "Use before/after clues to narrow the remaining spots.",
        "Check the final order against every clue."
      ],
      tips: [
        "Start with the most fixed clue.",
        "A clue about first or last is very useful.",
        "Final checking is essential in ordering puzzles."
      ],
      examples: [
        { title: "Race order", text: "If Mia finishes before Ben and Ben before Sam, then Mia must be ahead of Sam too." },
        { title: "Height order", text: "If A is taller than B and B taller than C, then A is tallest of the three." }
      ],
      visualLabel: "An ordering card showing positions filled step by step.",
      visual: createStudyVisualCard({ emoji: "🏁", title: "Build the order", subtitle: "Place the sure clues first", chips: ["1st", "2nd", "3rd", "Check all clues"], accent: "#f59e0b" })
    },
    {
      title: "Pattern and Rule Logic",
      summary: "Some logic questions are about spotting the hidden rule behind numbers, shapes or symbols.",
      explanation: [
        "Pattern logic asks you to notice what changes and what stays the same. The rule might involve shape, size, direction, number or position.",
        "These questions reward calm observation more than rushing."
      ],
      steps: [
        "Look for one thing changing at a time.",
        "Check whether the pattern repeats or grows.",
        "Test your idea against more than one example.",
        "Choose the answer that matches the full rule."
      ],
      tips: [
        "Patterns can change by rotation, colour, number or shape.",
        "If one idea only works once, it may not be the real rule.",
        "Use elimination if two answers look similar."
      ],
      examples: [
        { title: "Shape pattern", text: "If a shape turns 90° each time, the next picture must show the same next turn." },
        { title: "Number pattern", text: "If the differences are +2, +4, +6, the next jump should be +8." }
      ],
      visualLabel: "A pattern logic card showing a repeating rule being tested.",
      visual: createStudyVisualCard({ emoji: "🔁", title: "Find the rule", subtitle: "What changes and what stays the same?", chips: ["Turn", "Grow", "Repeat", "Test"], accent: "#22c55e" })
    }
  ]
});
