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

    config.resolve.alias['path'] = require.resolve('path-browserify')

    // see: https://github.com/solidity-parser/parser/issues/47
    config.resolve.alias['@solidity-parser/parser'] =
      '@solidity-parser/parser/dist/index.iife.js'

    config.module.rules.push({
      // We tell webpack to append "module.exports = SolidityParser;" at the end of the file.
      test: require.resolve('@solidity-parser/parser/dist/index.iife.js'),
      loader: 'exports-loader',
      options: {
        type: 'commonjs',
        exports: 'single SolidityParser',
      },
    })

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
