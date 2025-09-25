'use client';

import { SkeletonBox } from './SkeletonLoader';

export default function HeroSkeleton() {
  return (
    <section className="bg-yellow-400 text-black py-12 sm:py-16 md:py-24 border-0 shadow-none -mt-px">
      <div className="mx-auto w-full max-w-screen-xl px-3 sm:px-4 md:px-6 text-center">
        <SkeletonBox width="3/4" height="16" className="mx-auto mb-6" />
        <SkeletonBox width="1/2" height="5" className="mx-auto mb-8" />
        <div className="flex flex-row items-center justify-center gap-4 sm:gap-5">
          <SkeletonBox width="32" height="12" className="rounded-full" />
          <SkeletonBox width="32" height="12" className="rounded-full" />
        </div>
      </div>
    </section>
  );
}