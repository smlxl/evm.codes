import { useContext, useMemo } from 'react'

import Select, { OnChangeValue } from 'react-select'

import { EthereumContext } from 'context/ethereumContext'

import { Icon } from 'components/ui'
import { baseSelectStyles } from 'components/ui/reactSelectStyles'

const ChainSelector = () => {
  const {
    chains,
    forks,
    selectedChain,
    selectedFork,
    onChainChange,
    onForkChange,
  } = useContext(EthereumContext)

  const chainOptions = useMemo(
    () =>
      chains.map((chain) => ({
        value: chain.id.toString(),
        label: chain.name,
      })),
    [chains],
  )

  const defaultChainOption = useMemo(
    () =>
      chainOptions.find(
        (chain) => chain.value === selectedChain?.id.toString(),
      ),

    [chainOptions, selectedChain],
  )

  const forkOptions = useMemo(
    () => forks.map((fork) => ({ value: fork, label: fork })),
    [forks],
  )

  const defaultForkOption = useMemo(
    () => forkOptions.find((fork) => fork.value === selectedFork),
    [forkOptions, selectedFork],
  )

  const handleChainChange = (option: OnChangeValue<any, any>) => {
    onChainChange(parseInt(option.value))
  }

  const handleForkChange = (option: OnChangeValue<any, any>) => {
    onForkChange(option.value)
  }

  return (
    <div className="flex justify-end items-center rounded py-1 px-4">
      {chains.length > 0 && (
        <div className="flex items-center">
          <Icon name="links-line" className="text-gray-400 mr-2" />

          <Select
            onChange={handleChainChange}
            options={chainOptions}
            defaultValue={defaultChainOption}
            className="capitalize mr-4 text-sm font-medium"
            // @ts-ignore: React-select does not have types for all styles
            styles={baseSelectStyles}
          />
        </div>
      )}

      {forks.length > 0 && (
        <div className="flex items-center">
          <Icon name="git-branch-line" className="text-gray-400 mr-2" />

          <Select
            onChange={handleForkChange}
            options={forkOptions}
            defaultValue={defaultForkOption}
            className="capitalize text-sm font-medium"
            // @ts-ignore: React-select does not have types for all styles
            styles={baseSelectStyles}
            menuWidth={160}
          />
        </div>
      )}
    </div>
  )
}

export default ChainSelector
