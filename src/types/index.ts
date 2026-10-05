export interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  start_date: string;
  end_date: string;
  status: 'planned' | 'in-progress' | 'completed' | 'on-hold';
  progress: number;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseOrder {
  id: string;
  project_id: string;
  supplier_id: string;
  status: 'requested' | 'ordered' | 'received';
  total_amount: number;
  date: string;
  created_at?: string;
  updated_at?: string;
}

export interface POItem {
  id: string;
  po_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  created_at?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  certifications: string[];
  join_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface QAChecklist {
  id: string;
  project_id: string;
  name: string;
  category: 'general' | 'safety' | 'environmental' | 'technical' | 'regulatory';
  department: 'quality' | 'safety' | 'engineering' | 'operations';
  status: 'pending' | 'in-progress' | 'completed';
  date: string;
  due_date?: string;
  assigned_to?: string;
  template: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  description: string;
  category: 'general' | 'safety' | 'environmental' | 'technical' | 'regulatory';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'passed' | 'failed';
  comments?: string | null;
  due_date?: string;
  assigned_to?: string;
  photo_urls: string[];
  compliance_ref?: string;
  inspection_date?: string;
  resolution_date?: string;
  resolution_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GatePass {
  id: string;
  visitor_name: string;
  company: string;
  purpose: string;
  contact_person: string;
  id_number: string;
  vehicle_number?: string | null;
  check_in: string;
  check_out?: string | null;
  status: 'active' | 'completed' | 'cancelled';
  type: 'visitor' | 'contractor' | 'delivery';
  items?: string[];
  created_at?: string;
  updated_at?: string;
}
