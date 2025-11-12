-- Add login security tracking columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ NULL;

-- Index to query locked accounts quickly
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON users(locked_until);
