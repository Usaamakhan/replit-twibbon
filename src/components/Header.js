import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export default function Header() {
  return (
    <header className="bg-yellow-400 text-black py-4 sm:py-5 md:py-6 border-0 shadow-none">
      <div className="mx-auto w-full max-w-screen-xl px-3 sm:px-4 md:px-6 flex items-center justify-between">
        <div className={`${caveat.className} text-2xl sm:text-3xl md:text-4xl font-bold text-green-700`}>
          Frame
        </div>
        <div className="flex-1 max-w-md mx-4 relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-4 py-3 pr-12 rounded-full bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-base"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
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
          </div>
        </div>
        <div className="w-16"></div>
      </div>
    </header>
  );
}