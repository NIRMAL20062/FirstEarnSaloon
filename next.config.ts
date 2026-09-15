import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin (used by src/lib/server/firebaseAdmin.ts to verify ID
  // tokens in Route Handlers) pulls in native/grpc dependencies that
  // Next.js's serverless function bundler mishandles unless it's told to
  // treat the package as external rather than trying to bundle it. Without
  // this, every /api/** route that imports it crashes on Vercel with an
  // empty 500 response, even for requests that never reach the code that
  // actually calls firebase-admin.
  serverExternalPackages: ["firebase-admin"],
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
