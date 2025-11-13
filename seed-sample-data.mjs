#!/usr/bin/env node

/**
 * Seed sample data for testing
 * This script adds sample children, parents, and classes to the database
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function seedData() {
  console.log('\n🌱 Seeding Sample Data\n');

  try {
    // 1. Add sample parents
    console.log('1. Adding sample parents...');
    const { data: parents, error: parentError } = await supabase
      .from('parents')
      .insert([
        {
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@example.com',
          phone_number: '555-0101',
          address: '123 Main St, City, State 12345'
        },
        {
          first_name: 'Mary',
          last_name: 'Johnson',
          email: 'mary.johnson@example.com',
          phone_number: '555-0102',
          address: '456 Oak Ave, City, State 12345'
        },
        {
          first_name: 'David',
          last_name: 'Williams',
          email: 'david.williams@example.com',
          phone_number: '555-0103',
          address: '789 Pine Rd, City, State 12345'
        }
      ])
      .select();

    if (parentError) {
      console.error('❌ Error adding parents:', parentError.message);
      return;
    }

    console.log(`✅ Added ${parents.length} parents`);

    // 2. Add sample children
    console.log('\n2. Adding sample children...');
    const { data: children, error: childError } = await supabase
      .from('children')
      .insert([
        {
          first_name: 'Emma',
          last_name: 'Smith',
          date_of_birth: '2018-03-15',
          gender: 'female',
          allergies: 'Peanuts',
          medical_notes: 'Carries EpiPen'
        },
        {
          first_name: 'Noah',
          last_name: 'Smith',
          date_of_birth: '2020-06-22',
          gender: 'male'
        },
        {
          first_name: 'Sophia',
          last_name: 'Johnson',
          date_of_birth: '2017-11-08',
          gender: 'female',
          special_needs: true,
          special_needs_details: 'Requires one-on-one assistance'
        },
        {
          first_name: 'Liam',
          last_name: 'Johnson',
          date_of_birth: '2019-09-14',
          gender: 'male'
        },
        {
          first_name: 'Olivia',
          last_name: 'Williams',
          date_of_birth: '2016-01-30',
          gender: 'female'
        }
      ])
      .select();

    if (childError) {
      console.error('❌ Error adding children:', childError.message);
      return;
    }

    console.log(`✅ Added ${children.length} children`);

    // 3. Link parents to children
    console.log('\n3. Linking parents to children...');
    const relationships = [
      { parent_id: parents[0].id, child_id: children[0].id, relationship_type: 'father', is_primary_contact: true }, // John -> Emma
      { parent_id: parents[0].id, child_id: children[1].id, relationship_type: 'father', is_primary_contact: true }, // John -> Noah
      { parent_id: parents[1].id, child_id: children[2].id, relationship_type: 'mother', is_primary_contact: true }, // Mary -> Sophia
      { parent_id: parents[1].id, child_id: children[3].id, relationship_type: 'mother', is_primary_contact: true }, // Mary -> Liam
      { parent_id: parents[2].id, child_id: children[4].id, relationship_type: 'father', is_primary_contact: true }, // David -> Olivia
    ];

    const { data: links, error: linkError } = await supabase
      .from('parent_child_relationships')
      .insert(relationships)
      .select();

    if (linkError) {
      console.error('❌ Error linking parents to children:', linkError.message);
    } else {
      console.log(`✅ Created ${links.length} parent-child relationships`);
    }

    // 4. Add sample classes
    console.log('\n4. Adding sample classes...');
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .insert([
        {
          name: 'Nursery',
          description: 'Ages 0-2',
          type: 'regular',
          age_min: 0,
          age_max: 2,
          capacity: 10,
          room_location: 'Room 101'
        },
        {
          name: 'Toddlers',
          description: 'Ages 3-4',
          type: 'regular',
          age_min: 3,
          age_max: 4,
          capacity: 15,
          room_location: 'Room 102'
        },
        {
          name: 'Kindergarten',
          description: 'Ages 5-6',
          type: 'regular',
          age_min: 5,
          age_max: 6,
          capacity: 20,
          room_location: 'Room 103'
        },
        {
          name: 'Elementary',
          description: 'Ages 7-10',
          type: 'regular',
          age_min: 7,
          age_max: 10,
          capacity: 25,
          room_location: 'Room 104'
        },
        {
          name: 'Special Needs',
          description: 'All ages - Special care',
          type: 'special',
          capacity: 8,
          room_location: 'Room 105'
        },
        {
          name: 'FTV Board',
          description: 'Kids helping with FTV activities',
          type: 'ftv',
          age_min: 8,
          age_max: 12,
          capacity: 12,
          room_location: 'Main Hall'
        }
      ])
      .select();

    if (classError) {
      console.error('❌ Error adding classes:', classError.message);
    } else {
      console.log(`✅ Added ${classes.length} classes`);
    }

    console.log('\n✅ Sample data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log('━'.repeat(50));
    console.log(`   Parents: ${parents.length}`);
    console.log(`   Children: ${children.length}`);
    console.log(`   Relationships: ${links?.length || 0}`);
    console.log(`   Classes: ${classes?.length || 0}`);
    console.log('\n🎉 You can now test check-ins in the app!\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  }
}

seedData().catch(console.error);
