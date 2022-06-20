import { useState, forwardRef, ForwardedRef, useCallback } from 'react'

import cn from 'classnames'

import { toHex } from '../../util/string'

type RowProps = {
  instructionId: number
  isActive: boolean
  name: string
  value: string | undefined
  hasBreakpoint: boolean | undefined
  onAddBreakpoint: (instructionId: number) => void
  onRemoveBreakpoint: (instructionId: number) => void
}

const EditorInstructionRow = forwardRef(
  (
    {
      instructionId,
      isActive,
      name,
      value,
      hasBreakpoint,
      onAddBreakpoint,
      onRemoveBreakpoint,
    }: RowProps,
    ref: ForwardedRef<HTMLTableRowElement>,
  ) => {
    const [isBreakpointVisible, setIsBreakpointVisible] =
      useState(hasBreakpoint)

    const toggleBreakpoint = useCallback(() => {
      if (hasBreakpoint) {
        onRemoveBreakpoint(instructionId)
      } else {
        onAddBreakpoint(instructionId)
      }
    }, [hasBreakpoint, instructionId, onAddBreakpoint, onRemoveBreakpoint])

    return (
      <tr
        onMouseEnter={() => setIsBreakpointVisible(true)}
        onMouseLeave={() => !hasBreakpoint && setIsBreakpointVisible(false)}
        className={cn(
          'relative border-b border-gray-200 dark:border-black-500',
          {
            'text-gray-900 dark:text-gray-200': isActive,
            'text-gray-400 dark:text-gray-600': !isActive,
          },
        )}
        ref={ref}
      >
        <td className="py-1 pl-6 pr-3">[{toHex(instructionId)}]</td>
        <td className="py-1 pl-3 pr-6">
          {(isBreakpointVisible || hasBreakpoint) && (
            <button
              onClick={toggleBreakpoint}
              className={cn(
                'absolute block top-2 left-2 w-2 h-2 z-10 rounded-full',
                {
                  'bg-red-300 hover:bg-red-500': !hasBreakpoint,
                  'bg-red-500': hasBreakpoint,
                },
              )}
            />
          )}
          {name}
        </td>
        <td className="py-1 px-4">{value}</td>
      </tr>
    )
  },
)

export default EditorInstructionRow
