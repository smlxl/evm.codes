import React, { useMemo } from 'react'

import cn from 'classnames'

import { Icon } from './Icon'

type Props = {
  type: 'success' | 'warning' | 'error'
  text: string
}

export const Message: React.FC<Props> = ({ type, text }) => {
  const bgColor = useMemo(() => {
    if (type === 'success') return 'bg-green-400'
    if (type === 'warning') return 'bg-yellow-400'
    if (type === 'error') return 'bg-red-400'
  }, [type])

  const iconName = useMemo(() => {
    return type === 'success' ? 'checkbox-circle-line' : 'error-warning-line'
  }, [type])

  return (
    <div
      className={cn(
        'flex items-center rounded text-white text-xs px-3 py-1',
        bgColor,
      )}
    >
      <Icon name={iconName} className="mr-1" />
      {text}
    </div>
  )
}
