"use client";

import { useState, useEffect, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase-optimized';
import { useAuth } from '@/contexts/AuthContext';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export function useFCM() {
  const { user } = useAuth();
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [fcmToken, setFcmToken] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
      setIsSupported(true);
    }
    setLoading(false);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported || !user) {
      console.log('FCM not supported or user not authenticated');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        const messagingInstance = messaging;
        
        if (!messagingInstance) {
          console.error('Firebase Messaging not initialized');
          return null;
        }

        if (!VAPID_KEY) {
          console.error('VAPID key not configured');
          return null;
        }

        const token = await getToken(messagingInstance, { vapidKey: VAPID_KEY });
        setFcmToken(token);

        const browser = navigator.userAgent.includes('Chrome') ? 'Chrome' :
                       navigator.userAgent.includes('Firefox') ? 'Firefox' :
                       navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown';

        await fetch('/api/notifications/register-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            token,
            device: 'web',
            browser
          }),
        });

        return token;
      }

      return null;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return null;
    }
  }, [user, isSupported]);

  const removeToken = useCallback(async () => {
    if (!user || !fcmToken) return;

    try {
      await fetch('/api/notifications/remove-token', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          token: fcmToken
        }),
      });

      setFcmToken(null);
    } catch (error) {
      console.error('Error removing FCM token:', error);
    }
  }, [user, fcmToken]);

  useEffect(() => {
    if (!messaging || !fcmToken) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground notification received:', payload);

      if (payload.notification) {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: payload.notification.icon || '/icon-192x192.png',
          data: payload.data,
        });
      }
    });

    return () => unsubscribe();
  }, [fcmToken]);

  return {
    notificationPermission,
    fcmToken,
    isSupported,
    loading,
    requestPermission,
    removeToken,
  };
}
