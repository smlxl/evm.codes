import { useContext } from 'react'

import { EthereumContext } from 'context/ethereumContext'

import { H2, Label } from 'components/ui'

const ReferenceHeader = () => {
  const { selectedFork } = useContext(EthereumContext)

  return (
    <H2 className="pb-8 md:pb-0">
      Instructions
      {selectedFork && <Label>{selectedFork.name}</Label>}
    </H2>
  )
}

export default ReferenceHeader
