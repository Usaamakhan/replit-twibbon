"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import SettingsSidebar from '@/components/SettingsSidebar';
import Link from 'next/link';

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [preferences, setPreferences] = useState({
    warnings: true,
    removals: true,
    restorations: true,
    profileReports: true,
    adminActions: true,
  });
  
  useEffect(() => {
    const saved = localStorage.getItem('notification-preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      }
    }
  }, []);
  
  const handlePreferenceChange = (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPreferences);
    localStorage.setItem('notification-preferences', JSON.stringify(newPreferences));
  };
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);
  
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        <SettingsSidebar />
        
        <div className="flex-1 w-full">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="bg-yellow-400 px-4 sm:px-6 py-4 sm:py-6 rounded-t-xl">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-700">Notification Settings</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 mt-1 sm:mt-2">Manage your notification preferences</p>
            </div>
            
            <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 px-4 sm:px-6 py-6 sm:py-8 shadow-sm space-y-6 sm:space-y-8">
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-900 mb-1">In-App Notifications Only</h3>
                    <p className="text-sm text-blue-700">
                      Notifications now appear inside the app - no browser permissions needed! Check the{' '}
                      <Link href="/profile/notifications" className="font-medium underline hover:text-blue-800">
                        notification inbox
                      </Link>
                      {' '}for all your updates.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  Notification Types
                </h2>
                
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  Choose which types of notifications you want to receive
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Campaign Warnings
                      </p>
                      <p className="text-xs text-gray-500">
                        When your campaign is flagged and under review
                      </p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('warnings')}
                      className={`flex-shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                        preferences.warnings ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                      aria-label="Toggle campaign warnings"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.warnings ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Campaign Removals
                      </p>
                      <p className="text-xs text-gray-500">
                        When your campaign is removed for violating guidelines
                      </p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('removals')}
                      className={`flex-shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                        preferences.removals ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                      aria-label="Toggle campaign removals"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.removals ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Campaign Restorations
                      </p>
                      <p className="text-xs text-gray-500">
                        When your campaign is restored after review
                      </p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('restorations')}
                      className={`flex-shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                        preferences.restorations ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                      aria-label="Toggle campaign restorations"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.restorations ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Profile Reports
                      </p>
                      <p className="text-xs text-gray-500">
                        When someone reports your profile or content
                      </p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('profileReports')}
                      className={`flex-shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                        preferences.profileReports ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                      aria-label="Toggle profile reports"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.profileReports ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Admin Actions
                      </p>
                      <p className="text-xs text-gray-500">
                        Important admin updates, warnings, and account actions
                      </p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('adminActions')}
                      className={`flex-shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                        preferences.adminActions ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                      aria-label="Toggle admin actions"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.adminActions ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
