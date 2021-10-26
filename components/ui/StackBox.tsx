import React from 'react'

import cn from 'classnames'

type Props = {
  value: string
  showEmpty?: boolean
  isFullWidth?: boolean
  className?: string
}

export const StackBox: React.FC<Props> = ({
  value,
  showEmpty,
  isFullWidth,
  className,
}) => {
  if (!showEmpty && value.length === 0) return null

  const parts = value.split('|')

  return (
    <>
      {(parts.length > 0 ? parts : [value]).map((p: string, index: number) => (
        <div
          key={index}
          className={cn(
            'font-mono text-xs inline-block border border-gray-300 px-2 py-1 mb-1',
            { 'w-full': isFullWidth, 'mr-1': !isFullWidth },
            className,
          )}
          style={{ minHeight: 26 }}
        >
          {p}
        </div>
      ))}
    </>
  )
}
