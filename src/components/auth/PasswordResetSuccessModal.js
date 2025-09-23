"use client";

import { useEffect } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export default function PasswordResetSuccessModal({ 
  isOpen,
  onClose, 
  message,
  onGoToSignIn
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
            aria-labelledby="password-reset-success-title"
            aria-describedby="password-reset-success-description"
          >
            {/* Header */}
            <div className="bg-yellow-400 rounded-t-xl p-4 sm:p-6 text-center relative">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full p-1 transition-all duration-200 hover:scale-110"
                aria-label="Close success message"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center justify-center mb-2">
                <svg className="w-8 h-8 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 id="password-reset-success-title" className="text-xl sm:text-2xl font-bold text-emerald-700">Email Sent!</h2>
              <p id="password-reset-success-description" className="text-sm sm:text-base text-gray-700 mt-2">Check your inbox for next steps</p>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 text-center">
              {/* Success Message */}
              <div className="mb-6">
                <p className="text-gray-800 mb-4">
                  {message || "If an account exists for that email, we've sent you a password reset link."}
                </p>
                
                {/* Helpful Tips */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                  <h3 className="text-sm font-medium text-green-800 mb-2">Helpful tips:</h3>
                  <ul className="text-xs text-green-700 space-y-1 list-disc list-inside">
                    <li>Check your spam/junk folder if you don't see the email</li>
                    <li>The reset link will expire in 24 hours</li>
                    <li>You can request another reset link if needed</li>
                    <li>Make sure to use the most recent email if you request multiple resets</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={onGoToSignIn}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-full py-2.5 sm:py-3 px-4 font-medium transition-all duration-200 hover-zoom text-sm sm:text-base"
                >
                  Back to Sign In
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full py-2.5 sm:py-3 px-4 font-medium transition-all duration-200 text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}