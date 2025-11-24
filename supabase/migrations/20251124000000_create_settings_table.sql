-- Create settings table for storing church-wide settings
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    category VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- Insert default settings
INSERT INTO settings (key, value, category, description) VALUES
('church.name', '"CRC Kids Church"', 'church', 'Church name displayed on reports'),
('church.phone', '""', 'church', 'Church contact phone number'),
('church.email', '""', 'church', 'Church contact email'),
('church.address', '""', 'church', 'Church physical address'),

('checkin.securityCodeLength', '4', 'checkin', 'Length of security codes'),
('checkin.requireSignature', 'true', 'checkin', 'Require parent signature'),
('checkin.printTags', 'true', 'checkin', 'Auto-print security tags'),
('checkin.enableSelfCheckout', 'false', 'checkin', 'Allow self checkout'),
('checkin.autoCheckoutTime', '4', 'checkin', 'Auto checkout after hours'),

('classroom.defaultCapacity', '20', 'classroom', 'Default classroom capacity'),
('classroom.capacityWarning', '90', 'classroom', 'Capacity warning threshold'),
('classroom.ageBasedAssignment', 'true', 'classroom', 'Age-based auto assignment'),
('classroom.showCapacityWarnings', 'true', 'classroom', 'Show capacity warnings'),

('notifications.emailReminders', 'true', 'notifications', 'Email attendance reminders'),
('notifications.specialNeedsAlerts', 'true', 'notifications', 'Special needs alerts'),
('notifications.allergyWarnings', 'true', 'notifications', 'Allergy warnings'),
('notifications.birthdayNotifications', 'true', 'notifications', 'Birthday notifications'),

('reports.reportPeriod', '"month"', 'reports', 'Default report period'),
('reports.dataRetention', '2', 'reports', 'Data retention in years'),
('reports.autoBackup', 'true', 'reports', 'Automatic daily backups'),
('reports.anonymizeData', 'false', 'reports', 'Anonymize exported data'),

('security.sessionTimeout', '60', 'security', 'Session timeout in minutes'),
('security.requirePhotoConsent', 'true', 'security', 'Require photo consent'),
('security.twoFactorAuth', 'false', 'security', 'Two-factor authentication'),
('security.auditLog', 'true', 'security', 'Enable audit logging'),

('display.dateFormat', '"MM/DD/YYYY"', 'display', 'Date format'),
('display.timeFormat', '"12"', 'display', 'Time format (12 or 24)'),
('display.themeColor', '"teal"', 'display', 'Primary theme color'),
('display.darkMode', 'false', 'display', 'Dark mode enabled')

ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read settings
CREATE POLICY "Allow authenticated users to read settings"
    ON settings
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to update settings
CREATE POLICY "Allow authenticated users to update settings"
    ON settings
    FOR UPDATE
    TO authenticated
    USING (true);
