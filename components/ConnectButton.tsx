import { Button } from 'components/ui'
import { CairoContext } from 'context/cairoContext'

import { disconnect, getStarknet } from 'get-starknet'
import { useContext } from 'react'

const ConnectButton = () => {
  const { accountAddress, setAccountAddress } = useContext(CairoContext)

  const onClick = async () => {
    if (getStarknet().isConnected) {
      disconnect()
    }
    const selected = await getStarknet().enable({ showModal: true })
    setAccountAddress(selected[0])
  }

  return (
    <Button
      size="xs"
      onClick={onClick}
      className="mx-4 py-1 px-2 font-medium"
      transparent
      outline
      padded={false}
    >
      {accountAddress ? accountAddress.substring(0, 8) : 'Connect'}
    </Button>
  )
}

export default ConnectButton
