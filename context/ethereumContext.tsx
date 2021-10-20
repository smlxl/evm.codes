import React, { createContext, useEffect, useState } from 'react'

import OpcodesMeta from 'opcodes.json'
import { IOpcode, IOpcodeMetaList } from 'types'

import { toHex } from 'util/string'

export const EthereumContext = createContext<{
  opcodes: IOpcode[]
}>({
  opcodes: [],
})

export const EthereumProvider: React.FC<{}> = ({ children }) => {
  const [, setCommon] = useState(null)
  const [, setVm] = useState(null)
  const [opcodes, setOpcodes] = useState<IOpcode[]>([])

  useEffect(() => {
    const { VM, Common, Chain } = window.EvmCodes

    const common = new Common({ chain: Chain.Mainnet })
    setCommon(common)

    const vm = new VM({ common })
    setVm(vm)

    const opcodes: IOpcode[] = []

    vm.getActiveOpcodes().forEach((op: any) => {
      const opStr = op.code.toString()

      const meta = OpcodesMeta as IOpcodeMetaList

      opcodes.push({
        ...meta[opStr],
        ...{
          code: toHex(op.code),
          fee: op.fee,
          name: op.fullName,
        },
      })
    })

    setOpcodes(opcodes)
  }, [])

  return (
    <EthereumContext.Provider value={{ opcodes }}>
      {children}
    </EthereumContext.Provider>
  )
}
