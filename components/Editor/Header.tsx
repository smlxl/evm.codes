import { useContext, ChangeEvent } from 'react'

import { useRegisterActions } from 'kbar'

import { EthereumContext } from 'context/ethereumContext'

import { Button, Radio, Label } from 'components/ui'

import { CodeType } from './types'

type Props = {
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
  const { selectedFork } = useContext(EthereumContext)

  const actions = [
    {
      id: 'run',
      name: 'Run',
      shortcut: ['r'],
      keywords: 'execution run',
      section: 'Execution',
      perform: onRun,
      subtitle: 'Start execution',
    },
  ]

  useRegisterActions(actions, [onRun])

  return (
    <div className="flex justify-between items-center w-full">
      <h3 className="font-semibold text-md hidden xl:block">
        EVM Playground
        <Label>{selectedFork}</Label>
      </h3>

      <div className="flex items-center justify-between w-full xl:w-auto">
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
        </div>

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
