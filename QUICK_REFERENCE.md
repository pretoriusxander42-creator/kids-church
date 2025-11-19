# 🏫 Kids Church Check-in - Quick Reference Guide

## Sunday Morning Startup Checklist

### 1. Start the System (5 minutes before service)
```bash
cd /Users/Xander/kids-church
./start-server.sh
```

### 2. Open Browser
- Navigate to: **http://localhost:4000**
- Login with your admin email
- You'll see the dashboard automatically

### 3. Verify System Ready
✅ Dashboard loads  
✅ Can see "Check-in" and "Check-out" tabs  
✅ Statistics show on Overview tab  
✅ "Add Child" button visible  

---

## Common Tasks

### ✅ Check In a Child

1. **Click "Check-in" tab**
2. **Search** for child by typing name
3. **Select child** from results
4. **Choose class** from dropdown
5. **Click "Check In"**
6. **Print/Show security code** to parent
   - 6-digit code needed for pickup
   - Keep code secure!

### ❌ Check Out a Child

1. **Click "Check-out" tab**
2. **Enter 6-digit security code** parent provides
3. **Verify** correct child appears
4. **Click "Check Out"**
5. **Confirm** checkout successful

### 👶 Add New Child (First Time Visitor)

1. **Click "Add Child" button** (Overview tab)
2. **Fill in details:**
   - First name, Last name (required)
   - Date of birth (optional but helpful)
   - Allergies, Medical conditions
   - Notes (any special instructions)
3. **Click "Register Child"**
4. **Link to parent** (see below)

### 👨‍👩‍👧 Add New Parent

1. **Click "Add Parent" button** (Overview tab)
2. **Fill in details:**
   - First name, Last name
   - Phone number (for emergencies)
   - Email (optional)
3. **Click "Register Parent"**

### 🔗 Link Parent to Child

1. **Click "Manage Children" button**
2. **Find the child** in the list
3. **Click "Edit"** on that child
4. **In the modal:**
   - Select parent from dropdown
   - Choose relationship (Mother, Father, Guardian, etc.)
   - Click "Link Parent"

### 📊 View Statistics

- **Overview tab** shows:
  - Total children in database
  - Currently checked in
  - Total parents
  - Available classes
  - Recent check-ins list

- **Reports tab** shows:
  - Check-in history
  - Class attendance
  - Filter by date range

---

## Troubleshooting

### ❌ Can't Login
- **Check:** Email must be registered in system
- **Try:** pretoriusxander42@gmail.com or xanderpretorius2002@gmail.com
- **If stuck:** Check server is running (see green text in terminal)

### ❌ Can't Find Child
- **Check spelling** of name
- **Try first name only** (Emma, Noah, Sophia, Liam, Olivia)
- **If new child:** Click "Add Child" first

### ❌ Button Doesn't Work
- **Refresh page** (Cmd+R or F5)
- **Check internet/connection** (offline warning appears at top)
- **Check terminal** for errors (red text)

### ❌ Server Not Running
```bash
cd /Users/Xander/kids-church
./start-server.sh
```

### 🛑 Stop Server (After Service)
```bash
cd /Users/Xander/kids-church
./stop-server.sh
```

---

## Security Codes

- **6-digit numbers** (e.g., 123456)
- **Generated automatically** at check-in
- **Must be kept by parent** for pickup
- **One code per child** per visit
- **New code each time** child is checked in

---

## Classes Available

1. **Nursery** (0-2 years)
2. **Toddlers** (2-3 years)
3. **Kindergarten** (4-5 years)
4. **Elementary** (6-10 years)
5. **Pre-Teen** (11-12 years)
6. **Special Needs** (All ages)

---

## Emergency Contacts

**If system down:**
- Restart server: `./start-server.sh`
- Check server.log for errors
- Manual paper backup available

**For technical support:**
- Admin: pretoriusxander42@gmail.com
- Check TROUBLESHOOTING.md in project folder

---

## End of Day Checklist

✅ All children checked out  
✅ Stop server: `./stop-server.sh`  
✅ Review any special notes for next week  
✅ Close browser  

---

## Sample Data (For Testing)

**Children:**
- Emma Smith
- Noah Smith
- Sophia Johnson
- Liam Johnson
- Olivia Williams

**Parents:**
- John Smith (555-0101)
- Mary Johnson (555-0102)
- David Williams (555-0103)

---

## Keyboard Shortcuts

- **Esc** - Close any modal
- **Cmd+R** (Mac) / **F5** (Windows) - Refresh page
- **Tab** - Navigate form fields

---

## Tips for Smooth Operation

✅ **Start system 15 mins before service**  
✅ **Keep laptop plugged in** (long battery drain)  
✅ **Print this guide** for quick reference  
✅ **Have paper backup** just in case  
✅ **Test one check-in** before families arrive  
✅ **Keep security codes confidential**  

---

**Last Updated:** November 17, 2024  
**Version:** 1.0 Production Release  

*For full documentation, see USER_GUIDE.md*
