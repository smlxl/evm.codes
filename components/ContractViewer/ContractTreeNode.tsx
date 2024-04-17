'use client'

import React, { useState } from 'react'

import Button from '@mui/material/Button'
import MuiTextField from '@mui/material/TextField'
import { TreeItem } from '@mui/x-tree-view/TreeItem'
import type { AbiFunction, AbiParameter } from 'abitype'
import { useRouter } from 'next/router'
import { ContractArtifact } from 'types/ast'
import {
  createWalletClient,
  custom,
  toFunctionSelector,
  decodeFunctionResult,
  encodeFunctionData,
  encodeAbiParameters,
  keccak256,
  encodePacked,
  decodeAbiParameters,
  Hex,
} from 'viem'
import { mainnet } from 'viem/chains'

import { Icon } from 'components/ui'

import { DeploymentInfo, useDeployments } from './DeploymentInfo'
import useGenericReducer, {
  convertShortpath,
  getReducerState,
} from './GenericReducer'
import {
  rpc,
  getComponentArraySize,
  getArrayBaseComponent,
  getBadgeColor,
  spaceBetween,
  initStateFromAbiInputs,
  initStateFromComponent,
} from './ViewerUtils'
import type { AbiComponent } from './ViewerUtils'

const TextField = ({ ...props }) => {
  return (
    <MuiTextField
      autoComplete="off"
      className="bg-gray-100 dark:invert"
      {...props}
    />
  )
}

