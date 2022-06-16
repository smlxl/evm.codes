import React, { FC, useCallback, useContext, useState } from 'react'

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

  const [selectedMethod, setSelectedMethod] = useState<MethodAbi | undefined>()
  const [methodArgs, setMethodArgs] = useState<string | undefined>()

  const handleRunAbi = useCallback(() => {
    if (!selectedMethod || !deployedContractAddress) {
      return
    }
    loadInstructions(methodBytecode as string)
    const methodRawSignature =
      selectedMethod.name + '(' + selectedMethod.inputs.join(',') + ')'
    log(`run method ${methodRawSignature}`)
    transactionData(
      bufferToHex(abi.simpleEncode(methodRawSignature)).substring(2),
      new BN('0'),
      Address.fromString(deployedContractAddress),
    ).then((txData) => {
      log(`start method ${methodRawSignature} successful!`)
      startTransaction(txData)
    })
  }, [selectedMethod, deployedContractAddress, methodBytecode])

  const _getArgsPlaceHolder = React.useCallback(() => {
    if (!selectedMethod) {
      return 'Please select a method'
    }
    if (selectedMethod.inputs.length > 0) {
      return 'No Args'
    }
    return selectedMethod.inputs.join(',')
  }, [selectedMethod])

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-4 md:py-2 md:border-r border-gray-200 dark:border-black-500">
      <div className="flex flex-col md:flex-row md:gap-x-4 gap-y-2 md:gap-y-0 mb-4 md:mb-0">
        <div className="flex items-center mr-2">
          <Select
            options={abiArray.map((a: any) => ({
              label: a.name,
              value: a.name,
            }))}
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
        <Input
          type="text"
          step="1"
          disabled={(selectedMethod?.inputs.length ?? 0) <= 0}
          placeholder={_getArgsPlaceHolder()}
          className="bg-white dark:bg-black-500"
          value={methodArgs}
          onChange={(e) => setMethodArgs(e.target.value)}
        />
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
