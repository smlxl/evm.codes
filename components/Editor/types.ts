export enum CodeType {
  Yul = 'Yul',
  Solidity = 'Solidity',
  Bytecode = 'Bytecode',
  Mnemonic = 'Mnemonic',
}

export enum ValueUnit {
  Wei = 'Wei',
  Gwei = 'Gwei',
  Finney = 'Finney',
  Ether = 'Ether',
}

export interface IConsoleOutput {
  type: 'info' | 'warn' | 'error'
  message: string
}

export type ExampleCode = {
  [codeType in CodeType]: string[]
}

export interface MethodAbiInput {
  internalType: string
  name: string
  type: string
}

export interface Contract {
  code: string
  name: string
  abi: Array<MethodAbi>
}

export interface MethodAbi {
  name: string
  inputs: MethodAbiInput[]
  outputs: MethodAbiInput[]
  inputTypes: string
  stateMutability: 'nonpayable' | 'view' | 'payable'
  type: 'constructor' | 'function' | 'compiler'
}
