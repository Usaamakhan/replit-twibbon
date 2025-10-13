"use client";

import { useState, useEffect, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase-optimized';
import { useAuth } from '@/hooks/useAuth';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export function useFCM() {
  const { user } = useAuth();
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [fcmToken, setFcmToken] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(true);
  const [foregroundNotification, setForegroundNotification] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
      setIsSupported(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const retrieveExistingToken = async () => {
      if (!isSupported || !user || notificationPermission !== 'granted' || fcmToken) {
        return;
      }

      const disabledByUser = localStorage.getItem('fcm_disabled_by_user') === 'true';
      if (disabledByUser) {
        return;
      }

      try {
        const messagingInstance = messaging;
        if (!messagingInstance || !VAPID_KEY) {
          return;
        }

        let registration;
        if ('serviceWorker' in navigator) {
          registration = await navigator.serviceWorker.getRegistration('/');
          if (!registration) {
            registration = await navigator.serviceWorker.register(
              '/firebase-messaging-sw',
              { scope: '/' }
            );
          }
          await navigator.serviceWorker.ready;
        }

        const token = await getToken(messagingInstance, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });

        if (token) {
          setFcmToken(token);
          console.log('Existing FCM token retrieved:', token);
          
          // Re-register the token to ensure it exists in Firestore
          // This handles cases where token was deleted server-side but still exists client-side
          const browser = navigator.userAgent.includes('Chrome') ? 'Chrome' :
                         navigator.userAgent.includes('Firefox') ? 'Firefox' :
                         navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown';
          
          try {
            console.log('Re-registering existing token with server...');
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
            console.log('Existing token re-registered successfully');
          } catch (regError) {
            console.error('Error re-registering existing token:', regError);
            // Don't throw - token is still usable locally
          }
        }
      } catch (error) {
        console.error('Error retrieving existing FCM token:', error);
      }
    };

    retrieveExistingToken();
  }, [isSupported, user, notificationPermission, fcmToken]);

  const requestPermission = useCallback(async () => {
    if (!isSupported || !user) {
      console.log('FCM not supported or user not authenticated');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        localStorage.removeItem('fcm_disabled_by_user');
        
        const messagingInstance = messaging;
        
        if (!messagingInstance) {
          console.error('Firebase Messaging not initialized');
          return null;
        }

        if (!VAPID_KEY) {
          console.error('VAPID key not configured');
          return null;
        }

        let registration;
        if ('serviceWorker' in navigator) {
          registration = await navigator.serviceWorker.register(
            '/firebase-messaging-sw',
            { scope: '/' }
          );
          await navigator.serviceWorker.ready;
          console.log('Service Worker registered:', registration);
        }

        const token = await getToken(messagingInstance, { 
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });
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
      localStorage.setItem('fcm_disabled_by_user', 'true');
      
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
        setForegroundNotification(payload);
      }
    });

    return () => unsubscribe();
  }, [fcmToken]);

  const clearNotification = useCallback(() => {
    setForegroundNotification(null);
  }, []);

  return {
    notificationPermission,
    fcmToken,
    isSupported,
    loading,
    requestPermission,
    removeToken,
    foregroundNotification,
    clearNotification,
  };
}
