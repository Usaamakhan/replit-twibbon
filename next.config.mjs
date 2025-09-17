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
            value: 'https://a952a103-f3af-47db-b629-140a62aa717f-00-34hxyypvm79e.spock.replit.dev',
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
    'https://*.spock.replit.dev',
    'https://a952a103-f3af-47db-b629-140a62aa717f-00-34hxyypvm79e.spock.replit.dev',
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
        'https://*.spock.replit.dev',
        'https://a952a103-f3af-47db-b629-140a62aa717f-00-34hxyypvm79e.spock.replit.dev',
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
