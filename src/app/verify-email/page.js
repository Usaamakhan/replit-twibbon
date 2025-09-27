'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import EmailVerification from '../../components/EmailVerification';
import PageLoader from '../../components/PageLoader';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirect to homepage if user is verified
    if (user && !loading && user.emailVerified) {
      router.replace('/');
    }
    // Redirect to signin if no user and not loading
    if (!loading && !user) {
      router.replace('/signin');
    }
  }, [user, loading, router]);

  // Show loader while auth is loading
  if (loading) {
    return <PageLoader message="Loading..." />;
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