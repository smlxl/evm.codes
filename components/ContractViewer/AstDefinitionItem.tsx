import { TreeItem } from '@mui/x-tree-view/TreeItem';

type AstDefinitionProps = {
  id: string
  name: string
  kind?: string
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

const NodeTypeEmoji = {
  'FunctionDefinition': '📜',
  'ModifierDefinition': '🔧',
  'VariableDeclaration': '📦',
  'EventDefinition': '🔔',
  'StructDefinition': '🏗️',
  'EnumDefinition': '🔢',
  'EnumValue': '🔢',
  'ContractDefinition': '🏢',
  'InheritanceSpecifier': '🧬',
  'UsingForDirective': '🔧',
  'ArrayTypeName': '📚',
  'Mapping': '🗺️',
  'ElementaryTypeName': '📚',
  'UserDefinedTypeName': '📚',
  'Block': '🧱',
  'ExpressionStatement': '📝',
  'IfStatement': '🔀',
  'WhileStatement': '🔁',
  'ForStatement': '🔁',
  'DoWhileStatement': '🔁',
  'ContinueStatement': '⏩',
  'BreakStatement': '⏹️',
  'ReturnStatement': '🔙',
  'EmitStatement': '📢',
  'ThrowStatement': '🤷',
  'VariableDeclarationStatement': '📦',
  'ElementaryTypeNameExpression': '📚',
  'BinaryOperation': '🔁',
  'Conditional': '🔀',
  'IndexAccess': '📚',
  'MemberAccess': '📚',
  'FunctionCall': '📞',
  'NewExpression': '🆕',
  'TupleExpression': '📦',
  'UnaryOperation': '🔁',
  'Identifier': '🆔',
  'Literal': '🔤',
  'InlineAssembly': '🏭',
  'PlaceholderStatement': '📝',
  'YulBlock': '🧱'
}

const AstDefinitionItem = ({
      id,
      name,
      kind,
      onclick,
      children,
      ...props
    }: AstDefinitionProps
  ) => {
  let { className, emoji } = KindMap[kind] || { emoji: '', className: '' }

  return (
    <TreeItem nodeId={id} key={id} label={emoji + name} onClick={onclick} className={className} {...props}>
      {children}
    </TreeItem>
  )
}

export default AstDefinitionItem
