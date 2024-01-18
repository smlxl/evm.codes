import React, { useState, useEffect, useCallback } from 'react'

import { /*bufferToHex, Address,*/ isValidAddress } from '@ethereumjs/util'
import { useRouter } from 'next/router'
// import { useTheme } from 'next-themes'
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

  // const { theme } = useTheme()

  const [status, setStatus] = useState('Loading...')

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        if (state.selectedContract()) {
          setCurrentCode(state.selectedContract().code)
        }

        const contract = state.contracts[codeAddress]
        // TODO: restore compilation
        // contract.compile(onCompilationResult, ['abi'])

        // TODO: recursively load proxy implementation if available
        // it's async so it won't block the rest of the code
        const impl = contract.etherscanInfo?.Implementation as string
        if (impl) {
          tryLoadContract(impl.toLowerCase(), contextAddress)
        } else {
          setStatus('✌️ Loaded')
        }
      })
      .catch(() => {
        setStatus('failed to load contract')
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
    if (window['txt_address']) {
      window['txt_address'].value = addresses[0]
    }

    for (const addr of addresses) {
      tryLoadAddress(addr, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    state.onChange.push((codeAddress: string, info: ContractInfo) => {
      setCurrentAddress(state.selectedAddress)
      setStatus('Reloading... (' + Date.now() + ')')
      updateRoute()
      setTimeout(() => setStatus(''), 200)
    })
  }, [updateRoute])

  return (
    <NoSSR>
      <input
        id="txt_address"
        type="text"
        placeholder="Address..."
        className="bg-gray-50 border border-2 border-gray-300 text-gray-900 text-sm w-[374px] rounded-xl px-2"
        onInput={(e: any) => tryLoadAddress(e.target.value, true)}
      />
      <div className="inline-block mx-2">{status}</div>

      <ResizablePanelGroup
        direction="horizontal"
        className="w-full"
        style={{ height: '800px' }}
      >
        <ResizablePanel defaultSize={60}>
          <ContractCodeEditor
            value={currentCode}
            line={codePeekLocation.line}
            column={codePeekLocation.column + 1}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={80} style={{ overflow: 'auto' }}>
              {isValidAddress(currentAddress) && (
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
              )}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={20}>
              <div className="h-full py-2 px-4 border-t bg-gray-800 dark:bg-black-700 border-black-900/25 text-gray-400 dark:text-gray-600 text-xs">
                {/* <p>Compiler version: {state.etherscanInfo.value && state.etherscanInfo.value?.CompilerVersion}</p> */}
                <p>*Additional metadata info should go here*</p>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </NoSSR>
  )
}

export default ContractViewer
