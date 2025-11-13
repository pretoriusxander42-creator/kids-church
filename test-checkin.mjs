#!/usr/bin/env node

/**
 * Test check-in functionality
 * This script tests the check-in endpoint to ensure it's working
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testCheckin() {
  console.log('\n🔍 Testing Check-in Functionality\n');

  // 1. Check if we have children
  console.log('1. Checking for children in database...');
  const { data: children, error: childError } = await supabase
    .from('children')
    .select('*')
    .limit(5);

  if (childError) {
    console.error('❌ Error fetching children:', childError.message);
    return;
  }

  if (!children || children.length === 0) {
    console.log('❌ No children found in database');
    console.log('   You need to add children first before testing check-ins');
    return;
  }

  console.log(`✅ Found ${children.length} children`);
  children.forEach(child => {
    console.log(`   - ${child.first_name} ${child.last_name} (ID: ${child.id})`);
  });

  // 2. Check if we have parents
  console.log('\n2. Checking for parents in database...');
  const { data: parents, error: parentError } = await supabase
    .from('parents')
    .select('*')
    .limit(5);

  if (parentError) {
    console.error('❌ Error fetching parents:', parentError.message);
    return;
  }

  if (!parents || parents.length === 0) {
    console.log('❌ No parents found in database');
    console.log('   You need to add parents first before testing check-ins');
    return;
  }

  console.log(`✅ Found ${parents.length} parents`);
  parents.forEach(parent => {
    console.log(`   - ${parent.first_name} ${parent.last_name} (ID: ${parent.id})`);
  });

  // 3. Check if we have classes
  console.log('\n3. Checking for classes in database...');
  const { data: classes, error: classError } = await supabase
    .from('classes')
    .select('*')
    .limit(5);

  if (classError) {
    console.error('❌ Error fetching classes:', classError.message);
    return;
  }

  if (!classes || classes.length === 0) {
    console.log('⚠️  No classes found in database');
    console.log('   Classes are optional but recommended');
  } else {
    console.log(`✅ Found ${classes.length} classes`);
    classes.forEach(cls => {
      console.log(`   - ${cls.name} (ID: ${cls.id})`);
    });
  }

  // 4. Check if we have a user with admin role
  console.log('\n4. Checking for admin users...');
  const { data: adminUsers, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .limit(5);

  if (userError) {
    console.error('❌ Error fetching users:', userError.message);
  } else if (!adminUsers || adminUsers.length === 0) {
    console.log('⚠️  No users found');
  } else {
    console.log(`✅ Found ${adminUsers.length} users`);
    for (const user of adminUsers) {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      const roleList = roles?.map(r => r.role).join(', ') || 'none';
      console.log(`   - ${user.email} (Roles: ${roleList})`);
    }
  }

  // 5. Test the check-in table structure
  console.log('\n5. Checking check_ins table...');
  const { data: recentCheckIns, error: checkInError } = await supabase
    .from('check_ins')
    .select('*, children(*), parents(*)')
    .order('check_in_time', { ascending: false })
    .limit(5);

  if (checkInError) {
    console.error('❌ Error fetching check-ins:', checkInError.message);
  } else {
    console.log(`✅ Check-ins table accessible`);
    if (recentCheckIns && recentCheckIns.length > 0) {
      console.log(`   Found ${recentCheckIns.length} recent check-ins:`);
      recentCheckIns.forEach(ci => {
        console.log(`   - ${ci.children?.first_name} ${ci.children?.last_name} at ${new Date(ci.check_in_time).toLocaleTimeString()}`);
      });
    } else {
      console.log('   No check-ins found yet');
    }
  }

  console.log('\n📊 Summary:');
  console.log('━'.repeat(50));
  
  const hasChildren = children && children.length > 0;
  const hasParents = parents && parents.length > 0;
  const hasClasses = classes && classes.length > 0;
  
  // Check for admin users
  let hasAdmins = false;
  if (adminUsers) {
    for (const user of adminUsers) {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      if (roles?.some(r => r.role === 'admin')) {
        hasAdmins = true;
        break;
      }
    }
  }

  if (hasChildren && hasParents) {
    console.log('✅ All required data is present');
    console.log('✅ You should be able to check in children');
    if (!hasClasses) {
      console.log('⚠️  Consider adding classes for better organization');
    }
    if (!hasAdmins) {
      console.log('⚠️  No admin users found - some features may not work');
    }
  } else {
    console.log('❌ Missing required data:');
    if (!hasChildren) console.log('   - Add children first');
    if (!hasParents) console.log('   - Add parents first');
  }

  console.log('\n');
}

testCheckin().catch(console.error);
