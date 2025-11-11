/*
  # Create special_needs_forms table

  1. New Tables
    - `special_needs_forms`
      - `id` (uuid, primary key)
      - `child_id` (uuid, foreign key)
      - `form_data` (jsonb - flexible structure)
      - `submitted_by` (uuid, foreign key to users)
      - `submitted_at` (timestamp)
      - `reviewed_by` (uuid, foreign key to users, optional)
      - `reviewed_at` (timestamp, optional)
      - `status` (enum: pending, approved, needs_update)

  2. Security
    - Enable RLS
*/

CREATE TABLE IF NOT EXISTS special_needs_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  form_data jsonb NOT NULL,
  submitted_by uuid REFERENCES users(id),
  submitted_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamptz,
  status text CHECK (status IN ('pending', 'approved', 'needs_update')) DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS idx_special_needs_forms_child_id ON special_needs_forms(child_id);
CREATE INDEX IF NOT EXISTS idx_special_needs_forms_status ON special_needs_forms(status);

ALTER TABLE special_needs_forms ENABLE ROW LEVEL SECURITY;
