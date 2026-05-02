/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ekwydksbprxebgmhbmtj.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'coresg-normal.trae.ai',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [{ source: '/', destination: '/coachflow-rebuilt-1.html' }]
  },
}

export default nextConfig
