/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable jsx-a11y/accessible-emoji */
import { Key, useState } from 'react'

import Button from '@mui/material/Button'
import MuiTextField from '@mui/material/TextField'
import { TreeItem } from '@mui/x-tree-view/TreeItem'
import { decodeFunctionResult, encodeFunctionData } from 'viem'

import { ContractInfo, state, rpc } from './ContractState'

const TextField = ({ ...props }) => {
  return <MuiTextField className="bg-gray-100 dark:invert" {...props} />
}

type ContractTreeNodeProps = {
  contract: ContractInfo
  node: any
  root: any
  children?: any
  onSelect: (e: any) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NodeItem = ({ title, subtitle, emoji }: any) => {
  const getBadgeColor = (str: string) => {
    const colors = ['red', 'green', 'blue', 'purple', 'pink']
    const hash = str.charCodeAt(0) + str.charCodeAt(str.length - 1)
    return colors[hash % colors.length]
  }

  return (
    <div className="w-full flex justify-between">
      {/* <p>
        {emoji} {title}
      </p> */}
      <span>{title}</span>
      {subtitle && (
        <span className="text-xs">
          {subtitle
            .split(' ')
            .slice(0, 2) // TODO: this is just a temp override
            .map((str: string) => (
              // eslint-disable-next-line react/jsx-key
              <span
                className={
                  'text-gray-700 bg-' +
                  getBadgeColor(str) +
                  '-300 dark:invert rounded-xl px-2 mx-1'
                }
              >
                {str}
              </span>
            ))}
        </span>
      )}
    </div>
  )
}

function getType(type: any): string {
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

  return (type?.name || type?.namePath).split(' ')[0]
}

function spaceBetween(str: string, pad = 16) {
  if (!str) {
    return ''
  }

  return str
    .slice(2)
    .split('')
    .reverse()
    .map((c, i) => (i % pad ? c : c + ' '))
    .reverse()
    .join('')
}

const NodeTypeMap = {
  Deployment: {
    label: (_contract: any, node: { info: ContractInfo }) => {
      const text = node.info.codeAddress

      return (
        <div className="whitespace-nowrap">
          <button
            className="hover:bg-red-100"
            onClick={() => {
              if (confirm('Are you sure you want to remove this contract?')) {
                state.removeContract(node.info)
              }
            }}
          >
            ❌
          </button>
          <span>{node.info.etherscanInfo.ContractName}</span>
          <p className="text-xs">{text}</p>
        </div>
      )
    },
  },
  ContractDefinition: {
    label: (_contract: ContractInfo, node: { name: any; kind: any }) => {
      return <NodeItem title={node.name} subtitle={node.kind} emoji="📜" />
    },
  },
  FunctionDefinition: {
    label: (_contract: any, node: any) => {
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
    widget: (contract: ContractInfo, node: any, root: any) => {
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

      const [status, setStatus] = useState('')
      const [weiValue, setWeiValue] = useState(0n)
      const [retValue, setRetValue] = useState<string | undefined>(undefined)
      const [retValueDecoded, setRetValueDecoded] = useState<any[]>([])
      const [argValues, setArgValues] = useState(Array(node.parameters.length))

      function callFunction(encodeOnly = false) {
        let data
        try {
          data = encodeFunctionData({
            abi: contract.abi,
            functionName: node.name,
            args: argValues,
          })

          if (encodeOnly) {
            setStatus('calldata:')
            setRetValue(data)
            return
          }
        } catch (err: any) {
          setStatus(err.toString())
          setRetValue('')
          return
        }

        rpc
          .call({
            // TODO: support overrides, eg. from, block, gas, etc.
            to: root.info.contextAddress,
            data,
            value: weiValue,
          })
          .then((res: any) => {
            setStatus('return data:')
            setRetValue(res.data as string)
            try {
              const decoded = decodeFunctionResult({
                abi: contract.abi,
                functionName: node.name,
                data: res?.data,
              })
              if (Array.isArray(decoded)) {
                setRetValueDecoded(decoded)
              } else {
                setRetValueDecoded([decoded])
              }
            } catch (err: any) {
              console.warn(err)
              setRetValueDecoded([])
            }
          })
          .catch((err: any) => {
            setStatus(err.toString())
            setRetValue('')
          })
      }

      if (
        node.returnParameters &&
        node.parameters.length == 0 &&
        retValue === undefined
      ) {
        callFunction()
      }

      return (
        <div className="flex flex-col gap-2 text-black-500">
          {node.parameters.length > 0 &&
            node.parameters.map((param: any, i: number) => {
              const type = getType(param.typeName)
              return (
                <TextField
                  key={contract.codeAddress + node.name + i}
                  variant="outlined"
                  label={type + ' ' + (param.name || '')}
                  size="small"
                  onChange={(e: any) => {
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
              onChange={(e: any) => {
                setWeiValue(BigInt(e.target.value))
              }}
            />
          )}
          {(node.parameters.length > 0 ||
            node.stateMutability == 'payable') && (
            <div className="flex gap-1">
              <Button onClick={() => callFunction(false)} variant="contained">
                {!node.returnParameters || node.returnParameters.length == 0
                  ? 'Call (?)'
                  : 'Call'}
              </Button>
              <Button onClick={() => callFunction(true)} variant="contained">
                Encode
              </Button>
            </div>
          )}
          {node.returnParameters &&
            node.returnParameters.length > 0 &&
            node.returnParameters.map((param: any, i: number) => {
              const type = getType(param.typeName)
              return (
                <>
                  <hr />
                  <TextField
                    variant="filled"
                    label={type + ' ' + (param.name || '')}
                    value={retValueDecoded[i] + ''}
                    size="small"
                  />
                </>
              )
            })}
          {status && (
            <input
              type="button"
              className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 text-left whitespace-pre-line break-all text-sm dark:text-gray-100"
              onClick={() => navigator.clipboard.writeText(retValue || status)}
              value={'📋 ' + status}
            />
          )}
          <p className="text-xs text-gray-500 break-words">
            {spaceBetween(retValue || '')}
          </p>
        </div>
      )
    },
  },
  EventDefinition: {
    label: (_contract: any, node: { parameters: any[]; name: any }) => {
      let subtitle = 'event'
      const params = node.parameters
        .map((p: { typeName: { name: any } }) => p.typeName.name)
        .join(' ')
      if (params) {
        subtitle += ' ' + params
      }

      return <NodeItem emoji="🔔" title={node.name} subtitle={subtitle} />
    },
  },
  StructDefinition: {
    label: (_contract: any, node: { name: any }) => {
      return <NodeItem title={node.name} subtitle="struct" emoji="🏗️" />
    },
  },
  EnumDefinition: {
    label: (_contract: any, node: { name: any }) => {
      return <NodeItem title={node.name} subtitle="enum" emoji="📚" />
    },
  },
  StateVariableDeclaration: {
    label: (_contract: any, node: { variables: any[] }) => {
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
    widget: (contract: any, node: { variables: any[] }, root: any) => {
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
          <p className="text-xs">
            <i>not yet implemented, can the devs do something?</i>
          </p>
          <p>
            &gt;&gt; view on{' '}
            <u>
              <a
                target="_blank"
                href={`https://evm.storage/eth/latest/${contract.contextAddress}#map`}
                rel="noreferrer"
              >
                evm.storage
              </a>
            </u>
          </p>
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
  const _m = (NodeTypeMap as any)[node.type as string]
  const map = {
    ...EmptyMap,
    ...(_m || {}),
  }

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
      className="border-l border-b dark:border-gray-600"
      {...icons}
    >
      {widget && <div className="p-2">{widget}</div>}
      {node.children.map((child: { id: Key | null | undefined }) => (
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
