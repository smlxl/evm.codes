import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { TreeView } from '@mui/x-tree-view/TreeView'

import ContractTreeNode from './ContractTreeNode'

type ContractTreeViewProps = {
  forest: any[]
  onSelect: (node, root) => void
}

const ContractTreeView = ({ forest, onSelect }: ContractTreeViewProps) => {
  let expanded: string[] = [] //"ast_root"] //, "ast_" + (tree[name] ? tree[name].id : "")]
  // console.log('tree:', forest)
  expanded = forest.map((t) => t.id as string)

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      defaultExpanded={expanded}
    >
      {forest &&
        forest.map((tree) => (
          <ContractTreeNode
            key={tree.id}
            root={tree}
            node={tree}
            onSelect={(node) => onSelect(node, tree)}
          />
        ))}
    </TreeView>
  )
}

export default ContractTreeView
