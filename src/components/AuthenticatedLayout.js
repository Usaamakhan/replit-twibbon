'use client';

import { useFirebase } from '../lib/firebase-client';
import { AuthProvider } from '../hooks/useAuth';
import UserOnboardingWrapper from './UserOnboardingWrapper';

export default function AuthenticatedLayout({ children }) {
  const { isLoading, isConfigured } = useFirebase();

  // Show loading state while Firebase is initializing
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If Firebase is not configured, show children without auth
  if (!isConfigured) {
    return children;
  }

  // Provide auth context for authenticated pages
  return (
    <AuthProvider>
      <UserOnboardingWrapper>
        {children}
      </UserOnboardingWrapper>
    </AuthProvider>
  );
}