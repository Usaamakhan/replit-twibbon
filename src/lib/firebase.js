// Firebase configuration based on firebase_barebones_javascript integration
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Check for Firebase environment variables
const firebaseEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check for missing environment variables
const missingVars = Object.entries(firebaseEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

// Firebase configuration is optional for development
const firebaseConfigured = missingVars.length === 0;

if (!firebaseConfigured && process.env.NODE_ENV !== 'development') {
  throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
}

// Initialize Firebase only if configured
let app = null;
let auth = null;
let db = null;

if (firebaseConfigured) {
  const firebaseConfig = {
    apiKey: firebaseEnvVars.apiKey,
    authDomain: `${firebaseEnvVars.projectId}.firebaseapp.com`,
    projectId: firebaseEnvVars.projectId,
    storageBucket: `${firebaseEnvVars.projectId}.appspot.com`,
    appId: firebaseEnvVars.appId,
  };

  try {
    // Initialize Firebase - prevent duplicate initialization during HMR
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    
    // Initialize Firebase Authentication and get a reference to the service
    auth = getAuth(app);

    // Initialize Cloud Firestore and get a reference to the service
    db = getFirestore(app);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Firebase initialized successfully with project:', firebaseEnvVars.projectId);
    }
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    // Set services to null if initialization fails
    app = null;
    auth = null;
    db = null;
  }
} else {
  if (process.env.NODE_ENV === 'development') {
    console.log('Firebase not configured - missing variables:', missingVars);
  }
}

// Export Firebase services (will be null if not configured)
export { auth, db, firebaseConfigured };
export default app;