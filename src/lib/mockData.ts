import type { Project, Employee, PurchaseOrder, POItem, QAChecklist, ChecklistItem, GatePass } from '../types';

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Jubail Industrial Complex Phase 3',
    client: 'Saudi Aramco',
    location: 'Jubail',
    start_date: '2025-01-15',
    end_date: '2026-06-30',
    status: 'in-progress',
    progress: 35,
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Yanbu Refinery Upgrade',
    client: 'Saudi Aramco',
    location: 'Yanbu',
    start_date: '2025-03-01',
    end_date: '2025-12-31',
    status: 'in-progress',
    progress: 15,
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-03-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'SABIC Research Center',
    client: 'SABIC',
    location: 'Dhahran',
    start_date: '2025-06-01',
    end_date: '2026-03-31',
    status: 'planned',
    progress: 0,
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Ras Al Khair Power Plant',
    client: 'SEC',
    location: 'Ras Al Khair',
    start_date: '2024-09-15',
    end_date: '2025-09-15',
    status: 'in-progress',
    progress: 75,
    created_at: '2024-09-15T00:00:00Z',
    updated_at: '2024-09-15T00:00:00Z'
  },
  {
    id: '5',
    name: 'Riyadh Metro Station Maintenance',
    client: 'Riyadh Metro',
    location: 'Riyadh',
    start_date: '2024-12-01',
    end_date: '2025-05-30',
    status: 'completed',
    progress: 100,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z'
  }
];

// Mock Employees
export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Abdullah Al-Saud',
    role: 'Senior Project Manager',
    department: 'Engineering',
    certifications: ['PMP', 'Six Sigma Black Belt'],
    join_date: '2023-01-15',
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2023-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Mohammed Al-Qahtani',
    role: 'Safety Officer',
    department: 'Safety',
    certifications: ['NEBOSH IGC', 'OSHA 30'],
    join_date: '2023-03-20',
    created_at: '2023-03-20T00:00:00Z',
    updated_at: '2023-03-20T00:00:00Z'
  },
  {
    id: '3',
    name: 'Sara Al-Rashid',
    role: 'QA/QC Engineer',
    department: 'Quality',
    certifications: ['ISO 9001 Lead Auditor', 'AWS CWI'],
    join_date: '2023-06-10',
    created_at: '2023-06-10T00:00:00Z',
    updated_at: '2023-06-10T00:00:00Z'
  },
  {
    id: '4',
    name: 'Khalid Al-Omar',
    role: 'Procurement Manager',
    department: 'Operations',
    certifications: ['CIPS Level 4', 'Supply Chain Management'],
    join_date: '2023-04-05',
    created_at: '2023-04-05T00:00:00Z',
    updated_at: '2023-04-05T00:00:00Z'
  },
  {
    id: '5',
    name: 'Fatima Al-Hassan',
    role: 'Technical Lead',
    department: 'Technical',
    certifications: ['AutoCAD Certified', 'Revit Professional'],
    join_date: '2023-02-28',
    created_at: '2023-02-28T00:00:00Z',
    updated_at: '2023-02-28T00:00:00Z'
  }
];

// Mock Purchase Orders with Items
export const mockPurchaseOrders: (PurchaseOrder & { items: POItem[] })[] = [
  {
    id: '1',
    project_id: '1',
    supplier_id: 'SUP-001',
    status: 'ordered',
    total_amount: 125000,
    date: '2025-01-10',
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
    items: [
      {
        id: '1',
        po_id: '1',
        name: 'Industrial Pump XL-5000',
        quantity: 2,
        unit_price: 45000,
        created_at: '2025-01-10T00:00:00Z'
      },
      {
        id: '2',
        po_id: '1',
        name: 'Control Valve Assembly',
        quantity: 5,
        unit_price: 7000,
        created_at: '2025-01-10T00:00:00Z'
      }
    ]
  },
  {
    id: '2',
    project_id: '2',
    supplier_id: 'SUP-002',
    status: 'requested',
    total_amount: 85000,
    date: '2025-01-12',
    created_at: '2025-01-12T00:00:00Z',
    updated_at: '2025-01-12T00:00:00Z',
    items: [
      {
        id: '3',
        po_id: '2',
        name: 'Pressure Sensors',
        quantity: 10,
        unit_price: 3500,
        created_at: '2025-01-12T00:00:00Z'
      },
      {
        id: '4',
        po_id: '2',
        name: 'Steel Pipes (20m)',
        quantity: 25,
        unit_price: 2000,
        created_at: '2025-01-12T00:00:00Z'
      }
    ]
  },
  {
    id: '3',
    project_id: '4',
    supplier_id: 'SUP-003',
    status: 'received',
    total_amount: 65000,
    date: '2025-01-08',
    created_at: '2025-01-08T00:00:00Z',
    updated_at: '2025-01-08T00:00:00Z',
    items: [
      {
        id: '5',
        po_id: '3',
        name: 'Safety Equipment Set',
        quantity: 15,
        unit_price: 4333.33,
        created_at: '2025-01-08T00:00:00Z'
      }
    ]
  }
];

