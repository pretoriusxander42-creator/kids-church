#!/usr/bin/env node

/**
 * Button Functionality Test
 * Verifies all interactive elements are properly wired
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Testing Button Configurations...\n');

let allTestsPassed = true;

// Test 1: Check dashboard.js for onclick handlers (should be minimal)
console.log('Test 1: Checking for inline onclick handlers in dashboard.js');
const dashboardContent = fs.readFileSync(path.join(__dirname, 'public/dashboard.js'), 'utf8');
const onclickMatches = dashboardContent.match(/onclick="/g) || [];
const validOnclicks = [
  'onclick="this.closest', // Modal close buttons - these are OK
  'onclick="window.print()', // Print button - OK
];

const problematicOnclicks = [];
const lines = dashboardContent.split('\n');
lines.forEach((line, index) => {
  if (line.includes('onclick=') && !validOnclicks.some(valid => line.includes(valid))) {
    problematicOnclicks.push(`  Line ${index + 1}: ${line.trim()}`);
  }
});

if (problematicOnclicks.length > 0) {
  console.log('❌ Found problematic onclick handlers:');
  problematicOnclicks.forEach(p => console.log(p));
  allTestsPassed = false;
} else {
  console.log('✅ No problematic onclick handlers found\n');
}

// Test 2: Verify event listeners are present for key buttons
console.log('Test 2: Checking for addEventListener calls for key buttons');
const requiredListeners = [
  { name: 'addChildBtn', pattern: /addChildBtn.*addEventListener/ },
  { name: 'addParentBtn', pattern: /addParentBtn.*addEventListener/ },
  { name: 'manageChildrenBtn', pattern: /manageChildrenBtn.*addEventListener/ },
  { name: 'addNewChildInCheckin', pattern: /addNewChildInCheckin.*addEventListener/ },
  { name: 'createClassBtn', pattern: /createClassBtn.*addEventListener/ },
  { name: 'addSpecialNeedsFormBtn', pattern: /addSpecialNeedsFormBtn.*addEventListener/ },
  { name: 'downloadAttendanceCsv', pattern: /downloadAttendanceCsv.*addEventListener/ },
];

let missingListeners = [];
for (const listener of requiredListeners) {
  if (!listener.pattern.test(dashboardContent)) {
    missingListeners.push(listener.name);
    console.log(`❌ Missing event listener for: ${listener.name}`);
    allTestsPassed = false;
  }
}

if (missingListeners.length === 0) {
  console.log('✅ All required event listeners found\n');
}

// Test 3: Check for data attributes on dynamically generated buttons
console.log('Test 3: Checking for data attributes on dynamic buttons');
const dynamicButtons = [
  { name: 'Delete class buttons', pattern: /data-class-id=.*delete-class-btn/ },
  { name: 'View class board', pattern: /data-class-id=.*class-card/ },
  { name: 'View special needs form', pattern: /data-child-id=.*view-special-needs-form/ },
  { name: 'Manage parents buttons', pattern: /data-child-id=.*manage-parents-btn/ },
  { name: 'Unlink parent buttons', pattern: /data-parent-id=.*unlink-parent-btn/ },
];

let missingDataAttrs = [];
for (const btn of dynamicButtons) {
  if (!btn.pattern.test(dashboardContent)) {
    missingDataAttrs.push(btn.name);
    console.log(`❌ Missing data attributes for: ${btn.name}`);
    allTestsPassed = false;
  }
}

if (missingDataAttrs.length === 0) {
  console.log('✅ All dynamic buttons have proper data attributes\n');
}

// Test 4: Verify app.js has login/register listeners
console.log('Test 4: Checking authentication form listeners');
const appContent = fs.readFileSync(path.join(__dirname, 'public/app.js'), 'utf8');
const authListeners = [
  { name: 'loginForm submit', pattern: /loginForm\.addEventListener\('submit'/ },
  { name: 'registerForm submit', pattern: /registerForm\.addEventListener\('submit'/ },
  { name: 'logoutBtn click', pattern: /logoutBtn\.addEventListener\('click'/ },
  { name: 'tab button clicks', pattern: /button\.addEventListener\('click'/ },
];

let missingAuthListeners = [];
for (const listener of authListeners) {
  if (!listener.pattern.test(appContent)) {
    missingAuthListeners.push(listener.name);
    console.log(`❌ Missing: ${listener.name}`);
    allTestsPassed = false;
  }
}

if (missingAuthListeners.length === 0) {
  console.log('✅ All auth form listeners found\n');
}

// Test 5: Check for setTimeout wrappers (DOM ready safety)
console.log('Test 5: Checking for setTimeout wrappers around event listeners');
const setTimeoutCount = (dashboardContent.match(/setTimeout\(\s*\(\)\s*=>\s*{/g) || []).length;
if (setTimeoutCount >= 5) {
  console.log(`✅ Found ${setTimeoutCount} setTimeout wrappers for DOM safety\n`);
} else {
  console.log(`⚠️  Only found ${setTimeoutCount} setTimeout wrappers (expected at least 5)\n`);
}

// Test 6: Verify no console errors in syntax
console.log('Test 6: JavaScript syntax validation');
try {
  const { execSync } = await import('child_process');
  execSync('node -c public/app.js', { stdio: 'pipe' });
  execSync('node -c public/dashboard.js', { stdio: 'pipe' });
  console.log('✅ No syntax errors in JavaScript files\n');
} catch (error) {
  console.log('❌ Syntax errors found in JavaScript files\n');
  allTestsPassed = false;
}

// Summary
console.log('═'.repeat(50));
if (allTestsPassed) {
  console.log('✅ ALL TESTS PASSED! All buttons should be working correctly.');
  console.log('\n📋 Next steps:');
  console.log('1. Hard refresh your browser (Cmd+Shift+R or Ctrl+Shift+F5)');
  console.log('2. Login at http://localhost:4000');
  console.log('3. Test each button in the dashboard');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED. Review the output above.');
  process.exit(1);
}
