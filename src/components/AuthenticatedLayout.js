'use client';

import { useFirebase } from '../lib/firebase-client';
import { AuthProvider } from '../hooks/useAuth';
import UserOnboardingWrapper from './UserOnboardingWrapper';

export default function AuthenticatedLayout({ children }) {
  const mountTime = typeof window !== 'undefined' ? performance.now() : 0;
  
  // Fix SSR issue - only log on client side
  if (typeof window !== 'undefined') {
    console.log('🔐 AuthenticatedLayout mounting on route:', window.location.pathname, 'Time:', new Date().toISOString());
    console.log('🗠️ AuthenticatedLayout render started at:', Date.now());
  }
  
  const { isLoading, isConfigured } = useFirebase();
  
  if (typeof window !== 'undefined') {
    const renderTime = performance.now() - mountTime;
    console.log('🔥 Firebase status in AuthenticatedLayout:', { 
      isLoading, 
      isConfigured,
      renderTime: renderTime.toFixed(2) + 'ms',
      timestamp: new Date().toISOString()
    });
  }

  // Show loading state while Firebase is initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-ping mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Your Experience</h2>
          <p className="text-gray-600">Setting up your personalized workspace...</p>
          <div className="mt-4 text-sm text-gray-500">
            Initializing authentication system
          </div>
        </div>
      </div>
    );
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