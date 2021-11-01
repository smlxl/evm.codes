type GroupLabel = {
  [group: string]: string
}

type ForkColor = {
  [fork: string]: string
}

export const groupLabels: GroupLabel = {
  'Stop and Arithmetic Operations': 'Stop & Arithmetic',
  'Comparison & Bitwise Logic Operations': 'Comparison & Bitwise',
  'Environmental Information': 'Environment',
  'Block Information': 'Block',
  'Stack Memory Storage and Flow Operations': 'Stack & Memory',
  'Push Operations': 'Push',
  'Duplication Operations': 'Duplication',
  'Exchange Operations': 'Exchange',
  'System operations': 'System',
}

export const hardforkColor: ForkColor = {
  chainstart: 'bg-ping-300',
  homestead: 'bg-purple-300',
  dao: 'bg-indigo-300',
  tangerineWhistle: 'bg-blue-300',
  spuriousDragon: 'bg-green-300',
  byzantium: 'bg-yellow-300',
  constantinople: 'bg-red-300',
  petersburg: 'bg-orange-300',
  istanbul: 'bg-teal-300',
  muirGlacier: 'bg-sky-300',
  berlin: 'bg-violet-300',
  london: 'bg-rose-300',
  merge: 'bg-fuchsia-300',
  shanghai: 'bg-lime-300',
}

// Combine values of `hardforkOpcodes` and `eipOpcodes`
// See: https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/vm/src/evm/opcodes/codes.ts#L197

const hardforkOpcodes = [
  {
    hardforkName: 'homestead',
    opcodes: {
      0xf4: { name: 'DELEGATECALL', isAsync: true }, // EIP 7
    },
  },
  {
    hardforkName: 'tangerineWhistle',
    opcodes: {
      0x54: { name: 'SLOAD', isAsync: true },
      0xf1: { name: 'CALL', isAsync: true },
      0xf2: { name: 'CALLCODE', isAsync: true },
      0x3b: { name: 'EXTCODESIZE', isAsync: true },
      0x3c: { name: 'EXTCODECOPY', isAsync: true },
      0xf4: { name: 'DELEGATECALL', isAsync: true }, // EIP 7
      0xff: { name: 'SELFDESTRUCT', isAsync: true },
      0x31: { name: 'BALANCE', isAsync: true },
    },
  },
  {
    hardforkName: 'byzantium',
    opcodes: {
      0xfd: { name: 'REVERT', isAsync: false }, // EIP 140
      0xfa: { name: 'STATICCALL', isAsync: true }, // EIP 214
      0x3d: { name: 'RETURNDATASIZE', isAsync: true }, // EIP 211
      0x3e: { name: 'RETURNDATACOPY', isAsync: true }, // EIP 211
    },
  },
  {
    hardforkName: 'constantinople',
    opcodes: {
      0x1b: { name: 'SHL', isAsync: false }, // EIP 145
      0x1c: { name: 'SHR', isAsync: false }, // EIP 145
      0x1d: { name: 'SAR', isAsync: false }, // EIP 145
      0x3f: { name: 'EXTCODEHASH', isAsync: true }, // EIP 1052
      0xf5: { name: 'CREATE2', isAsync: true }, // EIP 1014
    },
  },
  {
    hardforkName: 'istanbul',
    opcodes: {
      0x46: { name: 'CHAINID', isAsync: false }, // EIP 1344
      0x47: { name: 'SELFBALANCE', isAsync: false }, // EIP 1884
    },
  },
  {
    hardforkName: 'berlin',
    opcodes: {
      0x5c: { name: 'BEGINSUB', isAsync: false },
      0x5d: { name: 'RETURNSUB', isAsync: false },
      0x5e: { name: 'JUMPSUB', isAsync: false },
    },
  },
  {
    hardforkName: 'london',
    opcodes: {
      0x48: { name: 'BASEFEE', isAsync: false },
    },
  },
]

/**
 * Finds a hardfork for a given opcode
 * @param opcode The decimal number opcode
 * @returns The hard fork name
 */
export const getHardfork = (opcode: number) => {
  const foundFork = hardforkOpcodes.find((fork) => opcode in fork.opcodes)
  return foundFork ? foundFork.hardforkName : null
}
