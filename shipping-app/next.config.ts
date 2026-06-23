import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "openweathermap.org",
      },
      {
        protocol: "https",
        hostname: "proyecto-c-seller-domus-bahia-blanc.vercel.app",
      },
    ],
  },
};

export default nextConfig;