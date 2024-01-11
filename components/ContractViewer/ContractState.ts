// import { signal, batch } from '@preact/signals-react'
import parser from '@solidity-parser/parser'
import { EtherscanContractResponse } from 'types/contract'

import { etherscanParse } from 'util/EtherscanParser'
import { findContract, flattenCode } from 'util/flatten'

import { ContractTreeNode } from './types'

const astParser = parser

// TODO: not all of this needs to be signals...?
// export const state = {
//   // signals:
//   address: signal<string>(''),
//   code: signal<string>('/*\nenter an address to load source code\n*/'),
//   compilationResult: signal(null),
//   defTree: signal({}),
//   contractInfo: signal<EtherscanContractResponse | null>(null), // move to non-signals?
//   // non-signals:
//   ast: null,
// }

// TODO: not all of this needs to be signals...?

class ContractInfo {
  codeAddress: string
  contextAddress: string
  mainContractPath: string
  code: string
  // ast: any
  // definitions tree - for contracts, functions, storage, etc.
  defTree: ContractTreeNode
  compilationResult: any
  etherscanInfo: EtherscanContractResponse | null

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

    // const astParser = window['SolidityParser']
    // if (!astParser)
    //   throw 'ast parser not loaded'

    info.mainContractPath = contractPath
    info.code = flattenCode(etherscanInfo.SourceCode, contractPath)
    info.parseAst()

    return info
  }
}

class ContractViewerState {
  selectedAddress: string
  contracts: { [address: string]: ContractInfo } = {}
  viewedCode: string
  // astParser: SolidityParser

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

    // TODO: yes it's weird. is there a nicer way to work with signals of objects?
    // let defTree = state.defTree.value
    // defTree[codeAddress] = tree
    // state.defTree.value = { ...defTree }

    this.contracts[codeAddress] = info
    if (!this.selectedAddress) {
      this.selectedAddress = codeAddress
    }

    // recursively load proxy implementation if available
    // it's async so it won't block the rest of the code
    if (etherscanInfo?.Implementation) {
      // console.warn('loading proxy implementation:', etherscanInfo.Implementation, 'for context:', contextAddress, 'from:', codeAddress)
      this.loadContract(etherscanInfo.Implementation, contextAddress)
    }

    // startCompilation(etherscanInfo)
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
      // console.log('found cached contract info')
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
}

export const state = new ContractViewerState()
