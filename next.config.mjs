/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for Replit deployment
  output: 'standalone',
  // Allow cross-origin requests for Replit proxy environment
  async headers() {
    return [
      {
        // Only apply CORS and no-cache to non-static routes
        source: '/((?!_next/static|favicon.ico).*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://b9f7cf9a-a349-4272-8c8b-7b3ae0d2daf5-00-yzdm3ga91f1x.pike.replit.dev',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        // Enable proper caching for Next.js static assets
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Allow Replit domains for development - fixes cross-origin warnings
  allowedDevOrigins: [
    'https://*.replit.dev',
    'https://*.replit.co', 
    'https://*.pike.replit.dev',
    'https://*.riker.replit.dev',
    'https://*.sisko.replit.dev',
    'https://b9f7cf9a-a349-4272-8c8b-7b3ae0d2daf5-00-yzdm3ga91f1x.pike.replit.dev',
    'http://localhost:5000',
    'http://127.0.0.1:5000'
  ],
  // Additional experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      allowedOrigins: [
        'https://*.replit.dev',
        'https://*.replit.co',
        'https://*.pike.replit.dev',
        'https://*.riker.replit.dev', 
        'https://*.sisko.replit.dev',
        'https://b9f7cf9a-a349-4272-8c8b-7b3ae0d2daf5-00-yzdm3ga91f1x.pike.replit.dev',
        'http://localhost:5000',
        'http://127.0.0.1:5000'
      ]
    }
  },
  // Prevent dev server from watching non-source folders
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/attached_assets/**', '**/.local/**', '**/tmp/**', '**/node_modules/**']
      };
    }
    return config;
  },
};

export default nextConfig;
