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
};

export default nextConfig;
