# 🎓 Exam Prep - Two Entry Point System

## Overview

The app now has **TWO SEPARATE ENTRY POINTS**:

1. **Parent Configuration** (`parent-index.html`)
   - Parent sets questions, time, and topics
   - Saves configuration for child to use

2. **Child Test Interface** (`index.html`)  
   - Child enters name only
   - Takes test with parent's pre-configured settings
   - No access to configuration options

---

## For Parents

### Step 1: Open Parent Configuration
- **URL:** `parent-index.html`
- **Or:** Double-click `parent-index.html`

### Step 2: Configure Exam
Settings you can change:

| Setting | Default | Range | What it does |
|---------|---------|-------|--------------|
| **Number of Questions** | 60 | 5-100 | How many questions in the test |
| **Time Limit** | 60 min | 1-180 | How long child has to complete |
| **Topics** | All | 14 options | Which math topics to include |

### Step 3: Save Configuration
- Click **✅ Save Configuration**
- See green success message: "Configuration saved!"
- Configuration is stored and ready for child

### Step 4: Share Child Link
- Tell child to open: `index.html`
- Or provide link if on network/web
- Child will take test with YOUR settings

---

## For Children

### Step 1: Open Child Test
- **URL:** `index.html`
- **Or:** Double-click `index.html`

### Step 2: Enter Your Name
- Type your name in the field
- Example: "Alex" or "Emma"

### Step 3: Start Test
- Click **🚀 Start Test**
- Test begins with parent's settings
  - ✓ Questions: Parent configured
  - ✓ Time: Parent configured
  - ✓ Topics: Parent selected

### Step 4: Take Test
- Answer questions (no config options visible)
- Timer counts down at top
- Submit when done

### Step 5: View Results
- See your score
- See which topics you did well in
- Review your answers

---

## How Settings Are Stored

**LocalStorage Magic:**
- Parent's configuration is saved in browser's localStorage
- Child's browser reads from same localStorage
- Settings persist until parent changes them

**Same Computer:**
✅ Works perfectly - parent and child use same browser

**Different Computers:**
❌ Won't work automatically (each computer has separate localStorage)

**Solution for Multiple Computers:**
- Save parent config with screenshot/notes
- Or: Set up parent-index.html on each computer

---

## Example Workflow

### Scenario: Parent wants child to practice Algebra

**Parent's Steps:**
1. Open `parent-index.html`
2. Set: 30 questions, 45 minutes
3. Check ONLY "Algebra" topic
4. Click "✅ Save Configuration"

**Child's Steps:**
1. Open `index.html`
2. Enter name: "Sarah"
3. Click "🚀 Start Test"
4. Takes 30 algebra questions in 45 minutes
5. Can't see other topics or change time

---

## Troubleshooting

### "Configuration saved!" but child still sees defaults
- **Solution:** Child needs to refresh page (Ctrl+R)
- Or: Use incognito/private mode (clears localStorage)

### Parent can't find save button
- Check: Scroll down if form is long
- Check: Button says "✅ Save Configuration"

### Child sees all topics even though parent selected one
- Clear browser cache (Ctrl+Shift+Delete)
- Refresh page (Ctrl+R)
- Try incognito mode

### Settings lost after closing browser
- LocalStorage is cleared (browser setting)
- Parent needs to reconfigure
- Solution: Set browser to keep localStorage

---

## File Structure

```
ExamPrep/
├── index.html              ← Child test page
├── parent-index.html       ← Parent configuration page
├── js/
│   ├── app.js             ← Child quiz engine (loads parent config)
│   ├── parent-app.js      ← Parent configuration manager
│   ├── config.js          ← Default settings
│   └── questions.js       ← 838 questions
├── css/style.css          ← Styling (shared)
└── [other files]
```

---

## Features

✅ **Parent Can Configure:**
- Number of questions (5-100)
- Time limit (1-180 minutes)
- Specific topics (or all)

✅ **Child Cannot:**
- Change question count
- Change time limit
- Select different topics
- Access configuration screen

✅ **Smart Features:**
- Configuration saved (persists)
- Validation (prevents invalid settings)
- Success feedback (green message)
- Error handling (red error messages)

---

## Tips for Best Use

1. **For Practice:** Set 10-20 questions, 20-30 min
2. **For Assessment:** Set 40-60 questions, 60+ min
3. **For Weak Areas:** Select only problem topics
4. **For Progress:** Include all topics
5. **Keep Time Reasonable:** Don't overload child

---

**That's it! Simple, secure, and child-friendly.** 🎉
