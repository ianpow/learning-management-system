// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      appDir: true,
    },
    images: {
      domains: ['localhost', 'https://hotel-lms.vercel.app/','https://62kidhxkn25hdmh9.public.blob.vercel-storage.com'],
    },
    webpack: (config) => {
      config.experiments = { ...config.experiments, topLevelAwait: true }
      return config
    },
    api: {
      bodyParser: {
        sizeLimit: '15mb' // Adjust this value as needed
      }
    }
  }
  
  module.exports = nextConfig