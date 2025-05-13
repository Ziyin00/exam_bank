import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // next.config.js (production example)

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-production-domain.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3032',
        pathname: '/uploads/**',
      },
    ],
    domains: ['localhost'],
  },

};

export default nextConfig;






