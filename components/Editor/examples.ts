import { ExampleCode } from './types'

const examples: ExampleCode = {
  Bytecode: ['604260005260206000F3'],
  Mnemonic: [
    `PUSH1 0x42
PUSH1 0
MSTORE
PUSH1 32
PUSH1 0
RETURN`,
  ],
}

export default examples
