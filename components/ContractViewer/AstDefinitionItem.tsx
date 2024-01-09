import Box from '@mui/material/Box';

import { TreeItem } from '@mui/x-tree-view/TreeItem';
import TextField from '@mui/material/TextField';


import { ASTNode } from '@solidity-parser/parser/src/ast-types'
import { useState } from 'react';
import { state } from './ContractState'

type AstDefinitionProps = {
  id: string
  node: ASTNode
  onclick?: (e) => void
  children?: React.ReactNode
}

const KindMap = {
  interface: {
    emoji: '🧬', // 📎
  },
  library: {
    emoji: '🏛️',
  },
  contract: {
    emoji: '📜',
  },
  abstract: {
    emoji: '🗿',
  },
  function: {
    className: 'text-green-600',
    emoji: '🔢', // 🕹️
  },
  constructor: {
    emoji: '0️⃣',
  },
  fallback: {
    emoji: '🍂',
  },
  receive: {
    emoji: '📥',
  },
  modifier: {
    emoji: '🔧',
  },
  event: {
    emoji: '🔔', // 💡
  },
  enum: {
    emoji: '#️⃣',
  },
  struct: {
    className: 'text-blue-600',
    emoji: '🏗️', // 🚥
  },
  mapping: { 
    emoji: '🗺️',
  },
  array: {
    emoji: '📚',
  }
}

const NodeTypeMap = {
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
    widget: (node) => {
      if (node.isConstructor)
        return null

      let [weiValue, setWeiValue] = useState(0n)
      let [retValue, setRetValue] = useState('<ret val here>')
      console.log(node)

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
          {node.returnParameters && node.returnParameters.length > 0 && node.returnParameters.map((param) => {
            let type = param.typeName.name || param.typeName.namePath
            return (
              <>
                <hr />
                <TextField variant="outlined" label={type + ' ' + (param.name || "")} value={retValue} size="small" />
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
  },
  // 'EnumDefinition': '🔢',
  // 'EnumValue': '🔢',
  // 'ModifierDefinition': '🔧',
  // 'VariableDeclaration': '📦',
  // 'InheritanceSpecifier': '🧬',
  // 'UsingForDirective': '🔧',
  // 'ArrayTypeName': '📚',
  // 'Mapping': '🗺️',
  // 'ElementaryTypeName': '📚',
  // 'UserDefinedTypeName': '📚',
  // 'Block': '🧱',
  // 'ExpressionStatement': '📝',
  // 'IfStatement': '🔀',
  // 'WhileStatement': '🔁',
  // 'ForStatement': '🔁',
  // 'DoWhileStatement': '🔁',
  // 'ContinueStatement': '⏩',
  // 'BreakStatement': '⏹️',
  // 'ReturnStatement': '🔙',
  // 'EmitStatement': '📢',
  // 'ThrowStatement': '🤷',
  // 'VariableDeclarationStatement': '📦',
  // 'ElementaryTypeNameExpression': '📚',
  // 'BinaryOperation': '🔁',
  // 'Conditional': '🔀',
  // 'IndexAccess': '📚',
  // 'MemberAccess': '📚',
  // 'FunctionCall': '📞',
  // 'NewExpression': '🆕',
  // 'TupleExpression': '📦',
  // 'UnaryOperation': '🔁',
  // 'Identifier': '🆔',
  // 'Literal': '🔤',
  // 'InlineAssembly': '🏭',
  // 'PlaceholderStatement': '📝',
  // 'YulBlock': '🧱'
}

const EmptyMap = {
  emoji: '?',
  className: '',
  label: (node) => 'N/A',
}

const AstDefinitionItem = ({
      id,
      node,
      onclick,
      children,
      ...props
    }: AstDefinitionProps
  ) => {
  // let { className, emoji } = KindMap[kind] || { emoji: '', className: '' }
  let map = { ...EmptyMap, ...(NodeTypeMap[node.type] || {}) }

  return (
    <TreeItem nodeId={id} key={id} label={map.label(node)} onClick={onclick} className={map.className} {...props}>
      {map.widget ? map.widget(node, children) : children}
    </TreeItem>
  )
}

export default AstDefinitionItem
