import { SolidityCompilerInput, SoliditySettings } from 'types/contract'

class SolidityCompiler {
  worker?: Worker
  callbacks: { [id: string]: (data: any) => void } = {}

  // NOTE: this lazy-load instead of constructor is due to a bug:
  // "ReferenceError: Worker is not defined"
  // this lazy-loading seems to fix it
  init() {
    if (!this.worker) {
      // console.info('starting solc worker')
      this.worker = new Worker('/solcWorker.js')
      this.callbacks = {}
      this.listen(this.onCompilationResult.bind(this))
    }
  }

  onCompilationResult(event: MessageEvent) {
    const { data } = event
    const callback = this.callbacks[data.jobId]
    if (!callback) {
      console.warn('no callback for job', data.jobId)
      return
    }

    delete this.callbacks[data.jobId]
    callback(data)
  }

  listen(callback: (event: MessageEvent) => void) {
    this.init()
    this.worker.addEventListener('message', callback)
  }

  unlisten(callback: (event: MessageEvent) => void) {
    this.worker.removeEventListener('message', callback)
  }

  // TODO: promisify??
  compile(
    stdJson: SolidityCompilerInput,
    version: string,
    callback: (data: any) => void,
  ) {
    this.init()
    const randomId = 'jobId_' + Math.random()
    // TODO: wrap callback in promise
    this.callbacks[randomId] = callback
    // delete job after 1 minute to release memory
    setTimeout(() => {
      delete this.callbacks[randomId]
    }, 60000)
    this.worker.postMessage({
      jobId: randomId,
      version,
      stdJson,
    })
  }

  compileCode(
    code: string,
    version: string,
    outputSelection: string[],
    callback: (data: any) => void,
  ) {
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

    this.compile(stdJson, version, callback)
  }
}

export const solidityCompiler = new SolidityCompiler()
