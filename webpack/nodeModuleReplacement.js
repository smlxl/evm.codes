// Helper function to transform from node packages to browser compatible packages

const { NormalModuleReplacementPlugin } = require('webpack')

module.exports.default = new NormalModuleReplacementPlugin(
  /node:/,
  (resource) => {
    const mod = resource.request.replace(/^node:/, '')
    switch (mod) {
      case 'buffer':
        resource.request = 'buffer'
        break
      case 'stream':
        resource.request = 'readable-stream'
        break
      case 'stream/web':
        resource.request = 'readable-stream'
        break
      default:
        throw new Error(
          `NormalModuleReplacementPlugin: Node package not found ${mod}`,
        )
    }
  },
)
