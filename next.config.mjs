/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for Replit deployment
  output: 'standalone',
  
  // Disable problematic features that can cause hanging
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Configure headers to prevent hanging and improve compatibility
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Security headers for Replit
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        // Static assets caching
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Disable caching for development API routes to prevent hanging
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  
  // Simplified webpack configuration for Replit
  webpack: (config, { dev, isServer }) => {
    // Basic development optimizations only
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules/**',
          '**/attached_assets/**', 
          '**/.local/**', 
          '**/tmp/**',
          '**/logs/**'
        ]
      };
    }
    
    return config;
  },
  
  // Configure allowed dev origins for Replit proxy
  allowedDevOrigins: [
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost',
    'http://127.0.0.1',
    'https://*.replit.dev',
    'https://*.repl.co',
    `https://${process.env.REPLIT_DEV_DOMAIN}`,
    // Current Replit domain
    'https://8c4115bf-2344-4db9-8645-298faf031367-00-19bekczddd0km.kirk.replit.dev',
    // Allow local origins for development
    '127.0.0.1',
    'localhost'
  ].filter(Boolean),
  
  // External packages for server components
  serverExternalPackages: ['firebase-admin'],
  
  // Experimental features - configure properly for Next.js 15
  experimental: {
    serverActions: {
      allowedOrigins: [
        'https://*.replit.dev',
        'https://*.repl.co',
        'http://localhost:5000',
        'http://127.0.0.1:5000',
        'http://localhost',
        'http://127.0.0.1',
        ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
      ]
    }
  },
  
  // Add development server configuration
  env: {
    CUSTOM_KEY: 'replit-optimized',
  },
  
  // Configure redirects to handle 404s faster
  async redirects() {
    return [];
  },
  
  // Add rewrite rules for better routing
  async rewrites() {
    return [];
  },
};

export default nextConfig;