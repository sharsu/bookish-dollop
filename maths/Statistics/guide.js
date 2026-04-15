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
        "Statistics charts only make sense if you read the title, axis labels, units and scale first. A bar chart with a scale of 5s tells a different story from one with a scale of 1s.",
        "The most common exam mistake is reading the picture shape without reading what each division is worth. In data questions, labels matter as much as numbers."
      ],
      steps: [
        "Read the title to see what the data is about.",
        "Check category names, axis labels and units.",
        "Work out the value of one division on the scale.",
        "Only then read off, compare or total the data values."
      ],
      tips: [
        "The scale might go up in 2s, 5s or 10s.",
        "Read all the labels before deciding the answer.",
        "Bar charts, line graphs and tables all present data differently."
      ],
      examples: [
        { title: "Bar chart", text: "If the vertical scale goes 0, 5, 10, 15, a bar reaching the third interval above 0 shows 15, not 3." },
        { title: "Line graph", text: "If each horizontal step is 1 hour and the point at hour 4 is at 18 on the scale, the value at 4 hours is 18." }
      ],
      visualLabel: "A data-reading card showing title, labels and scale.",
      visual: createStudyVisualCard({ emoji: "📊", title: "Read the chart", subtitle: "Title, labels, scale", chips: ["Title", "Axes", "Scale", "Then answer"], accent: "#0f766e" })
    },
    {
      title: "Mean, Median, Mode & Range",
      summary: "These four summaries help describe a set of data.",
      explanation: [
        "Mean = total of values ÷ number of values. Median is the middle value when the data is in order. Mode is the value with the highest frequency, and range = largest - smallest.",
        "These measures do different jobs: mean shows overall average, median shows centre, mode shows the most common result and range shows spread."
      ],
      steps: [
        "Write the data in order if you need median, mode or range.",
        "Choose the correct summary rule.",
        "Calculate carefully, especially the total for the mean.",
        "Check that the result matches the data set and is not impossible."
      ],
      tips: [
        "Mean = total ÷ number of values.",
        "Median is the middle value in order.",
        "Range = largest − smallest."
      ],
      examples: [
        { title: "Mode and range", text: "For 3, 5, 5, 8, the mode is 5 because it appears most often, and the range is 8 - 3 = 5." },
        { title: "Mean and median", text: "For 4, 6, 8, 12 the mean is (4 + 6 + 8 + 12) ÷ 4 = 30 ÷ 4 = 7.5, and the median is the average of 6 and 8, which is 7." }
      ],
      visualLabel: "A data-summary card showing the four main statistics.",
      visual: createStudyVisualCard({ emoji: "🧮", title: "Choose the right summary", subtitle: "Each one tells a different story", chips: ["Mean", "Median", "Mode", "Range"], accent: "#0ea5e9" })
    },
    {
      title: "Comparing Data",
      summary: "Statistics is not only about finding answers but also about explaining what the data means.",
      explanation: [
        "Comparing data means using evidence such as totals, averages and ranges to explain similarities and differences. A higher mean might show better average performance, while a larger range shows more spread.",
        "A strong comparison sentence includes numbers, for example 'Group A has mean 12 and Group B has mean 9, so Group A scores higher on average.'"
      ],
      steps: [
        "Choose a useful comparison measure such as total, mean or range.",
        "Read or calculate the values for both groups.",
        "State what is bigger, smaller or more spread out using numbers.",
        "Finish with a short conclusion that answers the question directly."
      ],
      tips: [
        "A bigger average does not always mean a bigger spread.",
        "Use words like higher, lower, more common or more spread out.",
        "Always support your point with evidence."
      ],
      examples: [
        { title: "Two groups", text: "If Group A has mean 12 and Group B has mean 9, Group A scores 3 marks higher on average." },
        { title: "Spread", text: "If Set 1 has range 2 and Set 2 has range 10, Set 2 is far less consistent because its values are more spread out." }
      ],
      visualLabel: "A comparison card showing two data sets being compared using evidence.",
      visual: createStudyVisualCard({ emoji: "⚖️", title: "Compare using data", subtitle: "Use evidence, not guessing", chips: ["Higher", "Lower", "Average", "Range"], accent: "#f59e0b" })
    },
    {
      title: "Pictograms & Frequency Tables",
      summary: "Sometimes data is stored in symbols or tallies instead of ordinary numbers.",
      explanation: [
        "A pictogram uses a key, so one symbol may stand for 2, 5 or another number of items. A frequency table shows each value and how often it occurs.",
        "Frequency tables also support formula work. For example, mean from a frequency table = sum of (value × frequency) ÷ total frequency."
      ],
      steps: [
        "Read the key or frequency headings first.",
        "Convert symbols or tallies into actual frequencies.",
        "Use the frequencies to total, compare or calculate a mean.",
        "Check that the total frequency matches the number of items described."
      ],
      tips: [
        "Half a symbol may mean half the key value.",
        "Frequency means how often something happens.",
        "A total-frequency check can catch errors."
      ],
      examples: [
        { title: "Pictogram", text: "If one smiley stands for 4 children, then 2 1/2 smileys stand for 10 children because 2.5 × 4 = 10." },
        { title: "Frequency mean", text: "If values 2, 4 and 6 have frequencies 1, 3 and 2, then mean = (2×1 + 4×3 + 6×2) ÷ (1+3+2) = 26 ÷ 6 = 4 1/3." }
      ],
      visualLabel: "A frequency card showing keys, tallies and counts.",
      visual: createStudyVisualCard({ emoji: "📝", title: "Count carefully", subtitle: "The key changes everything", chips: ["Key", "Frequency", "Tallies", "Total"], accent: "#22c55e" })
    }
  ]
});
