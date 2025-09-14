/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        }
      }
    }
  ],
  disable: process.env.NODE_ENV === 'development'
})

const nextConfig = {
  // PWA対応
  ...withPWA({
    // Next.js設定
    reactStrictMode: true,

    // TypeScript設定
    typescript: {
      // 本番ビルド時でも型チェックを実行
      ignoreBuildErrors: false,
    },

    // ESLint設定
    eslint: {
      // ビルド時にESLintチェックを実行
      ignoreDuringBuilds: false,
    },

    // 画像最適化
    images: {
      domains: [],
      formats: ['image/webp', 'image/avif'],
    },
  })
}

module.exports = nextConfig