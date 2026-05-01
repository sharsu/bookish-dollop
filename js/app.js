/* ═══════════════════════════════════════════════════════════════════
   DRAWING PAD — Canvas for rough work
═══════════════════════════════════════════════════════════════════ */

class DrawingPad {
  constructor() {
    this.canvas = document.getElementById('drawing-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.penSize = 2;
    this.history = [];

    this.setupCanvas();
    this.attachEventListeners();
  }

  setupCanvas() {
    // Initial setup — canvas may not be visible yet, so just set defaults
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = this.penSize;
    this.ctx.strokeStyle = '#1e1b4b';
    this._lastWidth = 0;
    this._lastHeight = 0;
  }

  resizeCanvas() {
    // Match internal pixel buffer to the CSS-rendered size (1:1, no scaling)
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (w > 0 && h > 0 && (w !== this._lastWidth || h !== this._lastHeight)) {
      this.canvas.width = w;
      this.canvas.height = h;
      // Reset context properties (setting width/height clears them)
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.lineWidth = this.penSize;
      this.ctx.strokeStyle = '#1e1b4b';
      this._lastWidth = w;
      this._lastHeight = h;
      this.history = [];
      this.saveState();
    }
  }

  attachEventListeners() {
    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseout', () => this.stopDrawing());

    // Touch events (for tablets/iPad)
    this.canvas.addEventListener('touchstart', (e) => this.startDrawing(e));
    this.canvas.addEventListener('touchmove', (e) => this.draw(e));
    this.canvas.addEventListener('touchend', () => this.stopDrawing());

    // Pen size buttons
    document.getElementById('pen-size-small').addEventListener('click', () => {
      this.setPenSize(2);
    });
    document.getElementById('pen-size-medium').addEventListener('click', () => {
      this.setPenSize(4);
    });
    document.getElementById('pen-size-large').addEventListener('click', () => {
      this.setPenSize(6);
    });

    // Clear and undo buttons
    document.getElementById('clear-pad-btn').addEventListener('click', () => this.clearCanvas());
    document.getElementById('undo-btn').addEventListener('click', () => this.undo());

    // Keyboard shortcut (Ctrl+Z for undo)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        this.undo();
      }
    });
  }

  getCoordinates(e) {
    const rect = this.canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.offsetX,
        y: e.offsetY
      };
    }
  }

  startDrawing(e) {
    const coords = this.getCoordinates(e);
    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(coords.x, coords.y);
  }

  draw(e) {
    if (!this.isDrawing) return;
    const coords = this.getCoordinates(e);
    this.ctx.lineWidth = this.penSize;
    this.ctx.strokeStyle = '#1e1b4b';
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();
  }

  stopDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.ctx.closePath();
    this.saveState();
  }

  setPenSize(size) {
    this.penSize = size;
    document.querySelectorAll('.btn-icon-small').forEach(btn => {
      btn.classList.remove('btn-size-active');
    });

    if (size === 2) document.getElementById('pen-size-small').classList.add('btn-size-active');
    if (size === 4) document.getElementById('pen-size-medium').classList.add('btn-size-active');
    if (size === 6) document.getElementById('pen-size-large').classList.add('btn-size-active');
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.saveState();
  }

  saveState() {
    this.history.push(this.canvas.toDataURL());
    // Keep only last 20 states to save memory
    if (this.history.length > 20) {
      this.history.shift();
    }
  }

  undo() {
    if (this.history.length > 1) {
      this.history.pop();
      const imageData = new Image();
      imageData.src = this.history[this.history.length - 1];
      imageData.onload = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(imageData, 0, 0);
      };
    }
  }

  reset() {
    this.clearCanvas();
    this.history = [];
    this.saveState();
  }
}

const SUPER_HARD_DIFFICULTY = 4;
const ACTIVE_EXAM_STORAGE_KEY = "mathsExamPrepActiveExam";
const ACTIVE_EXAM_SAVE_VERSION = 1;
const RESULTS_STORAGE_KEY = "mathsExamPrepResults";
const ADAPTIVE_RESULTS_WINDOW = 5;
const MAX_STORED_RESULTS = 100;
const TEST_TYPE_CONFIG = Object.freeze({
  maths: {
    key: "maths",
    label: "Maths Test",
    setupTitle: "Ready for a Maths Test?",
    setupSubtitle: "Good luck! Do your best! 🌟",
    startLabel: "🚀 Start Maths Test",
    learnTopics: true,
    defaultQuestions: CONFIG.defaultQuestions,
    defaultTimeLimit: CONFIG.defaultTimeLimit
  },
  nvrt: {
    key: "nvrt",
    label: "NVRT Test",
    setupTitle: "Ready for an NVRT Test?",
    setupSubtitle: "Look for patterns, read carefully and trust your thinking. 🧩",
    startLabel: "🧩 Start NVRT Test",
    learnTopics: false,
    defaultQuestions: CONFIG.defaultQuestions,
    defaultTimeLimit: CONFIG.defaultTimeLimit
  }
});

function normalizeTestType(testType) {
  return testType === "nvrt" ? "nvrt" : "maths";
}

function getTestTypeConfig(testType) {
  return TEST_TYPE_CONFIG[normalizeTestType(testType)] || TEST_TYPE_CONFIG.maths;
}

function getTestTypeLabel(testType) {
  return getTestTypeConfig(testType).label;
}

function getQuestionBankForTestType(testType) {
  const normalized = normalizeTestType(testType);
  const root = typeof window !== "undefined" ? window : globalThis;
  if (normalized === "nvrt") {
    return Array.isArray(root.NVRT_QUESTIONS) ? root.NVRT_QUESTIONS : [];
  }
  return typeof QUESTIONS !== "undefined" && Array.isArray(QUESTIONS) ? QUESTIONS : [];
}

function matchesTestType(result, testType) {
  return normalizeTestType(result?.testType) === normalizeTestType(testType);
}

function getDifficultyMeta(difficulty) {
  return CONFIG.difficultyLabel[difficulty] || CONFIG.difficultyLabel[3];
}

function getStorage() {
  try {
    return typeof localStorage !== "undefined" ? localStorage : null;
  } catch (error) {
    console.warn("Local storage is unavailable:", error);
    return null;
  }
}

function formatDuration(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatCompletedAt(isoString) {
  const date = isoString ? new Date(isoString) : new Date();
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function loadStoredResults() {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(RESULTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter(result => result && typeof result.percentage === "number" && Array.isArray(result.topicBreakdown))
      : [];
  } catch (error) {
    console.warn("Could not load saved results:", error);
    return [];
  }
}

function persistStoredResults(results) {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results.slice(0, MAX_STORED_RESULTS)));
    return true;
  } catch (error) {
    console.warn("Could not save results:", error);
    return false;
  }
}

