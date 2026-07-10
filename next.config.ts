import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `/api/*` is now served by this app's own Route Handlers (backend merged in),
  // so the old rewrite to the standalone NestJS backend is removed.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-853ef1e3196d47079694e9c281ce8748.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
