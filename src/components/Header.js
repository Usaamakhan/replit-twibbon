export default function Header() {
  return (
    <header className="bg-yellow-400 text-black py-4 sm:py-5 md:py-6 border-0 shadow-none">
      <div className="mx-auto w-full max-w-screen-xl px-3 sm:px-4 md:px-6 flex items-center justify-center">
        <div className="w-full max-w-md">
          <input
            type="text"
            placeholder="Search frames..."
            className="w-full px-4 py-3 rounded-full bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-base"
          />
        </div>
      </div>
    </header>
  );
}