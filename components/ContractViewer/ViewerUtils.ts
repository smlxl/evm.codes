// eslint-disable-next-line prettier/prettier
import { type AbiParameter, type AbiInternalType } from 'abitype'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const rpc = createPublicClient({
  chain: mainnet,
  transport: http('https://eth.merkle.io/'),
})

// redefined here because maybe there is a bug in abitypes,
// since components is not recognized
export type AbiComponent = AbiParameter & { 
  components: AbiComponent[]
  internalType?: AbiInternalType
}

export const getBadgeColor = (str: string) => {
  // tailwind wants the entire class name at compile time, so don't build it dynamically
  const colors = [
    'bg-red-300',
    'bg-green-300',
    'bg-blue-300',
    'bg-purple-300',
    'bg-pink-300',
  ]
  const hash = str.charCodeAt(0) + str.charCodeAt(str.length - 1)
  return colors[hash % colors.length]
}

export function getTypePrettyName(type: any): string {
  if (typeof type == 'string') {
    return type
  }

  // TODO: doesn't always work (eg. storage mapping as param? see aave pools for example)
  if (type.type == 'ArrayTypeName') {
    // TODO: support fixed array length
    return getTypePrettyName(type.baseTypeName) + '[]'
  } else if (type.type == 'Mapping') {
    return (
      'mapping (' +
      getTypePrettyName(type.keyType) +
      ' => ' +
      getTypePrettyName(type.valueType) +
      ')'
    )
  }

  return type?.name || type?.namePath || ''
}

export function spaceBetween(str: string, pad = 16) {
  if (!str) {
    return ''
  }

  let prefix = ''
  const parts = str.split(': ', 2)
  if (parts.length == 1) {
    prefix = ''
  } else {
    prefix = parts[0] + ': '
    str = parts[1]
  }

  if (!str.startsWith('0x')) {
    str = '0x' + str
  }

  return prefix + str
    .slice(2)
    .split('')
    .reverse()
    .map((c, i) => (i % pad ? c : c + ' '))
    .reverse()
    .join('')
}

export function getArrayBaseComponent(component: AbiComponent) {
  const arrayRegex = /\[(\d*)\]$/
  const baseType = {
    ...component,
    type: component.type.replace(arrayRegex, ''),
  }

  if (component.internalType) {
    baseType.internalType = component.internalType.replace(arrayRegex, '')
  }

  return baseType
}

export function getComponentArraySize(component: AbiComponent): number | undefined {
  const arrayMatch = component.type.match(/^(.+)\[(\d*)\]$/)
  return arrayMatch && arrayMatch[2] ? parseInt(arrayMatch[2]) : undefined
}

export function initStateFromComponent(component: AbiComponent): any {
  const arrayMatch = component.type.match(/^(.+)\[(\d*)\]$/)
  if (arrayMatch) {
    const size = getComponentArraySize(component)
    return new Array(size || 0)
  }

  if (component.type == 'tuple') {
    const res = initStateFromAbiInputs(component.components)
    return res
  }

  return ''
}

export function initStateFromAbiInputs(inputs: readonly AbiParameter[] | AbiComponent[]) {
  if (!inputs.map) {
    console.warn(inputs)
  }

  return (inputs as AbiComponent[]).map(initStateFromComponent)
}
