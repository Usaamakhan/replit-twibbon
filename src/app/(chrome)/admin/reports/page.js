"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import GroupedReportsTable from "@/components/admin/GroupedReportsTable";
import ReportDetailsPanel from "@/components/admin/ReportDetailsPanel";

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [filters, setFilters] = useState({
    targetType: 'all',
    status: 'pending',
    sortBy: 'reportCount',
  });

  const fetchGroupedReports = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      
      const params = new URLSearchParams();
      if (filters.targetType !== 'all') params.append('targetType', filters.targetType);
      if (filters.status !== 'all') params.append('status', filters.status);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', 'desc');
      params.append('limit', '10');
      
      const response = await fetch(`/api/admin/reports/grouped?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch grouped reports');
      }

      const data = await response.json();
      setSummaries(data.data || []);
    } catch (error) {
      console.error('Error fetching grouped reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGroupedReports();
    }
  }, [user, filters]);

  const handleSelectSummary = (summary) => {
    setSelectedSummary(summary);
  };

  const handleClosePanel = () => {
    setSelectedSummary(null);
  };

  const handleActionComplete = () => {
    setSelectedSummary(null);
    fetchGroupedReports(); // Refresh to show next batch
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Grouped Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
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
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
            >
              <option value="all" className="text-gray-900">All</option>
              <option value="pending" className="text-gray-900">Pending</option>
              <option value="resolved" className="text-gray-900">Resolved</option>
              <option value="dismissed" className="text-gray-900">Dismissed</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              id="sort-filter"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
            >
              <option value="lastReportedAt" className="text-gray-900">Most Recent</option>
              <option value="reportCount" className="text-gray-900">Top Reported</option>
              <option value="firstReportedAt" className="text-gray-900">Oldest Pending</option>
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing <span className="font-semibold">{summaries.length}</span> grouped reports (max 10 per page)
        </div>
      </div>

      <GroupedReportsTable
        summaries={summaries}
        loading={loading}
        onSelectSummary={handleSelectSummary}
        onRefresh={fetchGroupedReports}
      />

      {selectedSummary && (
        <ReportDetailsPanel
          report={selectedSummary}
          onClose={handleClosePanel}
          onUpdate={handleActionComplete}
          isGrouped={true}
        />
      )}
    </div>
  );
}
