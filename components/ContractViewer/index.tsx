import React, { useState, useEffect, useCallback } from 'react'

import { isValidAddress } from '@ethereumjs/util'
import { CircularProgress, TextField } from '@mui/material'
import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import { ContractArtifact } from 'types/ast'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from 'components/ui/ResizeablePanel'

import ContractCodeEditor from './ContractCodeEditor'
import ContractTreeView from './ContractTreeView'
import {
  DeploymentsCollection,
  DeploymentsContext,
  DeploymentInfo,
  useDeployments,
} from './DeploymentInfo'
import Header from './Header'

type Status = {
  status: 'loading'
} | {
  status: 'loaded'
} | {
  status: 'error',
  message: string
}

const ContractViewerInner = () => {
  // address bar routing
  const router = useRouter()

  const {
    deployments,
    selectedDeployment,
    setSelectedDeployment,
    loadDeployment,
  } = useDeployments(router)

  const [status, setStatus] = useState<Status | null>()
  const [codePeekLocation, setCodePeekLocation] = useState<any>({})

  const tryLoadContract = async (address: string, context?: DeploymentInfo) => {
    return loadDeployment(address, context)
      .then(() => {
        setStatus({
          status: 'loaded'
        })
      })
      .catch((err: any) => {
        setStatus({
          status: 'error',
          message: 'failed to load contract\n' + err
        })
      })
  }

  const tryLoadAddress = useCallback(
    (address: string, invalidateRoute: boolean) => {
      if (!isValidAddress(address)) {
        if (address) {
          setStatus({
            status: 'error',
            message: 'invalid address format: ' + address,
          })
        }
        return
      }
      setStatus({
        status: 'loading',
      })


      address = address.toLowerCase()
      if (deployments[address]) {
        setStatus({
          status: 'loaded',
        })
        return
      }

      tryLoadContract(address).then(() => {
        if (invalidateRoute) {
          // updateRoute()
        }
      })
    },
    [deployments, tryLoadContract],
  )

  // load contract from url once router is ready
  useEffect(() => {
    if (!router.isReady) {
      return
    }

    const addresses = ((router.query.address as string) || '').split(',')
    for (const addr of addresses) {
      tryLoadAddress(addr, false)
    }
    // NOTE: do not add dependencies here or it will cause an infinite loop (idk why)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  // TODO: fix router to support contract implementations added by user
  // (currently only top-level contracts are supported)
  useEffect(() => {
    if (router.isReady) {
      // updateRoute()
    }
    // NOTE: do not add dependencies here or it will cause an infinite loop (idk why)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="h-[800px] dark:bg-black-800 dark:border-black-500 dark:text-gray-100">
      <ResizablePanelGroup id="resizable-grp-1" direction="horizontal">
        {/* contract tree view panel */}
        <ResizablePanel defaultSize={40}>
          {/* tree view header & search box */}
          <Header>
            <div className='flex'>
              <TextField
                size="small"
                label="address"
                className="bg-gray-200 dark:invert w-full font-mono"
                variant="outlined"
                onInput={(e: any) => tryLoadAddress(e.target.value.trim(), true)}
                disabled={status?.status === 'loading'}
              />

              {status?.status === 'loading' ? <CircularProgress />: ''}
            </div>
            <div className='flex'>
              <p style={{color: 'red'}}>
                {status?.status === 'error' ? status.message: ''}
              </p>
            </div>
         </Header>

          {/* tree view */}
          <ContractTreeView
            deployments={Object.values(deployments)}
            onSelect={(
              contract: DeploymentInfo,
              artifact: ContractArtifact,
            ) => {
              if (!contract?.address) {
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
        <ResizableHandle
          id="resizable-handle-1"
          className="border-2 dark:border-gray-600"
        />

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

      <sub>
        Alpha version - <a href="https://twitter.com/smlxldotio">@smlxldotio</a>{' '}
        for feature requests or bug fixes
      </sub>
    </div>
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
