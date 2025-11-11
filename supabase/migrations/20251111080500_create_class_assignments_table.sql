/*
  # Create class_assignments table

  1. New Tables
    - `class_assignments`
      - `id` (uuid, primary key)
      - `child_id` (uuid, foreign key)
      - `class_id` (uuid, foreign key)
      - `assigned_date` (date)
      - `is_active` (boolean, default true)

  2. Security
    - Enable RLS
*/

CREATE TABLE IF NOT EXISTS class_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  assigned_date date DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  UNIQUE(child_id, class_id)
);

CREATE INDEX IF NOT EXISTS idx_class_assignments_child_id ON class_assignments(child_id);
CREATE INDEX IF NOT EXISTS idx_class_assignments_class_id ON class_assignments(class_id);

ALTER TABLE class_assignments ENABLE ROW LEVEL SECURITY;
