import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export default function Hero() {
  return (
    <section className="bg-yellow-400 text-black py-12 sm:py-16 md:py-24 border-0 shadow-none -mt-px">
      <div className="mx-auto w-full max-w-screen-xl px-3 sm:px-4 md:px-6 text-center">
        <h1 className={`${caveat.className} text-6xl sm:text-7xl md:text-8xl font-bold text-green-700`}>
          Frame Your Voice
        </h1>
        <p className="mt-3 sm:mt-4 md:mt-6 text-sm sm:text-base md:text-lg opacity-90">
          Create and share frames that amplify your message, celebrate your cause, and inspire others to join in.
        </p>
        <div className="mt-6 sm:mt-8 flex flex-row items-center justify-center gap-4 sm:gap-5 flex-nowrap">
          <a
            href="#"
            className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-7 py-4 text-white text-base sm:text-lg font-semibold transition-all duration-300 ease-in-out hover:bg-emerald-900 hover:scale-110 hover:shadow-2xl hover:-translate-y-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-700 whitespace-nowrap"
          >
            Create Frame
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center rounded-full border-2 border-emerald-700 px-7 py-4 text-emerald-800 text-base sm:text-lg font-semibold transition-all duration-300 ease-in-out hover:bg-emerald-700 hover:text-white hover:scale-110 hover:shadow-2xl hover:-translate-y-1 hover:border-emerald-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-700 whitespace-nowrap"
          >
            Use Frame
          </a>
        </div>
      </div>
    </section>
  );
}