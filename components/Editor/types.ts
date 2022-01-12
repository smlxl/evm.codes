export enum CodeType {
  Yul = 'Yul',
  Solidity = 'Solidity',
  Bytecode = 'Bytecode',
  Mnemonic = 'Mnemonic',
}

export interface IConsoleOutput {
  type: 'info' | 'warn' | 'error'
  message: string
}

export type ExampleCode = {
  [codeType in CodeType]: string[]
}
