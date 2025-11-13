import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const { data, error } = await supabase
  .from('users')
  .select('id, email, name')
  .limit(5);

if (error) {
  console.error('Error:', error.message);
} else {
  console.log('Users:', JSON.stringify(data, null, 2));
  
  // Check roles for first user
  if (data.length > 0) {
    const userId = data[0].id;
    const { data: roles } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
    
    console.log('\nRoles for', data[0].email, ':', JSON.stringify(roles, null, 2));
    
    // If no admin role, add it
    if (!roles || roles.length === 0 || !roles.find(r => r.role === 'admin')) {
      console.log('\nAdding admin role...');
      const { data: newRole, error: roleError } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: 'admin' }])
        .select();
      
      if (roleError) {
        console.error('Error adding role:', roleError.message);
      } else {
        console.log('Admin role added successfully!');
      }
    }
  }
}