function averageOf(values) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function buildProgressSummary(results) {
  if (!results.length) {
    return {
      testsTaken: 0,
      averageScore: 0,
      bestScore: 0,
      latestScore: 0,
      averageTime: 0,
      trendText: "Need more tests",
      strongestTopic: null,
      focusTopic: null,
      topicSummary: [],
      recentResults: []
    };
  }

  const percentages = results.map(result => result.percentage);
  const times = results.map(result => result.timeTakenSeconds || 0);
  const recentWindow = results.slice(0, Math.min(3, results.length)).map(result => result.percentage);
  const previousWindow = results.slice(3, 6).map(result => result.percentage);
  const trendDelta = previousWindow.length
    ? averageOf(recentWindow) - averageOf(previousWindow)
    : results.length > 1
      ? results[0].percentage - results[1].percentage
      : 0;

  const topicMap = {};
  results.forEach(result => {
    result.topicBreakdown.forEach(topic => {
      if (!topicMap[topic.topic]) {
        topicMap[topic.topic] = { topic: topic.topic, correct: 0, total: 0 };
      }
      topicMap[topic.topic].correct += topic.correct || 0;
      topicMap[topic.topic].total += topic.total || 0;
    });
  });

  const topicSummary = Object.values(topicMap)
    .map(topic => ({
      ...topic,
      percentage: topic.total ? Math.round((topic.correct / topic.total) * 100) : 0
    }))
    .sort((a, b) => b.percentage - a.percentage || b.total - a.total || a.topic.localeCompare(b.topic));

  return {
    testsTaken: results.length,
    averageScore: averageOf(percentages),
    bestScore: Math.max(...percentages),
    latestScore: results[0].percentage,
    averageTime: averageOf(times),
    trendText: results.length < 2 ? "Need more tests" : trendDelta === 0 ? "Steady" : `${trendDelta > 0 ? "+" : ""}${trendDelta} pts`,
    strongestTopic: topicSummary[0] || null,
    focusTopic: topicSummary[topicSummary.length - 1] || null,
    topicSummary,
    recentResults: results.slice(0, 10)
  };
}

function loadActiveExamState() {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(ACTIVE_EXAM_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== ACTIVE_EXAM_SAVE_VERSION) return null;
    if (!Array.isArray(parsed.quizQuestions) || !parsed.quizQuestions.length) return null;

    return {
      ...parsed,
      answers: parsed.answers && typeof parsed.answers === "object" ? parsed.answers : {}
    };
  } catch (error) {
    console.warn("Could not load active exam:", error);
    return null;
  }
}

function persistActiveExamState(snapshot) {
  const storage = getStorage();
  if (!storage || !snapshot) return false;

  try {
    storage.setItem(ACTIVE_EXAM_STORAGE_KEY, JSON.stringify({
      ...snapshot,
      version: ACTIVE_EXAM_SAVE_VERSION
    }));
    return true;
  } catch (error) {
    console.warn("Could not save active exam:", error);
    return false;
  }
}

function clearActiveExamState() {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(ACTIVE_EXAM_STORAGE_KEY);
  } catch (error) {
    console.warn("Could not clear active exam:", error);
  }
}

function getValidQuestionPool(pool) {
  if (!Array.isArray(pool)) return [];
  return pool.filter(q => q && typeof q.difficulty === "number" && Array.isArray(q.options));
}

function buildDifficultyTargets(totalQuestions) {
  const difficulties = [1, 2, 3, 4];
  return buildTargets(difficulties, totalQuestions);
}

function buildWeightedTargets(items, weightMap, totalQuestions) {
  const rawTargets = items.map(item => {
    const raw = (weightMap[item] || 0) * totalQuestions;
    return { item, count: Math.floor(raw), fraction: raw - Math.floor(raw) };
  });

  let assigned = rawTargets.reduce((sum, entry) => sum + entry.count, 0);
  rawTargets.sort((a, b) => b.fraction - a.fraction || b.item - a.item);

  for (let i = 0; assigned < totalQuestions && i < rawTargets.length; i += 1, assigned += 1) {
    rawTargets[i].count += 1;
  }

  return Object.fromEntries(rawTargets.map(entry => [entry.item, entry.count]));
}

function buildTargets(items, totalQuestions) {
  const base = Math.floor(totalQuestions / items.length);
  let remainder = totalQuestions % items.length;
  const targets = Object.fromEntries(items.map(item => [item, base]));

  items.forEach(item => {
    if (remainder > 0) {
      targets[item] += 1;
      remainder -= 1;
    }
  });

  return targets;
}

function getBucketCount(buckets, difficulty, topic) {
  return buckets[difficulty]?.[topic]?.length || 0;
}

function hasAvailableQuestionsForDifficulty(buckets, difficulty, topics) {
  return topics.some(topic => getBucketCount(buckets, difficulty, topic) > 0);
}

function hasAvailableQuestionsForTopic(buckets, topic, difficulties) {
  return difficulties.some(level => getBucketCount(buckets, level, topic) > 0);
}

function buildAdaptiveDifficultyTargets(totalQuestions, recentResults) {
  const recent = recentResults.slice(0, ADAPTIVE_RESULTS_WINDOW);
  if (recent.length < 2) return buildDifficultyTargets(totalQuestions);

  const averageScore = averageOf(recent.map(result => result.percentage));
  if (averageScore < 45) {
    return buildWeightedTargets([1, 2, 3, 4], { 1: 0.4, 2: 0.35, 3: 0.2, 4: 0.05 }, totalQuestions);
  }
  if (averageScore < 60) {
    return buildWeightedTargets([1, 2, 3, 4], { 1: 0.3, 2: 0.3, 3: 0.25, 4: 0.15 }, totalQuestions);
  }
  if (averageScore < 75) {
    return buildWeightedTargets([1, 2, 3, 4], { 1: 0.2, 2: 0.3, 3: 0.3, 4: 0.2 }, totalQuestions);
  }
  if (averageScore < 85) {
    return buildWeightedTargets([1, 2, 3, 4], { 1: 0.15, 2: 0.25, 3: 0.3, 4: 0.3 }, totalQuestions);
  }

  return buildWeightedTargets([1, 2, 3, 4], { 1: 0.1, 2: 0.2, 3: 0.3, 4: 0.4 }, totalQuestions);
}

function buildTopicDifficultyPreferences(topics, recentResults, fallbackOrder) {
  const recent = recentResults.slice(0, ADAPTIVE_RESULTS_WINDOW);

  return Object.fromEntries(topics.map(topic => {
    const percentages = [];
    recent.forEach(result => {
      const match = result.topicBreakdown?.find(entry => entry.topic === topic);
      if (match && typeof match.percentage === "number") {
        percentages.push(match.percentage);
      }
    });

    if (!percentages.length) return [topic, fallbackOrder.slice()];

    const averageTopicScore = averageOf(percentages);
    if (averageTopicScore < 50) return [topic, [1, 2, 3, 4]];
    if (averageTopicScore < 65) return [topic, [2, 1, 3, 4]];
    if (averageTopicScore < 80) return [topic, [3, 2, 4, 1]];
    return [topic, [4, 3, 2, 1]];
  }));
}

