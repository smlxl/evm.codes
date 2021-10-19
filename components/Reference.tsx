import cn from 'classnames'
import { useMemo } from 'react'
import { useTable } from 'react-table'

import { opcodes } from '../util/fixtures'
import StackBox from './ui/StackBox'

const columnsData = [
  {
    Header: 'Opcode',
    accessor: 'opcode',
    className: 'font-mono',
  },
  {
    Header: 'Name',
    accessor: 'name',
    className: 'font-mono',
  },
  {
    Header: 'Gas',
    accessor: 'gas',
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
    Cell: ({ value }: { value: string }) => (
      <span
        className="bg-gray-200 rounded-full px-4 py-1 text-2xs uppercase font-medium"
        style={{ whiteSpace: 'nowrap' }}
      >
        {value}
      </span>
    ),
  },
  {
    Header: 'Note',
    accessor: 'note',
  },
]

const ReferenceTable = () => {
  const data = useMemo(() => opcodes, [])
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
