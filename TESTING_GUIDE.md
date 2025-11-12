# Testing Guide - Kids Church Check-in System

**Quick Start Testing Guide**  
**Last Updated:** November 12, 2025

---

## 🚀 Prerequisites

1. **Database:** All migrations applied successfully ✅
2. **Server:** Running at http://localhost:4000 ✅
3. **Dependencies:** All installed (including nodemailer) ✅

---

## 📋 Test Scenarios

### 1. User Registration & Login

#### Test User Registration
1. Open http://localhost:4000 in browser
2. Click "Sign Up" tab
3. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!@# (must meet all requirements)
4. Click "Create Account"
5. **Expected:** Success message, automatic login, redirect to dashboard

#### Test Login
1. If logged in, click "Sign Out"
2. Click "Sign In" tab
3. Enter:
   - Email: test@example.com
   - Password: Test123!@#
4. Click "Sign In"
5. **Expected:** Success, redirect to dashboard with welcome message

---

### 2. Child Registration

#### Register a New Child
1. Navigate to dashboard (should auto-open after login)
2. Click "Check-in" tab in navigation
3. Click "+ Add New Child" button (top right)
4. Fill in form:
   - First Name: Emma
   - Last Name: Johnson
   - Date of Birth: 2018-05-15
   - Gender: Female
   - Allergies: Peanuts
   - Medical Notes: Asthma - has inhaler
   - Special Needs: (unchecked)
5. Click "Register Child"
6. **Expected:** Success toast, modal closes, can now search for child

#### Register Child with Special Needs
1. Click "+ Add New Child" again
2. Fill in form:
   - First Name: Lucas
   - Last Name: Martinez
   - Date of Birth: 2016-03-20
   - Gender: Male
   - Check "This child has special needs"
   - Special Needs Details: Autism spectrum - non-verbal
3. Click "Register Child"
4. **Expected:** Success toast, modal closes

---

### 3. Parent Registration

#### Register a New Parent
1. From dashboard Overview, click "+ Add Parent" button
2. Fill in form:
   - First Name: Sarah
   - Last Name: Johnson
   - Email: sarah.johnson@example.com
   - Phone: (555) 123-4567
   - Address: 123 Main St, Cityville, ST 12345
   - Emergency Contact Name: John Johnson
   - Emergency Contact Phone: (555) 987-6543
3. Click "Register Parent"
4. **Expected:** Success toast, modal closes

---

### 4. Child Check-in Flow

#### Check in a Child
1. Click "Check-in" tab
2. In search box, type "Emma"
3. **Expected:** Emma Johnson appears in results
4. Click on Emma Johnson result
5. **Expected:** Child details display with allergies warning
6. Review medical notes and allergies
7. Click "Check In" button
8. **Expected:** Large modal with security code (6 digits, e.g., 742931)
9. Note the security code
10. Click "Done" or wait for auto-redirect
11. **Expected:** Redirected to Overview, child shows in recent check-ins

#### Test Search with No Results
1. Click "Check-in" tab
2. Type "ZZZZZ" in search
3. **Expected:** "No children found" message

---

### 5. Child Check-out Flow

#### Check out a Child
1. Click "Check-out" tab in navigation
2. Enter the security code from check-in (6 digits)
3. Click "Check Out Child"
4. **Expected:** Success message with child's name
5. Auto-redirect to Overview after 2 seconds

#### Test Invalid Security Code
1. Click "Check-out" tab
2. Enter "000000" (invalid code)
3. Click "Check Out Child"
4. **Expected:** Error message "Invalid Security Code"

#### Test Already Checked-Out Child
1. Try to check out with same code again
2. **Expected:** Error message (no active check-in found)

---

### 6. Special Needs Form

#### Submit Special Needs Form
1. Click "Special Needs" tab in navigation
2. Click "+ Add Special Needs Form" button
3. Select "Lucas Martinez" from dropdown
4. Fill in form:
   - Diagnosis: Autism Spectrum Disorder
   - Medications: None
   - Triggers: Loud noises, unexpected touch
   - Calming Techniques: Noise-canceling headphones, quiet corner
   - Communication Methods: Picture cards, iPad with communication app
   - Emergency Procedures: Contact parent immediately, use visual schedule
   - Additional Notes: Prefers routine, give 5-minute warnings before transitions
5. Click "Submit Form"
6. **Expected:** Success toast, modal closes

#### View Existing Form
1. Ensure Lucas is checked in
2. Go to "Special Needs" tab
3. **Expected:** Lucas appears in special needs board
4. Click "View Form" button
5. **Expected:** See all the details entered

---

### 7. Class Management

