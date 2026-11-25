import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // AVIF → WebP fallback gives the best Core Web Vitals for LCP images.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'img.freepik.com' },
      { protocol: 'https', hostname: 'media.istockphoto.com' },
    ],
    unoptimized: false,
  },
  // Compress all responses — reduces TTFB and improves CWV.
  compress: true,
  // Canonical trailing-slash rule: /routes/ → /routes (no duplicate URLs).
  trailingSlash: false,
  async headers() {
    return [
      {
        // Cache static assets aggressively; Next.js cache-busts via hashed filenames.
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Allow sitemaps & robots to be fetched cross-origin (Googlebot, Bing, etc.)
        source: '/:path(sitemap\\.xml|robots\\.txt)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
    ]
  },
};

export default nextConfig;
