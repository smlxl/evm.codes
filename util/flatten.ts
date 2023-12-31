import path from 'path'

export function findContract(stdio, contractName) {
  for (let [filename, code] of Object.entries(stdio.sources)) {
    if (code.content.match(`(contract|library)\\s+${contractName}`)) {
      return filename
    }
  }

  return null
}


export function flattenCode(solidity_parser, stdio, filepath, remove_pragma = false) {
  let imports = []
  let flat = ''
  let source = stdio.sources[filepath].content
  if (remove_pragma) {
    source = source.replace(/^pragma solidity.*$\s*/gm, '').replace(/^\/\/ SPDX-.*$\s*/gm, '')
  }
  const ast = solidity_parser.parse(source, {loc: true, range: true})
  let dirname = path.dirname(filepath)

  solidity_parser.visit(ast, {
    ImportDirective: (node) => {
      imports.push(node)
    }
  })

  let index = 0
  for (let imp of imports) {
    let rel_path = (imp.path[0] == '.' ? path.join(dirname, imp.path) : imp.path)
    let realpath = path.normalize(rel_path).replaceAll('\\', '/')
    flat += source.slice(index, imp.range[0]) + flattenCode(solidity_parser, stdio, realpath, true)
    index = imp.range[1] + 1;
  }
  flat += source.slice(index, source.length) 
  return flat
}
