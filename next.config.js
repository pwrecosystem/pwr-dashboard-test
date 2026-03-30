/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'powerclub.com.co',
      },
    ],
  },
}

module.exports = nextConfig
