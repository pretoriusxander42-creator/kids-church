import '../env.js';
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { validate, schemas } from '../middleware/validation.js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// GET search children (optimized with ILIKE)
router.get('/search', async (req, res) => {
  const query = (req.query.query as string) || '';
  const limit = parseInt(req.query.limit as string) || 20;
  const includeArchived = req.query.include_archived === 'true';

  if (query.length < 2) {
    return res.json({ data: [] });
  }

  const searchPattern = `%${query}%`;

  let searchQuery = supabase
    .from('children')
    .select('*')
    .or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern}`)
    .limit(limit)
    .order('first_name', { ascending: true });

  // By default, exclude archived children
  if (!includeArchived) {
    searchQuery = searchQuery.eq('is_archived', false);
  }

  const { data, error } = await searchQuery;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ data });
});

// GET all children (with pagination)
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  const includeArchived = req.query.include_archived === 'true';

  let query = supabase
    .from('children')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  // By default, exclude archived children
  if (!includeArchived) {
    query = query.eq('is_archived', false);
  }

  const { data, error, count } = await query;

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

// GET parents for a specific child
router.get('/:id/parents', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('parent_child_relationships')
    .select(`
      *,
      parents (*)
    `)
    .eq('child_id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data || []);
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

// Archive child
router.post('/:id/archive', validate(schemas.uuidParam, 'params'), async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const { data, error } = await supabase
    .from('children')
    .update({ 
      is_archived: true,
      archived_at: new Date().toISOString(),
      archived_reason: reason || 'No reason provided',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ message: 'Child archived successfully', data });
});

// Unarchive child
router.post('/:id/unarchive', validate(schemas.uuidParam, 'params'), async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('children')
    .update({ 
      is_archived: false,
      archived_at: null,
      archived_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ message: 'Child unarchived successfully', data });
});

// Get inactive children (no check-in for N days)
router.get('/inactive/:days', async (req, res) => {
  const days = parseInt(req.params.days) || 30;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('is_archived', false)
    .or(`last_check_in.is.null,last_check_in.lt.${cutoffDate.toISOString()}`)
    .order('last_check_in', { ascending: true, nullsFirst: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ 
    data,
    count: data.length,
    days_threshold: days,
  });
});

// Link child to parent (alternative endpoint format)
router.post('/link-parent', async (req, res) => {
  const { childId, parentId, relationshipType, authorizedPickup } = req.body;

  if (!childId || !parentId) {
    return res.status(400).json({ error: 'childId and parentId are required' });
  }

  const { data, error } = await supabase
    .from('parent_child_relationships')
    .insert([{ 
      parent_id: parentId, 
      child_id: childId, 
      relationship_type: relationshipType || 'parent',
      is_authorized_pickup: authorizedPickup !== undefined ? authorizedPickup : true
    }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ message: 'Child linked to parent successfully', data });
});

export default router;
