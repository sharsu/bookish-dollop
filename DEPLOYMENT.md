# 🚀 Deployment Guide — Exam Prep App to GitHub Pages

## What You've Built

✅ **Complete Maths Exam Prep Web App**
- 822 interactive questions across 14 topics
- Fully functional quiz engine with timer
- Child-friendly responsive UI
- 100% static HTML/CSS/JavaScript (GitHub Pages compatible)

## Files Structure

```
ExamPrep/
├── index.html           ← Main entry point
├── README.md            ← User guide
├── DEPLOYMENT.md        ← This file
├── .nojekyll            ← GitHub Pages config
├── css/
│   └── style.css       ← All styling (responsive)
└── js/
    ├── app.js          ← Quiz engine & logic
    ├── config.js       ← Settings & customization
    └── questions.js    ← 822 questions
```

## Step-by-Step Deployment

### 1. Initialize Git Repository

```bash
cd c:\LocalWorkFolder\ExamPrep
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 2. Create .gitignore (Optional)

Create `ExamPrep/.gitignore`:
```
question-bank/
56. Milan-*.zip
.DS_Store
node_modules/
```

### 3. Commit Local Changes

```bash
git add .
git commit -m "Initial commit: Exam prep app with 822 questions"
```

### 4. Create GitHub Repository

- Go to https://github.com/new
- Repository name: `exam-prep` (or your choice)
- Description: "Interactive Maths Exam Prep - 14 topics, 822 questions, 60min timer"
- Public (required for free Pages)
- Do NOT initialize with README/gitignore
- Click "Create repository"

### 5. Push to GitHub

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/exam-prep.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### 6. Enable GitHub Pages

1. Go to your repository on GitHub.com
2. Click **Settings** tab
3. Left sidebar → **Pages**
4. Under "Build and deployment":
   - Source: `Deploy from a branch`
   - Branch: `main` / `/ (root)`
   - Click **Save**
5. Wait 1-2 minutes for deployment
6. A green checkmark + URL will appear: `https://YOUR_USERNAME.github.io/exam-prep/`

### 7. Access Your App

Visit: `https://YOUR_USERNAME.github.io/exam-prep/`

The app is now live! 🎉

## Testing Checklist

- [ ] App loads and shows setup screen
- [ ] Can enter name and select settings
- [ ] Can start exam and see first question
- [ ] Timer counts down at top
- [ ] Can navigate forward/backward
- [ ] Can select answers (A/B/C/D)
- [ ] Timer stops at 0 and blocks answers
- [ ] Submit works and shows results
- [ ] Results show score, breakdown, and review
- [ ] Mobile responsive (test on phone)

## Customization After Deployment

### Change Default Question Count

Edit `js/config.js`:
```javascript
defaultQuestions : 60,   // Change to desired number
defaultTimeLimit : 60,   // Change to desired minutes
```

Then:
```bash
git add js/config.js
git commit -m "Update default question count"
git push
```

### Add More Questions

Edit `js/questions.js` and add to the `QUESTIONS` array:
```javascript
{
  id: 823,
  topic: "Numbers",
  question: "What is 2 + 2?",
  options: ["3", "4", "5", "6"],
  answer: 1,
  difficulty: 1
}
```

Then push:
```bash
git add js/questions.js
git commit -m "Add 10 new questions"
git push
```

## Troubleshooting

### App shows blank page
- Check browser console (F12) for errors
- Verify all file paths are correct
- Clear browser cache (Ctrl+Shift+Del)

### Pages doesn't deploy
- Verify .nojekyll file exists
- Check repository is public
- Wait 2-3 minutes after enabling Pages
- Check GitHub Actions tab for build logs

### Questions not loading
- Verify questions.js is in js/ folder
- Check for syntax errors in JSON
- Ensure all question objects have: id, topic, question, options, answer, difficulty

## Updates & Maintenance

To update the app after deployment:

```bash
# Make changes locally
# Edit any file...

# Commit and push
git add .
git commit -m "Describe changes"
git push
```

Changes appear on GitHub Pages within 1-2 minutes.

## Domain Setup (Optional)

To use a custom domain (e.g., exam-prep.com):

1. In GitHub Pages settings → Custom domain
2. Enter domain name
3. Add DNS records to your domain registrar (CNAME, A records)
4. GitHub will provide specific records

---

**Your app is ready for GitHub Pages! 🚀📚**