function selectQuizQuestions(pool, totalQuestions, shuffleArray, options = {}) {
  const validPool = getValidQuestionPool(pool);
  const difficultyOrder = shuffleArray([1, 2, 3, 4]);
  const topics = shuffleArray([...new Set(validPool.map(q => q.topic))]);
  const storedResults = loadStoredResults().filter(result => matchesTestType(result, options.testType));
  const studentResults = options.studentName
    ? storedResults.filter(result => result.studentName === options.studentName)
    : storedResults;
  const difficultyTargets = buildAdaptiveDifficultyTargets(totalQuestions, studentResults);
  const topicTargets = buildTargets(topics, totalQuestions);
  const topicDifficultyPreferences = buildTopicDifficultyPreferences(topics, studentResults, difficultyOrder);
  const selected = [];
  const difficultyCounts = Object.fromEntries(difficultyOrder.map(level => [level, 0]));
  const topicCounts = Object.fromEntries(topics.map(topic => [topic, 0]));
  const topicDifficultyCounts = Object.fromEntries(
    topics.map(topic => [topic, Object.fromEntries(difficultyOrder.map(level => [level, 0]))])
  );
  const buckets = Object.fromEntries(
    difficultyOrder.map(level => [level, Object.fromEntries(topics.map(topic => [topic, []]))])
  );

  shuffleArray(validPool).forEach(question => {
    if (buckets[question.difficulty]?.[question.topic]) {
      buckets[question.difficulty][question.topic].push(question);
    }
  });

  while (selected.length < totalQuestions) {
    const candidateTopics = topics
      .filter(topic => topicCounts[topic] < topicTargets[topic] && hasAvailableQuestionsForTopic(buckets, topic, difficultyOrder));
    const fallbackTopics = topics.filter(topic => hasAvailableQuestionsForTopic(buckets, topic, difficultyOrder));
    const topicPool = candidateTopics.length ? candidateTopics : fallbackTopics;

    if (!topicPool.length) break;

    topicPool.sort((a, b) => {
      const topicNeedA = topicTargets[a] - topicCounts[a];
      const topicNeedB = topicTargets[b] - topicCounts[b];
      if (topicNeedA !== topicNeedB) return topicNeedB - topicNeedA;

      const totalAvailableA = difficultyOrder.reduce((sum, level) => sum + getBucketCount(buckets, level, a), 0);
      const totalAvailableB = difficultyOrder.reduce((sum, level) => sum + getBucketCount(buckets, level, b), 0);
      if (totalAvailableA !== totalAvailableB) return totalAvailableB - totalAvailableA;

      return topicCounts[a] - topicCounts[b];
    });

    const chosenTopic = topicPool[0];

    const candidateDifficulties = difficultyOrder
      .filter(level => difficultyCounts[level] < difficultyTargets[level] && getBucketCount(buckets, level, chosenTopic) > 0);
    const fallbackDifficulties = difficultyOrder.filter(level => getBucketCount(buckets, level, chosenTopic) > 0);
    const difficultyPool = candidateDifficulties.length ? candidateDifficulties : fallbackDifficulties;

    if (!difficultyPool.length) break;

    difficultyPool.sort((a, b) => {
      const preferredOrder = topicDifficultyPreferences[chosenTopic] || difficultyOrder;
      const preferenceA = preferredOrder.indexOf(a);
      const preferenceB = preferredOrder.indexOf(b);
      if (preferenceA !== preferenceB) return preferenceA - preferenceB;

      const needA = difficultyTargets[a] - difficultyCounts[a];
      const needB = difficultyTargets[b] - difficultyCounts[b];
      if (needA !== needB) return needB - needA;

      const pairCountA = topicDifficultyCounts[chosenTopic][a];
      const pairCountB = topicDifficultyCounts[chosenTopic][b];
      if (pairCountA !== pairCountB) return pairCountA - pairCountB;

      return getBucketCount(buckets, b, chosenTopic) - getBucketCount(buckets, a, chosenTopic);
    });

    const chosenDifficulty = difficultyPool[0];
    const nextQuestion = buckets[chosenDifficulty][chosenTopic].pop();
    if (!nextQuestion) break;

    selected.push(nextQuestion);
    difficultyCounts[chosenDifficulty] += 1;
    topicCounts[chosenTopic] += 1;
    topicDifficultyCounts[chosenTopic][chosenDifficulty] += 1;
  }

  if (selected.length < totalQuestions) {
    const leftovers = [];
    difficultyOrder.forEach(level => {
      topics.forEach(topic => leftovers.push(...buckets[level][topic]));
    });
    selected.push(...shuffleArray(leftovers).slice(0, totalQuestions - selected.length));
  }

  return shuffleArray(selected.slice(0, totalQuestions));
}

function getStudyGuideRegistry() {
  if (typeof window !== "undefined" && window.STUDY_GUIDES && typeof window.STUDY_GUIDES === "object") {
    return window.STUDY_GUIDES;
  }
  return {};
}

function buildFallbackStudyGuide(topic) {
  const title = topic || "Maths";
  const visual = typeof createStudyVisualCard === "function"
    ? createStudyVisualCard({
        emoji: "📘",
        title,
        subtitle: "Small steps build big confidence",
        chips: ["Read", "Think", "Work it out", "Check"],
        accent: "#4f46e5"
      })
    : "";

  return {
    topic: title,
    icon: "📘",
    summary: `A quick guide to help you warm up for ${title}.`,
    intro: `${title} becomes easier when you take it one step at a time and check what the question is really asking.`,
    keyIdea: "Slow, careful maths is stronger than rushed maths.",
    steps: [
      "Read the question slowly.",
      "Choose the maths idea you need.",
      "Check that your answer makes sense."
    ],
    tips: [
      "Circle important words or numbers.",
      "Estimate first if you can.",
      "Go back and check your final answer."
    ],
    tryIt: `Before you start, say one thing you already know about ${title}.`,
    visualLabel: `A simple overview visual for ${title}.`,
    visual
  };
}

/* ═══════════════════════════════════════════════════════════════════
   EXAM PREP APP — Core Quiz Engine
═══════════════════════════════════════════════════════════════════ */

class ExamApp {
  constructor() {
    console.log("ExamApp constructor called");

    // State
    this.studentName = "";
    this.selectedTestType = "";
    this.numQuestions = CONFIG.defaultQuestions;
    this.timeLimit = CONFIG.defaultTimeLimit;
    this.selectedTopics = [];
    this.quizQuestions = [];
    this.currentIndex = 0;
    this.answers = {};
    this.timeRemaining = 0;
    this.timerInterval = null;
    this.startTime = 0;
    this.timeExpired = false;
    this.examInProgress = false;
    this.currentStudyTopic = "";
    this.currentStudyConcept = "";

    // DOM
    this.testTypeScreen = document.getElementById("test-type-screen");
    this.setupScreen = document.getElementById("setup-screen");
    this.studyLibraryScreen = document.getElementById("study-library-screen");
    this.studyTopicScreen = document.getElementById("study-topic-screen");
    this.studyConceptScreen = document.getElementById("study-concept-screen");
    this.quizScreen = document.getElementById("quiz-screen");
    this.resultsScreen = document.getElementById("results-screen");
    this.progressScreen = document.getElementById("progress-screen");
    this.studentInput = document.getElementById("student-name");
    this.startBtn = document.getElementById("start-btn");
    this.learnTopicsBtn = document.getElementById("learn-topics-btn");
    this.setupTitle = document.getElementById("setup-title");
    this.setupSubtitle = document.getElementById("setup-subtitle");
    this.studyLibraryGrid = document.getElementById("study-library-grid");
    this.studyConceptGrid = document.getElementById("study-concept-grid");
    this.setupError = document.getElementById("setup-error");
    this.parentDashboardReturnScreen = "setup";

    console.log("DOM elements loaded:", {
      setupScreen: !!this.setupScreen,
      quizScreen: !!this.quizScreen,
      resultsScreen: !!this.resultsScreen,
      progressScreen: !!this.progressScreen,
      studentInput: !!this.studentInput,
      startBtn: !!this.startBtn
    });
    console.log("Settings: " + this.numQuestions + " questions, " + this.timeLimit + " minutes");

    this.init();
  }

