import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Clock, Truck } from 'lucide-react';
import { cn } from '../utils/cn';
import { supabase } from '../lib/supabase';
import type { GatePass } from '../types';

export function GatePass() {
  const [showNewPass, setShowNewPass] = useState(false);
  const [passes, setPasses] = useState<GatePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    visitorName: '',
    company: '',
    purpose: '',
    contactPerson: '',
    idNumber: '',
    vehicleNumber: '',
    type: 'visitor' as GatePass['type'],
    items: '',
  });

  useEffect(() => {
    fetchGatePasses();
  }, []);

  async function fetchGatePasses() {
    try {
      const { data, error } = await supabase
        .from('gate_passes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPasses(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newPass = {
        visitor_name: formData.visitorName,
        company: formData.company,
        purpose: formData.purpose,
        contact_person: formData.contactPerson,
        id_number: formData.idNumber,
        vehicle_number: formData.vehicleNumber || null,
        check_in: new Date().toISOString(),
        type: formData.type,
        status: 'active',
        items: formData.items ? formData.items.split(',').map(item => item.trim()) : null,
      };

      const { error } = await supabase
        .from('gate_passes')
        .insert([newPass]);

      if (error) {
        throw error;
      }

      // Refresh the list
      await fetchGatePasses();

      setFormData({
        visitorName: '',
        company: '',
        purpose: '',
        contactPerson: '',
        idNumber: '',
        vehicleNumber: '',
        type: 'visitor',
        items: '',
      });
      setShowNewPass(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gate pass');
    }
  };

  const handleCheckOut = async (passId: string) => {
    try {
      const { error } = await supabase
        .from('gate_passes')
        .update({
          status: 'completed',
          check_out: new Date().toISOString(),
        })
        .eq('id', passId);

      if (error) {
        throw error;
      }

      await fetchGatePasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check out');
    }
  };

  const handleCancel = async (passId: string) => {
    try {
      const { error } = await supabase
        .from('gate_passes')
        .update({
          status: 'cancelled',
        })
        .eq('id', passId);

      if (error) {
        throw error;
      }

      await fetchGatePasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel gate pass');
    }
  };

  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  const filteredPasses = passes.filter(pass => 
    filterStatus === 'all' ? true : pass.status === filterStatus
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 mb-4">
        <div className="flex">
          <div className="text-sm text-red-700">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gate Pass System</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage visitor and contractor access
          </p>
        </div>
        <button
          onClick={() => setShowNewPass(true)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          New Gate Pass
        </button>
      </div>

      <div className="mb-6 flex space-x-2">
        {(['all', 'active', 'completed', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium',
              filterStatus === status
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-white text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300'
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {showNewPass && (
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Create New Gate Pass</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Visitor Name</label>
              <input
                type="text"
                value={formData.visitorName}
                onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Purpose</label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ID Number</label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'visitor' | 'contractor' | 'delivery' })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                <option value="visitor">Visitor</option>
                <option value="contractor">Contractor</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Items Carried</label>
              <input
                type="text"
                value={formData.items}
                onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                placeholder="Comma-separated list of items"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewPass(false)}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Create Pass
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6">
        {filteredPasses.map((pass) => (
          <div
            key={pass.id}
            className="rounded-lg bg-white p-6 shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-gray-900">
                  {pass.visitor_name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{pass.company}</p>
              </div>
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium',
                  {
                    'bg-green-100 text-green-800': pass.status === 'completed',
                    'bg-yellow-100 text-yellow-800': pass.status === 'active',
                    'bg-red-100 text-red-800': pass.status === 'cancelled',
                  }
                )}
              >
                {pass.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center text-sm text-gray-500">
                <Users className="mr-1.5 h-4 w-4" />
                Contact: {pass.contact_person}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="mr-1.5 h-4 w-4" />
                In: {new Date(pass.check_in).toLocaleString()}
              </div>
              {pass.check_out && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="mr-1.5 h-4 w-4" />
                  Out: {new Date(pass.check_out).toLocaleString()}
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center text-sm text-gray-500">
                <UserPlus className="mr-1.5 h-4 w-4" />
                Purpose: {pass.purpose}
              </div>
              {pass.vehicle_number && (
                <div className="flex items-center text-sm text-gray-500">
                  <Truck className="mr-1.5 h-4 w-4" />
                  Vehicle: {pass.vehicle_number}
                </div>
              )}
            </div>

            {pass.items && pass.items.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Items Carried</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {pass.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {pass.status === 'active' && (
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  onClick={() => handleCancel(pass.id)}
                  className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300"
                >
                  Cancel Pass
                </button>
                <button 
                  onClick={() => handleCheckOut(pass.id)}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Check Out
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
