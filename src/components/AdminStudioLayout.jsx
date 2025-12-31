import React, { useMemo } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminStudioLayout() {
  const { isAdmin } = useAdmin();
  const location = useLocation();

  const redirectTo = useMemo(() => {
    const path = `${location.pathname}${location.search || ''}${location.hash || ''}`;
    return `/admin-login?next=${encodeURIComponent(path)}`;
  }, [location.pathname, location.search, location.hash]);

  if (!isAdmin) return <Navigate to={redirectTo} replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen flex flex-col">
        <div className="mb-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Studio</h1>
                <p className="text-gray-600 text-sm">Eines de gestió i configuració</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
