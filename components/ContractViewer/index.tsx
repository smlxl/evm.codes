import React, { useState, useEffect, useCallback } from 'react'

import { isValidAddress } from '@ethereumjs/util'
import { TextField } from '@mui/material'
import { useRouter } from 'next/router'
import NoSSR from 'react-no-ssr'

// import { solidityCompiler } from 'util/solc'

import ContractCodeEditor from './ContractCodeEditor'
import { DeploymentInfo, state, useContracts } from './ContractState'
import ContractTreeView from './ContractTreeView'
import Header from './Header'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

const ContractViewer = () => {
  const router = useRouter()

  const { selectedContract, setSelectedContract } = useContracts()

  const [status, setStatus] = useState('Loading...')
  // const [currentAddress, setCurrentAddress] = useState<string>('')
  const [currentCode, setCurrentCode] = useState<string>('')
  const [codePeekLocation, setCodePeekLocation] = useState<any>({})

  // const onCompilationResult = (event: MessageEvent) => {
  //   // TODO:
  //   console.log(event.data)
  // }

  // load solidity compiler
  // useEffect(() => {
  //   solidityCompiler.init()
  // }, [])

  const tryLoadContract = async (
    codeAddress: string,
    contextAddress: string,
  ) => {
    setStatus('Loading...')
    return state
      .loadContract(codeAddress, contextAddress)
      .then(() => {
        const contract = state.contracts[codeAddress]
        // TODO: restore compilation
        // contract.compile(onCompilationResult, ['abi'])

        const impl = contract.etherscanInfo?.Implementation as string
        if (impl) {
          tryLoadContract(impl.toLowerCase(), contextAddress)
        } else {
          setStatus('Loaded')
          setSelectedContract(contract)
          setCurrentCode(contract.code)
        }
      })
      .catch((err) => {
        setStatus('failed to load contract\n' + err)
        throw err
      })
  }

  const updateRoute = () => {
    const query: any = {}
    const addresses = state
      .getProxies()
      .map((c) => c.codeAddress)
      .join(',')
    if (addresses) {
      query.address = addresses
    }

    router.push({ query })
  }

  // TODO: should this be useCallback?
  const tryLoadAddress = useCallback(
    (address: string, invalidateRoute: boolean) => {
      if (!isValidAddress(address)) {
        setStatus('...')
        return
      }

      address = address.toLowerCase()
      if (state.contracts[address]) {
        setStatus('already loaded')
        return
      }

      tryLoadContract(address, address).then(() => {
        if (invalidateRoute) {
          updateRoute()
        }

        setSelectedContract(state.contracts[address])
      })
    },
    [router, tryLoadContract, updateRoute],
  )

  // load contract from url once router is ready
  useEffect(() => {
    if (!router.isReady) {
      return
    }

    const addresses = ((router.query.address as string) || '').split(',')
    // setCurrentAddress(addresses[0])

    for (const addr of addresses) {
      tryLoadAddress(addr, false)
    }
  }, [router.isReady])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    state.onChange.push((codeAddress: string, info: DeploymentInfo) => {
      if (info == selectedContract) {
        // setCurrentAddress('')
        setSelectedContract(undefined)
        setCurrentCode('')
        updateRoute()
        setStatus('')
        return
      }

      // setSelectedContract(contract)
      // setCurrentCode(contract.code)
      setStatus('Reloading...')
      updateRoute()
      setTimeout(() => setStatus(''), 200)
    })
  }, [updateRoute])

  return (
    <NoSSR>
      <div className="dark:bg-black-600 dark:border-black-500 dark:text-gray-100">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full border mt-2 rounded-xl dark:border-gray-600"
          style={{ height: '800px' }}
        >
          <ResizablePanel defaultSize={45}>
            <Header>
              <div className="flex pt-1 gap-2 items-center">
                <TextField
                  size="small"
                  label="address"
                  variant="outlined"
                  className="bg-gray-200 dark:invert w-[350px] font-mono"
                  onInput={(e: any) =>
                    tryLoadAddress(e.target.value.trim(), true)
                  }
                />
                <span
                  className="whitespace-nowrap"
                  onClick={() => {
                    setStatus('✌️ ' + status)
                  }}
                >
                  {status}
                </span>
              </div>
            </Header>
            <ContractTreeView
              deployments={state.getProxies()}
              onSelect={(item, root) => {
                if (!item || !item.node || !item.node.loc) {
                  return
                }

                setCodePeekLocation(item.node.loc.start)

                const contract = root.node.info
                const addr = contract.codeAddress
                const code = state.contracts[addr].code
                if (addr != contract.codeAddress) {
                  // state.selectedAddress = contract.codeAddress
                  setSelectedContract(contract)
                  setCurrentCode(code)
                }
              }}
            />
          </ResizablePanel>

          <ResizableHandle className="dark:border-gray-600" />

          <ResizablePanel>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={90}>
                <Header>
                  <p className="font-semibold">
                    {selectedContract?.etherscanInfo?.ContractName}
                  </p>
                  <span className="text-xs">
                    {selectedContract?.codeAddress}
                  </span>
                </Header>
                <ContractCodeEditor
                  code={currentCode}
                  line={codePeekLocation.line}
                  column={codePeekLocation.column + 1}
                />
              </ResizablePanel>

              <ResizableHandle className="border-2 dark:border-gray-600" />

              <ResizablePanel>
                <div className="h-full py-2 px-4 text-sm flex flex-col gap-2">
                  {selectedContract && (
                    <p>
                      Compiler version:{' '}
                      {selectedContract?.etherscanInfo.CompilerVersion}
                    </p>
                  )}
                  {/* <p>*Additional metadata info should go here*</p> */}
                  {/* TODO: try moving this inside the treeview? */}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </NoSSR>
  )
}

export default ContractViewer
