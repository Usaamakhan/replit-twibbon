'use client';

import { useOptionalAuth } from '../hooks/useAuth';
import EmailVerification from './EmailVerification';
import PageLoader from './PageLoader';

export default function AuthGate({ children }) {
  
  const authContext = useOptionalAuth();
  
  // If no auth context, just render children
  if (!authContext) {
    return children;
  }
  
  const { user, loading } = authContext;
  
  // Show full-screen loader while auth is loading
  if (loading) {
    return <PageLoader message="Loading..." />;
  }

  // Show email verification screen for unverified users
  if (user && !user.emailVerified) {
    return <EmailVerification />;
  }

  return children;
}