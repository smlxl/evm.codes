import path from 'path'

import parser from '@solidity-parser/parser'
import { SolidityCompilerInput } from 'types/contract'

function remapFile(filename: string, remappings: string[]) {
  if (!remappings) {
    return filename
  }

  for (const map of remappings) {
    if (filename.startsWith(map[0])) {
      filename = map[1] + filename.slice(map[0].length, filename.length)
    }
  }

  return filename
}

// function remapSources(sources, remappings) {
//   if (!remappings) {
//     return sources
//   }

//   remappings = remappings.map((map) => map.split('='))
//   for (const filename of Object.keys(sources)) {
//     const remapped = remapFile(filename, remappings)
//     if (filename != remapped) {
//       sources[remapped] = sources[filename]
//       delete sources[filename]
//     }
//   }

//   return sources
// }

function getSources(stdJson: SolidityCompilerInput): any {
  if (stdJson.sources) {
    const remappings = (stdJson.settings?.remappings || []).map((map: string) =>
      map.split('='),
    )
    return [stdJson.sources, remappings]
  } else {
    return [stdJson, null]
  }
}

export function findContract(
  stdJson: SolidityCompilerInput,
  contractName: string,
) {
  const sources = getSources(stdJson)[0]
  for (const [filename, code] of Object.entries(sources) as any) {
    if (!code.content) {
      // throw 'missing code.content (if URL reference is used then it is not currently supported)'
      continue
    }

    // TODO: ensure \s+ eats newlines (need RegExp() with flags?)
    if (code.content.match(`(contract|library)\\s+${contractName}\\b`)) {
      return filename
    }
  }

  return null
}

export function flattenCode(
  stdJson: SolidityCompilerInput,
  filepath: string,
  lenses: any[] | undefined = undefined,
  remove_pragma = false,
  imported: string[] = [],
  lineOffset = 0,
) {
  const imports: any[] = []
  let flat = ''
  const [sources, remappings] = getSources(stdJson)
  const remappedPath = remapFile(filepath, remappings)
  if (!sources[remappedPath]) {
    console.warn('stdJson:', stdJson)
    throw 'source not found: ' + remappedPath
  }

  let source = sources[remappedPath].content

  if (remove_pragma) {
    source = source
      .replace(/^pragma solidity.*$\s*/gm, '')
      .replace(/^\/\/ SPDX-.*$\s*/gm, '')
  }

  // TODO: fix lenses or remove entirely
  // if (lenses && lineOffset == 0) {
  //   lenses.push({
  //     line: 1,
  //     path: remappedPath,
  //   })
  // }

  // source = '/// file: ' + remappedPath + '\n\n' + source

  const ast = parser.parse(source, { loc: true, range: true })
  const dirname = path.dirname(remappedPath)

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
    const preImport = source.slice(index, imp.range[0]).trim() + '\n'
    let flatImport = ''
    flat += preImport

    if (!imported.includes(realpath)) {
      const countLines = lineOffset + flat.split('\n').length
      // flat += '/* preimport at ' + countLines + ' of ' + realpath + '*/'

      // if (lenses) {
      //   lenses.push({
      //     line: countLines,
      //     path: source.slice(imp.range[0], imp.range[1]),
      //   })
      // }

      imported.push(realpath)
      flatImport = flattenCode(
        stdJson,
        realpath,
        lenses,
        true,
        imported,
        countLines,
      )
    }

    flat += flatImport.trim() + '\n'
    // if (lenses && lineOffset == 0) {
    //   lenses.push({
    //     line: lineOffset + flat.split('\n').length,
    //     path: '...cont ' + remappedPath,
    //   })
    // }

    index = imp.range[1] + 1
  }

  flat += source.slice(index, source.length).trim() + '\n'
  return flat
}
