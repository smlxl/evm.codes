/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext, useState } from 'react'

import { HorizontalRule } from '@mui/icons-material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { TreeItem } from '@mui/x-tree-view'
import { TreeView } from '@mui/x-tree-view/TreeView'

import { Button } from 'components/ui'

import { DeploymentInfo } from './ContractState'
import { SourceItem } from './ContractTreeNode'

type ContractTreeViewProps = {
  deployments: any[]
  onSelect: (node: any, root: any) => void
}

const ContractAdder = ({ onClick }: any) => {
  return (
    <Box className="pr-2 my-2">
      <TextField
        variant="outlined"
        size="small"
        label="Address"
        placeholder="0x"
        sx={{ width: '80%' }}
      />
      <Button className="m-1" size="xs" onClick={onClick}>
        +
      </Button>
    </Box>
  )
}

const ContractsTreeItem = ({ deployments, onSelect }: any) => {
  const handleAddContract = () => {
    alert('unimplemented')
  }

  return (
    <TreeItem nodeId="ti_contracts" label="Contracts">
      {/* <ContractAdder onClick={handleAddContract} /> */}
      {/* TODO: FILTER BOX HERE; ternary checkboxes (eg. show external funcs, internal+external or none) */}
      {deployments?.map((info: DeploymentInfo) => (
        <SourceItem
          key={info.codeAddress}
          contract={info}
          onSelect={onSelect}
        />
      ))}
    </TreeItem>
  )
}

const EnvironmentOverrides = () => {
  return (
    <TreeItem nodeId="ti_block" label="Block">
      <div className="flex flex-col gap-2 my-2 pr-6 ml-2">
        <TextField variant="outlined" size="small" label="Custom RPC" />
        <TextField
          variant="outlined"
          size="small"
          label="Block"
          placeholder="latest"
        />
        <TextField
          variant="outlined"
          size="small"
          label="From"
          placeholder="0x000000000000000000000000000073656e646572"
          className="m-2"
        />
      </div>
    </TreeItem>
  )
}

enum FunctionFilter {
  None,
  External,
  Internal,
  All,
}

type ViewFilter = {
  libraries: boolean
  functions: FunctionFilter
  structs: boolean
  events: boolean
  errors: boolean
  enums: boolean
}

const FilterContext = createContext<ViewFilter>({
  libraries: true,
  functions: FunctionFilter.All,
  structs: true,
  events: true,
  errors: true,
  enums: true,
})

const FilterToolbar = ({ values, onChange }) => {
  return (
    <ToggleButtonGroup
      size="small"
      value={values}
      className="dark:invert m-1"
      onChange={onChange}
    >
      <ToggleButton value="external">external</ToggleButton>
      <ToggleButton value="internal">internal</ToggleButton>
      <ToggleButton value="structs">structs</ToggleButton>
      <ToggleButton value="events">events</ToggleButton>
    </ToggleButtonGroup>
  )
}

const ContractTreeView = ({ deployments, onSelect }: ContractTreeViewProps) => {
  const expanded = ['ti_contracts']
  // expanded = forest.map((t) => t.defTree.id as string)

  const [states, setStates] = useState(() => [
    'external',
    'internal',
    'structs',
  ])

  const handleState = (event: MouseEvent, newStates: string[]) => {
    console.log(newStates)
    setStates(newStates)
  }

  return (
    <>
      {/* <FilterToolbar onChange={handleState} values={states} /> */}
      <TreeView
        className="font-mono h-[690px] overflow-x-hidden" // TODO: h-full not working. how to fill height?
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        defaultExpanded={expanded}
        defaultEndIcon={<HorizontalRule />}
      >
        <ContractsTreeItem deployments={deployments} onSelect={onSelect} />
      </TreeView>
    </>
  )
}

export default ContractTreeView
