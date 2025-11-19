#!/usr/bin/env node

/**
 * Test Check-in Feature and Class Management
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const API_BASE = 'http://localhost:4000';

console.log('🧪 Testing Check-in and Class Management Features\n');

async function testCheckInFeature() {
  console.log('📋 Test 1: Check-in Feature Data');
  console.log('─'.repeat(50));
  
  // Get a child
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .limit(1);
  
  if (children && children.length > 0) {
    console.log(`✅ Found child: ${children[0].first_name} ${children[0].last_name}`);
  } else {
    console.log('❌ No children found');
  }
  
  // Get classes
  const { data: classes } = await supabase
    .from('classes')
    .select('*');
  
  console.log(`✅ Found ${classes?.length || 0} classes`);
  if (classes) {
    classes.forEach(cls => {
      console.log(`   - ${cls.name} (${cls.type})`);
    });
  }
  console.log('');
}

async function testClassDeletion() {
  console.log('🗑️  Test 2: Class Deletion');
  console.log('─'.repeat(50));
  
  // Get all classes
  const { data: classes } = await supabase
    .from('classes')
    .select('*');
  
  console.log(`✅ Total classes before deletion: ${classes?.length || 0}`);
  
  // Create a test class to delete
  const testClass = {
    name: 'Test Class - DELETE ME',
    type: 'regular',
    description: 'This is a test class for deletion',
    capacity: 10
  };
  
  const response = await fetch(`${API_BASE}/api/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testClass)
  });
  
  const result = await response.json();
  
  if (result.data) {
    console.log(`✅ Created test class: ${result.data.name} (ID: ${result.data.id})`);
    
    // Try to delete it
    const deleteResponse = await fetch(`${API_BASE}/api/classes/${result.data.id}`, {
      method: 'DELETE'
    });
    
    const deleteResult = await deleteResponse.json();
    
    if (deleteResult.success) {
      console.log(`✅ Successfully deleted test class`);
    } else {
      console.log(`❌ Failed to delete: ${deleteResult.message || deleteResult.error}`);
    }
  } else {
    console.log(`❌ Failed to create test class: ${result.error}`);
  }
  console.log('');
}

async function testClassBoard() {
  console.log('👥 Test 3: Class Board View');
  console.log('─'.repeat(50));
  
  // Get today's check-ins
  const today = new Date().toISOString().split('T')[0];
  const { data: checkIns } = await supabase
    .from('check_ins')
    .select(`
      *,
      children(*),
      classes(*)
    `)
    .gte('check_in_time', `${today}T00:00:00`)
    .is('check_out_time', null);
  
  if (checkIns && checkIns.length > 0) {
    console.log(`✅ Found ${checkIns.length} active check-ins today`);
    
    // Group by class
    const byClass = {};
    checkIns.forEach(ci => {
      const className = ci.classes?.name || 'Unknown Class';
      if (!byClass[className]) byClass[className] = [];
      byClass[className].push(ci);
    });
    
    Object.keys(byClass).forEach(className => {
      console.log(`   📚 ${className}: ${byClass[className].length} children`);
      byClass[className].forEach(ci => {
        console.log(`      - ${ci.children.first_name} ${ci.children.last_name} (Code: ${ci.security_code})`);
      });
    });
  } else {
    console.log('ℹ️  No children currently checked in');
    console.log('   To test class board view:');
    console.log('   1. Go to Check-in tab');
    console.log('   2. Check in a child (e.g., Emma)');
    console.log('   3. Go to Classes tab');
    console.log('   4. Click on the class card to view children');
  }
  console.log('');
}

async function testSearchEndpoint() {
  console.log('🔍 Test 4: Search Endpoint');
  console.log('─'.repeat(50));
  
  const searchResponse = await fetch(`${API_BASE}/api/children/search?query=Emma&limit=10`);
  const searchResult = await searchResponse.json();
  
  if (searchResult.success || Array.isArray(searchResult) || (searchResult.data && Array.isArray(searchResult.data))) {
    const results = searchResult.data || searchResult;
    console.log(`✅ Search working: found ${results.length} result(s) for "Emma"`);
    if (results.length > 0) {
      results.forEach(child => {
        console.log(`   - ${child.first_name} ${child.last_name}`);
      });
    }
  } else {
    console.log(`❌ Search failed: ${searchResult.message || searchResult.error}`);
  }
  console.log('');
}

async function runAllTests() {
  try {
    await testCheckInFeature();
    await testClassDeletion();
    await testClassBoard();
    await testSearchEndpoint();
    
    console.log('═'.repeat(50));
    console.log('✅ All Tests Complete!');
    console.log('═'.repeat(50));
    console.log('\n📱 Now test in browser:');
    console.log('   1. Go to http://localhost:4000');
    console.log('   2. Login as admin');
    console.log('   3. Try Check-in tab (search should work)');
    console.log('   4. Try Classes tab:');
    console.log('      - Click "Delete" on a class (with confirmation)');
    console.log('      - Click on a class card to view checked-in children');
    console.log('      - Click "+ Create Class" to add your church\'s classes');
    console.log('');
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    process.exit(1);
  }
}

runAllTests();
