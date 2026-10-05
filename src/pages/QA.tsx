import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Plus, AlertTriangle, FileText, Filter, Tag, Building, Trash2, CreditCard as Edit, MinusCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import { Dialog } from '../components/Dialog';
import { supabase } from '../lib/supabase';
import { useQAStore } from '../stores/qa';
import type { ChecklistItem } from '../types';

export function QA() {
  const {
    checklists,
    loading,
    error,
    fetchChecklists,
    updateChecklist,
    deleteChecklist,
    updateItem,
    deleteItem
  } = useQAStore();

  const [showNewChecklist, setShowNewChecklist] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [filters, setFilters] = useState({
    category: 'all',
    department: 'all',
    riskLevel: 'all',
    priority: 'all',
    status: 'all',
  });

  const [formData, setFormData] = useState({
    projectId: '',
    name: '',
    category: 'general' as const,
    department: 'quality' as const,
    dueDate: '',
    assignedTo: '',
    items: [{ 
      description: '',
      category: 'general' as const,
      riskLevel: 'medium' as const,
      priority: 'medium' as const,
      dueDate: '',
      assignedTo: '',
      complianceRef: '',
      comments: ''
    }],
  });

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          category: 'general',
          riskLevel: 'medium',
          priority: 'medium',
          dueDate: '',
          assignedTo: '',
          complianceRef: '',
          comments: ''
        }
      ]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create the checklist first
      const { data: newChecklist, error: checklistError } = await supabase
        .from('qa_checklists')
        .insert([{
          name: formData.name,
          category: formData.category,
          department: formData.department,
          status: 'pending',
          date: new Date().toISOString().split('T')[0],
          due_date: formData.dueDate || null,
          assigned_to: formData.assignedTo || null,
          project_id: formData.projectId || null,
          template: false
        }])
        .select()
        .single();

      if (checklistError) throw checklistError;

      // Create all items for the checklist
      const items = formData.items.map(item => ({
        checklist_id: newChecklist.id,
        description: item.description,
        category: item.category,
        risk_level: item.riskLevel,
        priority: item.priority,
        status: 'pending',
        due_date: item.dueDate || null,
        assigned_to: item.assignedTo || null,
        compliance_ref: item.complianceRef || null,
        comments: item.comments || null
      }));

      const { error: itemsError } = await supabase
        .from('qa_items')
        .insert(items);

      if (itemsError) throw itemsError;

      // Reset form and close dialog
      setFormData({
        projectId: '',
        name: '',
        category: 'general',
        department: 'quality',
        dueDate: '',
        assignedTo: '',
        items: [{
          description: '',
          category: 'general',
          riskLevel: 'medium',
          priority: 'medium',
          dueDate: '',
          assignedTo: '',
          complianceRef: '',
          comments: ''
        }]
      });
      setShowNewChecklist(false);

      // Refresh the checklists
      await fetchChecklists();
    } catch (err) {
      console.error('Failed to create checklist:', err);
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await updateItem(selectedItem.id, {
        description: selectedItem.description,
        category: selectedItem.category,
        risk_level: selectedItem.risk_level,
        priority: selectedItem.priority,
        status: selectedItem.status,
        due_date: selectedItem.due_date,
        assigned_to: selectedItem.assigned_to,
        compliance_ref: selectedItem.compliance_ref,
        comments: selectedItem.comments
      });

      setShowEditItem(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  const handleDeleteChecklist = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this checklist?')) {
      await deleteChecklist(id);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteItem(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">QA/QC</h1>
          <p className="mt-2 text-sm text-gray-700">
            Quality assurance checklists and inspection reports
          </p>
        </div>
        <button
          onClick={() => setShowNewChecklist(true)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="mr-2 h-4 w-4 inline" />
          New Checklist
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="rounded-md border-gray-300 text-sm"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="safety">Safety</option>
            <option value="environmental">Environmental</option>
            <option value="technical">Technical</option>
            <option value="regulatory">Regulatory</option>
          </select>
          {/* Add other filter dropdowns */}
        </div>
      </div>

      {/* Create Checklist Dialog */}
      <Dialog
        isOpen={showNewChecklist}
        onClose={() => setShowNewChecklist(false)}
        title="Create New Checklist"
      >
        <form onSubmit={handleCreateChecklist} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="general">General</option>
                <option value="safety">Safety</option>
                <option value="environmental">Environmental</option>
                <option value="technical">Technical</option>
                <option value="regulatory">Regulatory</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value as any })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="quality">Quality</option>
                <option value="safety">Safety</option>
                <option value="engineering">Engineering</option>
                <option value="operations">Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">Checklist Items</h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100"
              >
                <Plus className="h-4 w-4 inline mr-1" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="relative border border-gray-200 rounded-lg p-4">
                  <div className="absolute right-2 top-2">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <MinusCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Risk Level</label>
                        <select
                          value={item.riskLevel}
                          onChange={(e) => handleItemChange(index, 'riskLevel', e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                        <select
                          value={item.priority}
                          onChange={(e) => handleItemChange(index, 'priority', e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Compliance Reference</label>
                      <input
                        type="text"
                        value={item.complianceRef}
                        onChange={(e) => handleItemChange(index, 'complianceRef', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        placeholder="e.g., ISO 9001:2015 8.5.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Comments</label>
                      <textarea
                        value={item.comments}
                        onChange={(e) => handleItemChange(index, 'comments', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowNewChecklist(false)}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Create Checklist
            </button>
          </div>
        </form>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog
        isOpen={showEditItem}
        onClose={() => setShowEditItem(false)}
        title="Edit Item"
      >
        {selectedItem && (
          <form onSubmit={handleUpdateItem} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={selectedItem.description}
                onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={selectedItem.category}
                onChange={(e) => setSelectedItem({ ...selectedItem, category: e.target.value as any })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="general">General</option>
                <option value="safety">Safety</option>
                <option value="environmental">Environmental</option>
                <option value="technical">Technical</option>
                <option value="regulatory">Regulatory</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Risk Level</label>
              <select
                value={selectedItem.risk_level}
                onChange={(e) => setSelectedItem({ ...selectedItem, risk_level: e.target.value as any })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={selectedItem.priority}
                onChange={(e) => setSelectedItem({ ...selectedItem, priority: e.target.value as any })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={selectedItem.status}
                onChange={(e) => setSelectedItem({ ...selectedItem, status: e.target.value as any })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="pending">Pending</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Comments</label>
              <textarea
                value={selectedItem.comments || ''}
                onChange={(e) => setSelectedItem({ ...selectedItem, comments: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowEditItem(false)}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Dialog>

      {/* Checklists Grid */}
      <div className="grid gap-6">
        {checklists.map((checklist) => (
          <div
            key={checklist.id}
            className="rounded-lg bg-white p-6 shadow"
          >
            {/* Checklist header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-gray-900">
                  {checklist.name}
                </h2>
                <div className="mt-1 flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{checklist.category}</span>
                  <Building className="h-4 w-4 text-gray-400 ml-2" />
                  <span className="text-sm text-gray-500">{checklist.department}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDeleteChecklist(checklist.id)}
                  className="rounded-full p-2 hover:bg-red-50 text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-sm font-medium',
                    {
                      'bg-green-100 text-green-800': checklist.status === 'completed',
                      'bg-yellow-100 text-yellow-800': checklist.status === 'in-progress',
                      'bg-gray-100 text-gray-800': checklist.status === 'pending',
                    }
                  )}
                >
                  {checklist.status}
                </span>
              </div>
            </div>

            {/* Checklist items */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Items</h3>
              <ul className="mt-2 divide-y divide-gray-200">
                {checklist.items.map((item) => (
                  <li
                    key={item.id}
                    className="py-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {item.status === 'passed' && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        )}
                        {item.status === 'failed' && (
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        )}
                        {item.status === 'pending' && (
                          <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.description}
                          </p>
                          <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                            <span className={cn(
                              'rounded-full px-2 py-0.5',
                              {
                                'bg-red-100 text-red-800': item.risk_level === 'critical',
                                'bg-orange-100 text-orange-800': item.risk_level === 'high',
                                'bg-yellow-100 text-yellow-800': item.risk_level === 'medium',
                                'bg-green-100 text-green-800': item.risk_level === 'low',
                              }
                            )}>
                              {item.risk_level}
                            </span>
                            <span>|</span>
                            <span className={cn(
                              'rounded-full px-2 py-0.5',
                              {
                                'bg-red-100 text-red-800': item.priority === 'urgent',
                                'bg-orange-100 text-orange-800': item.priority === 'high',
                                'bg-yellow-100 text-yellow-800': item.priority === 'medium',
                                'bg-green-100 text-green-800': item.priority === 'low',
                              }
                            )}>
                              {item.priority}
                            </span>
                            {item.compliance_ref && (
                              <>
                                <span>|</span>
                                <span className="flex items-center">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {item.compliance_ref}
                                </span>
                              </>
                            )}
                          </div>
                          {item.comments && (
                            <p className="mt-1 text-sm text-gray-500">
                              {item.comments}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowEditItem(true);
                          }}
                          className="rounded-full p-2 hover:bg-gray-100 text-gray-400"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="rounded-full p-2 hover:bg-red-50 text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            {checklist.status !== 'completed' && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => handleDeleteChecklist(checklist.id)}
                  className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                >
                  Delete
                </button>
                <button
                  onClick={() => updateChecklist(checklist.id, { status: 'completed' })}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Complete Checklist
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
