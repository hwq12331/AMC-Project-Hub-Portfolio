/*
  # Fix Projects RLS Policies

  1. Changes
    - Drop existing RLS policies for projects table
    - Create new, properly configured RLS policies for projects table
      - Allow authenticated users to read all projects
      - Allow authenticated users to insert projects
      - Allow authenticated users to update projects
      
  2. Security
    - Maintains RLS enabled on projects table
    - Ensures authenticated users have proper access
    - Prevents unauthorized access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON projects;

-- Create new policies with proper security checks
CREATE POLICY "Enable read access for authenticated users"
ON projects FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users"
ON projects FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users"
ON projects FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');