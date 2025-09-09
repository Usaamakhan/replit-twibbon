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
  // Allow all hosts for Replit proxy environment
  experimental: {
    allowedDevOrigins: ['*'],
  },
};

export default nextConfig;
