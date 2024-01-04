import { Row } from 'react-table';
import { StackBox } from 'components/ui';

const filter = (rows: Row[], id: string, filterValue: string) => {
  const re = new RegExp(`${filterValue}`, 'i');
  return rows.filter((row: any) => {
    const value = row.original[id]; // Ensure row.original[id] exists
    return value && value.match(re);
  });
};

const columns = (isPrecompiled: boolean, isTransactionType: boolean = false) => {  
  if (isTransactionType) {
    return [
      {
        Header: 'Type',
        accessor: 'type',
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
        Header: 'Description',
        accessor: 'description',
        className: 'hidden md:table-cell',
      },
      {
        Header: 'Rollups',
        accessor: 'rollups',
        className: 'hidden md:table-cell',
        Cell: ({ value }: { value: string }) => (
          <div className="flex flex-wrap">
            {Object.keys(value).map((rollupName, index) => (
              <span
                key={index}
                className={`ml-2 py-1 px-3 leading-normal rounded-full text-2xs tracking-widest font-medium ${
                  rollupName === 'optimism'
                    ? 'bg-red-500 text-white' 
                    : rollupName === 'base'
                    ? 'bg-blue-500 text-white'
                    : rollupName === 'arbitrumOne'
                    ? 'bg-blue-300 text-white'
                    : 'bg-gray-400 text-gray-800' 
                }`}
                style={{ margin: '4px' }}
              >
                {rollupName}
              </span>
            ))}
          </div>
        ),
      },
    ];
  }

  return [
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
      Header: !isPrecompiled ? 'Stack Output' : 'Output',
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
  ];
};

export default columns;
