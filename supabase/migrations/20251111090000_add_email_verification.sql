/*
  # Add email verification and password reset fields to users table

  1. New Fields
    - `email_verified` (boolean, default false)
    - `email_verification_token` (text, optional)
    - `password_reset_token` (text, optional)
    - `password_reset_expires` (timestamp, optional)
*/

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verification_token text,
ADD COLUMN IF NOT EXISTS password_reset_token text,
ADD COLUMN IF NOT EXISTS password_reset_expires timestamptz;

CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);
