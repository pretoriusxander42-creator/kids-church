import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const email = 'xanderpretorius2002@gmail.com';

const { data: user } = await supabase
  .from('users')
  .select('id, email')
  .eq('email', email)
  .single();

if (user) {
  console.log('Found user:', user.email);
  
  // Add admin role
  const { data: role, error } = await supabase
    .from('user_roles')
    .insert([{ user_id: user.id, role: 'admin' }])
    .select();
  
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('✅ Admin role added successfully!');
    console.log('Please log out and log back in to refresh your permissions.');
  }
}
