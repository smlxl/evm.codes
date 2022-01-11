import { Row } from 'react-table'

import { StackBox } from 'components/ui'

const filter = (rows: Row[], id: string, filterValue: string) => {
  const re = new RegExp(`${filterValue}`, 'i')
  return rows.filter((row: any) => row.original[id].match(re))
}

const columns = (isPrecompiled: boolean) => [
  {
    Header: !isPrecompiled ? 'Opcode' : 'Address',
    accessor: 'opcodeOrAddress',
    className: !isPrecompiled ? 'uppercase' : undefined,
    filter,
    width: 48,
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
    width: 50,
  },
  {
    Header: !isPrecompiled ? 'Stack Input' : 'Input',
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
    Header: !isPrecompiled ? 'Stack Ouput' : 'Output',
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

export default columns
