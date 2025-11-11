/*
  # Fix RLS policies for user registration

  Update the INSERT policy to allow anonymous users to register
*/

DROP POLICY IF EXISTS "Anyone can create a user (signup)" ON users;

CREATE POLICY "Anonymous users can register"
  ON users
  FOR INSERT
  WITH CHECK (true);
