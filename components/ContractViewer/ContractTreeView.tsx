import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { TreeView } from '@mui/x-tree-view/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ContractTreeNode from './ContractTreeNode.tsx'

type ContractTreeViewProps = {
  name: string
  tree: object
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

const ContractTreeView = ({
      forest,
      onSelect
    }: ContractTreeViewProps
  ) => {

  let expanded = [] //"ast_root"] //, "ast_" + (tree[name] ? tree[name].id : "")]
  // if (tree) console.log('tree len', tree.length)
  // else console.log('no tree?')
  // console.log('tree:', tree.length)
  expanded = forest.map(t => t.id)

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      defaultExpanded={expanded}
    >
      {forest && forest.map(tree => (
        <ContractTreeNode node={tree} root={tree} onSelect={(node) => onSelect(node, tree)} />
      ))}
    </TreeView>
  )
}

export default ContractTreeView

/*import * as React from 'react';
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
      trees,
      onSelect
    }: AstTreeViewProps
  ) => {

  // let expanded = ["ast_root", "ast_" + (tree[name] ? tree[name].id : "")]

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      // defaultExpanded={expanded}
    >
      {/*
        TODO: instead of going two levels deep, just go through tree recursively 
        there should be no single root, it would allow multiple as it would actually be a forest
        
        map node type to component and just render the component,
        each component will recursively enter children only if it wants them
      * /}
      {trees && trees.map(tree => <ContractTreeNode node={tree} />)}
    </TreeView>
  )
}

export default AstTreeView
*/