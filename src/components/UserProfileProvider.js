"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useOptionalAuth } from '../hooks/useAuth';
import { getUserProfile } from '../lib/firestore';

// Create User Profile Context
const UserProfileContext = createContext(null);

export function UserProfileProvider({ children }) {
  const { user, loading: authLoading } = useOptionalAuth() || { user: null, loading: false };
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data from Firestore when user changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserProfile();
    }
  }, [user, authLoading]);

  // Function to update the user profile in context (called after profile updates)
  const updateUserProfile = (updatedProfile) => {
    setUserProfile(updatedProfile);
  };

  // Function to refresh user profile from Firestore
  const refreshUserProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  const value = {
    userProfile,
    loading: authLoading || loading,
    updateUserProfile,
    refreshUserProfile
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

// Optional hook that doesn't crash if no provider
export const useOptionalUserProfile = () => {
  const context = useContext(UserProfileContext);
  return context;
};