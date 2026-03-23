import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "*.local",
    "192.168.*.*",
    "10.*.*.*",
    "172.*.*.*",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost",
        "127.0.0.1",
        "0.0.0.0",
        "*.local",
        "192.168.*.*",
        "10.*.*.*",
        "172.*.*.*",
      ],
      bodySizeLimit: "25mb",
    },
    proxyClientMaxBodySize: "25mb",
  },
};

export default nextConfig;
