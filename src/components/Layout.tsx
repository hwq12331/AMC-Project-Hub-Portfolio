import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isDemoMode } from '../lib/supabase';

export function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className={`relative transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <Sidebar isCollapsed={isCollapsed} />
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-16 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-gray-50"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>
      <main className="flex-1 overflow-auto p-8">
        {isDemoMode && (
          <div className="mb-6 rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-800" role="status">
            Portfolio demo · Sample data · Changes reset when you refresh.
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
