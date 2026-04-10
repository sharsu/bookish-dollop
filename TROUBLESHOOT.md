# 🔧 Troubleshooting: "Start Exam" Button Not Working

## Quick Diagnosis

I've created 3 diagnostic tools. Try them in order:

### 1. **Diagnostic Page** (Recommended)
   - Open: `diagnose.html`
   - Shows: ✓ All checks to verify files are loaded correctly
   - What to look for: All checks should show green ✓

### 2. **Button Click Test**
   - Open: `test-button.html`
   - Shows: Tests button click logic
   - Steps:
     1. Click "Test Start Exam" button
     2. Watch the green log messages
     3. Should show: Questions loaded, Config loaded, All checks passed

### 3. **Browser Console** (Advanced)
   - Open `index.html` 
   - Press `F12` (or right-click → Inspect → Console tab)
   - Click "Start Exam"
   - Look for log messages starting with:
     - ✓ DOMContentLoaded event fired
     - ✓ QUESTIONS count: [number]
     - ✓ startExam called
     - ✓ Name: [yourname]


## Most Common Issues & Fixes

### Issue 1: "QUESTIONS not defined"
**Cause:** `js/questions.js` didn't load

**Solution:**
- Check file size: `js/questions.js` should be ~125 KB
- Verify it exists in the folder
- Check for encoding issues (must be UTF-8)
- Try refreshing browser (Ctrl+R or Cmd+R)

### Issue 2: "CONFIG not defined"
**Cause:** `js/config.js` didn't load

**Solution:**
- Verify `js/config.js` exists
- Check syntax: Last line should be `};` (not `)`)
- Refresh browser

### Issue 3: Button clicks but nothing happens
**Cause:** `showScreen()` function not working or DOM element not found

**Solution:**
- Open diagnose.html to check if all DOM elements exist
- Press F12 and check Console for errors
- Look for "Cannot read property of null" errors

### Issue 4: Page shows blank or white screen
**Cause:** HTML or CSS broken

**Solution:**
- Refresh browser (Ctrl+R)
- Open diagnose.html
- Check browser console (F12) for CSS or parsing errors

### Issue 5: Timer or results not showing
**Cause:** Specific function failing

**Solution:**
- Open test-button.html
- Try clicking "Test Start Exam"
- Check green log for specific failure point


## Step-by-Step Fix Procedure

### If nothing works:

1. **Close app in browser**

2. **Open `test-button.html`:**
   - Enter your name (or leave "Test Student")
   - Click "Test Start Exam"
   - You should see green ✓ messages

3. **Check each message:**
   - `Questions loaded: 710 questions` ← Should see this
   - `Config loaded: OK` ← Should see this
   - `Selected 60 questions` ← Should see this
   - `✓ All checks passed!` ← MUST see this

4. **If all ✓ messages appear:**
   - Open `index.html` again
   - Enter your name
   - Click "🚀 Start Exam"
   - Should work now!

5. **If any ✗ appears:**
   - Note the error message
   - Refresh the page
   - Try again


## Browser Console Debug Guide

### Open Browser Console:
- **Windows:** Press `F12` → Click "Console" tab
- **Mac:** Press `Cmd+Option+I` → Click "Console"
- **Or:** Right-click page → "Inspect" → "Console"

### Look for these success messages:
```
✓ DOMContentLoaded event fired
✓ QUESTIONS count: 710
✓ CONFIG: LOADED
✓ ExamApp initialized successfully
```

### When you click "Start Exam":
```
✓ startExam called
✓ Name: [yourname] Questions: 60 Time: 60
✓ Total questions available: 710
✓ Quiz questions selected: 60
✓ Starting quiz with 60 questions
```

### If you see errors:
- Copy the **full error message**
- Note the **line number**
- Check that file at that line


## File Size Verification

Check these files exist with correct sizes:

| File | Min Size | What it means |
|------|----------|---------------|
| `js/questions.js` | 120 KB | Questions not loaded |
| `js/config.js` | 1 KB | Config not loaded |
| `js/app.js` | 10 KB | App broken |
| `index.html` | 5 KB | HTML broken |
| `css/style.css` | 10 KB | Styles missing |

If any file is much smaller, it may be corrupted or incomplete.


## Still Not Working?

If you've tried everything:

1. **Close browser completely** (all windows)
2. **Wait 10 seconds**
3. **Open `test-button.html` fresh**
4. **Note what you see**
5. **Share the error messages with me**

---

**Next Steps if it's fixed:**
- Try `index.html`
- Enter a name
- Click "🚀 Start Exam"
- You should see the first question
- Timer should countdown at top
- Select an answer and navigate
- Try submitting to see results

---

**Remember:** Open developer console (F12) to see detailed error messages!
