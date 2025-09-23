'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import Header from './Header';
import Footer from './Footer';
import MobileMenu from './MobileMenu';
import { AuthModalProvider } from '../contexts/AuthModalContext';

export default function InteractiveClient({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  // Prevent body scrolling when sidebar is open
  useBodyScrollLock(isMenuOpen);

  // Navigation functions for auth pages
  const openSignInModal = () => {
    router.push('/signin');
  };
  
  const openSignUpModal = () => {
    router.push('/signup');
  };
  
  const openForgotPasswordModal = () => {
    router.push('/forgot-password');
  };
  
  const closeModal = () => {
    // For backward compatibility - navigates to home
    router.push('/');
  };


  const authModalContextValue = {
    openSignInModal,
    openSignUpModal,
    openForgotPasswordModal,
    closeModal
  };

  return (
    <AuthModalProvider value={authModalContextValue}>
      <div className="min-h-screen flex flex-col relative">
        {/* Main Content with blur effect */}
        <div className={`min-h-screen flex flex-col transition-all duration-300 ${
          isMenuOpen ? 'blur-sm' : ''
        }`}>
          <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>

      {/* Mobile Menu Component */}
      <MobileMenu 
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />
      </div>
    </AuthModalProvider>
  );
}