import React, { useState, useEffect } from 'react';
import { GraduationCap, Shield, Plus, Calendar } from 'lucide-react';
import { cn } from '../utils/cn';
import { supabase } from '../lib/supabase';
import type { Employee } from '../types';

const departments = [
  'Engineering',
  'Technical',
  'Operations',
  'Quality',
  'Safety',
  'Administration',
];

export function HR() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showNewEmployee, setShowNewEmployee] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: 'Engineering',
    certifications: '',
    join_date: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setEmployees(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newEmployee = {
        name: formData.name,
        role: formData.role,
        department: formData.department,
        certifications: formData.certifications.split(',').map(cert => cert.trim()),
        join_date: formData.join_date,
      };

      const { error } = await supabase
        .from('employees')
        .insert([newEmployee]);

      if (error) {
        throw error;
      }

      await fetchEmployees();

      setFormData({
        name: '',
        role: '',
        department: 'Engineering',
        certifications: '',
        join_date: '',
      });
      setShowNewEmployee(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create employee');
    }
  };

  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  const filteredEmployees = employees.filter(employee =>
    filterDepartment === 'all' ? true : employee.department === filterDepartment
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
          <h1 className="text-2xl font-semibold text-gray-900">HR & Safety</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage employees, certifications, and safety records
          </p>
        </div>
        <button
          onClick={() => setShowNewEmployee(true)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="mr-2 h-4 w-4 inline" />
          Add Employee
        </button>
      </div>

      <div className="mb-6 flex space-x-2">
        <button
          onClick={() => setFilterDepartment('all')}
          className={cn(
            'rounded-md px-3 py-2 text-sm font-medium',
            filterDepartment === 'all'
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-white text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300'
          )}
        >
          All
        </button>
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setFilterDepartment(dept)}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium',
              filterDepartment === dept
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-white text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300'
            )}
          >
            {dept}
          </button>
        ))}
      </div>

      {showNewEmployee && (
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Add New Employee</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Join Date</label>
              <input
                type="date"
                value={formData.join_date}
                onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Certifications</label>
              <input
                type="text"
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                placeholder="Comma-separated list of certifications"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewEmployee(false)}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Add Employee
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6">
        {filteredEmployees.map((employee) => (
          <div
            key={employee.id}
            className="rounded-lg bg-white p-6 shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-gray-900">
                  {employee.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{employee.role}</p>
              </div>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
                {employee.department}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="mr-1.5 h-4 w-4" />
                Joined {new Date(employee.join_date).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Shield className="mr-1.5 h-4 w-4" />
                Safety Compliant
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <GraduationCap className="mr-1.5 h-4 w-4" />
                {employee.certifications.length} Certifications
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Certifications</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {employee.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
