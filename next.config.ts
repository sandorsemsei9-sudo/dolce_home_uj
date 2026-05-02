import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Ez kapcsolja ki globálisan a Vercel képoptimalizálást (és a limit fogyasztását)
    unoptimized: true, 
    
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gbaduiirlnkaycrcdbpd.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;