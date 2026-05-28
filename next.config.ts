import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Képkezelés a Vercel Hobby limit túllépése ellen
  images: {
    unoptimized: true, 
  },
};

export default nextConfig;