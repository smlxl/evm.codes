import { useContext } from 'react'

import cn from 'classnames'

import { EthereumContext, IBackupState } from 'context/ethereumContext'

import { toKeyIndex } from 'util/string'

import { StackBox, StackBox2 } from 'components/ui'

type RowProps = {
  label: string
  value: string[] | string | undefined
  backupState: IBackupState | undefined
}

const ExecutionStateRow = ({ label, value, backupState }: RowProps) => {
  const values =
    !value || value.length === 0
      ? ['']
      : Array.isArray(value)
      ? value
      : ([value] as string[])
  // console.log('ExecutionStateRow', label, value)
  if (label == 'Stack') {
    console.log('ExecutionStateRow', 1234, value)
    return (
      <>
        <dt className="mb-1 text-gray-500 dark:text-gray-400 font-medium uppercase">
          {label}
        </dt>
        <dd className="font-mono mb-2">
          {values.map((value: string, index: number) => (
            <StackBox2
              key={toKeyIndex(label, index)}
              isFullWidth
              showEmpty
              value={value ? value.toString() : ''}
              idx={toKeyIndex(label, index)}
              backupState={backupState}
              className={cn(
                'break-all text-tiny border-gray-600 dark:border-gray-700 text-gray-300',
              )}
            />
          ))}
        </dd>
      </>
    )
  }

  return (
    <>
      <dt className="mb-1 text-gray-500 dark:text-gray-400 font-medium uppercase">
        {label}
      </dt>
      <dd className="font-mono mb-2">
        {values.map((value: string, index: number) => (
          <StackBox
            key={toKeyIndex(label, index)}
            isFullWidth
            showEmpty
            value={value ? value.toString() : ''}
            className={cn(
              'break-all text-tiny border-gray-600 dark:border-gray-700 text-gray-300',
            )}
          />
        ))}
      </dd>
    </>
  )
}

const ExecutionState = () => {
  const { executionState, backupState } = useContext(EthereumContext)
  const { memory, stack, storage, returnValue } = executionState

  return (
    <div>
      <dl className="text-2xs">
        <ExecutionStateRow
          label="Memory"
          value={memory}
          backupState={backupState}
        />
        <ExecutionStateRow
          label="Stack"
          value={stack}
          backupState={backupState}
        />

        <dt className="mb-1 text-gray-500 dark:text-gray-400 font-medium uppercase">
          Storage
        </dt>
        <dd className="mb-2">
          <div
            className="inline-block border border-gray-600 dark:border-gray-700 px-2 py-1 mb-1 w-full"
            style={{ minHeight: 26 }}
          >
            <dl>
              {storage.map(({ address, slot, value }, index) => (
                <div key={`storage-${index}`}>
                  <ExecutionStateRow
                    label="Contract"
                    value={address}
                    backupState={backupState}
                  />
                  <ExecutionStateRow
                    label="Slot"
                    value={slot}
                    backupState={backupState}
                  />
                  <ExecutionStateRow
                    label="Value"
                    value={value}
                    backupState={backupState}
                  />
                </div>
              ))}
            </dl>
          </div>
        </dd>

        <ExecutionStateRow
          label="Return value"
          value={returnValue}
          backupState={backupState}
        />
      </dl>
    </div>
  )
}

export default ExecutionState
