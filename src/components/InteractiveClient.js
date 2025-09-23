'use client';

import { useState, useEffect, cloneElement, isValidElement, Children } from 'react';
import { useOptionalAuth } from '../hooks/useAuth';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { getFirebaseErrorMessage } from '../utils/validation';
import { signInSchema, signUpSchema, forgotPasswordSchema, getValidationError } from '../utils/schemas';
import Header from './Header';
import Footer from './Footer';
import MobileMenu from './MobileMenu';
import SignInModal from './auth/SignInModal';
import SignUpModal from './auth/SignUpModal';
import ForgotPasswordModal from './auth/ForgotPasswordModal';
import { AuthModalProvider } from '../contexts/AuthModalContext';

export default function InteractiveClient({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'signin', 'signup', or 'forgotpassword'
  const [authError, setAuthError] = useState('');
  const [authSuccessMessage, setAuthSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaitingForAuth, setIsWaitingForAuth] = useState(false);
  
  // Use optional auth that doesn't crash on pages without AuthProvider
  const authContext = useOptionalAuth();
  
  // If no auth context, provide safe defaults
  const { user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, forgotPassword, logout } = authContext || {
    user: null,
    loading: false,
    signInWithGoogle: async () => ({ success: false, error: 'No auth configured' }),
    signUpWithEmail: async () => ({ success: false, error: 'No auth configured' }),
    signInWithEmail: async () => ({ success: false, error: 'No auth configured' }),
    forgotPassword: async () => ({ success: false, error: 'No auth configured' }),
    logout: async () => ({ success: false })
  };

  // Prevent body scrolling when sidebar or modals are open
  useBodyScrollLock(isMenuOpen || activeModal !== null);

  // Watch for user authentication state changes and close modal when signed in
  useEffect(() => {
    if (isWaitingForAuth && user && (activeModal === 'signin' || activeModal === 'signup')) {
      // User successfully signed in, close the modal
      setIsWaitingForAuth(false);
      setIsSubmitting(false);
      closeModal();
    }
  }, [user, isWaitingForAuth, activeModal]);

  const openSignInModal = () => {
    setActiveModal('signin');
    clearAuthMessages();
  };
  
  const openSignUpModal = () => {
    setActiveModal('signup');
    clearAuthMessages();
  };
  
  const openForgotPasswordModal = () => {
    setActiveModal('forgotpassword');
    clearAuthMessages();
  };
  
  const closeModal = () => {
    setActiveModal(null);
    clearAuthMessages();
    setIsSubmitting(false);
    setIsWaitingForAuth(false);
  };

  const clearAuthMessages = () => {
    setAuthError('');
    setAuthSuccessMessage('');
  };

  const handleGoogleSignIn = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      clearAuthMessages();
      const result = await signInWithGoogle();
      if (result.success) {
        // Don't close modal immediately, wait for auth state change
        setIsWaitingForAuth(true);
      } else {
        setAuthError(getFirebaseErrorMessage(result.error) || 'Something went wrong. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      setAuthError(getFirebaseErrorMessage(error.code) || 'An unexpected error occurred');
      setIsSubmitting(false);
    }
    // Don't set isSubmitting to false here if successful - keep loading until auth state changes
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      clearAuthMessages();
      
      const formData = new FormData(e.target);
      const rawData = {
        email: formData.get('email'),
        password: formData.get('password')
      };
      
      // Client-side validation with Zod
      const validationResult = signInSchema.safeParse(rawData);
      if (!validationResult.success) {
        setAuthError(getValidationError(validationResult));
        setIsSubmitting(false);
        return;
      }
      
      const { email, password } = validationResult.data;
      
      const result = await signInWithEmail(email, password);
      if (result.success) {
        // Don't close modal immediately, wait for auth state change
        setIsWaitingForAuth(true);
      } else {
        setAuthError(getFirebaseErrorMessage(result.error) || 'Something went wrong. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      setAuthError(getFirebaseErrorMessage(error?.code) || 'An unexpected error occurred');
      setIsSubmitting(false);
    }
    // Don't set isSubmitting to false here if successful - keep loading until auth state changes
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      clearAuthMessages();
      
      const formData = new FormData(e.target);
      const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password')
      };
      
      // Client-side validation with Zod
      const validationResult = signUpSchema.safeParse(rawData);
      if (!validationResult.success) {
        setAuthError(getValidationError(validationResult));
        return;
      }
      
      const { name, email, password } = validationResult.data;
      
      const result = await signUpWithEmail(email, password, name);
      if (result.success) {
        if (result.requiresVerification) {
          setAuthSuccessMessage('Account created successfully! Please check your email and click the verification link to complete your registration.');
          setTimeout(() => {
            closeModal();
          }, 4000);
        } else {
          closeModal();
        }
      } else {
        setAuthError(getFirebaseErrorMessage(result.error) || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Sign up catch error:', error);
      setAuthError(getFirebaseErrorMessage(error?.code) || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      clearAuthMessages();
      
      const formData = new FormData(e.target);
      const rawData = {
        email: formData.get('email')
      };
      
      // Client-side validation with Zod
      const validationResult = forgotPasswordSchema.safeParse(rawData);
      if (!validationResult.success) {
        setAuthError(getValidationError(validationResult));
        return;
      }
      
      const { email } = validationResult.data;
      
      const result = await forgotPassword(email);
      if (result.success) {
        setAuthSuccessMessage(result.message);
        setTimeout(() => {
          closeModal();
        }, 5000);
      } else {
        setAuthError(getFirebaseErrorMessage(result.error) || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setAuthError(getFirebaseErrorMessage(error?.code) || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
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
        openSignInModal={openSignInModal}
        openSignUpModal={openSignUpModal}
      />

      {/* Auth Modal Components */}
      <SignInModal 
        isOpen={activeModal === 'signin'}
        onClose={closeModal}
        error={authError}
        loading={isSubmitting || loading || isWaitingForAuth}
        onEmailSignIn={handleEmailSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onSwitchToSignUp={openSignUpModal}
        onSwitchToForgotPassword={openForgotPasswordModal}
      />
      
      <SignUpModal 
        isOpen={activeModal === 'signup'}
        onClose={closeModal}
        error={authError || (!authError && authSuccessMessage ? '' : authError)}
        loading={isSubmitting || loading}
        onEmailSignUp={handleEmailSignUp}
        onGoogleSignIn={handleGoogleSignIn}
        onSwitchToSignIn={openSignInModal}
      />
      
      <ForgotPasswordModal 
        isOpen={activeModal === 'forgotpassword'}
        onClose={closeModal}
        error={authError}
        successMessage={authSuccessMessage}
        loading={isSubmitting || loading}
        onForgotPassword={handleForgotPassword}
        onSwitchToSignIn={openSignInModal}
      />
      </div>
    </AuthModalProvider>
  );
}