"use client";

import { useOptionalAuth } from "../hooks/useAuth";
import { useOptionalUserProfile } from "./UserProfileProvider";
import { useRouter } from "next/navigation";

export default function MobileMenu({ 
  isMenuOpen, 
  setIsMenuOpen
}) {
  const authContext = useOptionalAuth();
  const profileContext = useOptionalUserProfile();
  
  // Provide safe defaults if no auth context
  const { user, loading, mounted, logout } = authContext || {
    user: null,
    loading: false,
    mounted: true,
    logout: async () => ({ success: false })
  };

  // Get user profile data
  const { userProfile, loading: profileLoading } = profileContext || {
    userProfile: null,
    loading: false
  };
  const router = useRouter();

  const handleProfileClick = () => {
    router.push('/profile');
    setIsMenuOpen(false); // Close the menu after navigation
  };

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
      <div className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Close button - fixed at top */}
        <div className="flex-shrink-0 flex justify-end p-4">
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
        
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 pb-6">
            {/* Welcome message for authenticated users */}
            {(!mounted || loading || profileLoading) ? (
              /* Show loading skeleton during auth restoration */
              <div className="mb-6 pb-4 border-b border-gray-100">
                <div className="h-7 bg-gray-200 rounded animate-pulse w-48"></div>
              </div>
            ) : user ? (
              <div className="mb-6 pb-4 border-b border-gray-100">
                <div className="text-lg font-medium text-gray-800">
                  Welcome {userProfile?.displayName || userProfile?.username || user.displayName || user.email}
                </div>
              </div>
            ) : null}
            <nav className="space-y-1">
              {/* Profile link - show when user is authenticated or during loading */}
              {(!mounted || loading) ? (
                /* Show loading skeleton for profile link during auth restoration */
                <div className="py-2 px-4">
                  <div className="inline-flex items-center gap-3 py-2 px-3 text-base font-normal rounded-lg">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
                  </div>
                </div>
              ) : user ? (
                <div className="py-2 px-4">
                  <button 
                    onClick={handleProfileClick}
                    className="w-full inline-flex items-center gap-3 py-2 px-3 text-base font-normal text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors duration-200 cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </button>
                </div>
              ) : null}
              
              <div className="py-2 px-4">
                <a 
                  href="#" 
                  className="inline-flex items-center gap-3 py-2 px-3 text-base font-normal text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Create Frame
                </a>
              </div>
              
              <div className="py-2 px-4">
                <a 
                  href="#" 
                  className="inline-flex items-center gap-3 py-2 px-3 text-base font-normal text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Use Frame
                </a>
              </div>
              
              <div className="py-2 px-4">
                <a 
                  href="#" 
                  className="inline-flex items-center gap-3 py-2 px-3 text-base font-normal text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Explore
                </a>
              </div>
              
              <div className="py-2 px-4">
                <a 
                  href="#" 
                  className="inline-flex items-center gap-3 py-2 px-3 text-base font-normal text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Leaderboard
                </a>
              </div>
              
              <div className="py-2 px-4">
                <a 
                  href="#" 
                  className="inline-flex items-center gap-3 py-2 px-3 text-base font-normal text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L12 12m6.364 6.364L12 12m0 0L5.636 5.636M12 12l6.364 6.364M12 12L5.636 5.636" />
                  </svg>
                  Remove Ads
                </a>
              </div>
              
              <div className="py-2 px-4">
                <a 
                  href="#" 
                  className="inline-flex items-center gap-3 py-2 px-3 text-base font-normal text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Help Center
                </a>
              </div>
            </nav>
            
            {/* Authentication buttons - always accessible at bottom */}
            <div className="mt-8 mb-4">
              <div className="flex gap-3">
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
                      className="w-full py-3 px-4 text-sm font-medium text-emerald-700 border border-emerald-700 rounded-full hover:bg-emerald-50 transition-colors duration-200 cursor-pointer hover-zoom"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        router.push('/signin');
                        setIsMenuOpen(false);
                      }}
                      className="flex-1 py-3 px-4 text-sm font-medium text-emerald-700 border border-emerald-700 rounded-full hover:bg-emerald-50 transition-colors duration-200 cursor-pointer hover-zoom"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => {
                        router.push('/signup');
                        setIsMenuOpen(false);
                      }}
                      className="flex-1 py-3 px-4 text-sm font-medium text-white bg-emerald-700 rounded-full hover:bg-emerald-800 transition-colors duration-200 cursor-pointer hover-zoom"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}