/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14 App Router
  reactStrictMode: true,

  // Allow images from Supabase Storage
  // Fix: Next.js remotePatterns does not support wildcard (*) in hostname
  // Use a regex pattern instead via the hostname field
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // Matches any subdomain of supabase.co (e.g. abc123.supabase.co)
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // API proxy to Express backend during development
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
