export enum CodeType {
  Solidity,
  Bytecode,
}

export interface StatusMessage {
  type: 'error' | 'warning' | 'success'
  message: string
}
