import React from 'react'

import cn from 'classnames'

import { IBackupState } from 'context/ethereumContext'

type Props = {
  value: string
  showEmpty?: boolean
  isFullWidth?: boolean
  className?: string
  idx: string
  backupState?: IBackupState
}

export const StackBox2: React.FC<Props> = ({
  value,
  showEmpty,
  isFullWidth,
  className,
  idx,
  backupState,
}) => {
  if (!showEmpty && value.length === 0) {
    return null
  }

  const parts = value.split(/[^\\]\|/)

  const editStack = () => {
    console.log(value, className, idx)
    console.log(backupState, backupState?.memoryWordCount)
    const tempBackupState = backupState
    if (tempBackupState) {
      // tempBackupState.stack
      try {
        const offset: number =
          tempBackupState.stack.length - 1 - parseInt(idx.split('-')[1])
        tempBackupState.stack[offset] = BigInt(prompt('input new value') + '')
        backupState?.fnSetExecutionState(tempBackupState)
      } catch (e) {
        console.log(e)
      }
    }
  }

  return (
    <>
      {(parts.length > 0 ? parts : [value]).map((p: string, index: number) => (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <div
          key={index}
          role="button"
          tabIndex={0}
          onClick={editStack}
          className={cn(
            'font-mono inline-block border px-2 py-1 mb-1 rounded-sm',
            { 'w-full': isFullWidth, 'mr-1': !isFullWidth },
            className,
          )}
          style={{ minHeight: 26 }}
        >
          {p.replace(/\\\|/g, '|')}
        </div>
      ))}
    </>
  )
}
