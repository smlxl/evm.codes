import solParser from '@solidity-parser/parser'
import * as AstTypes from '@solidity-parser/parser/src/ast-types'

import { DeploymentInfo } from './ContractState'

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

export function buildDefinitionTreev2(code: string): SourceDefinition {
  // parse ast and process definitions tree
  const ast = solParser.parse(code, {
    loc: true,
    range: true,
    tolerant: true,
  })

  let id = 0
  const defTree = new SourceDefinition()
  let currentContract: AstTypes.ContractDefinition | undefined

  // TODO: perhaps make custom visit logic? using ast._isAstNode()
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

/**
  OLD METHOD -- TOO UGLY

  it used the already ugly ast processor to create typeless tree
  data structure, but the abi has proved to be much more relevant
  ast allows doing more in the long term, but no urgent use for it atm.
*/
export function buildDefinitionTree(contract: DeploymentInfo) {
  // parse ast and process definitions tree
  let id = 0

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  function makeItem(type: any, props: any) {
    return {
      id: contract.codeAddress + '_' + contract.contextAddress + '_' + id,
      type,
      children: [],
      ...props,
    }
  }

  // TODO: a library can be deployed as a contract
  // so we need to distinguish between embedded and deployed libraries
  // the issue is that in the ast it is under a ContractDefinition node
  const tree = makeItem('Deployment', { node: { info: contract } })
  const context: any = [tree]

  const callbackNames = [
    'ContractDefinition',
    'FunctionDefinition',
    'StructDefinition',
    'EventDefinition',
    'ErrorDefinition',
    'EnumDefinition',
    'StateVariableDeclaration',
  ]

  function onNodeEnter(node: any, parent: any) {
    node.nodeId = id++
    if (parent) {
      node.parentId = parent.nodeId
    }

    if (callbackNames.indexOf(node.type) != -1) {
      const item = makeItem(node.type, { node })
      context.at(-1).children.push(item)
      context.push(item)
    }
  }

  function onNodeExit(node: any) {
    if (callbackNames.indexOf(node.type) != -1) {
      context.pop()
    }
  }

  const allNodesVisitor = new Proxy(
    {},
    {
      get(target, name: string) {
        return name.endsWith(':exit') ? onNodeExit : onNodeEnter
      },
    },
  )

  // TODO: perhaps make custom visit logic? using ast._isAstNode()
  solParser.visit(contract.ast, allNodesVisitor)
  return tree
}
