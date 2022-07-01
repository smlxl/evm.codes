import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { VmError } from '@ethereumjs/vm/dist/exceptions'
import abi from 'ethereumjs-abi'
import { Address, BN, bufferToHex } from 'ethereumjs-util'
import Select, { OnChangeValue } from 'react-select'

import { EthereumContext } from '../../context/ethereumContext'
import { Button, Input } from '../ui'

import { Contract, MethodAbi, ValueUnit } from './types'

interface Props {
  show: boolean
  log: (line: string, type?: string) => void
  setShowSimpleMode: () => void
  handleCompile: () => void
  deployByteCode: (
    byteCode: string,
    args: string,
    callValue: BN | undefined,
  ) =>
    | Promise<{
        error?: VmError | undefined
        returnValue: Buffer
        createdAddress: Address | undefined
      }>
    | undefined
  selectedContract: Contract | undefined
  callValue: string | undefined
  setCallValue: (v: string) => void
  unitValue: string | undefined
  setUnit: (v: string) => void
  getCallValue: () => BN
  methodByteCode: string | undefined
}

interface MethodAbiOption extends MethodAbi {
  label: string
  value: string
  isDisabled?: boolean
}

const FIXED_ABIS: Array<MethodAbiOption> = [
  {
    inputs: [],
    inputTypes: '',
    name: 'Compile',
    label: 'Compile',
    value: 'Compile',
    type: 'compiler',
    outputs: [],
    stateMutability: 'payable',
  },
]

const unitOptions = Object.keys(ValueUnit).map((value) => ({
  value,
  label: value,
}))

