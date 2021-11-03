export enum CodeType {
  Solidity,
  Bytecode,
}

export interface IConsoleOutput {
  type: 'info' | 'warn' | 'error'
  message: string
}
