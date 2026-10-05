/*
  # Initial Schema Setup for AMC ERP System

  1. New Tables
    - `projects`
      - Project management data
      - Includes basic project info, status, and dates
    - `employees`
      - Employee records
      - Stores personal info and department details
    - `purchase_orders`
      - Procurement system data
      - Tracks orders, suppliers, and items
    - `qa_checklists`
      - Quality assurance records
      - Stores inspection items and results
    - `gate_passes`
      - Visitor and contractor access records
      - Manages entry/exit tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client text NOT NULL,
  location text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('planned', 'in-progress', 'completed', 'on-hold')),
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  department text NOT NULL,
  certifications text[] DEFAULT '{}',
  join_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  supplier_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('requested', 'ordered', 'received')),
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Purchase Order Items Table
CREATE TABLE IF NOT EXISTS po_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id uuid REFERENCES purchase_orders(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  created_at timestamptz DEFAULT now()
);

-- QA Checklists Table
CREATE TABLE IF NOT EXISTS qa_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  name text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed')),
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- QA Checklist Items Table
CREATE TABLE IF NOT EXISTS qa_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id uuid REFERENCES qa_checklists(id) ON DELETE CASCADE,
  description text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'passed', 'failed')),
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gate Passes Table
CREATE TABLE IF NOT EXISTS gate_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text NOT NULL,
  company text NOT NULL,
  purpose text NOT NULL,
  contact_person text NOT NULL,
  id_number text NOT NULL,
  vehicle_number text,
  check_in timestamptz NOT NULL,
  check_out timestamptz,
  status text NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
  type text NOT NULL CHECK (type IN ('visitor', 'contractor', 'delivery')),
  items text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE po_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_passes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON projects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON employees
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON purchase_orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON po_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON qa_checklists
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON qa_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON gate_passes
  FOR SELECT TO authenticated USING (true);

-- Enable insert/update for authenticated users
CREATE POLICY "Enable insert for authenticated users" ON projects
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON projects
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON employees
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON employees
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON purchase_orders
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON purchase_orders
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON po_items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON po_items
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON qa_checklists
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON qa_checklists
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON qa_items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON qa_items
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON gate_passes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON gate_passes
  FOR UPDATE TO authenticated USING (true);