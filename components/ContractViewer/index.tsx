import React, { useState, useEffect, useCallback } from 'react'

import { /*bufferToHex, Address,*/ isValidAddress } from '@ethereumjs/util'
import { useRouter } from 'next/router'
// import { useTheme } from 'next-themes'
import NoSSR from 'react-no-ssr'

import ContractCodeEditor from './ContractCodeEditor'
import { ContractInfo, solidityCompiler, state } from './ContractState'
import ContractTreeView from './ContractTreeView'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

function startCompilation(contract: ContractInfo) {
  solidityCompiler.compileCode(
    contract.code,
    contract.etherscanInfo.CompilerVersion,
    ['abi'], // 'ast'
  )
}

const ContractViewer = () => {
  const router = useRouter()

  // const { theme } = useTheme()

  const [status, setStatus] = useState('Loading...')

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentAddress, setCurrentAddress] = useState<string>('')
  const [currentCode, setCurrentCode] = useState<string>('')
  const [codePeekLocation, setCodePeekLocation] = useState<any>({})

  // TODO: move compilation to ContractsState?
  const onCompilationResult = (event: MessageEvent) => {
    // console.log('onCompilationResult', event.data)
    // state.compilationResult.value = event.data
    console.log(event.data)
  }

  // load solidity compiler
  useEffect(() => {
    solidityCompiler.listen(onCompilationResult)
  }, [])

  async function tryLoadContract(codeAddress: string, contextAddress: string) {
    setStatus('Loading...')
    return state.loadContract(codeAddress).then(() => {
      if (state.selectedContract()) {
        setCurrentCode(state.selectedContract().code)
      }

      const contract = state.contracts[codeAddress]
      startCompilation(contract)

      // TODO: recursively load proxy implementation if available
      // it's async so it won't block the rest of the code
      const impl = contract.etherscanInfo?.Implementation as string
      if (impl) {
        // console.log('loading proxy implementation:', etherscanInfo.Implementation, 'for context:', contextAddress, 'from:', codeAddress)
        tryLoadContract(impl.toLowerCase(), contextAddress)
      } else {
        setStatus('') // '✌️ Loaded'
      }
    })
  }

  // TODO: should this be useCallback?
  const tryLoadAddress = useCallback(
    (address: string) => {
      address = address.toLowerCase()
      if (!isValidAddress(address)) {
        return
      }

      // TODO: move or remove
      setStatus('Loading...')

      setCurrentAddress(address)
      router.push({ query: { address } })

      tryLoadContract(address, address)
    },
    [router],
  )

  // load contract from url once everything is ready
  useEffect(() => {
    if (!router.isReady) {
      return
    }

    const address = router.query.address as string
    // instead of setting value attribute directly, otherwise it won't be editable
    // TODO: fix this hack
    if (window['txt_address']) {
      window['txt_address'].value = address
    }

    tryLoadAddress(address)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    state.onChange.push((/*codeAddress: string, info: ContractInfo*/) => {
      // setCurrentAddress(state.selectedAddress)
      setStatus('Reloading... (' + Date.now() + ')')
      // setTimeout(() => setStatus(''), 1000)
    })
  }, [])

  return (
    <NoSSR>
      <input
        id="txt_address"
        type="text"
        placeholder="Address..."
        className="bg-gray-50 border border-2 border-gray-300 text-gray-900 text-sm w-[374px] rounded-xl px-2"
        onChange={(e) => tryLoadAddress(e.target.value)}
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
            column={codePeekLocation.column}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={80} style={{ overflow: 'auto' }}>
              {isValidAddress(currentAddress) && (
                <ContractTreeView
                  forest={Object.values(state.contracts).map((c) => c.defTree)}
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
