'use client';

export function SkeletonBox({ width = 'full', height = '4', className = '' }) {
  const widthClasses = {
    'full': 'w-full',
    '3/4': 'w-3/4', 
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '1/4': 'w-1/4',
    '16': 'w-16',
    '24': 'w-24',
    '32': 'w-32',
    '48': 'w-48'
  };

  const heightClasses = {
    '3': 'h-3',
    '4': 'h-4',
    '5': 'h-5',
    '6': 'h-6',
    '8': 'h-8',
    '12': 'h-12',
    '16': 'h-16',
    '20': 'h-20',
    '32': 'h-32',
    '48': 'h-48'
  };

  return (
    <div 
      className={`bg-gray-300 rounded animate-pulse ${widthClasses[width]} ${heightClasses[height]} ${className}`}
    ></div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <SkeletonBox width="3/4" height="6" className="mb-4" />
      <SkeletonBox width="full" height="4" className="mb-2" />
      <SkeletonBox width="1/2" height="4" />
    </div>
  );
}

export function SkeletonGrid({ count = 6, className = '' }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}