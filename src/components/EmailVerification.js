"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function EmailVerification() {
  const { user, sendVerificationEmail, checkEmailVerification } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');

  // Auto-check email verification status every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user && !user.emailVerified) {
        const result = await checkEmailVerification();
        if (result.verified) {
          // Page will refresh automatically when user is verified
          window.location.reload();
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, checkEmailVerification]);

  const handleResendVerification = async () => {
    setIsResending(true);
    setMessage('');
    
    const result = await sendVerificationEmail();
    if (result.success) {
      setMessage('Verification email sent!');
    } else {
      setMessage(`Error: ${result.error}`);
    }
    
    setIsResending(false);
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-emerald-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-auto p-6 text-center">
        
        {/* Main Text */}
        <p className="text-lg text-gray-800 mb-4">
          We sent a verification email to <span className="font-medium text-emerald-700">{user?.email}</span>, verify yourself from there
        </p>

        {/* Sub Text */}
        <p className="text-sm text-gray-600 mb-6">
          If you don't receive it, 
          <button
            onClick={handleResendVerification}
            disabled={isResending}
            className="text-emerald-600 hover:text-emerald-800 underline ml-1 disabled:opacity-50"
          >
            {isResending ? 'sending...' : 'click to resend link'}
          </button>
        </p>

        {/* Message Display */}
        {message && (
          <div className={`text-sm p-3 rounded-lg ${
            message.includes('Error') 
              ? 'bg-red-50 text-red-700' 
              : 'bg-emerald-50 text-emerald-700'
          }`}>
            {message}
          </div>
        )}

      </div>
    </div>
  );
}