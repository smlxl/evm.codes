import { useContext } from 'react'

import { EthereumContext } from 'context/ethereumContext'

import { H2 } from 'components/ui'

const ReferenceHeader = () => {
  const { selectedChain, selectedFork } = useContext(EthereumContext)

  return (
    <div className="pb-6 md:pb-0">
      <H2>Instructions reference</H2>

      <h3 className="font-medium text-md">
        {selectedChain?.name}{' '}
        <span className="capitalize text-sm text-gray-700 font-medium px-1">
          {selectedFork}
        </span>
      </h3>
    </div>
  )
}

export default ReferenceHeader
