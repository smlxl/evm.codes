// import { hardforkColor } from 'util/opcodes'
// import { isEmpty } from 'util/string'

import { StackBox } from 'components/ui'

const tableData = [
  {
    Header: 'Opcode',
    accessor: 'code',
    className: 'uppercase pl-2',
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
    Cell: ({ value }: { value: string }) => <StackBox value={value} />,
    maxWidth: 200,
    className: 'hidden lg:table-cell',
  },
  {
    Header: 'Stack Ouput',
    accessor: 'output',
    Cell: ({ value }: { value: string }) => <StackBox value={value} />,
    maxWidth: 200,
    className: 'hidden lg:table-cell',
  },
  {
    Header: 'Description',
    accessor: 'description',
    className: 'hidden md:table-cell',
  },
  //  FIXME: Use in table filters:
  // {
  //   Header: 'Fork',
  //   accessor: 'fork',
  //   Cell: ({ value }: { value: string }) => {
  //     return isEmpty(value) ? (
  //       ''
  //     ) : (
  //       <span
  //         className={cn(
  //           'bg-gray-200 rounded-full px-4 py-1 text-2xs uppercase font-medium whitespace-nowrap',
  //           hardforkColor[value],
  //         )}
  //       >
  //         {value}
  //       </span>
  //     )
  //   },
  // },
  // {
  //   Header: 'Group',
  //   accessor: 'group',
  //   Cell: ({ value }: { value: string }) => {
  //     const label = groupLabels[value]
  //     return isEmpty(label) ? (
  //       ''
  //     ) : (
  //       <span className="bg-gray-200 rounded-full px-4 py-1 text-2xs uppercase font-medium whitespace-nowrap">
  //         {label}
  //       </span>
  //     )
  //   },
  //   className: 'hidden lg:table-cell',
  // },
]

export default tableData
