import Common from '@ethereumjs/common'
import { BN } from 'ethereumjs-util'
import { IOpcode } from 'types'

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

  switch (opcode.code) {
    case '0a': {
      const exponent = new BN(inputs.exponent)
      const byteLength = exponent.byteLength()
      const gasPrice = common.param('gasPrices', 'expByte')
      result = new BN(byteLength).muln(gasPrice)

      break
    }
    case '20': {
      // calculate SHA3
      break
    }
    case 'ff': {
      // calculate SELFDESTRUCT
      break
    }
  }

  return result.toString()
}
