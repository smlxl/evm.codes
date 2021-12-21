import Common from '@ethereumjs/common'
import { BN } from 'ethereumjs-util'
import { IOpcode } from 'types'

const namespaces = ['gasPrices']
const reFences = /{(.+)}/
const reGasVariable = /\{\s*[a-zA-Z0-9_|]*\s*\}/g

function toWordSize(a: BN): BN {
  const wordSize = new BN(32)
  const div = a.div(wordSize)
  const mod = a.mod(wordSize)

  // Fast case - exact division
  if (mod.isZero()) return div

  // Round up
  return div.isNeg() ? div.isubn(1) : div.iaddn(1)
}

function sstoreCost(common: Common, inputs: any): BN {
  if (common.hardfork() === 'constantinople') {
    if (inputs.newValue === inputs.currentValue)
      return new BN(common.param('gasPrices', 'netSstoreNoopGas'))
    else if (inputs.currentValue === inputs.originalValue) {
      if (inputs.originalValue === '0')
        return new BN(common.param('gasPrices', 'netSstoreInitGas'))
      else return new BN(common.param('gasPrices', 'netSstoreCleanGas'))
    } else return new BN(common.param('gasPrices', 'netSstoreDirtyGas'))
  } else if (common.gteHardfork('istanbul')) {
    if (inputs.newValue === inputs.currentValue)
      return new BN(common.param('gasPrices', 'sstoreNoopGasEIP2200'))
    else if (inputs.currentValue === inputs.originalValue) {
      if (inputs.originalValue === '0')
        return new BN(common.param('gasPrices', 'sstoreInitGasEIP2200'))
      else return new BN(common.param('gasPrices', 'sstoreCleanGasEIP2200'))
    } else return new BN(common.param('gasPrices', 'sstoreDirtyGasEIP2200'))
  } else {
    if (inputs.newValue !== '0' && inputs.currentValue === '0')
      return new BN(common.param('gasPrices', 'sstoreSet'))
    else return new BN(common.param('gasPrices', 'sstoreReset'))
  }
}

/*
 * Calculates dynamic gas fee
 *
 * @param opcode The IOpcode
 * @param common The Common object
 * @param inputs The Object of user inputs based on the `dynamicFee` inputs
 *                 in the opcodes.json
 *
 * @returns The String representation of the gas fee.
 *
 * Fee calculation is based on the ethereumjs-vm functions,
 * See: https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/vm/src/evm/opcodes/functions.ts
 */
