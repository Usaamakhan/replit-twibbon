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
    console.log('🔍 Firebase useEffect triggered - Route:', window.location.pathname);
    console.log('📊 Firebase initialization status:', { isInitialized, isConfigured: Boolean(firebaseApp) });
    
    // Only initialize once on the client
    if (isInitialized) {
      console.log('✅ Firebase already initialized, returning cached values');
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
        // Check environment variables BEFORE importing anything
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

        if (!apiKey || !projectId || !appId) {
          console.log('❌ Firebase not configured - missing variables:', { 
            hasApiKey: !!apiKey, 
            hasProjectId: !!projectId, 
            hasAppId: !!appId,
            route: window.location.pathname 
          });
          setFirebase({
            app: null,
            auth: null,
            db: null,
            isLoading: false,
            isConfigured: false
          });
          isInitialized = true; // Mark as initialized to prevent retries
          return;
        }

        // Only import Firebase modules if properly configured
        const [
          { initializeApp, getApps, getApp },
          { getAuth },
          { getFirestore }
        ] = await Promise.all([
          import('firebase/app'),
          import('firebase/auth'),
          import('firebase/firestore')
        ]);

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

        console.log('🔥 Firebase initialized successfully!', {
          route: window.location.pathname,
          projectId: projectId,
          timestamp: new Date().toISOString()
        });

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