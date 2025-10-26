// Firebase Admin SDK for server-side authentication and Firestore operations
import 'server-only'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { validateFirebaseServiceKey } from '../utils/validateEnv'

// Check if Firebase Admin is already initialized
let adminApp = null

if (getApps().length === 0) {
  // Parse service account key from environment variable
  let credential = null;
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Validate the service account key format
    validateFirebaseServiceKey(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    
    try {
      const serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      credential = cert(serviceAccountKey);
    } catch (error) {
      const errorMsg = `Error parsing Firebase service account key: ${error.message}`;
      
      // In production, throw error immediately
      if (isProduction) {
        throw new Error(`[PRODUCTION] ${errorMsg}. Check FIREBASE_SERVICE_ACCOUNT_KEY environment variable.`);
      }
      
      // In development, log warning
      if (isDevelopment) {
        console.warn(`[DEV WARNING] ${errorMsg}`);
      }
    }
  } else {
    // Missing service account key
    if (isProduction) {
      throw new Error('[PRODUCTION] FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required in production.');
    }
    
    if (isDevelopment) {
      console.warn('[DEV WARNING] FIREBASE_SERVICE_ACCOUNT_KEY not found - using fallback initialization');
    }
  }

  try {
    const config = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    };
    
    if (!config.projectId) {
      throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is required');
    }
    
    // Add credential if available
    if (credential) {
      config.credential = credential;
    } else if (isProduction) {
      // In production, credential is required
      throw new Error('[PRODUCTION] Firebase Admin credentials are required in production environment');
    }
    
    adminApp = initializeApp(config);
    
    // Log successful initialization in development
    if (isDevelopment) {
      console.log(`[DEV] Firebase Admin initialized ${credential ? 'with credentials' : 'without credentials (fallback mode)'}`);
    }
  } catch (error) {
    // In production, throw the error immediately
    if (isProduction) {
      throw new Error(`[PRODUCTION] Firebase Admin initialization failed: ${error.message}`);
    }
    
    // In development, log error and attempt fallback
    if (isDevelopment) {
      console.error('[DEV ERROR] Firebase Admin initialization error:', error.message);
      console.warn('[DEV] Attempting fallback initialization without credentials...');
    }
    
    try {
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      
      if (isDevelopment) {
        console.log('[DEV] Fallback initialization successful (limited functionality)');
      }
    } catch (fallbackError) {
      throw new Error(`Firebase Admin initialization completely failed: ${fallbackError.message}`);
    }
  }
} else {
  adminApp = getApps()[0]
}

// Get Auth instance
export const adminAuth = getAuth(adminApp)

// Get Firestore instance
export const adminFirestore = () => getFirestore(adminApp)

// Helper function to verify ID tokens
export const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return decodedToken
  } catch (error) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[DEV ERROR] Token verification error:', error.message)
    }
    throw new Error('Invalid authentication token')
  }
}

export default adminApp