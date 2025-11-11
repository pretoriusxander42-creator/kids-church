import { Router } from 'express';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Parent registration schema
const parentSchema = z.object({
  user_id: z.string().uuid(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone_number: z.string().min(10),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  address: z.string().optional(),
});

// GET all parents
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('parents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
});

// GET parent by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('parents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({ error: 'Parent not found' });
  }

  return res.json(data);
});

// GET parent's children
router.get('/:id/children', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('parent_child_relationships')
    .select(`
      *,
      children (*)
    `)
    .eq('parent_id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
});

// Register new parent
router.post('/', async (req, res) => {
  const parseResult = parentSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid parent data', details: parseResult.error.issues });
  }

  const { data, error } = await supabase
    .from('parents')
    .insert([parseResult.data])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ message: 'Parent registered successfully', data });
});

// UPDATE parent
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const parseResult = parentSchema.partial().safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid parent data', details: parseResult.error.issues });
  }

  const { data, error } = await supabase
    .from('parents')
    .update({ ...parseResult.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ message: 'Parent updated successfully', data });
});

// Link child to parent
router.post('/:id/children/:childId', async (req, res) => {
  const { id: parent_id, childId: child_id } = req.params;
  const { relationship_type, is_authorized_pickup } = req.body;

  const { data, error } = await supabase
    .from('parent_child_relationships')
    .insert([{ parent_id, child_id, relationship_type, is_authorized_pickup }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ message: 'Child linked to parent successfully', data });
});

// Unlink child from parent
router.delete('/:id/children/:childId', async (req, res) => {
  const { id: parent_id, childId: child_id } = req.params;

  const { error } = await supabase
    .from('parent_child_relationships')
    .delete()
    .eq('parent_id', parent_id)
    .eq('child_id', child_id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ message: 'Child unlinked from parent successfully' });
});

export default router;
