import {
  useContext,
  useMemo,
  useRef,
  Fragment,
  useEffect,
  useState,
} from 'react'

import cn from 'classnames'
import useWindowSize from 'lib/useWindowResize'
import { useRouter } from 'next/router'
import { useTable, useExpanded, useFilters, HeaderGroup } from 'react-table'
import { IOpcode, IOpcodeDocs } from 'types'

import { EthereumContext } from 'context/ethereumContext'

import { Button, Icon } from 'components/ui'

import tableData from './data'
import DocRow from './DocRow'
import Filters from './Filters'
import Header from './Header'

type CustomHeaderGroup = {
  className?: string
} & HeaderGroup<IOpcode>

const ReferenceTable = ({ opcodeDocs }: { opcodeDocs: IOpcodeDocs }) => {
  const router = useRouter()
  const { opcodes } = useContext(EthereumContext)
  const data = useMemo(() => opcodes, [opcodes])
  const columns = useMemo(() => tableData, [])
  const rowRefs = useRef<HTMLTableRowElement[]>([])
  const [focusedOpcode, setFocusedOpcode] = useState<number | null>()
  const { width: screenWidth } = useWindowSize()

  // FIXME: See: https://github.com/tannerlinsley/react-table/issues/3064
  // @ts-ignore: Waiting for 8.x of react-table to have better types
  const table = useTable({ columns, data }, useExpanded, useFilters)

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
    // @ts-ignore: Waiting for 8.x of react-table to have better types
    setFilter,
  } = table

  const colSpan = useMemo(
    () => (screenWidth && screenWidth >= 768 ? visibleColumns.length + 1 : 3),
    [screenWidth, visibleColumns],
  )

  // Focus and expand anchored opcode
  useEffect(() => {
    if (opcodes && rowRefs?.current) {
      const idx = opcodes.findIndex((opcode) => {
        const re = new RegExp(`/#${opcode.code}`, 'gi')
        return router.asPath.match(re)
      })

      if (idx) {
        setFocusedOpcode(idx)
        setTimeout(() => {
          if (rowRefs.current[idx]) {
            rowRefs.current[idx].scrollIntoView({ behavior: 'smooth' })
          }
        }, 300)
      }
    }
  }, [opcodes, router.asPath])

  if (opcodes.length === 0) return null

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-10">
        <Header />
        <Filters onSetFilter={setFilter} />
      </div>

      <table {...getTableProps()} className="w-full table-fixed">
        <thead>
          {headerGroups.map((headerGroup) => (
            <>
              <tr
                key={headerGroup.getHeaderGroupProps().key}
                className="sticky bg-gray-50 dark:bg-black-700 border-b border-gray-200 dark:border-black-500 uppercase text-xs text-left text-gray-500"
                style={{
                  top: 54,
                }}
              >
                {headerGroup.headers.map((column: CustomHeaderGroup) => (
                  <th
                    key={column.getHeaderProps().key}
                    className={cn('py-3 pr-6 font-medium', column.className)}
                    style={{
                      maxWidth: column.maxWidth || 'auto',
                      minWidth: column.minWidth || 'auto',
                    }}
                  >
                    {column.render('Header')}
                  </th>
                ))}
                <th className="bg-gray-50 dark:bg-black-700 py-3 text-right hidden md:table-cell">
                  <Button
                    onClick={() => toggleAllRowsExpanded(!isAllRowsExpanded)}
                    padded={false}
                    transparent
                    className="text-gray-800 dark:text-gray-200"
                  >
                    <span className="text-sm font-normal">
                      {isAllRowsExpanded ? 'Collapse' : 'Expand'}
                    </span>
                    <Icon
                      className="text-indigo-500"
                      name={
                        isAllRowsExpanded
                          ? 'arrow-up-s-line'
                          : 'arrow-down-s-line'
                      }
                    />
                  </Button>
                </th>
              </tr>
            </>
          ))}
        </thead>

        <tbody {...getTableBodyProps()} className="text-sm">
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={colSpan}
                className="text-center pt-20 pb-4 text-lg text-gray-400 dark:text-gray-600"
              >
                No opcodes found
              </td>
            </tr>
          )}

          {rows.map((row) => {
            prepareRow(row)

            const opcode = row.values.code
            // @ts-ignore: Waiting for 8.x of react-table to have better types
            const isExpanded = row.isExpanded || focusedOpcode === row.id

            return (
              <Fragment key={row.getRowProps().key}>
                <tr
                  className={cn('border-t cursor-pointer', {
                    'border-gray-200 dark:border-black-500 hover:bg-gray-100 dark:hover:bg-black-600':
                      !isExpanded,
                    'border-b border-indigo-100 dark:border-black-500':
                      isExpanded,
                  })}
                  ref={(el) => {
                    if (el) rowRefs.current[row.index] = el
                  }}
                  // @ts-ignore: Waiting for 8.x of react-table to have better types
                  onClick={() => row.toggleRowExpanded()}
                  style={{ scrollMarginTop: '96px' }}
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
                  <tr className="bg-indigo-50 dark:bg-black-600">
                    <td colSpan={colSpan}>
                      <DocRow opcode={opcodeDocs[opcode.toUpperCase()]} />
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
