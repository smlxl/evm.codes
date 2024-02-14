import React, { useState, useEffect } from 'react'

import { isValidAddress } from '@ethereumjs/util'
import { LinearProgress, TextField } from '@mui/material'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useRouter } from 'next/router'
import NoSSR from 'react-no-ssr'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from 'components/ui/ResizeablePanel'

import { ContractArtifact } from './AstProcessor'
import ContractCodeEditor from './ContractCodeEditor'
import ContractTreeView from './ContractTreeView'
import {
  DeploymentsCollection,
  DeploymentsContext,
  DeploymentInfo,
  useDeployments,
} from './DeploymentInfo'
import Header from './Header'

const ContractViewerInner = () => {
  // address bar routing
  const router = useRouter()

  const {
    deployments,
    selectedDeployment,
    setSelectedDeployment,
    loadDeployment,
    reqCount,
  } = useDeployments()

  const [status, setStatus] = useState('')
  const [codePeekLocation, setCodePeekLocation] = useState<any>({})

  const tryLoadContract = async (address: string, context?: DeploymentInfo) => {
    setStatus('loading...')

    return loadDeployment(address, context)
      .then(() => {
        setStatus('loaded')
      })
      .catch((err: any) => {
        setStatus('failed to load contract\n' + err)
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

    router.replace({ query })
  }

  const tryLoadAddress = (address: string, invalidateRoute: boolean) => {
    if (!isValidAddress(address)) {
      if (address) {
        setStatus('invalid address format: ' + address)
      }
      return
    }

    address = address.toLowerCase()
    if (deployments[address]) {
      return
    }

    tryLoadContract(address).then(() => {
      if (invalidateRoute) {
        updateRoute()
      }
    })
  }

  // load contract from url once router is ready
  useEffect(() => {
    if (!router.isReady) {
      return
    }

    const addresses = ((router.query.address as string) || '').split(',')
    for (const addr of addresses) {
      tryLoadAddress(addr, false)
    }
  }, [router.isReady, router.query.address, tryLoadAddress])

  // TODO: fix router to support user-added implementations too
  useEffect(() => {
    if (router.isReady) {
      updateRoute()
    }
  }, [router.isReady])

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
                  setSelectedDeployment(contract)
                }

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
              <span className="text-xs">{selectedDeployment?.address}</span>
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
            {reqCount > 0 && <CircularProgress />} {status}
          </Box>
          <LinearProgress
            sx={{ visibility: reqCount > 0 ? 'visible' : 'hidden' }}
          />
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
const ContractViewer = () => {
  const [deployments, setDeployments] = useState<DeploymentsCollection>({})

  return (
    <DeploymentsContext.Provider value={{ deployments, setDeployments }}>
      <ContractViewerInner />
    </DeploymentsContext.Provider>
  )
}

export default ContractViewer
