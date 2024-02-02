import { useState } from 'react'

import solParser from '@solidity-parser/parser'
import * as AstTypes from '@solidity-parser/parser/src/ast-types'
// eslint-disable-next-line prettier/prettier
import { type Abi } from 'abitype'
import { EtherscanContractResponse } from 'types/contract'

import { findContract, flattenCode } from 'util/flatten'
import { solidityCompiler } from 'util/solc'

import { SourceDefinition, buildDefinitionTreev2 } from './AstProcessor'
import EtherscanLoader from './EtherscanLoader'

type ParseResult = AstTypes.SourceUnit & {
  errors?: any[]
  tokens?: any[]
}

// TODO: should probably move some of the contract code parts to another class
// it might be useful to have separate compilationInfo for separate deployments but
// this class is too big rn, can and probably should move code, abi, compilationInfo to
// a "SolidityContract" class

/**
 * DeploymentInfo represents an on-chain deployment:
 * 
 * @property chainId (chain id as decimal number)
 * @property code (raw flattenned string for simplicity)
 * @property address (on-chain address, currently mainnet only)
 * @property context (optional reference to proxy deployment) [may be logical to move this out?]
 * @property impls (deployment references of proxy implementations or delegations)
 * @property mainContractPath (path to main contract in source code - taken from etherscan)
 * @property etherscanInfo (slightly parsed response from etherscan)
 * @property compilationInfo (need to decide if this is directly from etherscan
 *           or flattenned or post-processed code for accessiblity)
 * @property abi (fetched from etherscan, sourcify or compiled with solcjs)
 * @property accessibleCode (publicized functions, etc.)
 * @property accessibleAbi (publicized functions, etc.)
 * @property accessibleRuntimeBytecode (accessible bytecode for eth_call overrides)
 * @property defTree (may include multiple contract definitions)
 * @property defTreev2 (better structured definition tree, but also not perfect)
 */
export class DeploymentInfo {
  id: string
  chainId = 1
  code: string
  address: string
  context?: DeploymentInfo
  impls: { [address: string]: DeploymentInfo } = {}

  mainContractPath: string
  // originalPathLenses: any[] = []

  etherscanInfo: EtherscanContractResponse
  compilationInfo: any // TODO: types

  ast?: ParseResult // TODO: types
  // definitions tree - for contracts, functions, storage, etc.
  defTree: any
  defTreev2: SourceDefinition | undefined

  abi: Abi

  // accessible props are output from the compiler after converting everything to public
  accessibleCode: string
  accessibleAbi: Abi | undefined
  accessibleRuntimeBytecode: string

  constructor(
    etherscanInfo: EtherscanContractResponse,
    address: string,
    context?: DeploymentInfo,
  ) {
    this.id = Math.random().toString().slice(2, 10)
    this.etherscanInfo = etherscanInfo
    this.abi = JSON.parse(etherscanInfo.ABI)
    this.address = address
    this.context = context
    this.code = ''
    this.accessibleCode = ''
    this.accessibleRuntimeBytecode = ''

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
    return !!this.context
  }

  getImplementations(): DeploymentInfo[] {
    return Object.values(this.impls)
  }

  rootContext(): DeploymentInfo {
    return this.context ? this.context.rootContext() : this
  }

  makeAccessibleCode() {
    let accessibleCode = this.code
    let currentContract: AstTypes.ContractDefinition | undefined
    function publicizeNode(node: AstTypes.FunctionDefinition | AstTypes.StateVariableDeclaration) {
      if (!currentContract || currentContract?.kind == 'library' || node.isConstructor || node.isFallback || node.isReceiveEther) {
        return
      }

      if (node?.visibility != 'external' && node?.visibility != 'public') {
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
        this.accessibleRuntimeBytecode =
          mainContract?.evm?.deployedBytecode?.object
      }
    )
  }
}

export const useDeployments = () => {
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentInfo | undefined>(undefined)
  const [deployments, setDeployments] = useState<{ [address: string]: DeploymentInfo }>({})

  const loadDeployment = (address: string, context?: DeploymentInfo) => {
    return EtherscanLoader.loadDeployment(address, context)
      .then((deployment: DeploymentInfo) => {
        // TODO: should we avoid overriding if it already exists?
        console.log('loaded new deployment', deployment.address, 'at context', context?.address)
        if (context) {
          context.impls[address] = deployment
        } else {
          deployments[address] = deployment
        }

        setDeployments({ ...deployments })
        setSelectedDeployment(deployment)

        return deployment
      })
  }

  const removeDeployment = (deployment: DeploymentInfo, context?: DeploymentInfo) => {
    if (context) {
      delete context.impls[deployment.address]
    } else {
      delete deployments[deployment.address]
    }

    setDeployments({ ...deployments })
    if (selectedDeployment == deployment) {
      setSelectedDeployment(undefined)
    }
  }

  return {
    deployments,
    setDeployments,

    loadDeployment,
    removeDeployment,

    selectedDeployment,
    setSelectedDeployment,
  }
}
