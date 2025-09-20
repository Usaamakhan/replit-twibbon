'use client';

import { useFirebase } from '../lib/firebase-client';
import { AuthProvider } from '../hooks/useAuth';
import UserOnboardingWrapper from './UserOnboardingWrapper';

export default function AuthenticatedLayout({ children }) {
  const mountTime = typeof window !== 'undefined' ? performance.now() : 0;
  
  // Debug logs only when explicitly enabled
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG === '1') {
    console.log('🔐 AuthenticatedLayout mounting on route:', window.location.pathname, 'Time:', new Date().toISOString());
    console.log('🗠️ AuthenticatedLayout render started at:', Date.now());
  }
  
  const { isLoading, isConfigured } = useFirebase();
  
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG === '1') {
    const renderTime = performance.now() - mountTime;
    console.log('🔥 Firebase status in AuthenticatedLayout:', { 
      isLoading, 
      isConfigured,
      renderTime: renderTime.toFixed(2) + 'ms',
      timestamp: new Date().toISOString()
    });
  }

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