"use client";

// Optimized Firebase configuration with static imports for better performance
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";
import { useState, useEffect } from 'react';

// Module-level Firebase instances (initialized immediately on client)
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let firebaseMessaging = null;
let isInitialized = false;
let isConfigured = false;
let messagingSupported = false;

// Initialize Firebase immediately at module load (client-side only)
const initializeFirebaseModule = () => {
  // Only run on client
  if (typeof window === 'undefined') {
    return;
  }

  // Only initialize once
  if (isInitialized) {
    return;
  }

  try {
    // Check environment variables
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

    // Check if Firebase should be disabled
    if (!apiKey || !projectId || !appId || 
        apiKey === 'not needed' || projectId === 'not needed' || appId === 'not needed' ||
        apiKey === '' || projectId === '' || appId === '') {
      console.log('Firebase disabled - no valid configuration found');
      isInitialized = true;
      isConfigured = false;
      return;
    }

    const firebaseConfig = {
      apiKey,
      authDomain: `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: `${projectId}.appspot.com`,
      appId,
    };

    // Initialize Firebase - prevent duplicate initialization
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    firebaseDb = getFirestore(firebaseApp);
    
    // Initialize Firebase Cloud Messaging if supported
    isSupported().then((supported) => {
      if (supported) {
        firebaseMessaging = getMessaging(firebaseApp);
        messagingSupported = true;
      } else {
        console.log('Firebase Messaging not supported in this browser');
        messagingSupported = false;
      }
    }).catch((error) => {
      console.error('Error checking FCM support:', error);
      messagingSupported = false;
    });
    
    isInitialized = true;
    isConfigured = true;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    isInitialized = true;
    isConfigured = false;
  }
};

// Initialize Firebase immediately when module loads (client-side only)
initializeFirebaseModule();

// Hook to access Firebase instances in React components
export const useFirebaseOptimized = () => {
  const [firebase, setFirebase] = useState({
    app: firebaseApp,
    auth: firebaseAuth,
    db: firebaseDb,
    messaging: firebaseMessaging,
    isLoading: false,
    isConfigured: isConfigured,
    messagingSupported: messagingSupported
  });

  useEffect(() => {
    // Ensure Firebase is initialized (should already be done at module load)
    initializeFirebaseModule();
    
    // Update state with initialized instances
    setFirebase({
      app: firebaseApp,
      auth: firebaseAuth,
      db: firebaseDb,
      messaging: firebaseMessaging,
      isLoading: false,
      isConfigured: isConfigured,
      messagingSupported: messagingSupported
    });
  }, []);

  return firebase;
};

// Export Firebase services (now available immediately at module load)
export { firebaseAuth as auth, firebaseDb as db, firebaseMessaging as messaging };
export default firebaseApp;
