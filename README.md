# 📚 Maths Exam Prep - Interactive Quiz App

A fully responsive, interactive exam prep web application designed for children to practice maths across 14 topics with 800+ carefully curated questions.

## ✨ Features

- **822 Questions** across 14 maths topics:
  - Numbers, Decimals, Fractions, Percentages
  - BIDMAS/Negative Numbers, Algebra, Sequences, Ratio & Proportion
  - Speed/Distance/Time, Measurement, Geometry
  - Statistics, Probability, Logical Maths

- **Configurable Settings:**
  - Set number of questions (5–100)
  - Set time limit (1–180 minutes)
  - Select specific topics or test all

- **Smart Quiz Engine:**
  - One question per screen
  - Navigate freely (forward/backward) without penalty
  - Timer runs at top (stops at 0 and blocks further answers)
  - Real-time progress bar and question counter
  - Responsive A/B/C/D options

- **Comprehensive Results:**
  - Overall percentage score with grade & trophy
  - Breakdown by topic showing correct/total
  - Review section showing all answers
  - Time taken display

- **Child-Friendly UI:**
  - Bright, encouraging colors
  - Large, readable fonts
  - Emoji for visual engagement
  - Mobile/tablet responsive design

## 🚀 Quick Start

1. **Open in Browser:**
   - Double-click `index.html` or
   - Deploy to GitHub Pages (see below)

2. **Setup Screen:**
   - Enter your name
   - Choose number of questions
   - Set time limit
   - Select topics (optional - leave blank for all)
   - Click "🚀 Start Exam"

3. **Quiz Screen:**
   - Read the question
   - Select A/B/C/D answer
   - Use Previous/Next to navigate
   - Timer counts down at top
   - Submit when ready

4. **Results Screen:**
   - View your score and trophy
   - See topic breakdown
   - Review all answers

## 📱 GitHub Pages Deployment

This app is GitHub Pages compatible (static HTML/CSS/JS only).

### Steps to Deploy:

1. **Create a GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial maths exam prep app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/exam-prep.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repo Settings → Pages
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)
   - Save

3. **Access Your App**
   - Visit: `https://YOUR_USERNAME.github.io/exam-prep/`

## 📂 File Structure

```
ExamPrep/
├── index.html          # Main HTML (3 screens: setup, quiz, results)
├── css/
│   └── style.css       # Child-friendly responsive styles
├── js/
│   ├── app.js          # Quiz engine & state management
│   ├── config.js       # Settings, difficulties, grades
│   └── questions.js    # 822 questions across 14 topics
├── .nojekyll           # Tells GitHub Pages not to use Jekyll
└── README.md           # This file
```

## ⚙️ Customization

### Change Question Count or Time:
Edit `js/config.js`:
```javascript
defaultQuestions : 60,   // Change to any number 5-100
defaultTimeLimit : 60,   // Change to any number 1-180
```

### Modify Grade Boundaries:
Edit the `grades` array in `js/config.js`:
```javascript
grades: [
  { min: 90, label: "Outstanding! 🌟", trophy: "🏆" },
  { min: 75, label: "Excellent! 🎉",   trophy: "🥇" },
  // ... customize as needed
]
```

### Add More Questions:
Edit `js/questions.js` and add objects to the `QUESTIONS` array:
```javascript
{
  id: 823,
  topic: "Numbers",
  question: "Your question here?",
  options: ["Option A", "Option B", "Option C", "Option D"],
  answer: 1,              // 0-3 (index of correct option)
  difficulty: 1           // 1=Easy, 2=Medium, 3=Hard
}
```

## 🎓 Topics Covered

| Topic | Questions | Difficulty |
|-------|-----------|------------|
| Numbers | 100 | 1–3 |
| Decimals | 70 | 1–3 |
| Fractions | 80 | 1–3 |
| Percentages | 80 | 1–3 |
| BIDMAS | 70 | 1–3 |
| Algebra | 100 | 1–3 |
| Sequences | 70 | 1–3 |
| Ratio | 80 | 1–3 |
| Speed | 60 | 1–3 |
| Measurement | 60 | 1–2 |
| Geometry | 100 | 1–3 |
| Statistics | 80 | 1–3 |
| Probability | 70 | 1–3 |
| Logic | 70 | 1–3 |

## 🔒 Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Fully responsive

## 📄 License

Created for educational purposes. Use freely!

---

**Happy studying! 📖✨**
