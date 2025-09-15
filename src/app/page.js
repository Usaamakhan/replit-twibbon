"use client";

import { useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import { useAuth } from "../hooks/useAuth";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading, signInWithGoogle, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Main Content with blur effect */}
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${
        isMenuOpen ? 'blur-sm' : ''
      }`}>
        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <main className="flex-1">
          <Hero />
        </main>
        <Footer />
      </div>

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
            {user ? (
              <>
                <div className="flex-1 text-center py-2 px-4 text-sm text-gray-700">
                  Hi, {user.displayName || user.email}!
                </div>
                <button 
                  onClick={logout}
                  className="flex-1 py-2 px-4 text-sm font-medium text-emerald-700 border border-emerald-700 rounded-full hover:bg-emerald-50 transition-colors duration-200 cursor-pointer hover-zoom"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => {
                    console.log('=== SIGN IN BUTTON CLICKED IN UI ===');
                    signInWithGoogle();
                  }}
                  disabled={loading}
                  className="flex-1 py-2 px-4 text-sm font-medium text-emerald-700 border border-emerald-700 rounded-full hover:bg-emerald-50 transition-colors duration-200 cursor-pointer hover-zoom disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Sign In'}
                </button>
                <button 
                  onClick={() => {
                    console.log('=== SIGN UP BUTTON CLICKED IN UI ===');
                    signInWithGoogle();
                  }}
                  disabled={loading}
                  className="flex-1 py-2 px-4 text-sm font-medium text-white bg-emerald-700 rounded-full hover:bg-emerald-800 transition-colors duration-200 cursor-pointer hover-zoom disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Sign Up'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
