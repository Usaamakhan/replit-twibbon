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
          // Fix cross-origin issues in Replit
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
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
  
  // Optimize webpack for Replit environment
  webpack: (config, { dev, isServer }) => {
    // Development optimizations to prevent hanging
    if (dev) {
      // Reduce watch polling to prevent resource exhaustion
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000, // Poll every 1 second instead of file watching
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules/**',
          '**/attached_assets/**', 
          '**/.local/**', 
          '**/tmp/**',
          '**/logs/**'
        ]
      };
      
      // Add entry configuration to prevent hanging
      config.entry = async () => {
        const entries = await originalEntry();
        
        // Add polyfills for browser compatibility
        if (entries['main.js'] && !entries['main.js'].includes('./src/polyfills.js')) {
          entries['main.js'].unshift('./src/polyfills.js');
        }
        
        return entries;
      };
      
      const originalEntry = config.entry;
    }
    
    // Optimize Firebase imports for better tree shaking
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'firebase/auth': 'firebase/auth',
        'firebase/firestore': 'firebase/firestore'
      };
    }
    
    // Add optimization to prevent memory leaks
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };
    
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
    // Keep current domain as backup
    'https://39d4d35b-71ea-493f-a752-8a5296b5f1a3-00-3u13ci9zfz6j3.kirk.replit.dev'
  ].filter(Boolean),
  
  // Experimental features - disable problematic ones
  experimental: {
    // Disable features that can cause hanging
    appDir: true, // Keep app directory
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
    },
    // Disable turbopack as it can cause issues in Replit
    turbo: false,
    // Disable other experimental features that can cause hanging
    optimizePackageImports: false,
    serverComponentsExternalPackages: ['firebase-admin'],
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