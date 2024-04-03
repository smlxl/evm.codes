// Helper function to remove the import asserts from files

/* eslint-disable import/order */
const parse = require('@babel/parser').parse
const traverse = require('@babel/traverse').default
const generate = require('@babel/generator').default

const parserOptions = {
  plugins: ['importAssertions'],
  sourceType: 'unambiguous',
}

function getTypeAttribute(assertions) {
  for (const assertion of assertions) {
    if (assertion.key.value === 'type') {
      return assertion.value.value.toLowerCase()
    }
  }
}

module.exports = function (source) {
  const emitError = this.emitError
  const ast = parse(source, parserOptions)

  traverse(
    ast,
    {
      noScope: true,

      ImportDeclaration(path) {
        const node = path.node
        if (node.assertions.length > 0) {
          const type = getTypeAttribute(node.assertions)
          node.assertions = []

          if (type !== 'json') {
            emitError(new Error(`Unexpected module type ${type}`))
          }
        }
      },
    },
    null,
    { source },
  )

  return generate(ast).code
}
