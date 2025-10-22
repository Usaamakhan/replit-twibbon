"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AdminLogsTable from "@/components/admin/AdminLogsTable";

export default function AdminLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    action: 'all',
    targetType: 'all',
    adminId: 'all',
    limit: 50,
  });

  const fetchAdminLogs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      
      const params = new URLSearchParams();
      if (filters.action !== 'all') params.append('action', filters.action);
      if (filters.targetType !== 'all') params.append('targetType', filters.targetType);
      if (filters.adminId !== 'all') params.append('adminId', filters.adminId);
      params.append('limit', filters.limit.toString());
      
      const response = await fetch(`/api/admin/logs?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin logs');
      }

      const data = await response.json();
      setLogs(data.data || []);
      setAdmins(data.admins || []);
    } catch (error) {
      console.error('Error fetching admin logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Load Admin Action Logs</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label htmlFor="action-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Action Type
            </label>
            <select
              id="action-filter"
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
            >
              <option value="all" className="text-gray-900">All Actions</option>
              <option value="dismissed" className="text-gray-900">Dismissed</option>
              <option value="warned" className="text-gray-900">Warned</option>
              <option value="removed" className="text-gray-900">Removed/Banned</option>
            </select>
          </div>

          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Target Type
            </label>
            <select
              id="type-filter"
              value={filters.targetType}
              onChange={(e) => setFilters({ ...filters, targetType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
            >
              <option value="all" className="text-gray-900">All Types</option>
              <option value="campaign" className="text-gray-900">Campaigns</option>
              <option value="user" className="text-gray-900">Users</option>
            </select>
          </div>

          <div>
            <label htmlFor="admin-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Admin
            </label>
            <select
              id="admin-filter"
              value={filters.adminId}
              onChange={(e) => setFilters({ ...filters, adminId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
            >
              <option value="all" className="text-gray-900">All Admins</option>
              {admins.map((admin) => (
                <option key={admin.uid} value={admin.uid} className="text-gray-900">
                  {admin.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="limit-input" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Logs
            </label>
            <input
              id="limit-input"
              type="number"
              min="1"
              max="200"
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) || 50 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
              placeholder="50"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchAdminLogs}
              disabled={loading || !user}
              className="w-full px-6 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                'Load Logs'
              )}
            </button>
          </div>
        </div>
        {logs.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-semibold">{logs.length}</span> log{logs.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <AdminLogsTable
        logs={logs}
        loading={loading}
      />
    </div>
  );
}
