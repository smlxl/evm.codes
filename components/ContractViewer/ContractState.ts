import { signal, batch } from '@preact/signals-react'
import { ContractTreeNode, ContractDeployment, ContractSection, ContractClause, SolidityParser } from './types'
import { EtherscanContractResponse } from 'types/contract'

// TODO: not all of this needs to be signals...?
export const state = {
  // signals:
  address: signal<string>(''),
  code: signal<string>('/*\nenter an address to load source code\n*/'),
  compilationResult: signal(null),
  defTree: signal({}),
  contractInfo: signal<EtherscanContractResponse | null>(null), // move to non-signals?
  // non-signals:
  ast: null,
}



/*
// TODO: not all of this needs to be signals...?

type ContractViewerState = {
  address: string
  code: string
  ast: any
  compilationResult: any
  // definitions tree - for contracts, functions, storage, etc.
  defTree: ContractTreeNode
  contractInfo: EtherscanContractResponse | null
}

export const state = {
  selectedAddress: '',
  contracts: {}
}

*/