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
            'bg-gray-100 border-black': active,
            'bg-white border-transparent': !active,
          },
        )}
      >
        <div className="flex items-center">
          {action.icon && <span className="mr-4">{action.icon}</span>}
          <div className="flex flex-col">
            <span className="capitalize">{action.name}</span>
            {action.subtitle && (
              <span className="text-xs">{action.subtitle}</span>
            )}
          </div>
        </div>

        {action.shortcut?.length ? (
          <div className="grid gap-1 grid-flow-col">
            {action.shortcut.map((sc) => (
              <kbd key={sc} className="box-border py px-1 bg-gray-200 rounded">
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
