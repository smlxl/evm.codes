import { ChangeEvent } from 'react'

import { Button, Message } from 'components/ui'

import { CodeType, StatusMessage } from './types'

type Props = {
  status?: StatusMessage
  isBytecode: boolean
  isRunDisabled: boolean
  onCodeTypeChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRun: () => void
}

const EditorHeader = ({
  status,
  isBytecode,
  onCodeTypeChange,
  onRun,
  isRunDisabled,
}: Props) => {
  return (
    <div className="flex justify-between items-center">
      {
        // FIXME: Add title based on the selected network & fork
      }
      <h3 className="font-semibold text-md">Running on Mainnet London</h3>

      {status && <Message type={status.type} text={status.message} />}

      <div>
        {
          // FIXME: Move to UI components
        }
        <label className="mr-3">
          <input
            type="radio"
            value={CodeType.Solidity}
            checked={!isBytecode}
            onChange={onCodeTypeChange}
            className="mr-1"
          />
          Solidity
        </label>

        <label className="mr-3">
          <input
            type="radio"
            value={CodeType.Bytecode}
            checked={isBytecode}
            onChange={onCodeTypeChange}
            className="mr-1"
          />
          Bytecode
        </label>

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