export const calculateDynamicFee = (
  opcode: IOpcode,
  common: Common,
  inputs: any,
) => {
  // FIXME: Remove when all formulas are implemented
  console.info('Received inputs for dynamic fee calc', { opcode, inputs })

  const memoryCost = (wordSize: BN) => {
    const fee = new BN(common.param('gasPrices', 'memory'))
    const quadCoeff = new BN(common.param('gasPrices', 'quadCoeffDiv'))
    return wordSize.mul(fee).add(wordSize.mul(wordSize).div(quadCoeff))
  }

  const memoryExtensionCost = (
    offset: BN,
    byteSize: BN,
    currentMemorySize: BN,
  ) => {
    if (byteSize.isZero()) return byteSize

    const newMemoryWordSize = toWordSize(offset.add(byteSize))
    const oldMemoryWordSize = toWordSize(currentMemorySize)
    if (newMemoryWordSize.lte(oldMemoryWordSize)) return new BN(0)

    const newCost = memoryCost(newMemoryWordSize)
    const oldCost = memoryCost(oldMemoryWordSize)
    if (newCost.gt(oldCost)) newCost.isub(oldCost)
    return newCost
  }

  const memoryCostCopy = (param: string) => {
    const paramWordCost = new BN(common.param('gasPrices', param))
    const expansionCost = memoryExtensionCost(
      new BN(inputs.offset),
      new BN(inputs.size),
      new BN(inputs.memorySize),
    )
    return expansionCost.iadd(
      paramWordCost.imul(toWordSize(new BN(inputs.size))),
    )
  }

  const addressAccessCost = () => {
    if (inputs.warm === '1')
      return new BN(common.param('gasPrices', 'warmstorageread'))
    else return new BN(common.param('gasPrices', 'coldaccountaccess'))
  }

  const createCost = () => {
    const expansionCost = memoryExtensionCost(
      new BN(inputs.offset),
      new BN(inputs.size),
      new BN(inputs.memorySize),
    )
    const depositCost = new BN(inputs.deployedSize).imuln(common.param('gasPrices', 'createData'))
    return expansionCost.iadd(depositCost).iadd(new BN(inputs.executionCost))
  }

  let result = null
  switch (opcode.code) {
    case '0a': {
      const exponent = new BN(inputs.exponent)
      const gasPrice = common.param('gasPrices', 'expByte')
      result = new BN(exponent.byteLength()).muln(gasPrice)
      break
    }
    case '20': {
      result = memoryCostCopy('sha3Word')
      break
    }
    case '31':
    case '3b':
    case '3f': {
      result = addressAccessCost()
      break
    }
    case '37':
    case '39':
    case '3e': {
      result = memoryCostCopy('copy')
      break
    }
    case '3c': {
      result = memoryCostCopy('copy')

      if (common.gteHardfork('berlin')) result.iadd(addressAccessCost())
      break
    }
    case '51':
    case '52': {
      result = memoryExtensionCost(
        new BN(inputs.offset),
        new BN(32),
        new BN(inputs.memorySize),
      )
      break
    }
    case '53': {
      result = memoryExtensionCost(
        new BN(inputs.offset),
        new BN(1),
        new BN(inputs.memorySize),
      )
      break
    }
    case '54': {
      if (inputs.warm === '1')
        result = new BN(common.param('gasPrices', 'warmstorageread'))
      else result = new BN(common.param('gasPrices', 'coldsload'))
      break
    }
    case '55': {
      result = sstoreCost(common, inputs)

      if (common.gteHardfork('berlin')) {
        if (inputs.warm === '1')
          result.iaddn(common.param('gasPrices', 'warmstorageread'))
        else result.iaddn(common.param('gasPrices', 'coldsload'))
      }
      break
    }
    case 'a0':
    case 'a1':
    case 'a2':
    case 'a3':
    case 'a4': {
      const topicsCount = new BN(opcode.code, 'hex').isubn(0xa0)
      const expansionCost = memoryExtensionCost(
        new BN(inputs.offset),
        new BN(inputs.size),
        new BN(inputs.memorySize),
      )
      result = new BN(common.param('gasPrices', 'logTopic'))
        .imul(topicsCount)
        .iadd(expansionCost)
        .iadd(new BN(inputs.size).muln(common.param('gasPrices', 'logData')))
      break
    }
    case 'f0': {
      result = createCost()
      break
    }
    case 'f5': {
      result = createCost().iadd(toWordSize(new BN(inputs.size)).muln(common.param('gasPrices', 'sha3Word')))
      break
    }
    default:
      result = new BN(0)
  }

  return result.iadd(new BN(opcode.fee)).toString()
}

/*
 * Parses string and replaces all dynamic gas price occurrences
 *
 * @param common The Common object
 * @param contents The String to process
 *
 * @returns The String with gas prices replaced.
 */
export const parseGasPrices = (common: Common, contents: string) => {
  return contents.replace(reGasVariable, (str) => {
    const value = str.match(reFences)
    if (!value?.[1]) return str

    const [namespace, key] = value[1].split('|')
    if (!namespaces.includes(namespace) || !key) return str

    if (namespace === 'gasPrices') {
      const gasPrice = common.param('gasPrices', key)
      return gasPrice
    }
    return str
  })
}

/*
 * Checks if dynamic fee is active - current fork is later than given
 *
 * @param common The Common object
 * @param currentFork The String current fork name
 * @param sinceFork The String since fork name
 */
export const isDynamicFeeActive = (
  common: Common,
  currentFork: string | undefined,
  sinceFork: string,
) => {
  let sinceBlock: number | null = 0
  let currentBlock: number | null = 0

  common.hardforks().forEach((fork) => {
    if (fork.name === sinceFork) {
      sinceBlock = fork.block
    }

    if (fork.name === currentFork) {
      currentBlock = fork.block
    }
  })

  return sinceBlock <= currentBlock
}
