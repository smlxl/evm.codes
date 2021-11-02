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

export interface IInstruction {
  id: number
  name: string
  value?: string | undefined
  hasBreakpoint?: boolean
}

export interface IStorage {
  address: string
  slot: string
  value: string
}

export interface IExecutionState {
  programCounter: number | undefined
  stack: string[]
  storage: IStorage[]
  memory: string | undefined
  totalGas: string | undefined
  currentGas: string | undefined
}

export interface IChain {
  id: number
  name: string
}

export interface IOpcodeDocMeta {
  fork: string
  group: string
}

export interface IOpcodeDoc {
  meta: IOpcodeDocMeta
  mdxSource: any
}

export interface IOpcodeDocs {
  [opcode: string]: IOpcodeDoc
}
