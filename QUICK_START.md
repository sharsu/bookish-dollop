# 🚀 Quick Start Guide

## Test Locally (Right Now!)

1. **Open in Browser:**
   - Double-click `index.html` OR
   - Right-click `index.html` → Open with → Browser

2. **You should see:**
   - Welcome screen with "Maths Exam Prep" title
   - Name input field
   - Question count & time settings
   - Topic checkboxes
   - "🚀 Start Exam" button

3. **Try It Out:**
   - Enter a name (e.g., "Alex")
   - Leave settings as default (60 questions, 60 minutes)
   - Leave topics unchecked (uses all)
   - Click "Start Exam"

4. **Quiz Screen:**
   - Should show Question 1 of 60
   - Timer at top (60:00)
   - A/B/C/D answer options
   - Previous/Next buttons

5. **Features to Test:**
   - Click an answer (highlighted in blue)
   - Click Next/Previous to navigate
   - Watch timer count down
   - Click Submit when ready
   - View results with breakdown

---

## Deploy to GitHub Pages (10 Minutes)

### Prerequisites
- GitHub account (free at github.com)
- Git installed on computer

### Steps

1. **Open PowerShell in ExamPrep folder:**
   ```powershell
   cd c:\LocalWorkFolder\ExamPrep
   ```

2. **Initialize Git:**
   ```powershell
   git init
   git config user.name "Your Name"
   git config user.email "your.email@example.com"
   git add .
   git commit -m "Initial commit: Maths Exam Prep App"
   ```

3. **Create GitHub Repository:**
   - Go to https://github.com/new
   - Name: `exam-prep`
   - Choose Public
   - Click "Create repository"

4. **Connect & Push:**
   ```powershell
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/exam-prep.git
   git push -u origin main
   ```

5. **Enable GitHub Pages:**
   - Go to your repo → Settings → Pages
   - Source: Deploy from branch
   - Branch: main / (root)
   - Save

6. **Wait 1-2 Minutes:**
   - Green checkmark appears
   - URL: `https://YOUR_USERNAME.github.io/exam-prep/`

7. **Done! 🎉**
   - Share the link with students
   - App is live and working!

---

## Customization

### Change Default Settings

**File:** `js/config.js`

```javascript
defaultQuestions : 60,     // Change number of questions
defaultTimeLimit : 60,     // Change time in minutes
```

Save and push:
```powershell
git add js/config.js
git commit -m "Updated default settings"
git push
```

### Add More Questions

**File:** `js/questions.js`

Add to the end of the QUESTIONS array:

```javascript
{
  id: 823,
  topic: "Numbers",
  question: "What is 5 × 7?",
  options: ["30", "35", "40", "45"],
  answer: 1,           // Index of correct answer (0-3)
  difficulty: 1        // 1=Easy, 2=Medium, 3=Hard
},
```

Save and push:
```powershell
git add js/questions.js
git commit -m "Added 5 new questions"
git push
```

---

## File Overview

| File | Purpose |
|------|---------|
| `index.html` | Main app (3 screens: setup, quiz, results) |
| `css/style.css` | All styling & responsive design |
| `js/app.js` | Quiz engine, timer, scoring |
| `js/config.js` | Settings you can customize |
| `js/questions.js` | 822 questions (edit to add more) |
| `README.md` | Full documentation |
| `DEPLOYMENT.md` | Detailed deployment guide |

---

## Troubleshooting

**App shows blank page:**
- Try refreshing (Ctrl+R)
- Check browser console (F12 > Console tab)
- Try different browser

**Questions won't load:**
- Check developer console for errors
- Verify questions.js is in js/ folder
- Check file hasn't been corrupted

**GitHub Pages not working:**
- Wait 2-3 minutes after enabling
- Check repository is PUBLIC
- Verify .nojekyll file exists
- Check GitHub Pages is enabled in Settings

---

## Questions?

- See `README.md` for detailed user guide
- See `DEPLOYMENT.md` for deployment help
- See `PROJECT_SUMMARY.txt` for full feature list

---

**Your app is ready! Test it locally, then deploy to GitHub. Students can start using it immediately.** 🎓✨
