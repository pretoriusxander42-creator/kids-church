/*
  # Create children table

  1. New Tables
    - `children`
      - `id` (uuid, primary key)
      - `first_name` (text, required)
      - `last_name` (text, required)
      - `date_of_birth` (date, required)
      - `photo_url` (text, optional)
      - `allergies` (text, optional)
      - `medical_notes` (text, optional)
      - `special_needs` (boolean, default false)
      - `special_needs_details` (text, optional)
      - `class_assignment` (enum)
      - `created_at`, `updated_at` (timestamps)

  2. Security
    - Enable RLS on `children` table
    - Add policies for parents to read their own children
    - Add policies for teachers to read children in their assigned classes
    - Add policies for admins to have full access
*/

CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  photo_url text,
  allergies text,
  medical_notes text,
  special_needs boolean DEFAULT false,
  special_needs_details text,
  class_assignment text CHECK (class_assignment IN ('nursery', 'toddlers', 'preschool', 'elementary', 'ftv_board')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_children_class_assignment ON children(class_assignment);
CREATE INDEX IF NOT EXISTS idx_children_special_needs ON children(special_needs);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Policies will be added after user_roles table is created
