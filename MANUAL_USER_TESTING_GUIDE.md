# Manual User Testing Guide - Kids Church Check-in System
**Testing Date:** November 20, 2025  
**Server:** http://localhost:4000  
**Status:** All critical backend issues fixed, ready for UI testing

---

## Pre-Testing Setup

### 1. Ensure Server is Running
```bash
cd /Users/Xander/kids-church
# Check if server is running
curl http://localhost:4000/health

# If not running, start it:
npm run build
node dist/server.js > server.log 2>&1 &
```

### 2. Open Application
- Open browser: http://localhost:4000
- Use Chrome or Safari for best results
- Open Developer Console (Cmd+Option+I) to see any JavaScript errors

---

## Testing Checklist

### ✅ SECTION 1: Landing Page & Authentication

#### Test 1.1: Landing Page Display
- [ ] Page loads without errors
- [ ] "Kids Church Check-in" header visible
- [ ] Two tabs visible: "Sign In" and "Create Account"
- [ ] Four Quick Action cards visible with "Login to access" text
- [ ] Quick Actions: New Check-in, Register Parent, Register Child, View Reports

**Expected:**
- Clean, professional landing page
- No console errors
- All buttons and forms visible

**How to Fix if Broken:**
- Check browser console for JavaScript errors
- Verify `/public/index.html` loaded correctly
- Check `/public/styles.css` is loaded

---

#### Test 1.2: User Registration
**Steps:**
1. Click "Create Account" tab
2. Fill in:
   - Full Name: "Test User Sunday"
   - Email: "sunday.test@church.com"
   - Password: "TestPass123!"
3. Click "Create Account"

**Expected:**
- Form submits successfully
- Dashboard loads automatically
- Welcome message shows "Welcome, Test User Sunday"
- No error messages

**If it Fails:**
- Error shown: Check validation messages
- 409 Conflict: Email already exists (use different email)
- Network error: Check server is running
- Dashboard doesn't load: Check browser console

---

#### Test 1.3: Login with Existing User
**Steps:**
1. Refresh page (if logged in, click Logout first)
2. Enter email: "testuser@church.com"
3. Enter password: "TestPass123!"
4. Click "Sign In"

**Expected:**
- Dashboard loads
- Stats cards show numbers
- Navigation tabs visible: Overview, Check-in, Classes, FTV Board, Special Needs, Reports

**If it Fails:**
- Invalid credentials: Verify password is correct
- Token error: Clear browser localStorage and try again
- Dashboard blank: Check browser console for errors

---

#### Test 1.4: Password Reset Flow
**Steps:**
1. On login page, click "Forgot your password?"
2. Enter email: "testuser@church.com"
3. Click "Send Reset Link"
4. Check browser console for reset URL or check server terminal

**Expected:**
- Success message appears
- Reset URL displayed (in development mode)
- Example: `http://localhost:4000/reset-password.html?token=abc123...`

**Test Reset Page:**
5. Copy the reset URL and paste in browser
6. Enter new password twice
7. Click "Reset Password"
8. Should redirect to login

**If it Fails:**
- No URL shown: Check server logs for email output
- Reset page 404: Verify `/public/reset-password.html` exists
- Token invalid: Token expires in 15 minutes

---

### ✅ SECTION 2: Dashboard Overview

#### Test 2.1: Dashboard Stats Display
**Steps:**
1. Log in successfully
2. View the stats cards on dashboard

**Expected:**
- 4 stat cards visible:
  - Total Children: (number)
  - Today's Check-ins: (number)
  - This Week: (number)
  - Total Parents: (number)
- Numbers are accurate (not all zeros if you have data)

**If it Fails:**
- All zeros: Database may be empty
- Error loading: Check `/api/statistics/dashboard` endpoint
- Console error: Check network tab for failed requests

---

#### Test 2.2: Navigation Tabs
**Steps:**
1. Click each tab: Overview, Check-in, Classes, FTV Board, Special Needs, Reports
2. Verify each loads without error

**Expected:**
- Each tab activates (blue underline/highlight)
- Content area changes for each tab
- No "loading forever" states
- No JavaScript errors

**If it Fails:**
- Tab doesn't activate: Check browser console
- Content blank: Check specific section below
- Errors: Note which tab and check relevant API endpoint

---

### ✅ SECTION 3: Parent Management

#### Test 3.1: Register New Parent
**Steps:**
1. Navigate to Check-in tab (or find parent registration)
2. Look for "+ Add Parent" or similar button
3. Fill in parent form:
   - First Name: "Sarah"
   - Last Name: "Johnson"
   - Email: "sarah.johnson@email.com"
   - Phone: "555-1234"
4. Submit

**Expected:**
- Success message appears
- Parent added to system
- Can search for parent later

**If it Fails:**
- Validation error: Check required fields
- Duplicate email: Use different email
- Server error: Check `/api/parents` POST endpoint

