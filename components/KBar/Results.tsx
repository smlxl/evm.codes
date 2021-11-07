import { useMemo } from 'react'

import { KBarResults, useMatches } from 'kbar'

import ResultItem from './ResultItem'

const NO_GROUP = 'none'

const Results = () => {
  const groups = useMatches()
  const flattened = useMemo(
    () =>
      groups.reduce((acc: any, curr: any) => {
        acc.push(curr.name)
        acc.push(...curr.actions)
        return acc
      }, []),
    [groups],
  )

  return (
    <KBarResults
      items={flattened.filter((i: string) => i !== NO_GROUP)}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <div className="px-4 py-2 text-2xs uppercase text-gray-400 dark:text-gray-600 bg-white dark:bg-black-600">
            {item}
          </div>
        ) : (
          <ResultItem action={item} active={active} />
        )
      }
    />
  )
}

export default Results
