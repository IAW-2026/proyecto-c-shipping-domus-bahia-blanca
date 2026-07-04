import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [70, 72, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "openweathermap.org",
      },
      {
        protocol: "https",
        hostname: "proyecto-c-seller-domus-bahia-blanc.vercel.app",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
