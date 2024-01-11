import path from 'path'

import parser from '@solidity-parser/parser'
import { SolidityCompilerInput } from 'types/contract'

export function findContract(
  stdJson: SolidityCompilerInput,
  contractName: string,
) {
  if (!stdJson || !stdJson.sources) {
    return contractName
  }

  for (const [filename, code] of Object.entries(stdJson.sources)) {
    if (!code.content) {
      // throw 'missing code.content (if URL reference is used then it is not currently supported)'
      continue
    }

    if (code.content.match(`(contract|library)\\s+${contractName}`)) {
      return filename
    }
  }

  return null
}

// TODO: fix solidity parser import so it won't be necessary as param
export function flattenCode(
  stdJson: SolidityCompilerInput,
  filepath: string,
  remove_pragma = false,
  imported: string[] = [],
) {
  const imports: any[] = []
  let flat = ''
  let source = stdJson.sources[filepath].content
  if (!source) {
    throw 'source not found: ' + filepath
  }

  if (remove_pragma) {
    source = source
      .replace(/^pragma solidity.*$\s*/gm, '')
      .replace(/^\/\/ SPDX-.*$\s*/gm, '')
  }

  // source = '/// file: ' + filepath + '\n\n' + source

  const ast = parser.parse(source, { loc: true, range: true })
  const dirname = path.dirname(filepath)

  parser.visit(ast, {
    ImportDirective: (node) => {
      imports.push(node)
    },
  })

  let index = 0
  for (const imp of imports) {
    const rel_path =
      imp.path[0] == '.' ? path.join(dirname, imp.path) : imp.path

    const realpath = path.normalize(rel_path).replaceAll('\\', '/')
    const preImport = source.slice(index, imp.range[0])
    let flatImport = ''
    if (!imported.includes(realpath)) {
      imported.push(realpath)
      flatImport = flattenCode(stdJson, realpath, true, imported)
    }

    flat += preImport + flatImport
    index = imp.range[1] + 1
  }

  flat += source.slice(index, source.length)
  return flat
}
