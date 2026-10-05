/*
  # Authentication and Role Management System

  1. New Tables
    - `user_profiles`
      - Extended user information
      - Links to auth.users
      - Stores role and department info
    - `roles`
      - Available system roles
      - Permissions and access levels
    - `role_permissions`
      - Granular permissions for each role
      - Module-specific access rights

  2. Security
    - Enable RLS on all tables
    - Link permissions to auth.users
    - Secure role assignments
*/

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Role permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  module text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, module, action)
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id),
  employee_id uuid REFERENCES employees(id),
  department text NOT NULL,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for roles table
CREATE POLICY "Roles viewable by authenticated users"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Roles modifiable by admin only"
  ON roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND role_id IN (
        SELECT id FROM roles WHERE name = 'admin'
      )
    )
  );

-- Policies for role_permissions table
CREATE POLICY "Permissions viewable by authenticated users"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permissions modifiable by admin only"
  ON role_permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND role_id IN (
        SELECT id FROM roles WHERE name = 'admin'
      )
    )
  );

-- Policies for user_profiles table
CREATE POLICY "Profiles viewable by authenticated users"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can manage all profiles"
  ON user_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND role_id IN (
        SELECT id FROM roles WHERE name = 'admin'
      )
    )
  );

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'System administrator with full access'),
  ('project_manager', 'Project management and oversight'),
  ('qa_inspector', 'Quality assurance and inspection'),
  ('safety_officer', 'Safety management and compliance'),
  ('procurement_officer', 'Procurement and purchase management'),
  ('security_officer', 'Site security and access control');

-- Insert default permissions
INSERT INTO role_permissions (role_id, module, action) 
SELECT 
  r.id,
  m.module,
  a.action
FROM roles r
CROSS JOIN (
  VALUES 
    ('projects'),
    ('procurement'),
    ('qa'),
    ('hr'),
    ('gate_pass'),
    ('users'),
    ('roles')
) m(module)
CROSS JOIN (
  VALUES 
    ('view'),
    ('create'),
    ('update'),
    ('delete')
) a(action)
WHERE r.name = 'admin';

-- Project manager permissions
INSERT INTO role_permissions (role_id, module, action)
SELECT 
  r.id,
  m.module,
  a.action
FROM roles r
CROSS JOIN (
  VALUES 
    ('projects'),
    ('procurement'),
    ('qa'),
    ('hr')
) m(module)
CROSS JOIN (
  VALUES 
    ('view'),
    ('create'),
    ('update')
) a(action)
WHERE r.name = 'project_manager';

-- QA inspector permissions
INSERT INTO role_permissions (role_id, module, action)
SELECT 
  r.id,
  m.module,
  a.action
FROM roles r
CROSS JOIN (
  VALUES 
    ('qa'),
    ('projects')
) m(module)
CROSS JOIN (
  VALUES 
    ('view'),
    ('create'),
    ('update')
) a(action)
WHERE r.name = 'qa_inspector';

-- Safety officer permissions
INSERT INTO role_permissions (role_id, module, action)
SELECT 
  r.id,
  m.module,
  a.action
FROM roles r
CROSS JOIN (
  VALUES 
    ('hr'),
    ('qa')
) m(module)
CROSS JOIN (
  VALUES 
    ('view'),
    ('create'),
    ('update')
) a(action)
WHERE r.name = 'safety_officer';

-- Procurement officer permissions
INSERT INTO role_permissions (role_id, module, action)
SELECT 
  r.id,
  m.module,
  a.action
FROM roles r
CROSS JOIN (
  VALUES 
    ('procurement'),
    ('projects')
) m(module)
CROSS JOIN (
  VALUES 
    ('view'),
    ('create'),
    ('update')
) a(action)
WHERE r.name = 'procurement_officer';

-- Security officer permissions
INSERT INTO role_permissions (role_id, module, action)
SELECT 
  r.id,
  m.module,
  a.action
FROM roles r
CROSS JOIN (
  VALUES 
    ('gate_pass'),
    ('hr')
) m(module)
CROSS JOIN (
  VALUES 
    ('view'),
    ('create'),
    ('update')
) a(action)
WHERE r.name = 'security_officer';