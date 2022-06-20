import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import abi from 'ethereumjs-abi'
import { Address, BN, bufferToHex } from 'ethereumjs-util'
import Select, { OnChangeValue } from 'react-select'

import { EthereumContext } from '../../context/ethereumContext'
import { Button, Input } from '../ui'

import { MethodAbi, ValueUnit } from './types'

interface Props {
  show: boolean
  abiArray: Array<MethodAbi>
  log: (line: string, type?: string) => void
  methodByteCode: string | null
  setShowSimpleMode: () => void
  deployByteCode: (args: string, callValue: BN) => void
}

interface MethodAbiOption extends MethodAbi {
  label: string
  value: string
  isDisabled?: boolean
}

const unitOptions = Object.keys(ValueUnit).map((value) => ({
  value,
  label: value,
}))

const SolidityAdvanceModeTab: FC<Props> = ({
  abiArray,
  log,
  methodByteCode,
  setShowSimpleMode,
  show,
  deployByteCode,
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

  const [methodArgs, setMethodArgs] = useState<Array<string>>([])
  const [callValue, setCallValue] = useState<string>('')
  const [unit, setUnit] = useState(ValueUnit.Wei as string)

  const getCallValue = useCallback(() => {
    const _callValue = new BN(callValue)

    if (unit === ValueUnit.Gwei) {
      _callValue.imul(new BN('1000000000'))
    } else if (unit === ValueUnit.Finney) {
      _callValue.imul(new BN('1000000000000000'))
    } else if (unit === ValueUnit.Ether) {
      _callValue.imul(new BN('1000000000000000000'))
    }

    return _callValue
  }, [callValue, unit])

  const isConstructor = useMemo(
    () => selectedMethod?.type === 'constructor',
    [selectedMethod],
  )

  const handleDeployApi = useCallback(() => {
    if (!selectedMethod) {
      return
    }
    const args =
      selectedMethod.inputs && selectedMethod.inputs.length > 0
        ? bufferToHex(
            abi.rawEncode(
              selectedMethod.inputs.map((mi) => mi.type),
              methodArgs,
            ),
          ).substring(2)
        : ''
    const callValue = getCallValue()
    deployByteCode(args, callValue)
  }, [selectedMethod, methodArgs, callValue, deployByteCode])

  const handleRunAbi = useCallback(() => {
    if (!selectedMethod || !deployedContractAddress) {
      return
    }
    loadInstructions((methodByteCode as string).substring(2))
    const methodRawSignature =
      selectedMethod.name + '(' + selectedMethod.inputTypes + ')'

    log(`run method ${methodRawSignature} with ${methodArgs}`)

    const byteCodeBuffer =
      methodArgs.length > 0
        ? abi.simpleEncode(methodRawSignature, ...methodArgs)
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
    methodByteCode,
    callValue,
    loadInstructions,
    methodArgs,
    startTransaction,
    transactionData,
  ])

  const methodOptions = useMemo(() => {
    if (!abiArray) {
      return []
    }
    return abiArray.map((am) => {
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
    })
  }, [abiArray, methodByteCode, deployedContractAddress])

  useEffect(() => {
    if (methodOptions) {
      setSelectedMethod(
        methodOptions.find((abiMethod) => abiMethod.type === 'constructor'),
      )
    }
  }, [methodOptions, setSelectedMethod])

  useEffect(() => {
    const inputs = selectedMethod?.inputs || []
    setMethodArgs(inputs.map(() => ''))
    setCallValue('')
  }, [methodOptions, selectedMethod])

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
            onClick={isConstructor ? handleDeployApi : handleRunAbi}
          >
            {isConstructor ? 'Deploy' : 'Run Contract Method'}
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
            value={{ label: unit, value: unit }}
            isSearchable={false}
            classNamePrefix="select"
            menuPlacement="auto"
            menuPortalTarget={container?.current?.parentElement}
          />
        </div>
      </div>
      {!selectedMethod ||
        !selectedMethod?.inputs ||
        (selectedMethod.inputs.length === 0 && (
          <div className="flex flex-col md:flex-row md:items-center md:gap-x-4 gap-y-2 md:gap-y-0 mb-4 md:mb-0 px-4 py-2">
            <div className={'font-normal text-sm'}>Argument: </div>
            <Input
              disabled
              placeholder="Don't need Argument"
              className="bg-white dark:bg-black-500"
            />
          </div>
        ))}
      {selectedMethod?.inputs.map((mi, i) => (
        <div
          key={mi.name}
          className="flex flex-col md:flex-row md:items-center md:gap-x-4 gap-y-2 md:gap-y-0 mb-4 md:mb-0 px-4 py-2"
        >
          <div className="font-normal text-sm">{mi.name}:</div>
          <Input
            placeholder={mi.type}
            value={methodArgs[i] ?? ''}
            onChange={(e) => {
              const newArgs = [...methodArgs]
              newArgs[i] = e.target.value
              setMethodArgs(newArgs)
            }}
            className="bg-white dark:bg-black-500"
          />
        </div>
      ))}
    </div>
  )
}

export default SolidityAdvanceModeTab
