
export type SoliditySources = {
  [file: string]: {
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

export type EtherscanContractResponse = {
  ContractName: string
  CompilerVersion: string
  OptimizationUsed: string
  Runs: string
  // it's called "SourceCode" but it's actually entire SolidityCompilerInput as json-escaped string, possibly doubly-wrapped in brackets because fuck you
  SourceCode: SolidityCompilerInput | string | string[]
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

type EtherscanResponse = {
  status: string
  message: string
  result: EtherscanContractResponse[] | string
}

/// parse response from etherscan api and return the compiler inputs object
export function etherscanParse(response: EtherscanResponse): (null | EtherscanContractResponse) {
  if (response.message !== 'OK') {
    // throw 'bad response: ' + response.result
    return null;
  }

  let data = response.result[0];
  if (typeof data == 'string') {
    return null;
  }

  if (typeof data.SourceCode == 'string') {
    // SourceCode is json-escaped, convert for convenience
    if (data.SourceCode.startsWith('{{')) {
      // sometimes it is doubly-wrapped, idk. fuck it
      data.SourceCode = JSON.parse(data.SourceCode.slice(1, -1))
    } else if (data.SourceCode != '') {
      data.SourceCode = JSON.parse(data.SourceCode)
    }
  }

  return data
}
