import React from 'react'

import cn from 'classnames'

type Props = {
  children: React.ReactNode | string
  href?: string
  external?: boolean
  className?: string
  transparent?: boolean
  outline?: boolean
  padded?: boolean
  size?: 'xs' | 'sm' | 'md'
} & React.ComponentPropsWithoutRef<'button'>

export const Button: React.FC<Props> = ({
  children,
  className,
  href,
  external,
  disabled,
  transparent = false,
  padded = true,
  outline = false,
  size = 'md',
  ...rest
}: Props) => {
  const button = (
    <button
      disabled={disabled}
      className={cn(
        'rounded outline-none inline-block',
        {
          'bg-gray-500 text-white': !transparent,
          'cursor-not-allowed opacity-50': disabled,
          'px-4': padded,
          'text-tiny py-2 font-medium': size === 'sm',
          'text-base py-3 font-semibold': size === 'md',
          'text-xs py-1': size === 'xs',
          'border border-gray-200': outline,
        },
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )

  if (href) {
    return (
      <a href={href} target={external ? '_blank' : '_self'} rel="noreferrer">
        {button}
      </a>
    )
  }

  return button
}