---

### ✅ SECTION 4: Child Management

#### Test 4.1: Register New Child
**Steps:**
1. Find child registration (may be in Check-in view or separate section)
2. Click "+ Add New Child" button
3. Fill in form:
   - First Name: "Timmy"
   - Last Name: "Johnson"
   - Date of Birth: "2018-06-15"
   - Grade: "Kindergarten"
   - Medical Info: "No known allergies"
4. Submit

**Expected:**
- Success message
- Child added to database
- Can search for child in check-in

**If it Fails:**
- Form not found: Check dashboard.js `showChildRegistrationModal()` function
- Validation error: Check all required fields filled
- Server error: Check `/api/children` POST endpoint

---

#### Test 4.2: Link Parent to Child
**Steps:**
1. After creating child, find "Link Parent" option
2. Search for parent "Sarah Johnson"
3. Select relationship type: "mother"
4. Save

**Expected:**
- Relationship created
- Parent-child link saved to database
- Child now shows parent info

**If it Fails:**
- Can't find parent: Verify parent was created in Test 3.1
- Relationship types: Must be mother, father, guardian, or other
- Server error: Check `/api/parents/:id/children/:childId` POST endpoint

---

### ✅ SECTION 5: Check-In Flow (CRITICAL)

#### Test 5.1: Full Check-In Process
**Prerequisites:**
- Have at least one child with linked parent
- Have at least one class created

**Steps:**
1. Click "Check-in" tab
2. In search box, type child's name: "Timmy"
3. Click on child from results
4. Verify child details display:
   - Name, DOB, Allergies, Medical notes
5. Select class from dropdown
6. Click "Check In" button

**Expected:**
- ✅ Success modal appears
- ✅ Security code displayed (6 digits)
- ✅ Example: "842917"
- ✅ "Print Security Tag" button works
- ✅ Can close modal

**CRITICAL CHECKS:**
- [ ] Security code is exactly 6 digits
- [ ] Security code is visible and easy to read
- [ ] Child name shown in modal
- [ ] Can click "Done" to close

**If it Fails:**
**Issue: "No parent linked"**
- Go back and complete Test 4.2 (Link Parent)
- Or modify check-in code to handle missing parent

**Issue: "No classes available"**
- Go to Classes tab
- Create at least one class (type: regular)
- Try check-in again

**Issue: Class dropdown empty**
- Check browser console for errors
- Verify `/api/statistics/classes/capacity` returns data
- Check classes exist in database

**Issue: Security code not shown**
- Check browser console
- Verify `/api/checkins` POST endpoint response
- Check `showSecurityCodeModal()` function in dashboard.js

---

#### Test 5.2: Print Security Tag
**Steps:**
1. After successful check-in, click "Print Security Tag"
2. Print dialog should open

**Expected:**
- Browser print dialog opens
- Security tag formatted for printing
- Shows child name and security code prominently

**If it Fails:**
- Nothing happens: Check browser popup blockers
- Poor formatting: Check CSS for @media print rules

---

### ✅ SECTION 6: Check-Out Flow (CRITICAL)

#### Test 6.1: Check Out Child with Security Code
**Prerequisites:**
- Have a child currently checked in (from Test 5.1)
- Know the security code (write it down!)

**Steps:**
1. Go to Overview or Check-in tab (wherever checkout form is)
2. Find security code input field
3. Enter the 6-digit security code from check-in
4. Click "Check Out Child"

**Expected:**
- ✅ Success message: "Check-out Successful!"
- ✅ Shows child name who was checked out
- ✅ Security code field clears
- ✅ Dashboard refreshes

**CRITICAL CHECKS:**
- [ ] Correct child is checked out (name matches)
- [ ] Invalid code shows error message
- [ ] Already checked-out child shows error
- [ ] Code validation works (must be 6 digits)

**If it Fails:**
**Issue: "Invalid Security Code"**
- Verify you're using the correct code
- Check child is actually checked in (not already out)
- Try checking in again and use new code

**Issue: Nothing happens**
- Check browser console
- Verify `/api/checkins/:id/checkout` POST endpoint
- Check `performCheckout()` function in dashboard.js

---

### ✅ SECTION 7: Special Boards

#### Test 7.1: FTV Board (First Time Visitors)
**Prerequisites:**
- Create a class with type="ftv"
- Check in a child to that FTV class

**Steps:**
1. Click "FTV Board" tab
2. View first-time visitors

**Expected:**
- Shows children checked into FTV classes today
- Displays: Name, Age, Check-in time, Parent contact
- If no FTV children: "No first-time visitors today"

**If it Fails:**
- Shows wrong children: Verify class type filtering
- Empty when shouldn't be: Check children are checked into FTV class
- Console errors: Check `loadFTVChildren()` function

**Fixed in Latest Update:**
- ✅ Now uses proper class type lookup instead of non-existent field

---

