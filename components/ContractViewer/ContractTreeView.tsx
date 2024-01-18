import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { TreeView } from '@mui/x-tree-view/TreeView'

import { ContractInfo } from './ContractState'
import ContractTreeNode from './ContractTreeNode'

type ContractTreeViewProps = {
  forest: any[]
  onSelect: (node, root) => void
}

const ContractTreeView = ({ forest, onSelect }: ContractTreeViewProps) => {
  // let expanded: string[] = []
  // expanded = forest.map((t) => t.defTree.id as string)

  return (
    <TreeView
      sx={{ fontFamily: 'monospace' }}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      // defaultExpanded={expanded}
    >
      {forest &&
        forest.map((contract) => (
          <ContractTreeNode
            key={contract.defTree.id}
            contract={contract}
            root={contract.defTree}
            node={contract.defTree}
            onSelect={(node) => onSelect(node, contract.defTree)}
          >
            {contract.impls && // TODO: this should move inside ContractTreeNode & be recursive
              Object.values(contract.impls).map((impl: ContractInfo) => (
                <ContractTreeNode
                  key={impl.defTree.id}
                  contract={impl}
                  root={impl.defTree}
                  node={impl.defTree}
                  onSelect={(node) => onSelect(node, impl.defTree)}
                />
              ))}
          </ContractTreeNode>
        ))}
    </TreeView>
  )
}

export default ContractTreeView
