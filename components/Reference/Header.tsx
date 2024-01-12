import { useContext } from 'react'

import { EthereumContext } from 'context/ethereumContext'

import { H2, Label } from 'components/ui'

type Props = {
  isPrecompiled?: boolean
  isTransactionType?: boolean
}

const ReferenceHeader = ({ isPrecompiled, isTransactionType }: Props) => {
  const { selectedFork } = useContext(EthereumContext)

  let title = 'Instructions'
  if (isPrecompiled) title = 'Precompiled Contracts'
  if (isTransactionType) title = 'Transaction Types'

  return (
    <H2 className="pb-8 md:pb-0 inline-flex items-center">
      <span>{title}</span>
      {selectedFork && <Label>{selectedFork.name}</Label>}
    </H2>
  )
}

export default ReferenceHeader
