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
    this.studentInput = document.getElementById("student-name");
    this.startBtn = document.getElementById("start-btn");
    this.setupError = document.getElementById("setup-error");

    console.log("DOM elements loaded:", {
      setupScreen: !!this.setupScreen,
      quizScreen: !!this.quizScreen,
      resultsScreen: !!this.resultsScreen,
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
    const pool = QUESTIONS;
    console.log("Total questions available:", pool.length);

    if (pool.length < this.numQuestions) {
      this.showError(`Not enough questions available. Found: ${pool.length}`);
      return;
    }

    // Shuffle and select random questions
    this.quizQuestions = this.shuffleArray(pool).slice(0, this.numQuestions);
    console.log("Quiz questions selected:", this.quizQuestions.length);
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
    document.getElementById("q-topic").textContent = q.topic;
    document.getElementById("q-difficulty").textContent = CONFIG.difficultyLabel[q.difficulty].label;
    document.getElementById("q-difficulty").className = `q-difficulty-badge ${CONFIG.difficultyLabel[q.difficulty].css}`;
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

    this.displayResults(correct, wrong, skipped, percentage, timeTaken, topicScores);
  }

  displayResults(correct, wrong, skipped, percentage, timeTaken, topicScores) {
    // Header
    const grade = CONFIG.grades.find(g => percentage >= g.min);
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
    const mins = Math.floor(timeTaken / 60);
    const secs = timeTaken % 60;
    document.getElementById("time-taken").textContent = `${mins}:${secs.toString().padStart(2, "0")}`;

    // Topic breakdown
    const breakdown = document.getElementById("topic-breakdown-table");
    breakdown.innerHTML = "";
    Object.keys(topicScores).forEach(topic => {
      const score = topicScores[topic];
      const pct = Math.round((score.correct / score.total) * 100);
      breakdown.innerHTML += `
        <div class="topic-row">
          <div class="topic-name">${topic}</div>
          <div class="topic-bar-wrap">
            <div class="topic-bar" style="width: ${pct}%"></div>
          </div>
          <div class="topic-score-text">${score.correct}/${score.total}</div>
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
      
      const html = `
        <div class="review-item ${className}">
          <div class="review-q">${idx + 1}. ${q.question}</div>
          <div class="review-meta">
            <span>${CONFIG.difficultyLabel[q.difficulty].label}</span>
            <span>${q.topic}</span>
          </div>
      `;
      review.innerHTML += html;
    });
  }

  retryQuiz() {
    this.resetToSetup();
  }

  resetToSetup() {
    clearInterval(this.timerInterval);
    this.studentInput.value = "";
    this.numQInput.value = CONFIG.defaultQuestions;
    this.timeLimitInput.value = CONFIG.defaultTimeLimit;
    document.querySelectorAll("#topic-checkboxes input").forEach(cb => cb.checked = false);
    document.getElementById("confirm-overlay").setAttribute("hidden", "");
    document.getElementById("timeup-overlay").setAttribute("hidden", "");
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
