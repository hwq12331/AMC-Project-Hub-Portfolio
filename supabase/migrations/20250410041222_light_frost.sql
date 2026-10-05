/*
  # Add Example Data for AMC ERP System

  1. Example Data Added
    - Projects with various statuses and progress levels
    - Employees across different departments
    - Purchase orders with items
    - QA checklists with inspection items
    - Gate passes for different types of visitors

  2. Purpose
    - Demonstrate system functionality
    - Provide realistic examples for users
    - Show different states and scenarios
*/

-- Example Projects
INSERT INTO projects (name, client, location, start_date, end_date, status, progress) VALUES
  ('Jubail Industrial Complex Phase 3', 'Saudi Aramco', 'Jubail', '2025-01-15', '2026-06-30', 'in-progress', 35),
  ('Yanbu Refinery Upgrade', 'Saudi Aramco', 'Yanbu', '2025-03-01', '2025-12-31', 'in-progress', 15),
  ('SABIC Research Center', 'SABIC', 'Dhahran', '2025-06-01', '2026-03-31', 'planned', 0),
  ('Ras Al Khair Power Plant', 'SEC', 'Ras Al Khair', '2024-09-15', '2025-09-15', 'in-progress', 75),
  ('Riyadh Metro Station Maintenance', 'Riyadh Metro', 'Riyadh', '2024-12-01', '2025-05-30', 'completed', 100);

-- Example Employees
INSERT INTO employees (name, role, department, certifications, join_date) VALUES
  ('Abdullah Al-Saud', 'Senior Project Manager', 'Engineering', ARRAY['PMP', 'Six Sigma Black Belt'], '2023-01-15'),
  ('Mohammed Al-Qahtani', 'Safety Officer', 'Safety', ARRAY['NEBOSH IGC', 'OSHA 30'], '2023-03-20'),
  ('Sara Al-Rashid', 'QA/QC Engineer', 'Quality', ARRAY['ISO 9001 Lead Auditor', 'AWS CWI'], '2023-06-10'),
  ('Khalid Al-Omar', 'Procurement Manager', 'Operations', ARRAY['CIPS Level 4', 'Supply Chain Management'], '2023-04-05'),
  ('Fatima Al-Hassan', 'Technical Lead', 'Technical', ARRAY['AutoCAD Certified', 'Revit Professional'], '2023-02-28');

-- Example Purchase Orders
WITH new_po AS (
  INSERT INTO purchase_orders (project_id, supplier_id, status, date)
  SELECT 
    id,
    'SUP-' || floor(random() * 1000)::text,
    status,
    current_date - (random() * 30)::integer
  FROM (
    SELECT id FROM projects ORDER BY random() LIMIT 3
  ) p,
  (
    VALUES 
      ('requested'),
      ('ordered'),
      ('received')
  ) s(status)
  RETURNING id
)
INSERT INTO po_items (po_id, name, quantity, unit_price)
SELECT 
  po.id,
  item.name,
  floor(random() * 10 + 1)::integer,
  (random() * 1000 + 100)::numeric(10,2)
FROM new_po po
CROSS JOIN (
  VALUES 
    ('Industrial Pump XL-5000'),
    ('Control Valve Assembly'),
    ('Pressure Sensors'),
    ('Steel Pipes (20m)'),
    ('Safety Equipment Set')
) item(name);

-- Example QA Checklists
WITH new_checklist AS (
  INSERT INTO qa_checklists (project_id, name, status, date)
  SELECT 
    id,
    'Quality Inspection - ' || name,
    status,
    current_date - (random() * 15)::integer
  FROM (
    SELECT id, name FROM projects WHERE status = 'in-progress' ORDER BY random() LIMIT 2
  ) p,
  (
    VALUES 
      ('pending'),
      ('in-progress')
  ) s(status)
  RETURNING id, name
)
INSERT INTO qa_items (checklist_id, description, status, comments)
SELECT 
  c.id,
  item.description,
  item.status,
  CASE 
    WHEN item.status = 'failed' THEN 'Requires immediate attention'
    WHEN item.status = 'passed' THEN 'Meets specifications'
    ELSE NULL
  END
FROM new_checklist c
CROSS JOIN (
  VALUES 
    ('Welding Quality Check', 'passed'),
    ('Pressure Test', 'pending'),
    ('Material Certification', 'passed'),
    ('Safety Equipment Inspection', 'failed'),
    ('Calibration Verification', 'pending')
) item(description, status);

-- Example Gate Passes
INSERT INTO gate_passes (
  visitor_name,
  company,
  purpose,
  contact_person,
  id_number,
  vehicle_number,
  check_in,
  check_out,
  status,
  type,
  items
) VALUES
  (
    'Ahmed Al-Ghamdi',
    'Tech Solutions Ltd',
    'Equipment Installation',
    'Abdullah Al-Saud',
    'ID-78901',
    'ABC 123',
    current_timestamp - interval '4 hours',
    NULL,
    'active',
    'contractor',
    ARRAY['Toolbox', 'Laptop', 'Testing Equipment']
  ),
  (
    'Sarah Smith',
    'Safety First Consultants',
    'Safety Audit',
    'Mohammed Al-Qahtani',
    'ID-78902',
    NULL,
    current_timestamp - interval '2 days',
    current_timestamp - interval '1 day',
    'completed',
    'visitor',
    ARRAY['Laptop', 'Camera']
  ),
  (
    'Ali Al-Harbi',
    'Express Logistics',
    'Material Delivery',
    'Khalid Al-Omar',
    'ID-78903',
    'XYZ 789',
    current_timestamp - interval '3 hours',
    NULL,
    'active',
    'delivery',
    ARRAY['Industrial Pumps', 'Control Valves']
  );