"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
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

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user);
      if (user) {
        console.log('User is signed in:', user.email);
        // Create user profile in Firestore if it doesn't exist - temporarily disabled
        // await createUserProfile(user);
      } else {
        console.log('No user signed in');
      }
      setUser(user);
      setLoading(false);
    });

    // No need to handle redirect result since we're using popup

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('=== SIGN IN BUTTON CLICKED ===');
      console.log('Using popup authentication...');
      console.log('Auth object:', auth);
      console.log('Google provider:', googleProvider);
      
      const result = await signInWithPopup(auth, googleProvider);
      console.log('=== SIGN IN SUCCESSFUL ===');
      console.log('User:', result.user);
      console.log('User email:', result.user.email);
      console.log('User display name:', result.user.displayName);
      
      // User state will be automatically updated via onAuthStateChanged
      setLoading(false);
    } catch (error) {
      console.error('=== SIGN IN ERROR ===');
      console.error('Error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      alert(`Authentication error: ${error.code} - ${error.message}`);
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email, password, fullName) => {
    try {
      setLoading(true);
      console.log('=== EMAIL SIGN UP ===');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with full name
      if (fullName) {
        await updateProfile(result.user, {
          displayName: fullName
        });
      }
      
      console.log('Sign up successful:', result.user.email);
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error('=== EMAIL SIGN UP ERROR ===');
      console.error('Error:', error.code, error.message);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true);
      console.log('=== EMAIL SIGN IN ===');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful:', result.user.email);
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error('=== EMAIL SIGN IN ERROR ===');
      console.error('Error:', error.code, error.message);
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

  const value = {
    user,
    loading,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
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