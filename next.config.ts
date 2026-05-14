import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Átirányítások javítása (307 -> 301 kényszerítése)
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'dolce-home.hu',
          },
        ],
        destination: 'https://www.dolce-home.hu/:path*',
        permanent: true, // Ez javítja az indexelési hibát
      },
    ];
  },

  // 2. Képkezelés
  images: {
    // Mivel ez true, a remotePatterns-re nincs szükség
    unoptimized: true, 
  },
};

export default nextConfig;