#### Create a New Class
1. Click "Classes" tab
2. Click "+ Create Class" button
3. Fill in form:
   - Name: Preschool (Ages 3-5)
   - Description: Interactive Bible stories and crafts
   - Type: Regular
   - Capacity: 15
   - Age Min: 3
   - Age Max: 5
   - Room Location: Room 101
   - Schedule: Sundays 9:00 AM - 10:30 AM
4. Click "Create Class"
5. **Expected:** Success toast, class appears in list

#### Create FTV Class
1. Click "+ Create Class"
2. Fill in:
   - Name: First Time Visitors
   - Type: FTV
   - Capacity: 10
   - Room Location: Welcome Center
3. Click "Create Class"
4. **Expected:** Success, appears in classes list

---

### 8. Dashboard Overview

#### Check Dashboard Stats
1. Go to "Overview" tab
2. **Expected:** See 4 stat cards:
   - Total Children (should show count)
   - Today's Check-ins (should show number)
   - Week's Check-ins (should show number)
   - Total Parents (should show count)
3. **Expected:** See recent check-ins list below stats
4. Verify Emma Johnson appears in recent list

---

### 9. FTV Board

#### View FTV Board
1. Click "FTV Board" tab
2. **Expected:** Shows children assigned to FTV class (if any)
3. If no FTV children, shows "No first-time visitors today"

---

### 10. Mobile Responsiveness

#### Test on Mobile Devices
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M or Cmd+Shift+M)
3. Select iPhone or Android device
4. Test:
   - Login form fits screen ✓
   - Dashboard navigation is usable ✓
   - Modals are readable ✓
   - Forms stack to single column ✓
   - Buttons are tappable ✓

---

## 🔍 What to Look For

### ✅ Success Indicators
- Forms submit without errors
- Toast notifications appear for success/error
- Modals open and close properly
- Search works with debouncing
- Security codes generate correctly
- Check-out verifies codes properly
- Dashboard stats update after actions
- No console errors in browser DevTools

### ❌ Failure Indicators
- "Network error" messages
- Console errors (red text in DevTools)
- Blank screens
- Buttons that don't respond
- Forms that don't close after submit
- Missing data in lists
- Security codes not displaying

---

## 🐛 Known Issues to Ignore (For Now)

1. **Parent-Child Linking:** Children aren't linked to specific parents yet
2. **Edit Functionality:** Can't edit existing children/parents/classes yet
3. **Delete Functionality:** Can't delete items yet
4. **Email Notifications:** Not configured yet (SMTP not set up)
5. **Real-time Stats:** Dashboard doesn't auto-refresh (need to reload)

---

## 📝 Test Checklist

Use this checklist to track what you've tested:

- [ ] User registration
- [ ] User login
- [ ] User logout
- [ ] Child registration (normal)
- [ ] Child registration (special needs)
- [ ] Parent registration
- [ ] Child search and selection
- [ ] Check-in flow with security code
- [ ] Check-out flow with valid code
- [ ] Check-out flow with invalid code
- [ ] Special needs form submission
- [ ] Class creation (regular)
- [ ] Class creation (FTV)
- [ ] Dashboard stats display
- [ ] Recent check-ins list
- [ ] FTV Board view
- [ ] Special Needs Board view
- [ ] Mobile responsive design
- [ ] All modal open/close functions

---

## 🆘 Troubleshooting

### Issue: Can't login after registration
**Solution:** Check browser console for errors. Verify email and password meet requirements.

### Issue: Search doesn't find children
**Solution:** Make sure child was registered successfully. Check dashboard stats to see if total children count increased.

### Issue: Security code check-out fails
**Solution:** Ensure the code is exactly 6 digits and the child is currently checked in (not already checked out).

### Issue: Modal won't close
**Solution:** Click the X button in top right or click outside the modal on the dark overlay.

### Issue: Forms don't submit
**Solution:** Check for required field errors. All fields marked with * are required.

---

## 📊 Expected Results Summary

After completing all tests above, you should have:
- ✅ 1 registered user (test@example.com)
- ✅ 2 registered children (Emma Johnson, Lucas Martinez)
- ✅ 1 registered parent (Sarah Johnson)
- ✅ 2 check-ins performed (and possibly checked out)
- ✅ 1 special needs form submitted (Lucas)
- ✅ 2 classes created (Preschool, FTV)
- ✅ Dashboard showing accurate statistics
- ✅ All views navigable and functional

---

## 🎯 Next Steps After Testing

1. Document any bugs found
2. Provide feedback on UX/UI
3. Request additional features
4. Move to Phase 2 development:
   - Email configuration
   - Admin user setup
   - Parent-child relationship management
   - Edit/delete functionality
   - Advanced reporting

---

**Happy Testing! 🚀**
