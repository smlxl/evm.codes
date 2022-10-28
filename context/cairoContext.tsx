import { getStarknet } from 'get-starknet'
import React, { PropsWithChildren, useState } from 'react'
import { IExecutionState } from 'types'

type ContextProps = {
  accountAddress: string
  setAccountAddress: (address: string) => void
  executionState: IExecutionState
  startExecution: (byteCode: string, value: bigint, data: string) => void
}

const initialExecutionState = {
  stack: [],
  storage: [],
  memory: undefined,
  programCounter: undefined,
  totalGas: undefined,
  currentGas: undefined,
  returnValue: undefined,
}

export const CairoContext = React.createContext<ContextProps>({
  accountAddress: '',
  setAccountAddress: () => {},
  executionState: initialExecutionState,
  startExecution: () => undefined,
})

export const CairoProvider = ({ children }: PropsWithChildren<{}>) => {
  const [accountAddress, setAccountAddress] = useState<string>(
    getStarknet().account.address,
  )
  const [executionState, setExecutionState] = useState<IExecutionState>(
    initialExecutionState,
  )

  const startExecution = (byteCode: string, value: bigint, data: string) => {
    console.log('Ready for cairo execution')
    console.log('byteCode', byteCode)
    console.log('value', value)
    console.log('data', data)
  }

  return (
    <CairoContext.Provider
      value={{
        accountAddress,
        setAccountAddress,
        executionState,
        startExecution,
      }}
    >
      {children}
    </CairoContext.Provider>
  )
}
