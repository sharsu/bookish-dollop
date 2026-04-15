registerStudyGuide({
  topic: "Fractions",
  icon: "🍕",
  summary: "Fractions help you work with equal parts, compare them and calculate with them.",
  intro: "Fractions make much more sense when you picture the whole clearly and keep the parts equal.",
  keyIdea: "The denominator names the size of the parts and the numerator counts them.",
  visualLabel: "A fractions study card with equal parts and common fraction ideas.",
  visual: createStudyVisualCard({
    emoji: "🍕",
    title: "Equal parts",
    subtitle: "Fractions only work when parts are equal",
    chips: ["1/2", "1/4", "3/4", "Equivalent"],
    accent: "#f97316"
  }),
  concepts: [
    {
      title: "Understanding Fractions",
      summary: "A fraction tells you how many equal parts you have out of the whole.",
      explanation: [
        "The denominator shows how many equal parts make one whole, and the numerator shows how many of those equal parts are being counted. So 3/4 means 3 parts when the whole has been split into 4 equal pieces.",
        "Fractions can be proper, improper or mixed. If the numerator is larger than the denominator, the fraction is more than 1 whole, so 7/4 can also be written as 1 3/4."
      ],
      steps: [
        "Identify the whole amount or whole shape first.",
        "Check the parts are equal, because unequal pieces do not make an ordinary fraction model.",
        "Read the denominator as the part size and the numerator as the count of parts.",
        "If the fraction is greater than 1, decide whether a mixed number would make it easier to picture."
      ],
      tips: [
        "3/4 means 3 parts out of 4 equal parts.",
        "The bigger the denominator, the smaller each part can be.",
        "A bar model can make tricky questions easier."
      ],
      examples: [
        { title: "Simple fraction", text: "If a bar is split into 5 equal parts and 2 are shaded, the fraction is 2/5 because 5 equal parts make the whole and 2 are chosen." },
        { title: "Improper fraction", text: "7/4 means seven quarters. Four quarters make 1 whole and three quarters remain, so 7/4 = 1 3/4." }
      ],
      visualLabel: "A fractions card showing numerator and denominator.",
      visual: createStudyVisualCard({ emoji: "🍕", title: "Read the fraction", subtitle: "Top counts, bottom names the parts", chips: ["Numerator", "Denominator", "Equal parts", "Whole"], accent: "#f97316" })
    },
    {
      title: "Equivalent & Simplifying Fractions",
      summary: "Equivalent fractions have the same value even when they look different.",
      explanation: [
        "Equivalent fractions have the same value because the numerator and denominator have both been multiplied or divided by the same non-zero number. This keeps the size of the fraction unchanged.",
        "To simplify a fraction fully, divide the numerator and denominator by their highest common factor. When the numerator and denominator have no common factor greater than 1, the fraction is in simplest form."
      ],
      steps: [
        "Look for a common factor of the numerator and denominator.",
        "Divide top and bottom by the same factor.",
        "Repeat, or use the highest common factor in one step.",
        "Check the simplified fraction gives the same amount of the whole."
      ],
      tips: [
        "1/2 = 2/4 = 3/6.",
        "Never add or subtract the same number to simplify.",
        "Use times tables to spot common factors quickly."
      ],
      examples: [
        { title: "Equivalent", text: "2/3 = 4/6 because both numerator and denominator were multiplied by 2, so the fraction keeps the same value." },
        { title: "Simplifying", text: "12/18 simplifies to 2/3 because the highest common factor of 12 and 18 is 6, and 12 ÷ 6 = 2 while 18 ÷ 6 = 3." }
      ],
      visualLabel: "A fractions card showing different fractions with the same value.",
      visual: createStudyVisualCard({ emoji: "🟰", title: "Same value", subtitle: "Different look, same amount", chips: ["1/2", "2/4", "3/6", "Simplify"], accent: "#0ea5e9" })
    },
    {
      title: "Comparing & Ordering Fractions",
      summary: "To compare fractions, make them easier to match.",
      explanation: [
        "Fractions with the same denominator are compared by the numerators because the part size is already the same. Fractions with the same numerator can be compared by part size: the larger denominator gives the smaller parts.",
        "When denominators differ, convert to equivalent fractions with a common denominator, or compare by using decimals or a number line. Matching the part size is the safest method in tests."
      ],
      steps: [
        "Check whether the denominators already match.",
        "If not, find a common denominator and rewrite each fraction.",
        "Compare the numerators once the fractions have the same denominator.",
        "Place them in ascending or descending order as the question asks."
      ],
      tips: [
        "With the same numerator, the bigger denominator gives the smaller fraction.",
        "A number line can help with ordering.",
        "Do not compare only the top numbers unless the denominators match."
      ],
      examples: [
        { title: "Same denominator", text: "5/8 > 3/8 because both fractions are made of eighths, and 5 eighths is more than 3 eighths." },
        { title: "Different denominator", text: "To compare 1/2 and 2/3, rewrite them as 3/6 and 4/6. Since 4/6 > 3/6, 2/3 is larger." }
      ],
      visualLabel: "A comparison card showing fractions turned into matching denominators.",
      visual: createStudyVisualCard({ emoji: "📏", title: "Compare fractions", subtitle: "Match the part size first", chips: ["Common denominator", "Number line", "Equivalent", "Order"], accent: "#14b8a6" })
    },
    {
      title: "Fractions of Amounts & Simple Calculations",
      summary: "Fractions can describe parts of a group, not just parts of a shape.",
      explanation: [
        "To find a fraction of an amount, use the rule fraction of amount = amount ÷ denominator × numerator. Divide first because the denominator tells you how many equal groups the whole has been split into.",
        "To add or subtract fractions, the pieces must be the same size. That means you need a common denominator before you combine numerators."
      ],
      steps: [
        "Read the denominator to see how many equal parts the whole must be split into.",
        "Divide the amount by the denominator to find one part.",
        "Multiply that answer by the numerator.",
        "For adding or subtracting fractions, rewrite them with a common denominator before combining."
      ],
      tips: [
        "1/4 of 20 means split 20 into 4 equal groups.",
        "2/5 of 30 means find 1/5 first, then double it.",
        "Only add numerators once the denominators match."
      ],
      examples: [
        { title: "Fraction of an amount", text: "3/5 of 20 means split 20 into 5 equal groups: 20 ÷ 5 = 4. Then take 3 groups: 4 × 3 = 12." },
        { title: "Add fractions", text: "1/4 + 3/8 becomes 2/8 + 3/8 = 5/8 after changing 1/4 into an equivalent fraction with denominator 8." }
      ],
      visualLabel: "A fractions of amounts card showing divide first, then multiply.",
      visual: createStudyVisualCard({ emoji: "➗", title: "Fraction of an amount", subtitle: "Divide first, then multiply", chips: ["÷ denominator", "× numerator", "Match denominators", "Simplify"], accent: "#8b5cf6" })
    }
  ]
});
