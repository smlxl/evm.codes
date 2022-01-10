import { Row } from 'react-table'

import { StackBox } from 'components/ui'

const filter = (rows: Row[], id: string, filterValue: string) => {
  const re = new RegExp(`${filterValue}`, 'i')
  return rows.filter((row: any) => row.original[id].match(re))
}

const tableData = [
  {
    Header: 'Address',
    accessor: 'address',
    filter,
    width: 50,
  },
  {
    Header: 'Name',
    accessor: 'name',
    filter,
    width: 80,
  },
  {
    Header: 'Minimum Gas',
    accessor: 'minimumFee',
    width: 70,
  },
  {
    Header: 'Input',
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
    Header: 'Ouput',
    accessor: 'output',
    Cell: ({ value }: { value: string }) => (
      <StackBox
        value={value}
        className="text-xs border-indigo-300 dark:border-indigo-900 text-gray-800 dark:text-gray-200"
      />
    ),
    width: 100,
    className: 'hidden lg:table-cell',
  },
  {
    Header: 'Description',
    accessor: 'description',
    className: 'hidden md:table-cell',
  },
]

export default tableData
