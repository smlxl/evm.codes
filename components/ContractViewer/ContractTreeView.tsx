import { HorizontalRule } from '@mui/icons-material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { TreeItem } from '@mui/x-tree-view'
import { TreeView } from '@mui/x-tree-view/TreeView'

import { DeploymentItem } from './ContractTreeNode'
import { DeploymentInfo } from './DeploymentInfo'

type ContractTreeViewProps = {
  deployments: DeploymentInfo[]
  onSelect: (node: any, root: any) => void
}

const ContractsTreeItem = ({ deployments, onSelect }: any) => {
  return (
    <TreeItem nodeId="ti_contracts" label="Contracts">
      {deployments?.map((deployment: DeploymentInfo) => (
        <DeploymentItem
          key={deployment.address}
          deployment={deployment}
          onSelect={onSelect}
        />
      ))}
    </TreeItem>
  )
}

const ContractTreeView = ({ deployments, onSelect }: ContractTreeViewProps) => {
  const expanded = ['ti_contracts']

  return (
    <>
      <TreeView
        className="font-mono h-[736px] overflow-x-hidden" // TODO: h-full not working. how to fill height?
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
