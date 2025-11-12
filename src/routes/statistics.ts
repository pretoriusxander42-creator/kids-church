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
      .select('*')
      .eq('is_active', true);

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

export default router;
