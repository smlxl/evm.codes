
export type SoliditySources = {
  [file: string]: {
    content?: string
    keccak256?: string
    urls?: string[]
    mortal?: {
      keccak256?: string
      content: string
    }
  }
}

export type OptimizerSettings = {
  enabled: Boolean
  // Optimize for how many times you intend to run the code.
  // Lower values will optimize more for initial deployment cost, higher values will optimize more for high-frequency usage.
  runs: Number
}

export type EvmVersion =
  'homestead' |
  'dao' |
  'tangerineWhistle' |
  'spuriousDragon' |
  'byzantium' |
  'constantinople' |
  'petersburg' |
  'istanbul' |
  'muirGlacier' |
  'berlin' |
  'london' |
  'arrowGlacier' |
  'grayGlacier' |
  'merge' |
  'shanghai'

export type SoliditySettings = {
  // Optional: Sorted list of remappings
  remappings?: Array<string>
  // Optional: Optimizer settings
  optimizer?: OptimizerSettings
  evmVersion: EvmVersion // Version of the EVM to compile for. Affects type checking and code generation. Can be homestead, tangerineWhistle, spuriousDragon, byzantium or constantinople
  // Metadata settings (optional)
  metadata?: { useLiteralContent: Boolean }
  // Addresses of the libraries. If not all libraries are given here, it can result in unlinked objects whose output data is different.
  libraries: Object,
  // The following can be used to select desired outputs.
  // If this field is omitted, then the compiler loads and does type checking, but will not generate any outputs apart from errors.
  // The first level key is the file name and the second is the contract name, where empty contract name refers to the file itself,
  // while the star refers to all of the contracts.
  outputSelection: Object
}

export type SolidityCompilerInput = {
  // Required: Source code language, such as "Solidity", "Vyper", "lll", "assembly", etc.
  language: String // "Solidity"
  // Required
  sources: SoliditySources
  // Optional
  settings?: SoliditySettings
}

export type SolidityCompilerOutput = {
  errors?: [any]
  sources: { [file: string]: object }
  contracts: { [file: string]: object }
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
