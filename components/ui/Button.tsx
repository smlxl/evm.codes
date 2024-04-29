import React from 'react'

import cn from 'classnames'
import { Tooltip } from 'react-tooltip'

type Props = {
  children: React.ReactNode | string
  href?: string
  external?: boolean
  className?: string
  contentClassName?: string
  transparent?: boolean
  outline?: boolean
  padded?: boolean
  size?: 'xs' | 'sm' | 'md'
  tooltip?: string | undefined
  tooltipId?: string | undefined
} & React.ComponentPropsWithoutRef<'button'>

export const Button: React.FC<Props> = ({
  children,
  className,
  contentClassName,
  href,
  external,
  disabled,
  tooltip,
  tooltipId = undefined,
  transparent = false,
  padded = true,
  outline = false,
  size = 'md',
  ...rest
}: Props) => {
  const tooltipIdPrefixed = tooltipId ? ['btn', tooltipId].join('-') : ''

  const button = (
    <button
      disabled={disabled}
      className={cn(
        'rounded outline-none inline-block',
        {
          'bg-indigo-500 hover:bg-indigo-600 text-white active:opacity-50':
            !transparent && !outline,
          'cursor-not-allowed opacity-50': disabled,
          'px-4': padded,
          'py-3': padded && size === 'md',
          'py-2': padded && (size === 'sm' || size === 'xs'),
          'text-tiny font-medium': size === 'sm',
          'text-sm font-medium': size === 'md',
          'text-xs': size === 'xs',
          'border border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white':
            outline,
        },
        className,
      )}
      data-tooltip-content={tooltip}
      data-tooltip-id={tooltipIdPrefixed}
      {...rest}
    >
      <div className={cn('flex items-center', contentClassName)}>
        {children}
      </div>
      {tooltip && tooltipId && (
        <Tooltip className="tooltip" id={tooltipIdPrefixed} />
      )}
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
