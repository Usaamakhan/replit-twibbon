"use client";

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function ReportUserModal({ isOpen, onClose, reportedUserId, reportedUsername }) {
  const { user } = useAuth();
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    
    if (!reportReason) {
      setError('Please select a reason for reporting');
      return;
    }
    
    setReportSubmitting(true);
    setError('');
    
    try {
      const reportData = {
        reportedUserId,
        reportedUsername,
        reportedBy: user?.uid || 'anonymous',
        reason: reportReason,
        details: reportDetails
      };
      
      const response = await fetch('/api/reports/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setReportSuccess(true);
      } else {
        setError(result.error || 'Failed to submit report');
      }
      
      setReportSubmitting(false);
    } catch (error) {
      console.error('Error submitting user report:', error);
      setError('Failed to submit report. Please try again.');
      setReportSubmitting(false);
    }
  };

  const handleClose = () => {
    setReportReason('');
    setReportDetails('');
    setError('');
    setReportSuccess(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-lg max-w-md w-full p-6 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {reportSuccess ? (
            // Success State
            <div className="text-center py-4">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Report Submitted</h3>
              <p className="text-gray-600 mb-6">
                Thank you for your report. We will review it shortly.
              </p>
              <button
                onClick={handleClose}
                className="btn-base btn-primary px-8 py-2 font-medium"
              >
                OK
              </button>
            </div>
          ) : (
            // Report Form
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Report User</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleReportSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-400">Select a reason</option>
                    <option value="inappropriate_avatar" className="text-gray-900">Inappropriate Profile Picture</option>
                    <option value="offensive_username" className="text-gray-900">Offensive Username</option>
                    <option value="spam_bio" className="text-gray-900">Spam in Bio/Description</option>
                    <option value="impersonation" className="text-gray-900">Impersonation</option>
                    <option value="other" className="text-gray-900">Other</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none text-gray-900 bg-white"
                    placeholder="Provide more context about your report..."
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn-base btn-secondary flex-1 py-2 font-medium"
                    disabled={reportSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-base bg-red-500 hover:bg-red-600 text-white flex-1 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={reportSubmitting || !reportReason}
                  >
                    {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
