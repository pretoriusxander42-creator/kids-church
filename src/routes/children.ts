import { Router } from 'express';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Child registration schema
const childSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  photo_url: z.string().url().optional(),
  allergies: z.string().optional(),
  medical_notes: z.string().optional(),
  special_needs: z.boolean().optional(),
  special_needs_details: z.string().optional(),
  class_assignment: z.enum(['nursery', 'toddlers', 'preschool', 'elementary', 'ftv_board']),
});

// GET all children (with pagination)
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('children')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
});

// GET single child by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({ error: 'Child not found' });
  }

  return res.json(data);
});

// Register new child
router.post('/', async (req, res) => {
  const parseResult = childSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid child data', details: parseResult.error.issues });
  }

  const { data, error } = await supabase
    .from('children')
    .insert([parseResult.data])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ message: 'Child registered successfully', data });
});

// UPDATE child
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const parseResult = childSchema.partial().safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid child data', details: parseResult.error.issues });
  }

  const { data, error } = await supabase
    .from('children')
    .update({ ...parseResult.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ message: 'Child updated successfully', data });
});

// DELETE (soft delete) child
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('children')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ message: 'Child deleted successfully' });
});

export default router;
