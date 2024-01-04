import { TreeItem } from '@mui/x-tree-view/TreeItem';

import { ASTNode } from '@solidity-parser/parser/src/ast-types'

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
    className: 'text-green-700',
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
    className: 'text-blue-700',
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
    className: 'text-purple-700',
    text: (node) => {
      return node.kind + ' ' + node.name
    }
  },
  'FunctionDefinition': {
    emoji: '🔧',
    className: 'text-green-700',
    text: (node) => {
      if (!node.name) {
        if (node.isConstructor)
          return '[fn] constructor'
        
        if (node.isFallback)
          return '[fn] fallback'
        
        if (node.isReceiveEther)
          return '[fn] receive'
        
        return '*unknown function*'
      }

      return 'function ' + node.name
    }
  },
  'EventDefinition': {
    emoji: '🔔',
    className: 'text-red-700',
    text: (node) => {
      return 'event ' + node.name
    }
  },
  'StructDefinition': {
    emoji: '🏗️',
    className: 'text-blue-700',
    text: (node) => {
      return 'struct ' + node.name
    }
  },
  'StateVariableDeclaration': {
    emoji: '📦',
    className: 'text-orange-400',
    text: (node) => {
      return 'storage ' + node.variables[0].name
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
  className: 'text-gray-600',
  text: (node) => 'N/A',
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
  let map = NodeTypeMap[node.type] || EmptyMap

  return (
    <TreeItem nodeId={id} key={id} label={map.emoji + map.text(node)} onClick={onclick} className={map.className} {...props}>
      {children}
    </TreeItem>
  )
}

export default AstDefinitionItem
