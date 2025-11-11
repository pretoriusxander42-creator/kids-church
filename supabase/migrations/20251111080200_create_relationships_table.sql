/*
  # Create parent_child_relationships table

  1. New Tables
    - `parent_child_relationships`
      - `id` (uuid, primary key)
      - `parent_id` (uuid, foreign key)
      - `child_id` (uuid, foreign key)
      - `relationship_type` (enum: mother, father, guardian, other)
      - `is_authorized_pickup` (boolean, default true)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for parents to manage their relationships
*/

CREATE TABLE IF NOT EXISTS parent_child_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES parents(id) ON DELETE CASCADE,
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  relationship_type text CHECK (relationship_type IN ('mother', 'father', 'guardian', 'other')),
  is_authorized_pickup boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_child_parent_id ON parent_child_relationships(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_child_child_id ON parent_child_relationships(child_id);

ALTER TABLE parent_child_relationships ENABLE ROW LEVEL SECURITY;
