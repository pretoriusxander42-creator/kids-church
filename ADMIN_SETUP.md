# Admin User Setup Guide

**Quick guide to create your first admin user**

---

## Step 1: Register Your First User

1. Open http://localhost:4000
2. Click the "Sign Up" tab
3. Register with your email:
   ```
   Name: Your Full Name
   Email: your-email@church.org
   Password: YourSecurePassword123!
   ```
4. Click "Create Account"
5. You'll be automatically logged in to the dashboard

---

## Step 2: Get Your User ID

### Option A: Using Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project (tkenwuiobntqemfwdxqq)
3. Click "Table Editor" in left sidebar
4. Click on `users` table
5. Find your email in the list
6. Copy the `id` value (it looks like: `a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6`)

### Option B: Using SQL Editor

1. In Supabase Dashboard, click "SQL Editor"
2. Run this query:
   ```sql
   SELECT id, email, name, created_at FROM users ORDER BY created_at DESC;
   ```
3. Copy your user's `id` from the results

---

## Step 3: Assign Admin Role

1. In Supabase Dashboard, go to SQL Editor
2. Click "New Query"
3. Paste this SQL (replace `YOUR_USER_ID_HERE`):
   ```sql
   INSERT INTO user_roles (user_id, role) 
   VALUES ('YOUR_USER_ID_HERE', 'admin')
   ON CONFLICT (user_id) 
   DO UPDATE SET role = 'admin';
   ```
4. Click "Run" or press Ctrl+Enter (Cmd+Enter on Mac)
5. You should see "Success. No rows returned"

### Example:
```sql
-- Example with a real UUID
INSERT INTO user_roles (user_id, role) 
VALUES ('a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6', 'admin')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';
```

---

## Step 4: Verify Admin Access

1. Go back to your app at http://localhost:4000
2. If logged in, sign out and sign in again (to refresh your JWT token with new role)
3. You should now have admin privileges
4. Test by accessing admin-only features

---

## Available Roles

The system supports 4 role levels (in order of permissions):

1. **parent** - Default role for new users
   - Can view own children
   - Can check-in/out own children
   - Limited dashboard access

2. **teacher** - For class teachers
   - Can view all children
   - Can check-in/out any child
   - Can view class assignments
   - Can submit special needs forms

3. **admin** - For administrators
   - Full access to all features
   - Can manage users
   - Can manage classes
   - Can view all reports
   - Can delete records

4. **super_admin** - For system administrators
   - All admin permissions
   - Can manage other admins
   - Can access system settings
   - Can export all data

---

## Creating Additional Admin Users

### To promote an existing user to admin:

```sql
-- Get the user ID
SELECT id, email, name FROM users WHERE email = 'user@example.com';

-- Assign admin role (using the ID from above)
INSERT INTO user_roles (user_id, role) 
VALUES ('USER_ID_HERE', 'admin')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';
```

### To create multiple admins at once:

```sql
INSERT INTO user_roles (user_id, role) 
VALUES 
  ('first-user-id-here', 'admin'),
  ('second-user-id-here', 'admin'),
  ('third-user-id-here', 'teacher')
ON CONFLICT (user_id) 
DO UPDATE SET role = EXCLUDED.role;
```

---

## Troubleshooting

### Issue: "User not found" error
**Solution:** Make sure you registered the user first through the UI at http://localhost:4000

### Issue: Role doesn't seem to apply
**Solution:** Sign out and sign in again. The JWT token needs to be regenerated with the new role.

### Issue: Can't access Supabase Dashboard
**Solution:** Check that you're logged in to the correct Supabase account and have access to project `tkenwuiobntqemfwdxqq`

### Issue: SQL query fails
**Solution:** 
- Verify the UUID is in the correct format (with dashes)
- Make sure the user_id exists in the users table
- Check that you're connected to the correct database

---

## Verifying Your Role

To check your current role:

```sql
SELECT 
  u.email,
  u.name,
  ur.role,
  ur.created_at as role_assigned_at
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'your-email@example.com';
```

Expected result for an admin:
```
email: your-email@example.com
name: Your Full Name
role: admin
role_assigned_at: 2025-11-12 10:30:00
```

---

## Next Steps After Admin Setup

1. ✅ Create sample classes
2. ✅ Add test children
3. ✅ Add test parents
4. ✅ Test check-in/check-out flow
5. ✅ Submit special needs forms for testing
6. ✅ Explore all dashboard features

---

## Security Best Practices

1. **Use strong passwords** - At least 8 characters with uppercase, lowercase, numbers, and special characters
2. **Limit admin users** - Only give admin role to trusted staff members
3. **Regular audits** - Periodically review who has admin access
4. **Different roles for different staff** - Use teacher role for volunteers, admin for coordinators
5. **Don't share credentials** - Each person should have their own account

---

**Your admin user is now ready! 🎉**

You have full access to all features and can start using the Kids Church Check-in System.
