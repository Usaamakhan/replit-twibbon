"use client";

import { Caveat } from "next/font/google";
import { useState } from "react";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export default function Header({ isMenuOpen, setIsMenuOpen }) {
  const handleSearch = () => {
    // Search functionality can be implemented here
    console.log('Search clicked');
  };

  return (
    <header className="bg-yellow-400 text-black py-4 sm:py-5 md:py-6 border-0 shadow-none relative z-40">
      <div className="mx-auto w-full max-w-screen-xl px-3 sm:px-4 md:px-6 flex items-center justify-between">
        <a 
          href="/" 
          className={`${caveat.className} text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-700 hover:text-emerald-800 transition-colors duration-200`}
        >
          Frame
        </a>
        <div className="flex-1 max-w-xs mx-4 relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-4 py-3 pr-12 rounded-full bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-base"
          />
          <button 
            onClick={handleSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer hover:text-emerald-700 transition-colors duration-200"
          >
            <svg 
              className="w-5 h-5 text-gray-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </button>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full bg-white hover:bg-gray-100 transition-colors duration-200 relative z-50"
          >
            <svg 
              className="w-6 h-6 text-black" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}