'use client';

import { useState, useEffect } from 'react';

// Component to prevent hydration mismatches by not rendering until client-side
export default function NoSSR({ children, fallback = null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return fallback;
  }

  return children;
}