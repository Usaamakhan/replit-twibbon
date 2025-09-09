/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better development experience
  experimental: {
    // Allow all hosts for Replit proxy environment
    allowedHosts: true,
  },
  // Configure server for Replit environment
  server: {
    host: '0.0.0.0',
    port: 5000,
  },
};

export default nextConfig;
