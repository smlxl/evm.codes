import { useContext } from 'react'

import ReactTooltip from 'react-tooltip'

import { EthereumContext } from 'context/ethereumContext'

import { Icon } from 'components/ui'

const ExecutionStatus = () => {
  const { executionState } = useContext(EthereumContext)

  return (
    <div className="flex flex-grow justify-between items-center text-sm">
      <div>
        <span className="inline-block ml-1 mr-2 text-gray-400">
          <Icon name="gas-station-fill" className="text-indigo-500" />
        </span>
        <span className="inline-block mr-1 text-gray-500 text-sm select-none">
          Total:
        </span>
        <span
          className="inline-block mr-4 select-all cursor-help"
          data-tip="Total gas consumed"
        >
          {executionState.totalGas || 0}
        </span>

        <ReactTooltip className="tooltip" effect="solid" />
      </div>
    </div>
  )
}

export default ExecutionStatus
