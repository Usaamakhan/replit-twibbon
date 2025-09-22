'use client';

import { useFirebaseOptimized as useFirebase } from '../lib/firebase-optimized';
import { AuthProvider } from '../hooks/useAuth';
import UserOnboardingWrapper from './UserOnboardingWrapper';

export default function AuthenticatedLayout({ children }) {
  const mountTime = typeof window !== 'undefined' ? performance.now() : 0;
  
  
  const { isLoading, isConfigured } = useFirebase();
  

  // Only show loading state when Firebase is configured and initializing
  // If Firebase is not configured, render children immediately without blocking
  if (!isConfigured || isLoading) {
    return children;
  }

  // Firebase is configured - provide user onboarding wrapper
  return (
    <UserOnboardingWrapper>
      {children}
    </UserOnboardingWrapper>
  );
}