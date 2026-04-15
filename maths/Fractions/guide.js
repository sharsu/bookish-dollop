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
        "The bottom number, called the denominator, shows how many equal parts make the whole. The top number, called the numerator, tells you how many of those parts you have.",
        "Fractions only work properly if the parts are equal. A picture can help you check this very quickly."
      ],
      steps: [
        "Look for the whole first.",
        "Check that the whole is split into equal parts.",
        "Read the denominator, then the numerator.",
        "Picture or sketch the fraction if needed."
      ],
      tips: [
        "3/4 means 3 parts out of 4 equal parts.",
        "The bigger the denominator, the smaller each part can be.",
        "A bar model can make tricky questions easier."
      ],
      examples: [
        { title: "Simple fraction", text: "If a shape is split into 5 equal parts and 2 are shaded, the fraction is 2/5." },
        { title: "Equal parts matter", text: "A shape split into unequal pieces cannot be read with an ordinary fraction model." }
      ],
      visualLabel: "A fractions card showing numerator and denominator.",
      visual: createStudyVisualCard({ emoji: "🍕", title: "Read the fraction", subtitle: "Top counts, bottom names the parts", chips: ["Numerator", "Denominator", "Equal parts", "Whole"], accent: "#f97316" })
    },
    {
      title: "Equivalent & Simplifying Fractions",
      summary: "Equivalent fractions have the same value even when they look different.",
      explanation: [
        "Fractions are equivalent if they cover the same amount of the whole. You can make equivalent fractions by multiplying or dividing the numerator and denominator by the same number.",
        "Simplifying means writing the fraction in its smallest form. This makes later calculations easier to manage."
      ],
      steps: [
        "Find a common factor of the numerator and denominator.",
        "Divide both by the same factor.",
        "Keep going until no common factor greater than 1 is left.",
        "Check the fraction still has the same value."
      ],
      tips: [
        "1/2 = 2/4 = 3/6.",
        "Never add or subtract the same number to simplify.",
        "Use times tables to spot common factors quickly."
      ],
      examples: [
        { title: "Equivalent", text: "2/3 = 4/6 because both top and bottom were multiplied by 2." },
        { title: "Simplifying", text: "12/18 simplifies to 2/3 by dividing both numbers by 6." }
      ],
      visualLabel: "A fractions card showing different fractions with the same value.",
      visual: createStudyVisualCard({ emoji: "🟰", title: "Same value", subtitle: "Different look, same amount", chips: ["1/2", "2/4", "3/6", "Simplify"], accent: "#0ea5e9" })
    },
    {
      title: "Comparing & Ordering Fractions",
      summary: "To compare fractions, make them easier to match.",
      explanation: [
        "Fractions with the same denominator are easy to compare because the parts are the same size. Then you just compare the numerators.",
        "When denominators are different, you can use equivalent fractions, a common denominator or a picture to decide which is larger."
      ],
      steps: [
        "See if the denominators already match.",
        "If not, make equivalent fractions with a common denominator.",
        "Compare the numerators once the part size matches.",
        "Put them in order carefully."
      ],
      tips: [
        "With the same numerator, the bigger denominator gives the smaller fraction.",
        "A number line can help with ordering.",
        "Do not compare only the top numbers unless the denominators match."
      ],
      examples: [
        { title: "Same denominator", text: "5/8 > 3/8 because both are eighths and 5 is more than 3." },
        { title: "Different denominator", text: "1/2 = 3/6 and 2/3 = 4/6, so 2/3 is larger." }
      ],
      visualLabel: "A comparison card showing fractions turned into matching denominators.",
      visual: createStudyVisualCard({ emoji: "📏", title: "Compare fractions", subtitle: "Match the part size first", chips: ["Common denominator", "Number line", "Equivalent", "Order"], accent: "#14b8a6" })
    },
    {
      title: "Fractions of Amounts & Simple Calculations",
      summary: "Fractions can describe parts of a group, not just parts of a shape.",
      explanation: [
        "To find a fraction of an amount, you divide by the denominator and then multiply by the numerator.",
        "For simple adding and subtracting, matching denominators first keeps the calculation fair because the pieces are the same size."
      ],
      steps: [
        "Read the denominator to find how many equal groups to make.",
        "Divide the total by the denominator.",
        "Multiply by the numerator.",
        "For adding or subtracting, match denominators before combining."
      ],
      tips: [
        "1/4 of 20 means split 20 into 4 equal groups.",
        "2/5 of 30 means find 1/5 first, then double it.",
        "Only add numerators once the denominators match."
      ],
      examples: [
        { title: "Fraction of an amount", text: "3/5 of 20 = 12 because 20 ÷ 5 = 4 and 4 × 3 = 12." },
        { title: "Add fractions", text: "1/6 + 2/6 = 3/6, which simplifies to 1/2." }
      ],
      visualLabel: "A fractions of amounts card showing divide first, then multiply.",
      visual: createStudyVisualCard({ emoji: "➗", title: "Fraction of an amount", subtitle: "Divide first, then multiply", chips: ["÷ denominator", "× numerator", "Match denominators", "Simplify"], accent: "#8b5cf6" })
    }
  ]
});
