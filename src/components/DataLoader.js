'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function DataLoader({ 
  children, 
  isLoading, 
  error = null,
  skeleton = null,
  emptyState = null,
  data = null,
  className = '' 
}) {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowSkeleton(true);
      }, 200); // Show skeleton after 200ms to avoid flash

      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(false);
    }
  }, [isLoading]);

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && showSkeleton && skeleton) {
    return skeleton;
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (!data && emptyState) {
    return emptyState;
  }

  return children;
}