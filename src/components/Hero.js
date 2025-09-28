import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export default function Hero() {
  return (
    <section className="bg-yellow-400 text-black py-12 sm:py-16 md:py-24 border-0 shadow-none -mt-px">
      <div className="mx-auto w-full max-w-screen-xl px-3 sm:px-4 md:px-6 text-center">
        <h1 className={`${caveat.className} text-6xl sm:text-7xl md:text-8xl font-bold text-emerald-700`}>
          Frame Your Voice
        </h1>
        <p className="mt-3 sm:mt-4 md:mt-6 text-sm sm:text-base md:text-lg opacity-90">
          Create and share frames that amplify your message, celebrate your cause, and inspire others to join in.
        </p>
        <div className="mt-6 sm:mt-8 flex flex-row items-center justify-center gap-4 sm:gap-5 flex-nowrap">
          <a
            href="#"
            className="btn-base btn-primary px-7 py-4 text-base sm:text-lg font-semibold whitespace-nowrap"
          >
            Create Frame
          </a>
          <a
            href="#"
            className="btn-base btn-secondary border-2 border-emerald-700 px-7 py-4 text-emerald-800 text-base sm:text-lg font-semibold whitespace-nowrap"
          >
            Use Frame
          </a>
        </div>
      </div>
    </section>
  );
}