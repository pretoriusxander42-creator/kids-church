import '../env.js';
import { Router } from 'express';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { validate, schemas } from '../middleware/validation.js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Schema for updating settings
const updateSettingsSchema = z.object({
  settings: z.record(z.string(), z.any())
});

// GET /api/settings - Get all settings
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;

    // Transform array to nested object structure
    const settingsObject: any = {};
    
    data?.forEach((setting) => {
      const parts = setting.key.split('.');
      const category = parts[0];
      const key = parts[1];
      
      if (!settingsObject[category]) {
        settingsObject[category] = {};
      }
      
      // Parse JSON value
      settingsObject[category][key] = setting.value;
    });

    res.json({
      success: true,
      data: settingsObject
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch settings'
    });
  }
});

// GET /api/settings/:category - Get settings by category
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('category', category);

    if (error) throw error;

    // Transform to object
    const categorySettings: any = {};
    data?.forEach((setting) => {
      const key = setting.key.split('.')[1];
      categorySettings[key] = setting.value;
    });

    res.json({
      success: true,
      data: categorySettings
    });
  } catch (error: any) {
    console.error('Error fetching category settings:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch settings'
    });
  }
});

// PUT /api/settings - Update multiple settings
router.put('/', async (req, res) => {
  try {
    const { settings } = req.body;

    // Flatten the nested settings object to array of updates
    const updates: Array<{ key: string; value: any; category: string }> = [];
    
    Object.entries(settings).forEach(([category, categorySettings]: [string, any]) => {
      Object.entries(categorySettings).forEach(([key, value]) => {
        updates.push({
          key: `${category}.${key}`,
          value: value,
          category: category
        });
      });
    });

    // Update each setting
    const promises = updates.map(async (update) => {
      const { error } = await supabase
        .from('settings')
        .update({
          value: update.value,
          updated_at: new Date().toISOString()
        })
        .eq('key', update.key);

      if (error) throw error;
    });

    await Promise.all(promises);

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { updatedCount: updates.length }
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update settings'
    });
  }
});

// PUT /api/settings/:key - Update a single setting
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const { error } = await supabase
      .from('settings')
      .update({
        value: value,
        updated_at: new Date().toISOString()
      })
      .eq('key', key);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Setting updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating setting:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update setting'
    });
  }
});

// POST /api/settings/reset - Reset all settings to defaults
router.post('/reset', async (req, res) => {
  try {
    // Delete all settings
    const { error: deleteError } = await supabase
      .from('settings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) throw deleteError;

    // Re-run the default insert (you might want to read from a config file instead)
    const defaultSettings = [
      { key: 'church.name', value: 'CRC Kids Church', category: 'church' },
      { key: 'church.phone', value: '', category: 'church' },
      { key: 'church.email', value: '', category: 'church' },
      { key: 'church.address', value: '', category: 'church' },
      { key: 'checkin.securityCodeLength', value: 4, category: 'checkin' },
      { key: 'checkin.requireSignature', value: true, category: 'checkin' },
      { key: 'checkin.printTags', value: true, category: 'checkin' },
      { key: 'checkin.enableSelfCheckout', value: false, category: 'checkin' },
      { key: 'checkin.autoCheckoutTime', value: 4, category: 'checkin' },
      { key: 'classroom.defaultCapacity', value: 20, category: 'classroom' },
      { key: 'classroom.capacityWarning', value: 90, category: 'classroom' },
      { key: 'classroom.ageBasedAssignment', value: true, category: 'classroom' },
      { key: 'classroom.showCapacityWarnings', value: true, category: 'classroom' },
      { key: 'notifications.emailReminders', value: true, category: 'notifications' },
      { key: 'notifications.specialNeedsAlerts', value: true, category: 'notifications' },
      { key: 'notifications.allergyWarnings', value: true, category: 'notifications' },
      { key: 'notifications.birthdayNotifications', value: true, category: 'notifications' },
      { key: 'reports.reportPeriod', value: 'month', category: 'reports' },
      { key: 'reports.dataRetention', value: 2, category: 'reports' },
      { key: 'reports.autoBackup', value: true, category: 'reports' },
      { key: 'reports.anonymizeData', value: false, category: 'reports' },
      { key: 'security.sessionTimeout', value: 60, category: 'security' },
      { key: 'security.requirePhotoConsent', value: true, category: 'security' },
      { key: 'security.twoFactorAuth', value: false, category: 'security' },
      { key: 'security.auditLog', value: true, category: 'security' },
      { key: 'display.dateFormat', value: 'MM/DD/YYYY', category: 'display' },
      { key: 'display.timeFormat', value: '12', category: 'display' },
      { key: 'display.themeColor', value: 'teal', category: 'display' },
      { key: 'display.darkMode', value: false, category: 'display' }
    ];

    const { error: insertError } = await supabase
      .from('settings')
      .insert(defaultSettings);

    if (insertError) throw insertError;

    res.json({
      success: true,
      message: 'Settings reset to defaults'
    });
  } catch (error: any) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reset settings'
    });
  }
});

export default router;
