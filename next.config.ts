import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    appIsrStatus: false,
  },
  experimental: {
    allowedDevOrigins: ['192.168.100.3:3001', 'localhost:3001', '192.168.100.3', 'localhost:3000'],
  },
};

export default nextConfig;
