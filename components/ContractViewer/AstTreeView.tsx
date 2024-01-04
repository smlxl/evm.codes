import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { TreeView } from '@mui/x-tree-view/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AstDefinitionItem from './AstDefinitionItem'

type AstTreeViewProps = {
  name: string
  tree: object
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
        <AstDefinitionItem id="ast_root" name={"📀 " + name}>
          {Object.values(tree).map(contract => (
            <AstDefinitionItem id={"ast_" + contract.id} kind={contract.kind} name={contract.name} onclick={() => onSelect(contract)}>
              {contract.children.map(subdef => (
                <AstDefinitionItem id={"ast_" + subdef.id} kind={subdef.kind} name={subdef.name} onclick={() => onSelect(subdef)} />
              ))}
            </AstDefinitionItem>
          ))}
        </AstDefinitionItem>
      }
    </TreeView>
  )
}

export default AstTreeView
