import { useContext, useMemo } from 'react'

import { useRegisterActions } from 'kbar'
import Select, { OnChangeValue } from 'react-select'

import { EthereumContext } from 'context/ethereumContext'

import { Button, Label } from 'components/ui'

import { CodeType } from './types'

type Props = {
  codeType: string | undefined
  isRunDisabled: boolean
  onCodeTypeChange: (option: OnChangeValue<any, any>) => void
  onRun: () => void
}

const codeLangOptions = Object.keys(CodeType).map((lang) => ({
  value: lang,
  label: lang,
}))

const EditorHeader = ({
  codeType,
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

  const codeTypeOption = useMemo(
    () => ({
      value: codeType,
      label: codeType,
    }),
    [codeType],
  )

  useRegisterActions(actions, [onRun])

  return (
    <div className="flex justify-between items-center w-full">
      <h3 className="font-semibold text-md hidden xl:block">
        EVM Playground
        <Label>{selectedFork?.name}</Label>
      </h3>

      <div className="flex items-center justify-between w-full xl:w-auto">
        <Select
          onChange={onCodeTypeChange}
          options={codeLangOptions}
          value={codeTypeOption}
          isSearchable={false}
          classNamePrefix="select"
          menuPlacement="auto"
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
