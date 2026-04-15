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
        "Logic clues often hide strict rules inside small words such as not, exactly, before, after, either and only. These words control what is possible and what is impossible.",
        "A good logic solver translates each clue into a clear rule. For example, 'Ben is not first' becomes 'cross out first for Ben', and 'A is taller than B' becomes a ranking rule A > B."
      ],
      steps: [
        "Read one clue at a time instead of trying to remember them all at once.",
        "Underline the rule words such as not, before, after and exactly.",
        "Rewrite the clue as a short note or symbol if that helps.",
        "Use the clue immediately in your grid, list or order line."
      ],
      tips: [
        "Do not trust memory when there are several clues.",
        "A negative clue can be very powerful.",
        "Short notes help keep the puzzle organised."
      ],
      examples: [
        { title: "Order clue", text: "If Ben finishes before Ali, then Ali cannot be ahead of Ben in any valid order. This is an order rule, not a guess." },
        { title: "Negative clue", text: "If Sam is not wearing blue, mark a cross in the Sam-blue box immediately because that option is impossible." }
      ],
      visualLabel: "A clue-reading card showing key words highlighted.",
      visual: createStudyVisualCard({ emoji: "🔍", title: "Read the clue", subtitle: "Little words matter", chips: ["not", "before", "after", "only"], accent: "#f43f5e" })
    },
    {
      title: "Elimination Tables",
      summary: "A table can help you organise what is possible and what is impossible.",
      explanation: [
        "An elimination grid is a logic tool, not just a drawing. Ticks show certain matches and crosses show impossible matches. When one option becomes certain, other options in the same row or column can often be crossed out.",
        "This is a form of deduction: if one box must be true, some others must be false. The table helps you see that chain clearly."
      ],
      steps: [
        "Draw a grid with one category along the top and one down the side.",
        "Add crosses for impossible matches as soon as a clue gives them.",
        "Add a tick when a match becomes certain.",
        "Use each new tick or cross to force more eliminations."
      ],
      tips: [
        "A neat grid can save a messy puzzle.",
        "One definite answer can remove several wrong choices.",
        "Keep the table tidy enough to read at a glance."
      ],
      examples: [
        { title: "Single match rule", text: "If Ava wears red and each colour is used once, tick Ava-red and cross out red for everyone else and Ava's other colours." },
        { title: "Impossible match", text: "If Max does not own the rabbit, mark a cross in Max-rabbit straight away. This removes one possibility from the grid." }
      ],
      visualLabel: "A logic-grid card showing ticks and crosses used to solve clues.",
      visual: createStudyVisualCard({ emoji: "☑️", title: "Use a grid", subtitle: "Tick what fits, cross what does not", chips: ["Grid", "Tick", "Cross", "Update clues"], accent: "#0ea5e9" })
    },
    {
      title: "Ordering and Ranking Problems",
      summary: "Some logic puzzles ask you to place people or objects in the correct order.",
      explanation: [
        "Ordering puzzles use comparison rules such as before, after, taller than or next to. A very useful logical rule is transitive reasoning: if A is before B and B is before C, then A is before C.",
        "Instead of guessing the whole order, place the fixed clues first and let the chain of comparisons build the rest."
      ],
      steps: [
        "Draw blank spaces for the available positions.",
        "Place any clue that gives an exact position first.",
        "Use before/after or taller/shorter clues to narrow the remaining spaces.",
        "Check the final arrangement against every clue, including indirect ones."
      ],
      tips: [
        "Start with the most fixed clue.",
        "A clue about first or last is very useful.",
        "Final checking is essential in ordering puzzles."
      ],
      examples: [
        { title: "Race order", text: "If Mia finishes before Ben and Ben before Sam, transitive reasoning shows Mia must also finish before Sam." },
        { title: "Height order", text: "If A is taller than B and B is taller than C, then the height order is A, B, C from tallest to shortest." }
      ],
      visualLabel: "An ordering card showing positions filled step by step.",
      visual: createStudyVisualCard({ emoji: "🏁", title: "Build the order", subtitle: "Place the sure clues first", chips: ["1st", "2nd", "3rd", "Check all clues"], accent: "#f59e0b" })
    },
    {
      title: "Pattern and Rule Logic",
      summary: "Some logic questions are about spotting the hidden rule behind numbers, shapes or symbols.",
      explanation: [
        "Pattern logic asks you to find the invariant, which is what stays the same, and the variable, which is what changes. The change may be in shape, rotation, colour, number, position or a mixture of these.",
        "A strong method is to test one rule at a time. If a rule fails on even one step, reject it and try another. This is logical checking, not guessing."
      ],
      steps: [
        "Look for one clear change such as rotation, shading, number pattern or movement.",
        "Check whether the change repeats, grows or alternates.",
        "Test the proposed rule on more than one step.",
        "Choose the option that fits every part of the rule, not just one clue."
      ],
      tips: [
        "Patterns can change by rotation, colour, number or shape.",
        "If one idea only works once, it may not be the real rule.",
        "Use elimination if two answers look similar."
      ],
      examples: [
        { title: "Shape pattern", text: "If a shape rotates 90 degrees clockwise each time, the next picture must be another 90-degree clockwise turn from the last one." },
        { title: "Number pattern", text: "If the differences are +2, +4, +6, the next difference is +8, so after 15 the next term is 23." }
      ],
      visualLabel: "A pattern logic card showing a repeating rule being tested.",
      visual: createStudyVisualCard({ emoji: "🔁", title: "Find the rule", subtitle: "What changes and what stays the same?", chips: ["Turn", "Grow", "Repeat", "Test"], accent: "#22c55e" })
    }
  ]
});
