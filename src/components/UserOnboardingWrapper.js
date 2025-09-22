'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import WelcomePopup from './WelcomePopup';
import { completeUserProfile, getUserProfile, updateUserProfile } from '../lib/firestore';

export default function UserOnboardingWrapper({ children }) {
  const { user, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!user || loading) return;

      // For email/password users, check if email is verified first
      if (user.providerData[0]?.providerId === 'password' && !user.emailVerified) {
        return;
      }

      setCheckingProfile(true);
      
      // Add a small delay to ensure Firebase auth state has stabilized after verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        let userProfile = await getUserProfile(user.uid);
        
        // If profile doesn't exist, wait a bit and try again (profile creation might be in progress)
        if (!userProfile) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          userProfile = await getUserProfile(user.uid);
        }
        
        // If still no profile, this is unexpected
        if (!userProfile) {
          return;
        }
        
        
        // Show welcome popup if user exists but hasn't completed profile setup
        if (userProfile && !userProfile.profileCompleted) {
          setShowWelcome(true);
        } else if (userProfile) {
        }
      } catch (error) {
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfileStatus();
  }, [user, loading]);

  const handleCompleteProfile = async (formData) => {
    if (!user) return;

    try {
      // Prepare profile data
      const profileData = {
        username: formData.username,
        displayName: formData.displayName,
        country: formData.country,
        bio: formData.bio,
      };

      // Handle profile image (in a real app, you'd upload to storage service)
      if (formData.profilePicPreview && formData.profilePicPreview !== user.photoURL) {
        profileData.profileImage = formData.profilePicPreview;
      }

      // Handle banner image
      if (formData.profileBannerPreview) {
        profileData.bannerImage = formData.profileBannerPreview;
      }

      const result = await completeUserProfile(user.uid, profileData);
      
      if (result.success) {
        setShowWelcome(false);
        // Optional: Show success message or redirect
      } else {
        throw new Error(result.error || 'Failed to complete profile');
      }
    } catch (error) {
      throw error; // Re-throw to let WelcomePopup handle the error display
    }
  };

  const handleSkipWelcome = async () => {
    setShowWelcome(false);
    // Mark as completed but with minimal info (no username validation needed)
    if (user) {
      try {
        await updateUserProfile(user.uid, { profileCompleted: true });
      } catch (error) {
      }
    }
  };

  // Don't render welcome popup if still loading or checking
  if (loading || checkingProfile) {
    return children;
  }

  return (
    <>
      {children}
      
      <WelcomePopup
        isOpen={showWelcome}
        onClose={handleSkipWelcome}
        onComplete={handleCompleteProfile}
      />
    </>
  );
}