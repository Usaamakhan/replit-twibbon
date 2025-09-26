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
import { getFirebaseErrorMessage } from '../utils/validation';
import { isLikelyNetworkError, getContextualErrorMessage, isOnline } from '../utils/networkUtils';

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
      // Check if this is a network connectivity issue
      const isNetworkIssue = await isLikelyNetworkError(error);
      
      if (isNetworkIssue) {
        return { 
          success: false, 
          error: await getContextualErrorMessage(error, 'Unable to connect to Google. Please check your internet connection and try again.') 
        };
      }
      
      // For actual authentication errors, show specific user-friendly messages
      return { success: false, error: getFirebaseErrorMessage(error.code) };
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
      // Check if this is a network connectivity issue
      const isNetworkIssue = await isLikelyNetworkError(error);
      
      if (isNetworkIssue) {
        return { 
          success: false, 
          error: await getContextualErrorMessage(error, 'Unable to connect. Please check your internet connection and try again.') 
        };
      }
      
      // For actual Firebase errors, show specific user-friendly messages
      return { success: false, error: getFirebaseErrorMessage(error.code) };
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
      // Check if this is likely a network connectivity issue
      const isNetworkIssue = await isLikelyNetworkError(error);
      
      if (isNetworkIssue) {
        return { 
          success: false, 
          error: await getContextualErrorMessage(error, 'Unable to connect. Please check your internet connection and try again.') 
        };
      }
      
      // Check if verbose error messages are enabled (default: true for simple app)
      const verboseErrors = process.env.NEXT_PUBLIC_AUTH_VERBOSE_ERRORS !== 'false';
      
      if (verboseErrors) {
        // Debug: Log actual error code to understand Firebase behavior
        if (process.env.NODE_ENV === 'development') {
          console.log('Firebase signin error code:', error.code);
        }
        
        // Provide specific error messages for better user experience
        if (error.code === 'auth/user-not-found') {
          return { success: false, error: 'No account found with this email address' };
        } else if (error.code === 'auth/wrong-password') {
          return { success: false, error: 'Incorrect password. If you forgot your password, click "Forgot Password?" below' };
        } else if (error.code === 'auth/invalid-credential') {
          // Modern Firebase often returns this instead of specific codes
          // For user experience, we'll treat this as wrong password since user exists enough to get a credential check
          return { success: false, error: 'Incorrect password. If you forgot your password, click "Forgot Password?" below' };
        } else if (error.code === 'auth/invalid-email') {
          return { success: false, error: 'Please enter a valid email address' };
        } else if (error.code === 'auth/too-many-requests') {
          return { success: false, error: 'Too many attempts. Please try again in a few minutes' };
        }
        
        // For unknown errors, provide a generic helpful message
        return { success: false, error: 'Sign in failed. Please check your email and password and try again.' };
      } else {
        // Security mode: Use generic message to prevent user enumeration
        if (error.code === 'auth/invalid-email') {
          return { success: false, error: 'Please enter a valid email address' };
        } else if (error.code === 'auth/too-many-requests') {
          return { success: false, error: 'Too many attempts. Please try again in a few minutes' };
        }
        
        // Generic message for authentication errors
        return { success: false, error: 'Invalid email or password. Please check your credentials and try again.' };
      }
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
      
      // Check if this is a network connectivity issue
      const isNetworkIssue = await isLikelyNetworkError(error);
      
      if (isNetworkIssue) {
        return { 
          success: false, 
          error: await getContextualErrorMessage(error, 'Unable to send verification email. Please check your internet connection and try again.') 
        };
      }
      
      // For actual Firebase errors, show specific user-friendly messages
      return { success: false, error: getFirebaseErrorMessage(error.code) };
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
    
    // Check if verbose error messages are enabled (default: true for simple app)
    const verboseErrors = process.env.NEXT_PUBLIC_AUTH_VERBOSE_ERRORS !== 'false';
    
    if (verboseErrors) {
      // For simple app with verbose errors, try to check if user exists first
      try {
        // First check if the user exists by trying to get user methods
        // This is a workaround since Firebase no longer provides user-not-found for password reset
        const methods = await import('firebase/auth').then(auth => auth.fetchSignInMethodsForEmail(firebase.auth, email));
        
        if (methods.length === 0) {
          // No sign-in methods means user doesn't exist
          return { success: false, type: 'error', error: 'No account found with this email address' };
        }
        
        // User exists, proceed with password reset
        await sendPasswordResetEmail(firebase.auth, email);
        return { 
          success: true, 
          type: 'success',
          message: 'Password reset link sent! Check your email and spam folder.' 
        };
        
      } catch (error) {
        // Debug: Log actual error code to understand Firebase behavior
        if (process.env.NODE_ENV === 'development') {
          console.log('Firebase forgot password error code:', error.code);
        }
        
        // Check for network connectivity issues first
        const isNetworkIssue = await isLikelyNetworkError(error);
        
        if (isNetworkIssue) {
          return { 
            success: false, 
            type: 'error', 
            error: await getContextualErrorMessage(error, 'Unable to connect. Please check your internet connection and try again.') 
          };
        }
        
        // Handle specific error cases
        if (error.code === 'auth/invalid-email') {
          return { success: false, type: 'error', error: 'Please enter a valid email address' };
        } else if (error.code === 'auth/too-many-requests') {
          return { success: false, type: 'error', error: 'Too many reset requests. Please wait before trying again' };
        } else if (error.code === 'auth/user-not-found') {
          return { success: false, type: 'error', error: 'No account found with this email address' };
        }
        
        // For unknown errors, provide a helpful generic message
        return { success: false, type: 'error', error: 'Unable to send reset email. Please try again.' };
      }
    } else {
      // Security mode: Always return success to prevent user enumeration
      try {
        await sendPasswordResetEmail(firebase.auth, email);
        return { 
          success: true, 
          type: 'success',
          message: 'If this email is associated with an account, we\'ve sent a password reset link. Please check your inbox and spam folder.' 
        };
      } catch (error) {
        // Only show specific errors for client-side validation issues
        if (error.code === 'auth/invalid-email') {
          return { success: false, type: 'error', error: 'Please enter a valid email address' };
        } else if (error.code === 'auth/too-many-requests') {
          return { success: false, type: 'error', error: 'Too many reset requests. Please wait before trying again' };
        }
        
        // For all other errors, return success to prevent enumeration
        return { 
          success: true, 
          type: 'success',
          message: 'If this email is associated with an account, we\'ve sent a password reset link. Please check your inbox and spam folder.' 
        };
      }
    }
  };

  // Note: Using centralized error handling from utils/validation.js

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