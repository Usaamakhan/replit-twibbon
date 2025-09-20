"use client";

// Client-only Firebase wrapper to prevent hydration issues
import { useState, useEffect } from 'react';

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let isInitialized = false;

export const useFirebase = () => {
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

    const initializeFirebase = async () => {
      try {
        // Dynamic import Firebase only when needed
        const [
          { initializeApp, getApps, getApp },
          { getAuth },
          { getFirestore }
        ] = await Promise.all([
          import('firebase/app'),
          import('firebase/auth'),
          import('firebase/firestore')
        ]);

        // Check environment variables
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

        if (!apiKey || !projectId || !appId) {
          console.log('Firebase not configured - missing environment variables');
          setFirebase({
            app: null,
            auth: null,
            db: null,
            isLoading: false,
            isConfigured: false
          });
          return;
        }

        const firebaseConfig = {
          apiKey,
          authDomain: `${projectId}.firebaseapp.com`,
          projectId,
          storageBucket: `${projectId}.appspot.com`,
          appId,
        };

        // Initialize Firebase
        firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
        firebaseAuth = getAuth(firebaseApp);
        firebaseDb = getFirestore(firebaseApp);
        isInitialized = true;

        if (process.env.NODE_ENV === 'development') {
          console.log('Firebase initialized successfully (client-only)');
        }

        setFirebase({
          app: firebaseApp,
          auth: firebaseAuth,
          db: firebaseDb,
          isLoading: false,
          isConfigured: true
        });
      } catch (error) {
        console.error('Firebase initialization failed:', error);
        setFirebase({
          app: null,
          auth: null,
          db: null,
          isLoading: false,
          isConfigured: false
        });
      }
    };

    initializeFirebase();
  }, []);

  return firebase;
};