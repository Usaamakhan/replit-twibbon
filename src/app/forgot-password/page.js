"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateEmail } from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { user, loading: authLoading, forgotPassword } = useAuth();
  
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldValidation, setFieldValidation] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Refs for form validation scrolling
  const emailRef = useRef();

  // Redirect if already signed in
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/');
    }
  }, [user, authLoading, router]);

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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (!validateForm(formData)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await forgotPassword(formData.get('email'));
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show success message
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            {/* Header */}
            <div className="bg-yellow-400 rounded-t-xl p-4 sm:p-6 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-emerald-700">Check Your Email</h2>
              <p className="text-sm sm:text-base text-gray-700 mt-2">Reset link sent successfully</p>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to your email address. Click the link to reset your password.
              </p>
              
              <div className="text-sm text-gray-500 mb-6 space-y-2">
                <p>• Check your spam/promotions folder if you don't see it</p>
                <p>• The reset link will expire in 24 hours</p>
                <p>• You can close this page now</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/signin')}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-full py-2.5 sm:py-3 px-4 font-medium transition-all duration-200 text-sm sm:text-base"
                >
                  Back to Sign In
                </button>
                <button 
                  onClick={() => setSuccess(false)}
                  className="w-full border border-gray-300 text-gray-700 rounded-full py-2.5 sm:py-3 px-4 font-medium transition-all duration-200 text-sm sm:text-base hover:bg-gray-50"
                >
                  Send Another Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
          {/* Header */}
          <div className="bg-yellow-400 rounded-t-xl p-4 sm:p-6 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-700">Reset Password</h2>
            <p className="text-sm sm:text-base text-gray-700 mt-2">We'll send you a reset link</p>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {/* Forgot Password Form */}
            <form className="space-y-4 mb-6" onSubmit={handleForgotPassword} noValidate>
              {error && (
                <div 
                  className="text-sm p-3 rounded-lg border text-red-800 bg-red-50 border-red-200"
                  role="alert"
                >
                  {error}
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
                  <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
                )}
                <div className="text-xs text-gray-600 mt-2 space-y-1">
                  <p><strong>Enter the email address associated with your account</strong></p>
                  <ul className="text-gray-500 space-y-1 list-disc list-inside">
                    <li>We'll send a secure password reset link to this email</li>
                    <li>Make sure to check your spam/promotions folder</li>
                    <li>The reset link will be valid for 24 hours</li>
                  </ul>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-full py-2.5 sm:py-3 px-4 font-medium transition-all duration-200 hover-zoom text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Remember your password? 
                <button 
                  onClick={() => router.push('/signin')}
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
  );
}