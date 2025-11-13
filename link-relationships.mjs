#!/usr/bin/env node

/**
 * Link existing parents to children
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function linkRelationships() {
  console.log('\n🔗 Linking Parents to Children\n');

  try {
    // Get all parents and children
    const { data: parents } = await supabase.from('parents').select('*').order('created_at');
    const { data: children } = await supabase.from('children').select('*').order('created_at');

    if (!parents || !children) {
      console.log('❌ No parents or children found');
      return;
    }

    // Link based on last names
    const relationships = [];
    
    // Smith family
    const johnSmith = parents.find(p => p.last_name === 'Smith');
    const emmaSmith = children.find(c => c.first_name === 'Emma' && c.last_name === 'Smith');
    const noahSmith = children.find(c => c.first_name === 'Noah' && c.last_name === 'Smith');
    
    if (johnSmith && emmaSmith) {
      relationships.push({ parent_id: johnSmith.id, child_id: emmaSmith.id, relationship_type: 'father', is_primary_contact: true });
    }
    if (johnSmith && noahSmith) {
      relationships.push({ parent_id: johnSmith.id, child_id: noahSmith.id, relationship_type: 'father', is_primary_contact: true });
    }

    // Johnson family
    const maryJohnson = parents.find(p => p.last_name === 'Johnson');
    const sophiaJohnson = children.find(c => c.first_name === 'Sophia' && c.last_name === 'Johnson');
    const liamJohnson = children.find(c => c.first_name === 'Liam' && c.last_name === 'Johnson');
    
    if (maryJohnson && sophiaJohnson) {
      relationships.push({ parent_id: maryJohnson.id, child_id: sophiaJohnson.id, relationship_type: 'mother', is_primary_contact: true });
    }
    if (maryJohnson && liamJohnson) {
      relationships.push({ parent_id: maryJohnson.id, child_id: liamJohnson.id, relationship_type: 'mother', is_primary_contact: true });
    }

    // Williams family
    const davidWilliams = parents.find(p => p.last_name === 'Williams');
    const oliviaWilliams = children.find(c => c.first_name === 'Olivia' && c.last_name === 'Williams');
    
    if (davidWilliams && oliviaWilliams) {
      relationships.push({ parent_id: davidWilliams.id, child_id: oliviaWilliams.id, relationship_type: 'father', is_primary_contact: true });
    }

    if (relationships.length === 0) {
      console.log('❌ No matching families found');
      return;
    }

    console.log(`Found ${relationships.length} relationships to create...`);

    const { data: links, error } = await supabase
      .from('parent_child_relationships')
      .insert(relationships)
      .select();

    if (error) {
      console.error('❌ Error:', error.message);
    } else {
      console.log(`✅ Created ${links.length} parent-child relationships\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

linkRelationships().catch(console.error);
