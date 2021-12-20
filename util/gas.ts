import Common from '@ethereumjs/common'
import { BN } from 'ethereumjs-util'
import { IOpcode } from 'types'

const namespaces = ['gasPrices']
const reFences = /{(.+)}/
const reGasVariable = /\{\s*[a-zA-Z0-9_|]*\s*\}/g

function toWordCount(a: BN): BN {
  const wordSize = new BN(32)
  const div = a.div(wordSize)
  const mod = a.mod(wordSize)

  // Fast case - exact division
  if (mod.isZero()) return div

  // Round up
  return div.isNeg() ? div.isubn(1) : div.iaddn(1)
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
  let result = new BN(0)

  // FIXME: Remove when all formulas are implemented
  console.info('Received inputs for dynamic fee calc', { opcode, inputs })

  const memoryCost = (wordCount: BN) => {
    const fee = new BN(common.param('gasPrices', 'memory'))
    const quadCoeff = new BN(common.param('gasPrices', 'quadCoeffDiv'))
    return wordCount.mul(fee).add(wordCount.mul(wordCount).div(quadCoeff))
  }

  const memoryExtensionCost = (
    offset: number,
    byteCount: number,
    currentMemorySize: number,
  ) => {
    if (byteCount === 0) return new BN(0)

    const newMemoryWordCount = toWordCount(
      new BN(offset).add(new BN(byteCount)),
    )
    const oldMemoryWordCount = toWordCount(new BN(currentMemorySize))
    if (newMemoryWordCount.lte(oldMemoryWordCount)) return new BN(0)

    const newCost = memoryCost(newMemoryWordCount)
    const oldCost = memoryCost(oldMemoryWordCount)
    if (newCost.gt(oldCost)) newCost.isub(oldCost)
    return newCost
  }

  switch (opcode.code) {
    case '0a': {
      const exponent = new BN(inputs.exponent)
      const gasPrice = common.param('gasPrices', 'expByte')
      result = new BN(exponent.byteLength()).muln(gasPrice)
      break
    }
    case '20': {
      const sha3WordCost = new BN(common.param('gasPrices', 'sha3Word'))
      const expansion_cost = memoryExtensionCost(
        inputs.offset,
        inputs.count,
        inputs.memorySize,
      )
      result = expansion_cost.iadd(
        sha3WordCost.imul(toWordCount(new BN(inputs.count))),
      )
      break
    }
    case 'ff': {
      // calculate SELFDESTRUCT
      break
    }
  }

  return result.add(new BN(opcode.fee)).toString()
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