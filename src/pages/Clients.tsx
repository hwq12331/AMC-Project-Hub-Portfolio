import React, { useState } from 'react';
import { Building2, MapPin, Phone, Mail, Plus } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  industry: string;
  location: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  activeProjects: number;
}

const initialClients: Client[] = [
  {
    id: '1',
    name: 'Saudi Aramco',
    industry: 'Oil & Gas',
    location: 'Dhahran',
    contact: {
      name: 'Abdullah Al-Rashid',
      email: 'a.rashid@aramco.com',
      phone: '+966 13 872 0115',
    },
    activeProjects: 2,
  },
  {
    id: '2',
    name: 'SABIC',
    industry: 'Petrochemicals',
    location: 'Jubail',
    contact: {
      name: 'Fahad Al-Otaibi',
      email: 'f.otaibi@sabic.com',
      phone: '+966 13 351 9988',
    },
    activeProjects: 1,
  },
];

const industries = [
  'Oil & Gas',
  'Petrochemicals',
  'Manufacturing',
  'Construction',
  'Power Generation',
  'Mining',
];

export function Clients() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [showNewClient, setShowNewClient] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: 'Oil & Gas',
    location: '',
    contact: {
      name: '',
      email: '',
      phone: '',
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: String(clients.length + 1),
      ...formData,
      activeProjects: 0,
    };
    setClients(prev => [...prev, newClient]);
    setFormData({
      name: '',
      industry: 'Oil & Gas',
      location: '',
      contact: {
        name: '',
        email: '',
        phone: '',
      },
    });
    setShowNewClient(false);
  };

  const [filterIndustry, setFilterIndustry] = useState<string>('all');

  const filteredClients = clients.filter(client =>
    filterIndustry === 'all' ? true : client.industry === filterIndustry
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage client information and relationships
          </p>
        </div>
        <button
          onClick={() => setShowNewClient(true)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="mr-2 h-4 w-4 inline" />
          Add Client
        </button>
      </div>

      <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterIndustry('all')}
          className={`rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap ${
            filterIndustry === 'all'
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-white text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300'
          }`}
        >
          All Industries
        </button>
        {industries.map((industry) => (
          <button
            key={industry}
            onClick={() => setFilterIndustry(industry)}
            className={`rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap ${
              filterIndustry === industry
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-white text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300'
            }`}
          >
            {industry}
          </button>
        ))}
      </div>

      {showNewClient && (
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Add New Client</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Industry</label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
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
              <label className="block text-sm font-medium text-gray-700">Contact Person</label>
              <input
                type="text"
                value={formData.contact.name}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, name: e.target.value },
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.contact.email}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, email: e.target.value },
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={formData.contact.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, phone: e.target.value },
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>
            <div className="sm:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewClient(false)}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Add Client
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="rounded-lg bg-white p-6 shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-gray-900">
                  {client.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{client.industry}</p>
              </div>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
                {client.activeProjects} Active Projects
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center text-sm text-gray-500">
                <Building2 className="mr-1.5 h-4 w-4" />
                Contact: {client.contact.name}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="mr-1.5 h-4 w-4" />
                {client.location}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Phone className="mr-1.5 h-4 w-4" />
                {client.contact.phone}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Mail className="mr-1.5 h-4 w-4" />
                {client.contact.email}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300">
                View Projects
              </button>
              <button className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300">
                Contact History
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}