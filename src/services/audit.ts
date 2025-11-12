import '../env.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables in audit service');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AuditLogEntry {
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await supabase.from('audit_logs').insert([
      {
        ...entry,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    console.error('Failed to log audit entry:', error);
  }
}

// Helper functions for common audit actions
export async function logLogin(userId: string, ipAddress?: string, userAgent?: string) {
  await logAudit({
    user_id: userId,
    action: 'LOGIN',
    entity_type: 'user',
    entity_id: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
  });
}

export async function logCheckIn(
  userId: string,
  checkinId: string,
  childId: string,
  ipAddress?: string
) {
  await logAudit({
    user_id: userId,
    action: 'CHECK_IN',
    entity_type: 'check_in',
    entity_id: checkinId,
    new_values: { child_id: childId },
    ip_address: ipAddress,
  });
}

export async function logCheckOut(
  userId: string,
  checkinId: string,
  childId: string,
  ipAddress?: string
) {
  await logAudit({
    user_id: userId,
    action: 'CHECK_OUT',
    entity_type: 'check_in',
    entity_id: checkinId,
    new_values: { child_id: childId },
    ip_address: ipAddress,
  });
}

export async function logDataModification(
  userId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  entityType: string,
  entityId: string,
  oldValues?: any,
  newValues?: any,
  ipAddress?: string
) {
  await logAudit({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_values: oldValues,
    new_values: newValues,
    ip_address: ipAddress,
  });
}
