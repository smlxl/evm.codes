import React, { FC, useCallback, useContext, useEffect, useState } from 'react'

import abi from 'ethereumjs-abi'
import { Address, BN, bufferToHex } from 'ethereumjs-util'
import Select, { OnChangeValue } from 'react-select'

import { EthereumContext } from '../../context/ethereumContext'
import { Button, Input } from '../ui'

import { MethodAbi } from './types'

interface Props {
  abiArray: Array<MethodAbi>
  log: (line: string, type?: string) => void
  methodBytecode: string | null
}

const SolidityMethodSelector: FC<Props> = ({
  abiArray,
  log,
  methodBytecode,
}) => {
  const {
    transactionData,
    loadInstructions,
    startTransaction,
    deployedContractAddress,
  } = useContext(EthereumContext)

  const [methodOptions, setMethodOptions] = useState<
    Array<{ label: string; value: string }>
  >([])

  const [selectedMethod, setSelectedMethod] = useState<MethodAbi | undefined>()
  const [methodArgs, setMethodArgs] = useState<string>('')
  const [callValue, setCallValue] = useState<string>('')

  const handleRunAbi = useCallback(() => {
    if (!selectedMethod || !deployedContractAddress) {
      return
    }
    loadInstructions((methodBytecode as string).substring(2))
    const methodRawSignature =
      selectedMethod.name + '(' + selectedMethod.inputTypes + ')'
    log(`run method ${methodRawSignature} with ${methodArgs}`)
    const as = methodArgs.trim() !== '' ? methodArgs?.split(',') : []

    const byteCodeBuffer =
      as.length > 0
        ? abi.simpleEncode(methodRawSignature, ...as)
        : abi.simpleEncode(methodRawSignature)

    transactionData(
      bufferToHex(byteCodeBuffer).substring(2),
      new BN(callValue),
      Address.fromString(deployedContractAddress),
    ).then((txData) => {
      startTransaction(txData).then((buffer) => {
        if (selectedMethod.outputs && selectedMethod.outputs.length > 0) {
          log(
            `run method complete, the response is ${abi.rawDecode(
              selectedMethod.outputs.map((mi) => mi.type),
              buffer,
            )}`,
          )
        }
      })
    })
  }, [selectedMethod, deployedContractAddress, methodBytecode])

  const argsPlaceHolder = React.useMemo(() => {
    if (!selectedMethod) {
      return 'Please select a method'
    }
    if (selectedMethod.inputs.length === 0) {
      return 'No Args'
    }
    return selectedMethod.inputTypes
  }, [selectedMethod])

  useEffect(() => {
    setMethodOptions(
      abiArray
        .filter((abi) => abi.type === 'function')
        .map((abi) => ({
          label: abi.name,
          value: abi.name,
        })),
    )
  }, [abiArray])

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-4 md:py-2 md:border-r border-gray-200 dark:border-black-500">
      <div className="flex flex-col md:flex-row md:gap-x-4 gap-y-2 md:gap-y-0 mb-4 md:mb-0">
        <div className="flex items-center mr-2">
          <Select
            options={methodOptions}
            onChange={(v: OnChangeValue<any, any>) => {
              const methodAbi = abiArray.find((k) => k.name === v.value)
              setSelectedMethod(methodAbi)
            }}
            isSearchable={false}
            placeholder="Select Method"
            classNamePrefix="select"
            menuPlacement="auto"
          />
        </div>
        {(selectedMethod?.inputs.length ?? 0) > 0 && (
          <Input
            type="text"
            placeholder={argsPlaceHolder}
            className="bg-white dark:bg-black-500"
            value={methodArgs}
            onChange={(e) => setMethodArgs(e.target.value)}
          />
        )}
        {selectedMethod?.stateMutability === 'payable' && (
          <Input
            type="number"
            step="1"
            placeholder={'Value: Wei'}
            className="bg-white dark:bg-black-500"
            value={callValue}
            onChange={(e) => setCallValue(e.target.value)}
          />
        )}
      </div>

      <Button
        onClick={handleRunAbi}
        disabled={!selectedMethod}
        size="sm"
        contentClassName="justify-center"
      >
        Run Method
      </Button>
    </div>
  )
}

export default SolidityMethodSelector
