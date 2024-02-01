/* eslint-disable @typescript-eslint/no-inferrable-types */
import { useState } from 'react'

import { type Abi, type AbiFunction, type AbiParameter } from 'abitype'
import solParser from '@solidity-parser/parser'
import * as AstTypes from '@solidity-parser/parser/src/ast-types'
import { EtherscanContractResponse } from 'types/contract'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

import { etherscanParse } from 'util/EtherscanParser'
import { findContract, flattenCode } from 'util/flatten'
import { solidityCompiler } from 'util/solc'

export const rpc = createPublicClient({
  chain: mainnet,
  transport: http('https://eth.merkle.io/'),
})

export type Artifact<T> = {
  id: number
  node: T
  // undefined for global scope
  scope?: T

  // constructor(node: AstTypes.BaseASTNode, scope?: AstTypes.BaseASTNode) {
  //   this.node = node
  //   this.scope = scope
  // }
}

// this represents a single contract/interface/library definition block
export class SourceDefinition {
  // name: string = ''
  // filepath: string = ''
  // c3 inheritance / ast node ref?
  contracts: Artifact<AstTypes.ContractDefinition>[] = []
  functions: Artifact<AstTypes.FunctionDefinition>[] = []
  storage: Artifact<AstTypes.VariableDeclarationStatement>[] = [] // TODO: rename as variables? (to include floating immutables, constants)
  structs: Artifact<AstTypes.StructDefinition>[] = []
  events: Artifact<AstTypes.EventDefinition>[] = []
  errors: Artifact<AstTypes.CustomErrorDefinition>[] = []
  enums: Artifact<AstTypes.EnumDefinition>[] = []
}

// this represents an on-chain deployment, defTree may include multiple contract definitions
export class DeploymentInfo {
  codeAddress: string
  contextAddress: string
  mainContractPath: string
  code: string
  accessibleCode: string
  originalPathLenses: any[] = []
  ast: any
  // definitions tree - for contracts, functions, storage, etc.
  defTree: any
  defTreev2: SourceDefinition | undefined
  compilationResult: any
  etherscanInfo: EtherscanContractResponse
  abi: Abi
  // accessible abi is the output from the compiler after converting everything to public
  accessibleAbi: Abi | undefined
  impls: { [address: string]: DeploymentInfo } = {}

  constructor(
    etherscanInfo: EtherscanContractResponse,
    codeAddress: string,
    contextAddress: string,
  ) {
    this.etherscanInfo = etherscanInfo
    this.abi = JSON.parse(etherscanInfo.ABI)
    this.codeAddress = codeAddress
    this.contextAddress = contextAddress
    this.code = ''
    this.accessibleCode = ''

    const contractPath = findContract(
      etherscanInfo.SourceCode,
      etherscanInfo.ContractName,
    )
    if (!contractPath) {
      throw 'failed to find contract...'
    }

    this.mainContractPath = contractPath

    this.code = flattenCode(
      etherscanInfo.SourceCode,
      contractPath,
      this.originalPathLenses,
    )

    this.new_parseAst()
    // this.old_parseAst()
    this.makeAccessibleCode()
  }

  isImpl(): boolean {
    return this.contextAddress != this.codeAddress
  }

  getImplementations(): DeploymentInfo[] {
    return Object.values(this.impls)
  }

  makeAccessibleCode() {
    let accessibleCode = this.code
    let currentContract: AstTypes.ContractDefinition | undefined
    function publicizeNode(node: AstTypes.FunctionDefinition | AstTypes.StateVariableDeclaration) {
      if (!currentContract || currentContract.kind == 'library' || node.isConstructor || node.isFallback || node.isReceiveEther) {
        return
      }

      if (node.visibility != 'external' && node.visibility != 'public') {
        const prefix = accessibleCode.slice(0, node.range[0])
        const suffix = accessibleCode.slice(node.range[1])
        const funcCode = accessibleCode
          .slice(node.range[0], node.range[1])
          .replace(/\b(internal| private)\b/, '  public')

        // TODO: publicize visibility == 'default' functions
        // funcCode = funcCode.replace(/function .+?\)(.+?)
        // console.log(funcCode)
        accessibleCode = prefix + funcCode + suffix
      }
    }

    solParser.visit(this.ast, {
      ContractDefinition: (node: AstTypes.ContractDefinition) => {
        currentContract = node
      },
      'ContractDefinition:exit': () => {
        currentContract = undefined
      },
      FunctionDefinition: publicizeNode,
      StateVariableDeclaration: publicizeNode,
    })

    this.accessibleCode = accessibleCode
    // return accessibleCode
  }

