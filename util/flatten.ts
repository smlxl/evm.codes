import path from 'path'
import { SolidityCompilerInput } from 'types/contract'

export function findContract(
  stdJson: SolidityCompilerInput,
  contractName: string
) {
  if (!stdJson || !stdJson.sources)
    return contractName

  for (let [filename, code] of Object.entries(stdJson.sources)) {
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

type SolidityParser = {
  parse: (code: string, params?: object) => object
  visit: (ast: object, callbacks: object) => void
}

// TODO: fix solidity parser import so it won't be necessary as param
export function flattenCode(
  astParser: SolidityParser,
  stdJson: SolidityCompilerInput,
  filepath: string,
  remove_pragma: boolean = false,
  imported: string[] = []
) {
  let imports: any[] = []
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

  const ast = astParser.parse(source, { loc: true, range: true })
  let dirname = path.dirname(filepath)

  astParser.visit(ast, {
    ImportDirective: (node) => {
      imports.push(node)
    }
  })

  let index = 0
  for (let imp of imports) {
    let rel_path = (imp.path[0] == '.' ? path.join(dirname, imp.path) : imp.path)
    let realpath = path.normalize(rel_path).replaceAll('\\', '/')
    let preImport = source.slice(index, imp.range[0])
    let flatImport = ''
    if (!imported.includes(realpath)) {
      imported.push(realpath)
      flatImport = flattenCode(
        astParser,
        stdJson,
        realpath,
        true,
        imported
      )
    }

    flat += preImport + flatImport
    index = imp.range[1] + 1;
  }
  flat += source.slice(index, source.length)
  return flat
}
