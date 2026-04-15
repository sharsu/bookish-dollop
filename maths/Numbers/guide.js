registerStudyGuide({
  topic: "Numbers",
  icon: "🔢",
  summary: "Numbers includes place value, ordering, factors and other building blocks you use all the time.",
  intro: "This topic is about understanding what numbers mean, how they compare and how they fit into patterns.",
  keyIdea: "The more clearly you read a number, the easier every other step becomes.",
  visualLabel: "A place value card showing ones, tens, hundreds and thousands.",
  visual: createStudyVisualCard({
    emoji: "🔢",
    title: "Place value",
    subtitle: "Each place is 10 times bigger",
    chips: ["Ones", "Tens", "Hundreds", "Thousands"],
    accent: "#4f46e5"
  }),
  concepts: [
    {
      title: "Place Value & Rounding",
      summary: "Each digit is worth something different depending on where it sits.",
      explanation: [
        "Place value tells you what each digit means. In 47,392 the 7 is worth 7,000 because it is in the thousands place.",
        "Rounding helps you find a close answer quickly. You look at the digit to the right of the place you are rounding to and decide whether to keep the number the same or round it up."
      ],
      steps: [
        "Read the number from left to right.",
        "Find the place value the question asks for.",
        "Look one digit to the right when rounding.",
        "Estimate first so your answer feels sensible."
      ],
      tips: [
        "5 or more means round up.",
        "4 or less means keep the digit the same.",
        "Say the number out loud if that helps."
      ],
      examples: [
        { title: "Place value", text: "In 63,408 the digit 4 is worth 400 because it is in the hundreds place." },
        { title: "Rounding", text: "8,472 rounded to the nearest hundred is 8,500 because the tens digit is 7." }
      ],
      visualLabel: "A place value visual showing how digits change value by position.",
      visual: createStudyVisualCard({ emoji: "🔢", title: "Place value", subtitle: "Read the value, not just the digit", chips: ["7 ones", "7 tens", "7 hundreds", "7 thousands"], accent: "#4f46e5" })
    },
    {
      title: "Comparing & Ordering Numbers",
      summary: "To compare numbers, check the biggest place value first.",
      explanation: [
        "When you compare numbers, start with the largest place. A number with more digits is usually bigger, but if the digits are the same length you compare from the left.",
        "Ordering means putting numbers in size order. Reading carefully stops easy mistakes, especially when numbers look similar."
      ],
      steps: [
        "Check how many digits each number has.",
        "Compare the left-most digits first.",
        "Move right only if the digits match.",
        "Use <, > or = once you are sure."
      ],
      tips: [
        "8,901 is bigger than 8,199 because the hundreds digit is larger.",
        "Write numbers in a column if that helps you compare.",
        "Small reading mistakes can flip the whole answer."
      ],
      examples: [
        { title: "Comparing", text: "5,230 > 5,203 because the tens digit 3 is bigger than 0." },
        { title: "Ordering", text: "In ascending order: 2,109, 2,190, 2,901." }
      ],
      visualLabel: "A comparison card showing how to compare digits from left to right.",
      visual: createStudyVisualCard({ emoji: "↔️", title: "Compare carefully", subtitle: "Start with the biggest place", chips: ["Digits", "Thousands", "Hundreds", "Tens"], accent: "#0891b2" })
    },
    {
      title: "Factors, Multiples & Primes",
      summary: "These ideas help you understand how numbers are built.",
      explanation: [
        "A factor divides exactly into a number. A multiple is found by multiplying a number by 1, 2, 3 and so on.",
        "A prime number has exactly two factors: 1 and itself. These facts appear in number puzzles, sequences and divisibility questions."
      ],
      steps: [
        "For factors, test which numbers divide exactly.",
        "For multiples, count on in jumps of the number.",
        "For prime numbers, check that only 1 and the number itself work.",
        "Use divisibility rules to save time."
      ],
      tips: [
        "Even numbers are divisible by 2.",
        "If digits add to a multiple of 3, the number is divisible by 3.",
        "1 is not a prime number."
      ],
      examples: [
        { title: "Factors", text: "The factors of 12 are 1, 2, 3, 4, 6 and 12." },
        { title: "Prime", text: "13 is prime because only 1 and 13 divide into it exactly." }
      ],
      visualLabel: "A number facts card showing factors, multiples and prime numbers.",
      visual: createStudyVisualCard({ emoji: "🧠", title: "Number facts", subtitle: "Factors divide, multiples grow", chips: ["Factors", "Multiples", "Prime", "Divisible"], accent: "#7c3aed" })
    },
    {
      title: "Negative Numbers & Number Lines",
      summary: "Negative numbers are less than zero and are often easiest to picture on a number line.",
      explanation: [
        "Negative numbers appear in temperatures, money and levels below zero. The further left a number is on a number line, the smaller it is.",
        "A number line helps when adding and subtracting negatives because you can see the jumps and the direction clearly."
      ],
      steps: [
        "Mark zero on the number line first.",
        "Remember numbers to the left are smaller.",
        "For addition, move right; for subtraction, move left.",
        "Check the sign in front of each number carefully."
      ],
      tips: [
        "-2 is bigger than -5 because it is closer to zero.",
        "Subtracting a negative means moving right.",
        "A quick sketch can make the answer much clearer."
      ],
      examples: [
        { title: "Comparing negatives", text: "-3 > -7 because -3 is further to the right on the number line." },
        { title: "Adding", text: "-4 + 6 = 2 because you move 6 steps right from -4." }
      ],
      visualLabel: "A number line card showing positive and negative numbers around zero.",
      visual: createStudyVisualCard({ emoji: "➖", title: "Negative numbers", subtitle: "Use the number line to stay calm", chips: ["Left is smaller", "Zero", "Right is bigger", "Jump carefully"], accent: "#ef4444" })
    }
  ]
});
