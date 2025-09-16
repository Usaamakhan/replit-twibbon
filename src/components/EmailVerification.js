"use client";

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function EmailVerification() {
  const { user, sendVerificationEmail, checkEmailVerification } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState('');

  const handleResendVerification = async () => {
    setIsResending(true);
    setMessage('');
    
    const result = await sendVerificationEmail();
    if (result.success) {
      setMessage('Verification email sent! Please check your inbox.');
    } else {
      setMessage(`Error: ${result.error}`);
    }
    
    setIsResending(false);
  };

  const handleCheckVerification = async () => {
    setIsChecking(true);
    setMessage('');
    
    const result = await checkEmailVerification();
    if (result.verified) {
      setMessage('Email verified! The page will refresh automatically.');
      // The auth state will update automatically and component will re-render
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      setMessage('Email not yet verified. Please check your email and click the verification link.');
    }
    
    setIsChecking(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-emerald-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto border-2 border-emerald-600">
        {/* Header */}
        <div className="bg-yellow-400 rounded-t-xl p-6 text-center">
          <div className="w-16 h-16 bg-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-700">Verify Your Email</h2>
          <p className="text-sm sm:text-base text-gray-700 mt-2">
            Almost there! Check your email to complete registration.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-700 mb-2">
              We sent a verification email to:
            </p>
            <p className="font-medium text-emerald-700 text-lg">
              {user?.email}
            </p>
          </div>

          <div className="bg-emerald-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-emerald-800 mb-2">Next steps:</h3>
            <ol className="text-sm text-emerald-700 space-y-1">
              <li>1. Check your email inbox (and spam folder)</li>
              <li>2. Click the verification link in the email</li>
              <li>3. Return here and click "I've Verified My Email"</li>
            </ol>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`text-sm text-center p-3 rounded-lg mb-4 ${
              message.includes('Error') 
                ? 'bg-red-50 text-red-700' 
                : 'bg-emerald-50 text-emerald-700'
            }`}>
              {message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCheckVerification}
              disabled={isChecking}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-full py-3 px-4 font-medium transition-all duration-200 hover-zoom disabled:opacity-50"
            >
              {isChecking ? 'Checking...' : "I've Verified My Email"}
            </button>

            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-full py-3 px-4 font-medium transition-all duration-200 hover-zoom disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}