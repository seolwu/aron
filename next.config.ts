import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: '**',
    }, {
      protocol: 'http',
      hostname: '**'
    }],
  },
  webpack: (config) => {
    config.cache = { type: 'memory' }
    return config
  },
  reactStrictMode: true,
  devIndicators: {
    appIsrStatus: false,
  },
}

export default nextConfig
