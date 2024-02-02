import solParser from '@solidity-parser/parser'
import * as AstTypes from '@solidity-parser/parser/src/ast-types'
// eslint-disable-next-line prettier/prettier
import { type Abi } from 'abitype'
import { EtherscanContractResponse } from 'types/contract'

import { etherscanParse } from 'util/EtherscanParser'
import { findContract, flattenCode } from 'util/flatten'
import { solidityCompiler } from 'util/solc'

import { SourceDefinition, buildDefinitionTreev2 } from './AstProcessor'

/**
 * DeploymentInfo represents an on-chain deployment:
 * 
 * @property {string} code address
 * @property context address (proxy or contract) [may be logical to move this out?]
 * @property code (raw flattenned string for simplicity)
 * @property abi (fetched from etherscan, sourcify or compiled with solcjs)
 * @property defTree may include multiple contract definitions  
 * @property accessible abi (publicized functions, etc.)
 */
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
  accessibleRuntimeCodeBin: string
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
    this.accessibleRuntimeCodeBin = ''

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

    // this.ast = solParser.parse(this.code, {
    //   loc: true,
    //   range: true,
    //   tolerant: true,
    // })

    this.defTreev2 = buildDefinitionTreev2(this.code)
    // this.processAst()
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
      if (!currentContract || currentContract?.kind == 'library' || node.isConstructor || node.isFallback || node.isReceiveEther) {
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

  compile(outputs: string[], callback: (data: any) => void) {
    solidityCompiler.compileCode(
      this.code,
      this.etherscanInfo.CompilerVersion,
      outputs,
      callback,
    )
  }
  
  // TODO: this is supposed to simply make every function and storage public
  // but there can be name clashes (eg. two private "name" variables in
  // different contracts is ok but if both are public then it is an error; need
  // to rename based on ast node id)
  publicizeEverything() {
    // TODO: restore compilation (need to rename identifiers to prevent clashes...)
    this.makeAccessibleCode()
    if (!this.accessibleCode) {
      return false
    }
  
    console.log('compiling accessible code')
    solidityCompiler.compileCode(
      this.accessibleCode,
      this.etherscanInfo.CompilerVersion,
      ['abi', 'evm.deployedBytecode'],
      ({ result, error }) => {
        if (error) {
          console.warn('could not compile:', error)
          return
        }

        if (!result || !result.contracts) {
          console.warn('bad result?', typeof result, result)
          return
        }

        const mainFile = result['contracts']['main.sol']
        const mainContract = mainFile[this.etherscanInfo.ContractName]
        if (!mainContract) {
          console.warn(
            'could not find main contract',
            this.etherscanInfo.ContractName,
            'in',
            mainFile,
          )
          return
        }

        this.accessibleAbi = mainContract.abi
        this.accessibleRuntimeCodeBin =
          mainContract?.evm?.deployedBytecode?.object
      }
    )
  }
}

class ContractViewerState {
  contracts: { [address: string]: DeploymentInfo } = {}
  onRemove: ((address: string, info: DeploymentInfo) => void)[] = []

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

    if (!etherscanInfo || !etherscanInfo?.SourceCode || etherscanInfo?.ABI == "Contract source code not verified") {
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

    this.onRemove.map((f) => f(info.codeAddress, info))
  }
}

export const state = new ContractViewerState()

// I don't get why I need to wrap everything in useState
// if I already have a perfectly working class
// export const useContracts = () => {
//   const [selectedContract, setSelectedContract] = useState<DeploymentInfo | undefined>(undefined)
//   // const [contracts, setContracts] = useState({})

//   return {
//     // contracts,
//     // setContracts,

//     selectedContract,
//     setSelectedContract,
//   }
// }
