export enum CodeType {
  Yul = 'Yul',
  Solidity = 'Solidity',
  Bytecode = 'Bytecode',
  Mnemonic = 'Mnemonic',
}

export enum ValueCurrency {
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
