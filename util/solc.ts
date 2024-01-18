import { SolidityCompilerInput, SoliditySettings } from 'types/contract'

class SolidityCompiler {
  worker: Worker

  // NOTE: this lazy-load instead of constructor is due to a bug:
  // "ReferenceError: Worker is not defined"
  // this lazy-loading seems to fix it
  init() {
    if (!this.worker) {
      // console.info('starting solc worker')
      this.worker = new Worker('/solcWorker.js')
    }
  }

  listen(callback: (event: MessageEvent) => void) {
    this.init()
    this.worker.addEventListener('message', callback)
  }

  unlisten(callback: (event: MessageEvent) => void) {
    this.worker.removeEventListener('message', callback)
  }

  compile(stdJson: SolidityCompilerInput, version: string) {
    this.init()
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

export const solidityCompiler = new SolidityCompiler()
