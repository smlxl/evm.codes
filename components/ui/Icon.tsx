import React from 'react'

import cn from 'classnames'

type Props = {
  name: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 14,
  md: 16,
  lg: 24,
}

export const Icon: React.FC<Props> = ({ name, className, size = 'md' }) => {
  return (
    <svg
      className={cn('inline-block fill-current ri', className)}
      style={{ width: sizes[size], height: sizes[size] }}
    >
      <use xlinkHref={`#remix_svg__ri-${name}`} />
    </svg>
  )
}
