// import { signal, batch } from '@preact/signals-react'
import parser from '@solidity-parser/parser'
import { EtherscanContractResponse } from 'types/contract'

import { etherscanParse } from 'util/EtherscanParser'
import { findContract, flattenCode } from 'util/flatten'

import { ContractTreeNode } from './types'

// TODO: ast parser may not be necessary since solc can give ast
// ...but solc might not give standardized ast. so need to test both
const astParser = parser

export class ContractInfo {
  codeAddress: string
  contextAddress: string
  mainContractPath: string
  code: string
  originalPathLenses: any[] = []
  // ast: any
  // definitions tree - for contracts, functions, storage, etc.
  defTree: ContractTreeNode
  compilationResult: any
  etherscanInfo: EtherscanContractResponse

  parseAst() {
    // parse ast and process definitions tree
    const ast = astParser.parse(this.code, {
      loc: true,
      range: true,
      tolerant: true,
    })
    //this.ast = ast
    let id = 0

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    function makeItem(type, props) {
      return {
        id: self.codeAddress + '_' + self.contextAddress + '_' + id,
        type,
        children: [],
        ...props,
      }
    }

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

    function onNodeEnter(node, parent) {
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

    function onNodeExit(node) {
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
    astParser.visit(ast, allNodesVisitor)

    this.defTree = tree
    // return tree
  }

  static fromEtherscanInfo(
    etherscanInfo: EtherscanContractResponse,
    codeAddress: string,
    contextAddress: string,
  ) {
    const info = new ContractInfo()
    info.etherscanInfo = etherscanInfo
    info.codeAddress = codeAddress
    info.contextAddress = contextAddress

    const contractPath = findContract(
      etherscanInfo.SourceCode,
      etherscanInfo.ContractName,
    )
    if (!contractPath) {
      throw 'failed to find contract...'
    }

    info.mainContractPath = contractPath
    info.code = flattenCode(
      etherscanInfo.SourceCode,
      contractPath,
      info.originalPathLenses,
    )

    info.parseAst()

    return info
  }
}

class ContractViewerState {
  selectedAddress: string
  contracts: { [address: string]: ContractInfo } = {}
  viewedCode: string
  onChange: ((address: string, info: ContractInfo) => void)[] = []

  selectedContract(): ContractInfo {
    return this.contracts[this.selectedAddress]
  }

  onSourceAvailable(
    etherscanInfo: EtherscanContractResponse,
    codeAddress: string,
    contextAddress: string,
  ) {
    if (!etherscanInfo || !etherscanInfo.SourceCode) {
      throw 'no source code found'
    }

    const info = ContractInfo.fromEtherscanInfo(
      etherscanInfo,
      codeAddress,
      contextAddress,
    )

    this.contracts[codeAddress] = info
    if (!this.selectedAddress) {
      this.selectedAddress = codeAddress
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
      Promise.reject('failed to load contract info')
    }

    if (!cachedValue) {
      sessionStorage.setItem(cacheKey, JSON.stringify(etherscanInfo))
    }

    return this.onSourceAvailable(etherscanInfo, codeAddress, contextAddress)
  }

  removeContract(codeAddress: string) {
    const info = this.contracts[codeAddress]
    delete this.contracts[codeAddress]
    if (this.selectedAddress == codeAddress) {
      const remaining = Object.values(this.contracts)
      if (remaining.length > 0) {
        this.selectedAddress = remaining[0].codeAddress
      } else {
        this.selectedAddress = ''
      }
    }

    this.onChange.map((f) => f(codeAddress, info))
  }
}

export const state = new ContractViewerState()
