import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const sql = readFileSync('./supabase/migrations/20251112000100_add_login_security_fields.sql', 'utf-8');

console.log('Applying migration...');
console.log(sql);

const { data, error } = await supabase.rpc('exec_sql', { sql });

if (error) {
  console.error('Migration failed:', error);
} else {
  console.log('Migration applied successfully');
}
