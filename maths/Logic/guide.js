registerStudyGuide({
  topic: "Logic",
  icon: "🧩",
  summary: "Logic is about using clues, spotting what must be true and ruling out what cannot work.",
  intro: "These questions are less about calculation and more about organised thinking.",
  keyIdea: "Go step by step and let the clues do the work.",
  visualLabel: "A full-width logic overview visual mapping the main reasoning ideas in this topic.",
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
      visualLabel: "A full-width logic visual highlighting the clue words that control the reasoning.",
      visual: createLogicClueVisual({ accent: "#f43f5e" })
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
      visualLabel: "A full-width logic-grid visual showing how ticks and crosses remove possibilities.",
      visual: createLogicGridVisual({ accent: "#0ea5e9" })
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
      visualLabel: "A full-width ordering visual showing positions filled from the surest clues first.",
      visual: createLogicOrderVisual({ accent: "#f59e0b" })
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
      visualLabel: "A full-width logic-pattern visual showing a rule changing step by step and asking for the next image.",
      visual: createLogicPatternVisual({ accent: "#22c55e" })
    },
    {
      title: "Consecutive Numbers and Means",
      summary: "Write consecutive numbers from one starting value, then use the sum or the mean to pin them down.",
      explanation: [
        "Consecutive numbers move by a fixed step, so you can describe them neatly with one variable. Natural numbers can be written as x, x + 1, x + 2, while consecutive even or odd numbers are x, x + 2, x + 4.",
        "In an evenly spaced list, the mean sits in the middle. That means many word problems become quicker because total = mean × number of terms, and the middle term tells you the whole set."
      ],
      steps: [
        "Decide whether the numbers increase by 1, by 2, or by another fixed step.",
        "Write the numbers in a pattern such as x, x + 1, x + 2 or x, x + 2, x + 4.",
        "Use the given sum, mean or condition to make one equation.",
        "Solve, then check that your answers really are consecutive and match the clue."
      ],
      tips: [
        "For three consecutive numbers, the middle number is the mean.",
        "Even and odd consecutive numbers jump by 2, not by 1.",
        "A quick final check catches many sign mistakes."
      ],
      examples: [
        { title: "Three consecutive even numbers", text: "If three consecutive even integers add to 108, their mean is 36, so the numbers are 34, 36 and 38." },
        { title: "Four consecutive integers", text: "If four consecutive integers have mean 9.5, the set must be 8, 9, 10 and 11, so the largest is 11." }
      ],
      visualLabel: "A full-width consecutive-number visual showing how one starting value generates the full set.",
      visual: createStudyVisualCard({
        emoji: "🔢",
        title: "Build the number pattern",
        subtitle: "Use one starting value and a fixed step",
        chips: ["x, x+1, x+2", "even/odd = +2", "middle = mean", "solve then check"],
        accent: "#8b5cf6"
      })
    },
    {
      title: "Palindromic Number Logic",
      summary: "Palindromes read the same forwards and backwards, so matching outer digits is the key idea.",
      explanation: [
        "A palindromic number is symmetrical: the first and last digits match, then the next pair match, and so on. This makes many palindrome puzzles really about digit positions rather than long calculation.",
        "When you need the next palindrome, copy the left side onto the right side and then decide whether that mirrored number is already big enough. Many clue questions also work by narrowing digit choices from the outside in."
      ],
      steps: [
        "Write the digit pattern first, such as aba, abba or abcba.",
        "Use the clues to fix the first and last digits together, then the next pair.",
        "Check any extra condition such as prime, square, total of digits or size range.",
        "For the next palindrome, mirror the left half and compare it with the original number."
      ],
      tips: [
        "Every two-digit palindrome has matching digits like 11, 22 or 33.",
        "All four-digit palindromes are divisible by 11.",
        "A palindrome clue often becomes much easier after you sketch the digit pattern."
      ],
      examples: [
        { title: "Digit-sum clue", text: "A three-digit palindrome between 200 and 500 with odd digits summing to 7 must be 313." },
        { title: "Next palindrome", text: "For 5346, mirror the outer digits to get 5445, which is the first palindrome greater than 5346." }
      ],
      visualLabel: "A full-width palindrome visual showing digits mirrored around the centre.",
      visual: createStudyVisualCard({
        emoji: "🪞",
        title: "Match the outer digits",
        subtitle: "Palindromes are mirror-symmetric numbers",
        chips: ["aba / abba", "mirror left to right", "use digit clues", "check the range"],
        accent: "#ec4899"
      })
    },
    {
      title: "Clock Angles and Mirror Times",
      summary: "Clock logic mixes angle facts with careful time reading, especially when mirrors are involved.",
      explanation: [
        "A full clock turn is 360°, so each hour mark is 30° apart. The minute hand moves 6° per minute and the hour hand moves 0.5° per minute, which leads to the angle rule |30H - 5.5M|.",
        "Mirror-clock questions use symmetry on the dial. For an analogue clock, a quick rule is mirror time = 11:60 − given time, with 12:00 staying 12:00. Then decide whether the question wants the smaller angle, a reflex angle or the actual time."
      ],
      steps: [
        "Work out the hour-hand position and the minute-hand position.",
        "Subtract to find the angle, then choose the smaller or reflex angle asked for.",
        "For a mirror problem, use 11:60 − time.",
        "Check whether the answer should be a time, an acute angle, the smaller angle or the reflex angle."
      ],
      tips: [
        "Each hour mark is 30° apart.",
        "The smaller angle is the smaller of x and 360 − x.",
        "Mirror problems often look harder than they really are once you use 11:60 − time."
      ],
      examples: [
        { title: "Angle question", text: "At 2:00, the hands are two hour marks apart, so the acute angle is 60°." },
        { title: "Mirror-time question", text: "The mirror image of 3:25 is 8:35 because 11:60 − 3:25 = 8:35." }
      ],
      visualLabel: "A full-width clock visual summarising angle and mirror-time rules.",
      visual: createStudyVisualCard({
        emoji: "🕒",
        title: "Use the clock rules",
        subtitle: "Angles and mirror times follow clear patterns",
        chips: ["30° per hour", "6° per minute", "smaller vs reflex", "11:60 − time"],
        accent: "#0f766e"
      })
    },
    {
      title: "Calendar and Odd-Day Reasoning",
      summary: "Calendar questions become manageable when you count odd days and move through the week carefully.",
      explanation: [
        "A normal year has 365 days = 52 weeks + 1 odd day, while a leap year has 366 days = 52 weeks + 2 odd days. Century years are only leap years if they are divisible by 400.",
        "Many calendar questions reduce to moving forward or backward by a remainder after dividing by 7. This works for same-month questions, date gaps across months, leap-year checks and relative day puzzles such as 'the day before yesterday'."
      ],
      steps: [
        "Decide whether the problem is about a date jump, a leap-year rule or a relative day statement.",
        "Convert the information into a number of days moved forward or backward.",
        "Reduce the move modulo 7, because full weeks do not change the weekday.",
        "Land on the final day and check whether leap-year conditions matter."
      ],
      tips: [
        "A century year must be divisible by 400 to be a leap year.",
        "Subtracting or adding full weeks never changes the weekday.",
        "Relative day problems are easier after you first identify today."
      ],
      examples: [
        { title: "Leap-year check", text: "1600 is a leap year, but 1900 is not, because century years must be divisible by 400." },
        { title: "Date shift", text: "If the 23rd is a Sunday, then two weeks and four days earlier is 18 days earlier. That is 4 days back, so the answer is Wednesday." }
      ],
      visualLabel: "A full-width calendar visual showing odd-day ideas and weekday movement.",
      visual: createStudyVisualCard({
        emoji: "📅",
        title: "Count the odd days",
        subtitle: "Reduce date jumps to a move on the week cycle",
        chips: ["normal = 1", "leap = 2", "mod 7", "move and check"],
        accent: "#2563eb"
      })
    },
    {
      title: "Magic Squares, Pyramids and Arithmagons",
      summary: "These puzzles all hide a number structure: equal totals, build-up sums or linked corner values.",
      explanation: [
        "In a magic square, every row, column and diagonal has the same total. In an addition pyramid, each brick is the sum of the two below it. In an arithmagon, each side is built from the two corner numbers joined to it.",
        "The logical skill is to move from the strongest number fact first. Sometimes that means subtracting from a known total, and sometimes it means working around a shape one step at a time until the whole structure is fixed."
      ],
      steps: [
        "Write the one rule for the puzzle before filling anything in.",
        "Use any completed row, side or top value to find a missing number by subtraction or addition.",
        "Update nearby spaces immediately because one found number often unlocks the next.",
        "Check the whole shape at the end, not just the part you used first."
      ],
      tips: [
        "Magic-square rows, columns and diagonals must all agree.",
        "In pyramids, build upward with addition and downward with subtraction.",
        "In arithmagons, move around the triangle steadily instead of guessing corners."
      ],
      examples: [
        { title: "Magic-square row", text: "If a magic-square row totals 75 and two entries are 30 and 40, the middle number in that row must be 5." },
        { title: "Addition pyramid", text: "With bottom bricks 20, 30 and 20, the next row is 50 and 50, so the top brick is 100." }
      ],
      visualLabel: "A full-width puzzle visual linking equal totals, build-up pyramids and arithmagon edges.",
      visual: createStudyVisualCard({
        emoji: "🔺",
        title: "Use the shape rule",
        subtitle: "Each puzzle has one linking number rule",
        chips: ["same total", "add upwards", "subtract backwards", "check every side"],
        accent: "#d97706"
      })
    },
    {
      title: "Letter-Number Codes",
      summary: "Letter-code puzzles become simpler when you compare two almost-matching sums and spot the extra letter.",
      explanation: [
        "A letter-number code treats each letter like an unknown value. The fastest move is often to compare two equations that are nearly the same, because subtraction reveals the missing letter immediately.",
        "After finding one letter, substitute it back into an earlier total to find the remaining sum or another missing value. This is logical elimination written with numbers."
      ],
      steps: [
        "Write the two given sums clearly one under the other.",
        "Subtract matching parts to isolate the extra letter or repeated letter.",
        "Use the value you found to work out the remaining letters or group total.",
        "Check the answer in every equation given."
      ],
      tips: [
        "Repeated words often mean one letter is being counted twice.",
        "Subtracting two equations can be faster than solving everything separately.",
        "You may only need a total like C + A + T, not every single letter."
      ],
      examples: [
        { title: "Find the repeated letter", text: "If C + A + T + S = 27 and C + A + T + S + S = 35, then S = 8." },
        { title: "Then find the rest", text: "Once S = 8, the value of C + A + T is 27 − 8 = 19." }
      ],
      visualLabel: "A full-width code visual showing two similar equations and the subtraction step between them.",
      visual: createStudyVisualCard({
        emoji: "🔤",
        title: "Compare the two sums",
        subtitle: "Subtract matching parts to reveal the letter value",
        chips: ["line up totals", "subtract", "substitute back", "check all clues"],
        accent: "#7c3aed"
      })
    }
  ]
});
