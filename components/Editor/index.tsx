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

import { codeHighlight, isEmpty, isHex } from 'util/string'

import examples from 'components/Editor/examples'
import InstructionList from 'components/Editor/Instructions'

import Console from './Console'
import ExecutionState from './ExecutionState'
import ExecutionStatus from './ExecutionStatus'
import Header from './Header'
import { IConsoleOutput, CodeType } from './types'

type Props = {
  readOnly?: boolean
}

type SCEditorRef = {
  _input: HTMLTextAreaElement
} & RefObject<React.FC>

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
    selectedFork,
  } = useContext(EthereumContext)

  const [code, setCode] = useState('')
  const [compiling, setIsCompiling] = useState(false)
  const [codeType, setCodeType] = useState<string | undefined>()
  const [codeModified, setCodeModified] = useState(false)
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
    const initialCodeType: CodeType =
      getSetting(Setting.EditorCodeType) || CodeType.Yul

    setCodeType(initialCodeType)
    setCode(examples[initialCodeType][0])
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
    setCodeModified(true)
  }

  const highlightCode = (value: string) => {
    if (!codeType) return value

    return codeHighlight(value, codeType)
      .value.split('\n')
      .map((line, i) => `<span class='line-number'>${i + 1}</span>${line}`)
      .join('\n')
  }

  const highlightBytecode = (value: string) => {
    return value
  }

  const handleRun = useCallback(() => {
    if (codeType === CodeType.Bytecode) {
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
    } else {
      setIsCompiling(true)
      log('Starting compilation...')

      if (solcWorkerRef?.current) {
        solcWorkerRef.current.postMessage({
          language: codeType,
          evmVersion: selectedFork?.name,
          source: code,
        })
      }
    }
  }, [code, codeType, selectedFork, loadInstructions, log, startExecution])

  const handleCodeTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setCodeType(value)
    setSetting(Setting.EditorCodeType, value)

    if (!codeModified && codeType) {
      setCode(examples[value as CodeType][0])
    }

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
    <div className="bg-gray-100 dark:bg-black-700 rounded-lg">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2">
          <div className="border-b border-gray-200 dark:border-black-500 flex items-center px-6 h-14 md:border-r">
            <Header
              isRunDisabled={isRunDisabled}
              onCodeTypeChange={handleCodeTypeChange}
              onRun={handleRun}
              codeType={codeType}
            />
          </div>

          <div
            className="relative pane pane-light overflow-auto md:border-r bg-gray-50 dark:bg-black-600 border-gray-200 dark:border-black-500"
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
          <div className="border-t md:border-t-0 border-b border-gray-200 dark:border-black-500 flex items-center pl-4 pr-6 h-14">
            <ExecutionStatus />
          </div>

          <div
            className="pane pane-light overflow-auto bg-gray-50 dark:bg-black-600"
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
            className="pane pane-dark overflow-auto border-t border-black-900 border-opacity-25 bg-gray-800 dark:bg-black-700 text-white px-4 py-3"
            style={{ height: consoleHeight }}
          >
            <ExecutionState />
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div
            className="pane pane-dark overflow-auto bg-gray-800 dark:bg-black-700 text-white border-t border-black-900 border-opacity-25 md:border-r"
            style={{ height: consoleHeight }}
          >
            <Console output={output} />
          </div>
        </div>
      </div>

      <div className="rounded-b-lg py-2 px-4 border-t bg-gray-800 dark:bg-black-700 border-black-900 border-opacity-25 text-gray-400 dark:text-gray-600 text-xs">
        Solidity Compiler {compilerVersion}
      </div>
    </div>
  )
}

export default Editor
