/*
  # Create classes table

  1. New Tables
    - `classes`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `type` (enum: regular, ftv_board, special_needs)
      - `description` (text)
      - `age_range_min` (integer)
      - `age_range_max` (integer)
      - `capacity` (integer)
      - `room_location` (text)
      - `is_active` (boolean, default true)
      - `created_at`, `updated_at` (timestamps)

  2. Security
    - Enable RLS
*/

CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text CHECK (type IN ('regular', 'ftv_board', 'special_needs')),
  description text,
  age_range_min integer,
  age_range_max integer,
  capacity integer,
  room_location text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classes_type ON classes(type);
CREATE INDEX IF NOT EXISTS idx_classes_is_active ON classes(is_active);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
