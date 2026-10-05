/*
  # Update Projects table RLS policies

  1. Security Changes
    - Enable RLS on projects table (if not already enabled)
    - Add policies for authenticated users to:
      - Read all projects
      - Insert new projects
      - Update existing projects
    
  2. Notes
    - All authenticated users can view all projects
    - All authenticated users can create new projects
    - All authenticated users can update any project
    - These policies match the current application functionality
*/

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON projects;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
ON projects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON projects FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON projects FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);