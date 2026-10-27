/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Intentionally allowing simulated external image domains for SSRF & avatar testing
  images: {
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },
  // Ensure easy deployment on Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig;
