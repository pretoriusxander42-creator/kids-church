# Manual Testing Checklist

Use this checklist to verify all features work correctly in the browser.

## Pre-Testing Setup
- [ ] Server is running (`./start-server.sh`)
- [ ] Browser open at http://localhost:4000
- [ ] Logged in as admin user

---

## 1. Login & Dashboard Loading

- [ ] Login page displays correctly
- [ ] Can login with: pretoriusxander42@gmail.com
- [ ] Dashboard loads after login
- [ ] Statistics show correct numbers:
  - [ ] Total children (should show 6)
  - [ ] Total parents (should show 3)
  - [ ] Total classes (should show 6)
  - [ ] Currently checked in (should show 0 initially)
- [ ] Recent check-ins list visible (empty initially)

---

## 2. Tab Navigation

- [ ] **Overview tab** is active by default
- [ ] **Check-in tab** switches correctly
- [ ] **Check-out tab** switches correctly  
- [ ] **Classes tab** switches correctly
- [ ] **First Time Visitor tab** switches correctly
- [ ] **Special Needs tab** switches correctly
- [ ] **Reports tab** switches correctly
- [ ] Clicking tabs updates content area
- [ ] Active tab has visual indicator (different color)

---

## 3. Check-In Workflow (CRITICAL)

### Step 1: Search for Child
- [ ] Click "Check-in" tab
- [ ] Search box appears
- [ ] Type "Emma" in search
- [ ] Results appear with "Emma Smith"
- [ ] Click on Emma Smith

### Step 2: Assign Class
- [ ] Child details display (name, age, photo)
- [ ] Parent info shows (John Smith)
- [ ] Class dropdown appears with 6 classes:
  - [ ] Nursery
  - [ ] Toddlers
  - [ ] Kindergarten
  - [ ] Elementary
  - [ ] Pre-Teen
  - [ ] Special Needs
- [ ] Select "Kindergarten"

### Step 3: Complete Check-in
- [ ] "Check In" button is enabled
- [ ] Click "Check In" button
- [ ] Security code appears (6 digits)
- [ ] Success message shows
- [ ] Code can be copied/printed
- [ ] Modal closes when clicking X or outside

### Step 4: Verify Check-in
- [ ] Return to Overview tab
- [ ] "Currently checked in" count increased to 1
- [ ] Emma Smith appears in recent check-ins list
- [ ] Check-in time is correct

---

## 4. Check-Out Workflow (CRITICAL)

### Step 1: Navigate to Check-out
- [ ] Click "Check-out" tab
- [ ] Input field for security code appears
- [ ] Placeholder text helpful

### Step 2: Enter Security Code
- [ ] Enter the 6-digit code from Emma's check-in
- [ ] Click "Verify Code" or press Enter
- [ ] Child details appear (Emma Smith)
- [ ] Shows check-in time

### Step 3: Complete Check-out
- [ ] "Check Out" button appears
- [ ] Click "Check Out"
- [ ] Success message appears
- [ ] Modal closes

### Step 4: Verify Check-out
- [ ] Return to Overview tab
- [ ] "Currently checked in" count back to 0
- [ ] Emma no longer in recent check-ins (or shows checked out)

---

## 5. Add Child Modal

- [ ] Click "Add Child" button (Overview tab)
- [ ] Modal opens with form
- [ ] Form has required fields:
  - [ ] First name (required)
  - [ ] Last name (required)
  - [ ] Date of birth
  - [ ] Allergies
  - [ ] Medical conditions
  - [ ] Emergency notes
  - [ ] Photo URL (optional)

### Test: Add New Child
- [ ] Fill in:
  - First name: "Test"
  - Last name: "Child"
  - DOB: "2020-01-15"
  - Allergies: "None"
- [ ] Click "Register Child"
- [ ] Success message appears
- [ ] Modal closes
- [ ] Child count increased by 1

### Test: Validation
- [ ] Open modal again
- [ ] Try to submit empty form
- [ ] Error message appears for required fields
- [ ] Form doesn't submit

### Test: Close Modal
- [ ] Open modal
- [ ] Click X button - modal closes
- [ ] Open modal again
- [ ] Click outside modal - modal closes
- [ ] Open modal again
- [ ] Press Escape key - modal closes

---

## 6. Add Parent Modal

- [ ] Click "Add Parent" button (Overview tab)
- [ ] Modal opens with form
- [ ] Form fields:
  - [ ] First name (required)
  - [ ] Last name (required)
  - [ ] Phone number (required)
  - [ ] Email (optional)

### Test: Add New Parent
- [ ] Fill in:
  - First name: "Test"
  - Last name: "Parent"
  - Phone: "555-9999"
  - Email: "test@example.com"
- [ ] Click "Register Parent"
- [ ] Success message appears
- [ ] Modal closes
- [ ] Parent count increased by 1

### Test: Phone Validation
- [ ] Open modal
- [ ] Enter invalid phone (e.g., "abc")
- [ ] Form shows error or doesn't submit

---

## 7. Manage Children Modal

- [ ] Click "Manage Children" button
- [ ] Modal opens with list of all children
- [ ] Shows 7 children (6 original + 1 test child)
- [ ] Each child has "Edit" button
- [ ] Search box filters list

### Test: Edit Child
- [ ] Click "Edit" on Emma Smith
- [ ] Child details appear
- [ ] Can edit name, DOB, allergies
- [ ] "Link Parent" section visible
- [ ] Select parent from dropdown
- [ ] Choose relationship type
- [ ] Click "Link Parent"
- [ ] Success message appears

