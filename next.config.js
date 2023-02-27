/** @type {import('next').NextConfig} */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withPlausibleProxy } = require('next-plausible')

module.exports = withPlausibleProxy()({
  reactStrictMode: true,
  webpack5: true,
  serverRuntimeConfig: {
    APP_ROOT: __dirname,
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
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    }

    config.resolve.fallback = {
      fs: false,
      stream: false,
      crypto: false,
      path: false,
      process: require.resolve('process/browser'),
      assert: require.resolve('assert/'),
      events: require.resolve('events/'),
    }

    return config
  },
})

class WasmChunksFixPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('WasmChunksFixPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: 'WasmChunksFixPlugin' },
        (assets) =>
          Object.entries(assets).forEach(([pathname, source]) => {
            if (!pathname.match(/\.wasm$/)) return
            compilation.deleteAsset(pathname)

            const name = pathname.split('/')[1]
            const info = compilation.assetsInfo.get(pathname)
            compilation.emitAsset(name, source, info)
          }),
      )
    })
  }
}
