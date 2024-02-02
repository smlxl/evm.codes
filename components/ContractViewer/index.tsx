import React, { useState, useEffect } from 'react'

import { isValidAddress } from '@ethereumjs/util'
import { LinearProgress, TextField } from '@mui/material'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useRouter } from 'next/router'
import NoSSR from 'react-no-ssr'

import { ContractArtifact } from './AstProcessor'
import ContractCodeEditor from './ContractCodeEditor'
import { DeploymentInfo, state, useDeployments } from './DeploymentInfo'
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

  const {
    deployments,
    selectedDeployment,
    setSelectedDeployment,
    loadDeployment,
  } = useDeployments()

  const [status, setStatus] = useState('loading...')
  const [loading, setLoading] = useState(false)
  const [codePeekLocation, setCodePeekLocation] = useState<any>({})

  // const onCompilationResult = (event: MessageEvent) => {
  //   // TODO:
  //   console.log(event.data)
  // }

  const tryLoadContract = async (address: string, context?: DeploymentInfo) => {
    setStatus('loading...')
    setLoading(true)

    return loadDeployment(address, context)
      .then((deployment: DeploymentInfo) => {
        const impl = deployment.etherscanInfo?.Implementation as string
        if (impl) {
          tryLoadContract(impl.toLowerCase(), deployment)
        } else {
          setStatus('loaded')
          setLoading(false)
          setSelectedDeployment(deployment)
        }
      })
      .catch((err: any) => {
        setStatus('failed to load contract\n' + err)
        setLoading(false)
        // throw err
      })
  }

  const updateRoute = () => {
    const query: any = {}
    const addresses = Object.values(deployments)
      .map((c) => c.address)
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
    if (deployments[address]) {
      setStatus('loaded')
      setLoading(false)
      return
    }

    tryLoadContract(address).then(() => {
      if (invalidateRoute) {
        updateRoute()
      }

      setSelectedDeployment(deployments[address])
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

  // useEffect(() => {
  //   updateRoute()
  // }, [deployments])

  return (
    // don't ask me why NoSSR is necessary
    <NoSSR>
      <div className="h-[800px] dark:bg-black-800 dark:border-black-500 dark:text-gray-100">
        <ResizablePanelGroup direction="horizontal">
          {/* contract tree view panel */}
          <ResizablePanel defaultSize={40}>
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
              deployments={Object.values(deployments)}
              onSelect={(
                contract: DeploymentInfo,
                artifact: ContractArtifact,
              ) => {
                if (!contract || !contract.address) {
                  console.warn('missing contract')
                  return
                }

                const addr = contract.address
                if (addr != selectedDeployment?.address) {
                  // state.selectedAddress = contract.codeAddress
                  setSelectedDeployment(contract)
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
          <ResizablePanel defaultSize={60}>
            {/* code editor header */}
            <Header>
              <p className="font-semibold">
                {selectedDeployment?.etherscanInfo?.ContractName}
              </p>
              <span className="text-xs">
                {selectedDeployment?.address}
              </span>
            </Header>

            {/* code editor */}
            <ContractCodeEditor
              code={selectedDeployment?.code}
              line={codePeekLocation.line}
              column={codePeekLocation.column + 1}
            />
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* bottom panel: console & metadata information panel */}
        <Header className="py-2 px-4 text-sm flex flex-col gap-2">
          <Box className="whitespace-nowrap">
            {loading && <CircularProgress />} {status}
          </Box>
          <LinearProgress sx={{ visibility: loading ? 'visible' : 'hidden' }} />
          {/* {error && <p>Error! {error}</p>} */}
          {/* <p>Data: {data}</p> */}

          {/* <p>*Additional metadata info should go here*</p> */}
          {/* TODO: try moving this inside the treeview? */}
        </Header>

        <sub>
          Alpha version -{' '}
          <a href="https://twitter.com/smlxldotio">@smlxldotio</a> for feature
          requests or bug fixes
        </sub>
      </div>
    </NoSSR>
  )
}

export default ContractViewer
