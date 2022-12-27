function hljsDefineBytecode(hljs) {
  return {
    name: 'Bytecode',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.HASH_COMMENT_MODE,
      hljs.COMMENT(
        ';', // begin
        '$', // end
      ),
    ],
  }
}

module.exports = hljsDefineBytecode
