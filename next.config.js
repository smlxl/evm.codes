/** @type {import('next').NextConfig} */
require('webpack')
require('path')

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withPlausibleProxy } = require('next-plausible')

module.exports = withPlausibleProxy()({
  reactStrictMode: false,
  serverRuntimeConfig: {
    APP_ROOT: __dirname,
  },
  compiler: {
    styledComponents: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, options) => {
    const { dir, defaultLoaders } = options

    config.resolve.extensions.push('.ts', '.tsx')
    config.module.rules.push({
      test: /\.+(ts|tsx)$/,
      include: [dir],
      use: [
        defaultLoaders.babel,
        { loader: 'ts-loader', options: { transpileOnly: true } },
      ],
    })

    config.resolve.fallback = {
      fs: false,
      stream: false,
      crypto: false,
      path: require.resolve('path-browserify'),
      process: require.resolve('process/browser'),
      assert: require.resolve('assert/'),
      events: require.resolve('events/'),
    }

    return config
  },
})
