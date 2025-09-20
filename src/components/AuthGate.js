'use client';

import { useOptionalAuth } from '../hooks/useAuth';
import EmailVerification from './EmailVerification';

export default function AuthGate({ children }) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG === '1') {
    console.log('🚧 AuthGate rendering on route:', window.location.pathname);
  }
  
  const authContext = useOptionalAuth();
  
  // If no auth context, just render children
  if (!authContext) {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG === '1') {
      console.log('ℹ️ AuthGate: No auth context, rendering children directly');
    }
    return children;
  }
  
  const { user, loading } = authContext;
  
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG === '1') {
    console.log('🔐 AuthGate auth status:', { hasUser: !!user, loading });
  }

  // Show email verification screen for unverified users
  if (user && !loading && !user.emailVerified) {
    return <EmailVerification />;
  }

  return children;
}