import '../env.js';
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { validate, schemas } from '../middleware/validation.js';
import { logCheckIn, logCheckOut } from '../services/audit.js';
import { sendCheckInNotification, sendCheckOutNotification } from '../services/email.js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

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
router.post('/', validate(schemas.createCheckin), async (req, res) => {
  const security_code = generateSecurityCode();
  const checkInTime = new Date().toISOString();

  const { data, error } = await supabase
    .from('check_ins')
    .insert([{ 
      ...req.body,
      security_code,
      check_in_time: checkInTime,
    }])
    .select(`
      *,
      children (first_name, last_name),
      parents (first_name, last_name, email)
    `)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Update child's last_check_in timestamp
  await supabase
    .from('children')
    .update({ 
      last_check_in: checkInTime,
      updated_at: checkInTime,
    })
    .eq('id', req.body.child_id);

  // Log check-in
  await logCheckIn(req.body.checked_in_by || 'system', data.id, req.body.child_id);

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
router.post('/:id/checkout', validate(schemas.uuidParam, 'params'), validate(schemas.checkout), async (req, res) => {
  const { id } = req.params;

  // Verify security code
  const { data: checkin, error: fetchError } = await supabase
    .from('check_ins')
    .select(`
      *,
      children (first_name, last_name),
      parents (first_name, last_name, email)
    `)
    .eq('id', id)
    .single();

  if (fetchError || !checkin) {
    return res.status(404).json({ error: 'Check-in not found' });
  }

  if (checkin.security_code !== req.body.security_code) {
    return res.status(403).json({ error: 'Invalid security code' });
  }

  if (checkin.check_out_time) {
    return res.status(400).json({ error: 'Child already checked out' });
  }

  const { data, error } = await supabase
    .from('check_ins')
    .update({ 
      check_out_time: new Date().toISOString(),
      checked_out_by: req.body.checked_out_by || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Log check-out
  const userId = (req as any).user?.sub || req.body.checked_out_by || 'system';
  await logCheckOut(userId, data.id, checkin.child_id);

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
