import React from 'react'

import ReactTooltip from 'react-tooltip'

import { reduceArrayToFit } from 'util/string'

import { Icon } from './Icon'

type Props = {
  value: string
  tipId: string
}

type TableProps = {
  values: string[]
}

const maxLength = 8

const StackBoxTable: React.FC<TableProps> = ({ values }) => {
  return (
    <table className="inline-block">
      <tbody>
        <tr>
          {values.map((p: string, index: number) => (
            <td key={index} className="font-mono border border-gray-300 px-2">
              {p}
            </td>
          ))}
          <td className="font-mono border-t border-b border-l border-gray-300 px-2" />
        </tr>
      </tbody>
    </table>
  )
}

export const StackBox: React.FC<Props> = ({ value, tipId }) => {
  if (value.length === 0) return null

  const parts = value.split('|')
  const allValues = parts.length === 0 ? [value] : parts
  const reducedValues = reduceArrayToFit(allValues, maxLength)
  const hasHiddenCols = allValues.length > reducedValues.length

  return (
    <div className="flex items-center">
      <StackBoxTable values={hasHiddenCols ? reducedValues : allValues} />

      {hasHiddenCols && (
        <>
          <a
            className="inline-block ml-2 cursor-help text-gray-300 hover:text-gray-600"
            data-tip
            data-for={tipId}
          >
            <Icon name="information-line" />
          </a>

          <ReactTooltip id={tipId} className="tooltip" place="top">
            <StackBoxTable values={allValues} />
          </ReactTooltip>
        </>
      )}
    </div>
  )
}
