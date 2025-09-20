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
    const startTime = performance.now();
    if (process.env.NEXT_PUBLIC_DEBUG === '1') {
      console.log('🔍 Firebase useEffect triggered - Route:', window.location.pathname, 'Time:', new Date().toISOString());
      console.log('📊 Firebase initialization status:', { isInitialized, isConfigured: Boolean(firebaseApp) });
    }
    
    // Only initialize once on the client
    if (isInitialized) {
      const cacheTime = performance.now() - startTime;
      if (process.env.NEXT_PUBLIC_DEBUG === '1') {
        console.log('✅ Firebase already initialized, returning cached values. Time taken:', cacheTime.toFixed(2) + 'ms');
      }
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
        const envCheckStart = performance.now();
        if (process.env.NEXT_PUBLIC_DEBUG === '1') {
          console.log('🔧 Starting Firebase initialization...', new Date().toISOString());
        }
        
        // Check environment variables BEFORE importing anything
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

        const envCheckTime = performance.now() - envCheckStart;
        if (process.env.NEXT_PUBLIC_DEBUG === '1') {
          console.log('⚙️ Environment check completed in:', envCheckTime.toFixed(2) + 'ms', {
            hasApiKey: !!apiKey, 
            hasProjectId: !!projectId, 
            hasAppId: !!appId
          });
        }

        if (!apiKey || !projectId || !appId) {
          if (process.env.NEXT_PUBLIC_DEBUG === '1') {
            console.log('❌ Firebase not configured - missing variables:', { 
              hasApiKey: !!apiKey, 
              hasProjectId: !!projectId, 
              hasAppId: !!appId,
              route: window.location.pathname 
            });
          }
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
        const importStart = performance.now();
        console.log('📦 Starting Firebase module imports...', new Date().toISOString());
        
        const [
          { initializeApp, getApps, getApp },
          { getAuth },
          { getFirestore }
        ] = await Promise.all([
          import('firebase/app'),
          import('firebase/auth'),
          import('firebase/firestore')
        ]);

        const importTime = performance.now() - importStart;
        console.log('📦 Firebase modules imported in:', importTime.toFixed(2) + 'ms');

        const configStart = performance.now();
        const firebaseConfig = {
          apiKey,
          authDomain: `${projectId}.firebaseapp.com`,
          projectId,
          storageBucket: `${projectId}.appspot.com`,
          appId,
        };

        const configTime = performance.now() - configStart;
        console.log('⚙️ Firebase config created in:', configTime.toFixed(2) + 'ms');

        // Initialize Firebase
        const initStart = performance.now();
        firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
        firebaseAuth = getAuth(firebaseApp);
        firebaseDb = getFirestore(firebaseApp);
        isInitialized = true;
        const initTime = performance.now() - initStart;

        const totalTime = performance.now() - startTime;
        console.log('🔥 Firebase initialized successfully!', {
          route: window.location.pathname,
          projectId: projectId,
          timestamp: new Date().toISOString(),
          timing: {
            envCheck: envCheckTime.toFixed(2) + 'ms',
            imports: importTime.toFixed(2) + 'ms', 
            config: configTime.toFixed(2) + 'ms',
            initialization: initTime.toFixed(2) + 'ms',
            total: totalTime.toFixed(2) + 'ms'
          }
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