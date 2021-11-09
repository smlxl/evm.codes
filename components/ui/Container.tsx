import React from 'react'

import cn from 'classnames'

type Props = {
  children: React.ReactNode
  className?: string
}

export const Container: React.FC<Props> = ({ children, className }) => {
  return (
    <div className={cn('container mx-auto px-4 md:px-6', className)}>
      {children}
    </div>
  )
}
