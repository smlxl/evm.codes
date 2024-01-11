/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/jsx-key */
/* eslint-disable jsx-a11y/accessible-emoji */
import { useState } from 'react'

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { TreeItem } from '@mui/x-tree-view/TreeItem'

// import { state } from './ContractState'

type ContractTreeNodeProps = {
  node: any
  root: any
  onSelect: (e) => void
}

const NodeTypeMap = {
  Deployment: {
    label: (node) => {
      let text = node.info.codeAddress
      if (node.info.codeAddress != node.info.contextAddress) {
        text += ' @ ' + node.info.contextAddress
      }

      return (
        <div className="whitespace-nowrap">
          <p>🗂️ {node.info.etherscanInfo.ContractName}</p>
          <span className="text-xs">{text}</span>
        </div>
      )
    },
    // widget: (node) => {
    //   if (node.impls.length > 0) {
    //     return (node.impls.map(tree => <ContractTreeNode node={tree} />))
    //   }
    // }
  },
  ContractDefinition: {
    label: (node) => {
      return '📜 ' + node.kind + ' ' + node.name
    },
  },
  FunctionDefinition: {
    label: (node) => {
      if (!node.name) {
        if (node.isConstructor) {
          return <i>🔧🔧 constructor</i>
        }

        if (node.isFallback) {
          return <i>🔧🔧 fallback</i>
        }

        if (node.isReceiveEther) {
          return <i>🔧🔧 receive</i>
        }

        return '*unknown function*'
      }

      return '🔧 function ' + node.name
    },
    widget: (node, root) => {
      if (node.isConstructor) {
        return null
      }

      // TODO: support
      if (node.isFallback || node.isReceiveEther) {
        return null
      }

      const [weiValue, setWeiValue] = useState(0n)
      const [retValue, setRetValue] = useState<string>('')
      // console.log(node)

      function callFunction() {
        console.log('callfunction', node, root)
      }

      return (
        <div className="flex flex-col mx-10 gap-2 text-black-500 p-1">
          {node.parameters.length > 0 &&
            node.parameters.map((param) => {
              const type = param.typeName.name || param.typeName.namePath
              // TODO: set jsx key = address_context_contract_function_param
              return (
                <TextField
                  variant="outlined"
                  label={type + ' ' + (param.name || '')}
                  size="small"
                  onChange={(e) => {
                    setRetValue('demo: ' + e.target.value)
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
          {node.returnParameters &&
            node.returnParameters.length > 0 &&
            node.returnParameters.map((param) => {
              const type = param.typeName.name || param.typeName.namePath
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
            })}
        </div>
      )
    },
  },
  EventDefinition: {
    label: (node) => {
      return '🔔 event ' + node.name
    },
  },
  StructDefinition: {
    label: (node) => {
      return '🏗️ struct ' + node.name
    },
  },
  EnumDefinition: {
    label: (node) => {
      return '📚 enum ' + node.name
    },
  },
  StateVariableDeclaration: {
    label: (node) => {
      // console.log(node)
      return '📦 storage ' + node.variables[0].name
    },
    widget: (node) => {
      const type = node.variables[0].typeName
      if (type.type == 'ElementaryTypeName') {
        return null
      }

      let keyType
      if (type.keyType) {
        keyType = type.keyType.name || type.keyType.namePath
      }

      return <TextField variant="outlined" label={keyType} size="small" />
    },
  },
}

const EmptyMap = {
  emoji: '?',
  className: '',
  label: () => 'N/A',
}

const ContractTreeNode = ({ node, root, onSelect }: ContractTreeNodeProps) => {
  const map = { ...EmptyMap, ...(NodeTypeMap[node.type] || {}) }

  return (
    <TreeItem
      nodeId={node.id}
      key={node.id}
      label={map.label(node.node)}
      onClick={() => onSelect(node)}
    >
      {map.widget && map.widget(node.node, root.node)}
      {node.children.map((child) => (
        <ContractTreeNode root={root} node={child} onSelect={onSelect} />
      ))}
    </TreeItem>
  )
}

export default ContractTreeNode
