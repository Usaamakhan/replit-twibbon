'use client';

import { useAuth } from '../hooks/useAuth';
import EmailVerification from './EmailVerification';

export default function AuthGate({ children }) {
  const { user, loading } = useAuth();

  // Show email verification screen for unverified users
  if (user && !loading && !user.emailVerified) {
    return <EmailVerification />;
  }

  return children;
}