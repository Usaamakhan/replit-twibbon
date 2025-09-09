"use client";

import { useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Main Content with blur effect */}
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${
        isMenuOpen ? 'blur-sm brightness-50' : ''
      }`}>
        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <main className="flex-1">
          <Hero />
        </main>
        <Footer />
      </div>

      {/* Blur Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-30"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 pt-20">
          <nav className="space-y-4">
            <a 
              href="#" 
              className="block py-3 px-4 text-lg font-semibold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors duration-200"
            >
              Create Frame
            </a>
            <a 
              href="#" 
              className="block py-3 px-4 text-lg font-semibold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors duration-200"
            >
              Use Frame
            </a>
            <a 
              href="#" 
              className="block py-3 px-4 text-lg font-semibold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors duration-200"
            >
              Explore
            </a>
            <a 
              href="#" 
              className="block py-3 px-4 text-lg font-semibold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors duration-200"
            >
              Leaderboard
            </a>
            <a 
              href="#" 
              className="block py-3 px-4 text-lg font-semibold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors duration-200"
            >
              Remove Ads
            </a>
            <a 
              href="#" 
              className="block py-3 px-4 text-lg font-semibold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors duration-200"
            >
              Help Center
            </a>
          </nav>
        </div>
      </div>
    </div>
  );
}
