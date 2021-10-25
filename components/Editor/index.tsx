import {
  ChangeEvent,
  useState,
  useRef,
  useEffect,
  useContext,
  useMemo,
  useCallback,
  MutableRefObject,
} from 'react'

import cn from 'classnames'
import SCEditor from 'react-simple-code-editor'

import { EthereumContext } from 'context/ethereumContext'

import { exampleContract } from 'util/contracts'
import { codeHighlight, isEmpty, isHex } from 'util/string'

import InstructionList from 'components/Editor/Instructions'

import Console from './Console'
import ExecutionStatus from './ExecutionStatus'
import Header from './Header'
import { StatusMessage } from './types'

type Props = {
  readOnly?: boolean
}

enum CodeType {
  Solidity,
  Bytecode,
}

const editorHeight = 400
const consoleHeight = 200

const Editor = ({ readOnly = false }: Props) => {
  const {
    deployContract,
    loadInstructions,
    startExecution,
    deployedContractAddress,
  } = useContext(EthereumContext)

  const [code, setCode] = useState(exampleContract)
  const [compiling, setIsCompiling] = useState(false)
  const [codeType, setCodeType] = useState(CodeType.Solidity)
  const [output, setOutput] = useState(['Loading Solidity compiler...'])
  const [status, setStatus] = useState<StatusMessage | undefined>(undefined)

  const solcWorkerRef = useRef<null | Worker>(null)
  const instructionsRef = useRef() as MutableRefObject<HTMLDivElement>

  const handleWorkerMessage = (event: MessageEvent) => {
    const { code: byteCode, error } = event.data

    if (error) {
      setStatus({ type: 'error', message: error })
      return
    }

    deployContract(byteCode).then((tx) => {
      loadInstructions(byteCode)
      setIsCompiling(false)
      startExecution(byteCode, tx)
    })
  }

  const log = useCallback(
    (line: string) => {
      setOutput([...output, line])
    },
    [output, setOutput],
  )

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
        setStatus({
          type: 'warning',
          message: 'There should be at least 2 characters per byte.',
        })
        return
      }
      if (!isHex(code)) {
        setStatus({
          type: 'warning',
          message: 'Only hexadecimal characters are allowed.',
        })
        return
      }
      loadInstructions(code)
      startExecution(code)
    }
  }, [code, codeType, loadInstructions, log, startExecution])

  const handleCodeTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCodeType(parseInt(event.target.value) as CodeType)
  }

  const isRunDisabled = useMemo(() => {
    return compiling || isEmpty(code)
  }, [compiling, code])

  const isBytecode = useMemo(() => codeType === CodeType.Bytecode, [codeType])

  return (
    <div className="bg-gray-200 rounded-lg">
      <div className="flex">
        <div className="w-2/3">
          <div className="flex flex-col">
            <div className="border-r border-gray-300 px-6 h-8 my-3">
              <Header
                status={status}
                isBytecode={isBytecode}
                isRunDisabled={isRunDisabled}
                onCodeTypeChange={handleCodeTypeChange}
                onRun={handleRun}
              />
            </div>

            <div
              className="pane pane-light overflow-auto border-r bg-gray-100 border-gray-200"
              style={{ height: editorHeight }}
            >
              <SCEditor
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

            <div
              className="pane pane-dark overflow-auto bg-gray-700 text-white border-r border-gray-800 border-opacity-25"
              style={{ height: consoleHeight }}
            >
              <Console output={output} />
            </div>
          </div>
        </div>

        <div className="w-1/3">
          <div className="flex flex-col">
            <div className="flex items-center w-full pl-4 pr-6 my-3 h-8">
              <ExecutionStatus />
            </div>

            <div
              className="pane pane-light overflow-auto py-3 bg-gray-100"
              style={{ height: editorHeight }}
              ref={instructionsRef}
            >
              <InstructionList containerRef={instructionsRef} />
            </div>

            <div
              className="pane pane-dark overflow-auto bg-gray-700 text-white px-4 py-3"
              style={{ height: consoleHeight }}
            >
              EVM state info
            </div>
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
