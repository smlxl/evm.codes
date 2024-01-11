import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { TreeItem } from '@mui/x-tree-view/TreeItem';
import TextField from '@mui/material/TextField';


import { ASTNode } from '@solidity-parser/parser/src/ast-types'
import { useState } from 'react';
import { state } from './ContractState'

type ContractTreeNodeProps = {
  node: ASTNode
  onclick?: (e) => void
}

const NodeTypeMap = {
  'Deployment': {
    emoji: '🗂️',
    // className: 'text-purple-600',
    label: (node) => {
      let text = node.codeAddress
      if (node.codeAddress != node.contextAddress)
        text += ' @ ' + node.contextAddress

      return (
        <div className="whitespace-nowrap">
          <p>🗂️ {node.name}</p>
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
  'ContractDefinition': {
    emoji: '📜',
    // className: 'text-purple-600',
    label: (node) => {
      return '📜 ' + node.kind + ' ' + node.name
    }
  },
  'FunctionDefinition': {
    emoji: '🔧',
    // className: 'text-green-600',
    label: (node) => {
      if (!node.name) {
        if (node.isConstructor)
          return (<i>🔧🔧 constructor</i>)
        
        if (node.isFallback)
          return (<i>🔧🔧 fallback</i>)
        
        if (node.isReceiveEther)
          return (<i>🔧🔧 receive</i>)
        
        return '*unknown function*'
      }

      return '🔧 function ' + node.name
    },
    widget: (node, root) => {
      if (node.isConstructor)
        return null

      // TODO: support
      if (node.isFallback || node.isReceiveEther)
        return null

      let [weiValue, setWeiValue] = useState(0n)
      let [retValue, setRetValue] = useState(null)
      // console.log(node)

      function callFunction() {
        console.log('callfunction', node, root)
      }

      return (
        <div className="flex flex-col mx-10 gap-2 text-black-500 p-1">
          {node.parameters.length > 0 && node.parameters.map((param) => {
            let type = param.typeName.name || param.typeName.namePath
            return (
              <TextField variant="outlined" label={type + ' ' + (param.name || "")} size="small" onChange={(e)=>{setRetValue('demo: ' + e.target.value)}} />
            )
          })}
          {
            node.stateMutability == 'payable' && (
              <TextField variant="outlined" label="value (wei)" size="small" onChange={(e)=>{setWeiValue(BigInt(e.target.value))}} />
          )}
          <Button onClick={callFunction} variant="contained">Call</Button>
          {node.returnParameters && node.returnParameters.length > 0 && node.returnParameters.map((param) => {
            let type = param.typeName.name || param.typeName.namePath
            return (
              <>
                <hr />
                <TextField variant="filled" label={type + ' ' + (param.name || "")} value={retValue} size="small" />
              </>
            )
          })}
        </div>
        )
    }
  },
  'EventDefinition': {
    emoji: '🔔',
    // className: 'text-red-600',
    label: (node) => {
      return '🔔 event ' + node.name
    }
  },
  'StructDefinition': {
    emoji: '🏗️',
    // className: 'text-blue-600',
    label: (node) => {
      return '🏗️ struct ' + node.name
    }
  },
  'EnumDefinition': {
    emoji: '📚',
    // className: 'text-blue-600',
    label: (node) => {
      return '📚 enum ' + node.name
    }
  },
  'StateVariableDeclaration': {
    emoji: '📦',
    // className: 'text-orange-500',
    label: (node) => {
      // console.log(node)
      return '📦 storage ' + node.variables[0].name
    },
    widget: (node, parent) => {
      let type = node.variables[0].typeName
      if (type.type == 'ElementaryTypeName')
        return (null)

      let keyType
      if (type.keyType) {
        keyType = type.keyType.name ||  type.keyType.namePath
      }

      return (
        <TextField variant="outlined" label={keyType} size="small" />
      )
    }
  }
}

const EmptyMap = {
  emoji: '?',
  className: '',
  label: (node) => 'N/A',
}

const ContractTreeNode = ({
      node,
      root,
      onSelect
    }: ContractTreeNodeProps
  ) => {
  let map = { ...EmptyMap, ...(NodeTypeMap[node.type] || {}) }

  return (
    <TreeItem nodeId={node.id} key={node.id} label={map.label(node.node)} onClick={(e) => onSelect(node)}>
      {map.widget && map.widget(node.node, root.node)}
      {node.children.map((child) => (
        <ContractTreeNode root={root} node={child} onSelect={onSelect} />
      ))}
    </TreeItem>
  )
}

export default ContractTreeNode
