import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 1. Átirányítások kezelése (307 helyett 301)
  async redirects() {
    return [
      {
        source: '/regi-aloldal', // Ide írd a régi linket
        destination: '/uj-aloldal', // Ide az újat
        permanent: true, // Ez állítja át 301-es végleges kódra a Google számára
      },
    ];
  },

  // 2. Képoptimalizálás teljes kikapcsolása
  images: {
    unoptimized: true,
  },
};

export default nextConfig;