"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreateCampaignModal({ isOpen, onClose }) {
  const router = useRouter();

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose(false); // false = dismissed, not navigated
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreateFrame = () => {
    onClose(true); // true = navigated to a route
    router.push('/create/frame');
  };

  const handleCreateBackground = () => {
    onClose(true); // true = navigated to a route
    router.push('/create/background');
  };

  const handleDismiss = () => {
    onClose(false); // false = dismissed without navigation
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={handleDismiss}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Create Campaign
            </h2>
            <button
              onClick={handleDismiss}
              className="btn-base p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-6">
              Choose the type of campaign you want to create
            </p>

            {/* Options Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              
              {/* Frame Option */}
              <button
                onClick={handleCreateFrame}
                className="text-left bg-white border-2 border-gray-200 hover:border-emerald-500 rounded-xl p-5 transition-all hover:shadow-md group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 transition-colors">
                    <svg className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Frame</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Photo overlay with transparent areas
                    </p>
                  </div>
                </div>
                
                <ul className="space-y-1.5">
                  <li className="flex items-center text-xs text-gray-600">
                    <svg className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    PNG with transparency
                  </li>
                  <li className="flex items-center text-xs text-gray-600">
                    <svg className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Photo behind frame
                  </li>
                </ul>
              </button>

              {/* Background Option */}
              <button
                onClick={handleCreateBackground}
                className="text-left bg-white border-2 border-gray-200 hover:border-emerald-500 rounded-xl p-5 transition-all hover:shadow-md group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 transition-colors">
                    <svg className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Background</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Solid image behind photo
                    </p>
                  </div>
                </div>
                
                <ul className="space-y-1.5">
                  <li className="flex items-center text-xs text-gray-600">
                    <svg className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    PNG, JPG, or WEBP
                  </li>
                  <li className="flex items-center text-xs text-gray-600">
                    <svg className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Photo on top
                  </li>
                </ul>
              </button>

            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 text-center mt-6">
              Frames have transparent areas for photos • Backgrounds go behind photos
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
