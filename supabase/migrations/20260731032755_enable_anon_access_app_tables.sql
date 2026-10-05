-- Enable RLS on projects (currently disabled) and add anon policies for this no-auth app.
-- All app tables need anon CRUD access since the frontend uses the anon key with no login.

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_projects" ON projects FOR SELECT
  TO anon USING (true);
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT
  TO anon WITH CHECK (true);
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE
  TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE
  TO anon USING (true);

-- purchase_orders: add anon CRUD (currently only authenticated)
CREATE POLICY "anon_select_purchase_orders" ON purchase_orders FOR SELECT
  TO anon USING (true);
CREATE POLICY "anon_insert_purchase_orders" ON purchase_orders FOR INSERT
  TO anon WITH CHECK (true);
CREATE POLICY "anon_update_purchase_orders" ON purchase_orders FOR UPDATE
  TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_purchase_orders" ON purchase_orders FOR DELETE
  TO anon USING (true);

-- po_items: add anon CRUD
CREATE POLICY "anon_select_po_items" ON po_items FOR SELECT
  TO anon USING (true);
CREATE POLICY "anon_insert_po_items" ON po_items FOR INSERT
  TO anon WITH CHECK (true);
CREATE POLICY "anon_update_po_items" ON po_items FOR UPDATE
  TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_po_items" ON po_items FOR DELETE
  TO anon USING (true);

-- qa_checklists: add anon CRUD
CREATE POLICY "anon_select_qa_checklists" ON qa_checklists FOR SELECT
  TO anon USING (true);
CREATE POLICY "anon_insert_qa_checklists" ON qa_checklists FOR INSERT
  TO anon WITH CHECK (true);
CREATE POLICY "anon_update_qa_checklists" ON qa_checklists FOR UPDATE
  TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_qa_checklists" ON qa_checklists FOR DELETE
  TO anon USING (true);

-- qa_items: add anon CRUD
CREATE POLICY "anon_select_qa_items" ON qa_items FOR SELECT
  TO anon USING (true);
CREATE POLICY "anon_insert_qa_items" ON qa_items FOR INSERT
  TO anon WITH CHECK (true);
CREATE POLICY "anon_update_qa_items" ON qa_items FOR UPDATE
  TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_qa_items" ON qa_items FOR DELETE
  TO anon USING (true);

-- employees: add anon CRUD
CREATE POLICY "anon_select_employees" ON employees FOR SELECT
  TO anon USING (true);
CREATE POLICY "anon_insert_employees" ON employees FOR INSERT
  TO anon WITH CHECK (true);
CREATE POLICY "anon_update_employees" ON employees FOR UPDATE
  TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_employees" ON employees FOR DELETE
  TO anon USING (true);

-- gate_passes: add anon DELETE (already has anon select/insert/update)
CREATE POLICY "anon_delete_gate_passes" ON gate_passes FOR DELETE
  TO anon USING (true);
