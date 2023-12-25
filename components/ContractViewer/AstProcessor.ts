import solParser from '@solidity-parser/parser'
import * as AstTypes from '@solidity-parser/parser/src/ast-types'

import { ParseResult } from './DeploymentInfo'

export type ContractArtifact<T = AstTypes.BaseASTNode> = {
  id: number
  node: T
  // undefined for global scope
  scope?: AstTypes.ContractDefinition | AstTypes.FunctionDefinition
}

// this represents a single contract/interface/library definition block
export class SourceDefinition {
  // name: string = ''
  // filepath: string = ''
  // c3 inheritance / ast node ref?
  contracts: ContractArtifact<AstTypes.ContractDefinition>[] = []
  functions: ContractArtifact<AstTypes.FunctionDefinition>[] = []
  storage: ContractArtifact<AstTypes.StateVariableDeclaration>[] = [] // TODO: rename as variables? (to include floating immutables, constants)
  structs: ContractArtifact<AstTypes.StructDefinition>[] = []
  events: ContractArtifact<AstTypes.EventDefinition>[] = []
  errors: ContractArtifact<AstTypes.CustomErrorDefinition>[] = []
  enums: ContractArtifact<AstTypes.EnumDefinition>[] = []
}

export function buildDefinitionTree(ast: ParseResult): SourceDefinition {
  let id = 1
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
