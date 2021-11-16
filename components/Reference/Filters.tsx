import { useState } from 'react'

import debounce from 'lodash.debounce'
import Select, { OnChangeValue } from 'react-select'

import { Button, Icon, Input } from 'components/ui'

const filterByOptions = [
  { label: 'Opcode', value: 'code' },
  { label: 'Name', value: 'name' },
  { label: 'Description', value: 'description' },
]

const debounceTimeout = 100 // ms

type Props = {
  isExpanded: boolean
  onExpand: (expanded: boolean) => void
  onSetFilter: (columnId: string, value: string) => void
}

const Filters = ({ isExpanded, onExpand, onSetFilter }: Props) => {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchFilter, setSearchFilter] = useState({
    value: 'name',
    label: 'Name',
  })

  const handleKeywordChange = debounce(
    (value: string) => onSetFilter(searchFilter.value, value),
    debounceTimeout,
  )

  const handleSearchFilterChange = (option: OnChangeValue<any, any>) => {
    setSearchFilter(option)
  }

  return (
    <div className="flex items-center md:justify-end">
      <Button
        onClick={() => onExpand(!isExpanded)}
        padded={false}
        transparent
        className="text-gray-800 dark:text-gray-200 mr-8 hidden md:inline-block"
      >
        <span className="text-sm">{isExpanded ? 'Collapse' : 'Expand'}</span>

        <Icon
          className="text-indigo-500"
          name={isExpanded ? 'arrow-up-s-line' : 'arrow-down-s-line'}
        />
      </Button>

      <span className="hidden md:inline-block text-sm text-gray-400 dark:text-black-400 mr-3">
        Search by
      </span>

      <div className="bg-gray-100 dark:bg-black-500 rounded mr-3 pl-2 pr-1">
        <Select
          onChange={handleSearchFilterChange}
          options={filterByOptions}
          defaultValue={{ label: 'Name', value: 'name' }}
          value={searchFilter}
          isSearchable={false}
          classNamePrefix="select"
          menuPlacement="auto"
        />
      </div>

      <Input
        searchable
        value={searchKeyword}
        onChange={(e) => {
          setSearchKeyword(e.target.value)
          handleKeywordChange(e.target.value)
        }}
        placeholder={`Enter keyword...`}
      />
    </div>
  )
}

export default Filters
