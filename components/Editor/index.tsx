import React, {
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
import { BN } from 'ethereumjs-util'
import Select, { OnChangeValue } from 'react-select'
import SCEditor from 'react-simple-code-editor'

import { EthereumContext } from 'context/ethereumContext'
import { SettingsContext, Setting } from 'context/settingsContext'

import {
  getTargetEvmVersion,
  compilerSemVer,
  getBytecodeFromMnemonic,
} from 'util/compiler'
import { codeHighlight, isEmpty, isFullHex, isHex } from 'util/string'

import examples from 'components/Editor/examples'
import InstructionList from 'components/Editor/Instructions'
import { Button, Input } from 'components/ui'

import Console from './Console'
import ExecutionState from './ExecutionState'
import ExecutionStatus from './ExecutionStatus'
import Header from './Header'
import { IConsoleOutput, CodeType, ValueUnit } from './types'

type Props = {
  readOnly?: boolean
}

type SCEditorRef = {
  _input: HTMLTextAreaElement
} & RefObject<React.FC>

const editorHeight = 350
const consoleHeight = 350
const instructionsListHeight = editorHeight + 52 // RunBar

const unitOptions = Object.keys(ValueUnit).map((value) => ({
  value,
  label: value,
}))

const Editor = ({ readOnly = false }: Props) => {
  const { settingsLoaded, getSetting, setSetting } = useContext(SettingsContext)

  const {
    deployContract,
    loadInstructions,
    startExecution,
    startTransaction,
    deployedContractAddress,
    vmError,
    selectedFork,
    opcodes,
  } = useContext(EthereumContext)

  const [code, setCode] = useState('')
  const [compiling, setIsCompiling] = useState(false)
  const [codeType, setCodeType] = useState<string | undefined>()
  const [codeModified, setCodeModified] = useState(false)
  const [output, setOutput] = useState<IConsoleOutput[]>([
    {
      type: 'info',
      message: `Loading Solidity compiler ${compilerSemVer}...`,
    },
  ])
  const solcWorkerRef = useRef<null | Worker>(null)
  const instructionsRef = useRef() as MutableRefObject<HTMLDivElement>
  const editorRef = useRef<SCEditorRef>()
  const [callData, setCallData] = useState('')
  const [callValue, setCallValue] = useState('')
  const [unit, setUnit] = useState(ValueUnit.Wei as string)

  const handleWorkerMessage = (event: MessageEvent) => {
    const { code: byteCode, warning, error } = event.data

    if (error) {
      log(error, 'error')
      setIsCompiling(false)
      return
    }

    if (warning) {
      log(warning, 'warn')
    }

    log('Compilation successful')

    try {
      deployContract(byteCode, new BN(callValue)).then((tx) => {
        loadInstructions(byteCode)
        setIsCompiling(false)
        startTransaction(byteCode, tx)
      })
    } catch (error) {
      log((error as Error).message, 'error')
      setIsCompiling(false)
    }
  }

  const log = useCallback(
    (line: string, type = 'info') => {
      output.push({ type, message: line })
      setOutput(output)
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
      if (solcWorkerRef?.current) {
        solcWorkerRef.current.terminate()
      }
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
    if (!codeType) {
      return value
    }

    return codeHighlight(value, codeType)
      .value.split('\n')
      .map((line, i) => `<span class='line-number'>${i + 1}</span>${line}`)
      .join('\n')
  }

  const highlightBytecode = (value: string) => {
    return value
  }

  const highlightMnemonic = (value: string) => {
    if (!codeType) {
      return value
    }

    return value
      .split('\n')
      .map((line, i) => `<span class='line-number'>${i + 1}</span>${line}`)
      .join('\n')
  }

  const handleCodeTypeChange = (option: OnChangeValue<any, any>) => {
    const { value } = option
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

  const handleRun = useCallback(() => {
    if (!isEmpty(callValue) && !/^[0-9]+$/.test(callValue)) {
      log('Callvalue should be a positive integer', 'error')
      return
    }

    if (!isEmpty(callData) && !isFullHex(callData)) {
      log(
        'Calldata should be a hexadecimal string with 2 digits per byte',
        'error',
      )
      return
    }

    const _callData = Buffer.from(callData.substr(2), 'hex')
    const _callValue = new BN(callValue)

    if (unit === ValueUnit.Gwei) {
      _callValue.imul(new BN('1000000000'))
    } else if (unit === ValueUnit.Finney) {
      _callValue.imul(new BN('1000000000000000'))
    } else if (unit === ValueUnit.Ether) {
      _callValue.imul(new BN('1000000000000000000'))
    }

    try {
      if (codeType === CodeType.Mnemonic) {
        const bytecode = getBytecodeFromMnemonic(code, opcodes)
        loadInstructions(bytecode)
        startExecution(bytecode, _callValue, _callData)
      } else if (codeType === CodeType.Bytecode) {
        if (code.length % 2 !== 0) {
          log('There should be at least 2 characters per byte', 'error')
          return
        }
        if (!isHex(code)) {
          log('Only hexadecimal characters are allowed', 'error')
          return
        }
        loadInstructions(code)
        startExecution(code, _callValue, _callData)
      } else {
        setIsCompiling(true)
        log('Starting compilation...')

        if (solcWorkerRef?.current) {
          solcWorkerRef.current.postMessage({
            language: codeType,
            evmVersion: getTargetEvmVersion(selectedFork?.name),
            source: code,
          })
        }
      }
    } catch (error) {
      log((error as Error).message, 'error')
    }
  }, [
    code,
    codeType,
    opcodes,
    selectedFork,
    callData,
    callValue,
    unit,
    loadInstructions,
    log,
    startExecution,
  ])

  const isRunDisabled = useMemo(() => {
    return compiling || isEmpty(code)
  }, [compiling, code])

  const isBytecode = useMemo(() => codeType === CodeType.Bytecode, [codeType])
  const isMnemonic = useMemo(() => codeType === CodeType.Mnemonic, [codeType])
  const isCallDataActive = useMemo(
    () => codeType === CodeType.Mnemonic || codeType === CodeType.Bytecode,
    [codeType],
  )

  const unitValue = useMemo(
    () => ({
      value: unit,
      label: unit,
    }),
    [unit],
  )

  return (
    <div className="bg-gray-100 dark:bg-black-700 rounded-lg">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2">
          <div className="border-b border-gray-200 dark:border-black-500 flex items-center pl-6 pr-2 h-14 md:border-r">
            <Header
              onCodeTypeChange={handleCodeTypeChange}
              codeType={codeType}
            />
          </div>

          <div>
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
                highlight={
                  isBytecode
                    ? highlightBytecode
                    : isMnemonic
                    ? highlightMnemonic
                    : highlightCode
                }
                tabSize={4}
                className={cn('code-editor', {
                  'with-numbers': !isBytecode,
                })}
              />
            </div>

            <div className="flex items-center justify-between px-4 py-2 md:border-r border-gray-200 dark:border-black-500">
              <div className="flex flex-row gap-x-4">
                {isCallDataActive && (
                  <Input
                    placeholder="Calldata in HEX"
                    className="bg-white dark:bg-black-500"
                    value={callData}
                    onChange={(e) => setCallData(e.target.value)}
                  />
                )}

                <Input
                  type="number"
                  step="1"
                  placeholder="Value to send"
                  className="bg-white dark:bg-black-500"
                  value={callValue}
                  onChange={(e) => setCallValue(e.target.value)}
                />

                <Select
                  onChange={(option: OnChangeValue<any, any>) =>
                    setUnit(option.value)
                  }
                  options={unitOptions}
                  value={unitValue}
                  isSearchable={false}
                  classNamePrefix="select"
                  menuPlacement="auto"
                />
              </div>

              <Button
                onClick={handleRun}
                disabled={isRunDisabled}
                size="sm"
                className="ml-3"
              >
                Run
              </Button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="border-t md:border-t-0 border-b border-gray-200 dark:border-black-500 flex items-center pl-4 pr-6 h-14">
            <ExecutionStatus />
          </div>

          <div
            className="pane pane-light overflow-auto bg-gray-50 dark:bg-black-600 h-full"
            ref={instructionsRef}
            style={{ height: instructionsListHeight }}
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
        Solidity Compiler {compilerSemVer}
      </div>
    </div>
  )
}

export default Editor
