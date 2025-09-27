'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useOptionalAuth } from '../hooks/useAuth';
import PageLoader from './PageLoader';

export default function AuthGate({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const authContext = useOptionalAuth();
  
  // If no auth context, just render children
  if (!authContext) {
    return children;
  }
  
  const { user, loading } = authContext;
  
  // Redirect unverified users to /verify-email (except if already there)
  useEffect(() => {
    if (user && !loading && !user.emailVerified && pathname !== '/verify-email') {
      router.replace('/verify-email');
    }
  }, [user, loading, pathname, router]);
  
  // Show full-screen loader while auth is loading
  if (loading) {
    return <PageLoader message="Loading..." />;
  }

  // Show loader while redirecting unverified users (except on verify-email page)
  if (user && !user.emailVerified && pathname !== '/verify-email') {
    return <PageLoader message="Redirecting to verification..." />;
  }

  return children;
}