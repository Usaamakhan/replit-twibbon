"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  formatReportReason, 
  getReportStatusColor, 
  formatTimestamp,
  getModerationStatusColor,
} from "@/utils/admin/adminHelpers";

export default function GroupedReportsTable({ summaries, loading, onSelectSummary, onRefresh }) {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState(null);
  const [individualReports, setIndividualReports] = useState({});
  const [loadingReports, setLoadingReports] = useState({});

  const fetchIndividualReports = async (summary) => {
    if (individualReports[summary.id]) {
      // Toggle collapse
      setExpandedId(expandedId === summary.id ? null : summary.id);
      return;
    }

    setLoadingReports({ ...loadingReports, [summary.id]: true });
    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `/api/admin/reports/details?targetId=${summary.targetId}&targetType=${summary.targetType}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch report details');
      }

      const data = await response.json();
      setIndividualReports({
        ...individualReports,
        [summary.id]: data.data || [],
      });
      setExpandedId(summary.id);
    } catch (error) {
      console.error('Error fetching report details:', error);
    } finally {
      setLoadingReports({ ...loadingReports, [summary.id]: false });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
          <p className="mt-1 text-sm text-gray-500">No reports match your current filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reported Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reports
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Reported
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {summaries.map((summary) => (
              <>
                <tr
                  key={summary.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0">
                        {summary.targetType === 'user' ? (
                          summary.profileImage ? (
                            <img
                              className="h-12 w-12 rounded-full object-cover"
                              src={summary.profileImage}
                              alt={summary.displayName || 'User'}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center">
                              <span className="text-white text-lg font-medium">
                                {summary.displayName?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          )
                        ) : summary.campaignImage ? (
                          <img
                            className="h-12 w-12 rounded object-cover"
                            src={summary.campaignImage}
                            alt={summary.campaignTitle || 'Campaign'}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center">
                            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {summary.targetType === 'user' ? (
                          <>
                            <div className="text-sm font-medium text-gray-900">
                              {summary.displayName || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{summary.username || 'unknown'}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm font-medium text-gray-900">
                              {summary.campaignTitle || 'Unknown Campaign'}
                            </div>
                            <div className="text-sm text-gray-500">
                              by {summary.creator?.displayName || 'Unknown'}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-red-600">{summary.reportCount || 0}</span>
                      <span className="ml-2 text-sm text-gray-500">reports</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getModerationStatusColor(summary.moderationStatus || summary.accountStatus)}`}>
                      {summary.moderationStatus || summary.accountStatus || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTimestamp(summary.lastReportedAt, true)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button
                      onClick={() => fetchIndividualReports(summary)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {expandedId === summary.id ? 'Hide Reports' : 'View Reports'}
                    </button>
                    <button
                      onClick={() => onSelectSummary(summary)}
                      className="text-emerald-600 hover:text-emerald-900"
                    >
                      Take Action
                    </button>
                  </td>
                </tr>
                
                {expandedId === summary.id && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 bg-gray-50">
                      {loadingReports[summary.id] ? (
                        <div className="text-center py-4">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                          <p className="mt-2 text-sm text-gray-600">Loading individual reports...</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900 mb-3">Individual Reports ({individualReports[summary.id]?.length || 0})</h4>
                          {individualReports[summary.id]?.map((report) => (
                            <div key={report.id} className="bg-white p-3 rounded border border-gray-200">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-900">
                                      {formatReportReason(report.reason)}
                                    </span>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getReportStatusColor(report.status)}`}>
                                      {report.status}
                                    </span>
                                  </div>
                                  {report.details && (
                                    <p className="text-sm text-gray-600 mt-1">{report.details}</p>
                                  )}
                                  <div className="text-xs text-gray-500 mt-1">
                                    Reported by {report.reporter?.displayName || 'Anonymous'} • {formatTimestamp(report.createdAt, true)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
