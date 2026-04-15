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
        "Place value works in powers of 10. Moving one place left makes a digit 10 times larger in value, and moving one place right makes it 10 times smaller. In 63,408 the digit 4 is worth 4 hundreds, which is 400.",
        "Rounding uses the digit to the right of the target place. If that digit is 0, 1, 2, 3 or 4 you keep the target digit the same; if it is 5, 6, 7, 8 or 9 you increase the target digit by 1 and change the digits after it to zero."
      ],
      steps: [
        "Find the place you need, such as tens, hundreds or thousands.",
        "Read the digit in that place and the digit immediately to its right.",
        "Apply the rounding rule: 0-4 stays, 5-9 rounds up.",
        "Rewrite the number so every place to the right becomes 0."
      ],
      tips: [
        "5 or more means round up.",
        "4 or less means keep the digit the same.",
        "Say the number out loud if that helps."
      ],
      examples: [
        { title: "Place value", text: "In 408,572 the 8 is in the thousands column, so its value is 8,000, not just 8." },
        { title: "Rounding", text: "8,472 to the nearest hundred looks at the tens digit 7. Because 7 is at least 5, 8,472 rounds to 8,500." }
      ],
      visualLabel: "A place value visual showing how digits change value by position.",
      visual: createStudyVisualCard({ emoji: "🔢", title: "Place value", subtitle: "Read the value, not just the digit", chips: ["7 ones", "7 tens", "7 hundreds", "7 thousands"], accent: "#4f46e5" })
    },
    {
      title: "Comparing & Ordering Numbers",
      summary: "To compare numbers, check the biggest place value first.",
      explanation: [
        "When comparing whole numbers, first check how many digits they have. A 5-digit number is always larger than a 4-digit number because it has a ten-thousands place.",
        "If two numbers have the same number of digits, compare from left to right. The first place where the digits differ decides which number is larger. This is the place-value comparison rule."
      ],
      steps: [
        "Count the digits in each number.",
        "If the digit counts match, compare the left-most digits.",
        "Move one place right only when the digits are equal.",
        "Use <, > or =, then place the numbers in ascending or descending order as asked."
      ],
      tips: [
        "8,901 is bigger than 8,199 because the hundreds digit is larger.",
        "Write numbers in a column if that helps you compare.",
        "Small reading mistakes can flip the whole answer."
      ],
      examples: [
        { title: "Comparing", text: "5,230 > 5,203 because the thousands and hundreds match, but the tens digit 3 is greater than 0." },
        { title: "Ordering", text: "Ascending order means smallest to largest, so 2,109, 2,190, 2,901 is the correct order." }
      ],
      visualLabel: "A comparison card showing how to compare digits from left to right.",
      visual: createStudyVisualCard({ emoji: "↔️", title: "Compare carefully", subtitle: "Start with the biggest place", chips: ["Digits", "Thousands", "Hundreds", "Tens"], accent: "#0891b2" })
    },
    {
      title: "Factors, Multiples & Primes",
      summary: "These ideas help you understand how numbers are built.",
      explanation: [
        "A factor divides exactly into a number, so factor questions are really division questions with no remainder. Factors come in pairs: if 3 is a factor of 24, then 8 is its matching factor because 3 × 8 = 24.",
        "A multiple is found by multiplying, and a prime number has exactly two factors: 1 and itself. Useful divisibility tests are 2 for even numbers, 3 when the digits add to a multiple of 3, 5 when the last digit is 0 or 5, and 10 when the last digit is 0."
      ],
      steps: [
        "For factors, test whole numbers up to about the square root and record factor pairs.",
        "For multiples, count on in equal jumps or multiply the number by 1, 2, 3 and so on.",
        "For primes, test whether any number other than 1 and itself divides exactly.",
        "Use divisibility rules first so you do not waste time."
      ],
      tips: [
        "Even numbers are divisible by 2.",
        "If digits add to a multiple of 3, the number is divisible by 3.",
        "1 is not a prime number."
      ],
      examples: [
        { title: "Factors", text: "To find the factors of 18, test divisions: 1 × 18, 2 × 9 and 3 × 6. So the factors are 1, 2, 3, 6, 9 and 18." },
        { title: "Prime test", text: "13 is prime because it is not divisible by 2, 3 or 5, so only 1 and 13 divide into it exactly." }
      ],
      visualLabel: "A number facts card showing factors, multiples and prime numbers.",
      visual: createStudyVisualCard({ emoji: "🧠", title: "Number facts", subtitle: "Factors divide, multiples grow", chips: ["Factors", "Multiples", "Prime", "Divisible"], accent: "#7c3aed" })
    },
    {
      title: "Negative Numbers & Number Lines",
      summary: "Negative numbers are less than zero and are often easiest to picture on a number line.",
      explanation: [
        "Negative numbers lie to the left of zero on a number line. The further left a number is, the smaller it is, so -8 is less than -3 even though 8 is greater than 3.",
        "Use movement rules on the number line: adding a positive moves right, subtracting a positive moves left, and subtracting a negative is the same as adding the positive version of that number."
      ],
      steps: [
        "Mark zero and place the starting number on a number line.",
        "Decide whether the operation means move left or right.",
        "Use the sign rule carefully: subtracting a negative becomes adding.",
        "Check whether the final answer should be closer to or further from zero."
      ],
      tips: [
        "-2 is bigger than -5 because it is closer to zero.",
        "Subtracting a negative means moving right.",
        "A quick sketch can make the answer much clearer."
      ],
      examples: [
        { title: "Comparing negatives", text: "-3 > -7 because -3 lies further right on the number line, so it is the greater number." },
        { title: "Subtracting a negative", text: "6 - (-4) = 10 because subtracting a negative 4 is the same as adding 4." }
      ],
      visualLabel: "A number line card showing positive and negative numbers around zero.",
      visual: createStudyVisualCard({ emoji: "➖", title: "Negative numbers", subtitle: "Use the number line to stay calm", chips: ["Left is smaller", "Zero", "Right is bigger", "Jump carefully"], accent: "#ef4444" })
    }
  ]
});
