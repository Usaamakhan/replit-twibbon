"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { useFirebase } from '../lib/firebase-client';
import { createUserProfile } from '../lib/firestore';

// Create Auth Context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const firebase = useFirebase();

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
        const { onAuthStateChanged } = await import('firebase/auth');
        
        // Listen for authentication state changes
        unsubscribe = onAuthStateChanged(firebase.auth, async (user) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Auth state changed:', user ? user.email : 'No user');
          }
          if (user) {
            if (process.env.NODE_ENV === 'development') {
              console.log('Email verified:', user.emailVerified);
            }
            // Create user profile in Firestore if it doesn't exist
            try {
              await createUserProfile(user);
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.error('Error creating user profile:', error);
              }
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

  // Show loading state while Firebase is initializing
  if (firebase.isLoading || loading) {
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
    try {
      setLoading(true);
      if (process.env.NODE_ENV === 'development') {
        console.log('Starting Google sign in...');
      }
      
      const [{ signInWithPopup, GoogleAuthProvider }] = await Promise.all([
        import('firebase/auth')
      ]);
      
      const googleProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebase.auth, googleProvider);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Google sign in successful:', result.user.email);
      }
      
      // User state will be automatically updated via onAuthStateChanged
      setLoading(false);
      return { success: true };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Google sign in error:', error.code, error.message);
      }
      setLoading(false);
      return { success: false, error: error.code };
    }
  };

  const signUpWithEmail = async (email, password, fullName) => {
    try {
      setLoading(true);
      
      const { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } = await import('firebase/auth');
      
      const result = await createUserWithEmailAndPassword(firebase.auth, email, password);
      
      // Update user profile with full name
      if (fullName) {
        await updateProfile(result.user, {
          displayName: fullName
        });
      }
      
      // Send email verification
      await sendEmailVerification(result.user);
      if (process.env.NODE_ENV === 'development') {
        console.log('Email sign up successful, verification email sent to:', result.user.email);
      }
      
      setLoading(false);
      return { success: true, requiresVerification: true };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Email sign up error:', error.code, error.message);
      }
      setLoading(false);
      return { success: false, error: error.code };
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true);
      
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      
      const result = await signInWithEmailAndPassword(firebase.auth, email, password);
      if (process.env.NODE_ENV === 'development') {
        console.log('Email sign in successful:', result.user.email);
      }
      setLoading(false);
      return { success: true };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Email sign in error:', error.code, error.message);
      }
      setLoading(false);
      return { success: false, error: error.code };
    }
  };

  const logout = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(firebase.auth);
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  // Send email verification
  const sendVerificationEmail = async () => {
    try {
      if (firebase.auth?.currentUser) {
        const { sendEmailVerification } = await import('firebase/auth');
        await sendEmailVerification(firebase.auth.currentUser);
        console.log('Verification email sent');
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
        const { reload } = await import('firebase/auth');
        await reload(firebase.auth.currentUser);
        // Update the user state so components re-render with new verification status
        setUser(firebase.auth.currentUser);
        console.log('User reloaded, verification status:', firebase.auth.currentUser.emailVerified);
        return { verified: firebase.auth.currentUser.emailVerified };
      }
      return { verified: false };
    } catch (error) {
      console.error('Error checking verification status:', error);
      return { verified: false };
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      
      // Only log in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log('Attempting password reset');
      }
      
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(firebase.auth, email);
      setLoading(false);
      
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
      
      setLoading(false);
      return { success: false, type: 'error', error: errorMessage };
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
  if (typeof window !== 'undefined') {
    console.log('🔑 useAuth called from route:', window.location.pathname);
    console.log('📍 useAuth call stack trace:', new Error().stack?.split('\n')[2]);
  }
  
  const context = useContext(AuthContext);
  if (!context) {
    if (typeof window !== 'undefined') {
      console.error('❌ CRITICAL: useAuth called without AuthProvider on route:', window.location.pathname);
      console.error('📍 Stack trace:', new Error().stack);
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Optional auth hook that doesn't crash if no provider
export const useOptionalAuth = () => {
  if (typeof window !== 'undefined') {
    console.log('🔓 useOptionalAuth called from route:', window.location.pathname);
  }
  const context = useContext(AuthContext);
  
  if (!context) {
    if (typeof window !== 'undefined') {
      console.log('ℹ️ No auth context available (optional), returning null');
    }
    return null;
  }
  
  return context;
};