import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const alias = {
  'framer-motion': path.join(__dirname, 'lib/framer-motion.jsx'),
  'react-router-dom': path.join(__dirname, 'lib/react-router-dom.jsx'),
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
  turbopack: {
    resolveAlias: alias,
  },
  webpack: (config) => {
    config.resolve.alias = { ...config.resolve.alias, ...alias }
    return config
  },
}

export default nextConfig
