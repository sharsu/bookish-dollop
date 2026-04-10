# Quick Test Guide - Drawing Pad & App

## ✅ Testing the Complete Application

### Step 1: Clear Cache & Open App
1. Open browser and press **Ctrl+Shift+Delete** to open developer tools cache clearing
2. Clear all cache/cookies
3. Navigate to `index.html` or press **Ctrl+Shift+R** for hard refresh
4. You should see the login screen with a name input field

### Step 2: Start the Exam
1. Enter a name (e.g., "Test Child")
2. Click **🚀 Start Exam**
3. The app transitions to the quiz screen

### Step 3: Verify Layout
✅ **Left side (50%):** 
  - Question text
  - Topic label
  - Difficulty badge  
  - 4 multiple choice options (A, B, C, D)
  - Previous/Next buttons

✅ **Right side (50%):**
  - "📝 Rough Work" header
  - White canvas area
  - Three pen size buttons: **S** (Small), **M** (Medium), **L** (Large)
  - **↶** (Undo) and **🗑️** (Clear) buttons

### Step 4: Test Drawing
1. **Draw on canvas:**
   - Click/drag mouse on the white canvas
   - You should see **dark gray lines** appear as you draw
   - Try drawing shapes, letters, numbers

2. **Change pen size:**
   - Click **S** button → thin lines
   - Click **M** button → medium lines  
   - Click **L** button → thick lines
   - Current size shows highlighted in blue

3. **Undo drawing:**
   - Click **↶** button or press **Ctrl+Z**
   - Last stroke disappears
   - Can undo up to 20 strokes

4. **Clear everything:**
   - Click **🗑️** button
   - Entire canvas clears to white

### Step 5: Test Navigation
1. Answer a question and click **Next →**
   - Canvas auto-clears automatically
   - New question displays
   - Try drawing on the fresh canvas

2. Click **← Previous**
   - Go back to previous question
   - Canvas auto-clears
   - Verify you can draw there too

### Step 6: Complete Test
1. Answer/skip some questions
2. Click **Submit Paper** when ready
3. View results
4. All scores should calculate correctly

## 🎯 Success Criteria
- ✅ Drawing appears on canvas
- ✅ Pen size changes affect line thickness
- ✅ Undo works (button and Ctrl+Z)
- ✅ Clear wipes canvas completely
- ✅ Auto-clear works on navigation
- ✅ Quiz still functions perfectly
- ✅ Scoring is accurate

## 📱 Tablet/iPad Testing
Same steps work on iPad with Apple Pencil or Android stylus:
1. Use stylus to draw instead of mouse
2. Pressure sensitivity is supported
3. Drawing is smooth and responsive

---
**Ready to Test!** 🚀
