import React from 'react'

import cn from 'classnames'

type Props = {
  children: JSX.Element | string
  href?: string
  external?: boolean
  className?: string
  transparent?: boolean
  padded?: boolean
  size?: 'sm' | 'md'
} & React.ComponentPropsWithoutRef<'button'>

export const Button: React.FC<Props> = ({
  children,
  className,
  href,
  external,
  disabled,
  transparent = false,
  padded = true,
  size = 'md',
  ...rest
}: Props) => {
  const button = (
    <button
      disabled={disabled}
      className={cn(
        {
          'bg-gray-500 text-white rounded': !transparent,
          'cursor-not-allowed opacity-50': disabled,
          'px-4': padded,
          'text-tiny py-2 font-medium': size === 'sm',
          'text-base py-3 font-semibold': size === 'md',
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
