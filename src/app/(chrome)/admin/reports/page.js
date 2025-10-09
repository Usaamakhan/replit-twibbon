"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import ReportsTable from "@/components/admin/ReportsTable";
import ReportDetailsPanel from "@/components/admin/ReportDetailsPanel";

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    reason: 'all',
    type: 'all',
  });

  const fetchReports = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.reason !== 'all') params.append('reason', filters.reason);
      if (filters.type !== 'all') params.append('type', filters.type);
      
      const response = await fetch(`/api/admin/reports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      setReports(data.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user, filters]);

  const handleSelectReport = (report) => {
    setSelectedReport(report);
  };

  const handleClosePanel = () => {
    setSelectedReport(null);
  };

  const handleReportUpdate = (updatedReport) => {
    setReports(prevReports =>
      prevReports.map(report =>
        report.id === updatedReport.id ? { ...report, ...updatedReport } : report
      )
    );
    setSelectedReport(null);
    fetchReports();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              id="type-filter"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
            >
              <option value="all" className="text-gray-900">All Types</option>
              <option value="campaign" className="text-gray-900">Campaign Reports</option>
              <option value="profile" className="text-gray-900">Profile Reports</option>
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
              <option value="all" className="text-gray-900">All Statuses</option>
              <option value="pending" className="text-gray-900">Pending</option>
              <option value="reviewed" className="text-gray-900">Reviewed</option>
              <option value="resolved" className="text-gray-900">Resolved</option>
              <option value="dismissed" className="text-gray-900">Dismissed</option>
            </select>
          </div>

          <div>
            <label htmlFor="reason-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <select
              id="reason-filter"
              value={filters.reason}
              onChange={(e) => setFilters({ ...filters, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
            >
              <option value="all" className="text-gray-900">All Reasons</option>
              <option value="inappropriate" className="text-gray-900">Inappropriate Content</option>
              <option value="spam" className="text-gray-900">Spam</option>
              <option value="copyright" className="text-gray-900">Copyright Violation</option>
              <option value="inappropriate_avatar" className="text-gray-900">Inappropriate Avatar</option>
              <option value="offensive_username" className="text-gray-900">Offensive Username</option>
              <option value="spam_bio" className="text-gray-900">Spam Bio</option>
              <option value="impersonation" className="text-gray-900">Impersonation</option>
              <option value="other" className="text-gray-900">Other</option>
            </select>
          </div>
        </div>
      </div>

      <ReportsTable
        reports={reports}
        loading={loading}
        onSelectReport={handleSelectReport}
      />

      {selectedReport && (
        <ReportDetailsPanel
          report={selectedReport}
          onClose={handleClosePanel}
          onUpdate={handleReportUpdate}
        />
      )}
    </div>
  );
}
