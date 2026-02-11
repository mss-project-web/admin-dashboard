import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination:
          process.env.NODE_ENV === 'production'
            ? `${process.env.NEXT_PUBLIC_API_URL_PRODUCTION}/:path*`
            : `${process.env.NEXT_PUBLIC_API_URL_DEV}/:path*`,
      },
    ];
  },
};
