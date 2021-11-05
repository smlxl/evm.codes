import { useContext, useMemo, useCallback, Fragment } from 'react'

import cn from 'classnames'
import { useRouter } from 'next/router'
import { useTable, useExpanded, HeaderGroup } from 'react-table'
import { IOpcode, IOpcodeDocs } from 'types'

import { EthereumContext } from 'context/ethereumContext'

import { Button, Icon } from 'components/ui'

import tableData from './data'
import DocRow from './DocRow'
import Header from './Header'

type CustomHeaderGroup = {
  className?: string
} & HeaderGroup<IOpcode>

const ReferenceTable = ({ opcodeDocs }: { opcodeDocs: IOpcodeDocs }) => {
  const router = useRouter()
  const { opcodes } = useContext(EthereumContext)
  const data = useMemo(() => opcodes, [opcodes])
  const columns = useMemo(() => tableData, [])

  // FIXME: See: https://github.com/tannerlinsley/react-table/issues/3064
  // @ts-ignore: Waiting for 8.x of react-table to have better types
  const table = useTable({ columns, data }, useExpanded)

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    visibleColumns,
    // @ts-ignore: Waiting for 8.x of react-table to have better types
    toggleAllRowsExpanded,
    // @ts-ignore: Waiting for 8.x of react-table to have better types
    isAllRowsExpanded,
  } = table

  const isRowFocused = useCallback(
    (opcode: string) => {
      const re = new RegExp(`/#${opcode}`, 'gi')
      return router.asPath.match(re)
    },
    [router.asPath],
  )

  return (
    <>
      <Header />

      <table {...getTableProps()} className="w-full table-auto">
        <thead className="text-sm">
          {headerGroups.map((headerGroup) => (
            <>
              <tr key="header-links" className="hidden md:table-row">
                <th
                  className="sticky text-right z-20 pr-4"
                  colSpan={visibleColumns.length}
                  style={{ top: 46 }}
                >
                  <Button
                    onClick={() => toggleAllRowsExpanded(!isAllRowsExpanded)}
                    padded={false}
                    transparent
                    className="text-gray-800"
                  >
                    <span className="text-sm font-normal">
                      {isAllRowsExpanded ? 'Collapse' : 'Expand'}
                    </span>
                    <Icon
                      name={
                        isAllRowsExpanded
                          ? 'arrow-up-s-line'
                          : 'arrow-down-s-line'
                      }
                    />
                  </Button>
                </th>
              </tr>
              <tr
                key={headerGroup.getHeaderGroupProps().key}
                className="border-b"
              >
                {headerGroup.headers.map((column: CustomHeaderGroup) => (
                  <th
                    key={column.getHeaderProps().key}
                    className={cn(
                      'sticky bg-gray-200 bg-opacity-95 uppercase text-xs font-semibold text-left py-2 pr-6',
                      column.className,
                    )}
                    style={{
                      maxWidth: column.maxWidth || 'auto',
                      minWidth: column.minWidth || 'auto',
                      top: 56,
                    }}
                  >
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            </>
          ))}
        </thead>

        <tbody {...getTableBodyProps()} className="text-xs">
          {rows.map((row) => {
            prepareRow(row)

            const opcode = row.values.code
            // @ts-ignore: Waiting for 8.x of react-table to have better types
            const isExpanded = row.isExpanded || isRowFocused(opcode)

            return (
              <Fragment key={row.getRowProps().key}>
                <tr
                  id={opcode.toUpperCase()}
                  className={cn('border-b cursor-pointer', {
                    ' border-gray-200 hover:bg-gray-200': !isExpanded,
                    'border-yellow-300 bg-yellow-200 hover:bg-yellow-300':
                      isExpanded,
                  })}
                  // @ts-ignore: Waiting for 8.x of react-table to have better types
                  onClick={() => row.toggleRowExpanded()}
                >
                  {row.cells.map((cell) => (
                    <td
                      key={cell.getCellProps().key}
                      // FIXME: See: https://github.com/tannerlinsley/react-table/issues/3064
                      // @ts-ignore: Waiting for 8.x of react-table to have better types
                      className={cn('py-2 pr-6', cell.column.className)}
                      style={{
                        maxWidth: cell.column.maxWidth || 'auto',
                        minWidth: cell.column.minWidth || 'auto',
                      }}
                    >
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>

                {isExpanded ? (
                  <tr>
                    <td colSpan={visibleColumns.length}>
                      <DocRow opcode={opcodeDocs[opcode]} />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

export default ReferenceTable
