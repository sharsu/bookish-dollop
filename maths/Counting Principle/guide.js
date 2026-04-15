registerStudyGuide({
  topic: "Counting Principle",
  icon: "🌳",
  summary: "Counting Principle questions are about working through stages and multiplying choices carefully.",
  intro: "This topic looks simple at first, but the important skill is noticing when choices are independent and when rules or restrictions change the count.",
  keyIdea: "Multiply the number of choices at each stage, but only after checking the rules carefully.",
  visualLabel: "A branching counting principle diagram showing choices multiplying together.",
  visual: createCountingVisual({
    first: "3 first choices",
    second: "5 next choices",
    total: "3 × 5 = 15 ways"
  }),
  concepts: [
    {
      title: "Stages and Multiplication",
      summary: "When a task happens in stages, multiply the number of choices at each stage.",
      explanation: [
        "The counting principle says that if one choice can happen in a certain number of ways and the next choice can happen in another number of ways, the total number of outcomes is found by multiplying.",
        "This works because every first choice can pair with every second choice."
      ],
      steps: [
        "Break the problem into stages.",
        "Count the choices at each stage.",
        "Multiply the stage counts together.",
        "Check that you have included every stage."
      ],
      tips: [
        "Think: first choice, then next choice.",
        "Do not add if the choices are happening one after another.",
        "A quick table or sketch can help."
      ],
      examples: [
        { title: "Outfits", text: "If there are 3 tops and 4 skirts, there are 3 × 4 = 12 outfits." },
        { title: "Meals", text: "If you choose 1 starter from 2 and 1 main from 5, there are 10 possible meals." }
      ],
      visualLabel: "A branching card showing stages multiplying together.",
      visual: createCountingVisual({ first: "3 first choices", second: "4 next choices", total: "3 × 4 = 12 ways" })
    },
    {
      title: "Tree Diagrams",
      summary: "Tree diagrams help you see the stages and make sure you do not miss any outcomes.",
      explanation: [
        "A tree diagram draws each choice as a branch. This makes it easier to count outcomes and check whether your multiplication matches the picture.",
        "They are especially helpful for children who like to see the choices rather than only think about the numbers."
      ],
      steps: [
        "Draw the first set of choices as branches.",
        "From each branch, draw the next stage of choices.",
        "Count the final outcomes or multiply the branches per stage.",
        "Check the tree is complete."
      ],
      tips: [
        "Every branch at one stage should lead to all the options at the next stage unless a rule stops it.",
        "Use a tree diagram when the choices feel confusing.",
        "Complete diagrams stop missed outcomes."
      ],
      examples: [
        { title: "Ice cream tree", text: "If there are 2 cone choices and 3 toppings, the tree ends with 6 final branches." },
        { title: "Checking", text: "If your tree has 8 end branches, your total should also be 8." }
      ],
      visualLabel: "A tree diagram card showing branches for each choice stage.",
      visual: createStudyVisualCard({ emoji: "🌳", title: "Draw the branches", subtitle: "See every path clearly", chips: ["Stage 1", "Stage 2", "End branches", "Count safely"], accent: "#14b8a6" })
    },
    {
      title: "Restrictions and Rules",
      summary: "Some questions change the count by adding rules, such as no repetition or even numbers only.",
      explanation: [
        "Restrictions make counting questions more interesting. You might be told that a digit cannot repeat, that a code must end with a certain letter, or that a number must be even.",
        "These rules change the number of choices at one or more stages, so you must think carefully before multiplying."
      ],
      steps: [
        "Read the rule carefully.",
        "Decide which stage the rule changes.",
        "Adjust the number of choices at that stage.",
        "Then multiply the new stage counts."
      ],
      tips: [
        "An even number must end in 0, 2, 4, 6 or 8.",
        "No repetition means a choice used once may not be available again.",
        "Fixed first or last positions are usually easiest to count first."
      ],
      examples: [
        { title: "Even number", text: "For a 3-digit even number, count the last digit from the even choices first." },
        { title: "No repetition", text: "If a code uses 4 different digits, the number of choices gets smaller after each pick." }
      ],
      visualLabel: "A counting card showing how rules change the number of choices.",
      visual: createStudyVisualCard({ emoji: "🚦", title: "Watch the rules", subtitle: "Restrictions change the count", chips: ["No repeats", "Even only", "Fixed end", "Adjust choices"], accent: "#f59e0b" })
    },
    {
      title: "Worded Counting Problems",
      summary: "Long word problems become easier when you turn them into stages.",
      explanation: [
        "Some counting questions are hidden inside stories about food, clothes, routes or school options. Even though the wording is longer, the maths idea is often still the same.",
        "The best strategy is to underline each decision and write the stages clearly."
      ],
      steps: [
        "Underline each separate choice in the story.",
        "Write the number of options for each choice.",
        "Check for restrictions or missing choices.",
        "Multiply the stage counts together."
      ],
      tips: [
        "Long wording does not always mean hard maths.",
        "Turn the story into short stage notes.",
        "Check you have not counted one stage twice."
      ],
      examples: [
        { title: "Fast-food meal", text: "If there are 3 burgers, 2 sides, 4 drinks and 2 desserts, multiply 3 × 2 × 4 × 2." },
        { title: "School options", text: "If James must choose one subject from each group, each group becomes one stage." }
      ],
      visualLabel: "A word-problem card showing long counting questions broken into stages.",
      visual: createStudyVisualCard({ emoji: "📝", title: "Turn words into stages", subtitle: "Underline each decision", chips: ["Choice 1", "Choice 2", "Choice 3", "Multiply"], accent: "#22c55e" })
    }
  ]
});