// Mock QA Checklists with Items
export const mockQAChecklists: (QAChecklist & { items: ChecklistItem[] })[] = [
  {
    id: '1',
    project_id: '1',
    name: 'Safety Equipment Inspection - Jubail Industrial Complex Phase 3',
    category: 'safety',
    department: 'safety',
    status: 'in-progress',
    date: '2025-01-15',
    due_date: '2025-01-20',
    assigned_to: '2',
    template: false,
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
    items: [
      {
        id: '1',
        checklist_id: '1',
        description: 'PPE Compliance Check',
        category: 'safety',
        risk_level: 'high',
        priority: 'high',
        status: 'passed',
        comments: 'All PPE meets OSHA standards',
        due_date: '2025-01-18',
        assigned_to: '2',
        photo_urls: [],
        compliance_ref: 'OSHA 1910.132',
        inspection_date: '2025-01-16T00:00:00Z',
        created_at: '2025-01-15T00:00:00Z',
        updated_at: '2025-01-16T00:00:00Z'
      },
      {
        id: '2',
        checklist_id: '1',
        description: 'Emergency Equipment Access',
        category: 'safety',
        risk_level: 'critical',
        priority: 'urgent',
        status: 'failed',
        comments: 'Fire extinguisher blocked by equipment',
        due_date: '2025-01-17',
        assigned_to: '2',
        photo_urls: [],
        compliance_ref: 'NFPA 101',
        inspection_date: '2025-01-16T00:00:00Z',
        created_at: '2025-01-15T00:00:00Z',
        updated_at: '2025-01-16T00:00:00Z'
      }
    ]
  },
  {
    id: '2',
    project_id: '2',
    name: 'Technical Installation Review - Yanbu Refinery Upgrade',
    category: 'technical',
    department: 'engineering',
    status: 'pending',
    date: '2025-01-14',
    due_date: '2025-01-25',
    assigned_to: '3',
    template: false,
    created_at: '2025-01-14T00:00:00Z',
    updated_at: '2025-01-14T00:00:00Z',
    items: [
      {
        id: '3',
        checklist_id: '2',
        description: 'Equipment Calibration',
        category: 'technical',
        risk_level: 'medium',
        priority: 'medium',
        status: 'pending',
        comments: null,
        due_date: '2025-01-22',
        assigned_to: '3',
        photo_urls: [],
        compliance_ref: 'ISO 9001:7.6',
        created_at: '2025-01-14T00:00:00Z',
        updated_at: '2025-01-14T00:00:00Z'
      }
    ]
  }
];

// Mock Gate Passes
export const mockGatePasses: GatePass[] = [
  {
    id: '1',
    visitor_name: 'Ahmed Al-Ghamdi',
    company: 'Tech Solutions Ltd',
    purpose: 'Equipment Installation',
    contact_person: 'Abdullah Al-Saud',
    id_number: 'ID-78901',
    vehicle_number: 'ABC 123',
    check_in: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    check_out: null,
    status: 'active',
    type: 'contractor',
    items: ['Toolbox', 'Laptop', 'Testing Equipment'],
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    visitor_name: 'Sarah Smith',
    company: 'Safety First Consultants',
    purpose: 'Safety Audit',
    contact_person: 'Mohammed Al-Qahtani',
    id_number: 'ID-78902',
    vehicle_number: null,
    check_in: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    check_out: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    type: 'visitor',
    items: ['Laptop', 'Camera'],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    visitor_name: 'Ali Al-Harbi',
    company: 'Express Logistics',
    purpose: 'Material Delivery',
    contact_person: 'Khalid Al-Omar',
    id_number: 'ID-78903',
    vehicle_number: 'XYZ 789',
    check_in: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    check_out: null,
    status: 'active',
    type: 'delivery',
    items: ['Industrial Pumps', 'Control Valves'],
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  }
];

// Helper function to generate new IDs
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Helper function to simulate async operations
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}