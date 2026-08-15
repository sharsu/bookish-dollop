/* ═══════════════════════════════════════════════════════════════════
   REVISION SKILLS

   A skill is the smallest thing a child would say "I need to revise this"
   about — "Rotating a shape about a point", not "Geometry". Each one names
   the question templates that test it, so its practice questions come
   straight out of the existing bank; nothing new has to be written.

   Fields:
     id        stable key, used by the mastery store
     topic     the topic tile it sits under
     title     what the child sees
     idea      one or two sentences: what this actually is
     templates the generators that test it (see q.template)

   The "how to do it" line, the worked example and any diagram are taken
   from a real question at run time — the method is already attached to
   every question as q.explain, so the card and the practice cannot drift
   apart.

   Every template in the maths bank belongs to exactly one skill; the
   revision screen checks this on load and reports anything orphaned.
═══════════════════════════════════════════════════════════════════ */
(() => {
  const root = typeof window !== "undefined" ? window : globalThis;

  root.SKILLS = [
    /* ── Numbers ── */
    { id: "num-place-value", topic: "Numbers", title: "Place value",
      idea: "What a digit is worth depends on the column it sits in. The 7 in 7,240 is worth seven thousand, not seven.",
      templates: ["numPlaceValue", "numPlaceValueDiff"] },
    { id: "num-rounding", topic: "Numbers", title: "Rounding",
      idea: "Replacing a number with a nearby, tidier one. You look at the digit just after the place you are rounding to, and nothing else.",
      templates: ["numRounding", "numRoundLargePlace", "numRoundingBounds"] },
    { id: "num-primes-factors", topic: "Numbers", title: "Primes and factors",
      idea: "A factor divides into a number exactly. A prime has only two factors: 1 and itself.",
      templates: ["numIsPrime", "numFactorCount", "numPrimeFactorCount", "numPrimeSumSquare"] },
    { id: "num-lcm-hcf", topic: "Numbers", title: "LCM and HCF",
      idea: "The lowest common multiple is the first number both go into. The highest common factor is the biggest number that goes into both.",
      templates: ["numLCM", "numHCF", "numHCFofFour", "numBusLCM", "numRemainderPuzzle"] },
    { id: "num-powers", topic: "Numbers", title: "Powers and roots",
      idea: "A small raised number tells you how many times to multiply a number by itself. 9² means 9 × 9, not 9 × 2.",
      templates: ["numPowers", "numCubeMissing", "numLastDigitPower"] },
    { id: "num-calculating", topic: "Numbers", title: "Written calculation",
      idea: "Adding, subtracting, multiplying and dividing larger numbers on paper, keeping the columns lined up.",
      templates: ["numArithmetic", "numWordProblem"] },
    { id: "num-puzzles", topic: "Numbers", title: "Number puzzles",
      idea: "Questions where you have to search or reason rather than follow one procedure — building numbers from digits, or comparing several calculations.",
      templates: ["numSmallestEvenFromDigits", "numFourConsecOdd", "numCompareExpressions",
                  "numDigitProductCount", "numClosestToTarget"] },

    /* ── Decimals ── */
    { id: "dec-four-rules", topic: "Decimals", title: "Adding and subtracting decimals",
      idea: "The decimal points must line up underneath each other. Fill any gaps with zeros so both numbers have the same length.",
      templates: ["decAdd", "decSubtract"] },
    { id: "dec-multiply-divide", topic: "Decimals", title: "Multiplying and dividing decimals",
      idea: "Multiply as if there were no decimal point, then put it back. Dividing by a number below 1 makes the answer bigger.",
      templates: ["decMultiply", "decDivide", "decDivideByDecimal", "decChainedOf"] },
    { id: "dec-compare-round", topic: "Decimals", title: "Comparing and rounding decimals",
      idea: "Compare place by place from the left. More digits does not mean a bigger number: 0.093 is smaller than 0.39.",
      templates: ["decCompare", "decRound", "decHalfway"] },
    { id: "dec-convert", topic: "Decimals", title: "Decimals into fractions",
      idea: "The digits after the point sit over 10, 100 or 1000 depending on how many there are, then cancel down.",
      templates: ["decToFrac"] },
    { id: "dec-reasoning", warmUp: "dec-multiply-divide", topic: "Decimals", title: "Using a fact you are given",
      idea: "Some questions hand you an answer and ask a related one. Adjust by powers of ten instead of starting again.",
      templates: ["decMultFactReuse", "decPriceChange"] },

    /* ── Fractions ── */
    { id: "frac-add-subtract", topic: "Fractions", title: "Adding and subtracting fractions",
      idea: "You can only add or subtract fractions once the bottoms match. Change the denominators first, then work on the tops alone.",
      templates: ["fracAdd", "fracSubtract"] },
    { id: "frac-multiply-divide", topic: "Fractions", title: "Multiplying and dividing fractions",
      idea: "Multiply straight across. To divide, turn the second fraction upside down and multiply instead.",
      templates: ["fracMultiply", "fracDivide", "fracMixedMultiply"] },
    { id: "frac-simplify", topic: "Fractions", title: "Simplifying and mixed numbers",
      idea: "Cancel the top and bottom by the same number. An improper fraction can be split into whole ones plus a remainder.",
      templates: ["fracSimplify", "fracImproperToMixed", "fracBetweenTwo"] },
    { id: "frac-of-amount", topic: "Fractions", title: "A fraction of an amount",
      idea: "'Of' means multiply. Divide by the bottom to find one part, then multiply by the top.",
      templates: ["fracOfX", "fracOfFrac", "figShadedFraction"] },
    { id: "frac-remainder", warmUp: "frac-of-amount", topic: "Fractions", title: "Fractions of what is left",
      idea: "When a second fraction is taken, it is usually a fraction of the remainder, not of the original amount. These often have to be worked backwards.",
      templates: ["fracReverseTwoStage", "fracOfRemainderMoney", "fracOfCapacity"] },

    /* ── Percentages ── */
    { id: "pct-basics", topic: "Percentages", title: "Finding a percentage",
      idea: "Per cent means 'out of 100'. Find 10% by dividing by 10, or 1% by dividing by 100, then build what you need.",
      templates: ["pctOf", "pctFracToPct", "pctDecToPct"] },
    { id: "pct-change", topic: "Percentages", title: "Increases, discounts and interest",
      idea: "Work out the change and add or subtract it — or go straight to what is left: 30% off means paying 70%.",
      templates: ["pctSalePrice", "pctIncrease", "pctSimpleInterest", "pctSaleChange"] },
    { id: "pct-reverse", topic: "Percentages", title: "Working back to the whole",
      idea: "You are told what a percentage is worth and asked for 100%. Scale back up rather than taking a percentage again.",
      templates: ["pctReverse"] },
    { id: "pct-chained", warmUp: "pct-basics", topic: "Percentages", title: "Percentages one after another",
      idea: "Two percentage changes cannot be added together. Each one applies to the answer before it.",
      templates: ["pctChained", "pctProfitAfterLoss", "pctProfitPerItem"] },
    { id: "pct-sets", warmUp: "pct-basics", topic: "Percentages", title: "Overlapping groups",
      idea: "When people belong to two groups at once, adding the groups counts the overlap twice. Subtract it once to fix that.",
      templates: ["pctVennNeither"] },

    /* ── BIDMAS ── */
    { id: "bid-order", topic: "BIDMAS", title: "Order of operations",
      idea: "Brackets, Indices, Divide and Multiply, then Add and Subtract — and left to right within each pair.",
      templates: ["bidSimple", "bidBrackets", "bidPowers", "bidMixed"] },
    { id: "bid-negatives", topic: "BIDMAS", title: "Negative numbers",
      idea: "Two negatives multiplied give a positive. Counting across zero is easiest in two hops: up to zero, then on past it.",
      templates: ["bidNegative", "bidTempChange"] },
    { id: "bid-puzzles", warmUp: "bid-order", topic: "BIDMAS", title: "Missing brackets and operations",
      idea: "You are given the answer and asked what makes it true. Try each possibility, remembering that × and ÷ happen before + and −.",
      templates: ["bidNestedBrackets", "bidMissingOperator", "bidInsertBrackets"] },

    /* ── Algebra ── */
    { id: "alg-substitute", topic: "Algebra", title: "Substituting into a formula",
      idea: "Replace each letter with its value, then work the arithmetic out in the usual order. Watch the signs.",
      templates: ["algSubLinear", "algSubMulti", "algSubQuadratic", "algCustomOp", "algFunctionMachine"] },
    { id: "alg-solve", topic: "Algebra", title: "Solving equations",
      idea: "Get the letter on its own by doing the same thing to both sides, undoing the operations in reverse order.",
      templates: ["algSolve1Step", "algSolve2Step", "algSolveBothSides", "algChainSubstitute"] },
    { id: "alg-simplify", topic: "Algebra", title: "Collecting like terms",
      idea: "Only terms with the same letter can be added together. The a terms and the b terms stay separate.",
      templates: ["algSimplifyTerms"] },
    { id: "alg-word-problems", warmUp: "alg-solve", topic: "Algebra", title: "Turning words into equations",
      idea: "The hard part is writing the equation, not solving it. Name the unknown, then translate each sentence into maths.",
      templates: ["algWeightPair", "algTriangleAngles", "algThreeItemPricing", "algSimultaneous"] },

    /* ── Sequences ── */
    { id: "seq-continue", topic: "Sequences", title: "Continuing a sequence",
      idea: "Find what happens from one term to the next — added, multiplied, or built from the two before — then carry it on.",
      templates: ["seqArithNext", "seqFibLike", "seqGeomNext", "seqBallPattern", "seqFibMissingStart"] },
    { id: "seq-nth-term", topic: "Sequences", title: "The nth term",
      idea: "A rule that jumps straight to any term without writing out the others. The number in front of n is the common difference.",
      templates: ["seqArithNth", "seqArithNthFormula", "seqMatchstickNth", "seqNthFromTwoTerms"] },
    { id: "seq-changing-gaps", warmUp: "seq-continue", topic: "Sequences", title: "Sequences with changing gaps",
      idea: "When the differences are not constant, look at the differences between the differences. That second pattern is usually steady.",
      templates: ["seqQuadraticNext", "seqQuadraticDecreasing"] },

    /* ── Ratio ── */
    { id: "rat-simplify-share", topic: "Ratio", title: "Simplifying and sharing in a ratio",
      idea: "Add the parts to find how many shares there are, work out what one share is worth, then multiply up.",
      templates: ["ratSimplify", "ratSplit", "ratWordTotal", "ratDifference"] },
    { id: "rat-proportion", topic: "Ratio", title: "Proportion and recipes",
      idea: "Scale everything by the same factor. Finding the amount for one first often makes the numbers easier.",
      templates: ["ratRecipe", "ratInverseProp"] },
    { id: "rat-scale", topic: "Ratio", title: "Map scales",
      idea: "The scale tells you what one centimetre stands for. Multiply to get the real distance, divide to get back to the map.",
      templates: ["ratMapScale", "ratMapReverse"] },
    { id: "rat-linking", warmUp: "rat-simplify-share", topic: "Ratio", title: "Linking two ratios",
      idea: "Two ratios sharing a quantity can be joined by scaling them until that shared number matches in both.",
      templates: ["ratChained", "ratAfterChange"] },

    /* ── Speed ── */
    { id: "spd-formula", topic: "Speed", title: "Speed, distance and time",
      idea: "Speed is distance divided by time. Cover the one you want and the formula tells you what to do with the other two.",
      templates: ["spdFindSpeed", "spdFindDistance", "spdFindTime", "spdMphHoursMin"] },
    { id: "spd-two-travellers", warmUp: "spd-formula", topic: "Speed", title: "Two things moving at once",
      idea: "Work out where each one is at the same moment. Travelling towards each other, the gap closes at both speeds added together.",
      templates: ["spdGapBetweenTwo", "spdCatchUp", "spdMeetingPoint"] },
    { id: "spd-average", warmUp: "spd-formula", topic: "Speed", title: "Average speed",
      idea: "Average speed is the whole distance divided by the whole time. It is almost never the average of the two speeds.",
      templates: ["spdAverageTwoLegs"] },
    { id: "spd-graphs", topic: "Speed", title: "Reading a distance-time graph",
      idea: "The steepness of the line is the speed. A flat line means the distance is not changing, so the journey has stopped.",
      templates: ["figDistanceTimeStationary", "figDistanceTimeSpeed"] },

    /* ── Measurement ── */
    { id: "mea-units", topic: "Measurement", title: "Converting units",
      idea: "Decide whether the new unit is bigger or smaller than the old one, then multiply or divide by the right power of ten.",
      templates: ["meaUnitConvert", "meaInchConvert", "meaTempDiff"] },
    { id: "mea-area-perimeter", topic: "Measurement", title: "Area and perimeter",
      idea: "Perimeter is the distance all the way round. Area is the space inside. Add for one, multiply for the other.",
      templates: ["meaAreaPerim", "meaSquaresInRectangle", "figCompoundPerimeter"] },
    { id: "mea-volume", topic: "Measurement", title: "Volume and surface area",
      idea: "Volume is how much fits inside; surface area is the skin around it. For a prism, find the end face first, then multiply by the length.",
      templates: ["meaVolumeCube", "meaCompoundVolume", "meaSurfaceAreaFromVolume"] },
    { id: "mea-money", topic: "Measurement", title: "Money problems",
      idea: "Work everything into the same units, add up what is spent, then subtract from what was handed over.",
      templates: ["meaMoneyChange"] },
    { id: "mea-scaling", warmUp: "mea-area-perimeter", topic: "Measurement", title: "Scaling, overlaps and folding",
      idea: "Lengths and areas do not scale the same way: double the lengths and the area goes up four times.",
      templates: ["meaOverlapArea", "meaScaleArea", "meaFoldPaper", "meaFrameWidth"] },

    /* ── Geometry ── */
    { id: "geo-angle-facts", topic: "Geometry", title: "Angle facts",
      idea: "Angles on a straight line add to 180°, angles around a point to 360°, and angles in a triangle to 180°.",
      templates: ["geoAngleSum", "geoAngleType", "geoComplementary", "figAnglesOnLine", "figAnglesAtPoint"] },
    { id: "geo-polygons", topic: "Geometry", title: "Angles in polygons",
      idea: "The interior angles of a shape with n sides add to (n − 2) × 180°. For a regular shape, divide that by n for one angle.",
      templates: ["geoShapeAngle", "geoPolygonFromAngleSum"] },
    { id: "geo-shape-properties", topic: "Geometry", title: "Properties of shapes",
      idea: "Each shape has its own set of facts: equal sides, parallel sides, right angles. Questions often ask which fact does not hold.",
      templates: ["geoShapeProperty", "geoShapeSplit", "geoPrismFEV"] },
    { id: "geo-symmetry", topic: "Geometry", title: "Symmetry",
      idea: "A line of symmetry folds a shape exactly onto itself. Rotational order counts how many times it looks the same in one full turn.",
      templates: ["geoLinesSymmetry", "geoRotSymmetry"] },
    { id: "geo-area", topic: "Geometry", title: "Area of triangles and cut-out shapes",
      idea: "A triangle is base × height ÷ 2 — the halving is the step people forget. For a shape with a piece removed, subtract.",
      templates: ["geoTriangleArea", "geoShadedArea", "geoCuboidMissingEdge"] },
    { id: "geo-coordinates", topic: "Geometry", title: "Coordinates",
      idea: "Read across first, then up: x before y. The midpoint of a line is the average of the two x values and of the two y values.",
      templates: ["figCoordinatesRead", "figCoordinatesMidpoint"] },
    { id: "geo-rotation", warmUp: "geo-coordinates", topic: "Geometry", title: "Rotating a shape about a point",
      idea: "Turning a shape around a fixed point. The point can be anywhere on the grid — it does not have to be the corner.",
      templates: ["geoRotationCoords"] },

    /* ── Statistics ── */
    { id: "stat-averages", topic: "Statistics", title: "Mean, median, mode and range",
      idea: "Mean is the total shared out. Median is the middle once sorted. Mode is the most common. Range is largest minus smallest.",
      templates: ["statMean", "statMedian", "statMode", "statRange", "statMeanOfFactors"] },
    { id: "stat-averages-backwards", warmUp: "stat-averages", topic: "Statistics", title: "Working backwards from an average",
      idea: "If you know the mean and how many there are, you know the total. That total is the way in to a missing value.",
      templates: ["statMissingMean", "statCombinedMean"] },
    { id: "stat-tables", topic: "Statistics", title: "Frequency tables",
      idea: "A frequency table counts how many times each value happened. Multiply value by frequency to get totals, never just add the frequencies.",
      templates: ["statFreqMidpoint", "statFreqTotal", "statMedianFromFreq"] },
    { id: "stat-charts", topic: "Statistics", title: "Reading charts",
      idea: "Always check the scale or the key before reading anything off — one square or one symbol is often worth more than one.",
      templates: ["statPictogram", "figBarChartTotal", "figBarChartDifference", "figPictogram", "statCorrelation"] },
    { id: "stat-pie", topic: "Statistics", title: "Pie charts",
      idea: "A full circle is 360°, so each degree stands for the same number of people. Find that, then scale to the sector you need.",
      templates: ["statPieAngle", "statPieFromAngle", "figPieChart"] },
    { id: "stat-venn", warmUp: "stat-charts", topic: "Statistics", title: "Venn diagrams",
      idea: "The overlap belongs to both groups at once. 'Only football' means the left part alone; 'football' means the left part plus the overlap.",
      templates: ["figVennOnly"] },

    /* ── Probability ── */
    { id: "prob-basics", topic: "Probability", title: "Simple probability",
      idea: "The number of ways you want, over the total number of ways. The chance of something not happening is 1 minus the chance it does.",
      templates: ["probBagPick", "probDie", "probCoin", "probComplement", "probExpected"] },
    { id: "prob-combined", warmUp: "prob-basics", topic: "Probability", title: "Two events together",
      idea: "For both to happen, multiply the two chances. If nothing is put back, the total shrinks for the second pick.",
      templates: ["probIndependent", "probWithoutReplacement", "probTwoDiceSum", "probAtLeastOne"] },

    /* ── Logic ── */
    { id: "log-consecutive", topic: "Logic", title: "Consecutive numbers",
      idea: "Numbers in a run share a middle. Divide the total by how many there are to find it, then step out either side.",
      templates: ["logConsecutiveIntSum", "logConsecutiveEvenSum", "logConsecutiveOddPuzzle", "logSumAndDiff"] },
    { id: "log-palindromes", topic: "Logic", title: "Palindromes",
      idea: "A palindrome reads the same both ways. Fix the front digits and mirror them rather than testing every number.",
      templates: ["logPalindromeYesNo", "logNextPalindrome", "logSquarePalindromesInRange"] },
    { id: "log-calendar", topic: "Logic", title: "Days, dates and leap years",
      idea: "Days repeat every 7, so only the remainder matters. A date moves on one day each year, or two across a leap year.",
      templates: ["logDayOfWeek", "logDayWeeksAgo", "logDayShiftAcrossYear", "logLeapYearPick", "logLeapBirthday"] },
    { id: "log-clocks", warmUp: "log-calendar", topic: "Logic", title: "Clocks and time zones",
      idea: "The minute hand moves 6° a minute and the hour hand 0.5°, so the hour hand drifts past the hour as the minutes pass.",
      templates: ["logClockAngleAtHour", "logClockMirror", "logTimeZone"] },
    { id: "log-grids", topic: "Logic", title: "Number grids and pyramids",
      idea: "Every row, side or block follows one rule. Find a line where you know almost everything and start there.",
      templates: ["logArithmagonProduct", "logAdditionPyramid", "logMagicSquareRow", "logLetterPuzzle", "logDigitSumOfSum"] }
  ];

  /* Counting Principle questions are hand-written rather than generated, so
     they are matched by topic instead of by template. */
  root.SKILL_TOPIC_FALLBACK = {
    "Counting Principle": {
      id: "count-principle", topic: "Counting Principle", title: "Counting arrangements",
      idea: "When one choice is followed by another, multiply the number of options together. Add only when the choices are alternatives."
    }
  };
})();
