import { IReferenceItem } from 'types'

export const compilerSemVer = 'v0.8.10'
export const compilerVersion = `soljson-${compilerSemVer}+commit.fc410830`

/**
 * Gets target EVM version from a hardfork name
 *
 * @param forkName The String harffork name
 * @returns The String matching target EVM version
 * @see https://docs.soliditylang.org/en/v0.8.10/using-the-compiler.html#target-options
 */
export const getTargetEvmVersion = (forkName: string | undefined) => {
  if (forkName === 'dao') {
    return 'homestead'
  }
  if (forkName === 'muirGlacier') {
    return 'berlin'
  }
  if (forkName === 'arrowGlacier') {
    return 'london'
  }
  return forkName
}

/**
 * Gets bytecode from mnemonic
 *
 * @param code The string code
 * @param opcodes The IReferenceItem array of opcodes
 * @returns The string bytecode
 */
export const getBytecodeFromMnemonic = (code: string, opcodes: IReferenceItem[]) => {
  let bytecode = ''
  const lines = code.split('\n')

  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i]
      .replace(/\/\/.*/, '')
      .trim()
      .toUpperCase()

    if (line.length === 0) {
      continue
    }

    if (line.startsWith('PUSH')) {
      const parts = line.split(/\s+/)

      if (parts.length !== 2) {
        throw new Error('Expect PUSH instruction followed by a number: ' + line)
      }

      const code = opcodes.find((opcode: IReferenceItem) => {
        return opcode.name === parts[0]
      })

      if (typeof code === 'undefined') {
        throw new Error('Unknown mnemonic: ' + parts[0])
      }

      const number = parseInt(parts[0].substring(4))
      const digits = number * 2

      if (parts[1].length > digits) {
        throw new Error(
          'Number should have at most ' + digits + ' digits: ' + line,
        )
      }

      // TODO: Add number checks
      bytecode += code.opcodeOrAddress
      bytecode =
        bytecode.padEnd(bytecode.length + digits - parts[1].length, '0') +
        parts[1]
    } else {
      const code = opcodes.find((opcode: IReferenceItem) => {
        return opcode.name === line
      })
      if (typeof code === 'undefined') {
        throw new Error('Unknown mnemonic: ' + line)
      }

      bytecode += code.opcodeOrAddress
    }
  }

  return bytecode
}
