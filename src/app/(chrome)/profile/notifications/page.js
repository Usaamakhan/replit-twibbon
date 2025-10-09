"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useFCM } from '@/hooks/useFCM';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase-optimized';

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
  
  // Redirect if not authenticated
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
  
  const handleEnableNotifications = async () => {
    await requestPermission();
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
  
  const getPermissionStatusColor = () => {
    switch (notificationPermission) {
      case 'granted': return 'text-green-600';
      case 'denied': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };
  
  const getPermissionStatusText = () => {
    switch (notificationPermission) {
      case 'granted': return 'Enabled';
      case 'denied': return 'Blocked';
      default: return 'Not Enabled';
    }
  };
  
  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated (redirect will handle this)
  if (!user) {
    return null;
  }
  
  if (!isSupported) {
    return (
      <div className="min-h-screen bg-white">
        <div className="min-h-screen flex">
          <div className="flex-1 w-full flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-16 xl:px-20 pt-20">
            <div className="mx-auto w-full max-w-4xl">
              {/* Header */}
              <div className="text-center mb-8 bg-yellow-400 px-6 py-6 rounded-t-xl">
                <h1 className="text-2xl sm:text-3xl font-bold text-emerald-700">Notification Settings</h1>
                <p className="text-base sm:text-lg text-gray-700 mt-2">Manage your notification preferences</p>
              </div>
              
              {/* Content Card */}
              <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 px-6 py-8 shadow-sm">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
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
    <div className="min-h-screen bg-white">
      <div className="min-h-screen flex">
        {/* Main Content */}
        <div className="flex-1 w-full flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-16 xl:px-20 pt-20">
          <div className="mx-auto w-full max-w-4xl">
            {/* Header */}
            <div className="text-center mb-8 bg-yellow-400 px-6 py-6 rounded-t-xl">
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-700">Notification Settings</h1>
              <p className="text-base sm:text-lg text-gray-700 mt-2">Manage your notification preferences</p>
            </div>
            
            {/* Content Card with Shadow Border */}
            <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 px-6 py-8 shadow-sm space-y-6">
              
              {/* Push Notifications Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Push Notifications
                </h2>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        Status: <span className={`font-medium ${getPermissionStatusColor()}`}>
                          {getPermissionStatusText()}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Get notified about moderation updates for your campaigns
                      </p>
                    </div>
                    
                    {notificationPermission === 'default' && (
                      <button
                        onClick={handleEnableNotifications}
                        className="btn-base btn-primary px-4 py-2 text-sm font-medium whitespace-nowrap"
                      >
                        Enable Notifications
                      </button>
                    )}
                    
                    {notificationPermission === 'denied' && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">
                          Enable in browser settings
                        </p>
                        <button
                          onClick={() => window.open('chrome://settings/content/notifications', '_blank')}
                          className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          Open Browser Settings →
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {notificationPermission === 'granted' && (
                    <div className="flex items-center text-green-600 text-sm">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      You're all set! You'll receive notifications for moderation updates.
                    </div>
                  )}
                </div>
              </div>
              
              {/* Active Devices Section */}
              {notificationPermission === 'granted' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
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
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Coming Soon Notice */}
              <div className="bg-gray-50 rounded-lg p-4 border border-dashed border-gray-300">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Coming Soon:</span> Choose which events you want to be notified about (warnings, removals, restorations, etc.)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
