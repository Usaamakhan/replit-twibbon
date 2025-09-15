"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { 
  signInWithRedirect, 
  getRedirectResult, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged
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
        // Create user profile in Firestore if it doesn't exist
        await createUserProfile(user);
      } else {
        console.log('No user signed in');
      }
      setUser(user);
      setLoading(false);
    });

    // Handle redirect result on page load
    const handleRedirectResult = async () => {
      try {
        console.log('Checking for redirect result...');
        const result = await getRedirectResult(auth);
        console.log('Redirect result:', result);
        
        if (result) {
          // Successfully signed in
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential?.accessToken;
          console.log('Sign-in successful:', result.user);
          console.log('User email:', result.user.email);
          console.log('User display name:', result.user.displayName);
          
          // Create user profile in Firestore
          await createUserProfile(result.user);
          console.log('User profile created in Firestore');
        } else {
          console.log('No redirect result found');
        }
      } catch (error) {
        console.error('Redirect handling error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        alert(`Redirect error: ${error.message}`);
        setLoading(false);
      }
    };

    handleRedirectResult();

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('Starting Google sign-in...');
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error('Sign-in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      alert(`Authentication error: ${error.message}`);
      setLoading(false);
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