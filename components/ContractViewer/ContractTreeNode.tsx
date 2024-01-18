/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/jsx-key */
/* eslint-disable jsx-a11y/accessible-emoji */
import { useState } from 'react'

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { TreeItem } from '@mui/x-tree-view/TreeItem'
import { encodeAbiParameters, encodeFunctionData } from 'viem'

import { ContractInfo, state, rpc } from './ContractState'

type ContractTreeNodeProps = {
  contract: ContractInfo
  node: any
  root: any
  children?: any
  onSelect: (e) => void
}

const NodeItem = ({ title, subtitle, emoji }) => {
  return (
    <>
      <p>
        {emoji} {title}
      </p>
      {subtitle && <p className="text-xs">{subtitle}</p>}
    </>
  )
}

function getType(type) {
  // TODO: doesn't always work (eg. storage mapping as param? see aave pools for example)
  if (type.type == 'ArrayTypeName') {
    return getType(type.baseTypeName) + '[]'
  } else if (type.type == 'Mapping') {
    return (
      'mapping (' +
      getType(type.keyType) +
      ' => ' +
      getType(type.valueType) +
      ')'
    )
  }

  return type?.name || type?.namePath
}

const NodeTypeMap = {
  Deployment: {
    label: (contract, node) => {
      const text = node.info.codeAddress
      // if (node.info.codeAddress != node.info.contextAddress) {
      //   text += ' @ ' + node.info.contextAddress
      // }

      return (
        <div className="whitespace-nowrap">
          <button
            onDoubleClick={() => {
              state.removeContract(node.info)
            }}
          >
            ❌
          </button>
          <span>🗂️ {node.info.etherscanInfo.ContractName}</span>
          <p className="text-xs">{text}</p>
        </div>
      )
    },
    // widget: (contract, node) => {
    //   if (node.impls.length > 0) {
    //     return (node.impls.map(tree => <ContractTreeNode node={tree} />))
    //   }
    // }
  },
  ContractDefinition: {
    label: (contract: ContractInfo, node) => {
      // if (node.kind == 'library') {
      //   return '📚 library ' + node.name + ' [' + Object.keys(contract.etherscanInfo.SourceCode.settings.libraries)[0] + ']'
      // }

      return <NodeItem title={node.name} subtitle={node.kind} emoji="📜" />
      // return '📜 ' + node.kind + ' ' + node.name
    },
  },
  FunctionDefinition: {
    label: (contract, node) => {
      let title
      let subtitle
      if (node.name) {
        title = node.name
        subtitle = 'function'
      } else {
        if (node.isConstructor) {
          title = <i>constructor</i>
        } else if (node.isFallback) {
          title = <i>fallback</i>
        } else if (node.isReceiveEther) {
          title = <i>receive</i>
        } else {
          title = <i>*unknown function*</i>
        }

        subtitle = 'special function'
      }

      subtitle += ' ' + node.visibility
      if (node.stateMutability) {
        subtitle += ' ' + node.stateMutability
      }

      return <NodeItem emoji="🔧" title={title} subtitle={subtitle} />
    },
    widget: (contract, node, root) => {
      if (
        node.isConstructor ||
        node.visibility == 'internal' ||
        node.visibility == 'private'
      ) {
        return null
      }

      // TODO: support
      if (node.isFallback || node.isReceiveEther) {
        return null
      }

      const [weiValue, setWeiValue] = useState(0n)
      const [retValue, setRetValue] = useState('')
      const [argValues, setArgValues] = useState(Array(node.parameters.length))

      function callFunction() {
        const data = encodeFunctionData({
          abi: contract.abi,
          functionName: node.name,
          args: argValues,
        })

        rpc
          .call({
            to: root.info.contextAddress,
            data,
          })
          .then((res) => {
            setRetValue(res.data as string)
          })
          .catch((err) => {
            setRetValue(err.toString())
          })
      }

      return (
        <div className="flex flex-col gap-2 text-black-500">
          {node.parameters.length > 0 &&
            node.parameters.map((param, i) => {
              const type = getType(param.typeName)
              return (
                <TextField
                  variant="outlined"
                  label={type + ' ' + (param.name || '')}
                  size="small"
                  onChange={(e) => {
                    argValues[i] = e.target.value
                    setArgValues(new Array(...argValues))
                  }}
                />
              )
            })}
          {node.stateMutability == 'payable' && (
            <TextField
              variant="outlined"
              label="value (wei)"
              size="small"
              onChange={(e) => {
                setWeiValue(BigInt(e.target.value))
              }}
            />
          )}
          <Button onClick={callFunction} variant="contained">
            Call
          </Button>
          {/* TODO: decode return params */}
          {/* {node.returnParameters &&
            node.returnParameters.length > 0 &&
            node.returnParameters.map((param) => {
              const type = getType(param.typeName)
              return (
                <>
                  <hr />
                  <TextField
                    variant="filled"
                    label={type + ' ' + (param.name || '')}
                    value={retValue}
                    size="small"
                  />
                </>
              )
            })} */}
          <p
            className="text-xs text-gray-500 break-all text-overflow"
            // onClick={() => navigator.clipboard.writeText(retValue)}
          >
            {retValue}
          </p>
        </div>
      )
    },
  },
  EventDefinition: {
    label: (contract, node) => {
      let subtitle = 'event'
      const params = node.parameters.map((p) => p.typeName.name).join(', ')
      if (params) {
        subtitle += ' ' + params
      }

      return <NodeItem emoji="🔔" title={node.name} subtitle={subtitle} />
    },
  },
  StructDefinition: {
    label: (contract, node) => {
      return <NodeItem title={node.name} subtitle="struct" emoji="🏗️" />
    },
  },
  EnumDefinition: {
    label: (contract, node) => {
      return <NodeItem title={node.name} subtitle="enum" emoji="📚" />
    },
  },
  StateVariableDeclaration: {
    label: (contract, node) => {
      let subtitle = 'storage '
      const type = node.variables[0].typeName
      if (type) {
        if (type.type == 'Mapping') {
          // eslint-disable-next-line prettier/prettier
          subtitle += `mapping (${getType(type.keyType)} => ${getType(type.valueType)})`
        } else {
          subtitle += getType(type)
        }
      } else {
        subtitle += '*unknown type*'
      }

      return (
        <NodeItem
          emoji="📦"
          title={node.variables[0].name}
          subtitle={subtitle}
        />
      )
    },
    widget: (contract, node, root) => {
      const var0 = node.variables[0]
      let type = var0.typeName
      if (var0.visibility == 'public') {
        const fakeFuncNode: any = {
          type: 'FunctionDefinition',
          name: var0.name,
          parameters: [],
          returnParameters: [],
          visibility: 'public',
        }

        while (type.keyType) {
          fakeFuncNode.parameters.push({
            typeName: type.keyType,
            name: type.keyName,
          })
          type = type.valueType
        }

        fakeFuncNode.returnParameters.push({
          typeName: type.name,
          name: var0.name,
        })

        return NodeTypeMap.FunctionDefinition.widget(
          contract,
          fakeFuncNode,
          root,
        )
      }

      let indexComps
      if (type.keyType) {
        const keyType = getType(type.keyType)
        indexComps = (
          <TextField variant="outlined" label={keyType} size="small" />
        )
      }

      return (
        <>
          {indexComps}
          <p>value: TODO</p>
        </>
      )
    },
  },
}

const EmptyMap = {
  emoji: '?',
  className: '',
  label: () => 'N/A',
}

const ContractTreeNode = ({
  contract,
  node,
  root,
  onSelect,
  children,
}: ContractTreeNodeProps) => {
  const map = { ...EmptyMap, ...(NodeTypeMap[node.type] || {}) }

  const widget = map.widget && map.widget(contract, node.node, root.node)
  const icons: any = {}
  if (node.children.length == 0 && !widget) {
    icons.expandIcon = <></>
    icons.collapseIcon = <></>
  }

  // TODO: instead of TreeItem here and label & widget, just make a NodeItem({...params}) that extends TreeItem
  return (
    <TreeItem
      nodeId={node.id}
      key={node.id}
      label={map.label(contract, node.node)}
      onClick={() => onSelect(node)}
      {...icons}
    >
      {widget && <div className="p-2 border-l-2">{widget}</div>}
      {node.children.map((child) => (
        <ContractTreeNode
          root={root}
          key={child.id}
          contract={contract}
          node={child}
          onSelect={onSelect}
        />
      ))}
      {children ? children : null}
    </TreeItem>
  )
}

export default ContractTreeNode
