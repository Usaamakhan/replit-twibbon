"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useFCM } from '@/hooks/useFCM';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase-optimized';
import SettingsSidebar from '@/components/SettingsSidebar';

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { 
    notificationPermission, 
    fcmToken, 
    isSupported,
    requestPermission, 
    removeToken 
  } = useFCM();
  
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  
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
  
  useEffect(() => {
    if (!user) return;
    
    const fetchDevices = async () => {
      try {
        const tokensRef = collection(db, 'users', user.uid, 'tokens');
        const snapshot = await getDocs(query(tokensRef));
        
        const deviceList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isCurrent: doc.data().token === fcmToken,
        }));
        
        setDevices(deviceList);
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDevices();
  }, [user, fcmToken]);
  
  const handleToggleNotifications = async () => {
    setIsToggling(true);
    try {
      if (fcmToken) {
        await removeToken();
        setDevices([]);
      } else {
        await requestPermission();
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    } finally {
      setIsToggling(false);
    }
  };
  
  const handleRemoveDevice = async (deviceId, token) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'tokens', deviceId));
      
      setDevices(devices.filter(d => d.id !== deviceId));
      
      if (token === fcmToken) {
        await removeToken();
      }
    } catch (error) {
      console.error('Error removing device:', error);
    }
  };
  
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
  
  if (!isSupported) {
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
              
              <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 px-4 sm:px-6 py-6 sm:py-8 shadow-sm">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm sm:text-base text-yellow-800">
                    Push notifications are not supported in your browser. Please use Chrome, Firefox, or Edge.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
              
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  Push Notifications
                </h2>
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Enable Push Notifications
                      </p>
                      <p className="text-xs text-gray-500">
                        Get notified about moderation updates for your campaigns
                      </p>
                    </div>
                    
                    {notificationPermission === 'denied' ? (
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-red-600 font-medium mb-1">
                          Blocked in Browser
                        </p>
                        <button
                          onClick={() => window.open('chrome://settings/content/notifications', '_blank')}
                          className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          Open Settings →
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleToggleNotifications}
                        disabled={isToggling}
                        className={`flex-shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          fcmToken ? 'bg-emerald-600' : 'bg-gray-300'
                        }`}
                        aria-label="Toggle notifications"
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            fcmToken ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  
                  {fcmToken && (
                    <div className="flex items-center text-green-600 text-xs mt-3">
                      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Notifications enabled on this device
                    </div>
                  )}
                  
                  {!fcmToken && notificationPermission !== 'denied' && (
                    <p className="text-xs text-gray-500 mt-3">
                      Enable to receive notifications about your campaigns
                    </p>
                  )}
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
              
              {notificationPermission === 'granted' && (
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Active Devices
                  </h2>
                  
                  {loading ? (
                    <p className="text-sm text-gray-500">Loading devices...</p>
                  ) : devices.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-500">
                        No devices registered for notifications
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {devices.map((device) => (
                        <div 
                          key={device.id}
                          className="flex items-center justify-between gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center min-w-0 flex-1">
                            <div className="flex-shrink-0">
                              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="ml-3 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {device.browser || 'Web Browser'}
                                {device.isCurrent && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    Current Device
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                Added {device.createdAt?.toDate().toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveDevice(device.id, device.token)}
                            className="flex-shrink-0 text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
