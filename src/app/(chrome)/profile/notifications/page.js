"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFCM } from '@/hooks/useFCM';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase-optimized';

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const { 
    notificationPermission, 
    fcmToken, 
    isSupported,
    requestPermission, 
    removeToken 
  } = useFCM();
  
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
      case 'granted': return 'text-green-600 dark:text-green-400';
      case 'denied': return 'text-red-600 dark:text-red-400';
      default: return 'text-yellow-600 dark:text-yellow-400';
    }
  };
  
  const getPermissionStatusText = () => {
    switch (notificationPermission) {
      case 'granted': return 'Enabled';
      case 'denied': return 'Blocked';
      default: return 'Not Enabled';
    }
  };
  
  if (!isSupported) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            Push notifications are not supported in your browser. Please use Chrome, Firefox, or Edge.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Notification Settings
      </h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Push Notifications
        </h2>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Status: <span className={`font-medium ${getPermissionStatusColor()}`}>
                {getPermissionStatusText()}
              </span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Get notified about moderation updates for your campaigns
            </p>
          </div>
          
          {notificationPermission === 'default' && (
            <button
              onClick={handleEnableNotifications}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Enable Notifications
            </button>
          )}
          
          {notificationPermission === 'denied' && (
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Enable in browser settings
              </p>
              <button
                onClick={() => window.open('chrome://settings/content/notifications', '_blank')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Open Browser Settings →
              </button>
            </div>
          )}
        </div>
        
        {notificationPermission === 'granted' && (
          <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            You're all set! You'll receive notifications for moderation updates.
          </div>
        )}
      </div>
      
      {notificationPermission === 'granted' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Active Devices
          </h2>
          
          {loading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading devices...</p>
          ) : devices.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No devices registered for notifications
            </p>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => (
                <div 
                  key={device.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {device.browser || 'Web Browser'}
                        {device.isCurrent && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Current Device
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Added {device.createdAt?.toDate().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveDevice(device.id, device.token)}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-dashed border-gray-300 dark:border-gray-600">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Coming Soon:</span> Choose which events you want to be notified about (warnings, removals, restorations, etc.)
        </p>
      </div>
    </div>
  );
}
