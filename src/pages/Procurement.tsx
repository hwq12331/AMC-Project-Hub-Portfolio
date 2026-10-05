import React, { useState, useEffect } from 'react';
import { Package, Truck, Clock, Plus, DollarSign } from 'lucide-react';
import { cn } from '../utils/cn';
import { supabase } from '../lib/supabase';
import type { PurchaseOrder, POItem } from '../types';

export function Procurement() {
  const [purchaseOrders, setPurchaseOrders] = useState<(PurchaseOrder & { items: POItem[] })[]>([]);
  const [showNewPO, setShowNewPO] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    projectId: '',
    supplierId: '',
    items: [{ name: '', quantity: 1, unitPrice: 0 }],
  });

  useEffect(() => {
    fetchPurchaseOrders();
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name');
      
      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    }
  }

  async function fetchPurchaseOrders() {
    try {
      // Fetch purchase orders
      const { data: pos, error: posError } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (posError) throw posError;

      // Fetch items for each PO
      const posWithItems = await Promise.all(
        (pos || []).map(async (po) => {
          const { data: items, error: itemsError } = await supabase
            .from('po_items')
            .select('*')
            .eq('po_id', po.id);

          if (itemsError) throw itemsError;

          return {
            ...po,
            items: items || [],
          };
        })
      );

      setPurchaseOrders(posWithItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, unitPrice: 0 }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index: number, field: keyof typeof formData.items[0], value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId) {
      setError('Please select a project');
      return;
    }

    try {
      // Create purchase order
      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .insert([{
          project_id: formData.projectId, // Now this will be a valid UUID from the select dropdown
          supplier_id: formData.supplierId,
          status: 'requested',
          date: new Date().toISOString().split('T')[0],
        }])
        .select()
        .single();

      if (poError) throw poError;

      // Create PO items
      const { error: itemsError } = await supabase
        .from('po_items')
        .insert(
          formData.items.map(item => ({
            po_id: po.id,
            name: item.name,
            quantity: item.quantity,
            unit_price: item.unitPrice,
          }))
        );

      if (itemsError) throw itemsError;

      // Reset form and refresh data
      setFormData({
        projectId: '',
        supplierId: '',
        items: [{ name: '', quantity: 1, unitPrice: 0 }],
      });
      setShowNewPO(false);
      await fetchPurchaseOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create purchase order');
    }
  };

  const updateStatus = async (poId: string, newStatus: PurchaseOrder['status']) => {
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .update({ status: newStatus })
        .eq('id', poId);

      if (error) throw error;

      await fetchPurchaseOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const deletePurchaseOrder = async (poId: string) => {
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', poId);

      if (error) throw error;

      await fetchPurchaseOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete purchase order');
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Procurement & Inventory
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage purchase orders and track inventory levels
          </p>
        </div>
        <button
          onClick={() => setShowNewPO(true)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="mr-2 h-4 w-4 inline" />
          New Purchase Order
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {showNewPO && (
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Create New Purchase Order</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Project</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Supplier ID</label>
                <input
                  type="text"
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Items</h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100"
                >
                  Add Item
                </button>
              </div>
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-4">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      placeholder="Item name"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      placeholder="Quantity"
                      min="1"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                      placeholder="Unit price"
                      min="0"
                      step="0.01"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 pl-8 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                      required
                    />
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="absolute -right-8 top-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewPO(false)}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Create PO
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6">
        {purchaseOrders.map((po) => (
          <div
            key={po.id}
            className="rounded-lg bg-white p-6 shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-gray-900">PO-{po.id.split('-')[0]}</h2>
                <p className="mt-1 text-sm text-gray-500">Project ID: {po.project_id}</p>
              </div>
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium',
                  {
                    'bg-green-100 text-green-800': po.status === 'received',
                    'bg-yellow-100 text-yellow-800': po.status === 'ordered',
                    'bg-gray-100 text-gray-800': po.status === 'requested',
                  }
                )}
              >
                {po.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center text-sm text-gray-500">
                <Package className="mr-1.5 h-4 w-4" />
                Supplier ID: {po.supplier_id}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="mr-1.5 h-4 w-4" />
                {new Date(po.date).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Truck className="mr-1.5 h-4 w-4" />
                {po.items.length} items
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Items</h3>
              <ul className="mt-2 divide-y divide-gray-200">
                {po.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center">
                      <span className="text-sm text-gray-700">{item.name}</span>
                      <span className="ml-4 text-sm text-gray-500">
                        Qty: {item.quantity}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {item.unit_price.toLocaleString()} SAR
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <span className="text-sm text-gray-500">Total Amount</span>
              <span className="text-lg font-medium text-gray-900">
                {po.total_amount.toLocaleString()} SAR
              </span>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              {po.status === 'requested' && (
                <>
                  <button
                    onClick={() => deletePurchaseOrder(po.id)}
                    className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => updateStatus(po.id, 'ordered')}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Place Order
                  </button>
                </>
              )}
              {po.status === 'ordered' && (
                <button
                  onClick={() => updateStatus(po.id, 'received')}
                  className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Mark as Received
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}