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
const RESULTS_STORAGE_KEY = "mathsExamPrepResults";
const MAX_STORED_RESULTS = 100;

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

function getValidQuestionPool(pool) {
  return pool.filter(q => q && typeof q.difficulty === "number" && Array.isArray(q.options));
}

function selectQuizQuestions(pool, totalQuestions, shuffleArray) {
  const validPool = getValidQuestionPool(pool);
  const shuffledPool = shuffleArray(validPool);
  const superHardPool = shuffledPool.filter(q => q.difficulty >= SUPER_HARD_DIFFICULTY);

  if (!superHardPool.length) {
    return shuffledPool.slice(0, totalQuestions);
  }

  const targetSuperHard = Math.min(
    totalQuestions,
    superHardPool.length,
    Math.max(1, Math.round(totalQuestions / 15))
  );
  const regularPool = shuffledPool.filter(q => q.difficulty < SUPER_HARD_DIFFICULTY);
  const selected = [
    ...superHardPool.slice(0, targetSuperHard),
    ...regularPool.slice(0, totalQuestions - targetSuperHard)
  ];

  if (selected.length < totalQuestions) {
    selected.push(...superHardPool.slice(targetSuperHard, targetSuperHard + (totalQuestions - selected.length)));
  }

  return shuffleArray(selected);
}

/* ═══════════════════════════════════════════════════════════════════
   EXAM PREP APP — Core Quiz Engine
═══════════════════════════════════════════════════════════════════ */

class ExamApp {
  constructor() {
    console.log("ExamApp constructor called");

    // State
    this.studentName = "";
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

    // DOM
    this.setupScreen = document.getElementById("setup-screen");
    this.quizScreen = document.getElementById("quiz-screen");
    this.resultsScreen = document.getElementById("results-screen");
    this.progressScreen = document.getElementById("progress-screen");
    this.studentInput = document.getElementById("student-name");
    this.startBtn = document.getElementById("start-btn");
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

  init() {
    console.log("ExamApp.init() called");
    this.drawingPad = new DrawingPad();
    console.log("DrawingPad initialized");
    this.attachEventListeners();
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
    document.getElementById("prev-btn")?.addEventListener("click", () => this.previousQuestion());
    document.getElementById("next-btn")?.addEventListener("click", () => this.nextQuestion());
    document.getElementById("submit-btn")?.addEventListener("click", () => this.showSubmitConfirm());
    document.getElementById("confirm-submit-btn")?.addEventListener("click", () => this.submitExam());
    document.getElementById("confirm-cancel-btn")?.addEventListener("click", () => this.hideSubmitConfirm());
    document.getElementById("timeup-results-btn")?.addEventListener("click", () => this.submitExam());
    document.getElementById("retry-btn")?.addEventListener("click", () => this.retryQuiz());
    document.getElementById("new-exam-btn")?.addEventListener("click", () => this.resetToSetup());
    document.getElementById("parent-progress-btn")?.addEventListener("click", () => this.openParentDashboard("setup"));
    document.getElementById("progress-btn")?.addEventListener("click", () => this.openParentDashboard("results"));
    document.getElementById("progress-back-btn")?.addEventListener("click", () => this.returnFromParentDashboard());
    document.getElementById("progress-home-btn")?.addEventListener("click", () => this.resetToSetup());
    console.log("Event listeners ready");
  }

  startExam() {
    console.log("startExam called");
    this.studentName = this.studentInput.value.trim();

    console.log("Name:", this.studentName, "Questions:", this.numQuestions, "Time:", this.timeLimit);

    if (!this.studentName) {
      this.showError("Please enter your name");
      return;
    }

    // Build question pool (all topics)
    const pool = getValidQuestionPool(QUESTIONS);
    console.log("Total questions available:", pool.length);

    if (pool.length < this.numQuestions) {
      this.showError(`Not enough questions available. Found: ${pool.length}`);
      return;
    }

    // Shuffle and select random questions, making sure a few super-hard ones are included
    this.quizQuestions = selectQuizQuestions(pool, this.numQuestions, arr => this.shuffleArray(arr));
    const superHardCount = this.quizQuestions.filter(q => q.difficulty >= SUPER_HARD_DIFFICULTY).length;
    console.log("Quiz questions selected:", this.quizQuestions.length, "| Super hard included:", superHardCount);
    this.answers = {};
    this.currentIndex = 0;
    this.timeRemaining = this.timeLimit * 60;
    this.startTime = Date.now();
    this.timeExpired = false;

    console.log("Starting quiz with", this.quizQuestions.length, "questions");
    this.showScreen("quiz");
    this.updateQuestionDisplay();
    this.startTimer();
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => this.updateTimer(), 1000);
  }

  updateTimer() {
    this.timeRemaining--;
    this.displayTime();

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
  }

  nextQuestion() {
    if (this.currentIndex < this.quizQuestions.length - 1) {
      this.currentIndex++;
      this.drawingPad.clearCanvas();
      console.log("Drawing pad cleared");
      this.updateQuestionDisplay();
    }
  }

  previousQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.drawingPad.clearCanvas();
      console.log("Drawing pad cleared");
      this.updateQuestionDisplay();
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
  }

  submitExam() {
    clearInterval(this.timerInterval);
    this.calculateResults();
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
    document.getElementById("results-student-name").textContent = `${this.studentName} — ${percentage}%`;

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
            <div class="history-subtitle">${result.correct}/${result.questionCount} correct • ${result.superHardCount || 0} super hard question(s)</div>
          </div>
          <div class="history-score">${result.percentage}%</div>
          <div class="history-time">${formatDuration(result.timeTakenSeconds)}</div>
          <div class="history-meta">${result.skipped} skipped</div>
        </div>
      `;
    });
  }

  openParentDashboard(fromScreen = "setup") {
    this.parentDashboardReturnScreen = fromScreen;
    this.renderParentDashboard();
    this.showScreen("progress");
  }

  returnFromParentDashboard() {
    this.showScreen(this.parentDashboardReturnScreen === "results" ? "results" : "setup");
  }

  retryQuiz() {
    this.resetToSetup();
  }

  resetToSetup() {
    clearInterval(this.timerInterval);
    this.studentName = "";
    this.numQuestions = CONFIG.defaultQuestions;
    this.timeLimit = CONFIG.defaultTimeLimit;
    this.quizQuestions = [];
    this.currentIndex = 0;
    this.answers = {};
    this.timeRemaining = 0;
    this.startTime = 0;
    this.timeExpired = false;

    if (this.studentInput) this.studentInput.value = "";
    this.drawingPad?.clearCanvas();

    document.querySelectorAll("#topic-checkboxes input").forEach(cb => cb.checked = false);
    document.getElementById("confirm-overlay").setAttribute("hidden", "");
    document.getElementById("timeup-overlay").setAttribute("hidden", "");
    this.setupError?.setAttribute("hidden", "");
    if (this.setupError) this.setupError.textContent = "";
    this.showScreen("setup");
  }

  showError(msg) {
    console.error("Error:", msg);
    this.setupError.textContent = msg;
    this.setupError.removeAttribute("hidden");
  }

  showScreen(name) {
    console.log(`showScreen("${name}") called`);

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
