registerStudyGuide({
  topic: "Statistics",
  icon: "📊",
  summary: "Statistics helps you read data, organise it and describe what it shows.",
  intro: "These questions reward calm reading because the chart often tells you the answer if you read the labels and scale properly.",
  keyIdea: "Read first, calculate second.",
  visualLabel: "A statistics card showing common data skills.",
  visual: createStudyVisualCard({
    emoji: "📊",
    title: "Read the data",
    subtitle: "Then choose the right summary",
    chips: ["Mean", "Median", "Mode", "Range"],
    accent: "#0f766e"
  }),
  concepts: [
    {
      title: "Reading Tables & Charts",
      summary: "The title, labels and scale are the first clues to read.",
      explanation: [
        "Statistics questions often begin with a chart, table or graph. Before you calculate anything, make sure you understand what the picture is showing.",
        "The most common mistakes happen when children rush past the scale or miss what each bar or line stands for."
      ],
      steps: [
        "Read the title first.",
        "Check the labels on the axes or categories.",
        "Work out what each step on the scale means.",
        "Then read or compare the data."
      ],
      tips: [
        "The scale might go up in 2s, 5s or 10s.",
        "Read all the labels before deciding the answer.",
        "Bar charts, line graphs and tables all present data differently."
      ],
      examples: [
        { title: "Bar chart", text: "If the bars go up in 5s, a bar at the third line means 15." },
        { title: "Table", text: "A table can be easier to read if you cover one row at a time." }
      ],
      visualLabel: "A data-reading card showing title, labels and scale.",
      visual: createStudyVisualCard({ emoji: "📊", title: "Read the chart", subtitle: "Title, labels, scale", chips: ["Title", "Axes", "Scale", "Then answer"], accent: "#0f766e" })
    },
    {
      title: "Mean, Median, Mode & Range",
      summary: "These four summaries help describe a set of data.",
      explanation: [
        "Mean gives an overall average, median finds the middle, mode finds the most common value and range measures the spread.",
        "These all tell you something different, so the question may choose one because it reveals the most useful fact."
      ],
      steps: [
        "Put the data in order if needed.",
        "Choose the summary the question asks for.",
        "Use the correct rule for that summary.",
        "Check your answer against the original data."
      ],
      tips: [
        "Mean = total ÷ number of values.",
        "Median is the middle value in order.",
        "Range = largest − smallest."
      ],
      examples: [
        { title: "Mode and range", text: "For 3, 5, 5, 8 the mode is 5 and the range is 5." },
        { title: "Mean", text: "For 4, 6, 8, the mean is 18 ÷ 3 = 6." }
      ],
      visualLabel: "A data-summary card showing the four main statistics.",
      visual: createStudyVisualCard({ emoji: "🧮", title: "Choose the right summary", subtitle: "Each one tells a different story", chips: ["Mean", "Median", "Mode", "Range"], accent: "#0ea5e9" })
    },
    {
      title: "Comparing Data",
      summary: "Statistics is not only about finding answers but also about explaining what the data means.",
      explanation: [
        "Some questions ask you to compare two groups or two charts. You might compare averages, totals or spread to decide which group did better or was more varied.",
        "Always use actual data from the graph or table to support your answer."
      ],
      steps: [
        "Look for what is similar and what is different.",
        "Use numbers from the chart, not just opinion words.",
        "Compare totals, averages or ranges if useful.",
        "Write a short clear conclusion."
      ],
      tips: [
        "A bigger average does not always mean a bigger spread.",
        "Use words like higher, lower, more common or more spread out.",
        "Always support your point with evidence."
      ],
      examples: [
        { title: "Two groups", text: "If Group A has a mean of 12 and Group B has a mean of 9, Group A did better on average." },
        { title: "Spread", text: "If one set has range 2 and another has range 10, the second set is much more spread out." }
      ],
      visualLabel: "A comparison card showing two data sets being compared using evidence.",
      visual: createStudyVisualCard({ emoji: "⚖️", title: "Compare using data", subtitle: "Use evidence, not guessing", chips: ["Higher", "Lower", "Average", "Range"], accent: "#f59e0b" })
    },
    {
      title: "Pictograms & Frequency Tables",
      summary: "Sometimes data is stored in symbols or tallies instead of ordinary numbers.",
      explanation: [
        "A pictogram may use a symbol worth more than one item, and a frequency table counts how often each value appears. Both need careful reading.",
        "The key or tally value matters just as much as the picture or table itself."
      ],
      steps: [
        "Read the key or tally system first.",
        "Turn symbols or tallies into numbers.",
        "Add or compare the frequencies.",
        "Check the total if needed."
      ],
      tips: [
        "Half a symbol may mean half the key value.",
        "Frequency means how often something happens.",
        "A total-frequency check can catch errors."
      ],
      examples: [
        { title: "Pictogram", text: "If one smiley stands for 4 children, two smileys mean 8 children." },
        { title: "Frequency table", text: "If the value 6 has frequency 3, then 6 appears three times." }
      ],
      visualLabel: "A frequency card showing keys, tallies and counts.",
      visual: createStudyVisualCard({ emoji: "📝", title: "Count carefully", subtitle: "The key changes everything", chips: ["Key", "Frequency", "Tallies", "Total"], accent: "#22c55e" })
    }
  ]
});
