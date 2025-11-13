# Apply Missing Database Migration

## Problem
The login security columns (`failed_login_attempts`, `locked_until`) are missing from your Supabase `users` table, causing login failures.

## Solution
Apply the migration via Supabase SQL Editor:

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/tkenwuiobntqemfwdxqq

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and paste this SQL (without the code fence markers):**

```
-- Add login security tracking columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ NULL;

-- Index to query locked accounts quickly
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON users(locked_until);
```

**Important:** Copy only the SQL commands above (the ALTER TABLE and CREATE INDEX lines), not the ``` markers.

4. **Execute the Query**
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - You should see: "Success. No rows returned"

5. **Verify the Migration**
   Run this query to confirm columns were added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('failed_login_attempts', 'locked_until');
```

   Expected output:
   ```
   failed_login_attempts | integer
   locked_until          | timestamp with time zone
   ```

6. **Test Login**
   - Rebuild the TypeScript: `npx tsc -p tsconfig.json`
   - Restart server if running
   - Try logging in with: `xanderpretorius2002@gmail.com`

## Why This Happened
The migration file exists in `supabase/migrations/20251112000100_add_login_security_fields.sql` but wasn't applied to your production Supabase instance. Future migrations should be applied using:
- Supabase CLI: `supabase db push` (recommended)
- Manual SQL execution (what we're doing here)

## After Migration
Once applied, the authentication system will have:
- ✅ Failed login attempt tracking
- ✅ Account lockout after 5 failed attempts (15 min)
- ✅ Automatic unlock after timeout
- ✅ Enhanced security logging