const SolidityAdvanceModeTab: FC<Props> = ({
  log,
  setShowSimpleMode,
  show,
  deployByteCode,
  selectedContract,
  callValue,
  unitValue,
  setCallValue,
  setUnit,
  getCallValue,
  handleCompile,
  methodByteCode,
}) => {
  const {
    transactionData,
    loadInstructions,
    startTransaction,
    deployedContractAddress,
  } = useContext(EthereumContext)
  const container = useRef<any>()

  const [selectedMethod, setSelectedMethod] = useState<
    MethodAbiOption | undefined
  >()

  const [methodArgs, setMethodArgs] = useState<string>('')

  const methodArgsArray = useMemo(() => {
    if (!methodArgs) {
      return []
    }
    return methodArgs.split(',').filter((s) => s.length > 0)
  }, [methodArgs])

  const abiArray = useMemo(() => {
    return (selectedContract?.abi || []).map((method) => ({
      ...method,
      inputTypes: method.inputs?.map((i) => i.type).join(',') || '',
    }))
  }, [selectedContract])

  const handleDeployApi = useCallback(() => {
    if (!selectedContract || !selectedMethod) {
      return
    }
    let args = ''
    if (selectedMethod.inputs && selectedMethod.inputs.length > 0) {
      if (methodArgsArray.length <= 0) {
        log('Please input args', 'error')
        return
      }
      const abiBuffer = abi.rawEncode(
        selectedMethod.inputs.map((mi) => mi.type),
        methodArgsArray,
      )
      args = bufferToHex(abiBuffer).substring(2)
    }
    deployByteCode(selectedContract.code, args, undefined)
  }, [selectedContract, selectedMethod, deployByteCode, methodArgsArray, log])

  const handleRunAbi = useCallback(() => {
    if (!deployedContractAddress || !methodByteCode) {
      log('Please deploy first', 'error')
      return
    }
    if (!selectedMethod) {
      log('Please select a method', 'error')
      return
    }
    loadInstructions((methodByteCode as string).substring(2))
    const methodRawSignature =
      selectedMethod.name + '(' + selectedMethod.inputTypes + ')'

    log(`run method ${methodRawSignature} with ${methodArgsArray}`)

    const byteCodeBuffer =
      methodArgsArray.length > 0
        ? abi.simpleEncode(methodRawSignature, ...methodArgsArray)
        : abi.simpleEncode(methodRawSignature)

    transactionData(
      bufferToHex(byteCodeBuffer).substring(2),
      getCallValue(),
      Address.fromString(deployedContractAddress),
    ).then((txData) => {
      startTransaction(txData).then((result) => {
        if (
          !result.error &&
          selectedMethod.outputs &&
          selectedMethod.outputs.length > 0
        ) {
          log(
            `run method complete, the response is ${abi.rawDecode(
              selectedMethod.outputs.map((mi) => mi.type),
              result.returnValue,
            )}`,
          )
        } else if (!result.error) {
          log(`run method complete.`)
        } else {
          log(`run method failed, ${result.error}`)
        }
      })
    })
  }, [
    selectedMethod,
    deployedContractAddress,
    loadInstructions,
    methodByteCode,
    log,
    methodArgsArray,
    transactionData,
    getCallValue,
    startTransaction,
  ])

  const clickButtonText = useMemo(() => {
    if (selectedMethod?.type === 'compiler') {
      return `Compile`
    }
    if (selectedMethod?.type === 'constructor') {
      return `Deploy`
    } else {
      return `Run Method`
    }
  }, [selectedMethod])

  const handleRunClick = useCallback(() => {
    if (selectedMethod?.type === 'compiler') {
      handleCompile()
    } else if (selectedMethod?.type === 'constructor') {
      handleDeployApi()
    } else {
      handleRunAbi()
    }
  }, [selectedMethod, handleDeployApi, handleRunAbi, handleCompile])

  const methodOptions = useMemo(() => {
    const result = [...FIXED_ABIS]
    if (!abiArray) {
      return result
    }
    return [
      ...result,
      ...abiArray.map((am) => {
        const name = am.type === 'constructor' ? 'constructor' : am.name
        return {
          ...am,
          label: name + '(' + am.inputTypes + ')',
          value: name,
          isDisabled:
            am.type === 'function' &&
            (!deployedContractAddress ||
              !methodByteCode ||
              methodByteCode.trim() === ''),
        }
      }),
    ]
  }, [abiArray, methodByteCode, deployedContractAddress])

  // select constructor when contract had been changed.
  useEffect(() => {
    const constructor = methodOptions.find(
      (abiMethod) => abiMethod.type === 'constructor',
    )
    const compiler = methodOptions.find(
      (abiMethod) => abiMethod.type === 'compiler',
    )

    if (constructor) {
      setSelectedMethod(constructor)
    } else {
      setSelectedMethod(compiler)
    }
  }, [methodOptions, setSelectedMethod])

  // clear args and call value when select method had been changed.
  useEffect(() => {
    setMethodArgs('')
    setCallValue('')
  }, [selectedMethod, setCallValue])

  return (
    <div
      className={show ? 'overflow-auto' : 'hidden'}
      style={{ height: 156 }}
      ref={container}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-4 md:py-2 md:border-r border-gray-200 dark:border-black-500">
        <div className="flex flex-col md:flex-row md:gap-x-4 gap-y-2 md:gap-y-0 mb-4 md:mb-0">
          <Select
            options={methodOptions}
            onChange={(v: OnChangeValue<any, any>) => {
              setSelectedMethod(v)
            }}
            menuPortalTarget={container.current?.parentElement}
            value={selectedMethod}
            isSearchable={false}
            placeholder="Select Method"
            classNamePrefix="select"
            menuPlacement="auto"
          />
        </div>

        <div>
          <Button transparent padded={false} onClick={setShowSimpleMode}>
            <span className="inline-block mr-4 text-blue-500">Simple Mode</span>
          </Button>
          <Button
            size="sm"
            contentClassName="justify-center"
            onClick={handleRunClick}
          >
            {clickButtonText}
          </Button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-4 md:py-2 md:border-r border-gray-200 dark:border-black-500">
        <div className="flex flex-col md:flex-row md:items-center md:gap-x-4 gap-y-2 md:gap-y-0 mb-4 md:mb-0">
          <div className="font-normal text-sm">Value:</div>
          <Input
            type="number"
            disabled={selectedMethod?.stateMutability !== 'payable'}
            value={callValue}
            onChange={(e) => setCallValue(e.target.value)}
            placeholder={
              selectedMethod?.stateMutability !== 'payable'
                ? 'Non payable method.'
                : 'Value To Send'
            }
            className="bg-white dark:bg-black-500"
          />
          <Select
            isDisabled={selectedMethod?.stateMutability !== 'payable'}
            onChange={(option: OnChangeValue<any, any>) =>
              setUnit(option.value)
            }
            options={unitOptions}
            value={{ label: unitValue, value: unitValue }}
            isSearchable={false}
            classNamePrefix="select"
            menuPlacement="auto"
            menuPortalTarget={container?.current?.parentElement}
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:gap-x-4 gap-y-2 md:gap-y-0 mb-4 md:mb-0 px-4 py-2">
        <div className={'font-normal text-sm'}>Argument: </div>
        <Input
          placeholder="Use the , to split more arguments."
          className="bg-white dark:bg-black-500"
          value={methodArgs}
          onChange={(e) => {
            setMethodArgs(e.target.value)
          }}
        />
      </div>
    </div>
  )
}

export default SolidityAdvanceModeTab
