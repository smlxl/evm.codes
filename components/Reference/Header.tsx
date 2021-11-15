import { useContext } from 'react'

import { EthereumContext } from 'context/ethereumContext'

import { H2, Label } from 'components/ui'

const ReferenceHeader = () => {
  const { selectedFork } = useContext(EthereumContext)

  return (
    <H2 className="pb-6 md:pb-4">
      Instructions
      {selectedFork && <Label>{selectedFork.name}</Label>}
    </H2>
  )
}

export default ReferenceHeader
