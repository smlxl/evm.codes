/// new node
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useMemo, useState } from 'react'

import Button from '@mui/material/Button'
import MuiTextField from '@mui/material/TextField'
import { TreeItem } from '@mui/x-tree-view/TreeItem'
import * as AstTypes from '@solidity-parser/parser/src/ast-types'
import { decodeFunctionResult, encodeFunctionData } from 'viem'

import { Artifact, DeploymentInfo, state, rpc } from './ContractState'
import useGenericReducer, { convertShortpath } from './GenericReducer'
import { type AbiComponent, getComponentArraySize, getArrayBaseComponent, getBadgeColor, getTypePrettyName, spaceBetween, initStateFromAbiInputs, initStateFromComponent } from './ViewerUtils'

import { type AbiFunction, type AbiParameter } from 'abitype'

const TextField = ({ ...props }) => {
  return <MuiTextField className="bg-gray-100 dark:invert" {...props} />
}

type SourceItemProps = {
  contract: DeploymentInfo
  children?: any
  onSelect?: (e: any) => void
}

function getFunctionTitle(
  node: AstTypes.FunctionDefinition,
  scope?: AstTypes.ContractDefinition,
) {
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

  const scopeName = scope?.name || ''
  return [scopeName, title, subtitle]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TreeItemLabel = ({ title, subtitle }: any) => {
  return (
    <div className="w-full flex justify-between">
      <span>{title}</span>
      {subtitle && (
        <span className="text-xs pt-1">
          {subtitle
            .split(' ')
            // .slice(0, 3) // TODO: this is just a temp override
            .map((str: string, i: number) => (
              <span
                key={i}
                className={
                  'text-gray-700 ' +
                  getBadgeColor(str) +
                  ' dark:invert rounded-xl px-2 mx-1'
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

const ContractTreeItem = ({ nodeId, title, subtitle, children, ...props }: any) => {
  return (
    <TreeItem
      nodeId={nodeId}
      label={<TreeItemLabel title={title} subtitle={subtitle} />}
      className="border-l border-b dark:border-gray-600"
      onClick={props.onSelect} // IT'S DUMB I KNOW
      {...props}
    >
      {children}
    </TreeItem>
  )
}

// TODO: move to GenericReducer.ts
function getState(state: any, path: string, defaultValue: any) {
  let current = state
  for (const part of path.split('.')) {
    if (!current) {
      break
    }

    current = current[part]
  }

  return current || defaultValue
}

type ArrayParamItemProps = {
  inputAbi: AbiComponent
  path: string
  reducer: any
}

const ArrayParamItem = ({ inputAbi, path, reducer }: ArrayParamItemProps) => {
  const [arrayData, updateArrayData] = reducer
  const arraySize = getComponentArraySize(inputAbi)
  const fields = getState(arrayData, path, new Array(arraySize || 0))

  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500">
        {inputAbi.name} ({inputAbi.internalType}, {fields.length} items)
      </span>

      {fields.map((item: string, index: number) => {
        return (
          <div key={index}>
            <span
              style={{
                position: 'relative',
                top: '12px',
                left: '12px',
                paddingLeft: '8px',
                paddingRight: '8px',
                borderRadius: '10px',
                zIndex: 9999,
              }}
              className="text-red-500 bg-white dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-800"
              onClick={() => {
                fields.splice(index, 1)
                updateArrayData({ [path]: fields })
              }}
            >
              X
            </span>
            <ParamItem
              path={`${path}.${index}`}
              inputAbi={getArrayBaseComponent(inputAbi)}
              reducer={reducer}
            />
          </div>
        )
      })}
      {arraySize === undefined && (
        <Button
          size="small"
          onClick={() => {
            // console.log('init empty component', inputAbi)
            const initVal = initStateFromComponent(inputAbi)
            fields.push(initVal)
            // console.log('initVal', initVal, path, fields)
            updateArrayData({ [path]: fields })
          }}
        >
          + {path}
        </Button>
      )}
    </div>
  )
}

type TupleParamItemProps = {
  inputAbi: AbiParameter & { components: AbiParameter[] }
  path: string
  reducer: any
}

const TupleParamItem = ({ inputAbi, path, reducer }: TupleParamItemProps) => {
  const typeName = inputAbi.internalType || 'tuple'
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500">
        {inputAbi.name} ({typeName}, {inputAbi.components.length} items)
      </span>

      {inputAbi.components.map((component: any, index: number) => {
        return (
          <ParamItem
            key={index}
            inputAbi={component}
            path={`${path}.${index}`}
            reducer={reducer}
          />
        )
      })}
    </div>
  )
}

type ParamItemProps = {
  path: string
  inputAbi: AbiComponent
  reducer: any
  output?: boolean
}

export const ParamItem = ({ path, inputAbi, reducer, output }: ParamItemProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_paramData, updateParamData] = reducer

  // array
  if (inputAbi.type.endsWith(']')) {
    return (
      <div className="border-2 rounded-xl pl-2 py-2 my-1 hover:border-blue-500">
        <ArrayParamItem
          path={path}
          inputAbi={inputAbi}
          reducer={reducer}
        />
      </div>
    )
  }

  if (inputAbi.type == 'tuple') {
    return (
      <div className="border rounded-xl pl-2 py-2 mr-2 hover:border-blue-500">
        <TupleParamItem path={path} inputAbi={inputAbi} reducer={reducer} />
      </div>
    )
  }

  let props
  if (output) {
    props = {
      label: (inputAbi.internalType  || inputAbi.type),
      value: getState(_paramData, path, '').toString(),
    }
  } else {
    props = {
      label: (inputAbi.internalType || inputAbi.type) + ' ' + inputAbi.name,
    }
  }

  return (
    <TextField
      size="small"
      className="border rounded-xl bg-gray-100"
      readOnly={output}
      sx={{ marginTop: '4px', marginBottom: '4px', marginRight: '16px' }}
      onChange={(e: any) => {
        // console.log(`updating ${path)}`)
        if (!output) {
          updateParamData({ [path]: e.target.value })
        }
      }}
      {...props}
    />
  )
}

type ParamsBoxProps = {
  abi: AbiFunction
  reducer: any
}

export const ParamsBox = ({ abi, reducer }: ParamsBoxProps) => {
  const [funcData, updateFuncData] = reducer
  // console.log('ParamsBox funcData', funcData)

  return (
    <div className="flex flex-col gap-2 text-black-500 my-2 -mr-2">
      {abi.inputs && abi.inputs.map((inputAbi: any, i: number) => (
        <ParamItem
          key={i}
          inputAbi={inputAbi}
          path={i.toString()}
          reducer={[
            funcData.params,
            (val: any) => updateFuncData({ params: convertShortpath(val) }),
          ]}
        />
      ))}
      {abi.stateMutability == 'payable' && (
        <TextField
          variant="outlined"
          label="value (wei)"
          size="small"
          type="number"
          onChange={(e: any) => {
            updateFuncData({ value: e.target.value })
          }}
        />
      )}
    </div>
  )
}

type ReturnDataBox = {
  abi: AbiFunction
  reducer: any
}

export const ReturnDataBox = ({ abi, reducer }: ReturnDataBox) => {
  const [funcData, updateFuncData] = reducer
  // console.log('ReturnDataBox funcData', funcData)

  return (
    <div className="flex flex-col gap-2 text-black-500 my-2 -mr-2">
      result:
      {abi.outputs && abi.outputs.map((inputAbi: any, i: number) => (
        <ParamItem
          key={i}
          inputAbi={inputAbi}
          path={i.toString()}
          reducer={[
            funcData.outputs,
            null, // (val: any) => updateFuncData({ outputs: convertShortpath(val) }),
          ]}
          output={true}
        />
      ))}
    </div>
  )
}

type FunctionDefinitionItemProps = {
  contract: DeploymentInfo
  artifact: Artifact<AstTypes.FunctionDefinition>
  onSelect?: (e: any) => void
}

export const FunctionDefinitionItem = ({ contract, artifact, onSelect }: FunctionDefinitionItemProps) => {
  const node = artifact.node

  if (
    node.isConstructor || // TODO: support internal/private :(
    node.visibility == 'internal' ||
    node.visibility == 'private'
  ) {
    return null
  }

  // TODO: support
  if (node.isFallback || node.isReceiveEther) {
    return null
  }

  const [scopeName, title, subtitle] = getFunctionTitle(
    artifact.node,
    artifact.scope,
  )

  // TODO: get funcAbi as param?
  // const funcAbi: AbiFunction = useMemo(() => contract.abi.find((a) => a.name == node.name) || {}, [])
  const funcAbi: AbiFunction = (contract.accessibleAbi ? contract.accessibleAbi.find((a) => a.name == node.name) : {})

  type FuncData = {
    params: any[]
    value: string | number | bigint | undefined
    outputs: any[] | undefined
  }

  // TODO: check why inputs is undefined sometimes
  // console.log('funcAbi inputs', funcAbi.inputs)
  const reducer = useGenericReducer<FuncData>(
    {
      params: initStateFromAbiInputs(funcAbi.inputs || []), //initState,
      value: (node.stateMutability == 'payable' ? '0' : undefined),
      outputs: initStateFromAbiInputs(funcAbi.outputs || []),
    },
    true,
  )
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [funcData, updateFuncData] = reducer

  const [status, setStatus] = useState('')
  // const [weiValue, setWeiValue] = useState(0n)
  // const [retValue, setRetValue] = useState<string | undefined>(undefined)
  // const [retValueDecoded, setRetValueDecoded] = useState<any[]>(
  //   Array(node.parameters.length).fill(''),
  // )
  // const [argValues, setArgValues] = useState(
  //   Array(node.parameters.length).fill(''),
  // )

  function callFunction(encodeOnly = false, useAccessibleAbi = false) {
    let data
    try {
      data = encodeFunctionData({
        abi: (useAccessibleAbi && contract.accessibleAbi ? contract.accessibleAbi : contract.abi),
        functionName: node.name,
        args: funcData.params,
      })

      if (encodeOnly) {
        setStatus('calldata:' + data)
        // setRetValue(data)
        return
      }
    } catch (err: any) {
      if (useAccessibleAbi) {
        console.warn(err)
        setStatus(err.toString())
        // setRetValue('')
        return
      } else {
        return callFunction(encodeOnly, true)
      }
    }

    const props = {
      // TODO: support overrides, eg. from, block, gas, etc.
      to: contract.contextAddress,
      data,
      value: funcData.value,
    }

    // TODO: how to override code from accessibleCode compilation?
    let request
    if (contract.accessibleRuntimeCodeBin) {
      request = rpc
        .request({
          method: 'eth_call',
          params: [
            props,
            'latest',
            {
              [contract.codeAddress]: {
                code: contract.accessibleRuntimeCodeBin,
              }
            },
          ]
        })
        .then((res: any) => {
          // direct requests return raw bytes, need to wrap it
          return { data: res }
        })
    } else {
      request = rpc.call([props, 'latest'])
    }

    request
      .then((res: any, err) => {
        setStatus('return data:' + res.data)
        // setRetValue(res.data as string)
        try {
          const decoded = decodeFunctionResult({
            abi: contract.abi,
            functionName: node.name,
            data: res?.data,
          })
          if (funcAbi.outputs.length == 1) {
            updateFuncData({ outputs: [decoded] })
          } else {
            updateFuncData({ outputs: decoded })
          }
        } catch (err: any) {
          console.warn(err)
          // setRetValueDecoded(Array(node.parameters.length).fill(''))
        }
      })
      .catch((err: any) => {
        setStatus(err.toString())
        // setRetValue('')
      })
  }

  // need a useMemo here?
  // if (
  //   funcAbi.outputs.length > 0 &&
  //   funcAbi.inputs.length == 0 &&
  //   funcData.value === undefined
  // ) {
  //   callFunction()
  // }

  // console.log('out', funcAbi?.outputs?.length)
  // console.log('out', funcData.outputs)

  return (
    <ContractTreeItem
      nodeId={`function_${contract.codeAddress}_${artifact.id}`}
      title={title}
      subtitle={scopeName + ' ' + subtitle}
      onSelect={onSelect}
    >
      <div className="flex flex-col gap-2 text-black-500 my-2 mr-4">
        {funcAbi && <ParamsBox abi={funcAbi} reducer={reducer} />}
        {/* TODO: remove this temp true cond */}
        {(true || funcAbi.inputs.length > 0 ||
          funcAbi.stateMutability == 'payable') && (
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
        {(funcAbi && funcAbi?.outputs?.length > 0) && <ReturnDataBox abi={funcAbi} reducer={reducer} />}
        {status && (
          <input
            type="button"
            className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 text-left whitespace-pre-line break-all text-sm dark:text-gray-100"
            onClick={() =>
              navigator.clipboard.writeText('retValue-was-here' || status)
            }
            value={'📋 ' + status}
          />
        )}
        <p className="text-xs text-gray-500 break-words">
          {spaceBetween('0xretValue-was-here' || '')}
        </p>
      </div>
    </ContractTreeItem>
  )
}

const StateVariableDeclarationItem = ({ contract, artifact }: any) => {
  const innernode = artifact.node as AstTypes.StateVariableDeclarationVariable
  let subtitle = 'storage '
  const var0 = innernode.variables[0]
  const type = var0.typeName
  if (type) {
    if (type.type == 'Mapping') {
      // eslint-disable-next-line prettier/prettier
      subtitle += `mapping (${getTypePrettyName(type.keyType)} => ${getTypePrettyName(type.valueType)})`
    } else {
      subtitle += getTypePrettyName(type)
    }
  } else {
    subtitle += '*unknown type*'
  }

  let type2 = var0.typeName
  if (var0.visibility == 'public') {
    const fakeFuncNode: any = {
      type: 'StateVariableDeclaration',
      name: var0.name,
      parameters: [],
      returnParameters: [],
      visibility: 'public',
    }

    while (type2.keyType) {
      fakeFuncNode.parameters.push({
        typeName: type.keyType,
        name: type.keyName,
      })
      type2 = type2.valueType
    }

    fakeFuncNode.returnParameters.push({
      typeName: type2.name,
      name: var0.name,
    })

    // TODO: FIX NASTY HACK, NOW ITS WORSE BECAUSE IT ALSO SAYS FUNCTION IN THE SUBTITLE..
    return FunctionDefinitionItem({
      contract,
      artifact: {
        id: artifact.id,
        node: fakeFuncNode,
        scope: artifact.scope,
      },
    })
  }

  let indexComps
  if (type.keyType) {
    const keyType = getTypePrettyName(type.keyType)
    indexComps = <TextField variant="outlined" label={keyType} size="small" />
  }

  return (
    <ContractTreeItem
      nodeId={'statevar_' + artifact.id}
      title={var0.name}
      subtitle={subtitle}
    >
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
    </ContractTreeItem>
  )
}

export const SourceItem = ({
  contract,
  onSelect,
  children,
}: SourceItemProps) => {
  const title = (
    <div className="whitespace-nowrap">
      <button
        className="hover:bg-red-100 active:bg-red-300 mr-1"
        onClick={() => {
          if (confirm('Are you sure you want to remove this contract?')) {
            state.removeContract(contract)
          }
        }}
      >
        ❌
      </button>
      <span>{contract.etherscanInfo.ContractName}</span>
      <p className="text-xs">{contract.codeAddress}</p>
    </div>
  )

  const sort = true
  // console.log('len', contract.defTreev2?.storage.length)

  return (
    <ContractTreeItem nodeId={contract.codeAddress} title={title} onSelect={() => onSelect(contract)}>
      <TreeItem nodeId="ti_storage" label="Storage">
        {contract.defTreev2?.storage
          ?.sort(
            (a, b) =>
              sort && (a.node.name || '').localeCompare(b.node.name || ''),
          )
          .map(
            (artifact: Artifact<AstTypes.StateVariableDeclaration>, i: number) =>
              <StateVariableDeclarationItem
                key={'storageitem_' + contract.codeAddress + i}
                contract={contract}
                artifact={artifact}
                onSelect={() => onSelect(contract, artifact)}
              />
          )}
      </TreeItem>

      <TreeItem nodeId="ti_functions" label="Functions">
        {contract.defTreev2?.functions
          ?.sort(
            (a, b) =>
              sort && (a.node.name || '').localeCompare(b.node.name || ''),
          )
          .filter((a: Artifact<AstTypes.FunctionDefinition>) => a.node.body)
          .map(
            (artifact: Artifact<AstTypes.FunctionDefinition>, i: number) =>
              <FunctionDefinitionItem
                key={'funcitem_' + contract.codeAddress + i}
                contract={contract}
                artifact={artifact}
                onSelect={() => onSelect(contract, artifact)}
              />
          )}
      </TreeItem>

      {contract.getImplementations().length > 0 && <TreeItem nodeId="ti_impls" label="Implementations">
        {contract // TODO: this should move inside SourceItem & be recursive
          .getImplementations()
          .map((impl: DeploymentInfo) => (
            <SourceItem
              key={impl.codeAddress}
              contract={impl}
              onSelect={onSelect}
            />
          ))}
        </TreeItem>
      }
    </ContractTreeItem>
  )
}
