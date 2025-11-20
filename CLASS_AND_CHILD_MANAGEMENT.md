# Class and Child Management Features

## Overview
Added comprehensive class management and child archival system to track inactive children and manage classroom lifecycle.

## What's New

### 1. Database Changes
- **New columns in `children` table:**
  - `last_check_in` - Timestamp of last check-in (updated automatically)
  - `is_archived` - Boolean flag for soft archival
  - `archived_at` - Timestamp when archived
  - `archived_reason` - Text field for archival reason

### 2. Class Management

#### Create New Classroom
- **Location:** Select Classroom tab → "+ Create New Class" button
- **Fields:**
  - Classroom Name (required)
  - Type (required): Regular Class, FTV, Special Needs, or Event
  - Age Range (optional)
  - Maximum Capacity (optional)
  - Room Number (optional)
  - Room Location (optional)

#### Delete Classroom
- **Location:** Delete button (🗑️) on each classroom card
- **Validation:** Prevents deletion if children are currently checked in
- **Confirmation:** Requires confirmation dialog
- **Note:** Check-in history is preserved even after deletion

### 3. Child Management

#### New "Manage Children" Tab
- **Access:** Main navigation → "Manage Children"
- **Features:**
  - Searchable table of all children
  - Shows last check-in date
  - Displays inactive status with badges
  - Archive/unarchive functionality
  - Permanent delete option

#### Inactivity Tracking
Children are automatically classified by inactivity:
- **Active:** Checked in within last 30 days (Green badge)
- **30+ days inactive:** Warning (Blue badge)
- **60+ days inactive:** Caution (Orange badge)
- **90+ days inactive:** Critical (Red badge)
- **Never checked in:** Gray badge

#### Filter Options
1. **Show Archived** - Toggle to view archived children
2. **Inactivity Filter** - Dropdown with options:
   - All Children
   - Inactive >30 days
   - Inactive >60 days
   - Inactive >90 days
3. **Search Box** - Real-time name search

#### Child Actions

**Archive Child (📦)**
- Soft delete that preserves all data
- Prompts for archival reason
- Removes from active searches and check-in flows
- Can be unarchived later

**Unarchive Child (↩️)**
- Restores archived child to active status
- Clears archived_at and archived_reason
- Makes child searchable again

**Delete Child (🗑️)**
- **PERMANENT** - Cannot be undone
- Requires double confirmation:
  1. Warning dialog explaining consequences
  2. Type "DELETE" to confirm
- Deletes:
  - Child record
  - All check-in history
  - All parent relationships
- Use Cases: Data cleanup, duplicate records, GDPR requests

**View Details (ℹ️)**
- Shows complete child information in modal
- Displays allergies, medical notes, special needs
- Shows date of birth and age

## API Endpoints

### Children Management
```
GET    /api/children?include_archived=true          # Get all children
GET    /api/children/search?include_archived=true   # Search children
GET    /api/children/inactive/:days                 # Get inactive children
POST   /api/children/:id/archive                    # Archive a child
POST   /api/children/:id/unarchive                  # Unarchive a child
DELETE /api/children/:id                            # Permanently delete child
```

### Class Management
```
POST   /api/classes         # Create new classroom
DELETE /api/classes/:id     # Delete classroom
```

## Migration Instructions

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project
2. Click "SQL Editor" in the left menu
3. Open the migration file: `supabase/migrations/20251120000000_add_child_tracking.sql`
4. Copy the SQL content
5. Paste into Supabase SQL Editor
6. Click "Run"

### Option 2: Using apply-migration.mjs Script
```bash
node apply-migration.mjs supabase/migrations/20251120000000_add_child_tracking.sql
```

## Testing Checklist

### Class Management
- [ ] Create a new classroom with all fields filled
- [ ] Create a classroom with only required fields
- [ ] Try to delete a classroom with active check-ins (should fail)
- [ ] Delete an empty classroom (should succeed)
- [ ] Verify classroom appears in Select Classroom view

### Child Archival
- [ ] Navigate to "Manage Children" tab
- [ ] View table of all children with last check-in dates
- [ ] Filter by inactivity (30/60/90 days)
- [ ] Search for a specific child by name
- [ ] Archive a child (provide reason)
- [ ] Verify archived child doesn't appear in search
- [ ] Toggle "Show Archived" to see archived children
- [ ] Unarchive a child
- [ ] Verify unarchived child appears in search again
- [ ] Test permanent delete with confirmation

### Inactivity Detection
- [ ] Verify badge colors match activity status
- [ ] Check that last check-in dates are accurate
- [ ] Test inactivity filters (30/60/90 days)
- [ ] Verify "Never Checked In" badge for new children

### Integration
- [ ] Check in a child and verify last_check_in updates
- [ ] Confirm archived children don't appear in classroom check-in
- [ ] Verify archived children don't appear in FTV registration search
- [ ] Test that check-in history is preserved after archival

## User Guide

### When to Archive vs. Delete

**Archive a Child When:**
- Family moved to a different church
- Child hasn't attended in 90+ days
- Family is temporarily away (sabbatical, travel)
- You want to preserve history but remove from active list

**Delete a Child When:**
- Duplicate record created by mistake
- Test data that needs removal
- Parent requests data deletion (GDPR/privacy)
- **WARNING:** Only use this for permanent removal!

### Best Practices
1. **Regular Review:** Check the "Manage Children" tab monthly
2. **Archive First:** Always archive before considering deletion
3. **Document Reasons:** Provide clear archival reasons for future reference
4. **Bulk Operations:** Use inactivity filters to identify candidates for archival
5. **Communication:** Inform families before archiving their children

### Workflow Example
1. On the first Sunday of each month:
   - Go to "Manage Children" tab
   - Filter for "Inactive >90 days"
   - Review the list
   - Contact families if desired
   - Archive children who have left the church
   - Provide reason: "Moved away" or "Joined another church"

2. Before archiving:
   - Check with church leadership
   - Verify family has actually left
   - Ensure no miscommunication about attendance

3. Unarchiving:
   - If family returns, easily unarchive
   - All history is preserved
   - Child immediately available for check-in

## Technical Details

### Database Schema Changes
```sql
ALTER TABLE children 
ADD COLUMN IF NOT EXISTS last_check_in timestamptz,
ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at timestamptz,
ADD COLUMN IF NOT EXISTS archived_reason text;

CREATE INDEX idx_children_last_check_in ON children(last_check_in);
CREATE INDEX idx_children_is_archived ON children(is_archived);
```

### Automatic Updates
- `last_check_in` is automatically updated on every check-in
- Existing children get their `last_check_in` populated from check-ins table
- `is_archived` defaults to `false` for all existing and new children

### Query Filters
- Default queries automatically exclude archived children (`is_archived = false`)
- Use `include_archived=true` parameter to see archived children
- Search and check-in flows respect archive status

## Security Considerations

- **Permanent Delete:** Only users with appropriate permissions should delete
- **Audit Trail:** Consider logging archive/delete operations
- **Data Retention:** Comply with your church's data retention policies
- **GDPR:** Support right to deletion through permanent delete feature

## Future Enhancements
- [ ] Bulk archive operation
- [ ] Export archived children to CSV
- [ ] Restore from backup before permanent delete
- [ ] Admin approval required for permanent delete
- [ ] Scheduled auto-archival (e.g., after 120 days inactive)
- [ ] Archive notifications to parents
- [ ] Audit log for all archive/delete operations
