"use client";

// Optimized Firebase configuration with static imports for better performance
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { useState, useEffect } from 'react';

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let isInitialized = false;

export const useFirebaseOptimized = () => {
  const [firebase, setFirebase] = useState({
    app: null,
    auth: null,
    db: null,
    isLoading: true,
    isConfigured: false
  });

  useEffect(() => {
    // Only initialize once on the client
    if (isInitialized) {
      setFirebase({
        app: firebaseApp,
        auth: firebaseAuth,
        db: firebaseDb,
        isLoading: false,
        isConfigured: Boolean(firebaseApp)
      });
      return;
    }

    // Set timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (!isInitialized) {
        setFirebase({
          app: null,
          auth: null,
          db: null,
          isLoading: false,
          isConfigured: false
        });
        isInitialized = true;
      }
    }, 2000);

    const initializeFirebase = () => {
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
          setFirebase({
            app: null,
            auth: null,
            db: null,
            isLoading: false,
            isConfigured: false
          });
          isInitialized = true;
          clearTimeout(timeoutId);
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
        isInitialized = true;

        setFirebase({
          app: firebaseApp,
          auth: firebaseAuth,
          db: firebaseDb,
          isLoading: false,
          isConfigured: true
        });
        clearTimeout(timeoutId);
      } catch (error) {
        console.error('Firebase initialization failed:', error);
        setFirebase({
          app: null,
          auth: null,
          db: null,
          isLoading: false,
          isConfigured: false
        });
        isInitialized = true;
        clearTimeout(timeoutId);
      }
    };

    // Initialize immediately without dynamic imports
    initializeFirebase();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return firebase;
};

// Export Firebase services
export { firebaseAuth as auth, firebaseDb as db };
export default firebaseApp;