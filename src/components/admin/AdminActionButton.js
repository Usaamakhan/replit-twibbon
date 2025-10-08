"use client";

import { useState } from "react";

/**
 * Reusable action button with loading state and optional confirmation
 * 
 * @param {Object} props
 * @param {Function} props.onClick - Click handler (can be async)
 * @param {string} props.children - Button text
 * @param {string} props.variant - Button style: 'primary', 'danger', 'warning', 'success'
 * @param {boolean} props.requireConfirm - Show confirmation dialog
 * @param {string} props.confirmTitle - Confirmation dialog title
 * @param {string} props.confirmMessage - Confirmation dialog message
 * @param {string} props.confirmButtonText - Confirm button text
 * @param {string} props.loadingText - Text to show when loading
 * @param {string} props.icon - Optional icon element
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.size - Button size: 'sm', 'md', 'lg'
 * @param {string} props.className - Additional CSS classes
 */
export default function AdminActionButton({
  onClick,
  children,
  variant = 'primary',
  requireConfirm = false,
  confirmTitle = 'Confirm Action',
  confirmMessage = 'Are you sure you want to proceed?',
  confirmButtonText = 'Confirm',
  loadingText = 'Processing...',
  icon = null,
  disabled = false,
  size = 'md',
  className = '',
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);

  const getVariantClasses = () => {
    const baseClasses = 'btn-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizeClasses = {
      sm: 'text-sm py-1 px-3',
      md: 'text-base py-2 px-4',
      lg: 'text-lg py-3 px-6',
    };
    
    const variantClasses = {
      primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
      success: 'bg-green-600 text-white hover:bg-green-700',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    };
    
    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  };

  const handleClick = async () => {
    if (requireConfirm) {
      setShowConfirm(true);
      return;
    }
    
    await executeAction();
  };

  const executeAction = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onClick();
      setShowConfirm(false);
    } catch (err) {
      console.error('Action error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    await executeAction();
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setError(null);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={getVariantClasses()}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {loadingText}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {icon}
            {children}
          </span>
        )}
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {confirmTitle}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {confirmMessage}
            </p>
            
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 btn-base bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`flex-1 btn-base ${
                  variant === 'danger' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
                } text-white disabled:opacity-50`}
              >
                {isLoading ? loadingText : confirmButtonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
