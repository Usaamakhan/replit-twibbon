"use client";

import { useState } from 'react';
import { useFCM } from '@/hooks/useFCM';

export default function NotificationBanner({ onDismiss }) {
  const { requestPermission } = useFCM();
  const [loading, setLoading] = useState(false);
  
  const handleEnable = async () => {
    setLoading(true);
    await requestPermission();
    setLoading(false);
    onDismiss();
  };
  
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-blue-100 dark:bg-blue-800">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </span>
            <p className="ml-3 font-medium text-blue-900 dark:text-blue-100 text-sm">
              Get notified when your campaigns are reviewed or removed
            </p>
          </div>
          <div className="mt-2 sm:mt-0 sm:ml-3 flex-shrink-0 flex gap-2">
            <button
              onClick={handleEnable}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Enabling...' : 'Enable Notifications'}
            </button>
            <button
              onClick={onDismiss}
              className="inline-flex items-center px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-md text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
