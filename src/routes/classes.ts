import '../env.js';
import { Router } from 'express';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Class creation schema
const classSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['regular', 'special', 'ftv', 'event']),
  description: z.string().optional().nullable(),
  age_min: z.number().int().optional().nullable(),
  age_max: z.number().int().optional().nullable(),
  capacity: z.number().int().optional().nullable(),
  room_location: z.string().optional().nullable(),
  teacher_id: z.string().uuid().optional().nullable(),
  schedule: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
});

// GET all classes
router.get('/', async (req, res) => {
  const { type } = req.query;
  
  let query = supabase
    .from('classes')
    .select('*')
    .order('name', { ascending: true });

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
});

// GET class by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({ error: 'Class not found' });
  }

  return res.json(data);
});

// GET children in class
router.get('/:id/children', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('class_assignments')
    .select(`
      *,
      children (*)
    `)
    .eq('class_id', id)
    .eq('status', 'active');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
});

// GET current attendance for class
router.get('/:id/attendance', async (req, res) => {
  const { id } = req.params;
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('check_ins')
    .select(`
      *,
      children (*)
    `)
    .eq('class_attended', id)
    .gte('check_in_time', `${today}T00:00:00`)
    .lte('check_in_time', `${today}T23:59:59`)
    .is('check_out_time', null);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({
    date: today,
    count: data.length,
    children: data,
  });
});

// Create new class (admin only - to be protected by RBAC middleware)
router.post('/', async (req, res) => {
  const parseResult = classSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid class data', details: parseResult.error.issues });
  }

  const { data, error } = await supabase
    .from('classes')
    .insert([parseResult.data])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ message: 'Class created successfully', data });
});

// UPDATE class
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const parseResult = classSchema.partial().safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid class data', details: parseResult.error.issues });
  }

  const { data, error } = await supabase
    .from('classes')
    .update({ ...parseResult.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ message: 'Class updated successfully', data });
});

// DELETE class (admin only)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // First check if class exists
  const { data: existingClass, error: fetchError } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existingClass) {
    return res.status(404).json({ error: 'Class not found' });
  }

  // Check if there are active check-ins for this class today
  const today = new Date().toISOString().split('T')[0];
  const { data: activeCheckIns } = await supabase
    .from('check_ins')
    .select('id')
    .eq('class_id', id)
    .gte('check_in_time', `${today}T00:00:00`)
    .is('check_out_time', null);

  if (activeCheckIns && activeCheckIns.length > 0) {
    return res.status(400).json({ 
      error: 'Cannot delete class with active check-ins',
      message: `This class has ${activeCheckIns.length} children currently checked in. Please check them out first.`
    });
  }

  // Delete the class
  const { error: deleteError } = await supabase
    .from('classes')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return res.status(500).json({ error: deleteError.message });
  }

  return res.json({ 
    success: true,
    message: 'Class deleted successfully' 
  });
});

// Assign child to class
router.post('/assign', async (req, res) => {
  const { childId, classId } = req.body;

  if (!childId || !classId) {
    return res.status(400).json({ error: 'childId and classId are required' });
  }

  // Check if assignment already exists
  const { data: existing } = await supabase
    .from('class_assignments')
    .select('*')
    .eq('child_id', childId)
    .eq('class_id', classId)
    .eq('status', 'active')
    .single();

  if (existing) {
    return res.json({ message: 'Child already assigned to this class', data: existing });
  }

  const { data, error } = await supabase
    .from('class_assignments')
    .insert([{ 
      child_id: childId, 
      class_id: classId,
      status: 'active',
      assigned_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ message: 'Child assigned to class successfully', data });
});

export default router;
