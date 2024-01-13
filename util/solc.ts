import { SolidityCompilerInput, SoliditySettings } from 'types/contract'

class SolidityCompiler {
  worker: Worker

  constructor(url) {
    // console.info('starting solc worker')
    this.worker = new Worker(url)
  }

  listen(callback: (event: MessageEvent) => void) {
    return this.worker.addEventListener('message', callback)
  }

  compile(stdJson: SolidityCompilerInput, version: string) {
    this.worker.postMessage({
      version,
      stdJson,
    })
  }

  compileCode(code: string, version: string, outputSelection: string[]) {
    const settings: SoliditySettings = {
      outputSelection: {
        // the format is a bit weird. here for simplicity apply outputSelection
        // to all files and all contracts
        // first key is file filter - asterisk for all files
        '*': {
          '': outputSelection, // entire file output selections
          '*': outputSelection, // per-contract output selections
        },
      },
    }

    const stdJson: SolidityCompilerInput = {
      language: 'Solidity',
      sources: {
        'main.sol': {
          content: code,
        },
      },
      settings,
    }

    this.compile(stdJson, version)
  }
}

export const solidityCompiler = new SolidityCompiler('/solcWorker.js')
