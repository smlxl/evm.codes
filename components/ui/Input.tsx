import React from 'react'

import { Icon } from './Icon'

type Props = {
  searchable?: boolean
} & React.ComponentPropsWithoutRef<'input'>

export const Input: React.FC<Props> = ({ searchable = false, ...rest }) => {
  return (
    <div className="flex items-center h-9 bg-gray-100 dark:bg-black-500 rounded px-3 py-2">
      <input
        className="text-sm outline-none bg-transparent dark:placeholder-black-400"
        {...rest}
      />
      {searchable && (
        <Icon
          name="search-line"
          className="ml-2 text-gray-300 dark:text-black-400"
        />
      )}
    </div>
  )
}
