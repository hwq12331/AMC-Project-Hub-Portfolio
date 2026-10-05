/*
  # Remove RLS for prototyping

  1. Changes
    - Disable RLS on projects table
    - Drop all existing policies
*/

-- Disable RLS
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON projects;