"use client";

import { useEffect } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export default function ForgotPasswordModal({ 
  isOpen,
  onClose, 
  error,
  successMessage,
  loading,
  onForgotPassword,
  onSwitchToSignIn
}) {
  const modalRef = useFocusTrap(isOpen);

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
            aria-labelledby="forgot-password-title"
            aria-describedby="forgot-password-description"
          >
            {/* Header */}
            <div className="bg-yellow-400 rounded-t-xl p-4 sm:p-6 text-center relative">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-700 hover:text-gray-900 transition-colors"
                aria-label="Close forgot password modal"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 id="forgot-password-title" className="text-xl sm:text-2xl font-bold text-emerald-700">Reset Password</h2>
              <p id="forgot-password-description" className="text-sm sm:text-base text-gray-700 mt-2">We'll send you a reset link</p>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {/* Forgot Password Form */}
              <form className="space-y-4 mb-6" onSubmit={onForgotPassword} noValidate>
                {(error || successMessage) && (
                  <div 
                    id="forgot-password-alert"
                    className={`text-sm text-center p-2 rounded-lg ${
                      successMessage
                        ? 'text-green-700 bg-green-50' 
                        : 'text-red-600 bg-red-50'
                    }`}
                    role="alert"
                  >
                    {successMessage || error}
                  </div>
                )}
                <div>
                  <label htmlFor="forgot-password-email" className="block text-sm font-medium text-gray-800 mb-1">
                    Email Address
                  </label>
                  <input
                    id="forgot-password-email"
                    type="email"
                    name="email"
                    required
                    placeholder="Enter your email address"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm sm:text-base text-gray-900 placeholder-gray-600"
                    aria-describedby={(error || successMessage) ? "forgot-password-alert" : "forgot-password-help"}
                  />
                  <div id="forgot-password-help" className="text-xs text-gray-500 mt-1">
                    Enter the email address associated with your account
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-full py-2.5 sm:py-3 px-4 font-medium transition-all duration-200 hover-zoom text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-describedby={loading ? "forgot-password-loading" : undefined}
                >
                  {loading ? (
                    <>
                      <span className="sr-only" id="forgot-password-loading">Sending reset link, please wait</span>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Remember your password? 
                  <button 
                    onClick={onSwitchToSignIn}
                    className="text-emerald-700 hover:text-emerald-800 font-medium ml-1"
                  >
                    Sign In
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