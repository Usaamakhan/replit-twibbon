'use client';

import { useFirebase } from '../lib/firebase-client';
import { AuthProvider } from '../hooks/useAuth';
import UserOnboardingWrapper from './UserOnboardingWrapper';

export default function AuthenticatedLayout({ children }) {
  // Fix SSR issue - only log on client side
  if (typeof window !== 'undefined') {
    console.log('🔐 AuthenticatedLayout mounting on route:', window.location.pathname);
    console.log('🗠️ AuthenticatedLayout render started at:', Date.now());
  }
  
  const { isLoading, isConfigured } = useFirebase();
  
  if (typeof window !== 'undefined') {
    console.log('🔥 Firebase status in AuthenticatedLayout:', { isLoading, isConfigured });
  }

  // Show loading state while Firebase is initializing
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If Firebase is not configured, show children without auth
  if (!isConfigured) {
    return children;
  }

  // Firebase is configured - provide user onboarding wrapper
  return (
    <UserOnboardingWrapper>
      {children}
    </UserOnboardingWrapper>
  );
}