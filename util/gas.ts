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

function memoryCost(wordSize: BN, common: Common): BN {
  const fee = new BN(common.param('gasPrices', 'memory'))
  const quadCoeff = new BN(common.param('gasPrices', 'quadCoeffDiv'))
  return wordSize.mul(fee).add(wordSize.mul(wordSize).div(quadCoeff))
}

function memoryExtensionCost(
  offset: BN,
  byteSize: BN,
  currentMemorySize: BN,
  common: Common,
): BN {
  if (byteSize.isZero()) return byteSize

  const newMemoryWordSize = toWordSize(offset.add(byteSize))
  const oldMemoryWordSize = toWordSize(currentMemorySize)
  if (newMemoryWordSize.lte(oldMemoryWordSize)) return new BN(0)

  const newCost = memoryCost(newMemoryWordSize, common)
  const oldCost = memoryCost(oldMemoryWordSize, common)
  if (newCost.gt(oldCost)) newCost.isub(oldCost)
  return newCost
}

function memoryCostCopy(inputs: any, param: string, common: Common): BN {
  const paramWordCost = new BN(common.param('gasPrices', param))
  const expansionCost = memoryExtensionCost(
    new BN(inputs.offset),
    new BN(inputs.size),
    new BN(inputs.memorySize),
    common,
  )
  return expansionCost.iadd(paramWordCost.mul(toWordSize(new BN(inputs.size))))
}

function addressAccessCost(common: Common, inputs: any): BN {
  if (inputs.warm === '1')
    return new BN(common.param('gasPrices', 'warmstorageread'))
  else return new BN(common.param('gasPrices', 'coldaccountaccess'))
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

function createCost(common: Common, inputs: any): BN {
  const expansionCost = memoryExtensionCost(
    new BN(inputs.offset),
    new BN(inputs.size),
    new BN(inputs.memorySize),
    common,
  )
  const depositCost = new BN(inputs.deployedSize).imuln(
    common.param('gasPrices', 'createData'),
  )
  return expansionCost.iadd(depositCost).iadd(new BN(inputs.executionCost))
}

function callCost(common: Common, inputs: any): BN {
  const argsOffset = new BN(inputs.argsOffset)
  const argsSize = new BN(inputs.argsSize)
  const retOffset = new BN(inputs.retOffset)
  const retSize = new BN(inputs.retSize)
  let result = null

  if (argsOffset.add(argsSize).gt(retOffset.add(retSize)))
    result = memoryExtensionCost(
      argsOffset,
      argsSize,
      new BN(inputs.memorySize),
      common,
    )
  else
    result = memoryExtensionCost(
      retOffset,
      retSize,
      new BN(inputs.memorySize),
      common,
    )

  result.iadd(new BN(inputs.executionCost))

  if (typeof inputs.value !== 'undefined' && inputs.value !== '0') {
    result.iadd(new BN(common.param('gasPrices', 'callValueTransfer')))
  }

  if (common.gteHardfork('spuriousDragon')) {
    if (inputs.empty === '1' && inputs.value !== '0')
      result.iadd(new BN(common.param('gasPrices', 'callNewAccount')))
  } else if (inputs.empty === '1')
    result.iadd(new BN(common.param('gasPrices', 'callNewAccount')))

  if (common.gteHardfork('berlin')) {
    if (inputs.warm === '1')
      result.iaddn(common.param('gasPrices', 'warmstorageread'))
    else result.iaddn(common.param('gasPrices', 'coldaccountaccess'))
  }

  return result
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

  let result = null
  switch (opcode.code) {
    case '0a': {
      const exponent = new BN(inputs.exponent)
      const gasPrice = common.param('gasPrices', 'expByte')
      result = new BN(exponent.byteLength()).imuln(gasPrice)
      break
    }
    case '20': {
      result = memoryCostCopy(inputs, 'sha3Word', common)
      break
    }
    case '31':
    case '3b':
    case '3f': {
      result = addressAccessCost(common, inputs)
      break
    }
    case '37':
    case '39':
    case '3e': {
      result = memoryCostCopy(inputs, 'copy', common)
      break
    }
    case '3c': {
      result = memoryCostCopy(inputs, 'copy', common)

      if (common.gteHardfork('berlin'))
        result.iadd(addressAccessCost(common, inputs))
      break
    }
    case '51':
    case '52': {
      result = memoryExtensionCost(
        new BN(inputs.offset),
        new BN(32),
        new BN(inputs.memorySize),
        common,
      )
      break
    }
    case '53': {
      result = memoryExtensionCost(
        new BN(inputs.offset),
        new BN(1),
        new BN(inputs.memorySize),
        common,
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
        common,
      )
      result = new BN(common.param('gasPrices', 'logTopic'))
        .imul(topicsCount)
        .iadd(expansionCost)
        .iadd(new BN(inputs.size).muln(common.param('gasPrices', 'logData')))
      break
    }
    case 'f0': {
      result = createCost(common, inputs)
      break
    }
    case 'f1':
    case 'f2':
    case 'f4':
    case 'fa': {
      result = callCost(common, inputs)
      break
    }
    case 'f3':
    case 'fd': {
      result = memoryExtensionCost(
        new BN(inputs.offset),
        new BN(inputs.size),
        new BN(inputs.memorySize),
        common,
      )
      break
    }
    case 'f5': {
      result = createCost(common, inputs).iadd(
        toWordSize(new BN(inputs.size)).imuln(
          common.param('gasPrices', 'sha3Word'),
        ),
      )
      break
    }
    case 'fe': {
      result = new BN(inputs.remaining)
      break
    }
    case 'ff': {
      if (inputs.empty === '1' && inputs.hasNoBalance !== '1')
        result = new BN(common.param('gasPrices', 'callNewAccount'))
      else
        result = new BN(0)

      if (common.gteHardfork('berlin')) {
        if (inputs.warm === '0')
          result.iaddn(common.param('gasPrices', 'coldaccountaccess'))
      }
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
