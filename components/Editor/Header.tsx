import { useContext, ChangeEvent } from 'react'

import { EthereumContext } from 'context/ethereumContext'

import { Button, Radio } from 'components/ui'

import { CodeType, StatusMessage } from './types'

type Props = {
  status?: StatusMessage
  isBytecode: boolean
  isRunDisabled: boolean
  onCodeTypeChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRun: () => void
}

const EditorHeader = ({
  isBytecode,
  onCodeTypeChange,
  onRun,
  isRunDisabled,
}: Props) => {
  const { selectedChain, selectedFork } = useContext(EthereumContext)

  return (
    <div className="flex justify-between items-center">
      <h3 className="font-semibold text-md">
        Running on {selectedChain?.name}{' '}
        <span className="capitalize text-sm text-gray-700 font-medium px-1">
          {selectedFork}
        </span>
      </h3>

      <div>
        <Radio
          text="Solidity"
          value={CodeType.Solidity.toString()}
          isChecked={!isBytecode}
          onChange={onCodeTypeChange}
        />

        <Radio
          text="Bytecode"
          value={CodeType.Bytecode.toString()}
          isChecked={isBytecode}
          onChange={onCodeTypeChange}
        />

        <Button
          onClick={onRun}
          disabled={isRunDisabled}
          size="sm"
          className="ml-3"
        >
          Run
        </Button>
      </div>
    </div>
  )
}

export default EditorHeader
