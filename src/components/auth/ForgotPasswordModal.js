"use client";

import { useEffect, useRef, useState } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { validateEmail } from '../../utils/validation';

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
  const [validationErrors, setValidationErrors] = useState({}); // Track form validation errors
  const [fieldValidation, setFieldValidation] = useState({}); // Track real-time validation status
  
  // Refs for form validation scrolling
  const emailRef = useRef();

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
      email: emailRef
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

    setValidationErrors(newErrors);
    
    // If there are errors, scroll to the first error field
    if (firstErrorField) {
      setTimeout(() => scrollToField(firstErrorField), 100);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change for real-time validation
  const handleInputChange = (field, value) => {
    // Clear form validation errors when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Perform real-time validation
    let validationError = null;
    let isValid = false;
    
    if (field === 'email' && value.trim()) {
      validationError = validateEmail(value);
      isValid = !validationError;
    }
    
    // Update field validation status
    setFieldValidation(prev => ({
      ...prev,
      [field]: {
        isValid,
        error: validationError,
        hasValue: value.trim().length > 0
      }
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (validateForm(formData)) {
      onForgotPassword(e); // Pass original event to parent handler
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
              <form className="space-y-4 mb-6" onSubmit={handleFormSubmit} noValidate>
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
                  <div className="relative">
                    <input
                      ref={emailRef}
                      id="forgot-password-email"
                      type="email"
                      name="email"
                      required
                      placeholder="Enter your email address"
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 sm:px-4 py-2 pr-10 border rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm sm:text-base text-gray-900 placeholder-gray-600 ${
                        validationErrors.email ? 'border-red-300 bg-red-50' : 
                        fieldValidation.email?.isValid ? 'border-emerald-300 bg-emerald-50' :
                        fieldValidation.email?.hasValue ? 'border-red-300 bg-red-50' :
                        'border-gray-300'
                      }`}
                      aria-describedby={validationErrors.email ? "forgot-email-error" : (error || successMessage) ? "forgot-password-alert" : "forgot-password-help"}
                    />
                    {/* Validation Icon */}
                    {(validationErrors.email || (fieldValidation.email?.hasValue && !fieldValidation.email?.isValid)) && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {fieldValidation.email?.isValid && !validationErrors.email ? (
                          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg 
                            className="w-5 h-5 text-red-500" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                  {validationErrors.email && (
                    <p id="forgot-email-error" className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
                  )}
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
                    className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium ml-1 cursor-pointer transition-all duration-200"
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