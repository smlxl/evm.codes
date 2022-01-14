function hljsDefineMnemonic(hljs) {
  const NUMBERS = {
    className: 'number',
    variants: [{ begin: '\\s0[xX][0-9a-fA-F]+' }, { begin: '\\s\\d+' }],
    relevance: 0,
  }

  return {
    name: 'Mnemonic',
    contains: [hljs.C_LINE_COMMENT_MODE, NUMBERS],
  }
}

module.exports = hljsDefineMnemonic
