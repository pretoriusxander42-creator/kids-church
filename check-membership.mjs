import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkMembership() {
  console.log('\n🔍 Checking Membership Data...\n');

  // Get all classes
  const { data: classes, error: classError } = await supabase
    .from('classes')
    .select('*')
    .order('name', { ascending: true });

  if (classError) {
    console.error('❌ Error fetching classes:', classError);
    return;
  }

  console.log(`📚 Found ${classes.length} classes:`);
  classes.forEach(c => {
    console.log(`  - ${c.name} (type: ${c.type}, id: ${c.id})`);
  });

  // Get all children
  const { data: children, error: childrenError } = await supabase
    .from('children')
    .select('*')
    .eq('is_archived', false);

  if (childrenError) {
    console.error('❌ Error fetching children:', childrenError);
    return;
  }

  console.log(`\n👶 Found ${children.length} active children:`);
  if (children.length > 0) {
    console.log('\nFirst child columns:', Object.keys(children[0]));
    children.forEach(c => {
      console.log(`  - ${c.first_name} ${c.last_name} (class_assignment: ${c.class_assignment || 'NOT SET'})`);
    });
  }

  // Match children to classes
  console.log('\n📊 Membership Distribution:');
  classes.forEach(classItem => {
    const matchedChildren = children.filter(child => {
      return child.class_assignment === classItem.id || 
             child.class_assignment === classItem.type ||
             child.class_assignment === classItem.name?.toLowerCase().replace(/\s+/g, '_');
    });

    console.log(`  ${classItem.name}: ${matchedChildren.length} children`);
    if (matchedChildren.length > 0) {
      matchedChildren.forEach(c => {
        console.log(`    - ${c.first_name} ${c.last_name}`);
      });
    }
  });

  // Show unassigned children
  const assignedClassValues = classes.flatMap(c => [
    c.id,
    c.type,
    c.name?.toLowerCase().replace(/\s+/g, '_')
  ]);

  const unassigned = children.filter(child => {
    if (!child.class_assignment) return true;
    return !assignedClassValues.includes(child.class_assignment);
  });

  if (unassigned.length > 0) {
    console.log(`\n⚠️  ${unassigned.length} children not assigned to any classroom:`);
    unassigned.forEach(c => {
      console.log(`  - ${c.first_name} ${c.last_name} (class_assignment: ${c.class_assignment || 'NULL'})`);
    });
  }

  const total = children.length;
  console.log(`\n📈 Total Active Children: ${total}`);
}

checkMembership().then(() => process.exit(0));
