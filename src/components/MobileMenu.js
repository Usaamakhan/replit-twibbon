"use client";

import { useAuth } from "../hooks/useAuth";

export default function MobileMenu({ 
  isMenuOpen, 
  setIsMenuOpen, 
  openSignInModal, 
  openSignUpModal 
}) {
  const { user, loading, mounted, logout } = useAuth();

  return (
    <>
      {/* Invisible Overlay for click-outside to close menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Close button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
          >
            <svg 
              className="w-6 h-6 text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6 pt-20">
          {/* Welcome message for authenticated users */}
          {user && (
            <div className="mb-6 pb-4 border-b border-gray-100">
              <div className="text-lg font-medium text-gray-800">
                Welcome {user.displayName || user.email}
              </div>
            </div>
          )}
          <nav className="space-y-0">
            <a 
              href="#" 
              className="block py-3 px-4 text-lg font-normal text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors duration-200"
            >
              Create Frame
            </a>
            <a 
              href="#" 
              className="block py-3 px-4 text-lg font-normal text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors duration-200"
            >
              Use Frame
            </a>
            <a 
              href="#" 
              className="block py-3 px-4 text-lg font-normal text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors duration-200"
            >
              Explore
            </a>
            <a 
              href="#" 
              className="block py-3 px-4 text-lg font-normal text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors duration-200"
            >
              Leaderboard
            </a>
            <a 
              href="#" 
              className="block py-3 px-4 text-lg font-normal text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors duration-200"
            >
              Remove Ads
            </a>
            <a 
              href="#" 
              className="block py-3 px-4 text-lg font-normal text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors duration-200"
            >
              Help Center
            </a>
          </nav>
          
          {/* Authentication buttons */}
          <div className="flex gap-3 mt-6">
            {!mounted || loading ? (
              // Show skeleton/placeholder during initial mount and auth restoration to prevent hydration issues and flicker
              <div className="flex gap-3 w-full">
                <div className="flex-1 py-2 px-4 text-sm text-center text-gray-400 border border-gray-300 rounded-full">
                  Sign In
                </div>
                <div className="flex-1 py-2 px-4 text-sm text-center text-white bg-gray-400 rounded-full">
                  Sign Up
                </div>
              </div>
            ) : user ? (
              <>
                <button 
                  onClick={logout}
                  className="w-full py-2 px-4 text-sm font-medium text-emerald-700 border border-emerald-700 rounded-full hover:bg-emerald-50 transition-colors duration-200 cursor-pointer hover-zoom"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={openSignInModal}
                  className="flex-1 py-2 px-4 text-sm font-medium text-emerald-700 border border-emerald-700 rounded-full hover:bg-emerald-50 transition-colors duration-200 cursor-pointer hover-zoom"
                >
                  Sign In
                </button>
                <button 
                  onClick={openSignUpModal}
                  className="flex-1 py-2 px-4 text-sm font-medium text-white bg-emerald-700 rounded-full hover:bg-emerald-800 transition-colors duration-200 cursor-pointer hover-zoom"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}