import { useContext, useEffect, useMemo, useState, useCallback } from 'react'

import { useRegisterActions, Action } from 'kbar'
import Select, { OnChangeValue } from 'react-select'

import { EthereumContext } from 'context/ethereumContext'
import { SettingsContext, Setting } from 'context/settingsContext'

import { toKeyIndex } from 'util/string'

import { Icon } from 'components/ui'
import { baseSelectStyles } from 'components/ui/reactSelectStyles'

const ChainSelector = () => {
  const { settingsLoaded, getSetting, setSetting } = useContext(SettingsContext)
  const {
    chains,
    forks,
    selectedChain,
    selectedFork,
    onChainChange,
    onForkChange,
  } = useContext(EthereumContext)

  const [chainValue, setChainValue] = useState()
  const [forkValue, setForkValue] = useState()
  const [actions, setActions] = useState<Action[]>([])

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

  const handleChainChange = useCallback(
    (option: OnChangeValue<any, any>) => {
      setChainValue(option)
      onChainChange(parseInt(option.value))
      setSetting(Setting.VmChain, option)
    },
    [onChainChange, setSetting],
  )

  const handleForkChange = useCallback(
    (option: OnChangeValue<any, any>) => {
      setForkValue(option)
      onForkChange(option.value)
      setSetting(Setting.VmFork, option)
    },
    [onForkChange, setSetting],
  )

  useEffect(() => {
    if (defaultChainOption) {
      handleChainChange(getSetting(Setting.VmChain) || defaultChainOption)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoaded, defaultChainOption])

  useEffect(() => {
    if (defaultForkOption) {
      handleForkChange(getSetting(Setting.VmFork) || defaultForkOption)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoaded, defaultForkOption])

  useEffect(() => {
    const chainIds: string[] = []
    const forkIds: string[] = []

    const chainActions = chainOptions.map((option: OnChangeValue<any, any>) => {
      const keyId = toKeyIndex('chain', option.value)
      chainIds.push(keyId)

      return {
        id: keyId,
        name: option.label,
        shortcut: [],
        keywords: option.label,
        section: '',
        perform: () => handleChainChange(option),
        parent: 'chain',
      }
    })

    const forkActions = forkOptions.map(
      (option: OnChangeValue<any, any>, index) => {
        const keyId = toKeyIndex('fork', index)
        forkIds.push(keyId)

        return {
          id: keyId,
          name: option.label,
          shortcut: [],
          keywords: option.label,
          section: '',
          perform: () => handleForkChange(option),
          parent: 'fork',
        }
      },
    )

    if (chainIds.length > 0 && forkIds.length > 0) {
      setActions([
        ...chainActions,
        {
          id: 'chain',
          name: 'Select network…',
          shortcut: ['n'],
          keywords: 'chain network evm',
          section: 'Preferences',
          children: chainIds,
        },
        ...forkActions,
        {
          id: 'fork',
          name: 'Select hardfork…',
          shortcut: ['f'],
          keywords: 'fork network evm',
          section: 'Preferences',
          children: forkIds,
        },
      ])
    }
  }, [chainOptions, forkOptions, handleChainChange, handleForkChange])

  useRegisterActions(actions, [actions])

  return (
    <div className="flex justify-end items-center rounded py-1 px-4">
      {chains.length > 0 && (
        <div className="flex items-center">
          <Icon name="links-line" className="text-gray-400 mr-2" />

          <Select
            onChange={handleChainChange}
            options={chainOptions}
            value={chainValue}
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
            value={forkValue}
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