  getCurrentHash() {
    return typeof window !== "undefined" && window.location?.hash ? window.location.hash.toLowerCase() : "";
  }

  setHistorySlug(enabled) {
    if (typeof window === "undefined" || !window.location) return;
    const targetHash = enabled ? "#history" : "";
    if (this.getCurrentHash() === targetHash) return;

    if (enabled) {
      window.location.hash = "history";
      return;
    }

    if (window.history?.replaceState) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    } else {
      window.location.hash = "";
    }
  }

  handleHashRoute() {
    if (this.getCurrentHash() === "#history") {
      this.openParentDashboard(this.selectedTestType ? "setup" : "test-type", false);
    }
  }

  init() {
    console.log("ExamApp.init() called");
    this.drawingPad = new DrawingPad();
    console.log("DrawingPad initialized");
    this.attachEventListeners();
    this.attachRecoveryListeners();
    this.showScreen("test-type");
    this.checkForRecoverableExam();
    this.handleHashRoute();
    console.log("Event listeners attached");
  }

  attachEventListeners() {
    console.log("Attaching event listeners...");
    if (this.startBtn) {
      this.startBtn.addEventListener("click", () => this.startExam());
      console.log("✓ Start button listener attached");
    } else {
      console.error("✗ Start button not found!");
    }
    document.querySelectorAll("[data-test-type]").forEach(button => {
      button.addEventListener("click", () => this.chooseTestType(button.dataset.testType));
    });
    this.learnTopicsBtn?.addEventListener("click", () => this.openStudyLibrary());
    document.getElementById("setup-back-btn")?.addEventListener("click", () => this.returnToTestTypeMenu());
    document.getElementById("study-library-back-btn")?.addEventListener("click", () => this.returnToSetupMenu());
    document.getElementById("study-topic-topics-btn")?.addEventListener("click", () => this.openStudyLibrary());
    document.getElementById("study-topic-menu-btn")?.addEventListener("click", () => this.returnToSetupMenu());
    document.getElementById("study-concept-topic-btn")?.addEventListener("click", () => this.returnToStudyTopicMenu());
    document.getElementById("study-concept-menu-btn")?.addEventListener("click", () => this.returnToSetupMenu());
    this.studyLibraryGrid?.addEventListener("click", event => {
      const topicButton = event.target.closest("[data-study-topic]");
      if (!topicButton) return;
      this.openStudyTopic(topicButton.dataset.studyTopic);
    });
    this.studyConceptGrid?.addEventListener("click", event => {
      const conceptButton = event.target.closest("[data-study-concept]");
      if (!conceptButton) return;
      this.openStudyConcept(conceptButton.dataset.studyTopic, conceptButton.dataset.studyConcept);
    });
    document.getElementById("prev-btn")?.addEventListener("click", () => this.previousQuestion());
    document.getElementById("next-btn")?.addEventListener("click", () => this.nextQuestion());
    document.getElementById("submit-btn")?.addEventListener("click", () => this.showSubmitConfirm());
    document.getElementById("confirm-submit-btn")?.addEventListener("click", () => this.submitExam());
    document.getElementById("confirm-cancel-btn")?.addEventListener("click", () => this.hideSubmitConfirm());
    document.getElementById("timeup-results-btn")?.addEventListener("click", () => this.submitExam());
    document.getElementById("retry-btn")?.addEventListener("click", () => this.retryQuiz());
    document.getElementById("new-exam-btn")?.addEventListener("click", () => this.resetToSetup());
    document.getElementById("progress-btn")?.addEventListener("click", () => this.openParentDashboard("results"));
    document.getElementById("progress-back-btn")?.addEventListener("click", () => this.returnFromParentDashboard());
    document.getElementById("progress-home-btn")?.addEventListener("click", () => this.resetToSetup());
    document.getElementById("resume-test-btn")?.addEventListener("click", () => this.resumeSavedExam());
    document.getElementById("discard-resume-btn")?.addEventListener("click", () => this.showDiscardRecoveryConfirm());
    document.getElementById("discard-recovery-cancel-btn")?.addEventListener("click", () => this.hideDiscardRecoveryConfirm());
    document.getElementById("discard-recovery-confirm-btn")?.addEventListener("click", () => this.discardSavedExam());
    console.log("Event listeners ready");
  }

  attachRecoveryListeners() {
    if (typeof window !== "undefined") {
      window.addEventListener("hashchange", () => this.handleHashRoute());
      window.addEventListener("beforeunload", event => {
        this.persistExamProgress();
        if (!this.examInProgress) return;
        event.preventDefault();
        event.returnValue = "";
      });

      window.addEventListener("pagehide", () => this.persistExamProgress());
    }

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          this.persistExamProgress();
        }
      });
    }
  }

  buildActiveExamSnapshot() {
    if (!this.examInProgress || !this.quizQuestions.length) return null;

    return {
      testType: normalizeTestType(this.selectedTestType),
      studentName: this.studentName,
      numQuestions: this.numQuestions,
      timeLimit: this.timeLimit,
      quizQuestions: this.quizQuestions,
      currentIndex: this.currentIndex,
      answers: this.answers,
      timeRemaining: this.timeRemaining,
      startTime: this.startTime,
      timeExpired: this.timeExpired,
      savedAt: Date.now()
    };
  }

  persistExamProgress() {
    const snapshot = this.buildActiveExamSnapshot();
    if (!snapshot) return false;
    return persistActiveExamState(snapshot);
  }

  getResumeSummary(savedState) {
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - (savedState.savedAt || Date.now())) / 1000));
    const adjustedTimeRemaining = Math.max(0, (savedState.timeRemaining || 0) - elapsedSeconds);
    const answeredCount = Object.keys(savedState.answers || {}).length;
    const questionCount = Array.isArray(savedState.quizQuestions) ? savedState.quizQuestions.length : 0;

    if (adjustedTimeRemaining <= 0 || savedState.timeExpired) {
      return `${savedState.studentName || "Student"} has an unfinished test saved. Time has run out, but the answers can still be recovered and submitted.`;
    }

    return `${savedState.studentName || "Student"} has an unfinished test with ${answeredCount} of ${questionCount} questions answered and ${formatDuration(adjustedTimeRemaining)} left.`;
  }

  showResumeOverlay(savedState) {
    document.getElementById("resume-message").textContent = this.getResumeSummary(savedState);
    document.getElementById("resume-overlay")?.removeAttribute("hidden");
  }

  hideResumeOverlay() {
    document.getElementById("resume-overlay")?.setAttribute("hidden", "");
  }

  showDiscardRecoveryConfirm() {
    this.hideResumeOverlay();
    document.getElementById("discard-recovery-overlay")?.removeAttribute("hidden");
  }

  hideDiscardRecoveryConfirm(reshowResume = true) {
    document.getElementById("discard-recovery-overlay")?.setAttribute("hidden", "");
    if (reshowResume) {
      const savedState = loadActiveExamState();
      if (savedState) this.showResumeOverlay(savedState);
    }
  }

  checkForRecoverableExam() {
    const savedState = loadActiveExamState();
    if (!savedState) return;
    this.showResumeOverlay(savedState);
  }

  resumeSavedExam() {
    const savedState = loadActiveExamState();
    if (!savedState) {
      this.hideResumeOverlay();
      return;
    }

    const quizQuestions = getValidQuestionPool(savedState.quizQuestions || []);
    if (!quizQuestions.length) {
      this.discardSavedExam();
      return;
    }

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - (savedState.savedAt || Date.now())) / 1000));
    const adjustedTimeRemaining = Math.max(0, (savedState.timeRemaining || 0) - elapsedSeconds);

    this.selectedTestType = normalizeTestType(savedState.testType);
    this.updateSetupScreen();
    this.studentName = savedState.studentName || "";
    this.numQuestions = savedState.numQuestions || quizQuestions.length || CONFIG.defaultQuestions;
    this.timeLimit = savedState.timeLimit || CONFIG.defaultTimeLimit;
    this.quizQuestions = quizQuestions;
    this.currentIndex = Math.min(Math.max(0, savedState.currentIndex || 0), quizQuestions.length - 1);
    this.answers = savedState.answers || {};
    this.timeRemaining = adjustedTimeRemaining;
    this.startTime = savedState.startTime || Date.now();
    this.timeExpired = !!savedState.timeExpired || adjustedTimeRemaining <= 0;
    this.examInProgress = true;

    if (this.studentInput) this.studentInput.value = this.studentName;

    this.hideDiscardRecoveryConfirm(false);
    this.hideResumeOverlay();
    this.showScreen("quiz");
    this.displayTime();
    this.updateQuestionDisplay();

    if (this.timeExpired) {
      clearInterval(this.timerInterval);
      this.showTimeUpOverlay();
      this.persistExamProgress();
    } else {
      this.startTimer();
      this.persistExamProgress();
    }
  }

  discardSavedExam() {
    this.hideDiscardRecoveryConfirm(false);
    this.hideResumeOverlay();
    this.examInProgress = false;
    clearActiveExamState();
    this.resetToSetup();
  }

  chooseTestType(testType) {
    const config = getTestTypeConfig(testType);
    this.selectedTestType = config.key;
    this.numQuestions = config.defaultQuestions;
    this.timeLimit = config.defaultTimeLimit;
    this.updateSetupScreen();
    this.setupError?.setAttribute("hidden", "");
    if (this.setupError) this.setupError.textContent = "";
    this.showScreen("setup");
  }

  updateSetupScreen() {
    const config = getTestTypeConfig(this.selectedTestType);
    if (this.setupTitle) this.setupTitle.textContent = config.setupTitle;
    if (this.setupSubtitle) this.setupSubtitle.textContent = config.setupSubtitle;
    if (this.startBtn) this.startBtn.textContent = config.startLabel;
    if (this.learnTopicsBtn) {
      if (config.learnTopics) {
        this.learnTopicsBtn.removeAttribute("hidden");
      } else {
        this.learnTopicsBtn.setAttribute("hidden", "");
      }
    }
  }

  returnToTestTypeMenu() {
    this.setHistorySlug(false);
    this.selectedTestType = "";
    this.currentStudyTopic = "";
    this.currentStudyConcept = "";
    this.setupError?.setAttribute("hidden", "");
    if (this.setupError) this.setupError.textContent = "";
    this.showScreen("test-type");
  }

  startExam() {
    console.log("startExam called");
    this.studentName = this.studentInput.value.trim();

    console.log("Name:", this.studentName, "Questions:", this.numQuestions, "Time:", this.timeLimit);

    if (!this.studentName) {
      this.showError("Please enter your name");
      return;
    }

    if (!this.selectedTestType) {
      this.showError("Please choose Maths or NVRT first");
      return;
    }

    const pool = getValidQuestionPool(getQuestionBankForTestType(this.selectedTestType));
    console.log("Total questions available:", pool.length);

    if (pool.length < this.numQuestions) {
      this.showError(`Not enough questions available. Found: ${pool.length}`);
      return;
    }

    // Shuffle and select random questions, making sure a few super-hard ones are included
    this.quizQuestions = selectQuizQuestions(pool, this.numQuestions, arr => this.shuffleArray(arr), {
      studentName: this.studentName,
      testType: this.selectedTestType
    });
    const superHardCount = this.quizQuestions.filter(q => q.difficulty >= SUPER_HARD_DIFFICULTY).length;
    console.log("Quiz questions selected:", this.quizQuestions.length, "| Super hard included:", superHardCount);
    this.answers = {};
    this.currentIndex = 0;
    this.timeRemaining = this.timeLimit * 60;
    this.startTime = Date.now();
    this.timeExpired = false;
    this.examInProgress = true;

    console.log("Starting quiz with", this.quizQuestions.length, "questions");
    this.hideResumeOverlay();
    this.hideDiscardRecoveryConfirm(false);
    this.showScreen("quiz");
    this.displayTime();
    this.updateQuestionDisplay();
    this.startTimer();
    this.persistExamProgress();
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => this.updateTimer(), 1000);
  }

  updateTimer() {
    this.timeRemaining--;
    this.displayTime();

    if (this.examInProgress && (this.timeRemaining % 5 === 0 || this.timeRemaining <= 10)) {
      this.persistExamProgress();
    }

    const timerWrap = document.getElementById("timer-wrap");
    if (this.timeRemaining <= 60 && this.timeRemaining > 0) {
      timerWrap.classList.add("timer-warn");
    }
    if (this.timeRemaining <= 0) {
      timerWrap.classList.add("timer-danger");
      if (!this.timeExpired) {
        this.timeExpired = true;
        clearInterval(this.timerInterval);
        this.showTimeUpOverlay();
      }
    }
  }

  displayTime() {
    const mins = Math.floor(this.timeRemaining / 60);
    const secs = this.timeRemaining % 60;
    document.getElementById("timer-display").textContent = 
      `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  updateQuestionDisplay() {
    // Resize canvas when displaying questions
    this.drawingPad.resizeCanvas();

    const q = this.quizQuestions[this.currentIndex];
    const progress = this.currentIndex + 1;

    // Header
    document.getElementById("student-label").textContent = this.studentName;
    document.getElementById("progress-label").textContent = `Q ${progress} / ${this.quizQuestions.length}`;

    // Progress bar
    const percent = (progress / this.quizQuestions.length) * 100;
    document.getElementById("progress-bar").style.width = percent + "%";

    // Question
    const difficultyMeta = getDifficultyMeta(q.difficulty);
    document.getElementById("q-topic").textContent = q.topic;
    document.getElementById("q-difficulty").textContent = difficultyMeta.label;
    document.getElementById("q-difficulty").className = `q-difficulty-badge ${difficultyMeta.css}`;
    document.getElementById("question-text").textContent = q.question;

    const media = document.getElementById("question-media");
    if (media) {
      media.innerHTML = "";
      if (q.questionImage) {
        const img = document.createElement("img");
        img.src = q.questionImage;
        img.alt = q.questionImageAlt || q.question || "Question image";
        img.loading = "eager";
        media.appendChild(img);
        media.removeAttribute("hidden");
      } else {
        media.setAttribute("hidden", "");
      }
    }

    // Options
    const container = document.getElementById("options-container");
    container.innerHTML = "";
    q.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.innerHTML = `<span class="option-label">${String.fromCharCode(65 + idx)}</span> ${opt}`;
      
      if (this.answers[this.currentIndex] === idx) {
        btn.classList.add("selected");
      }

      btn.addEventListener("click", () => this.selectAnswer(idx, btn));
      container.appendChild(btn);
    });

    // Nav buttons
    document.getElementById("prev-btn").disabled = this.currentIndex === 0;
    document.getElementById("next-btn").disabled = this.currentIndex === this.quizQuestions.length - 1;

    // Answered count
    const answered = Object.keys(this.answers).length;
    document.getElementById("answered-label").textContent = `${answered} answered`;

    // Disable if time expired
    if (this.timeExpired) {
      container.querySelectorAll("button").forEach(b => b.disabled = true);
    }
  }

  selectAnswer(idx, btn) {
    if (this.timeExpired) return;
    this.answers[this.currentIndex] = idx;
    document.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    document.getElementById("answered-label").textContent = `${Object.keys(this.answers).length} answered`;
    this.persistExamProgress();
  }

  nextQuestion() {
    if (this.currentIndex < this.quizQuestions.length - 1) {
      this.currentIndex++;
      this.drawingPad.clearCanvas();
      console.log("Drawing pad cleared");
      this.updateQuestionDisplay();
      this.persistExamProgress();
    }
  }

  previousQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.drawingPad.clearCanvas();
      console.log("Drawing pad cleared");
      this.updateQuestionDisplay();
      this.persistExamProgress();
    }
  }

  showSubmitConfirm() {
    const answered = Object.keys(this.answers).length;
    const total = this.quizQuestions.length;
    document.getElementById("confirm-message").textContent = 
      `You have answered ${answered} out of ${total} questions.  ${total - answered} will be marked as skipped. Continue?`;
    document.getElementById("confirm-overlay").removeAttribute("hidden");
  }

  hideSubmitConfirm() {
    document.getElementById("confirm-overlay").setAttribute("hidden", "");
  }

  showTimeUpOverlay() {
    document.getElementById("timeup-overlay").removeAttribute("hidden");
    this.persistExamProgress();
  }

  submitExam() {
    clearInterval(this.timerInterval);
    this.calculateResults();
    this.examInProgress = false;
    clearActiveExamState();
    this.hideResumeOverlay();
    this.hideDiscardRecoveryConfirm(false);
    this.showScreen("results");
  }

  calculateResults() {
    let correct = 0, wrong = 0, skipped = 0;
    const topicScores = {};

    this.quizQuestions.forEach((q, idx) => {
      if (!topicScores[q.topic]) {
        topicScores[q.topic] = { correct: 0, total: 0 };
      }
      topicScores[q.topic].total++;

      if (!(idx in this.answers)) {
        skipped++;
      } else if (this.answers[idx] === q.answer) {
        correct++;
        topicScores[q.topic].correct++;
      } else {
        wrong++;
      }
    });

    const percentage = Math.round((correct / this.quizQuestions.length) * 100);
    const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);

    const resultRecord = this.buildResultRecord(correct, wrong, skipped, percentage, timeTaken, topicScores);
    this.saveResultRecord(resultRecord);
    this.displayResults(resultRecord);
  }

  buildResultRecord(correct, wrong, skipped, percentage, timeTaken, topicScores) {
    const topicBreakdown = Object.keys(topicScores)
      .sort((a, b) => a.localeCompare(b))
      .map(topic => ({
        topic,
        correct: topicScores[topic].correct,
        total: topicScores[topic].total,
        percentage: Math.round((topicScores[topic].correct / topicScores[topic].total) * 100)
      }));

    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      testType: normalizeTestType(this.selectedTestType),
      studentName: this.studentName,
      completedAt: new Date().toISOString(),
      questionCount: this.quizQuestions.length,
      correct,
      wrong,
      skipped,
      percentage,
      timeTakenSeconds: timeTaken,
      superHardCount: this.quizQuestions.filter(q => q.difficulty >= SUPER_HARD_DIFFICULTY).length,
      topicBreakdown
    };
  }

  saveResultRecord(resultRecord) {
    const existingResults = loadStoredResults();
    existingResults.unshift(resultRecord);
    persistStoredResults(existingResults);
  }

  displayResults(resultRecord) {
    const { correct, wrong, skipped, percentage, timeTakenSeconds, topicBreakdown } = resultRecord;

    // Header
    const grade = CONFIG.grades.find(g => percentage >= g.min) || CONFIG.grades[CONFIG.grades.length - 1];
    document.getElementById("results-trophy").textContent = grade.trophy;
    document.getElementById("results-title").textContent = grade.label;
    document.getElementById("results-student-name").textContent = `${this.studentName} — ${getTestTypeLabel(resultRecord.testType)} — ${percentage}%`;

    // Score circle
    document.getElementById("score-pct").textContent = percentage + "%";
    document.getElementById("score-circle").style.borderColor = 
      percentage >= 75 ? "#16a34a" : percentage >= 50 ? "#d97706" : "#dc2626";

    // Stats
    document.getElementById("correct-count").textContent = correct;
    document.getElementById("wrong-count").textContent = wrong;
    document.getElementById("skip-count").textContent = skipped;
    document.getElementById("time-taken").textContent = formatDuration(timeTakenSeconds);

    // Topic breakdown
    const breakdown = document.getElementById("topic-breakdown-table");
    breakdown.innerHTML = "";
    topicBreakdown.forEach(topic => {
      breakdown.innerHTML += `
        <div class="topic-row">
          <div class="topic-name">${topic.topic}</div>
          <div class="topic-bar-wrap">
            <div class="topic-bar" style="width: ${topic.percentage}%"></div>
          </div>
          <div class="topic-score-text">${topic.correct}/${topic.total}</div>
        </div>
      `;
    });

    // Review
    const review = document.getElementById("review-list");
    review.innerHTML = "";
    this.quizQuestions.forEach((q, idx) => {
      const answered = idx in this.answers;
      const isCorrect = answered && this.answers[idx] === q.answer;
      const className = isCorrect ? "review-correct" : answered ? "review-wrong" : "review-skip";
      const difficultyMeta = getDifficultyMeta(q.difficulty);
      
      const html = `
        <div class="review-item ${className}">
          <div class="review-q">${idx + 1}. ${q.question}</div>
          <div class="review-meta">
            <span>${difficultyMeta.label}</span>
            <span>${q.topic}</span>
          </div>
      `;
      review.innerHTML += html;
    });
  }

  renderParentDashboard() {
    const emptyState = document.getElementById("parent-progress-empty");
    const content = document.getElementById("parent-progress-content");
    const summary = buildProgressSummary(loadStoredResults());

    const backBtn = document.getElementById("progress-back-btn");
    if (backBtn) {
      backBtn.textContent = this.parentDashboardReturnScreen === "results" ? "← Back to Results" : "← Back";
    }

    if (!summary.testsTaken) {
      emptyState?.removeAttribute("hidden");
      content?.setAttribute("hidden", "");
      return;
    }

    emptyState?.setAttribute("hidden", "");
    content?.removeAttribute("hidden");

    document.getElementById("progress-tests-count").textContent = summary.testsTaken;
    document.getElementById("progress-average-score").textContent = `${summary.averageScore}%`;
    document.getElementById("progress-best-score").textContent = `${summary.bestScore}%`;
    document.getElementById("progress-latest-score").textContent = `${summary.latestScore}%`;
    document.getElementById("progress-average-time").textContent = formatDuration(summary.averageTime);
    document.getElementById("progress-trend").textContent = summary.trendText;
    document.getElementById("progress-strongest-topic").textContent = summary.strongestTopic
      ? `${summary.strongestTopic.topic} (${summary.strongestTopic.percentage}%)`
      : "—";
    document.getElementById("progress-focus-topic").textContent = summary.focusTopic
      ? `${summary.focusTopic.topic} (${summary.focusTopic.percentage}%)`
      : "—";

    const topicBreakdown = document.getElementById("parent-topic-breakdown");
    topicBreakdown.innerHTML = "";
    summary.topicSummary.forEach(topic => {
      topicBreakdown.innerHTML += `
        <div class="topic-row">
          <div class="topic-name">${topic.topic}</div>
          <div class="topic-bar-wrap">
            <div class="topic-bar" style="width: ${topic.percentage}%"></div>
          </div>
          <div class="topic-score-text">${topic.correct}/${topic.total}</div>
        </div>
      `;
    });

    const historyList = document.getElementById("parent-history-list");
    historyList.innerHTML = "";
    summary.recentResults.forEach(result => {
      historyList.innerHTML += `
        <div class="history-item">
          <div class="history-main">
            <div class="history-title">${result.studentName || "Student"} — ${formatCompletedAt(result.completedAt)}</div>
            <div class="history-subtitle">${getTestTypeLabel(result.testType)} • ${result.correct}/${result.questionCount} correct • ${result.superHardCount || 0} super hard question(s)</div>
          </div>
          <div class="history-score">${result.percentage}%</div>
          <div class="history-time">${formatDuration(result.timeTakenSeconds)}</div>
          <div class="history-meta">${result.skipped} skipped</div>
        </div>
      `;
    });
  }

  getStudyGuide(topic) {
    const registry = getStudyGuideRegistry();
    const guide = registry[topic] || buildFallbackStudyGuide(topic);
    return typeof normalizeStudyGuide === "function" ? normalizeStudyGuide(guide) : guide;
  }

  renderStudyList(elementId, items) {
    const list = document.getElementById(elementId);
    if (!list) return;

    list.innerHTML = "";
    (items || []).forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
  }

  renderStudyParagraphs(elementId, paragraphs) {
    const container = document.getElementById(elementId);
    if (!container) return;

    container.innerHTML = "";
    const copy = Array.isArray(paragraphs) ? paragraphs : paragraphs ? [paragraphs] : [];
    copy.forEach(text => {
      const p = document.createElement("p");
      p.textContent = text;
      container.appendChild(p);
    });
  }

  renderStudyExamples(elementId, examples) {
    const container = document.getElementById(elementId);
    if (!container) return;

    container.innerHTML = "";
    (examples || []).forEach(example => {
      const card = document.createElement("article");
      card.className = "study-example-card";

      const title = document.createElement("h3");
      title.textContent = example.title;

      const text = document.createElement("p");
      text.textContent = example.text;

      card.append(title, text);
      container.appendChild(card);
    });
  }

  renderStudyLibrary() {
    if (!this.studyLibraryGrid) return;

    this.studyLibraryGrid.innerHTML = "";
    CONFIG.topics.forEach(topic => {
      const guide = this.getStudyGuide(topic);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "study-topic-button";
      button.dataset.studyTopic = topic;

      const icon = document.createElement("span");
      icon.className = "study-topic-button-icon";
      icon.textContent = guide.icon || "📘";

      const title = document.createElement("span");
      title.className = "study-topic-button-title";
      title.textContent = topic;

      const text = document.createElement("span");
      text.className = "study-topic-button-text";
      text.textContent = guide.summary || `Open the ${topic} guide.`;

      const link = document.createElement("span");
      link.className = "study-topic-button-link";
      link.textContent = "Open topic menu →";

      button.append(icon, title, text, link);
      this.studyLibraryGrid.appendChild(button);
    });
  }

  renderStudyConceptMenu(topic) {
    if (!this.studyConceptGrid) return;

    const guide = this.getStudyGuide(topic);
    this.studyConceptGrid.innerHTML = "";

    guide.concepts.forEach(concept => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "study-concept-button";
      button.dataset.studyTopic = topic;
      button.dataset.studyConcept = concept.slug;

      const title = document.createElement("span");
      title.className = "study-concept-button-title";
      title.textContent = concept.title;

      const text = document.createElement("span");
      text.className = "study-concept-button-text";
      text.textContent = concept.summary || `Open ${concept.title}.`;

      const link = document.createElement("span");
      link.className = "study-concept-button-link";
      link.textContent = "Open sub-topic →";

      button.append(title, text, link);
      this.studyConceptGrid.appendChild(button);
    });
  }

  getStudyConcept(topic, conceptSlug) {
    const guide = this.getStudyGuide(topic);
    return guide.concepts.find(concept => concept.slug === conceptSlug) || guide.concepts[0];
  }

  openStudyLibrary() {
    if (normalizeTestType(this.selectedTestType) !== "maths") return;
    this.setHistorySlug(false);
    this.currentStudyTopic = "";
    this.currentStudyConcept = "";
    this.setupError?.setAttribute("hidden", "");
    this.renderStudyLibrary();
    this.showScreen("study-library");
  }

  renderStudyTopic(topic) {
    const guide = this.getStudyGuide(topic);
    const conceptCount = guide.concepts.length;

    document.getElementById("study-topic-icon").textContent = guide.icon || "📘";
    document.getElementById("study-topic-title").textContent = guide.topic || topic;
    document.getElementById("study-topic-summary").textContent = guide.summary || "A quick topic guide.";
    document.getElementById("study-topic-intro").textContent = guide.intro || "Take this topic one step at a time.";
    document.getElementById("study-topic-key-idea").textContent = guide.keyIdea || "Think carefully and check your answer.";
    document.getElementById("study-topic-menu-hint").textContent = conceptCount === 1
      ? "This topic currently has one detailed page. Open it below."
      : `Choose one of the ${conceptCount} sub-topics below to revise in detail.`;

    this.renderStudyConceptMenu(topic);

    const visual = document.getElementById("study-topic-visual");
    if (visual) {
      visual.innerHTML = guide.visual || "";
      if (guide.visualLabel) {
        visual.setAttribute("role", "img");
        visual.setAttribute("aria-label", guide.visualLabel);
      } else {
        visual.removeAttribute("role");
        visual.removeAttribute("aria-label");
      }
    }
  }

  openStudyTopic(topic) {
    this.setHistorySlug(false);
    this.currentStudyTopic = topic;
    this.currentStudyConcept = "";
    this.renderStudyTopic(topic);
    this.showScreen("study-topic");
  }

  renderStudyConcept(topic, conceptSlug) {
    const guide = this.getStudyGuide(topic);
    const concept = this.getStudyConcept(topic, conceptSlug);

    document.getElementById("study-concept-icon").textContent = guide.icon || "📘";
    document.getElementById("study-concept-topic").textContent = guide.topic || topic;
    document.getElementById("study-concept-title").textContent = concept.title;
    document.getElementById("study-concept-summary").textContent = concept.summary || guide.summary || "A detailed study guide.";

    this.renderStudyParagraphs("study-concept-explanation", concept.explanation);
    this.renderStudyList("study-concept-steps", concept.steps);
    this.renderStudyList("study-concept-tips", concept.tips);
    this.renderStudyExamples("study-concept-examples", concept.examples);

    const visual = document.getElementById("study-concept-visual");
    if (visual) {
      visual.innerHTML = concept.visual || guide.visual || "";
      const label = concept.visualLabel || guide.visualLabel;
      if (label) {
        visual.setAttribute("role", "img");
        visual.setAttribute("aria-label", label);
      } else {
        visual.removeAttribute("role");
        visual.removeAttribute("aria-label");
      }
    }
  }

  openStudyConcept(topic, conceptSlug) {
    this.setHistorySlug(false);
    this.currentStudyTopic = topic;
    this.currentStudyConcept = conceptSlug;
    this.renderStudyConcept(topic, conceptSlug);
    this.showScreen("study-concept");
  }

  returnToStudyTopicMenu() {
    if (!this.currentStudyTopic) {
      this.openStudyLibrary();
      return;
    }

    this.currentStudyConcept = "";
    this.openStudyTopic(this.currentStudyTopic);
  }

  returnToSetupMenu() {
    this.setHistorySlug(false);
    this.currentStudyTopic = "";
    this.currentStudyConcept = "";
    this.setupError?.setAttribute("hidden", "");
    this.showScreen(this.selectedTestType ? "setup" : "test-type");
  }

  openParentDashboard(fromScreen = "setup", syncHash = true) {
    this.parentDashboardReturnScreen = fromScreen;
    this.renderParentDashboard();
    if (syncHash) this.setHistorySlug(true);
    this.showScreen("progress");
  }

  returnFromParentDashboard() {
    this.setHistorySlug(false);
    if (this.parentDashboardReturnScreen === "results") {
      this.showScreen("results");
      return;
    }
    this.showScreen(this.parentDashboardReturnScreen === "test-type" ? "test-type" : "setup");
  }

  retryQuiz() {
    this.resetToSetup();
  }

  resetToSetup() {
    clearInterval(this.timerInterval);
    this.setHistorySlug(false);
    this.examInProgress = false;
    this.selectedTestType = "";
    this.studentName = "";
    this.numQuestions = CONFIG.defaultQuestions;
    this.timeLimit = CONFIG.defaultTimeLimit;
    this.quizQuestions = [];
    this.currentIndex = 0;
    this.answers = {};
    this.timeRemaining = 0;
    this.startTime = 0;
    this.timeExpired = false;
    this.currentStudyTopic = "";
    this.currentStudyConcept = "";

    if (this.studentInput) this.studentInput.value = "";
    this.drawingPad?.clearCanvas();
    clearActiveExamState();

    document.querySelectorAll("#topic-checkboxes input").forEach(cb => cb.checked = false);
    document.getElementById("confirm-overlay").setAttribute("hidden", "");
    document.getElementById("timeup-overlay").setAttribute("hidden", "");
    this.hideResumeOverlay();
    this.hideDiscardRecoveryConfirm(false);
    this.setupError?.setAttribute("hidden", "");
    if (this.setupError) this.setupError.textContent = "";
    this.updateSetupScreen();
    this.showScreen("test-type");
  }

  showError(msg) {
    console.error("Error:", msg);
    this.setupError.textContent = msg;
    this.setupError.removeAttribute("hidden");
  }

  showScreen(name) {
    console.log(`showScreen("${name}") called`);

    this.testTypeScreen?.classList.toggle("active", name === "test-type");

    // Setup screen - use "active" class to control display
    this.setupScreen.classList.toggle("active", name === "setup");
    console.log(`Setup screen ${name === "setup" ? "shown" : "hidden"}`);

    // Quiz screen - use "hidden" attribute
    if (name === "quiz") {
      this.quizScreen.removeAttribute("hidden");
      console.log("✓ Quiz screen shown");
    } else {
      this.quizScreen.setAttribute("hidden", "");
    }

    // Results screen - use "hidden" attribute
    if (name === "results") {
      this.resultsScreen.removeAttribute("hidden");
      this.setupError.setAttribute("hidden", "");
      console.log("✓ Results screen shown");
    } else {
      this.resultsScreen.setAttribute("hidden", "");
    }

    if (name === "progress") {
      this.progressScreen?.removeAttribute("hidden");
      console.log("✓ Progress screen shown");
    } else {
      this.progressScreen?.setAttribute("hidden", "");
    }

    if (name === "study-library") {
      this.studyLibraryScreen?.removeAttribute("hidden");
    } else {
      this.studyLibraryScreen?.setAttribute("hidden", "");
    }

    if (name === "study-topic") {
      this.studyTopicScreen?.removeAttribute("hidden");
    } else {
      this.studyTopicScreen?.setAttribute("hidden", "");
    }

    if (name === "study-concept") {
      this.studyConceptScreen?.removeAttribute("hidden");
    } else {
      this.studyConceptScreen?.setAttribute("hidden", "");
    }

    console.log(`Screen switched to: ${name}`);
  }

  shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

// Start the app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded event fired");
  try {
    console.log("QUESTIONS count:", typeof QUESTIONS !== 'undefined' ? QUESTIONS.length : 'NOT DEFINED');
    console.log("CONFIG:", typeof CONFIG !== 'undefined' ? 'LOADED' : 'NOT DEFINED');
    const app = new ExamApp();
    console.log("ExamApp initialized successfully");
  } catch (error) {
    console.error("Error initializing ExamApp:", error);
  }
});
