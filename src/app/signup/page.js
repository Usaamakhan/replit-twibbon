"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateEmail, validatePassword, validateName } from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';
import { Caveat } from "next/font/google";
import Link from "next/link";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export default function SignUpPage() {
  const router = useRouter();
  const { user, loading: authLoading, signInWithGoogle, signUpWithEmail } = useAuth();
  
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldValidation, setFieldValidation] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Refs for form validation scrolling
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();

  // Redirect if already signed in
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const scrollToField = (fieldName) => {
    const fieldRefs = {
      name: nameRef,
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

    const name = formData.get('name')?.trim();
    if (!name) {
      newErrors.name = 'Name is required';
      if (!firstErrorField) firstErrorField = 'name';
    } else if (name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters long';
      if (!firstErrorField) firstErrorField = 'name';
    } else if (name.length > 50) {
      newErrors.name = 'Name must be 50 characters or less';
      if (!firstErrorField) firstErrorField = 'name';
    }

    if (!formData.get('email')?.trim()) {
      newErrors.email = 'Email is required';
      if (!firstErrorField) firstErrorField = 'email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.get('email'))) {
      newErrors.email = 'Please enter a valid email address';
      if (!firstErrorField) firstErrorField = 'email';
    }

    const password = formData.get('password');
    if (!password?.trim()) {
      newErrors.password = 'Password is required';
      if (!firstErrorField) firstErrorField = 'password';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      if (!firstErrorField) firstErrorField = 'password';
    }

    setValidationErrors(newErrors);
    
    // If there are errors, scroll to the first error field
    if (firstErrorField) {
      setTimeout(() => scrollToField(firstErrorField), 100);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (!validateForm(formData)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signUpWithEmail(
        formData.get('email'), 
        formData.get('password'), 
        formData.get('name')
      );
      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Failed to create account');
      }
    } catch (err) {
      setError('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Failed to sign up with Google');
      }
    } catch (err) {
      setError('Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Clear form validation errors when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Perform real-time validation
    let validationError = null;
    let isValid = false;
    
    if (field === 'name' && value.trim()) {
      validationError = validateName(value);
      isValid = !validationError;
    } else if (field === 'email' && value.trim()) {
      validationError = validateEmail(value);
      isValid = !validationError;
    } else if (field === 'password' && value.trim()) {
      validationError = validatePassword(value, true);
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

  // Don't show loading overlay during auth actions - keep form visible

  return (
    <div className="min-h-screen bg-white">
      {/* Frame Logo */}
      <div className="absolute top-6 left-6 z-50 mb-8">
        <Link 
          href="/" 
          className={`${caveat.className} text-2xl md:text-3xl font-bold text-emerald-700 hover:text-emerald-800 transition-all duration-300 hover:scale-110`}
        >
          Frame
        </Link>
      </div>
      
      <div className="min-h-screen flex">
        {/* Left Side - Form */}
        <div className="flex-1 w-full flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-16 xl:px-20 pt-20">
          <div className="mx-auto w-full max-w-sm lg:max-w-md">
            <div className="text-center mb-6 bg-yellow-400 px-4 py-3 rounded-t-lg">
              <h2 className="text-2xl font-bold text-emerald-700">Create your account</h2>
              <p className="mt-1 text-black text-sm">Join the creative community and start building amazing frames.</p>
            </div>
            
            {/* Content Card with Shadow Border */}
            <div className="bg-white rounded-b-lg border border-t-0 border-gray-200 px-6 py-6 shadow-sm">
            {/* Email Sign Up Form */}
            <form className="space-y-3 mb-4" onSubmit={handleEmailSignUp} noValidate>
              {error && (
                <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded-lg" role="alert">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-gray-800 mb-1">
                  Name
                </label>
                <div className="relative">
                  <input
                    ref={nameRef}
                    id="signup-name"
                    type="text"
                    name="name"
                    required
                    placeholder="Enter your name"
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-300 text-gray-900 placeholder-gray-500 text-sm ${
                      validationErrors.name ? 'border-red-300 bg-red-50' : 
                      fieldValidation.name?.isValid ? 'border-emerald-300 bg-emerald-50' :
                      fieldValidation.name?.hasValue ? 'border-red-300 bg-red-50' :
                      'border-gray-300'
                    }`}
                  />
                  {/* Validation Icon */}
                  {(validationErrors.name || (fieldValidation.name?.hasValue && !fieldValidation.name?.isValid)) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {fieldValidation.name?.isValid && !validationErrors.name ? (
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
                {validationErrors.name && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-800 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    ref={emailRef}
                    id="signup-email"
                    type="email"
                    name="email"
                    required
                    placeholder="Enter your email"
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-300 text-gray-900 placeholder-gray-500 text-sm ${
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
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-800 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    ref={passwordRef}
                    id="signup-password"
                    type="password"
                    name="password"
                    required
                    placeholder="Create a password (min 8 characters)"
                    minLength={8}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-300 text-gray-900 placeholder-gray-500 text-sm ${
                      validationErrors.password ? 'border-red-300 bg-red-50' : 
                      fieldValidation.password?.isValid ? 'border-emerald-300 bg-emerald-50' :
                      fieldValidation.password?.hasValue ? 'border-red-300 bg-red-50' :
                      'border-gray-300'
                    }`}
                  />
                  {/* Validation Icon */}
                  {(validationErrors.password || (fieldValidation.password?.hasValue && !fieldValidation.password?.isValid)) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {fieldValidation.password?.isValid && !validationErrors.password ? (
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
                {validationErrors.password && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.password}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl py-2 px-4 font-medium transition-all duration-300 hover-zoom hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">or</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <div className="text-center mb-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border border-gray-300 hover:bg-yellow-50 rounded-xl py-2 px-4 flex items-center justify-center gap-3 transition-all duration-300 hover-zoom hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium shadow-md text-sm"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Creating Account...' : 'Continue with Google'}
              </button>
            </div>

            <div className="text-center mb-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Already have an account? 
                <button 
                  onClick={() => router.push('/signin')}
                  className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium ml-1 cursor-pointer transition-all duration-200"
                >
                  Sign In
                </button>
              </p>
            </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}