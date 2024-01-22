import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, TextField } from '@mui/material'
import { TreeItem } from '@mui/x-tree-view'
import { TreeView } from '@mui/x-tree-view/TreeView'

import { Button } from 'components/ui'

import { ContractInfo } from './ContractState'
import ContractTreeNode from './ContractTreeNode'

type ContractTreeViewProps = {
  forest: any[]
  onSelect: (node: any, root: any) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

const ContractsNode = ({ forest, onSelect }: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddContract = () => {
    alert('unimplemented')
  }

  return (
    <TreeItem nodeId="ti_contracts" label="Contracts">
      {/* <ContractAdder onClick={handleAddContract} /> */}
      {forest &&
        forest.map((contract: any) => (
          <ContractTreeNode
            key={contract.defTree.id}
            contract={contract}
            root={contract.defTree}
            node={contract.defTree}
            onSelect={(node) => onSelect(node, contract.defTree)}
          >
            {contract.impls && // TODO: this should move inside ContractTreeNode & be recursive
              (Object.values(contract.impls) as ContractInfo[]).map(
                (impl: ContractInfo) => (
                  <ContractTreeNode
                    key={impl.defTree.id}
                    contract={impl}
                    root={impl.defTree}
                    node={impl.defTree}
                    onSelect={(node) => onSelect(node, impl.defTree)}
                  />
                ),
              )}
          </ContractTreeNode>
        ))}
    </TreeItem>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

const ContractTreeView = ({ forest, onSelect }: ContractTreeViewProps) => {
  const expanded = ['ti_contracts']
  // expanded = forest.map((t) => t.defTree.id as string)

  return (
    <TreeView
      className="font-mono"
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      defaultExpanded={expanded}
    >
      {/* <EnvironmentOverrides /> */}

      <ContractsNode forest={forest} onSelect={onSelect} />
    </TreeView>
  )
}

export default ContractTreeView
