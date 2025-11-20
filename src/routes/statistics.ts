import '../env.js';
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticateUser, requireMinRole } from '../middleware/rbac.js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Apply authentication to all stats routes
router.use(authenticateUser);

// GET dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Total children
    const { count: totalChildren } = await supabase
      .from('children')
      .select('*', { count: 'exact', head: true });

    // Total parents
    const { count: totalParents } = await supabase
      .from('parents')
      .select('*', { count: 'exact', head: true });

    // Today's check-ins
    const today = new Date().toISOString().split('T')[0];
    const { count: todayCheckIns } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .gte('check_in_time', `${today}T00:00:00`)
      .lte('check_in_time', `${today}T23:59:59`);

    // Currently checked in
    const { count: currentlyCheckedIn } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .gte('check_in_time', `${today}T00:00:00`)
      .is('check_out_time', null);

    // This week's check-ins
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { count: weekCheckIns } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .gte('check_in_time', startOfWeek.toISOString());

    return res.json({
      totalChildren,
      totalParents,
      todayCheckIns,
      currentlyCheckedIn,
      weekCheckIns,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET attendance by class
router.get('/attendance/by-class', requireMinRole('teacher'), async (req, res) => {
  const { date } = req.query;
  const targetDate = date ? new Date(date as string) : new Date();
  const dateStr = targetDate.toISOString().split('T')[0];

  try {
    const { data, error } = await supabase
      .from('check_ins')
      .select(`
        class_attended,
        children (*)
      `)
      .gte('check_in_time', `${dateStr}T00:00:00`)
      .lte('check_in_time', `${dateStr}T23:59:59`);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Group by class
    const byClass: { [key: string]: any[] } = {};
    data.forEach((checkin: any) => {
      const className = checkin.class_attended || 'Unknown';
      if (!byClass[className]) {
        byClass[className] = [];
      }
      byClass[className].push(checkin);
    });

    return res.json({
      date: dateStr,
      byClass,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET attendance trends (last 30 days)
router.get('/attendance/trends', requireMinRole('admin'), async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const { data, error } = await supabase
      .from('check_ins')
      .select('check_in_time')
      .gte('check_in_time', thirtyDaysAgo.toISOString())
      .order('check_in_time', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Group by date
    const byDate: { [key: string]: number } = {};
    data.forEach((checkin: any) => {
      const date = checkin.check_in_time.split('T')[0];
      byDate[date] = (byDate[date] || 0) + 1;
    });

    return res.json({
      trends: Object.entries(byDate).map(([date, count]) => ({ date, count })),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET special needs statistics
router.get('/special-needs', requireMinRole('teacher'), async (req, res) => {
  try {
    const { count: totalSpecialNeeds } = await supabase
      .from('children')
      .select('*', { count: 'exact', head: true })
      .eq('special_needs', true);

    const { count: pendingForms } = await supabase
      .from('special_needs_forms')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: approvedForms } = await supabase
      .from('special_needs_forms')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    return res.json({
      totalSpecialNeeds,
      pendingForms,
      approvedForms,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET class capacity statistics
router.get('/classes/capacity', requireMinRole('teacher'), async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('*');

    if (classError) {
      return res.status(500).json({ error: classError.message });
    }

    const capacityData = await Promise.all(
      classes.map(async (classItem: any) => {
        const { count } = await supabase
          .from('check_ins')
          .select('*', { count: 'exact', head: true })
          .eq('class_attended', classItem.id)
          .gte('check_in_time', `${today}T00:00:00`)
          .is('check_out_time', null);

        return {
          id: classItem.id,
          name: classItem.name,
          type: classItem.type,
          capacity: classItem.capacity,
          current: count || 0,
          available: classItem.capacity ? classItem.capacity - (count || 0) : null,
          percentFull: classItem.capacity ? ((count || 0) / classItem.capacity * 100).toFixed(1) : null,
        };
      })
    );

    return res.json({ classes: capacityData });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET total membership per classroom (from class_assignments)
router.get('/classes/membership', async (req, res) => {
  try {
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('*')
      .order('name', { ascending: true });

    if (classError) {
      return res.status(500).json({ error: classError.message });
    }

    const membershipData = await Promise.all(
      classes.map(async (classItem: any) => {
        // Count active assignments for this class
        const { count } = await supabase
          .from('class_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', classItem.id)
          .eq('is_active', true);

        return {
          id: classItem.id,
          name: classItem.name,
          type: classItem.type,
          memberCount: count || 0,
        };
      })
    );

    // Calculate total
    const totalMembers = membershipData.reduce((sum, item) => sum + item.memberCount, 0);

    return res.json({ 
      classes: membershipData,
      totalMembers
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET check-ins for a specific date
router.get('/checkins/by-date', async (req, res) => {
  try {
    const { date } = req.query;
    
    // Default to today if no date provided
    const targetDate = date ? new Date(date as string) : new Date();
    const dateStr = targetDate.toISOString().split('T')[0];

    // Get total check-ins for the date
    const { count: totalCheckIns } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .gte('check_in_time', `${dateStr}T00:00:00`)
      .lte('check_in_time', `${dateStr}T23:59:59`);

    // Get check-ins by class for the date
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('*')
      .order('name', { ascending: true });

    if (classError) {
      return res.status(500).json({ error: classError.message });
    }

    const byClass = await Promise.all(
      classes.map(async (classItem: any) => {
        const { count } = await supabase
          .from('check_ins')
          .select('*', { count: 'exact', head: true })
          .eq('class_attended', classItem.id)
          .gte('check_in_time', `${dateStr}T00:00:00`)
          .lte('check_in_time', `${dateStr}T23:59:59`);

        return {
          id: classItem.id,
          name: classItem.name,
          type: classItem.type,
          checkInCount: count || 0,
        };
      })
    );

    return res.json({
      date: dateStr,
      totalCheckIns: totalCheckIns || 0,
      byClass
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
 
// CSV attendance export (admin only)
router.get('/attendance/export.csv', requireMinRole('admin'), async (req, res) => {
  try {
    const { start, end } = req.query as { start?: string; end?: string };

    // Default to today if not provided
    const today = new Date().toISOString().split('T')[0];
    const startDate = start || today;
    const endDate = end || startDate;

    const startIso = `${startDate}T00:00:00`;
    const endIso = `${endDate}T23:59:59`;

    const { data, error } = await supabase
      .from('check_ins')
      .select(
        `id, check_in_time, check_out_time, class_attended,
         children (first_name, last_name, date_of_birth),
         parents (first_name, last_name, phone_number)`
      )
      .gte('check_in_time', startIso)
      .lte('check_in_time', endIso)
      .order('check_in_time', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const rows = data || [];

    // Build CSV
    const header = [
      'date',
      'child_first_name',
      'child_last_name',
      'date_of_birth',
      'class',
      'check_in_time',
      'check_out_time',
      'duration_minutes',
      'parent_first_name',
      'parent_last_name',
      'parent_phone'
    ];

    const esc = (v: any) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };

    const toMinutes = (startTs?: string, endTs?: string) => {
      if (!startTs || !endTs) return '';
      const ms = new Date(endTs).getTime() - new Date(startTs).getTime();
      return Math.round(ms / 60000);
    };

    const csv = [header.join(',')]
      .concat(
        rows.map((r: any) => {
          const date = (r.check_in_time || '').split('T')[0];
          return [
            date,
            r.children?.first_name || '',
            r.children?.last_name || '',
            r.children?.date_of_birth || '',
            r.class_attended || '',
            r.check_in_time || '',
            r.check_out_time || '',
            toMinutes(r.check_in_time, r.check_out_time),
            r.parents?.first_name || '',
            r.parents?.last_name || '',
            r.parents?.phone_number || ''
          ].map(esc).join(',');
        })
      )
      .join('\n');

    const filename = `attendance_${startDate}_to_${endDate}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
