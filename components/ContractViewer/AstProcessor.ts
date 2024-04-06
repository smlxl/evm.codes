import solParser from '@solidity-parser/parser'
import * as AstTypes from '@solidity-parser/parser/src/ast-types'
import { SourceDefinition } from 'types/ast'

import { ParseResult } from './DeploymentInfo'

export function buildDefinitionTree(ast: ParseResult): SourceDefinition {
  let id = 0
  const defTree = new SourceDefinition()
  let currentContract: AstTypes.ContractDefinition | undefined

  solParser.visit(ast, {
    ContractDefinition: (node: AstTypes.ContractDefinition) => {
      currentContract = node
      defTree.contracts.push({
        id: id++,
        node,
      })
    },
    'ContractDefinition:exit': () => {
      currentContract = undefined
    },
    FunctionDefinition: (node: AstTypes.FunctionDefinition) => {
      if (currentContract?.kind == 'library') {
        return
      }

      defTree.functions.push({
        id: id++,
        node,
        scope: currentContract,
      })
    },
    StateVariableDeclaration: (node: AstTypes.StateVariableDeclaration) => {
      defTree.storage.push({
        id: id++,
        node,
        scope: currentContract,
      })
    },
    StructDefinition: (node: AstTypes.StructDefinition) => {
      defTree.structs.push({
        id: id++,
        node,
        scope: currentContract,
      })
    },
    EnumDefinition: (node: AstTypes.EnumDefinition) => {
      defTree.enums.push({
        id: id++,
        node,
        scope: currentContract,
      })
    },
    EventDefinition: (node: AstTypes.EventDefinition) => {
      defTree.events.push({
        id: id++,
        node,
        scope: currentContract,
      })
    },
    CustomErrorDefinition: (node: AstTypes.CustomErrorDefinition) => {
      defTree.errors.push({
        id: id++,
        node,
        scope: currentContract,
      })
    },
  })

  return defTree
}
