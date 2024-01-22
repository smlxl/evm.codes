import React, { useState, useEffect, useCallback } from 'react'

import { isValidAddress } from '@ethereumjs/util'
import { TextField } from '@mui/material'
import { useRouter } from 'next/router'
import NoSSR from 'react-no-ssr'

import { solidityCompiler } from 'util/solc'

import ContractCodeEditor from './ContractCodeEditor'
import { ContractInfo, state } from './ContractState'
import ContractTreeView from './ContractTreeView'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

const ContractViewer = () => {
  const router = useRouter()

  const [status, setStatus] = useState('Loading...')
  const [currentAddress, setCurrentAddress] = useState<string>('')
  const [currentCode, setCurrentCode] = useState<string>('')
  const [codePeekLocation, setCodePeekLocation] = useState<any>({})

  // const onCompilationResult = (event: MessageEvent) => {
  //   // TODO:
  //   console.log(event.data)
  // }

  // load solidity compiler
  useEffect(() => {
    solidityCompiler.init()
  }, [])

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
          setStatus('✌️ Loaded')
          setCurrentAddress(contract.codeAddress)
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

        setCurrentAddress(address)
      })
    },
    [router, tryLoadContract, updateRoute],
  )

  // load contract from url once everything is ready
  useEffect(() => {
    if (!router.isReady) {
      return
    }

    const addresses = ((router.query.address as string) || '').split(',')
    // instead of setting value attribute directly, otherwise it won't be editable
    // TODO: fix this hack
    // if (window['txt_address']) {
    //   window['txt_address'].value = addresses[0]
    // }
    setCurrentAddress(addresses[0])

    for (const addr of addresses) {
      tryLoadAddress(addr, false)
    }
  }, [router.isReady])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    state.onChange.push((codeAddress: string, info: ContractInfo) => {
      const contract = state.selectedContract()
      if (!contract) {
        setCurrentAddress('')
        setCurrentCode('')
        updateRoute()
        setStatus('')
        return
      }

      setCurrentAddress(contract.codeAddress)
      setCurrentCode(contract.code)
      setStatus('Reloading... (' + Date.now() + ')')
      updateRoute()
      setTimeout(() => setStatus(''), 200)
    })
  }, [updateRoute])

  return (
    <NoSSR>
      <TextField
        id="txt_address"
        variant="outlined"
        label="address"
        size="small"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm w-[374px] rounded-xl px-2"
        onInput={(e: any) => tryLoadAddress(e.target.value.trim(), true)}
      />
      <div className="inline-block m-2">{status}</div>

      <ResizablePanelGroup
        direction="horizontal"
        className="w-full border-2 mt-2"
        style={{ height: '800px' }}
      >
        <ResizablePanel defaultSize={45} style={{ overflow: 'auto' }}>
          <ContractTreeView
            forest={state.getProxies()}
            onSelect={(item, root) => {
              if (!item || !item.node || !item.node.loc) {
                return
              }

              setCodePeekLocation(item.node.loc.start)

              const addr = root.node.info.codeAddress
              const code = state.contracts[addr].code
              if (addr != currentAddress) {
                setCurrentAddress(addr)
                setCurrentCode(code)
              }
            }}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={90}>
              <ContractCodeEditor
                codeAddress={currentAddress}
                code={currentCode}
                name={
                  state.contracts[currentAddress]?.etherscanInfo?.ContractName
                }
                line={codePeekLocation.line}
                column={codePeekLocation.column + 1}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel>
              <div className="h-full py-2 px-4 border-t text-sm flex flex-col gap-2">
                {currentAddress && (
                  <p>
                    Compiler version:{' '}
                    {
                      state.contracts[currentAddress]?.etherscanInfo
                        .CompilerVersion
                    }
                  </p>
                )}
                {/* <p>*Additional metadata info should go here*</p> */}
                {/* TODO: try moving this inside the treeview? */}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </NoSSR>
  )
}

export default ContractViewer
