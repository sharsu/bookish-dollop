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
        "Start with the visual, not the question. In the picture below, the table and the bar chart show the same fruit data, so you can practise reading the information in two different ways.",
        "Read the title first, then the category labels, then the scale. The bar chart scale goes up in 2s, so a bar reaching the line marked 6 means 6, not 3 bars or 3 spaces."
      ],
      steps: [
        "Read the title to see what the table or chart is about.",
        "Check the category names, such as Apple, Banana and Pear.",
        "Look at the scale and work out what one step is worth.",
        "Read one value carefully, then compare or total the rest."
      ],
      tips: [
        "The scale might go up in 2s, 5s or 10s.",
        "Read all the labels before deciding the answer.",
        "Bar charts, line graphs and tables all present data differently."
      ],
      examples: [
        { title: "Using the visual", text: "In the chart below, Apple reaches 6 because its bar reaches the line labelled 6 on a scale counting in 2s." },
        { title: "Table check", text: "You can check the same answer in the table: the Apple row also shows 6, so the table and chart agree." }
      ],
      visualLabel: "A worked example showing a small table and matching bar chart with a labelled scale.",
      visual: createStatisticsChartVisual({ title: "Favourite Fruit", categories: ["Apple", "Banana", "Pear"], values: [6, 4, 8], step: 2, accent: "#0f766e" })
    },
    {
      title: "Mean, Median, Mode & Range",
      summary: "These four summaries help describe a set of data.",
      explanation: [
        "The visual below uses the data set 4, 6, 8, 12. It shows how the same four numbers can be used to find different summaries depending on the question.",
        "Mean = total ÷ number of values, median is the middle value when ordered, mode is the most common value, and range = largest - smallest. Each summary tells you something different about the same data."
      ],
      steps: [
        "Write the data in order first.",
        "For the mean, add all the values and divide by how many there are.",
        "For the median, find the middle value or the middle pair.",
        "For the range, subtract the smallest value from the largest value."
      ],
      tips: [
        "Mean = total ÷ number of values.",
        "Median is the middle value in order.",
        "Range = largest − smallest."
      ],
      examples: [
        { title: "Mean from the visual", text: "For 4, 6, 8, 12, add first: 4 + 6 + 8 + 12 = 30. Then divide by 4 to get mean 7.5." },
        { title: "Median and range", text: "The middle pair is 6 and 8, so median = (6 + 8) ÷ 2 = 7. The range is 12 - 4 = 8." }
      ],
      visualLabel: "A worked data example showing how to find mean, median and range from one ordered set.",
      visual: createStatisticsSummaryVisual({ values: [4, 6, 8, 12], accent: "#0ea5e9" })
    },
    {
      title: "Comparing Data",
      summary: "Statistics is not only about finding answers but also about explaining what the data means.",
      explanation: [
        "The visual below compares two groups. Group A has the higher mean, so it scores better on average, but Group B has the larger range, so its results are less consistent.",
        "When comparing data, always say what is higher or lower and support it with numbers. A strong answer uses words and evidence together."
      ],
      steps: [
        "Choose a useful measure, such as mean, total or range.",
        "Read or calculate the values for both groups.",
        "Write one sentence about average and one about spread if needed.",
        "Finish with a short conclusion that answers the question directly."
      ],
      tips: [
        "A bigger average does not always mean a bigger spread.",
        "Use words like higher, lower, more common or more spread out.",
        "Always support your point with evidence."
      ],
      examples: [
        { title: "Average", text: "Using the visual, Group A has mean 12 and Group B has mean 9, so Group A scores 3 marks higher on average." },
        { title: "Spread", text: "Using the same visual, Group B has range 10 while Group A has range 4, so Group B is more spread out." }
      ],
      visualLabel: "A comparison visual showing two groups with different means and ranges.",
      visual: createStatisticsComparisonVisual({ accent: "#f59e0b" })
    },
    {
      title: "Pictograms & Frequency Tables",
      summary: "Sometimes data is stored in symbols or tallies instead of ordinary numbers.",
      explanation: [
        "The visual below shows the same idea in two ways: a pictogram with a key and a frequency table. In the pictogram, one apple symbol stands for 2 fruit, so you must multiply the pictures by the key value.",
        "A frequency table records how often each value appears. It also helps with calculations such as mean from a table, where mean = Σ(value × frequency) ÷ total frequency."
      ],
      steps: [
        "Read the key or frequency heading first.",
        "Turn the symbols or rows into actual numbers.",
        "Use the values and frequencies to total or compare the data.",
        "For a mean, multiply each value by its frequency, then divide by the total frequency."
      ],
      tips: [
        "Half a symbol may mean half the key value.",
        "Frequency means how often something happens.",
        "A total-frequency check can catch errors."
      ],
      examples: [
        { title: "Pictogram", text: "In the pictogram below, Apples has 3 symbols and each symbol means 2 fruit, so Apples = 3 × 2 = 6 fruit." },
        { title: "Frequency mean", text: "From the frequency table below, mean = (2×1 + 4×3 + 6×2) ÷ (1+3+2) = 26 ÷ 6 = 4 1/3." }
      ],
      visualLabel: "A worked pictogram and frequency-table example showing how the key and frequency values are read.",
      visual: createStatisticsFrequencyVisual({ accent: "#22c55e" })
    }
  ]
});
