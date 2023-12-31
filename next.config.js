/** @type {import('next').NextConfig} */
const webpack = require('webpack')
const path = require('path')

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
    const { dir, defaultLoaders, isServer } = options

    // if (!isServer) {
      // config.resolve.alias['@solidity-parser/parser'] = require.resolve('@solidity-parser/parser/dist/index.iife.js');
      // config.resolve.alias['@solidity-parser/parser'] = path.resolve(__dirname, '/node_modules/@solidity-parser/parser/dist/index.iife.js');
      config.resolve.alias['path'] = require.resolve('path-browserify');
    // }

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
