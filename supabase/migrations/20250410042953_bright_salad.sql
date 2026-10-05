/*
  # Enhance QA/QC System

  1. New Columns
    - Add categories for QA items
    - Add risk levels and priority
    - Add due dates and assignees
    - Add photo evidence support
    - Add compliance fields
    
  2. Changes
    - Alter existing tables to support new features
    - Add new constraints and validations
    - Update existing data
*/

-- Add new columns to qa_checklists
ALTER TABLE qa_checklists ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general';
ALTER TABLE qa_checklists ADD COLUMN IF NOT EXISTS department text NOT NULL DEFAULT 'quality';
ALTER TABLE qa_checklists ADD COLUMN IF NOT EXISTS due_date date;
ALTER TABLE qa_checklists ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES employees(id);
ALTER TABLE qa_checklists ADD COLUMN IF NOT EXISTS template boolean DEFAULT false;

-- Add check constraint for categories
ALTER TABLE qa_checklists ADD CONSTRAINT qa_checklists_category_check 
  CHECK (category = ANY (ARRAY['general', 'safety', 'environmental', 'technical', 'regulatory']));

-- Add check constraint for departments
ALTER TABLE qa_checklists ADD CONSTRAINT qa_checklists_department_check 
  CHECK (department = ANY (ARRAY['quality', 'safety', 'engineering', 'operations']));

-- Add new columns to qa_items
ALTER TABLE qa_items ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general';
ALTER TABLE qa_items ADD COLUMN IF NOT EXISTS risk_level text NOT NULL DEFAULT 'medium';
ALTER TABLE qa_items ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'medium';
ALTER TABLE qa_items ADD COLUMN IF NOT EXISTS due_date date;
ALTER TABLE qa_items ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES employees(id);
ALTER TABLE qa_items ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT '{}';
ALTER TABLE qa_items ADD COLUMN IF NOT EXISTS compliance_ref text;
ALTER TABLE qa_items ADD COLUMN IF NOT EXISTS inspection_date timestamptz;
ALTER TABLE qa_items ADD COLUMN IF NOT EXISTS resolution_date timestamptz;
ALTER TABLE qa_items ADD COLUMN IF NOT EXISTS resolution_notes text;

-- Add check constraints for new columns
ALTER TABLE qa_items ADD CONSTRAINT qa_items_category_check 
  CHECK (category = ANY (ARRAY['general', 'safety', 'environmental', 'technical', 'regulatory']));

ALTER TABLE qa_items ADD CONSTRAINT qa_items_risk_level_check 
  CHECK (risk_level = ANY (ARRAY['low', 'medium', 'high', 'critical']));

ALTER TABLE qa_items ADD CONSTRAINT qa_items_priority_check 
  CHECK (priority = ANY (ARRAY['low', 'medium', 'high', 'urgent']));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_qa_items_category ON qa_items(category);
CREATE INDEX IF NOT EXISTS idx_qa_items_risk_level ON qa_items(risk_level);
CREATE INDEX IF NOT EXISTS idx_qa_items_priority ON qa_items(priority);
CREATE INDEX IF NOT EXISTS idx_qa_items_assigned_to ON qa_items(assigned_to);

-- Update existing data with sample values
UPDATE qa_items SET
  category = (ARRAY['safety', 'technical', 'environmental', 'regulatory'])[floor(random() * 4 + 1)],
  risk_level = (ARRAY['low', 'medium', 'high', 'critical'])[floor(random() * 4 + 1)],
  priority = (ARRAY['low', 'medium', 'high', 'urgent'])[floor(random() * 4 + 1)],
  due_date = current_date + (random() * 30)::integer,
  inspection_date = created_at;

UPDATE qa_checklists SET
  category = (ARRAY['safety', 'technical', 'environmental', 'regulatory'])[floor(random() * 4 + 1)],
  department = (ARRAY['quality', 'safety', 'engineering', 'operations'])[floor(random() * 4 + 1)],
  due_date = current_date + (random() * 30)::integer;

-- Add some template checklists
INSERT INTO qa_checklists (name, category, department, template, status, date)
VALUES
  ('Safety Equipment Inspection', 'safety', 'safety', true, 'pending', current_date),
  ('Environmental Compliance Audit', 'environmental', 'quality', true, 'pending', current_date),
  ('Technical Installation Review', 'technical', 'engineering', true, 'pending', current_date),
  ('Regulatory Compliance Check', 'regulatory', 'quality', true, 'pending', current_date);

-- Add template items
INSERT INTO qa_items (
  checklist_id,
  description,
  category,
  risk_level,
  priority,
  status,
  compliance_ref
)
SELECT 
  c.id,
  item.description,
  c.category,
  item.risk_level,
  item.priority,
  'pending',
  item.compliance_ref
FROM qa_checklists c
CROSS JOIN (
  VALUES 
    ('PPE Compliance Check', 'high', 'high', 'OSHA 1910.132'),
    ('Emergency Equipment Access', 'critical', 'urgent', 'NFPA 101'),
    ('Hazardous Material Storage', 'high', 'high', 'EPA 40 CFR'),
    ('Equipment Calibration', 'medium', 'medium', 'ISO 9001:7.6'),
    ('Documentation Review', 'low', 'low', 'ISO 9001:4.2')
) item(description, risk_level, priority, compliance_ref)
WHERE c.template = true;