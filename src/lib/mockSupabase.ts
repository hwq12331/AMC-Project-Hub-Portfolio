import { 
  mockProjects, 
  mockEmployees, 
  mockPurchaseOrders, 
  mockQAChecklists, 
  mockGatePasses,
  generateId,
  delay
} from './mockData';

type QueryParams = {
  select: string;
  eq?: { column: string; value: unknown };
  in?: { column: string; values: unknown[] };
  gte?: { column: string; value: string };
  order?: { column: string; ascending?: boolean };
  limit?: number;
};

function columnValue(row: object, column: string): unknown {
  return (row as Record<string, unknown>)[column];
}

// In-memory storage
let projects = [...mockProjects];
let employees = [...mockEmployees];
let purchaseOrders = [...mockPurchaseOrders];
let qaChecklists = [...mockQAChecklists];
let gatePasses = [...mockGatePasses];

// Mock Supabase client interface
export const mockSupabase = {
  from: (table: string) => ({
    select: (columns = '*') => {
      const queryBuilder = {
        _params: { select: columns } as QueryParams,
        _executed: false as boolean,
        _result: null as Promise<{ data: any; error: null }> | null,
        eq: function(column: string, value: any) {
          this._params.eq = { column, value };
          return this;
        },
        in: function(column: string, values: any[]) {
          this._params.in = { column, values };
          return this;
        },
        gte: function(column: string, value: any) {
          this._params.gte = { column, value };
          return this;
        },
        order: function(column: string, options?: { ascending?: boolean }) {
          this._params.order = { column, ...options };
          return this;
        },
        limit: function(count: number) {
          this._params.limit = count;
          return this;
        },
        single: function() {
          return mockQuery(table, { ...this._params, single: true });
        },
        then: function(onFulfilled: any, onRejected?: any) {
          if (!this._result) {
            this._result = mockQuery(table, { ...this._params });
          }
          return this._result.then(onFulfilled, onRejected);
        }
      };
      return queryBuilder;
    },
    insert: (data: any[]) => ({
      select: () => ({
        single: () => mockInsert(table, data, true)
      }),
      then: (callback: any) => mockInsert(table, data).then(callback)
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => mockUpdate(table, data, { column, value })
    }),
    delete: () => ({
      eq: (column: string, value: any) => mockDelete(table, { column, value })
    })
  })
};

async function mockQuery(table: string, options: any): Promise<{ data: any; error: null }> {
  await delay(100); // Simulate network delay

  let data: any[] = [];

  switch (table) {
    case 'projects':
      data = [...projects];
      break;
    case 'employees':
      data = [...employees];
      break;
    case 'purchase_orders':
      data = [...purchaseOrders];
      break;
    case 'po_items':
      data = purchaseOrders.flatMap(po => po.items);
      break;
    case 'qa_checklists':
      data = [...qaChecklists];
      break;
    case 'qa_items':
      data = qaChecklists.flatMap(checklist => checklist.items);
      break;
    case 'gate_passes':
      data = [...gatePasses];
      break;
    default:
      data = [];
  }

  // Apply filters
  if (options.eq) {
    data = data.filter(item => item[options.eq.column] === options.eq.value);
  }

  if (options.in) {
    data = data.filter(item => options.in.values.includes(item[options.in.column]));
  }

  if (options.gte) {
    data = data.filter(item => new Date(item[options.gte.column]) >= new Date(options.gte.value));
  }

  // Apply ordering
  if (options.order) {
    const { column, ascending = true } = options.order;
    data.sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];
      if (ascending) {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
  }

  // Apply limit
  if (options.limit) {
    data = data.slice(0, options.limit);
  }

  // Return single item if requested
  if (options.single) {
    return { data: data[0] || null, error: null };
  }

  return { data, error: null };
}

