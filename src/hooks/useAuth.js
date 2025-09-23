"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  reload,
  sendPasswordResetEmail
} from 'firebase/auth';
import { useFirebaseOptimized as useFirebase } from '../lib/firebase-optimized';
import { createUserProfile } from '../lib/firestore';

// Create Auth Context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const firebase = useFirebase();
  const router = useRouter();

  useEffect(() => {
    // Don't set up auth listener until Firebase is loaded
    if (firebase.isLoading) return;
    
    // If Firebase is not configured, set loading to false and return
    if (!firebase.isConfigured || !firebase.auth) {
      setLoading(false);
      return;
    }
    
    // Set up auth listener with proper cleanup
    let unsubscribe = null;
    
    const setupAuthListener = async () => {
      try {
        // Listen for authentication state changes
        unsubscribe = onAuthStateChanged(firebase.auth, async (user) => {
          if (user) {
            // Create user profile in Firestore if it doesn't exist
            try {
              await createUserProfile(user);
            } catch (error) {
              console.error('Error creating user profile:', error);
            }
          }
          setUser(user);
          setLoading(false);
        });
      } catch (error) {
        console.error('Failed to set up auth listener:', error);
        setLoading(false);
      }
    };

    setupAuthListener();

    // Return cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [firebase.isLoading, firebase.isConfigured, firebase.auth]);

  // Show loading state while Firebase is initializing only
  if (firebase.isLoading) {
    const noopAsync = async () => ({ success: false });
    const noop = () => {};
    
    return (
      <AuthContext.Provider value={{ 
        user: null, 
        loading: true, 
        mounted: true,
        signInWithGoogle: noopAsync, 
        signUpWithEmail: noopAsync, 
        signInWithEmail: noopAsync, 
        sendVerificationEmail: noopAsync,
        checkEmailVerification: async () => ({ verified: false }),
        forgotPassword: noopAsync,
        logout: noop
      }}>
        {children}
      </AuthContext.Provider>
    );
  }

  const signInWithGoogle = async () => {
    if (!firebase.isConfigured || !firebase.auth) {
      return { success: false, error: 'Authentication is not properly configured.' };
    }
    
    try {
      const googleProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebase.auth, googleProvider);
      
      // User state will be automatically updated via onAuthStateChanged
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error.code) };
    }
  };

  const signUpWithEmail = async (email, password, name) => {
    if (!firebase.isConfigured || !firebase.auth) {
      return { success: false, error: 'Authentication is not properly configured.' };
    }
    
    try {
      const result = await createUserWithEmailAndPassword(firebase.auth, email, password);
      
      // Update user profile with name
      if (name) {
        await updateProfile(result.user, {
          displayName: name
        });
      }
      
      // Send email verification
      await sendEmailVerification(result.user);

      return { success: true, requiresVerification: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error.code) };
    }
  };

  const signInWithEmail = async (email, password) => {
    if (!firebase.isConfigured || !firebase.auth) {
      return { success: false, error: 'Authentication is not properly configured.' };
    }
    
    try {
      const result = await signInWithEmailAndPassword(firebase.auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error.code) };
    }
  };

  const logout = async () => {
    try {
      await signOut(firebase.auth);
      // Redirect to homepage after successful logout
      router.push('/');
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  // Send email verification
  const sendVerificationEmail = async () => {
    try {
      if (firebase.auth?.currentUser) {
        await sendEmailVerification(firebase.auth.currentUser);
        return { success: true };
      }
      return { success: false, error: 'No user signed in' };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error: error.message };
    }
  };

  // Check email verification status (reload user)
  const checkEmailVerification = async () => {
    try {
      if (firebase.auth?.currentUser) {
        await reload(firebase.auth.currentUser);
        // Update the user state so components re-render with new verification status
        setUser(firebase.auth.currentUser);
        return { verified: firebase.auth.currentUser.emailVerified };
      }
      return { verified: false };
    } catch (error) {
      console.error('Error checking verification status:', error);
      return { verified: false };
    }
  };

  const forgotPassword = async (email) => {
    if (!firebase.isConfigured || !firebase.auth) {
      return { success: false, error: 'Authentication is not properly configured.' };
    }
    
    try {
      await sendPasswordResetEmail(firebase.auth, email);
      
      // Always return success message for security (prevents user enumeration)
      return { 
        success: true, 
        type: 'success',
        message: 'If an account exists with this email address, we\'ve sent you a password reset link. Please check your inbox and follow the instructions.' 
      };
    } catch (error) {
      // Log detailed errors only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Password reset error:', error.code);
      }
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      // Only show specific error for client-side validation issues
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      }
      // Note: Don't reveal 'user-not-found' to prevent user enumeration
      
      return { success: false, type: 'error', error: errorMessage };
    }
  };

  // Helper function to convert Firebase error codes to user-friendly messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please wait a moment before trying again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/popup-blocked':
        return 'Popup was blocked. Please allow popups and try again.';
      case 'auth/cancelled-popup-request':
        return 'Another sign-in popup is already open.';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  const value = {
    user,
    loading,
    mounted: true,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    sendVerificationEmail,
    checkEmailVerification,
    forgotPassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Optional auth hook that doesn't crash if no provider
export const useOptionalAuth = () => {
  const context = useContext(AuthContext);
  return context;
};