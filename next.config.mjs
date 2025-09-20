/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for Replit deployment
  output: 'standalone',
  
  // Enable proper caching for Next.js static assets
  async headers() {
    return [
      {
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
  
  // Optimize webpack for better performance
  webpack: (config, { dev, isServer }) => {
    // Prevent dev server from watching non-source folders
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/attached_assets/**', '**/.local/**', '**/tmp/**', '**/node_modules/**']
      };
    }
    
    // Optimize Firebase imports for better tree shaking
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'firebase/auth': 'firebase/auth',
        'firebase/firestore': 'firebase/firestore'
      };
    }
    
    return config;
  },
  
  // Configure allowed dev origins for Replit proxy with proper protocols
  allowedDevOrigins: [
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost',
    'http://127.0.0.1',
    'https://*.replit.dev',
    'https://*.repl.co',
    'https://39d4d35b-71ea-493f-a752-8a5296b5f1a3-00-3u13ci9zfz6j3.kirk.replit.dev',
    ...(process.env.REPLIT_DEV_DOMAIN ? [`https://${process.env.REPLIT_DEV_DOMAIN}`] : [])
  ],
  
  // Additional experimental features  
  experimental: {
    // Enable server actions
    serverActions: {
      allowedOrigins: [
        'https://*.replit.dev',
        'https://*.repl.co',
        'http://localhost:5000',
        'http://127.0.0.1:5000',
        'http://localhost',
        'http://127.0.0.1',
        // Add production origins from environment variable
        ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
      ]
    }
  },
  
  // Enable Turbopack for faster builds (moved to correct location)
  turbo: true
};

export default nextConfig;
