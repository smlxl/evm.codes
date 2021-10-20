import { useContext, useMemo } from 'react'

import cn from 'classnames'
import { useTable } from 'react-table'

import { EthereumContext } from 'context/ethereumContext'

import { isEmpty } from 'util/string'

import StackBox from 'components/ui/StackBox'

type GroupLabel = {
  [group: string]: string
}

const groupLabels: GroupLabel = {
  'Stop and Arithmetic Operations': 'Stop & Arithmetic',
  'Comparison & Bitwise Logic Operations': 'Comparison & Bitwise',
  'Environmental Information': 'Environment',
  'Block Information': 'Block',
  'Stack Memory Storage and Flow Operations': 'Stack & Memory',
  'Push Operations': 'Push',
  'Duplication Operations': 'Duplication',
  'Exchange Operations': 'Exchange',
  'System operations': 'System',
}

const columnsData = [
  {
    Header: 'Opcode',
    accessor: 'code',
    className: 'font-mono uppercase',
  },
  {
    Header: 'Name',
    accessor: 'name',
    className: 'font-mono',
  },
  {
    Header: 'Gas',
    accessor: 'fee',
  },
  {
    Header: 'Input',
    accessor: 'input',
    Cell: ({ value }: { value: string }) => <StackBox value={value} />,
  },
  {
    Header: 'Ouput',
    accessor: 'output',
    Cell: ({ value }: { value: string }) => <StackBox value={value} />,
  },
  {
    Header: 'Description',
    accessor: 'description',
  },
  {
    Header: 'Group',
    accessor: 'group',
    Cell: ({ value }: { value: string }) => {
      const label = groupLabels[value]
      return isEmpty(label) ? (
        ''
      ) : (
        <span
          className="bg-gray-200 rounded-full px-4 py-1 text-2xs uppercase font-medium"
          style={{ whiteSpace: 'nowrap' }}
        >
          {label}
        </span>
      )
    },
  },
  {
    Header: 'Note',
    accessor: 'note',
  },
]

const ReferenceTable = () => {
  const { opcodes } = useContext(EthereumContext)
  const data = useMemo(() => opcodes, [opcodes])
  const columns = useMemo(() => columnsData, [])

  // FIXME: See: https://github.com/tannerlinsley/react-table/issues/3064
  // @ts-ignore: Waiting for 8.x of react-table to have better types
  const table = useTable({ columns, data })

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    table

  return (
    <table {...getTableProps()} className="w-full table-auto text-sm">
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr key={headerGroup.getHeaderGroupProps().key} className="border-b">
            {headerGroup.headers.map((column) => (
              <th
                key={column.getHeaderProps().key}
                className="uppercase text-xs font-semibold text-left py-2 pr-6"
              >
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row)
          return (
            <tr key={row.getRowProps().key} className="border-b">
              {row.cells.map((cell) => (
                <td
                  key={cell.getCellProps().key}
                  // FIXME: See: https://github.com/tannerlinsley/react-table/issues/3064
                  // @ts-ignore: Waiting for 8.x of react-table to have better types
                  className={cn('py-2 pr-6', cell.column.className)}
                >
                  {cell.render('Cell')}
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default ReferenceTable
