/*
  # Create parents table

  1. New Tables
    - `parents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `first_name` (text, required)
      - `last_name` (text, required)
      - `phone_number` (text, required)
      - `emergency_contact_name` (text, optional)
      - `emergency_contact_phone` (text, optional)
      - `address` (text, optional)
      - `created_at`, `updated_at` (timestamps)

  2. Security
    - Enable RLS on `parents` table
    - Add policies for parents to read their own data
*/

CREATE TABLE IF NOT EXISTS parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone_number text NOT NULL,
  emergency_contact_name text,
  emergency_contact_phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parents_user_id ON parents(user_id);

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can read own data"
  ON parents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Parents can update own data"
  ON parents
  FOR UPDATE
  USING (auth.uid() = user_id);
