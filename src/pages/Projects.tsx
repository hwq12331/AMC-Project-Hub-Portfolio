import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Plus, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import { supabase } from '../lib/supabase';
import type { Project } from '../types';

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    location: '',
    start_date: '',
    end_date: '',
    status: 'planned' as Project['status'],
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newProject = {
        ...formData,
        progress: 0,
      };

      const { error } = await supabase
        .from('projects')
        .insert([newProject]);

      if (error) {
        throw error;
      }

      await fetchProjects();

      setFormData({
        name: '',
        client: '',
        location: '',
        start_date: '',
        end_date: '',
        status: 'planned',
      });
      setShowNewProject(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const updateProgress = async (projectId: string, newProgress: number) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      const progress = Math.min(100, Math.max(0, newProgress));
      let status = project.status;

      // Automatically update status based on progress
      if (progress === 100 && status === 'in-progress') {
        status = 'completed';
      }

      const { error } = await supabase
        .from('projects')
        .update({ 
          progress,
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) {
        throw error;
      }

      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
    }
  };

  const updateStatus = async (projectId: string, newStatus: Project['status']) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      // Validate status transitions
      const validTransitions: Record<Project['status'], Project['status'][]> = {
        'planned': ['in-progress', 'on-hold'],
        'in-progress': ['completed', 'on-hold'],
        'completed': [],
        'on-hold': ['in-progress']
      };

      if (!validTransitions[project.status].includes(newStatus)) {
        throw new Error(`Invalid status transition from ${project.status} to ${newStatus}`);
      }

      // Reset progress when moving back to in-progress from on-hold
      const progress = newStatus === 'in-progress' && project.status === 'on-hold' 
        ? project.progress 
        : project.progress;

      const { error } = await supabase
        .from('projects')
        .update({ 
          status: newStatus,
          progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) {
        throw error;
      }

      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
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
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and track all ongoing and upcoming projects
          </p>
        </div>
        <button
          onClick={() => setShowNewProject(true)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="mr-2 h-4 w-4 inline" />
          New Project
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {showNewProject && (
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Create New Project</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'planned' | 'in-progress' | 'completed' | 'on-hold' })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>
            <div className="sm:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewProject(false)}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-lg bg-white p-6 shadow"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-gray-900">
                {project.name}
              </h2>
              <div className="flex items-center space-x-2">
                {project.status !== 'completed' && (
                  <select
                    value={project.status}
                    onChange={(e) => updateStatus(project.id, e.target.value as Project['status'])}
                    className={cn(
                      'rounded-md px-3 py-1 text-sm font-medium border',
                      {
                        'bg-gray-100 text-gray-800 border-gray-300': project.status === 'planned',
                        'bg-yellow-100 text-yellow-800 border-yellow-300': project.status === 'in-progress',
                        'bg-red-100 text-red-800 border-red-300': project.status === 'on-hold',
                      }
                    )}
                  >
                    <option value="planned" disabled={project.status !== 'planned'}>Planned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                )}
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-sm font-medium',
                    {
                      'bg-green-100 text-green-800': project.status === 'completed',
                      'bg-yellow-100 text-yellow-800': project.status === 'in-progress',
                      'bg-gray-100 text-gray-800': project.status === 'planned',
                      'bg-red-100 text-red-800': project.status === 'on-hold',
                    }
                  )}
                >
                  {project.status.replace('-', ' ')}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center text-sm text-gray-500">
                <Users className="mr-1.5 h-4 w-4" />
                {project.client}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="mr-1.5 h-4 w-4" />
                {project.location}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="mr-1.5 h-4 w-4" />
                {new Date(project.start_date).toLocaleDateString()} -{' '}
                {new Date(project.end_date).toLocaleDateString()}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Progress</span>
                {project.status !== 'completed' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateProgress(project.id, project.progress - 5)}
                      className="rounded-md bg-gray-100 px-2 py-1 text-gray-600 hover:bg-gray-200"
                      disabled={project.status !== 'in-progress'}
                    >
                      -5%
                    </button>
                    <span className="font-medium text-indigo-600 w-12 text-center">
                      {project.progress}%
                    </span>
                    <button
                      onClick={() => updateProgress(project.id, project.progress + 5)}
                      className="rounded-md bg-gray-100 px-2 py-1 text-gray-600 hover:bg-gray-200"
                      disabled={project.status !== 'in-progress'}
                    >
                      +5%
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-200">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    {
                      "bg-green-600": project.status === 'completed',
                      "bg-yellow-600": project.status === 'in-progress',
                      "bg-gray-400": project.status === 'planned',
                      "bg-red-600": project.status === 'on-hold',
                    }
                  )}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
