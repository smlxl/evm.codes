import { EtherscanContractResponse } from 'types/contract'

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

  // SourceCode is json-escaped, convert for convenience
  let sourceStr = data.SourceCode.toString()
  if (sourceStr.startsWith('{{')) {
    // sometimes it is doubly-wrapped, idk. fuck it
    data.SourceCode = JSON.parse(sourceStr.slice(1, -1))
  } else if (sourceStr.startsWith('{')) {
    data.SourceCode = JSON.parse(sourceStr)
  } else {
    // TODO: need mock settings?
    // https://gydocument.readthedocs.io/en/latest/using-the-compiler.html#input-description
    // the compiler should accept raw string, but the UI expects sources by filenames
    data.SourceCode = {
      language: "Solidity",
      sources: { [data.ContractName]: { content: sourceStr } }
    } //as SolidityCompilerInput
  }

  return data
}
