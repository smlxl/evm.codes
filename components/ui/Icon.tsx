import React from 'react'

import cn from 'classnames'

type Props = {
  name: string
  className?: string
}

export const Icon: React.FC<Props> = ({ name, className }) => (
  <svg className={cn('inline-block fill-current ri', className)}>
    <use xlinkHref={`#remix_svg__ri-${name}`} />
    <style jsx>{`
      svg {
        width: 16px;
        height: 16px;
      }
    `}</style>
  </svg>
)
