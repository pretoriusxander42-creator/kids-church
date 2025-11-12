import '../env.js';
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { validate, schemas } from '../middleware/validation.js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

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
router.post('/', validate(schemas.createChild), async (req, res) => {
  const { data, error } = await supabase
    .from('children')
    .insert([req.body])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ message: 'Child registered successfully', data });
});

// UPDATE child
router.put('/:id', validate(schemas.uuidParam, 'params'), validate(schemas.updateChild), async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('children')
    .update({ ...req.body, updated_at: new Date().toISOString() })
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