### Test: View Linked Parents
- [ ] Linked parents show under child
- [ ] Shows relationship type (Mother, Father, etc.)
- [ ] Can unlink parent

---

## 8. Classes Tab

- [ ] Click "Classes" tab
- [ ] List of 6 classes displays
- [ ] Each class shows:
  - [ ] Name
  - [ ] Age range
  - [ ] Current enrollment / Max capacity
  - [ ] Teachers (if any)
  - [ ] Room number

### Test: Add Class
- [ ] "Add Class" button visible
- [ ] Click button
- [ ] Modal opens with form:
  - [ ] Class name
  - [ ] Age range
  - [ ] Max capacity
  - [ ] Room number
  - [ ] Teacher name
- [ ] Fill in new class
- [ ] Submit form
- [ ] New class appears in list

---

## 9. Special Needs Tab

- [ ] Click "Special Needs" tab
- [ ] Form appears for special needs children
- [ ] Fields:
  - [ ] Select child dropdown
  - [ ] Accommodations needed
  - [ ] Communication preferences
  - [ ] Behavioral notes
  - [ ] Emergency procedures
  - [ ] Parent signature

### Test: Submit Form
- [ ] Select a child
- [ ] Fill in accommodations
- [ ] Click "Save Special Needs Form"
- [ ] Success message appears
- [ ] Form saves

---

## 10. Reports Tab

- [ ] Click "Reports" tab
- [ ] Date range selector appears
- [ ] "Generate Report" button visible
- [ ] Select date range (today)
- [ ] Click "Generate Report"
- [ ] Report displays with:
  - [ ] Check-in history
  - [ ] Children checked in today
  - [ ] Check-in/out times
  - [ ] Classes attended

### Test: Print Report
- [ ] "Print Report" button visible
- [ ] Click button
- [ ] Print dialog opens
- [ ] Report formatted for printing

---

## 11. Search Functionality

### Test: Search Children
- [ ] Go to Check-in tab
- [ ] Type "Smith" in search
- [ ] Multiple Smiths appear
- [ ] Type "Emma"
- [ ] Only Emma Smith appears
- [ ] Clear search
- [ ] All children appear (or none until search)

### Test: Search Performance
- [ ] Search responds quickly (< 1 second)
- [ ] No lag when typing
- [ ] Results update as you type

---

## 12. Auto-Refresh (30 seconds)

- [ ] Note current "checked in" count
- [ ] Check in a child (Emma)
- [ ] Wait 30 seconds
- [ ] Dashboard statistics refresh automatically
- [ ] Recent check-ins list updates
- [ ] No page reload (smooth update)

---

## 13. Error Handling

### Test: Invalid Security Code
- [ ] Go to Check-out tab
- [ ] Enter invalid code: "000000"
- [ ] Click verify
- [ ] Error message appears: "Invalid security code"
- [ ] No child details shown

### Test: Duplicate Check-in
- [ ] Check in Emma Smith
- [ ] Try to check in Emma again
- [ ] Error message: "Already checked in"
- [ ] Or button disabled

### Test: Network Error Simulation
- [ ] Stop server: `./stop-server.sh`
- [ ] Try to check in a child
- [ ] Error message appears
- [ ] Offline warning bar appears at top
- [ ] Restart server: `./start-server.sh`
- [ ] Online warning disappears

### Test: Missing Required Fields
- [ ] Open "Add Child" modal
- [ ] Leave first name empty
- [ ] Try to submit
- [ ] Error message shows
- [ ] Form doesn't submit

---

## 14. Responsive Design (Laptop)

- [ ] Resize browser window smaller
- [ ] Layout adapts (no horizontal scroll)
- [ ] Tabs remain accessible
- [ ] Modals still readable
- [ ] Buttons still clickable
- [ ] Text remains readable

---

## 15. Logout

- [ ] Logout button visible (top right)
- [ ] Click logout
- [ ] Redirected to login page
- [ ] Cannot access dashboard without login
- [ ] Login again works correctly

---

## 16. Performance

- [ ] Dashboard loads in < 2 seconds
- [ ] Switching tabs is instant
- [ ] Searching responds in < 1 second
- [ ] Check-in completes in < 2 seconds
- [ ] No visible lag or freezing
- [ ] Browser doesn't show "page unresponsive"

---

## 17. Security Code Validation

- [ ] Check in 3 different children
- [ ] Each gets unique 6-digit code
- [ ] No duplicate codes
- [ ] Codes are random (not sequential)
- [ ] Code only works for correct child

---

## 18. Data Persistence

- [ ] Check in Emma Smith
- [ ] Refresh page (Cmd+R)
- [ ] Emma still shows as checked in
- [ ] Check out Emma
- [ ] Refresh page
- [ ] Emma shows as checked out
- [ ] Data survives page refresh

---

## Testing Results

**Date Tested:** _______________  
**Tester:** _______________  
**Total Checks:** 180+  
**Passed:** _______________  
**Failed:** _______________  
**Issues Found:** 

1. ________________________________________
2. ________________________________________
3. ________________________________________

**Overall Status:** 
- [ ] ✅ Ready for Production
- [ ] ⚠️ Minor Issues (can go live with notes)
- [ ] ❌ Major Issues (needs fixes)

**Notes:**
_________________________________________
_________________________________________
_________________________________________

