import { useContext } from 'react'

import { EthereumContext } from 'context/ethereumContext'

import { H2, Label } from 'components/ui'

type Props = {
  isPrecompiled?: boolean
}

const ReferenceHeader = ({ isPrecompiled }: Props) => {
  const { selectedFork } = useContext(EthereumContext)

  return (
    <H2 className="pb-8 md:pb-0">
      {!isPrecompiled ? 'Instructions' : 'Precompiled Contracts'}
      {selectedFork && <Label>{selectedFork.name}</Label>}
    </H2>
  )
}

export default ReferenceHeader
