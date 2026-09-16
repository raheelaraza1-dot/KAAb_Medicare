// Turbopack resolveAlias must use project-relative paths (not absolute paths).
const alias = {
  'framer-motion': './lib/framer-motion.jsx',
  'react-router-dom': './lib/react-router-dom.jsx',
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
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL !== undefined ? process.env.NEXT_PUBLIC_API_URL : (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4000'),
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
