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
      if (user) {
        // Create user profile in Firestore if it doesn't exist
        await createUserProfile(user);
      }
      setUser(user);
      setLoading(false);
    });

    // Handle redirect result on page load
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // Successfully signed in
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential?.accessToken;
          console.log('Sign-in successful:', result.user);
          
          // Create user profile in Firestore
          await createUserProfile(result.user);
        }
      } catch (error) {
        console.error('Sign-in error:', error);
        setLoading(false);
      }
    };

    handleRedirectResult();

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error('Sign-in error:', error);
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