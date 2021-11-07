// import { hardforkColor } from 'util/opcodes'
// import { isEmpty } from 'util/string'

import { StackBox } from 'components/ui'

const tableData = [
  {
    Header: 'Opcode',
    accessor: 'code',
    className: 'uppercase',
  },
  {
    Header: 'Name',
    accessor: 'name',
  },
  {
    Header: 'Gas',
    accessor: 'fee',
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
    maxWidth: 200,
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
    maxWidth: 200,
    className: 'hidden lg:table-cell',
  },
  {
    Header: 'Description',
    accessor: 'description',
    className: 'hidden md:table-cell',
  },
]

export default tableData
