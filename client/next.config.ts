import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
  images: {
    remotePatterns: [
      { hostname: "logo.clearbit.com" },
      { hostname: "**.amazonaws.com" },
    ],
  },
};

export default nextConfig;
