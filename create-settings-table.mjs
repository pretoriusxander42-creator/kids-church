import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('Creating settings table...');

// Create the table by inserting a dummy row (which will trigger table creation if it doesn't exist)
// But we can't use DDL with the anon key. We need to do this via Supabase Dashboard.

console.log('\n⚠️  IMPORTANT: The settings table needs to be created in Supabase.');
console.log('\nPlease follow these steps:');
console.log('1. Go to: https://tkenwuiobntqemfwdxqq.supabase.co');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the contents of: supabase/migrations/20251124000000_create_settings_table.sql');
console.log('4. Click "Run" to execute the migration');
console.log('5. Then run: supabase/migrations/20251124000001_disable_settings_rls.sql');
console.log('\nAlternatively, if you have the Supabase service role key, add it to .env as VITE_SUPABASE_SERVICE_ROLE_KEY\n');

// Check if we can at least read from settings
const { data, error } = await supabase.from('settings').select('count');

if (error) {
  console.error('\n❌ Settings table does not exist yet.');
  console.error('Error:', error.message);
} else {
  console.log('\n✅ Settings table exists!');
  console.log('Settings count:', data);
}