#### Test 7.2: Special Needs Board
**Prerequisites:**
- Have a child with special_needs=true
- Child must be currently checked in

**Steps:**
1. Click "Special Needs" tab
2. View special needs children

**Expected:**
- Shows children with special needs who are checked in
- Displays special needs details
- "View Form" button for each child

**If it Fails:**
- Empty: Ensure child has special_needs flag set
- Not updating: Refresh after checking in special needs child

---

### ✅ SECTION 8: Reports

#### Test 8.1: View Attendance Reports
**Steps:**
1. Click "Reports" tab
2. View attendance statistics

**Expected:**
- Shows attendance by date
- Class-wise breakdown
- Export options available

**If it Fails:**
- Empty: Check if there are any check-ins in database
- Errors: Check `/api/statistics/attendance/*` endpoints

---

## Common Issues & Solutions

### Issue: "Server not responding"
**Solution:**
```bash
# Check if server is running
lsof -i :4000

# If not running:
cd /Users/Xander/kids-church
npm run build
node dist/server.js > server.log 2>&1 &

# Check for errors:
tail -f server.log
```

### Issue: "Token expired" or "Invalid token"
**Solution:**
```bash
# Clear browser storage:
# In browser console:
localStorage.clear()
sessionStorage.clear()
# Refresh page and log in again
```

### Issue: "Database errors" or "Column does not exist"
**Solution:**
- Check that Supabase database is running
- Verify migrations are applied
- Run: `00_RUN_ALL_MIGRATIONS.sql` in Supabase SQL Editor

### Issue: UI looks broken or unstyled
**Solution:**
- Check that `/public/styles.css` is loading
- Check browser console for CSS load errors
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Issue: JavaScript errors in console
**Solution:**
- Note the error message and file/line number
- Check if the mentioned function exists
- Verify API endpoints are returning expected data
- Check for typos in function names

---

## Critical Tests Summary

### Must Pass Before Sunday:
1. ✅ User can log in
2. ✅ Dashboard loads and shows stats
3. ✅ Can check in a child (with parent linked)
4. ✅ Security code displays correctly
5. ✅ Can check out child with security code
6. ✅ FTV Board shows first-time visitors
7. ✅ Special Needs Board shows special needs children

### Nice to Have:
- Parent/Child registration through UI works smoothly
- Reports display correctly
- Print security tag works
- All validation messages are clear

---

## Test Data Created

Use these for testing:

**Existing Test User:**
- Email: testuser@church.com
- Password: TestPass123!

**Existing Parents:**
- John Smith (john.smith@email.com) - has 2 children

**Existing Children:**
- Emma Smith (2018-05-15) - linked to John
- Oliver Smith (2016-03-20) - linked to John, has special needs

**Existing Classes:**
- Nursery (regular, capacity: 10)
- Toddlers (regular, capacity: 15)
- Kindergarten Room A (regular)
- FTV Board (ftv, capacity: 20)
- Special Needs (special, capacity: 8)

---

## Reporting Issues

When you find an issue, note:
1. **What you did** (exact steps)
2. **What you expected** (intended behavior)
3. **What actually happened** (actual behavior)
4. **Browser console errors** (if any)
5. **Screenshot** (if visual issue)

Example:
```
Issue: Check-in button doesn't work
Steps: 
1. Selected child "Emma Smith"
2. Selected class "Kindergarten"
3. Clicked "Check In"
Expected: Security code modal appears
Actual: Nothing happens
Console Error: "TypeError: Cannot read property 'id' of undefined at performCheckIn"
```

---

## Files Modified in Latest Fix

These files were updated to fix critical issues:

1. **src/routes/statistics.ts**
   - Fixed: Removed `is_active` filter from class capacity query
   
2. **public/dashboard.js**
   - Fixed: FTV board now uses proper class type lookup
   - Fixed: Check-in now gets child's actual parent (not first system parent)
   - Improved: Parent error handling with prompt to register

3. **src/routes/children.ts**
   - Added: New endpoint `/api/children/:id/parents`
   
4. **Created: FTV_BOARD_FIX.md**
   - Documentation of FTV board issue and solution

---

## Next Steps After Testing

1. **Document all issues found** (use format above)
2. **For critical blockers**: Stop and let me know immediately
3. **For minor issues**: Note them and continue testing
4. **After completing all tests**: Provide summary of what works/doesn't work

---

## Success Criteria

✅ **Ready for Sunday if:**
- Users can log in without errors
- Check-in flow works end-to-end
- Security codes generate and display
- Check-out works with security code validation
- Dashboard shows accurate stats
- FTV and Special Needs boards function

❌ **Not ready if:**
- Check-in fails or doesn't show security code
- Check-out doesn't work
- Critical JavaScript errors prevent use
- Database connection issues
- Security codes not generating

---

**Good luck with testing! The system should be stable now with all critical fixes applied.**
