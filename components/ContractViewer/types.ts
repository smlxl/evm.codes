import { ASTNode } from '@solidity-parser/parser/src/ast-types'

export type SolidityParser = {
  parse: (code: string, params?: object) => object
  visit: (ast: object, callbacks: object) => void
}

export type ContractTreeNode = {
  id: string
  ast: ASTNode
  // onclick?: (e) => void
  // children?: React.ReactNode
}

// function / struct / enum / event / error
export type ContractClause = {
  type: string // 'function' | 'event' | 'enum' | 'struct' | 'mapping' | 'array'
}

// a contract / abstract / interface / (embedded) library
export type ContractSection = {
  name: string
  type: string // 'contract' | 'interface' | 'library'
  clauses: ContractClause[]
}

// reference to another Agreement/Deployment? (call; what about delegatecall? Delegations)
// export type ContractDelegation = {
// }

export type ContractReference = {
  context: string
}

// a master contract ("Agreement"/"Deployment")
export type ContractDeployment = {
  // name of the master contract
  deploymentName: string
  codeAddress: string
  contextAddress: string
  // flattened code
  code: string
  ast: ASTNode
  // contracts, interfaces and libraries
  sections: ContractSection[]
  // floating functions, structs, enums, events, errors
  freeClauses: ContractClause[]
  // proxy implementation or other delegatecalls
  delegations: ContractDeployment[]
  // addresses of external libraries or other external calls
  // (references are not be part of the tree, this only serves as a link)
  referenceAddresses: string[]
}
