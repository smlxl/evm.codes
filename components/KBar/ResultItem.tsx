import { forwardRef } from 'react'

import cn from 'classnames'
import { Action } from 'kbar'

type Props = {
  action: Action
  active: boolean
}

const ResultItem = forwardRef(
  ({ action, active }: Props, ref: React.Ref<HTMLDivElement>) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between cursor-pointer py-3 px-4 border-l-2',
          {
            'bg-gray-50 dark:bg-black-500 border-indigo-500': active,
            'bg-white dark:bg-black-600 border-transparent': !active,
          },
        )}
      >
        <div className="flex items-center">
          {action.icon && <span className="mr-4">{action.icon}</span>}
          <div className="flex flex-col">
            <span className="capitalize text-gray-900 dark:text-gray-200">
              {action.name}
            </span>
            {action.subtitle && (
              <span className="text-xs text-gray-600">{action.subtitle}</span>
            )}
          </div>
        </div>

        {action.shortcut?.length ? (
          <div className="grid gap-1 grid-flow-col">
            {action.shortcut.map((sc) => (
              <kbd
                key={sc}
                className="box-border py px-1 bg-gray-100 dark:bg-black-400 text-indigo-500 rounded"
              >
                {sc}
              </kbd>
            ))}
          </div>
        ) : null}
      </div>
    )
  },
)

export default ResultItem
