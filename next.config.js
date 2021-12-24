/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  webpack5: true,
  serverRuntimeConfig: {
    APP_ROOT: __dirname,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      stream: false,
      crypto: false,
      path: false,
    }

    return config
  },
}
