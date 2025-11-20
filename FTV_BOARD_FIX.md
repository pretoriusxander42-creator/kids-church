# FTV Board Fix - Critical Issue

## Problem
The FTV Board is trying to filter children by a non-existent field `children.class_assignment`. This field does not exist in the database schema.

## Current Code Location
**File:** `/Users/Xander/kids-church/public/dashboard.js`
**Function:** `loadFTVChildren()` (around line 785)

## Current (Broken) Logic
```javascript
const ftvChildren = checkIns.filter(ci => 
  ci.children?.class_assignment === 'ftv_board'
);
```

## Root Cause
1. The `children` table does NOT have a `class_assignment` column
2. The `check_ins` table has `class_attended` which stores the class UUID, not the class type
3. FTV detection needs to:
   - Get the class details from the class_attended UUID
   - Check if that class has type === 'ftv'

## Solution Options

### Option 1: Fix Frontend to Use Proper Class Type Check (RECOMMENDED)
Change the FTV board loading to:
1. Fetch check-ins for today
2. For each check-in, fetch the class details using the class_attended UUID
3. Filter for classes where type === 'ftv'

**Implementation:**
```javascript
async loadFTVChildren() {
  const container = document.getElementById('ftvList');
  Utils.showLoading(container, 'Loading first-time visitors...');

  const today = new Date().toISOString().split('T')[0];
  const result = await Utils.apiRequest(`/api/checkins?date=${today}`);

  if (result.success) {
    const checkIns = result.data;
    
    // Get all class IDs from check-ins
    const classIds = [...new Set(checkIns
      .filter(ci => ci.class_attended)
      .map(ci => ci.class_attended))];
    
    // Fetch class details
    const classesResult = await Utils.apiRequest('/api/classes');
    const classes = classesResult.success ? classesResult.data : [];
    
    // Create lookup map for class types
    const classTypesMap = {};
    classes.forEach(cls => {
      classTypesMap[cls.id] = cls.type;
    });
    
    // Filter for FTV children
    const ftvChildren = checkIns.filter(ci => 
      ci.class_attended && classTypesMap[ci.class_attended] === 'ftv'
    );

    if (ftvChildren.length === 0) {
      Utils.showEmpty(container, 'No first-time visitors today');
      return;
    }

    container.innerHTML = ftvChildren.map(ci => `
      <div class="ftv-card">
        <h3>${ci.children.first_name} ${ci.children.last_name}</h3>
        <p><strong>Age:</strong> ${this.calculateAge(ci.children.date_of_birth)} years</p>
        <p><strong>Checked in:</strong> ${Utils.formatTime(ci.check_in_time)}</p>
        <p><strong>Parent Contact:</strong> ${ci.parents?.phone_number || ci.parents?.email || 'N/A'}</p>
      </div>
    `).join('');
  } else {
    Utils.showError(container, 'Failed to load first-time visitors');
  }
}
```

### Option 2: Create Backend Endpoint for FTV Check-ins
Add a dedicated endpoint `/api/checkins/ftv/today` that:
1. Joins check_ins with classes table
2. Filters by class type = 'ftv'
3. Returns formatted data

**Backend Implementation (src/routes/checkins.ts):**
```typescript
router.get('/ftv/today', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('check_ins')
    .select(`
      *,
      children (first_name, last_name, date_of_birth),
      parents (phone_number, email),
      classes!check_ins_class_attended_fkey (id, name, type)
    `)
    .gte('check_in_time', `${today}T00:00:00`)
    .lt('check_in_time', `${today}T23:59:59`);
    
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  // Filter for FTV classes
  const ftvCheckIns = (data || []).filter(ci => 
    ci.classes && ci.classes.type === 'ftv'
  );
  
  return res.json({ data: ftvCheckIns });
});
```

**Frontend would then use:**
```javascript
const result = await Utils.apiRequest('/api/checkins/ftv/today');
const ftvChildren = result.data;
```

## Recommended Approach
**Use Option 1** for immediate fix as it:
- Requires no backend changes
- Requires no database schema changes
- Can be implemented quickly
- Provides same functionality

## Testing Steps After Fix
1. Create a class with type='ftv'
2. Check in a child to that FTV class
3. Navigate to FTV Board in dashboard
4. Verify the child appears on the board
5. Verify all child details display correctly

## Files to Modify
- `/Users/Xander/kids-church/public/dashboard.js` (line ~785)

## Priority
**CRITICAL** - This feature is likely needed for Sunday service operation.
