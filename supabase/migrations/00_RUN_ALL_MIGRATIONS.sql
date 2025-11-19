-- =====================================================
-- KIDS CHURCH CHECK-IN SYSTEM - COMPLETE DATABASE SETUP
-- =====================================================
-- Run this entire file in the Supabase SQL Editor
-- This will create all tables, relationships, and policies
-- =====================================================

-- Migration 1: Create users table
-- =====================================================
-- Drop the table first if it exists to ensure clean slate
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS (we handle authorization in application layer with RBAC middleware)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Migration 3: Create children table
-- =====================================================
DROP TABLE IF EXISTS children CASCADE;

CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    allergies TEXT,
    medical_notes TEXT,
    special_needs BOOLEAN DEFAULT FALSE,
    special_needs_details TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE children DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_children_last_name ON children(last_name);
CREATE INDEX idx_children_date_of_birth ON children(date_of_birth);

-- Migration 4: Create parents table
-- =====================================================
DROP TABLE IF EXISTS parents CASCADE;

CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone_number TEXT NOT NULL,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE parents DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_parents_email ON parents(email);
CREATE INDEX idx_parents_phone ON parents(phone_number);

-- Migration 5: Create parent_child_relationships table
-- =====================================================
DROP TABLE IF EXISTS parent_child_relationships CASCADE;

CREATE TABLE parent_child_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    relationship_type TEXT CHECK (relationship_type IN ('mother', 'father', 'guardian', 'other')),
    is_primary_contact BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_id, child_id)
);

ALTER TABLE parent_child_relationships DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_relationships_parent ON parent_child_relationships(parent_id);
CREATE INDEX idx_relationships_child ON parent_child_relationships(child_id);

-- Migration 6: Create check_ins table
-- =====================================================
DROP TABLE IF EXISTS check_ins CASCADE;

CREATE TABLE check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES parents(id),
    check_in_time TIMESTAMPTZ DEFAULT NOW(),
    check_out_time TIMESTAMPTZ,
    checked_in_by UUID REFERENCES users(id),
    checked_out_by UUID REFERENCES users(id),
    security_code TEXT NOT NULL,
    class_attended TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE check_ins DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_checkins_child ON check_ins(child_id);
CREATE INDEX idx_checkins_parent ON check_ins(parent_id);
CREATE INDEX idx_checkins_date ON check_ins(check_in_time);
CREATE INDEX idx_checkins_security_code ON check_ins(security_code);

-- Migration 7: Create classes table
-- =====================================================
DROP TABLE IF EXISTS classes CASCADE;

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('regular', 'ftv_board', 'special_needs')),
    age_min INTEGER,
    age_max INTEGER,
    capacity INTEGER,
    room_location TEXT,
    teacher_id UUID REFERENCES users(id),
    schedule TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE classes DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_classes_type ON classes(type);

-- Migration 8: Create class_assignments table
-- =====================================================
DROP TABLE IF EXISTS class_assignments CASCADE;

CREATE TABLE class_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    status TEXT CHECK (status IN ('active', 'inactive', 'graduated')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(child_id, class_id)
);

ALTER TABLE class_assignments DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_assignments_child ON class_assignments(child_id);
CREATE INDEX idx_assignments_class ON class_assignments(class_id);

-- Migration 9: Create special_needs_forms table
-- =====================================================
DROP TABLE IF EXISTS special_needs_forms CASCADE;

CREATE TABLE special_needs_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    diagnosis TEXT,
    medications TEXT,
    triggers TEXT,
    calming_techniques TEXT,
    communication_methods TEXT,
    emergency_procedures TEXT,
    additional_notes TEXT,
    submitted_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(child_id)
);

ALTER TABLE special_needs_forms DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_special_needs_child ON special_needs_forms(child_id);

-- Migration 10: Create user_roles table
-- =====================================================
DROP TABLE IF EXISTS user_roles CASCADE;

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('parent', 'teacher', 'admin', 'super_admin')) DEFAULT 'parent',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Migration 11: Create audit_logs table
-- =====================================================
DROP TABLE IF EXISTS audit_logs CASCADE;

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Migration 12: Add email verification fields
-- =====================================================
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verification_token TEXT;
ALTER TABLE users ADD COLUMN password_reset_token TEXT;
ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMPTZ;

CREATE INDEX idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX idx_users_password_reset_token ON users(password_reset_token);

-- Migration 13: Add login security fields
-- =====================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_users_locked_until ON users(locked_until);

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- You can now use the application with all features enabled
-- =====================================================
