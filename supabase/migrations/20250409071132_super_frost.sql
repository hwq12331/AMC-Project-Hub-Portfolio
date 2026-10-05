/*
  # Add Procurement Tables

  1. New Tables
    - `purchase_orders`
      - Main PO table with order details
      - Tracks status, dates, and totals
    - `po_items`
      - Individual items in purchase orders
      - Links to parent PO
      - Stores quantity and pricing

  2. Changes
    - No RLS or security policies (prototype mode)
    - Added foreign key relationships
*/

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

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_po_project_id ON purchase_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_po_items_po_id ON po_items(po_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_date ON purchase_orders(date);

-- Add a trigger to update the total_amount when items are added/modified
CREATE OR REPLACE FUNCTION update_po_total_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE purchase_orders
  SET total_amount = (
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    FROM po_items
    WHERE po_id = NEW.po_id
  )
  WHERE id = NEW.po_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_po_total_after_item_change
AFTER INSERT OR UPDATE OR DELETE ON po_items
FOR EACH ROW
EXECUTE FUNCTION update_po_total_amount();

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_po_timestamp
BEFORE UPDATE ON purchase_orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();