import { useContext, useMemo } from 'react'

import { useRegisterActions } from 'kbar'

import { EthereumContext } from 'context/ethereumContext'

import { Button, Icon } from 'components/ui'

const ExecutionStatus = () => {
  const { isExecuting, executionState, nextExecution, continueExecution } =
    useContext(EthereumContext)

  const actions = useMemo(
    () => [
      {
        id: 'step',
        name: 'Step',
        shortcut: ['s'],
        keywords: 'execution next',
        section: 'Execution',
        perform: nextExecution,
        subtitle: 'Run next execution',
      },
      {
        id: 'continue',
        name: 'Continue',
        shortcut: ['c'],
        keywords: 'execution continue',
        section: 'Execution',
        perform: continueExecution,
        subtitle: 'Continue execution',
      },
    ],
    [nextExecution, continueExecution],
  )

  useRegisterActions(actions)

  return (
    <div className="flex flex-grow justify-between items-center">
      <dl>
        <dd className="inline-block mr-2 text-gray-400">
          <Icon name="gas-station-fill" />
        </dd>
        <dd className="inline-block mr-1 text-gray-400 text-sm">Current:</dd>
        <dt className="inline-block mr-4">{executionState.currentGas}</dt>
        <dd className="inline-block mr-1 text-gray-400 text-sm">Total:</dd>
        <dt className="inline-block mr-4">{executionState.totalGas}</dt>
      </dl>

      <div>
        <Button
          transparent
          disabled={!isExecuting}
          onClick={nextExecution}
          padded={false}
          className="mr-4"
        >
          <Icon name="arrow-go-forward-line" />
        </Button>

        <Button
          transparent
          disabled={!isExecuting}
          onClick={continueExecution}
          padded={false}
        >
          <Icon name="play-circle-line" />
        </Button>
      </div>
    </div>
  )
}

export default ExecutionStatus
