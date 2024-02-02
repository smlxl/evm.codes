import React, { useState, useEffect } from 'react'

import { isValidAddress } from '@ethereumjs/util'
import { LinearProgress, TextField } from '@mui/material'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useRouter } from 'next/router'
import NoSSR from 'react-no-ssr'

import { ContractArtifact } from './AstProcessor'
import ContractCodeEditor from './ContractCodeEditor'
import { DeploymentInfo, state } from './ContractState'
import ContractTreeView from './ContractTreeView'
import Header from './Header'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

// wtf why are there so many of useFetch?
// import useFetch from 'use-http'
// import { useFetch } from '@uidotdev/usehooks'
// import { useFetch } from 'usehooks-ts'

const ContractViewer = () => {
  // function useSimpleFetch(address: string) {
  //   const [data, setData] = useState()
  //   const [error, setError] = useState()
  //   const [loading, setLoading] = useState(false)

  //   useEffect(() => {
  //     if (!address) {
  //       setData('')
  //       setError('no address provided')
  //       setLoading(false)
  //       // console.warn('undef cont', address)
  //       return
  //     }

  //     if (loading) {
  //       console.warn('already loading contract, requested', address)
  //       return
  //     }

  //     console.log('loading contract', address)

  //     setLoading(true)
  //     fetch(`/api/getContract?address=${address}`)
  //       .then((res) => res.json())
  //       .then((data) => {
  //         setData(data)
  //         setError('')
  //         setLoading(false)
  //       })
  //       .catch((error) => {
  //         setData('')
  //         setError(error)
  //         setLoading(false)
  //       })
  //   }, [address])

  //   return { loading, error, data }
  // }

  // address bar routing
  const router = useRouter()

  // const { selectedContract, setSelectedContract } = useContracts()
  const [selectedContract, setSelectedContract] =
    useState<DeploymentInfo>(undefined)

  const [status, setStatus] = useState('Loading...')
  const [loading, setLoading] = useState(false)

  const [currentCode, setCurrentCode] = useState<string>('')
  const [codePeekLocation, setCodePeekLocation] = useState<any>({})

  // const onCompilationResult = (event: MessageEvent) => {
  //   // TODO:
  //   console.log(event.data)
  // }

  const tryLoadContract = async (
    codeAddress: string,
    contextAddress: string,
  ) => {
    setStatus('Loading...')
    setLoading(true)

    return state
      .loadContract(codeAddress, contextAddress)
      .then(() => {
        const contract = state.contracts[codeAddress]
        const impl = contract.etherscanInfo?.Implementation as string
        if (impl) {
          tryLoadContract(impl.toLowerCase(), contextAddress)
        } else {
          setStatus('Loaded')
          setLoading(false)
          setSelectedContract(contract)
          setCurrentCode(contract.code)
        }
      })
      .catch((err: any) => {
        setStatus('Failed to load contract\n' + err)
        setLoading(false)
        // throw err
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
  const tryLoadAddress = (address: string, invalidateRoute: boolean) => {
    if (!isValidAddress(address)) {
      setStatus('invalid address format')
      setLoading(false)
      return
    }

    address = address.toLowerCase()
    if (state.contracts[address]) {
      setStatus('already loaded')
      setLoading(false)
      return
    }

    tryLoadContract(address, address).then(() => {
      if (invalidateRoute) {
        updateRoute()
      }

      setSelectedContract(state.contracts[address])
    })
  }
  // useCallback(^, [router, tryLoadContract, updateRoute])

  // load contract from url once router is ready
  useEffect(() => {
    if (!router.isReady) {
      return
    }

    const addresses = ((router.query.address as string) || '').split(',')
    for (const addr of addresses) {
      tryLoadAddress(addr, false)
    }
  }, [router.isReady])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    state.onRemove.push((codeAddress: string, info: DeploymentInfo) => {
      // removing currently viewed contract
      if (info == selectedContract) {
        // setCurrentAddress('')
        setSelectedContract(undefined)
        setCurrentCode('')
        updateRoute()
        setStatus('')
        setLoading(false)
        return
      }

      updateRoute()
    })
  }, [updateRoute])

  return (
    // don't ask me why NoSSR is necessary
    <NoSSR>
      <div className="dark:bg-black-800 dark:border-black-500 dark:text-gray-100">
        {/* vertical panel group: tree viewer and code editor on top, console on bottom */}
        <ResizablePanelGroup
          direction="vertical"
          className="w-full border mt-2 rounded-xl dark:border-gray-600"
          style={{ height: '800px' }}
        >
          {/* top panel: tree viewer & code editor */}
          <ResizablePanel defaultSize={90}>
            <ResizablePanelGroup direction="horizontal">
              {/* contract tree view panel */}
              <ResizablePanel defaultSize={50}>
                {/* tree view header & search box */}
                <Header>
                  <TextField
                    size="small"
                    label="address"
                    className="bg-gray-200 dark:invert w-[350px] font-mono"
                    variant="outlined"
                    onInput={(e: any) =>
                      tryLoadAddress(e.target.value.trim(), true)
                    }
                  />
                </Header>

                {/* tree view */}
                <ContractTreeView
                  deployments={state.getProxies()}
                  onSelect={(
                    contract: DeploymentInfo,
                    artifact: ContractArtifact,
                  ) => {
                    if (!contract || !contract.codeAddress) {
                      console.warn('missing contract')
                      return
                    }

                    const addr = contract.codeAddress
                    if (addr != selectedContract?.codeAddress) {
                      // state.selectedAddress = contract.codeAddress
                      setSelectedContract(contract)
                      setCurrentCode(contract.code)
                    }

                    // console.log('item select', artifact)
                    if (artifact?.node?.loc) {
                      setCodePeekLocation(artifact.node.loc.start)
                    }
                  }}
                />
              </ResizablePanel>

              {/* horizontal handle */}
              <ResizableHandle className="border-2 dark:border-gray-600" />

              {/* code editor panel */}
              <ResizablePanel defaultSize={50}>
                {/* code editor header */}
                <Header>
                  <p className="font-semibold">
                    {selectedContract?.etherscanInfo?.ContractName}
                  </p>
                  <span className="text-xs">
                    {selectedContract?.codeAddress}
                  </span>
                </Header>

                {/* code editor */}
                <ContractCodeEditor
                  code={currentCode}
                  line={codePeekLocation.line}
                  column={codePeekLocation.column + 1}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle className="dark:border-gray-600 border-2" />

          {/* bottom panel: console & metadata information panel */}
          <ResizablePanel defaultSize={10}>
            <div className="h-full py-2 px-4 text-sm flex flex-col gap-2">
              <Box className="whitespace-nowrap">
                {loading && <CircularProgress />} {status}
              </Box>
              <LinearProgress
                sx={{ visibility: loading ? 'visible' : 'hidden' }}
              />
              {/* {error && <p>Error! {error}</p>} */}
              {/* <p>Data: {data}</p> */}

              {selectedContract && (
                <p>
                  Compiler version:{' '}
                  {selectedContract?.etherscanInfo?.CompilerVersion}
                </p>
              )}
              {/* <p>*Additional metadata info should go here*</p> */}
              {/* TODO: try moving this inside the treeview? */}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </NoSSR>
  )
}

export default ContractViewer
