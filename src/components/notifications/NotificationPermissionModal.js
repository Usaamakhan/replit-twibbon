"use client";

import { useState, useEffect } from 'react';
import { useFCM } from '@/hooks/useFCM';

export default function NotificationPermissionModal({ onClose }) {
  const { requestPermission, notificationPermission } = useFCM();
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    const hasDeclined = localStorage.getItem('fcm-permission-declined');
    if (hasDeclined || notificationPermission === 'granted') {
      onClose?.();
    }
  }, [notificationPermission, onClose]);

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    const token = await requestPermission();
    setIsRequesting(false);

    if (token) {
      console.log('Notification permission granted');
      onClose?.();
    } else {
      console.log('Notification permission denied');
    }
  };

  const handleDismiss = () => {
    if (dontAskAgain) {
      localStorage.setItem('fcm-permission-declined', 'true');
    }
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Enable Notifications
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Stay updated when your campaigns are reviewed, removed, or restored. Get notified about important moderation updates.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleEnableNotifications}
            disabled={isRequesting}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            {isRequesting ? 'Requesting Permission...' : 'Enable Notifications'}
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
          >
            Maybe Later
          </button>
        </div>

        <label className="flex items-center justify-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={dontAskAgain}
            onChange={(e) => setDontAskAgain(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Don't ask again
          </span>
        </label>
      </div>
    </div>
  );
}
