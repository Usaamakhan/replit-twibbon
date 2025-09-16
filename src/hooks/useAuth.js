"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  reload
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createUserProfile } from '../lib/firestore';

// Create Auth Context
const AuthContext = createContext(null);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true to prevent hydration mismatches
    setMounted(true);
    
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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

    return () => unsubscribe();
  }, []);

  // Don't block rendering with loading screen - let components handle their own loading states

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      if (process.env.NODE_ENV === 'development') {
        console.log('Starting Google sign in...');
      }
      
      const result = await signInWithPopup(auth, googleProvider);
      if (process.env.NODE_ENV === 'development') {
        console.log('Google sign in successful:', result.user.email);
      }
      
      // User state will be automatically updated via onAuthStateChanged
      setLoading(false);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Google sign in error:', error.code, error.message);
      }
      alert(`Authentication error: ${error.code} - ${error.message}`);
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email, password, fullName) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
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
      return { success: false, error: error.message };
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
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
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  // Send email verification
  const sendVerificationEmail = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
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
      if (auth.currentUser) {
        await reload(auth.currentUser);
        console.log('User reloaded, verification status:', auth.currentUser.emailVerified);
        return { verified: auth.currentUser.emailVerified };
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
      
      await sendPasswordResetEmail(auth, email);
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
    mounted,
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