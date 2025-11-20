# Quick Start: Class & Child Management

## ⚠️ IMPORTANT: Apply Database Migration First!

Before using the new features, you MUST apply the database migration:

### Step 1: Apply Migration to Supabase

**Option A: Via Supabase Dashboard (Easiest)**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in left menu
4. Copy content from: `supabase/migrations/20251120000000_add_child_tracking.sql`
5. Paste into SQL Editor
6. Click "Run"
7. Verify: You should see "Success" message

**Option B: Via Script**
```bash
node apply-migration.mjs supabase/migrations/20251120000000_add_child_tracking.sql
```

### Step 2: Hard Refresh Browser
Press `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows) to clear cache

---

## 🎯 New Features Quick Reference

### 1. Create a New Classroom
1. Click **"Select Classroom"** tab
2. Click **"+ Create New Class"** button (top right)
3. Fill in the form:
   - **Name** (required): e.g., "Toddlers Room A"
   - **Type** (required): Regular, FTV, Special Needs, or Event
   - **Age Range**: e.g., "2-4 years"
   - **Capacity**: e.g., 20
   - **Room Number**: e.g., "101"
   - **Location**: e.g., "Building A, First Floor"
4. Click **"Create Classroom"**

### 2. Delete a Classroom
1. Go to **"Select Classroom"** tab
2. Find the classroom you want to delete
3. Click the **🗑️ (trash)** button on the classroom card
4. Confirm deletion
   - ⚠️ Cannot delete if children are currently checked in
   - ✅ Check-in history is preserved

### 3. Manage Children (View All)
1. Click **"Manage Children"** tab in navigation
2. See table with:
   - Child name
   - Date of birth & age
   - Last check-in date
   - Activity status badge
   - Actions (archive, view, delete)

### 4. Find Inactive Children
1. Go to **"Manage Children"** tab
2. Use **Inactivity Filter** dropdown:
   - "Inactive >30 days"
   - "Inactive >60 days"
   - "Inactive >90 days"
3. Review the filtered list

### 5. Archive a Child (Soft Delete)
1. Find child in **"Manage Children"** tab
2. Click **📦 (archive box)** button
3. Enter reason for archiving (e.g., "Moved away")
4. Confirm
   - ✅ Data preserved
   - ✅ Can be unarchived later
   - ✅ Removed from active searches

### 6. Unarchive a Child
1. Go to **"Manage Children"** tab
2. Check **"Show Archived"** checkbox
3. Find the archived child
4. Click **↩️ (return arrow)** button
5. Child is now active again!

### 7. Delete a Child Permanently
1. Find child in **"Manage Children"** tab
2. Click **🗑️ (trash)** button
3. Read the warning carefully
4. Confirm you understand it's permanent
5. Type "DELETE" in the prompt
6. Confirm again
   - ⚠️ **PERMANENT** - Cannot be undone!
   - 🗑️ Deletes ALL data (child, check-ins, relationships)
   - ⚠️ Only use for: duplicates, test data, GDPR requests

---

## 🏷️ Status Badges Explained

| Badge | Color | Meaning |
|-------|-------|---------|
| **Active** | 🟢 Green | Checked in within last 30 days |
| **Inactive 30+ days** | 🔵 Blue | Not checked in for 30-59 days |
| **Inactive 60+ days** | 🟠 Orange | Not checked in for 60-89 days |
| **Inactive 90+ days** | 🔴 Red | Not checked in for 90+ days |
| **Never Checked In** | ⚪ Gray | No check-ins on record |
| **Archived** | ⚫ Gray | Soft deleted |

---

## 💡 Best Practices

### When to Archive vs Delete

**✅ Archive a child when:**
- Family moved to another church
- Child hasn't attended in 90+ days
- Family is temporarily away
- You want to keep history but remove from active list

**⚠️ Delete a child when:**
- Duplicate record created by mistake
- Test data that needs cleanup
- Parent requests data removal (GDPR)
- **Only if you're 100% sure!**

### Monthly Maintenance Workflow
1. First Sunday of each month
2. Go to "Manage Children"
3. Filter "Inactive >90 days"
4. Review list
5. Contact families if needed
6. Archive children who have left
7. Document reason clearly

---

## 🔍 Searching & Filtering

### Search by Name
- Type in the **search box** at the top
- Real-time filtering
- Searches first and last names

### Filter by Inactivity
- **All Children** - Show everyone
- **Inactive >30 days** - Warning level
- **Inactive >60 days** - Caution level
- **Inactive >90 days** - Critical level

### Show Archived
- Check the **"Show Archived"** box
- View soft-deleted children
- Can unarchive if needed

---

## 🧪 Test the Features

### Test Checklist
- [ ] Create a new classroom
- [ ] View all classrooms in "Select Classroom"
- [ ] Delete an empty classroom
- [ ] Try to delete a classroom with active check-ins (should fail)
- [ ] Go to "Manage Children" tab
- [ ] Search for a specific child
- [ ] Filter by inactivity (30/60/90 days)
- [ ] Archive a child (provide reason)
- [ ] Toggle "Show Archived" to see archived children
- [ ] Unarchive a child
- [ ] View child details (ℹ️ button)
- [ ] Check that archived children don't appear in classroom search
- [ ] Check in a child and verify last_check_in updates

---

## 🆘 Troubleshooting

### "Failed to load children"
- Migration not applied → Run the migration SQL
- Server not restarted → Restart the server

### Archived child still appears in search
- Hard refresh browser (Cmd+Shift+R)
- Check that "Show Archived" is unchecked

### Cannot delete classroom
- Check if children are currently checked in
- Check them out first, then delete

### Last check-in dates not showing
- Migration needs to be applied
- The migration includes backfill from existing check-ins

---

## 📚 Full Documentation

For complete details, see: **CLASS_AND_CHILD_MANAGEMENT.md**

---

## 🚀 What's Next?

All features are ready to use after applying the migration. The system will automatically:
- Track last check-in on every check-in
- Filter archived children from searches
- Show inactivity badges based on last check-in
- Preserve all data when archiving
- Prevent accidental deletions with confirmations

Enjoy the new management features! 🎉
