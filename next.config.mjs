/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for Replit deployment
  output: 'standalone',
  // Allow cross-origin requests for Replit proxy environment
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  // Allow Replit domains for development
  allowedDevOrigins: [
    '*.replit.dev',
    '*.replit.co',
    '*.pike.replit.dev',
    'localhost:5000',
    '127.0.0.1:5000'
  ],
  // Additional experimental features
  experimental: {
    serverActions: {
      allowedOrigins: [
        '*.replit.dev',
        '*.replit.co',
        '*.pike.replit.dev',
        'localhost:5000'
      ]
    }
  },
};

export default nextConfig;
