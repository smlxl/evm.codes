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
    <div className="flex flex-grow justify-between items-center text-sm">
      <dl>
        <dd className="inline-block ml-1 mr-2 text-gray-400">
          <Icon name="gas-station-fill" className="text-indigo-500" />
        </dd>
        <dd className="inline-block mr-1 text-gray-500 text-sm">Current:</dd>
        <dt className="inline-block mr-4">{executionState.currentGas}</dt>
        <dd className="inline-block mr-1 text-gray-500 text-sm">Total:</dd>
        <dt className="inline-block mr-4">{executionState.totalGas}</dt>
      </dl>

      <div>
        <Button
          transparent
          disabled={!isExecuting}
          onClick={nextExecution}
          padded={false}
          className="mr-4"
          tooltip="Step into"
          tooltipId="step"
        >
          <Icon name="arrow-go-forward-line" className="text-indigo-500" />
        </Button>

        <Button
          transparent
          disabled={!isExecuting}
          onClick={continueExecution}
          padded={false}
          tooltip="Continue execution"
          tooltipId="continue"
        >
          <Icon name="play-circle-line" className="text-indigo-500" />
        </Button>
      </div>
    </div>
  )
}

export default ExecutionStatus
