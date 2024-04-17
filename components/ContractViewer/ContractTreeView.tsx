import { TreeItem } from '@mui/x-tree-view'
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView'

import { DeploymentItem } from './ContractTreeNode'
import { DeploymentInfo } from './DeploymentInfo'

type ContractTreeViewProps = {
  deployments: DeploymentInfo[]
  onSelect: (node: any, root: any) => void
}

const ContractsTreeItem = ({ deployments, onSelect }: any) => {
  return (
    <TreeItem itemId="ti_contracts" label="Contracts">
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
      <SimpleTreeView
        className="font-mono h-[736px] overflow-x-hidden" // TODO: h-full not working. how to fill height?
        defaultExpandedItems={expanded}
      >
        <ContractsTreeItem deployments={deployments} onSelect={onSelect} />
      </SimpleTreeView>
    </>
  )
}

export default ContractTreeView
