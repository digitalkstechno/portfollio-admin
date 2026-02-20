import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true, // ✅ Type errors ignore karega build ke time
  },
};

export default nextConfig;