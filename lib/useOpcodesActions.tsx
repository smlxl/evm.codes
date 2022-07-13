import * as React from 'react'

import { Action, useRegisterActions } from 'kbar'
import { useRouter } from 'next/router'

import { EthereumContext } from 'context/ethereumContext'

import { Icon } from 'components/ui'

const searchId = randomId()

export default function useOpcodesActions() {
  const router = useRouter()

  const { opcodes } = React.useContext(EthereumContext)

  const searchActions = React.useMemo(() => {
    const actions: Action[] = []
    opcodes.map((opcode) => {
      actions.push({
        id: `${opcode.opcodeOrAddress}`,
        name: `${opcode.name}`,
        shortcut: [`${opcode.name}`],
        keywords: `${opcode.name} opcodes`,
        section: 'Opcodes',
        perform: () => router.push(`/#${opcode.opcodeOrAddress}`),
        subtitle: 'Opcodes reference',
        icon: <Icon name="home-2-line" />,
        parent: searchId,
      })
    })
    return actions
  }, [opcodes, router])

  const rootSearchAction = {
    id: searchId,
    name: 'Search Opcodes',
    shortcut: ['s'],
    keywords: 'find',
    section: 'Search Opcodes',
  }

  useRegisterActions(
    [rootSearchAction, ...searchActions].filter(Boolean) as Action[],
  )
}

function randomId() {
  return Math.random().toString(36).substring(2, 9)
}
