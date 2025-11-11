/*
  # Create user_roles table

  1. New Tables
    - `user_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `role` (enum: parent, teacher, admin, super_admin)
      - `assigned_class_id` (uuid, foreign key, optional - for teachers)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Only admins can manage roles
*/

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('parent', 'teacher', 'admin', 'super_admin')) NOT NULL,
  assigned_class_id uuid REFERENCES classes(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Default role for new users (parent)
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'parent');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assign_default_role_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_role();
