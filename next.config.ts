import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.NODE_ENV === 'production'
      ? (process.env.NEXT_PUBLIC_API_URL_PRODUCTION)
      : (process.env.NEXT_PUBLIC_API_URL_DEV);

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
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
