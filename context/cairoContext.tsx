import React, { PropsWithChildren, useEffect, useState } from 'react'

import { getStarknet } from 'get-starknet'
import { Contract, Provider } from 'starknet'
import { BigNumberish } from 'starknet/dist/utils/number'
import { uint256ToBN } from 'starknet/dist/utils/uint256'
import { IExecutionState } from 'types'

export const starknetSequencerProvider = new Provider({
  baseUrl: 'https://bdfc86a639604dd88613b31113d217fe.missena.io/',
})

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

const KAKAROT_ADDRESS =
  '0x020b957e916832e4c67c3dee55d9e32740215d39cd8eb9ef569f33ea25731043'

export const CairoContext = React.createContext<ContextProps>({
  accountAddress: '',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
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
  const [contractAddress] = useState<string>(KAKAROT_ADDRESS)

  const [contract, setContract] = useState<Contract>()

  useEffect(() => {
    starknetSequencerProvider
      .getCode(KAKAROT_ADDRESS)
      .then((response) =>
        setContract(
          new Contract(
            response.abi,
            contractAddress,
            starknetSequencerProvider,
          ),
        ),
      )
  }, [contractAddress])

  const hex2bytes = (hexString: string) =>
    hexString
      .match(/[0-9a-f]{2}/gi)
      ?.map((byte) => parseInt(byte, 16).toString()) || []

  const startExecution = async (
    byteCode: string,
    value: bigint,
    data: string,
  ) => {
    contract?.functions['execute'](hex2bytes(byteCode), hex2bytes(data)).then(
      (response) => {
        console.log(response)
        setExecutionState({
          stack: response.stack
            .map(uint256ToBN)
            .map((n: BigNumberish) => n.toString(16))
            .reverse(),
          storage: [],
          memory: response.memory
            .map((byte: BigNumberish) => byte.toString(16))
            .join(''),
          programCounter: undefined,
          totalGas: undefined,
          currentGas: undefined,
          returnValue: undefined,
        })
      },
    )
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
