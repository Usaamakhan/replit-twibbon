// Firebase Admin SDK for server-side authentication
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

// Check if Firebase Admin is already initialized
let adminApp = null

if (getApps().length === 0) {
  // For development/testing, we can use the service account key from environment
  // In production, you would typically use a service account JSON file
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    // Note: For full production setup, you would need to add service account credentials
    // For now, we'll use the project ID which is sufficient for ID token verification
  }

  try {
    adminApp = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      // In production, add: credential: cert(serviceAccount)
    })
  } catch (error) {
    console.error('Firebase Admin initialization error:', error)
    // Fallback initialization for development
    adminApp = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })
  }
} else {
  adminApp = getApps()[0]
}

// Get Auth instance
export const adminAuth = getAuth(adminApp)

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