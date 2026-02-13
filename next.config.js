/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: process.env.RAILWAY_ENVIRONMENT === "true",
  },
};

module.exports = nextConfig;
