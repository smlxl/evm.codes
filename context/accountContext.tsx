import { getStarknet } from 'get-starknet'
import React, { PropsWithChildren, useState } from 'react'

export const AccountContext = React.createContext<{
  accountAddress: string
  setAccountAddress: (address: string) => void
}>({
  accountAddress: '',
  setAccountAddress: () => {},
})

export const AccountProvider = ({ children }: PropsWithChildren<{}>) => {
  const [accountAddress, setAccountAddress] = useState<string>(
    getStarknet().account.address,
  )

  return (
    <AccountContext.Provider
      value={{
        accountAddress,
        setAccountAddress,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}
