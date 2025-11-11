import { Router } from 'express';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { logCheckIn, logCheckOut } from '../services/audit.js';
import { sendCheckInNotification, sendCheckOutNotification } from '../services/email.js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Check-in schema
const checkinSchema = z.object({
  child_id: z.string().uuid(),
  parent_id: z.string().uuid(),
  checked_in_by: z.string().uuid(),
  class_attended: z.string().min(1),
  notes: z.string().optional(),
});

// Checkout schema
const checkoutSchema = z.object({
  security_code: z.string().min(4),
  checked_out_by: z.string().uuid(),
});

// Generate 6-digit security code
function generateSecurityCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// GET all check-ins (with filters)
router.get('/', async (req, res) => {
  const { date, child_id, parent_id, status } = req.query;
  
  let query = supabase
    .from('check_ins')
    .select(`
      *,
      children (*),
      parents (*)
    `)
    .order('check_in_time', { ascending: false });

  if (date) {
    query = query.gte('check_in_time', `${date}T00:00:00`)
                 .lte('check_in_time', `${date}T23:59:59`);
  }

  if (child_id) {
    query = query.eq('child_id', child_id);
  }

  if (parent_id) {
    query = query.eq('parent_id', parent_id);
  }

  if (status === 'checked_in') {
    query = query.is('check_out_time', null);
  } else if (status === 'checked_out') {
    query = query.not('check_out_time', 'is', null);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
});

// Check-in endpoint
router.post('/', async (req, res) => {
  const parseResult = checkinSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid check-in data', details: parseResult.error.issues });
  }

  const security_code = generateSecurityCode();

  const { data, error } = await supabase
    .from('check_ins')
    .insert([{ 
      ...parseResult.data,
      security_code,
      check_in_time: new Date().toISOString(),
    }])
    .select(`
      *,
      children (name),
      parents (name, email)
    `)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Log check-in
  await logCheckIn(parseResult.data.checked_in_by, data.id, parseResult.data.child_id);

  // Send email notification to parent
  if (data.parents?.email) {
    await sendCheckInNotification(
      data.parents.email,
      data.children?.name || 'Your child',
      security_code,
      new Date().toLocaleTimeString()
    );
  }

  return res.status(201).json({ 
    message: 'Check-in successful', 
    data,
    security_code,
  });
});

// Check-out endpoint
router.post('/:id/checkout', async (req, res) => {
  const { id } = req.params;
  const parseResult = checkoutSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid checkout data', details: parseResult.error.issues });
  }

  // Verify security code
  const { data: checkin, error: fetchError } = await supabase
    .from('check_ins')
    .select(`
      *,
      children (name),
      parents (name, email)
    `)
    .eq('id', id)
    .single();

  if (fetchError || !checkin) {
    return res.status(404).json({ error: 'Check-in not found' });
  }

  if (checkin.security_code !== parseResult.data.security_code) {
    return res.status(403).json({ error: 'Invalid security code' });
  }

  if (checkin.check_out_time) {
    return res.status(400).json({ error: 'Child already checked out' });
  }

  const { data, error } = await supabase
    .from('check_ins')
    .update({ 
      check_out_time: new Date().toISOString(),
      checked_out_by: parseResult.data.checked_out_by,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Log check-out
  await logCheckOut(parseResult.data.checked_out_by, data.id, checkin.child_id);

  // Send email notification to parent
  if (checkin.parents?.email) {
    await sendCheckOutNotification(
      checkin.parents.email,
      checkin.children?.name || 'Your child',
      new Date().toLocaleTimeString()
    );
  }

  return res.json({ message: 'Check-out successful', data });
});

export default router;
