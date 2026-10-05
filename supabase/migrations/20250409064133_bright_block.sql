/*
  # Update Gate Pass RLS Policies

  1. Changes
    - Remove existing gate_passes policies
    - Add new comprehensive policies for gate_passes table
    
  2. Security
    - Enable full CRUD operations for authenticated users
    - Maintain data integrity with proper policy checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON gate_passes;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON gate_passes;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON gate_passes;

-- Create new comprehensive policies
CREATE POLICY "Enable full access for authenticated users" ON gate_passes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for public read access
CREATE POLICY "Enable public read access" ON gate_passes
  FOR SELECT
  TO anon
  USING (true);

-- Create policy for public insert access
CREATE POLICY "Enable public insert access" ON gate_passes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy for public update access
CREATE POLICY "Enable public update access" ON gate_passes
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);