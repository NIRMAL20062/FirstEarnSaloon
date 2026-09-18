import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Salon logos / service / offer images live in the public
    // "salon-images" Supabase Storage bucket.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
