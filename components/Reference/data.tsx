import { Row } from 'react-table'

import { StackBox } from 'components/ui'

const filter = (rows: Row[], id: string, filterValue: string) => {
  const re = new RegExp(`${filterValue}`, 'i')
  return rows.filter((row: any) => row.original[id].match(re))
}

const tableData = [
  {
    Header: 'Opcode',
    accessor: 'code',
    className: 'uppercase',
    filter,
    width: 48,
  },
  {
    Header: 'Name',
    accessor: 'name',
    filter,
    width: 128,
  },
  {
    Header: 'Static Gas',
    accessor: 'fee',
    width: 96,
  },
  {
    Header: 'Stack Input',
    accessor: 'input',
    Cell: ({ value }: { value: string }) => (
      <StackBox
        value={value}
        className="text-xs border-indigo-300 dark:border-indigo-900 text-gray-800 dark:text-gray-200"
      />
    ),
    width: 200,
    className: 'hidden lg:table-cell',
  },
  {
    Header: 'Stack Ouput',
    accessor: 'output',
    Cell: ({ value }: { value: string }) => (
      <StackBox
        value={value}
        className="text-xs border-indigo-300 dark:border-indigo-900 text-gray-800 dark:text-gray-200"
      />
    ),
    width: 200,
    className: 'hidden lg:table-cell',
  },
  {
    Header: 'Description',
    accessor: 'description',
    className: 'hidden md:table-cell',
  },
]

export default tableData
