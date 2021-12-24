import React from 'react'

import cn from 'classnames'

type Props = {
  children: React.ReactNode
  className?: string
}

export const H1: React.FC<Props> = ({ children, className }) => {
  return (
    <h1
      className={cn(
        'text-2xl md:text-4xl font-semibold text-center mx-auto mb-8 md:mb-16',
        className,
      )}
    >
      {children}
    </h1>
  )
}

export const H2: React.FC<Props> = ({ children, className }) => {
  return (
    <h2 className={cn('font-medium text-lg md:text-xl', className)}>
      {children}
    </h2>
  )
}

export const H3: React.FC<Props> = ({ children, className }) => {
  return (
    <h3 className={cn('font-semibold text-2base', className)}>{children}</h3>
  )
}
