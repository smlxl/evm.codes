/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withImages = require('next-images')

module.exports = withImages({
  reactStrictMode: true,
  webpack5: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.node = {
        fs: 'empty',
        stream: 'empty',
        crypto: 'empty',
        path: 'empty',
      }
    }
    return config
  },
  // Webpack 5 configuration:
  // FIXME: Webpack 5 breaks path reading, see: https://github.com/vercel/next.js/discussions/22853
  // webpack: (config) => {
  //   config.resolve.fallback = {
  //     fs: false,
  //     stream: false,
  //     crypto: false,
  //     path: false,
  //   }

  //   return config
  // },
})
