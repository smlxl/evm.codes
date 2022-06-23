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
  contracts: Array<Contract>
  callValue: string | undefined
  setCallValue: (v: string) => void
  unitValue: string | undefined
  setUnit: (v: string) => void
  getCallValue: () => BN
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
  log,
  setShowSimpleMode,
  show,
  deployByteCode,
  contracts,
  callValue,
  unitValue,
  setCallValue,
  setUnit,
  getCallValue,
}) => {
  const { transactionData, loadInstructions, startTransaction } =
    useContext(EthereumContext)
  const container = useRef<any>()

  const [selectedContract, setSelectedContract] = useState<
    Contract | undefined
  >()
  const [selectedMethod, setSelectedMethod] = useState<
    MethodAbiOption | undefined
  >()

  const [contractsAddress, setContractsAddress] = useState<
    Record<string, Address | undefined>
  >({})

  const [methodByteCode, setMethodByteCode] = useState<string | undefined>()
  const [methodArgs, setMethodArgs] = useState<Array<string>>([])

  const abiArray = useMemo(() => {
    return (selectedContract?.abi || []).map((method) => ({
      ...method,
      inputTypes: method.inputs?.map((i) => i.type).join(',') || '',
    }))
  }, [selectedContract])

  const isConstructor = useMemo(
    () => selectedMethod?.type === 'constructor',
    [selectedMethod],
  )

  const deployedContractAddress = useMemo(() => {
    return contractsAddress[selectedContract?.name || '']
  }, [selectedContract, contractsAddress])

  const handleDeployApi = useCallback(() => {
    if (!selectedContract || !selectedMethod) {
      return
    }
    let args = ''
    if (selectedMethod.inputs && selectedMethod.inputs.length > 0) {
      const abiBuffer = abi.rawEncode(
        selectedMethod.inputs.map((mi) => mi.type),
        methodArgs,
      )
      args = bufferToHex(abiBuffer).substring(2)
    }
    const contractName = selectedContract.name
    deployByteCode(selectedContract.code, args, undefined)?.then((result) => {
      if (!result.error) {
        setContractsAddress({
          ...contractsAddress,
          [contractName]: result.createdAddress,
        })
        setMethodByteCode(bufferToHex(result.returnValue))
      }
    })
  }, [
    selectedContract,
    selectedMethod,
    deployByteCode,
    methodArgs,
    contractsAddress,
    setContractsAddress,
  ])

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
      deployedContractAddress,
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
    deployedContractAddress,
    selectedMethod,
    loadInstructions,
    methodByteCode,
    log,
    methodArgs,
    transactionData,
    getCallValue,
    startTransaction,
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
          (!contractsAddress[selectedContract?.name || ''] ||
            !methodByteCode ||
            methodByteCode.trim() === ''),
      }
    })
  }, [abiArray, methodByteCode, contractsAddress, selectedContract])

  // auto select first contract.
  useEffect(() => {
    setContractsAddress({})
    if (!contracts || contracts.length !== 1) {
      setSelectedContract(undefined)
      return
    }
    setSelectedContract(contracts[0])

    // if current not show, need to deploy the first contract.
    const constructorArgs =
      contracts[0]?.abi?.find((am) => am.type === 'constructor')?.inputs || []

    // if constructor has more args, then log error.
    if (constructorArgs.length > 0) {
      log(
        'The constructor of the contract need arguments. ' +
          'Please switch to advance mode to put arguments',
        'error',
      )
      return
    }

    // if constructor has no argument, then deploy it.
    deployByteCode(contracts[0].code, '', undefined)
  }, [contracts, deployByteCode, log, setSelectedContract])

  // select constructor when contract had been changed.
  useEffect(() => {
    if (methodOptions) {
      setSelectedMethod(
        methodOptions.find((abiMethod) => abiMethod.type === 'constructor'),
      )
    }
  }, [methodOptions, setSelectedMethod])

  // clear args and call value when select method had been changed.
  useEffect(() => {
    const inputs = selectedMethod?.inputs || []
    setMethodArgs(inputs.map(() => ''))
    setCallValue('')
  }, [methodOptions, selectedMethod, setCallValue])

  return (
    <div
      className={show ? 'overflow-auto' : 'hidden'}
      style={{ height: 156 }}
      ref={container}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-4 md:py-2 md:border-r border-gray-200 dark:border-black-500">
        <div className="flex flex-col md:flex-row md:gap-x-4 gap-y-2 md:gap-y-0 mb-4 md:mb-0">
          <Select
            options={contracts}
            onChange={(v: OnChangeValue<any, any>) => {
              setSelectedContract(v)
            }}
            menuPortalTarget={container.current?.parentElement}
            value={selectedContract}
            isSearchable={false}
            placeholder="Select Contract"
            classNamePrefix="select"
            menuPlacement="auto"
            getOptionLabel={(c) => c.name}
          />
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
            value={{ label: unitValue, value: unitValue }}
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
