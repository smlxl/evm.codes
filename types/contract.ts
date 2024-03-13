type SoliditySourceExplicitContent = {
  content: string
  keccak256?: string
}

type SoliditySourceUrlContent = {
  urls: string[]
  content?: string
  keccak256?: string
}

export type SoliditySources = {
  [file: string]: SoliditySourceExplicitContent | SoliditySourceUrlContent
}

export type OptimizerSettings = {
  enabled: boolean
  // Optimize for how many times you intend to run the code.
  // Lower values will optimize more for initial deployment cost, higher values will optimize more for high-frequency usage.
  runs: number
}

export type EvmVersion =
  | 'homestead'
  | 'dao'
  | 'tangerineWhistle'
  | 'spuriousDragon'
  | 'byzantium'
  | 'constantinople'
  | 'petersburg'
  | 'istanbul'
  | 'muirGlacier'
  | 'berlin'
  | 'london'
  | 'arrowGlacier'
  | 'grayGlacier'
  | 'merge'
  | 'shanghai'

export type SoliditySettings = {
  // Sorted list of remappings
  remappings?: Array<string>
  // Optimizer settings
  optimizer?: OptimizerSettings
  evmVersion?: EvmVersion
  metadata?: { useLiteralContent: boolean }
  // Addresses of the libraries. If not all libraries are given here, it can result in unlinked objects whose output data is different.
  libraries?: object
  // The following can be used to select desired outputs.
  // If this field is omitted, then the compiler loads and does type checking, but will not generate any outputs apart from errors.
  // The first level key is the file name and the second is the contract name, where empty contract name refers to the file itself,
  // while the star refers to all of the contracts.
  outputSelection: { [file: string]: { [contract: string]: string[] } }
}

export type SolidityCompilerInput = {
  // source code language, such as "Solidity", "Vyper", "lll", "assembly", etc.
  language: string // "Solidity"
  sources: SoliditySources
  settings?: SoliditySettings
}

// TODO: complete type
export type SolidityCompilerOutputContracts = {
  [file: string]: {
    [contract: string]: {
      abi: any[] // TODO: take from abitypes/viem abi?
      storageLayout?: {
        storage: any[] // TODO: type
        types: { [type: string]: any } // TODO: type
      }
    }
  }
}

// TODO: complete type
export type SolidityCompilerOutputSources = {
  [file: string]: {
    id: number
    ast: object // TODO: take from AstTypes.Ast(SourceUnit)?
  }
}

export type SolidityCompilerOutput = {
  errors?: [any]
  sources: SolidityCompilerOutputSources
  contracts: SolidityCompilerOutputContracts
}

export type EtherscanContractResponse = {
  ContractName: string
  CompilerVersion: string
  OptimizationUsed: string
  Runs: string
  // it's called "SourceCode" but it's actually entire SolidityCompilerInput as json-escaped string, possibly doubly-wrapped in brackets because fuck you
  SourceCode: SolidityCompilerInput
  ABI: string
  ConstructorArguments: string
  EVMVersion: string
  Library: string
  LicenseType: string
  Proxy: string
  Implementation: string
  SwarmSource: string
  // ...
}
