'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { formatTimestamp } from '@/utils/admin/adminHelpers';

export default function AdminAppealsPage() {
  const { user } = useAuth();
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [filters, setFilters] = useState({
    status: 'pending',
    type: 'all',
    limit: 50,
  });
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  const fetchAppeals = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = await user.getIdToken();
      const params = new URLSearchParams(filters);

      const response = await fetch(`/api/admin/appeals?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appeals');
      }

      const data = await response.json();
      setAppeals(data.appeals || []);
    } catch (err) {
      console.error('Error fetching appeals:', err);
      setError('Failed to load appeals');
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    if (user) {
      fetchAppeals();
    }
  }, [user, fetchAppeals]);

  const handleAction = async () => {
    if (!selectedAppeal || !actionType) return;

    if (confirmText !== 'CONFIRM') {
      setError('Please type CONFIRM to proceed');
      return;
    }

    try {
      setProcessing(selectedAppeal.id);
      setError('');

      const token = await user.getIdToken();

      const response = await fetch(`/api/admin/appeals/${selectedAppeal.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: actionType,
          adminNotes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process appeal');
      }

      setShowActionModal(false);
      setSelectedAppeal(null);
      setActionType(null);
      setAdminNotes('');
      setConfirmText('');
      
      fetchAppeals();
    } catch (err) {
      console.error('Error processing appeal:', err);
      setError(err.message || 'Failed to process appeal');
    } finally {
      setProcessing(null);
    }
  };

  const openActionModal = (appeal, action) => {
    setSelectedAppeal(appeal);
    setActionType(action);
    setShowActionModal(true);
    setError('');
    setConfirmText('');
    setAdminNotes('');
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const styles = {
      campaign: 'bg-blue-100 text-blue-800',
      account: 'bg-purple-100 text-purple-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appeals Management</h1>
        <p className="text-gray-600 mt-1">Review and process user appeals for removed content and banned accounts</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All</option>
              <option value="campaign">Campaign</option>
              <option value="account">Account</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchAppeals}
              disabled={loading}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 transition-colors"
            >
              {loading ? 'Loading...' : 'Load Appeals'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {appeals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Appeals Found</h3>
            <p className="text-gray-600">No appeals match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appeals.map((appeal) => (
                  <tr key={appeal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {appeal.userInfo?.profileImage ? (
                          <div className="relative w-10 h-10 rounded-full mr-3 overflow-hidden">
                            <Image
                              src={appeal.userInfo.profileImage}
                              alt={appeal.userInfo.username}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3 text-sm font-semibold">
                            {appeal.userInfo?.username?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{appeal.userInfo?.displayName || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">@{appeal.userInfo?.username || 'unknown'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getTypeBadge(appeal.type)}</td>
                    <td className="px-6 py-4">
                      {appeal.type === 'campaign' ? (
                        <div className="flex items-center">
                          {appeal.targetInfo?.imageUrl && (
                            <div className="relative w-12 h-12 rounded mr-3 overflow-hidden flex-shrink-0">
                              <Image
                                src={appeal.targetInfo.imageUrl}
                                alt={appeal.targetInfo.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{appeal.targetInfo?.title || '[Deleted]'}</div>
                            {appeal.targetInfo?.removalReason && (
                              <div className="text-xs text-gray-500">Reason: {appeal.targetInfo.removalReason}</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium">Account: @{appeal.targetInfo?.username || '[Deleted]'}</div>
                          {appeal.targetInfo?.banReason && (
                            <div className="text-xs text-gray-500">Reason: {appeal.targetInfo.banReason}</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={appeal.reason}>
                        {appeal.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(appeal.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatTimestamp(appeal.submittedAt)}
                    </td>
                    <td className="px-6 py-4">
                      {appeal.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openActionModal(appeal, 'approve')}
                            disabled={processing === appeal.id}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openActionModal(appeal, 'reject')}
                            disabled={processing === appeal.id}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:bg-gray-300 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {appeal.status === 'approved' ? 'Approved' : 'Rejected'}
                          {appeal.reviewedAt && ` on ${formatTimestamp(appeal.reviewedAt)}`}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showActionModal && selectedAppeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {actionType === 'approve' ? 'Approve' : 'Reject'} Appeal
              </h2>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="mb-2">
                  <span className="font-medium">User:</span> @{selectedAppeal.userInfo?.username}
                </div>
                <div className="mb-2">
                  <span className="font-medium">Type:</span> {selectedAppeal.type}
                </div>
                <div className="mb-2">
                  <span className="font-medium">Appeal Reason:</span>
                  <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{selectedAppeal.reason}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this decision..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>Warning:</strong> This action will:
                </p>
                <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1">
                  {actionType === 'approve' ? (
                    <>
                      <li>Restore the {selectedAppeal.type} to active status</li>
                      <li>Clear all removal/ban data</li>
                      <li>Send approval notification to the user</li>
                    </>
                  ) : (
                    <>
                      <li>Set the {selectedAppeal.type} to permanent removal/ban</li>
                      <li>Prevent any future appeals</li>
                      <li>Send rejection notification to the user</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-mono bg-gray-200 px-2 py-1 rounded">CONFIRM</span> to proceed:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type CONFIRM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleAction}
                  disabled={confirmText !== 'CONFIRM' || processing}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    actionType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                >
                  {processing ? 'Processing...' : `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
                </button>
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setSelectedAppeal(null);
                    setActionType(null);
                    setAdminNotes('');
                    setConfirmText('');
                    setError('');
                  }}
                  disabled={processing}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
