'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import EmailVerification from '../../components/EmailVerification';
import PageLoader from '../../components/PageLoader';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, loading, pendingSignupUserId } = useAuth();

  useEffect(() => {
    // Redirect to homepage if user is verified
    if (user && !loading && user.emailVerified) {
      router.replace('/');
    }
    // Only redirect to signin if auth is done loading, there's no user, AND no pending signup
    // This prevents the race condition during signup flow
    if (!loading && !user && !pendingSignupUserId) {
      router.replace('/signin');
    }
  }, [user, loading, pendingSignupUserId, router]);

  // Show loader while auth is loading
  if (loading) {
    return <PageLoader message="Loading..." />;
  }

  // Show loader while pending signup (waiting for auth state to update)
  if (pendingSignupUserId) {
    return <PageLoader message="Setting up your account..." />;
  }

  // Show loader while redirecting if no user
  if (!user) {
    return <PageLoader message="Redirecting..." />;
  }

  // Show email verification if user exists but is not verified
  if (user && !user.emailVerified) {
    return <EmailVerification />;
  }

  // Fallback - shouldn't reach here but just in case
  return <PageLoader message="Redirecting..." />;
}