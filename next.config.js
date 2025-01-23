// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      appDir: true,
    },
    images: {
      domains: ['localhost'],
    },
    webpack: (config) => {
      config.experiments = { ...config.experiments, topLevelAwait: true }
      return config
    }
  }
  
  module.exports = nextConfig