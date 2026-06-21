import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.meshy.ai",
      },
      {
        protocol: "https",
        hostname: "**.meshy.ai",
      },
    ],
  },
  // Allow large uploads (20MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
