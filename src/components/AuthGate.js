'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useOptionalAuth } from '../hooks/useAuth';
import PageLoader from './PageLoader';

export default function AuthGate({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const authContext = useOptionalAuth();
  const [forceLoad, setForceLoad] = useState(false);
  
  // Extract auth data (safe to call even if authContext is null)
  const user = authContext?.user;
  const loading = authContext?.loading;
  
  // Failsafe timeout for auth loading - force load after 2 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authContext?.loading) {
        console.log('AuthGate timeout: forcing app to load');
        setForceLoad(true);
      }
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [authContext?.loading]);
  
  // Redirect unverified users to /verify-email (except if already there)
  // Must be called before any conditional returns
  useEffect(() => {
    if (authContext && user && !loading && !user.emailVerified && pathname !== '/verify-email') {
      router.replace('/verify-email');
    }
  }, [authContext, user, loading, pathname, router]);
  
  // If no auth context, just render children
  if (!authContext) {
    return children;
  }
  
  // Show full-screen loader while auth is loading (unless force load is active)
  if (loading && !forceLoad) {
    return <PageLoader message="Loading..." />;
  }

  // Show loader while redirecting unverified users (except on verify-email page)
  if (user && !user.emailVerified && pathname !== '/verify-email') {
    return <PageLoader message="Redirecting to verification..." />;
  }

  return children;
}