const TreeItemLabel = ({ title, subtitle }: any) => {
  return (
    <div className="w-full flex justify-between">
      <span>{title}</span>
      {subtitle && (
        <span className="text-xs pt-1">
          {subtitle.split(' ').map((str: string, i: number) => (
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

const TreeItemBasic = ({
  nodeId,
  title,
  subtitle,
  children,
  ...props
}: any) => {
  return (
    <TreeItem
      nodeId={nodeId}
      label={<TreeItemLabel title={title} subtitle={subtitle} />}
      className="border-l border-b dark:border-gray-600"
      onClick={props.onSelect} // IT'S DUMB I KNOW (instead of doing onClick=onSelect should probably replace the treeview component with a more friendly version of it...)
      {...props}
    >
      {children}
    </TreeItem>
  )
}

type FuncData = {
  params: any[]
  value: string
  outputs: any[]
}

type ArrayParamItemProps = {
  inputAbi: AbiComponent
  path: string
  reducer: any
}

const ArrayParamItem = ({ inputAbi, path, reducer }: ArrayParamItemProps) => {
  const [arrayData, updateArrayData] = reducer
  const arraySize = getComponentArraySize(inputAbi)

  const fields = getReducerState(arrayData, path, new Array(arraySize || 0))

  return (
    <>
      <span className="text-xs text-gray-500 bg-white dark:bg-black-900">
        array {inputAbi.internalType?.replace(/^struct /, '')} {inputAbi.name} (
        {arraySize !== undefined ? 'fixed ' : ''}
        {fields.length} items)
      </span>

      <div className="flex flex-col p-2">
        {fields.map((item: string, index: number) => {
          return (
            <div key={index}>
              {/* x button on top-left of border */}
              <input
                type="button"
                style={{
                  position: 'relative',
                  top: '12px',
                  left: '12px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  borderRadius: '20px',
                  zIndex: 9999,
                }}
                className="text-red-500 bg-white dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-800"
                onClick={() => {
                  fields.splice(index, 1)
                  updateArrayData({ [path]: fields })
                }}
                value="X"
              />
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
            style={{ border: '1px solid' }}
            size="small"
            onClick={() => {
              const initVal = initStateFromComponent(
                getArrayBaseComponent(inputAbi),
              )
              fields.push(initVal)
              updateArrayData({ [path]: fields })
            }}
          >
            + {path}
          </Button>
        )}
      </div>
    </>
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
    <div className="flex flex-col p-2">
      <span className="text-xs text-gray-500">
        {typeName} {inputAbi.name}
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

export const ParamItem = ({
  path,
  inputAbi,
  reducer,
  output,
}: ParamItemProps) => {
  // array
  if (inputAbi.type.endsWith(']')) {
    return (
      <div className="border-2 rounded-xl pl-2 py-2 my-1 hover:border-blue-500">
        <ArrayParamItem path={path} inputAbi={inputAbi} reducer={reducer} />
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

  const [paramData, updateParamData] = reducer
  const val = getReducerState(paramData, path, '')

  let error = false
  if (val.toString().length > 0) {
    try {
      encodeAbiParameters([inputAbi], [val])
    } catch (err: any) {
      error = true
    }
  }

  let props
  if (output) {
    props = {
      label: (inputAbi.internalType || inputAbi.type) + ' ' + inputAbi.name,
      value: val.toString(),
    }
  } else {
    props = {
      label: (inputAbi.internalType || inputAbi.type) + ' ' + inputAbi.name,
    }
  }

  return (
    <TextField
      size="small"
      readOnly={output}
      error={error}
      sx={{ marginTop: '4px', marginBottom: '4px', marginRight: '16px' }}
      onChange={(e: any) => {
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

  return (
    <div className="flex flex-col gap-2 text-black-500 my-2 -mr-2">
      {abi.inputs?.map((inputAbi: any, i: number) => (
        <ParamItem
          key={i}
          inputAbi={inputAbi}
          path={i.toString()}
          // reducer={params}
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
  const [funcData] = reducer

  return (
    <div className="flex flex-col gap-2 text-black-500 my-2 -mr-2">
      <span className="dark:text-gray-200">result:</span>
      {abi.outputs?.map((inputAbi: any, i: number) => (
        <ParamItem
          key={i}
          inputAbi={inputAbi}
          path={i.toString()}
          reducer={[funcData.outputs, null]}
          output={true}
        />
      ))}
    </div>
  )
}

type FunctionAbiItemProps = {
  id: string
  address: string
  funcAbi: AbiFunction
}

export const FunctionAbiItem = ({
  id,
  address,
  funcAbi,
}: FunctionAbiItemProps) => {
  const funcName = funcAbi.name
  let subtitle = `${funcAbi.type}`
  if (funcAbi.stateMutability == 'payable') {
    subtitle += ' payable'
  }

  const reducer = useGenericReducer<FuncData>(
    {
      params: initStateFromAbiInputs(funcAbi.inputs || []), //initState,
      value: funcAbi.stateMutability == 'payable' ? '0' : undefined,
      outputs: initStateFromAbiInputs(funcAbi.outputs || []),
    },
    true,
  )

  const [funcData, updateFuncData] = reducer
  const [status, setStatus] = useState('')

  const encodeCalldata = () => {
    let data, error
    try {
      data = encodeFunctionData({
        abi: [funcAbi],
        args: funcData.params,
      })
    } catch (err: any) {
      error = err
    }

    return [data, error]
  }

  const ethCall = (data: string) => {
    const props = {
      // TODO: support overrides, eg. from, block, gas, etc.
      to: address,
      data,
      value: funcData.value,
    }

    return rpc.call(props as any).then((res: any) => {
      let decoded = decodeFunctionResult({
        abi: [funcAbi],
        data: res.data,
      })

      if (funcAbi.outputs.length == 1) {
        decoded = [decoded]
      }

      return decoded.map((val: any) => val.toString())
    })
  }

  const ethSendTransaction = () => {
    const [data, error] = encodeCalldata()
    if (error) {
      setStatus(error.toString())
      updateFuncData({ outputs: [] })
      return
    }

    const walletClient = createWalletClient({
      chain: mainnet,
      transport: custom((window as any).ethereum),
    })

    return walletClient
      .requestAddresses()
      .then((addresses: any) => {
        const props = {
          // TODO: support overrides, eg. from, block, gas, etc.
          account: addresses[0],
          to: address,
          data,
          value: funcData.value,
        }

        return walletClient.sendTransaction(props as any).then((res: any) => {
          let decoded = decodeFunctionResult({
            abi: [funcAbi],
            data: res.data,
          })

          if (funcAbi.outputs.length == 1) {
            decoded = [decoded]
          }

          return decoded.map((val: any) => val.toString())
        })
      })
      .catch((err: any) => {
        setStatus(err.toString())
      })
  }

  const setCallStatus = () => {
    const [data, error] = encodeCalldata()
    if (error) {
      setStatus(error.toString())
      updateFuncData({ outputs: [] })
      return
    }

    ethCall(data)
      .then((decoded: any) => {
        setStatus('')
        updateFuncData({ outputs: decoded })
      })
      .catch((err: any) => {
        setStatus(err.toString())
        updateFuncData({ outputs: [] })
      })
  }

  const setEncodeStatus = () => {
    const [data, error] = encodeCalldata()
    setStatus('calldata: ' + (data || error))
  }

  return (
    <TreeItemBasic
      nodeId={`function_${id}_${funcAbi.name}`}
      title={funcName}
      subtitle={subtitle}
    >
      <div className="flex flex-col gap-2 text-black-500 my-2 mr-4">
        <span className="text-xs dark:text-gray-200">
          4byte selector: {toFunctionSelector(funcAbi)}
        </span>
        {funcAbi && <ParamsBox abi={funcAbi} reducer={reducer} />}
        <div className="flex gap-1">
          <Button onClick={setCallStatus} variant="contained">
            {funcAbi?.outputs?.length > 0 ? 'Call' : 'Call (no ret)'}
          </Button>
          <Button onClick={setEncodeStatus} variant="contained">
            Encode
          </Button>
          <Button
            onClick={ethSendTransaction}
            variant="contained"
            color="secondary"
          >
            Send
          </Button>
        </div>
        {funcAbi && funcAbi?.outputs?.length > 0 && (
          <ReturnDataBox abi={funcAbi} reducer={reducer} />
        )}
        {status && (
          <input
            type="button"
            className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 text-left whitespace-pre-line break-all text-sm dark:text-gray-100"
            onClick={() => navigator.clipboard.writeText(status)}
            value={'📋 copy'}
          />
        )}
        <p className="text-xs text-gray-500 break-words">
          {spaceBetween(status || '')}
        </p>
      </div>
    </TreeItemBasic>
  )
}

type StorageLayoutItemProps = {
  id: string
  address: string
  storage: {
    astId: number
    label: string
    contract: string
    offset: number
    slot: any
    type: string
  }
  types: {
    [type: string]: {
      key: string
      encoding: string
      label: string
      numberOfBytes: string
      value: string
    }
  }
}

export const StorageLayoutItem = ({
  id,
  address,
  storage,
  types,
}: StorageLayoutItemProps) => {
  const [status, setStatus] = useState('0x...')
  const [inputs, setInputs] = useState<string[]>([])

  const type = types[storage.type]

  // if storage item is a mapping, keyTypes is an array of types of all mapping keys
  // eg. keys of mapping(address => mapping(uint256 => bytes)) would be ['address', 'uint256']
  const keyTypes = [
    ...(storage.type.matchAll(/\bt_mapping\((?<key>.+?),/g) || []),
  ].map((m) => m?.groups?.key)

  const ethGetStorage = () => {
    let slot = storage.slot
    for (let i = 0; i < keyTypes.length; i++) {
      const key = inputs[i]
      slot = keccak256(
        encodePacked(['uint256', 'uint256'], [BigInt(key), slot]),
      )
    }

    const props = {
      address,
      slot,
    }

    return rpc.getStorageAt(props as any).then((res: any) => {
      let input: string = res.toString().slice(2)
      if (storage.offset || type.numberOfBytes != '32') {
        input = input.slice(
          storage.offset * 2,
          (storage.offset + parseInt(type.numberOfBytes)) * 2,
        )
      }

      input = '0x' + input
      try {
        let val = decodeAbiParameters(
          [{ type: type.label }],
          input as Hex,
        ).toString()
        if (slot != storage.slot) {
          val += ` (mapped slot: ${slot})`
        }

        setStatus(val)
      } catch (err) {
        console.log(err)
      }
    })
  }

  return (
    <TreeItemBasic
      nodeId={`storageitem_${id}`}
      title={storage.label}
      subtitle={type.label.replace(/ /g, '')}
    >
      <div className="flex flex-col gap-2 text-black-500 my-2 mr-4">
        <span className="text-xs dark:text-gray-200">
          base slot: {storage.slot}, offset: {storage.offset}, size:{' '}
          {type?.numberOfBytes} bytes
          <br />
          {status}
        </span>
        {keyTypes.map((keyType, i: number) => (
          <TextField
            key={i}
            size="small"
            label={types[keyType as string].label}
            onChange={(e: any) => {
              inputs[i] = e.target.value
              setInputs([...inputs])
            }}
          />
        ))}
        <Button onClick={ethGetStorage} variant="outlined">
          Read
        </Button>
      </div>
    </TreeItemBasic>
  )
}

type DeploymentItemProps = {
  deployment: DeploymentInfo
  children?: any
  onSelect: (deployment: DeploymentInfo, artifact?: ContractArtifact) => void
}

export const DeploymentItem = ({
  deployment,
  onSelect,
}: DeploymentItemProps) => {
  const router = useRouter()
  const { loadDeployment, removeDeployment } = useDeployments(router)
  const implementations = deployment.getImplementations()

  const title = (
    <div className="whitespace-nowrap">
      <button
        type="button"
        value=""
        className="ri-close-large-line mr-1"
        onClick={() => {
          if (confirm('Are you sure you want to remove this contract?')) {
            removeDeployment(deployment)
          }
        }}
      >
        <Icon
          size="sm"
          name="close-large-line"
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        />
      </button>
      <span>{deployment.etherscanInfo.ContractName}</span>
      <p className="text-xs">
        {deployment.address}
        {deployment.context ? ' @ ' + deployment.rootContext().address : ''}
      </p>
    </div>
  )

  return (
    <TreeItemBasic
      nodeId={'deployment_' + deployment.id}
      title={title}
      onSelect={() => onSelect(deployment)}
    >
      <TreeItem
        nodeId={'ti_compiler_' + deployment.id}
        label={'Compiler: ' + deployment.etherscanInfo?.CompilerVersion}
      />

      {deployment.storageLayout && (
        <TreeItem nodeId={'ti_storage_' + deployment.id} label="Storage">
          {deployment.storageLayout.storage.map((storage: any, i: number) => (
            <StorageLayoutItem
              key={i}
              id={storage.astId.toString()}
              address={deployment.rootContext().address}
              storage={storage}
              types={deployment.storageLayout.types}
            />
          ))}
        </TreeItem>
      )}

      <TreeItem nodeId={'ti_functions_' + deployment.id} label="Functions">
        {deployment.abi
          .filter((a) => a.type == 'function')
          .map((funcAbi, i: number) => (
            <FunctionAbiItem
              key={i}
              id={i.toString()}
              address={deployment.rootContext().address}
              funcAbi={funcAbi as AbiFunction}
            />
          ))}
      </TreeItem>

      <TreeItem
        nodeId={'ti_impls_' + deployment.id}
        label={
          <span>
            Implementations
            <button
              className="mx-2 rounded-xl"
              onClick={() => {
                const addr = prompt('address')
                if (addr) {
                  loadDeployment(addr, deployment)
                }
              }}
            >
              <Icon
                size="sm"
                name="add-fill"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              />
            </button>
          </span>
        }
      >
        {implementations?.map((impl: DeploymentInfo) => (
          <DeploymentItem
            key={'impl_' + deployment.address + '_' + impl.address}
            deployment={impl}
            onSelect={onSelect}
          />
        ))}
      </TreeItem>
    </TreeItemBasic>
  )
}