async function mockInsert(table: string, data: any[], returnSingle = false): Promise<{ data: any; error: null }> {
  await delay(100);

  const defaults = table === 'purchase_orders' ? { total_amount: 0 }
    : table === 'projects' ? { progress: 0 }
    : table === 'qa_items' ? { photo_urls: [] }
    : {};
  const newItems = data.map(item => ({
    ...defaults,
    ...item,
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  switch (table) {
    case 'projects':
      projects.push(...newItems);
      break;
    case 'employees':
      employees.push(...newItems);
      break;
    case 'purchase_orders':
      const newPOs = newItems.map(po => ({ ...po, items: [] }));
      purchaseOrders.push(...newPOs);
      break;
    case 'po_items':
      newItems.forEach(item => {
        const po = purchaseOrders.find(p => p.id === item.po_id);
        if (po) {
          po.items.push(item);
          // Update total amount
          po.total_amount = po.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
        }
      });
      break;
    case 'qa_checklists':
      const newChecklists = newItems.map(checklist => ({ ...checklist, items: [] }));
      qaChecklists.push(...newChecklists);
      break;
    case 'qa_items':
      newItems.forEach(item => {
        const checklist = qaChecklists.find(c => c.id === item.checklist_id);
        if (checklist) {
          checklist.items.push(item);
        }
      });
      break;
    case 'gate_passes':
      gatePasses.push(...newItems);
      break;
  }

  return { data: returnSingle ? newItems[0] : newItems, error: null };
}

async function mockUpdate(table: string, updateData: any, filter: { column: string; value: any }): Promise<{ data: any; error: null }> {
  await delay(100);

  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  switch (table) {
    case 'projects':
      const projectIndex = projects.findIndex(p => columnValue(p, filter.column) === filter.value);
      if (projectIndex !== -1) {
        projects[projectIndex] = { ...projects[projectIndex], ...updatedData };
      }
      break;
    case 'employees':
      const employeeIndex = employees.findIndex(e => columnValue(e, filter.column) === filter.value);
      if (employeeIndex !== -1) {
        employees[employeeIndex] = { ...employees[employeeIndex], ...updatedData };
      }
      break;
    case 'purchase_orders':
      const poIndex = purchaseOrders.findIndex(po => columnValue(po, filter.column) === filter.value);
      if (poIndex !== -1) {
        purchaseOrders[poIndex] = { ...purchaseOrders[poIndex], ...updatedData };
      }
      break;
    case 'qa_checklists':
      const checklistIndex = qaChecklists.findIndex(c => columnValue(c, filter.column) === filter.value);
      if (checklistIndex !== -1) {
        qaChecklists[checklistIndex] = { ...qaChecklists[checklistIndex], ...updatedData };
      }
      break;
    case 'qa_items':
      qaChecklists.forEach(checklist => {
        const itemIndex = checklist.items.findIndex(item => columnValue(item, filter.column) === filter.value);
        if (itemIndex !== -1) {
          checklist.items[itemIndex] = { ...checklist.items[itemIndex], ...updatedData };
        }
      });
      break;
    case 'gate_passes':
      const gatePassIndex = gatePasses.findIndex(gp => columnValue(gp, filter.column) === filter.value);
      if (gatePassIndex !== -1) {
        gatePasses[gatePassIndex] = { ...gatePasses[gatePassIndex], ...updatedData };
      }
      break;
  }

  return { data: null, error: null };
}

async function mockDelete(table: string, filter: { column: string; value: any }): Promise<{ data: any; error: null }> {
  await delay(100);

  switch (table) {
    case 'projects':
      projects = projects.filter(p => columnValue(p, filter.column) !== filter.value);
      break;
    case 'employees':
      employees = employees.filter(e => columnValue(e, filter.column) !== filter.value);
      break;
    case 'purchase_orders':
      purchaseOrders = purchaseOrders.filter(po => columnValue(po, filter.column) !== filter.value);
      break;
    case 'qa_checklists':
      qaChecklists = qaChecklists.filter(c => columnValue(c, filter.column) !== filter.value);
      break;
    case 'qa_items':
      qaChecklists.forEach(checklist => {
        checklist.items = checklist.items.filter(item => columnValue(item, filter.column) !== filter.value);
      });
      break;
    case 'gate_passes':
      gatePasses = gatePasses.filter(gp => columnValue(gp, filter.column) !== filter.value);
      break;
  }

  return { data: null, error: null };
}
