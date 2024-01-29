import { useContext, useEffect, useMemo, useState, useCallback } from 'react'

import { useRegisterActions, Action } from 'kbar'
import { useRouter } from 'next/router'
import Select, { OnChangeValue, components } from 'react-select'

import { EthereumContext } from 'context/ethereumContext'

import { CURRENT_FORK } from 'util/constants'
import { toKeyIndex } from 'util/string'

import { Icon, Label } from 'components/ui'

interface ForkOption {
  label: string
}

type HandleForkChange = (option: ForkOption) => void

const useBuildForkActions = (
  forkOptions: ForkOption[],
  handleForkChange: HandleForkChange,
) => {
  return useMemo(() => {
    const forkIds = forkOptions.map((option, index) =>
      toKeyIndex('fork', index),
    )

    const forkActions = forkOptions.map((option, index) => ({
      id: toKeyIndex('fork', index),
      name: option.label,
      shortcut: [],
      keywords: option.label,
      section: '',
      perform: () => handleForkChange(option),
      parent: 'fork',
    }))

    return [
      {
        id: 'fork',
        name: 'Select hardfork…',
        shortcut: ['f'],
        keywords: 'fork network evm',
        section: 'Preferences',
        children: forkIds,
      },
      ...forkActions,
    ]
  }, [forkOptions, handleForkChange])
}

const ChainOption = (props: any) => {
  const { data, children } = props
  const isCurrent = data.value === CURRENT_FORK

  return (
    <components.Option {...props}>
      {children}
      {isCurrent && <Label>Live</Label>}
    </components.Option>
  )
}

const ChainSelector = () => {
  const { forks, selectedFork, onForkChange } = useContext(EthereumContext)
  const [forkValue, setForkValue] = useState(null)
  const router = useRouter()

  const forkOptions = useMemo(
    () => forks.map((fork) => ({ value: fork.name, label: fork.name })),
    [forks],
  )

  const handleForkChange = useCallback(
    (option: OnChangeValue<any, any>) => {
      setForkValue(option)
      onForkChange(option.value)

      router.query.fork = option.value
      router.push(router)
    },
    [onForkChange, router],
  )

  const actions = useBuildForkActions(forkOptions, handleForkChange)

  useRegisterActions(actions, [actions])

  return (
    <div className="flex justify-end items-center rounded">
      {forks.length > 0 && (
        <div className="flex items-center mr-2">
          <Icon name="git-branch-line" className="text-indigo-500 mr-2" />
          <Select
            onChange={handleForkChange}
            options={forkOptions}
            value={forkValue}
            isSearchable={false}
            classNamePrefix="select"
            menuPlacement="auto"
            components={{ Option: ChainOption }}
          />
        </div>
      )}
    </div>
  )
}

export default ChainSelector
