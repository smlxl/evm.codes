import hljs from 'highlight.js'
import hljsDefineSolidity from 'highlightjs-solidity'

const reHex = /^[0-9a-fA-F]+$/

// Add Solidity to Highlight
hljsDefineSolidity(hljs)

/**
 * Checks whether text is empty.
 */
export const isEmpty = (text: string) => {
  return !text || text.length === 0
}

/**
 * Converts number to a hex representation with double-digit formatting.
 */
export const toHex = (text: string | number) => {
  let hex = Number(text).toString(16)
  if (hex.length < 2) {
    hex = '0' + hex
  }
  return hex
}

/**
 * Checks whether text is in hex format.
 */
export const isHex = (text: string) => {
  return reHex.test(text)
}

/**
 * Formats the code with Highlight.js for a given language extension.
 *
 * @param text The text to be highlighted.
 * @param extension One of the supported highlight.js language extensions w/o dot.
 * @returns Highlighted text.
 */
export const codeHighlight = (text: string, extension: string) => {
  return hljs.highlight(text, {
    language: extension,
    ignoreIllegals: true,
  })
}

/**
 * Converts buffer to string.
 */
export const fromBuffer = (buf: Buffer) => {
  let result = ''
  buf.forEach((value) => {
    result += value.toString(16).padStart(2, '0')
  })
  return result
}

/**
 * Creates a RC key from string prefix and index.
 */
export const toKeyIndex = (prefix: string, index: number) => {
  return [prefix, index].join('-')
}
