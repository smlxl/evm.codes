import React, {
  ChangeEvent,
  useState,
  useRef,
  useEffect,
  useContext,
  useMemo,
  useCallback,
  MutableRefObject,
  RefObject,
} from 'react'

import cn from 'classnames'
import SCEditor from 'react-simple-code-editor'

import { EthereumContext } from 'context/ethereumContext'
import { SettingsContext, Setting } from 'context/settingsContext'

import { exampleContract } from 'util/contracts'
import { codeHighlight, isEmpty, isHex } from 'util/string'

import InstructionList from 'components/Editor/Instructions'

import Console from './Console'
import ExecutionState from './ExecutionState'
import ExecutionStatus from './ExecutionStatus'
import Header from './Header'
import { IConsoleOutput } from './types'

type Props = {
  readOnly?: boolean
}

type SCEditorRef = {
  _input: HTMLTextAreaElement
} & RefObject<React.FC>

enum CodeType {
  Solidity,
  Bytecode,
}

const editorHeight = 350
const consoleHeight = 350

// FIXME: Handle compiler detection
const compilerVersion = 'v0.8.9'

const Editor = ({ readOnly = false }: Props) => {
  const { settingsLoaded, getSetting, setSetting } = useContext(SettingsContext)

  const {
    deployContract,
    loadInstructions,
    startExecution,
    deployedContractAddress,
    vmError,
  } = useContext(EthereumContext)

  const [code, setCode] = useState(exampleContract)
  const [compiling, setIsCompiling] = useState(false)
  const [codeType, setCodeType] = useState<number | undefined>()
  const [output, setOutput] = useState<IConsoleOutput[]>([
    {
      type: 'info',
      message: `Loading Solidity compiler ${compilerVersion}...`,
    },
  ])
  const solcWorkerRef = useRef<null | Worker>(null)
  const instructionsRef = useRef() as MutableRefObject<HTMLDivElement>
  const editorRef = useRef<SCEditorRef>()

  const handleWorkerMessage = (event: MessageEvent) => {
    const { code: byteCode, error } = event.data

    if (error) {
      log(error, 'error')
      setIsCompiling(false)
      return
    }

    deployContract(byteCode).then((tx) => {
      loadInstructions(byteCode)
      setIsCompiling(false)
      startExecution(byteCode, tx)
    })
  }

  const log = useCallback(
    (line: string, type = 'info') => {
      setOutput([...output, { type, message: line }])
    },
    [output, setOutput],
  )

  useEffect(() => {
    setCodeType(getSetting(Setting.EditorCodeType) || CodeType.Solidity)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoaded])

  useEffect(() => {
    solcWorkerRef.current = new Worker(
      new URL('../../lib/solcWorker.js', import.meta.url),
    )
    solcWorkerRef.current.onmessage = handleWorkerMessage
    log('Solidity compiler loaded')

    return () => {
      if (solcWorkerRef?.current) solcWorkerRef.current.terminate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (deployedContractAddress) {
      log(`Contract deployed at address: ${deployedContractAddress}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deployedContractAddress])

  useEffect(() => {
    if (vmError) {
      log(vmError, 'error')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vmError])

  const handleCodeChange = (value: string) => {
    setCode(value)
  }

  const highlightCode = (value: string) => {
    return codeHighlight(value, 'sol')
      .value.split('\n')
      .map((line, i) => `<span class='line-number'>${i + 1}</span>${line}`)
      .join('\n')
  }

  const highlightBytecode = (value: string) => {
    return value
  }

  const handleRun = useCallback(() => {
    if (codeType === CodeType.Solidity) {
      setIsCompiling(true)
      log('Starting compilation...')

      if (solcWorkerRef?.current) {
        solcWorkerRef.current.postMessage({
          // TODO: Use evm version from the selected network
          evmVersion: 'london',
          source: code,
        })
      }
    } else if (codeType === CodeType.Bytecode) {
      if (code.length % 2 !== 0) {
        log('There should be at least 2 characters per byte.', 'warn')
        return
      }
      if (!isHex(code)) {
        log('Only hexadecimal characters are allowed.', 'warn')
        return
      }
      loadInstructions(code)
      startExecution(code)
    }
  }, [code, codeType, loadInstructions, log, startExecution])

  const handleCodeTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value)
    setCodeType(value as CodeType)
    setSetting(Setting.EditorCodeType, value)

    // NOTE: SCEditor does not expose input ref as public /shrug
    if (editorRef?.current?._input) {
      const input = editorRef?.current?._input

      input.focus()
      input.select()
    }
  }

  const isRunDisabled = useMemo(() => {
    return compiling || isEmpty(code)
  }, [compiling, code])

  const isBytecode = useMemo(() => codeType === CodeType.Bytecode, [codeType])

  return (
    <div className="bg-gray-200 rounded-lg">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2">
          <div className="border-gray-300 px-6 h-8 my-3 md:border-r">
            <Header
              isBytecode={isBytecode}
              isRunDisabled={isRunDisabled}
              onCodeTypeChange={handleCodeTypeChange}
              onRun={handleRun}
            />
          </div>

          <div
            className="relative pane pane-light overflow-auto md:border-r bg-gray-100 border-gray-200"
            style={{ height: editorHeight }}
          >
            <SCEditor
              // @ts-ignore: SCEditor is not TS-friendly
              ref={editorRef}
              value={code}
              readOnly={readOnly}
              onValueChange={handleCodeChange}
              highlight={isBytecode ? highlightBytecode : highlightCode}
              tabSize={4}
              className={cn('code-editor', {
                'with-numbers': !isBytecode,
              })}
            />
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="flex items-center pl-4 pr-6 my-3 h-8">
            <ExecutionStatus />
          </div>

          <div
            className="pane pane-light overflow-auto bg-gray-100"
            style={{ height: editorHeight }}
            ref={instructionsRef}
          >
            <InstructionList containerRef={instructionsRef} />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row-reverse">
        <div className="w-full md:w-1/2">
          <div
            className="pane pane-dark overflow-auto bg-gray-700 text-white px-4 py-3"
            style={{ height: consoleHeight }}
          >
            <ExecutionState />
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div
            className="pane pane-dark overflow-auto bg-gray-700 text-white border-t border-gray-800 border-opacity-25 md:border-r"
            style={{ height: consoleHeight }}
          >
            <Console output={output} />
          </div>
        </div>
      </div>

      <div className="rounded-b-lg py-2 px-4 border-t bg-gray-700 border-gray-800 border-opacity-25 text-gray-400 text-xs text-right">
        {
          // TODO: Add editor prefs
        }
        Here will be editor prefs: Tab size, LOC, theme, etc.
      </div>
    </div>
  )
}

export default Editor
