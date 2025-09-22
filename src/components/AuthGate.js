'use client';

import { useOptionalAuth } from '../hooks/useAuth';
import EmailVerification from './EmailVerification';

export default function AuthGate({ children }) {
  
  const authContext = useOptionalAuth();
  
  // If no auth context, just render children
  if (!authContext) {
    return children;
  }
  
  const { user, loading } = authContext;
  

  // Show email verification screen for unverified users
  if (user && !loading && !user.emailVerified) {
    return <EmailVerification />;
  }

  return children;
}