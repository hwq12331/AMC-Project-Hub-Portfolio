/*
  # Insert Test Users and Profiles

  1. New Data
    - Test users for each role
    - User profiles linked to roles
    - Employee records for each user
    
  2. Purpose
    - Provide test accounts for different roles
    - Demonstrate role-based access
    - Enable testing of permissions
*/

-- Insert test employees first
INSERT INTO employees (id, name, role, department, certifications, join_date) VALUES
  ('d11b3c7a-3f6e-4558-8e1d-c4d4ac6d37f3', 'Admin User', 'System Administrator', 'IT', ARRAY['CISSP', 'PMP'], '2024-01-01'),
  ('d22b3c7a-3f6e-4558-8e1d-c4d4ac6d37f3', 'Project Manager', 'Senior Project Manager', 'Projects', ARRAY['PMP', 'Prince2'], '2024-01-02'),
  ('d33b3c7a-3f6e-4558-8e1d-c4d4ac6d37f3', 'QA Inspector', 'Senior QA Engineer', 'Quality', ARRAY['ISO 9001', 'Six Sigma'], '2024-01-03'),
  ('d44b3c7a-3f6e-4558-8e1d-c4d4ac6d37f3', 'Safety Officer', 'HSE Manager', 'Safety', ARRAY['NEBOSH', 'OSHA'], '2024-01-04'),
  ('d55b3c7a-3f6e-4558-8e1d-c4d4ac6d37f3', 'Procurement Officer', 'Procurement Manager', 'Procurement', ARRAY['CIPS'], '2024-01-05'),
  ('d66b3c7a-3f6e-4558-8e1d-c4d4ac6d37f3', 'Security Officer', 'Security Manager', 'Security', ARRAY['CPP'], '2024-01-06');

-- Insert user profiles with proper UUID casting
INSERT INTO user_profiles (id, role_id, employee_id, department)
SELECT 
  uuid_val::uuid as id,
  r.id as role_id,
  emp_id::uuid as employee_id,
  department
FROM (
  VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin', 'd11b3c7a-3f6e-4558-8e1d-c4d4ac6d37f3', 'IT'),
    ('22222222-2222-2222-2222-222222222222', 'project_manager', 'd22b3c7a-3f6e-4558-8e1d-c4d4ac6d37f3', 'Projects'),
    ('33333333-3333-3333-3333-333333333333', 'qa_inspector', 'd33b3c7a-3f6e-4558-8e1d-c4d4ac6d37f3', 'Quality'),
    ('44444444-4444-4444-4444-444444444444', 'safety_officer', 'd44b3c7a-3f6e-4558-8e1d-c4d4ac6d37f3', 'Safety'),
    ('55555555-5555-5555-5555-555555555555', 'procurement_officer', 'd55b3c7a-3f6e-4558-8e1d-c4d4ac6d37f3', 'Procurement'),
    ('66666666-6666-6666-6666-666666666666', 'security_officer', 'd66b3c7a-3f6e-4558-8e1d-c4d4ac6d37f3', 'Security')
) as v(uuid_val, role_name, emp_id, department)
JOIN roles r ON r.name = v.role_name;