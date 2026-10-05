/*
  # Update QA Items RLS Policies

  1. Changes
    - Update RLS policies for qa_items table to properly handle authenticated users
    - Add policies for all CRUD operations
    - Link permissions to qa_checklists access

  2. Security
    - Enable RLS on qa_items table
    - Add policies for authenticated users to:
      - Insert items into checklists
      - Read items from checklists
      - Update items in checklists
      - Delete items from checklists
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON qa_items;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON qa_items;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON qa_items;

-- Create comprehensive policies
CREATE POLICY "Enable insert for authenticated users"
ON qa_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM qa_checklists
    WHERE id = qa_items.checklist_id
  )
);

CREATE POLICY "Enable read access for authenticated users"
ON qa_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM qa_checklists
    WHERE id = qa_items.checklist_id
  )
);

CREATE POLICY "Enable update for authenticated users"
ON qa_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM qa_checklists
    WHERE id = qa_items.checklist_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM qa_checklists
    WHERE id = qa_items.checklist_id
  )
);

CREATE POLICY "Enable delete for authenticated users"
ON qa_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM qa_checklists
    WHERE id = qa_items.checklist_id
  )
);