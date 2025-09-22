"use client";

import { useEffect, useRef, useState } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export default function SignInModal({ 
  isOpen,
  onClose, 
  error,
  loading,
  onEmailSignIn, 
  onGoogleSignIn,
  onSwitchToSignUp,
  onSwitchToForgotPassword
}) {
  const modalRef = useFocusTrap(isOpen);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Refs for form validation scrolling
  const emailRef = useRef();
  const passwordRef = useRef();

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscapeEvent = () => {
      onClose();
    };

    document.addEventListener('modal-escape', handleEscapeEvent);
    return () => {
      document.removeEventListener('modal-escape', handleEscapeEvent);
    };
  }, [isOpen, onClose]);

  // Clear validation errors when modal opens
  useEffect(() => {
    if (isOpen) {
      setValidationErrors({});
    }
  }, [isOpen]);

  const scrollToField = (fieldName) => {
    const fieldRefs = {
      email: emailRef,
      password: passwordRef
    };
    
    const fieldRef = fieldRefs[fieldName];
    if (fieldRef?.current) {
      fieldRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      // Focus the field after scrolling
      setTimeout(() => {
        fieldRef.current.focus();
      }, 300);
    }
  };

  const validateForm = (formData) => {
    const newErrors = {};
    let firstErrorField = null;

    if (!formData.get('email')?.trim()) {
      newErrors.email = 'Email is required';
      if (!firstErrorField) firstErrorField = 'email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.get('email'))) {
      newErrors.email = 'Please enter a valid email address';
      if (!firstErrorField) firstErrorField = 'email';
    }

    if (!formData.get('password')?.trim()) {
      newErrors.password = 'Password is required';
      if (!firstErrorField) firstErrorField = 'password';
    }

    setValidationErrors(newErrors);
    
    // If there are errors, scroll to the first error field
    if (firstErrorField) {
      setTimeout(() => scrollToField(firstErrorField), 100);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (validateForm(formData)) {
      onEmailSignIn(e); // Pass original event to parent handler
    }
  };

  const handleInputChange = (field) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 backdrop-blur-sm z-40" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
          <div 
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto border-2 border-emerald-600 my-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="signin-title"
            aria-describedby="signin-description"
          >
            {/* Header */}
            <div className="bg-yellow-400 rounded-t-xl p-4 sm:p-6 text-center relative">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-700 hover:text-gray-900 transition-colors"
                aria-label="Close sign in modal"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 id="signin-title" className="text-xl sm:text-2xl font-bold text-emerald-700">Welcome Back!</h2>
              <p id="signin-description" className="text-sm sm:text-base text-gray-700 mt-2">Sign in to your account</p>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {/* Email Sign In Form */}
              <form className="space-y-4 mb-6" onSubmit={handleFormSubmit} noValidate>
                {error && (
                  <div id="signin-error" className="text-red-600 text-sm text-center p-2 bg-red-50 rounded-lg" role="alert">
                    {error}
                  </div>
                )}
                <div>
                  <label htmlFor="signin-email" className="block text-sm font-medium text-gray-800 mb-1">
                    Email
                  </label>
                  <input
                    ref={emailRef}
                    id="signin-email"
                    type="email"
                    name="email"
                    required
                    placeholder="Enter your email"
                    onChange={() => handleInputChange('email')}
                    className={`w-full px-3 sm:px-4 py-2 border rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm sm:text-base text-gray-900 placeholder-gray-600 ${
                      validationErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    aria-describedby={error || validationErrors.email ? "signin-error" : undefined}
                  />
                  {validationErrors.email && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="signin-password" className="block text-sm font-medium text-gray-800 mb-1">
                    Password
                  </label>
                  <input
                    ref={passwordRef}
                    id="signin-password"
                    type="password"
                    name="password"
                    required
                    placeholder="Enter your password"
                    onChange={() => handleInputChange('password')}
                    className={`w-full px-3 sm:px-4 py-2 border rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm sm:text-base text-gray-900 placeholder-gray-600 ${
                      validationErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    aria-describedby={error || validationErrors.password ? "signin-error" : undefined}
                  />
                  {validationErrors.password && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.password}</p>
                  )}
                  <div className="text-right mt-2">
                    <button
                      type="button"
                      onClick={onSwitchToForgotPassword}
                      className="text-sm text-emerald-700 hover:text-emerald-800 hover:underline font-medium cursor-pointer transition-all duration-200"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-full py-2.5 sm:py-3 px-4 font-medium transition-all duration-200 hover-zoom text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-describedby={loading ? "signin-loading" : undefined}
                >
                  {loading ? (
                    <>
                      <span className="sr-only" id="signin-loading">Signing in, please wait</span>
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">or</span>
                </div>
              </div>

              {/* Google Sign In */}
              <div className="text-center mb-6">
                <button
                  onClick={onGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-white border-2 border-gray-200 hover:border-emerald-300 rounded-full py-2.5 sm:py-3 px-4 flex items-center justify-center gap-3 transition-all duration-200 hover-zoom disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {loading ? 'Signing In...' : 'Continue with Google'}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Don't have an account? 
                  <button 
                    onClick={onSwitchToSignUp}
                    className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium ml-1 cursor-pointer transition-all duration-200"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}