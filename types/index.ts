declare global {
  interface Window {
    EvmCodes: any
  }
}

export interface IOpcode {
  code: string
  input: string
  output: string
  description: string
  note: string
  group: string
  fee: number
}

export interface IOpcodeMeta {
  input: string
  output: string
  description: string
  note: string
  group: string
}

export interface IOpcodeMetaList {
  [code: string]: IOpcodeMeta
}
