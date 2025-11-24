-- Disable RLS on settings table to allow anon access
-- (Settings are not sensitive data - just UI configuration)
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Drop the existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read settings" ON settings;
DROP POLICY IF EXISTS "Allow authenticated users to update settings" ON settings;
