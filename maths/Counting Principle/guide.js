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
        "The counting principle says total outcomes = choices at stage 1 × choices at stage 2 × choices at stage 3 and so on. This works because every choice at one stage can pair with every allowed choice at the next stage.",
        "This is the main rule behind outfit questions, menu questions and code-making questions. If the stages are separate, multiplication is usually the correct tool."
      ],
      steps: [
        "Split the problem into clear stages.",
        "Count the allowed choices at each stage.",
        "Multiply the stage counts together.",
        "Check no stage has been forgotten or counted twice."
      ],
      tips: [
        "Think: first choice, then next choice.",
        "Do not add if the choices are happening one after another.",
        "A quick table or sketch can help."
      ],
      examples: [
        { title: "Outfits", text: "If there are 3 tops and 4 skirts, total outfits = 3 × 4 = 12 because each top can go with each skirt." },
        { title: "Meals", text: "With 2 starters, 5 mains and 3 desserts, the number of meals is 2 × 5 × 3 = 30." }
      ],
      visualLabel: "A branching card showing stages multiplying together.",
      visual: createCountingVisual({ first: "3 first choices", second: "4 next choices", total: "3 × 4 = 12 ways" })
    },
    {
      title: "Tree Diagrams",
      summary: "Tree diagrams help you see the stages and make sure you do not miss any outcomes.",
      explanation: [
        "A tree diagram shows each stage as branches. It gives a visual proof of why multiplication works, because each first branch grows into several second branches and so on.",
        "Tree diagrams are especially useful when some branches have different numbers of choices or when a restriction removes certain branches."
      ],
      steps: [
        "Draw one branch for each first choice.",
        "From each branch, draw every allowed next choice.",
        "Count the end branches to find the total outcomes.",
        "Check the tree is complete and that no allowed path is missing."
      ],
      tips: [
        "Every branch at one stage should lead to all the options at the next stage unless a rule stops it.",
        "Use a tree diagram when the choices feel confusing.",
        "Complete diagrams stop missed outcomes."
      ],
      examples: [
        { title: "Ice cream tree", text: "If there are 2 cone choices and 3 toppings, each cone branch splits into 3 topping branches, so there are 2 × 3 = 6 final branches." },
        { title: "Restriction in a tree", text: "If one topping is not allowed on a waffle cone, that branch is missing only from the waffle side, so you must count carefully instead of using one quick multiplication." }
      ],
      visualLabel: "A tree diagram card showing branches for each choice stage.",
      visual: createStudyVisualCard({ emoji: "🌳", title: "Draw the branches", subtitle: "See every path clearly", chips: ["Stage 1", "Stage 2", "End branches", "Count safely"], accent: "#14b8a6" })
    },
    {
      title: "Restrictions and Rules",
      summary: "Some questions change the count by adding rules, such as no repetition or even numbers only.",
      explanation: [
        "Restrictions change the stage counts. 'No repetition' means the number of choices shrinks after each pick. 'Must be even' often fixes the last digit first. 'Must start with a vowel' restricts the first stage only.",
        "This leads to short permutation-style products such as 5 × 4 × 3 when choosing 3 different objects from 5 in order."
      ],
      steps: [
        "Read the restriction carefully before counting.",
        "Decide which position or stage the rule affects.",
        "Adjust the number of choices at that stage, and at later stages if repetition is not allowed.",
        "Multiply the updated stage counts together."
      ],
      tips: [
        "An even number must end in 0, 2, 4, 6 or 8.",
        "No repetition means a choice used once may not be available again.",
        "Fixed first or last positions are usually easiest to count first."
      ],
      examples: [
        { title: "Even number", text: "To make a 3-digit even number from digits 1, 2, 3, 4 with no repeats, choose the last digit from 2 even choices first, then the first digit from the remaining 3, then the middle digit from the remaining 2. Total = 2 × 3 × 2 = 12." },
        { title: "No repetition", text: "A 4-letter code made from 6 different letters with no repeats has 6 × 5 × 4 × 3 possible arrangements." }
      ],
      visualLabel: "A counting card showing how rules change the number of choices.",
      visual: createStudyVisualCard({ emoji: "🚦", title: "Watch the rules", subtitle: "Restrictions change the count", chips: ["No repeats", "Even only", "Fixed end", "Adjust choices"], accent: "#f59e0b" })
    },
    {
      title: "Worded Counting Problems",
      summary: "Long word problems become easier when you turn them into stages.",
      explanation: [
        "Worded counting questions are usually disguised stage questions. The maths is often still multiplication, but the story can hide where one stage ends and the next begins.",
        "The best method is to underline each decision, list the choices at each stage, then check for restrictions such as 'different', 'even', 'not allowed' or 'must include'."
      ],
      steps: [
        "Underline each decision in the question.",
        "Write a short stage list with the number of options for each decision.",
        "Apply any restrictions before multiplying.",
        "Multiply the final stage counts and label the answer clearly."
      ],
      tips: [
        "Long wording does not always mean hard maths.",
        "Turn the story into short stage notes.",
        "Check you have not counted one stage twice."
      ],
      examples: [
        { title: "Fast-food meal", text: "If there are 3 burgers, 2 sides, 4 drinks and 2 desserts, the choices happen in four stages, so total meals = 3 × 2 × 4 × 2 = 48." },
        { title: "School options", text: "If James chooses one subject from 3 languages and one from 4 arts, total choices = 3 × 4 = 12 because each language can pair with each art subject." }
      ],
      visualLabel: "A word-problem card showing long counting questions broken into stages.",
      visual: createStudyVisualCard({ emoji: "📝", title: "Turn words into stages", subtitle: "Underline each decision", chips: ["Choice 1", "Choice 2", "Choice 3", "Multiply"], accent: "#22c55e" })
    }
  ]
});
