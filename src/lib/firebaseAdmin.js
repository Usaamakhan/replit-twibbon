// Firebase Admin SDK for server-side authentication and Firestore operations
import 'server-only'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Check if Firebase Admin is already initialized
let adminApp = null

if (getApps().length === 0) {
  // Parse service account key from environment variable
  let credential = null;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      credential = cert(serviceAccountKey);
    } catch (error) {
      console.error('Error parsing Firebase service account key:', error);
    }
  }

  try {
    const config = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    };
    
    // Add credential if available
    if (credential) {
      config.credential = credential;
    }
    
    adminApp = initializeApp(config);
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    // Fallback initialization for development
    adminApp = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
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
    console.error('Token verification error:', error)
    throw new Error('Invalid authentication token')
  }
}

export default adminApp