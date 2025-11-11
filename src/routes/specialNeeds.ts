import { Router } from 'express';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Special needs form schema
const specialNeedsSchema = z.object({
  child_id: z.string().uuid(),
  type: z.enum(['physical', 'cognitive', 'behavioral', 'medical', 'other']),
  description: z.string().min(1),
  triggers: z.string().optional(),
  calming_techniques: z.string().optional(),
  communication_preferences: z.string().optional(),
  medication_requirements: z.string().optional(),
  emergency_procedures: z.string().optional(),
  sensory_sensitivities: z.string().optional(),
  support_equipment: z.string().optional(),
  preferred_activities: z.string().optional(),
  things_to_avoid: z.string().optional(),
  parent_contact_preferences: z.string().optional(),
});

// GET all special needs forms
router.get('/', async (req, res) => {
  const { child_id, status } = req.query;
  
  let query = supabase
    .from('special_needs_forms')
    .select(`
      *,
      children (*)
    `)
    .order('submitted_at', { ascending: false });

  if (child_id) {
    query = query.eq('child_id', child_id);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
});

// GET special needs form by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('special_needs_forms')
    .select(`
      *,
      children (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({ error: 'Form not found' });
  }

  return res.json(data);
});

// GET forms for specific child
router.get('/child/:childId', async (req, res) => {
  const { childId } = req.params;

  const { data, error } = await supabase
    .from('special_needs_forms')
    .select('*')
    .eq('child_id', childId)
    .order('submitted_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
});

// Submit special needs form
router.post('/', async (req, res) => {
  const { submitted_by, ...formData } = req.body;
  const parseResult = specialNeedsSchema.safeParse(formData);
  
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid special needs data', details: parseResult.error.issues });
  }

  const { data, error } = await supabase
    .from('special_needs_forms')
    .insert([{
      form_data: parseResult.data,
      child_id: parseResult.data.child_id,
      submitted_by,
      submitted_at: new Date().toISOString(),
      status: 'pending',
    }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ message: 'Special needs form submitted successfully', data });
});

// Update form status (for review)
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, reviewed_by } = req.body;

  if (!['pending', 'approved', 'needs_update'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updateData: any = { 
    status,
    reviewed_at: new Date().toISOString(),
  };

  if (reviewed_by) {
    updateData.reviewed_by = reviewed_by;
  }

  const { data, error } = await supabase
    .from('special_needs_forms')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ message: 'Form status updated', data });
});

export default router;
