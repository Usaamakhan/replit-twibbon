'use client';

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from './Header';
import MobileMenu from './MobileMenu';
import AuthModal from './AuthModal';

export default function InteractiveClient({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'signin' or 'signup'
  const [authError, setAuthError] = useState('');
  const { user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, logout } = useAuth();

  const openSignInModal = () => {
    setActiveModal('signin');
    setAuthError('');
  };
  
  const openSignUpModal = () => {
    setActiveModal('signup');
    setAuthError('');
  };
  
  const closeModal = () => {
    setActiveModal(null);
    setAuthError('');
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    closeModal();
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setAuthError('');
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    const result = await signInWithEmail(email, password);
    if (result.success) {
      closeModal();
    } else {
      setAuthError(result.error);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setAuthError('');
    const formData = new FormData(e.target);
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const password = formData.get('password');
    
    const result = await signUpWithEmail(email, password, fullName);
    if (result.success) {
      if (result.requiresVerification) {
        setAuthError('Account created successfully! Please check your email and click the verification link before signing in.');
        setTimeout(() => {
          closeModal();
        }, 3000);
      } else {
        closeModal();
      }
    } else {
      setAuthError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Main Content with blur effect */}
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${
        isMenuOpen ? 'blur-sm' : ''
      }`}>
        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Mobile Menu Component */}
      <MobileMenu 
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        openSignInModal={openSignInModal}
        openSignUpModal={openSignUpModal}
      />

      {/* Auth Modal Component */}
      <AuthModal 
        activeModal={activeModal}
        closeModal={closeModal}
        authError={authError}
        setActiveModal={setActiveModal}
        handleEmailSignIn={handleEmailSignIn}
        handleEmailSignUp={handleEmailSignUp}
        handleGoogleSignIn={handleGoogleSignIn}
      />
    </div>
  );
}