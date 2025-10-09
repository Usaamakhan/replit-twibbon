"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function ReportDetailsPanel({ report, onClose, onUpdate }) {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonText = (reason) => {
    switch (reason) {
      case 'inappropriate':
        return 'Inappropriate Content';
      case 'spam':
        return 'Spam';
      case 'copyright':
        return 'Copyright Violation';
      case 'inappropriate_avatar':
        return 'Inappropriate Profile Picture';
      case 'offensive_username':
        return 'Offensive Username';
      case 'spam_bio':
        return 'Spam in Bio';
      case 'impersonation':
        return 'Impersonation';
      case 'other':
        return 'Other';
      default:
        return reason;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  const handleAction = async (status, action) => {
    if (!user) return;

    console.log('[CLIENT] Action button clicked:', { status, action, reportId: report.id });
    setIsUpdating(true);
    setUpdateError(null);

    try {
      const token = await user.getIdToken();
      console.log('[CLIENT] Token obtained, sending request...');
      
      const response = await fetch(`/api/admin/reports/${report.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, action }),
      });

      console.log('[CLIENT] Response status:', response.status);
      const data = await response.json();
      console.log('[CLIENT] Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update report');
      }

      // Show success message
      console.log('[CLIENT] ✅ Action completed successfully!');
      alert(`✅ Action completed successfully! ${action === 'no-action' ? 'Report dismissed' : action === 'warned' ? 'Warning issued' : 'Content removed'}`);

      if (onUpdate) {
        onUpdate(data.data);
      }
    } catch (error) {
      console.error('[CLIENT] ❌ Error updating report:', error);
      console.error('[CLIENT] Error details:', error.message);
      setUpdateError(error.message);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
      
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
            <div className="px-6 py-4 bg-emerald-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-white">Report Details</h2>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 px-6 py-6 space-y-6">
              {updateError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {updateError}
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
              </div>

              {report.type === 'profile' ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Reported User</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {report.reportedUser?.avatarUrl && (
                      <img
                        src={report.reportedUser.avatarUrl}
                        alt={report.reportedUser.displayName}
                        className="w-20 h-20 rounded-full mb-3 object-cover"
                      />
                    )}
                    <h4 className="font-medium text-gray-900">{report.reportedUser?.displayName || report.reportedUsername || 'Unknown User'}</h4>
                    {report.reportedUser?.username && (
                      <p className="text-sm text-gray-600 mt-1">
                        @{report.reportedUser.username}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      Status: <span className="capitalize">{report.reportedUser?.moderationStatus || 'Unknown'}</span>
                    </p>
                    {report.reportedUser?.reportsCount > 0 && (
                      <p className="text-sm text-gray-600">
                        Total Reports: {report.reportedUser.reportsCount}
                      </p>
                    )}
                    {report.reportedUsername && (
                      <a
                        href={`/u/${report.reportedUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-600 hover:text-emerald-700 mt-2 inline-block"
                      >
                        View Profile →
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Campaign</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {report.campaign?.imageUrl && (
                      <img
                        src={report.campaign.imageUrl}
                        alt={report.campaign.title}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h4 className="font-medium text-gray-900">{report.campaign?.title || 'Unknown Campaign'}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Type: <span className="capitalize">{report.campaign?.type || 'Unknown'}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: <span className="capitalize">{report.campaign?.moderationStatus || 'Unknown'}</span>
                    </p>
                    {report.campaign?.creator && (
                      <p className="text-sm text-gray-600">
                        Creator: {report.campaign.creator.displayName}
                      </p>
                    )}
                    {report.campaign?.slug && (
                      <a
                        href={`/campaign/${report.campaign.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-600 hover:text-emerald-700 mt-2 inline-block"
                      >
                        View Campaign →
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Report Details</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs text-gray-500">Reason</dt>
                    <dd className="text-sm text-gray-900">{getReasonText(report.reason)}</dd>
                  </div>
                  {report.details && (
                    <div>
                      <dt className="text-xs text-gray-500">Additional Details</dt>
                      <dd className="text-sm text-gray-900">{report.details}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs text-gray-500">Reported By</dt>
                    <dd className="text-sm text-gray-900">
                      {report.reporter?.displayName || 'Anonymous'}
                      {report.reporter?.username && (
                        <span className="text-gray-500"> (@{report.reporter.username})</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Reported At</dt>
                    <dd className="text-sm text-gray-900">{formatDate(report.createdAt)}</dd>
                  </div>
                  {report.reviewedAt && (
                    <div>
                      <dt className="text-xs text-gray-500">Reviewed At</dt>
                      <dd className="text-sm text-gray-900">{formatDate(report.reviewedAt)}</dd>
                    </div>
                  )}
                  {report.action && (
                    <div>
                      <dt className="text-xs text-gray-500">Action Taken</dt>
                      <dd className="text-sm text-gray-900 capitalize">{report.action.replace('-', ' ')}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleAction('dismissed', 'no-action')}
                    disabled={isUpdating || report.status === 'dismissed'}
                    className="w-full btn-base bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Processing...' : 'Dismiss Report'}
                  </button>
                  
                  <button
                    onClick={() => handleAction('resolved', 'warned')}
                    disabled={isUpdating || report.status === 'resolved'}
                    className="w-full btn-base bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Processing...' : (report.type === 'profile' ? 'Warn User' : 'Warn Creator')}
                  </button>
                  
                  <button
                    onClick={() => handleAction('resolved', 'removed')}
                    disabled={isUpdating || report.status === 'resolved'}
                    className="w-full btn-base bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Processing...' : (report.type === 'profile' ? 'Ban User' : 'Remove Campaign')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