  new_parseAst() {
    // parse ast and process definitions tree
    this.ast = solParser.parse(this.code, {
      loc: true,
      range: true,
      tolerant: true,
    })

    let id = 0
    const defTree = new SourceDefinition()
    let currentContract: AstTypes.BaseASTNode | undefined

    // TODO: perhaps make custom visit logic? using ast._isAstNode()
    solParser.visit(this.ast, {
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
        if (currentContract.kind == 'library') {
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

    this.defTreev2 = defTree
  }

  old_parseAst() {
    // parse ast and process definitions tree
    this.ast = solParser.parse(this.code, {
      loc: true,
      range: true,
      tolerant: true,
    })
    //this.ast = ast
    let id = 0

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    function makeItem(type: any, props: any) {
      return {
        id: self.codeAddress + '_' + self.contextAddress + '_' + id,
        type,
        children: [],
        ...props,
      }
    }

    // TODO: a library can be deployed as a contract
    // so we need to distinguish between embedded and deployed libraries
    // the issue is that in the ast it is under a ContractDefinition node
    const tree = makeItem('Deployment', { node: { info: this } })
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
    solParser.visit(this.ast, allNodesVisitor)

    this.defTree = tree
    // return tree
  }

  compile(callback, outputs: string[]) {
    const tmpCallback = (...args: any) => {
      solidityCompiler.unlisten(tmpCallback)
      callback(...args)
    }
    solidityCompiler.listen(tmpCallback)
    solidityCompiler.compileCode(
      this.code,
      this.etherscanInfo.CompilerVersion,
      outputs,
    )
  }
}

class ContractViewerState {
  contracts: { [address: string]: DeploymentInfo } = {}
  onChange: ((address: string, info: DeploymentInfo) => void)[] = []

  getImpls(): DeploymentInfo[] {
    return Object.values(this.contracts).filter((c) => c.isImpl())
  }

  getProxies(): DeploymentInfo[] {
    return Object.values(this.contracts).filter((c) => !c.isImpl())
  }

  onSourceAvailable(
    etherscanInfo: EtherscanContractResponse,
    codeAddress: string,
    contextAddress: string,
  ) {
    if (!etherscanInfo || !etherscanInfo.SourceCode) {
      throw 'no source code found'
    }

    const info = new DeploymentInfo(etherscanInfo, codeAddress, contextAddress)

    this.contracts[codeAddress] = info
    if (contextAddress != codeAddress) {
      // this is not true because for two delegatecalls then contextAddress is the first proxy
      // but it should be the second proxy here, ie the immediate parent
      // info.proxy = contextAddress
      this.contracts[contextAddress].impls[codeAddress] = info
    }
  }

  async loadContract(codeAddress: string, contextAddress = '') {
    codeAddress = codeAddress.toLowerCase()
    contextAddress = contextAddress.toLowerCase()
    if (!contextAddress) {
      contextAddress = codeAddress
    }

    let etherscanInfo
    const cacheKey = `contractInfo_${codeAddress}`
    const cachedValue = sessionStorage.getItem(cacheKey)
    if (cachedValue) {
      etherscanInfo = JSON.parse(cachedValue)
    } else {
      const data = await fetch('/api/getContract?address=' + codeAddress)
        .then((res) => res.json())
        .catch((err) => {
          console.error(err)
          throw err
        })

      etherscanInfo = etherscanParse(data)
    }

    if (!etherscanInfo) {
      return Promise.reject('failed to load contract info')
    }

    if (!cachedValue) {
      sessionStorage.setItem(cacheKey, JSON.stringify(etherscanInfo))
    }

    return this.onSourceAvailable(etherscanInfo, codeAddress, contextAddress)
  }

  removeContract(info: DeploymentInfo) {
    // const info = this.contracts[codeAddress]
    delete this.contracts[info.codeAddress]
    // if (this.selectedAddress == info.codeAddress) {
    //   const remaining = Object.values(this.contracts)
    //   if (remaining.length > 0) {
    //     this.selectedAddress = remaining[0].codeAddress
    //   } else {
    //     this.selectedAddress = ''
    //   }
    // }

    // console.log(info)
    if (info.contextAddress != info.codeAddress) {
      // it is a proxy impl - remove references from proxies
      for (const c of Object.values(this.contracts)) {
        delete c.impls[info.codeAddress]
      }
    }

    this.onChange.map((f) => f(info.codeAddress, info))
  }
}

export const state = new ContractViewerState()

export const useContracts = () => {
  const [selectedContract, setSelectedContract] = useState<DeploymentInfo | undefined>(undefined)
  const [contracts, setContracts] = useState({})

  return {
    contracts,
    setContracts,

    selectedContract,
    setSelectedContract,
  }
}
