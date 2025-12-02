import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sports-phinf.pstatic.net',
      },
    ],
  },
};

module.exports = nextConfig;

export default nextConfig;