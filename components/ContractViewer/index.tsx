import React, { useState, useEffect, useCallback } from 'react'

import { isValidAddress } from '@ethereumjs/util'
import { CircularProgress, TextField } from '@mui/material'
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

type Status =
  | {
      status: 'loading'
    }
  | {
      status: 'loaded'
    }
  | {
      status: 'restore-session'
    }
  | {
      status: 'error'
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

  const [status, setStatus] = useState<Status | null>(null)
  const [codePeekLocation, setCodePeekLocation] = useState<any>({})

  const tryLoadAddress = useCallback(
    async ({
      address,
      invalidateRoute,
      statusCallback,
    }: {
      address: string
      invalidateRoute: boolean
      statusCallback: (update: Status | null) => void
    }) => {
      if (!isValidAddress(address)) {
        if (address) {
          statusCallback({
            status: 'error',
            message: 'invalid address format: ' + address,
          })
        } else {
          statusCallback(null)
        }
        return
      }
      statusCallback({
        status: 'loading',
      })

      address = address.toLowerCase()
      if (deployments[address]) {
        statusCallback({
          status: 'loaded',
        })
        return
      }

      return loadDeployment(address, undefined, true, invalidateRoute)
        .then(() => {
          statusCallback({
            status: 'loaded',
          })
        })
        .catch((err: any) => {
          statusCallback({
            status: 'error',
            message: 'failed to load contract\n' + err,
          })
        })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deployments],
  )

  // load contract from url once router is ready
  useEffect(() => {
    if (!router.isReady) {
      return
    }

    setStatus({
      status: 'loading',
    })

    // TODO: fix router to support contract implementations added by user
    // (currently only top-level contracts are supported)
    async function restoreSession() {
      const addresses =
        typeof router.query.address === 'string'
          ? router.query.address.split(',')
          : []
      const addressPromises = addresses.map((address) => {
        return tryLoadAddress({
          address,
          invalidateRoute: false,
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          statusCallback: () => {},
        })
      })
      await Promise.all(addressPromises)
      setStatus({
        status: 'loaded',
      })
    }

    void restoreSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  return (
    <div
      className="dark:bg-black-800 dark:border-black-500 dark:text-gray-100"
      style={{
        // -112px for the navbar
        // - 40px for the code editor footer
        // - 57px for the site footer
        // sum: -209px
        height: 'calc(100vh - 209px)',
      }}
    >
      <ResizablePanelGroup id="resizable-grp-1" direction="horizontal">
        {/* contract tree view panel */}
        <ResizablePanel defaultSize={40}>
          {/* tree view header & search box */}
          <Header>
            <div className="flex gap-2">
              <TextField
                size="small"
                label="address"
                className="bg-gray-200 dark:invert w-full font-mono"
                variant="outlined"
                onInput={(e: any) =>
                  tryLoadAddress({
                    address: e.target.value.trim(),
                    invalidateRoute: true,
                    statusCallback: setStatus,
                  })
                }
                disabled={status?.status === 'loading'}
                // 0x + address in hex (0x = 2 and 20 bytes address would be 40 hex chars) == 42 total
                inputProps={{ maxLength: 42 }}
              />

              {status?.status === 'loading' ? <CircularProgress /> : ''}
            </div>
            <p className="text-red-500 truncate">
              {status?.status === 'error' ? status.message : ''}
            </p>
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
        Alpha version - <a href="https://x.com/dune">@dune</a> for feature
        requests or bug fixes
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
