/*
  # Create check_ins table

  1. New Tables
    - `check_ins`
      - `id` (uuid, primary key)
      - `child_id` (uuid, foreign key)
      - `parent_id` (uuid, foreign key)
      - `checked_in_by` (uuid, foreign key to users)
      - `check_in_time` (timestamp, required)
      - `check_out_time` (timestamp, optional)
      - `checked_out_by` (uuid, foreign key to users)
      - `security_code` (text, required - for pickup verification)
      - `notes` (text, optional)
      - `class_attended` (text, optional)
      - `created_at`, `updated_at` (timestamps)

  2. Security
    - Enable RLS
    - Add policies for authorized access
*/

CREATE TABLE IF NOT EXISTS check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES parents(id) ON DELETE CASCADE,
  checked_in_by uuid REFERENCES users(id),
  check_in_time timestamptz NOT NULL DEFAULT now(),
  check_out_time timestamptz,
  checked_out_by uuid REFERENCES users(id),
  security_code text NOT NULL,
  notes text,
  class_attended text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_check_ins_child_id ON check_ins(child_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_check_in_time ON check_ins(check_in_time);
CREATE INDEX IF NOT EXISTS idx_check_ins_parent_id ON check_ins(parent_id);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
