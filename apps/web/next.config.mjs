import createNextIntlPlugin from 'next-intl/plugin'
import withPwaInit from 'next-pwa'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const withPwa = withPwaInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: globalThis.process?.env?.['NODE_ENV'] === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?:\/\/.*\/api\/.*$/,
      handler: 'NetworkFirst',
      options: { cacheName: 'api-cache', expiration: { maxEntries: 100, maxAgeSeconds: 300 } },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico)$/,
      handler: 'CacheFirst',
      options: { cacheName: 'image-cache', expiration: { maxEntries: 200, maxAgeSeconds: 86400 } },
    },
    {
      urlPattern: /\.(?:js|css)$/,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'static-assets' },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default withNextIntl(withPwa(nextConfig))
