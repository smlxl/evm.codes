import React, { useState } from 'react'

import cn from 'classnames'

import { Icon } from './Icon'

type Props = {
  searchable?: boolean
  className?: string
} & React.ComponentPropsWithoutRef<'input'>

export const Input: React.FC<Props> = ({
  searchable = false,
  onFocus,
  onBlur,
  className,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = (e: any) => {
    setIsFocused(true)
    if (onFocus) {
      onFocus(e)
    }
  }

  const handleBlur = (e: any) => {
    setIsFocused(false)
    if (onBlur && e) {
      onBlur(e)
    }
  }

  return (
    <div
      className={cn(
        'flex items-center rounded px-3 py-2',
        {
          shadow: isFocused,
        },
        className,
      )}
    >
      <input
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-full outline-none bg-transparent dark:placeholder-black-400 text-sm"
        {...rest}
      />
      {searchable && (
        <Icon
          name="search-line"
          className={cn(
            'ml-2',
            isFocused
              ? 'text-gray-400 dark:text-gray-300'
              : 'text-gray-300 dark:text-gray-400',
          )}
        />
      )}
    </div>
  )
}
