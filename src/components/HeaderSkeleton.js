'use client';

import { SkeletonBox } from './SkeletonLoader';

export default function HeaderSkeleton() {
  return (
    <header className="bg-yellow-400 text-black py-4 sm:py-5 md:py-6 border-0 shadow-none relative z-40">
      <div className="mx-auto w-full max-w-screen-xl px-3 sm:px-4 md:px-6 flex items-center justify-between">
        <SkeletonBox width="24" height="8" />
        <div className="w-48 sm:w-64 md:w-80 lg:w-96 mx-4">
          <SkeletonBox width="full" height="8" className="rounded-full" />
        </div>
        <SkeletonBox width="12" height="12" className="rounded-full" />
      </div>
    </header>
  );
}