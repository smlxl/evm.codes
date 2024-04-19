import { SolidityCompilerInput, SoliditySettings } from 'types/contract'

class SolidityCompiler {
  worker?: Worker
  callbacks: { [id: string]: (data: any) => void } = {}

  constructor() {
    // TODO: don't use this deprecated check
    if (process.browser) {
      this.worker = new Worker('/solcWorker.js')
      this.callbacks = {}
      this.worker?.addEventListener(
        'message',
        this.onCompilationResult.bind(this),
      )
    }
  }

  onCompilationResult(event: MessageEvent) {
    const { data } = event
    const callback = this.callbacks[data.jobId]
    if (!callback) {
      console.warn('no callback for job', event)
      return
    }

    delete this.callbacks[data.jobId]
    callback(data)
  }

  compile(stdJson: SolidityCompilerInput, version: string) {
    return new Promise((resolve, reject) => {
      const randomId = 'jobId_' + Math.random()
      // TODO: wrap callback in promise
      this.callbacks[randomId] = resolve
      // delete job after 1 minute to release memory
      setTimeout(() => {
        if (this.callbacks[randomId]) {
          delete this.callbacks[randomId]
          reject('compilation timeout')
        }
      }, 5 * 60000)

      this.worker?.postMessage({
        jobId: randomId,
        version,
        stdJson,
      })
    })
  }

  compileCode(code: string | any, version: string, outputSelection: string[]) {
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

    if (typeof code == 'string') {
      const stdJson = {
        language: 'Solidity',
        sources: {
          'main.sol': {
            content: code,
          },
        },
        settings,
      }

      return this.compile(stdJson, version)
    } else {
      const stdJson = {
        ...code,
        settings: {
          outputSelection: settings.outputSelection,
        },
      }

      return this.compile(stdJson, version)
    }
  }
}

export const solidityCompiler = new SolidityCompiler()
