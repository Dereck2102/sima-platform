import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000',
    NEXT_PUBLIC_WS_ENDPOINT: process.env.NEXT_PUBLIC_WS_ENDPOINT || 'ws://localhost:3000',
  },
};

export default nextConfig;
