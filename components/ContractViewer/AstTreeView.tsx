import * as React from 'react';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { TreeView } from '@mui/x-tree-view/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AstDefinitionItem from './AstDefinitionItem'
import { state } from './ContractState'

type AstTreeViewProps = {
  name: string
  tree: object
  rootLabel?: React.ReactNode
  onSelect: (node) => void
}

// function renderTreeItems(tree: object) {
//   return (
//       {Object.entries(tree).map((name, node) => {
//         (<AstDefinitionItem id={"ast_" + node.id} kind={node.kind} name={name}>
//           renderTreeItems
//         </AstDefinitionItem>)
//       })}
//   )
// }

const AstTreeView = ({
      name,
      tree,
      rootLabel,
      onSelect
    }: AstTreeViewProps
  ) => {

  let expanded = ["ast_root", "ast_" + (tree[name] ? tree[name].id : "")]

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      defaultExpanded={expanded}
    >
      {tree && 
        <TreeItem nodeId="ast_root" label={rootLabel} className="whitespace-nowrap">
          {Object.values(tree).map(contract => (
            <AstDefinitionItem id={"ast_" + contract.id} node={contract.node} onclick={() => onSelect(contract)}>
              {contract.children.map(subdef => (
                <AstDefinitionItem id={"ast_" + subdef.id} node={subdef.node} onclick={() => onSelect(subdef)} />
              ))}
            </AstDefinitionItem>
          ))}
        </TreeItem>
      }
    </TreeView>
  )
}

export default AstTreeView
