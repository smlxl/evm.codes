const Common = require('@ethereumjs/common').default
const Chain = require('@ethereumjs/common').Chain
const VM = require('../../dist').default
const BN = require('bn.js')

// Globals
const hardforkStorageKey = 'evm.codes.hardfork'
const chainStorageKey = 'evm.codes.chain'
const gasLimit = new BN(0xffffffffffff)
let storage = window.localStorage

// VM
let vm = null
const storageMemory = new Map()
const common = new Common({ chain: Chain.Mainnet })

// Synchronisation for VM step
let shouldfinishExecution = false
let nextStepFunction = null
let executionResult = null

// Extra info to display per opcode
const extraOpcodeInfo = [
  ["Stack input", "Stack output", "Description", "Note", "Group"],
  ["[ ...", "[ ...", "Halts execution", "", "Stop and Arithmetic Operations"],
  ["[ a, b...", "[ a+b...", "Addition operation", "", "Stop and Arithmetic Operations"],
  ["[ a, b...", "[ a*b...", "Multiplication operation", "", "Stop and Arithmetic Operations"],
  ["[ a, b...", "[ a-b...", "Subtraction operation", "", "Stop and Arithmetic Operations"],
  ["[ a, b...", "If b is 0: [ 0...\nelse: [ a/b...", "Integer division operation", "", "Stop and Arithmetic Operations"],
  ["[ a, b...", "If b is 0: [ 0...\nelse: [ a/b...", "Signed integer division operation (truncated)", "Where all values are treated as two’s complement signed 256-bit integers. Note the overflow semantic when −2**255 is negated", "Stop and Arithmetic Operations"],
  ["[ a, b...", "If b is 0: [ 0...\nelse: [ a%b...", "Modulo remainder operation", "", "Stop and Arithmetic Operations"],
  ["[ a, b...", "If b is 0: [ 0...\nelse: [ a%b...", "Signed modulo remainder operation", "Where all values are treated as two’s complement signed 256-bit integers", "Stop and Arithmetic Operations"],
  ["[ a, b, N...", "If N is 0: [ 0...\nelse: [ (a+b)%N...", "Modulo addition operation", "All intermediate calculations of this operation are not subject to the 2**256 modulo", "Stop and Arithmetic Operations"],
  ["[ a, b, N...", "If c is 0: [ 0...\nelse: [ (a*b)%N...", "Modulo multiplication operation", "All intermediate calculations of this operation are not subject to the 2**256 modulo", "Stop and Arithmetic Operations"],
  ["[ a, b...", "[ a**b...", "Exponential operation", "", "Stop and Arithmetic Operations"],
  ["[ b, x...", "[ x...", "Extend length of two’s complement signed integer", "x is the value, b is the size of x in bytes", "Stop and Arithmetic Operations"],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["[ a, b...", "If a < b: [ 1...\nelse: [ 0...", "Less-than comparison", "", "Comparison & Bitwise Logic Operations"],
  ["[ a, b...", "If a > b: [ 1...\nelse: [ 0...", "Greater-than comparison", "", "Comparison & Bitwise Logic Operations"],
  ["[ a, b...", "If a < b: [ 1...\nelse: [ 0...", "Signed less-than comparison", "Where all values are treated as two’s complement signed 256-bit integers", "Comparison & Bitwise Logic Operations"],
  ["[ a, b...", "If a < b: [ 1...\nelse: [ 0...", "Signed greater-than comparison", "Where all values are treated as two’s complement signed 256-bit integers", "Comparison & Bitwise Logic Operations"],
  ["[ a, b...", "If a = b: [ 1...\nelse: [ 0...", "Equality comparison", "", "Comparison & Bitwise Logic Operations"],
  ["[ a...", "If a = 0: [ 1...\nelse: [ 0...", "Simple not operator", "", "Comparison & Bitwise Logic Operations"],
  ["[ a, b...", "[ a&b...", "Bitwise AND operation", "", "Comparison & Bitwise Logic Operations"],
  ["[ a, b...", "[ a|b...", "Bitwise OR operation", "", "Comparison & Bitwise Logic Operations"],
  ["[ a, b...", "[ a^b...", "Bitwise XOR operation", "", "Comparison & Bitwise Logic Operations"],
  ["[ a...", "[ ~a", "Bitwise NOT operation", "", "Comparison & Bitwise Logic Operations"],
  ["[ i, x...", "[ x[31-i]...", "Retrieve single byte from word", "", "Comparison & Bitwise Logic Operations"],
  ["[ shift, value...", "[ value << shift...", "Left shift operation", "", "Comparison & Bitwise Logic Operations"],
  ["[ shift, value...", "[ value >> shift...", "Logical right shift operation", "", "Comparison & Bitwise Logic Operations"],
  ["[ shift, value...", "[ value >> shift...", "Arithmetic (signed) right shift operation", "value is treated as two’s complement signed 256-bit integers", "Comparison & Bitwise Logic Operations"],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["[ offset, length...", "[ hash(memory[offset:offset+length])...", "Compute Keccak-256 hash", "offset and length in bytes", "SHA3"],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["[ ...", "[ address...", "Get address of currently executing account", "", "Environmental Information"],
  ["[ address...", "If address exists: [ balance...\nelse: [ 0...", "Get balance of the given account", "Unit is wei", "Environmental Information"],
  ["[ ...", "[ address...", "Get execution origination address", "This is the sender of original transaction; it is never an account with non-empty associated code.", "Environmental Information"],
  ["[ ...", "[ address...", "Get caller address", "This is the address of the account that is directly responsible for this execution", "Environmental Information"],
  ["[ ...", "[ value...", "Get deposited value by the instruction/transaction responsible for this execution", "Unit is wei", "Environmental Information"],
  ["[ i...", "[ data[i]...", "Get input data of current environment", "256-bit chunk of calldata", "Environmental Information"],
  ["[ ...", "[ size...", "Get size of input data in current environment", "Size in bytes", "Environmental Information"],
  ["[ destOffset, offset, length...", "[ ...", "Copy input data in current environment to memory", "Copy calldata to memory, values in byte, copy 0s if out of bounds", "Environmental Information"],
  ["[ ...", "[ size...", "Get size of code running in current environment", "Size in bytes", "Environmental Information"],
  ["[ destOffset, offset, length...", "[ ...", "Copy code running in current environment to memory", "Copy code to memory, values in byte, copy 0s if out of bounds", "Environmental Information"],
  ["[ ...", "[ price...", "Get price of gas in current environment", "This is gas price specified by the originating transaction in wei per gas", "Environmental Information"],
  ["[ address...", "[ size...", "Get size of an account’s code", "Size in bytes", "Environmental Information"],
  ["[ address, destOffset, offset, length...", "", "Copy an account’s code to memory", "Copy code to memory, values in byte, copy 0s if out of bounds", "Environmental Information"],
  ["[ ...", "[ size...", "Get size of output data from the previous call from the current environment", "Size in bytes", "Environmental Information"],
  ["[ destOffset, offset, length...", "[ ...", "Copy output data from the previous call to memory", "All parameters in byte", "Environmental Information"],
  ["[ address...", "If address has code: [ hash...\nelse: [ 0...", "Get hash of an account’s code", "", "Environmental Information"],
  ["[ blockNumber...", "[ hash...", "Get the hash of one of the 256 most recent complete blocks", "If the block number is equal or higher than the current one, or if it is older than the last 256 blocks, writes 0", "Block Information"],
  ["[ ...", "[ address...", "Get the block’s beneficiary address", "Miner's address", "Block Information"],
  ["[ ...", "[ timestamp", "Get the block’s timestamp", "Unix timestamp", "Block Information"],
  ["[ ...", "[ blockNumber...", "Get the block’s number", "", "Block Information"],
  ["[ ...", "[ difficulty...", "Get the block’s difficulty", "", "Block Information"],
  ["[ ...", "[ gasLimit...", "Get the block’s gas limit", "", "Block Information"],
  ["[ ...", "[ chainId...", "Get the chain ID", "1 for mainnet", "Block Information"],
  ["[ ...", "[ balance...", "Get balance of currently executing account", "Unit is wei", "Block Information"],
  ["[ ...", "[ baseFee...", "Get the base fee", "Unit is wei", "Block Information"],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["[ x...", "[ ...", "Remove item from stack", "", "Stack Memory Storage and Flow Operations"],
  ["[ offset...", "[ memory[offset:offset+32]...", "Load word from memory", "Offset in bytes", "Stack Memory Storage and Flow Operations"],
  ["[ offset, value...", "[ ...", "Save word to memory", "Offset in bytes", "Stack Memory Storage and Flow Operations"],
  ["[ offset, value...", "[ ...", "Save byte to memory", "Offset in bytes", "Stack Memory Storage and Flow Operations"],
  ["[ key...", "[ storage[key]...", "Load word from storage", "Reading from an unset key returns 0", "Stack Memory Storage and Flow Operations"],
  ["[ key, value...", "[ ...", "Save word to storage", "Storing 0 erases the value", "Stack Memory Storage and Flow Operations"],
  ["[ counter...", "[ ...", "Alter the program counter", "Can only jump to JUMPDEST instruction", "Stack Memory Storage and Flow Operations"],
  ["[ counter, b...", "[ ...", "Conditionally alter the program counter", "If b is not 0, do the jump, otherwise execute command right after; can only jump to JUMPDEST instruction", "Stack Memory Storage and Flow Operations"],
  ["[ ...", "[ counter...", "Get the value of the program counter prior to the increment corresponding to this instruction", "", "Stack Memory Storage and Flow Operations"],
  ["[ ...", "[ size...", "Get the size of active memory in bytes", "", "Stack Memory Storage and Flow Operations"],
  ["[ ...", "[ gas...", "Get the amount of available gas, including the corresponding reduction for the cost of this instruction", "", "Stack Memory Storage and Flow Operations"],
  ["[ ...", "[ ...", "Mark a valid destination for jumps", "This operation has no effect on machine state during execution", "Stack Memory Storage and Flow Operations"],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["[ ...", "[ value...", "Place 1 byte item on stack", "The byte is read in line from the program code’s bytes array; the byte is right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 2 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 3 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 4 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 5 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 6 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 7 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 8 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 9 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 10 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 11 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 12 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 13 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 14 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 15 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 16 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 17 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 18 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 19 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 20 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 21 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 22 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 23 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 24 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 25 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 26 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 27 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 28 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 29 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 30 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 31 byte item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ ...", "[ value...", "Place 32 byte (full word) item on stack", "The bytes are read in line from the program code’s bytes array; the bytes are right-aligned (takes the lowest significant place in big endian)", "Push Operations"],
  ["[ value...", "[ value, value...", "Duplicate 1st stack item", "", "Duplication Operations"],
  ["[ a, b...", "[ b, a, b...", "Duplicate 2nd stack item", "", "Duplication Operations"],
  ["[ a, b, c...", "[ c, a, b, c...", "Duplicate 3rd stack item", "", "Duplication Operations"],
  ["[ ...value...", "[ value...value...", "Duplicate 4th stack item", "", "Duplication Operations"],
  ["[ ...value...", "[ value...value...", "Duplicate 5th stack item", "", "Duplication Operations"],
  ["[ ...value...", "[ value...value...", "Duplicate 6th stack item", "", "Duplication Operations"],
  ["[ ...value...", "[ value...value...", "Duplicate 7th stack item", "", "Duplication Operations"],
  ["[ ...value...", "[ value...value...", "Duplicate 8th stack item", "", "Duplication Operations"],
  ["[ ...value...", "[ value...value...", "Duplicate 9th stack item", "", "Duplication Operations"],
  ["[ ...value...", "[ value...value...", "Duplicate 10th stack item", "", "Duplication Operations"],
  ["[ ...value...", "[ value...value...", "Duplicate 11th stack item", "", "Duplication Operations"],
  ["[ ...value...", "[ value...value...", "Duplicate 12th stack item", "", "Duplication Operations"],
  ["[ ...value...", "[ value...value...", "Duplicate 13th stack item", "", "Duplication Operations"],
  ["[ ...value...", "[ value...value...", "Duplicate 14th stack item", "", "Duplication Operations"],
  ["[ ...value...", "[ value...value...", "Duplicate 15th stack item", "", "Duplication Operations"],
  ["[ ...value...", "[ value...value...", "Duplicate 16th stack item", "", "Duplication Operations"],
  ["[ a, b...", "[ b, a...", "Exchange 1st and 2nd stack items", "", "Exchange Operations"],
  ["[ a, b, c...", "[ c, b, a...", "Exchange 1st and 3rd stack items", "", "Exchange Operations"],
  ["[ a...b...", "[ b...a...", "Exchange 1st and 4th stack items", "", "Exchange Operations"],
  ["[ a...b...", "[ b...a...", "Exchange 1st and 5th stack items", "", "Exchange Operations"],
  ["[ a...b...", "[ b...a...", "Exchange 1st and 6th stack items", "", "Exchange Operations"],
  ["[ a...b...", "[ b...a...", "Exchange 1st and 7th stack items", "", "Exchange Operations"],
  ["[ a...b...", "[ b...a...", "Exchange 1st and 8th stack items", "", "Exchange Operations"],
  ["[ a...b...", "[ b...a...", "Exchange 1st and 9th stack items", "", "Exchange Operations"],
  ["[ a...b...", "[ b...a...", "Exchange 1st and 10th stack items", "", "Exchange Operations"],
  ["[ a...b...", "[ b...a...", "Exchange 1st and 11th stack items", "", "Exchange Operations"],
  ["[ a...b...", "[ b...a...", "Exchange 1st and 12th stack items", "", "Exchange Operations"],
  ["[ a...b...", "[ b...a...", "Exchange 1st and 13th stack items", "", "Exchange Operations"],
  ["[ a...b...", "[ b...a...", "Exchange 1st and 14th stack items", "", "Exchange Operations"],
  ["[ a...b...", "[ b...a...", "Exchange 1st and 15th stack items", "", "Exchange Operations"],
  ["[ a...b...", "[ b...a...", "Exchange 1st and 16th stack items", "", "Exchange Operations"],
  ["[ a...b...", "[ b...a...", "Exchange 1st and 17th stack items", "", "Exchange Operations"],
  ["[ offset, length...", "[ ...", "Append log record with no topics", "offset and length to memory in bytes", "Logging Operations"],
  ["[ offset, length, topic...", "[ ...", "Append log record with one topic", "offset and length to memory in bytes", "Logging Operations"],
  ["[ offset, length, topic1, topic2...", "[ ...", "Append log record with four topics", "offset and length to memory in bytes", "Logging Operations"],
  ["[ offset, length, topic1, topic2, topic3...", "[ ...", "Append log record with four topics", "offset and length to memory in bytes", "Logging Operations"],
  ["[ offset, length, topic1, topic2, topic3, topic4...", "[ ...", "Append log record with four topics", "offset and length to memory in bytes", "Logging Operations"],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["[ value, offset, length...", "[ address...", "Create a new account with associated code", "offset and length to memory in bytes, point to the code of the new contract", "System operations"],
  ["[ gas, address, value, argsOffset, argsLength, retOffset, retLength...", "[ success...", "Message-call into an account", "", "System operations"],
  ["[ gas, address, value, argsOffset, argsLength, retOffset, retLength...", "[ success...", "Message-call into this account with alternative account’s code", "In fact the same account as at present is called, simply that the code is overwritten", "System operations"],
  ["[ offset, length...", "[ ...", "Halt execution returning output data", "offset and length to memory in bytes", "System operations"],
  ["[ gas, address, argsOffset, argsLength, retOffset, retLength...", "[ success...", "Message-call into this account with an alternative account’s code, but persisting the current values for sender and value", "In fact the same account as at present is called, simply that the code is overwritten and the context is almost entirely identical", "System operations"],
  ["[ value, offset, length, salt...", "[ address...", "Create a new account with associated code", "Exactly equivalent to CREATE, except the salt allows to create at a deterministic address", "System operations"],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["[ gas, address, argsOffset, argsLength, retOffset, retLength...", "[ success...", "Static message-call into an account", "Equivalent to call with value set to 0", "System operations"],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["[ offset, length...", "[ ...", "Halt execution reverting state changes but returning data and remaining gas", "offset and length to memory in bytes", "System operations"],
  ["[ ...", "[ ...", "Designated invalid instruction", "", "System operations"],
  ["[ address...", "[ ...", "Halt execution and register account for later deletion", "The balance of the current contract is sent to the address", "System operations"]
]

// Utility functions

function addRowElement(row, element) {
  row.insertCell().appendChild(document.createTextNode(element))
}

function updateVmInstance() {
  vm = new VM({ common })
  vm.on('step', vmStep)

  // Hack the state manager so that we can track the stored variables
  vm.stateManager.originalPutContractStorage = vm.stateManager.putContractStorage
  vm.stateManager.originalClearContractStorage = vm.stateManager.clearContractStorage
  vm.stateManager.putContractStorage = localPutContractStorage
  vm.stateManager.clearContractStorage = localClearContractStorage
  storageMemory.clear()
}

function localPutContractStorage(address, key, value) {
  if (value === 0) {
    storageMemory.delete(key)
  }
  else {
    storageMemory.set(key, value)
  }

  return vm.stateManager.originalPutContractStorage(address, key, value)
}

function localClearContractStorage(address) {
  storageMemory.clear()
  return vm.stateManager.originalClearContractStorage(address)
}

// Table functions

function listChains() {
  const select = document.getElementById("chains");
  select.innerHTML = "" // Clear it first

  for (let item in Chain) {
    if (isNaN(Number(item))) {
      select.add(new Option(item))
    }
  }

  // We remember the last chain selected
  const lastSet = storage.getItem(chainStorageKey)
  if (!lastSet) {
    select.selectedIndex = 0
    storage.setItem(chainStorageKey, 0)
    // Make sure we have a valid hardfork
    storage.setItem(hardforkStorageKey, 0)
  }
  else {
    select.selectedIndex = lastSet
  }

  common.setChain(select.value.toLowerCase())
  listHardForks()
}

function listHardForks() {
  const select = document.getElementById("hardforks");
  select.innerHTML = "" // Clear it first

  common.hardforks().forEach(value => {
    select.add(new Option(value.name))
  })

  // We remember the last hardfork selected
  const lastSet = storage.getItem(hardforkStorageKey)
  if (!lastSet) {
    select.selectedIndex = 0
    storage.setItem(hardforkStorageKey, 0)
  }
  else {
    select.selectedIndex = lastSet
  }

  common.setHardfork(select.value)
  updateVmInstance()
  resetTable()
}

function onChainChange(select) {
  // Remember the last chain selected
  storage.setItem(chainStorageKey, select.target.selectedIndex)
  storage.setItem(hardforkStorageKey, 0)
  common.setChain(select.target.value.toLowerCase())

  document.getElementById("executeArea").hidden = true
  finishExecution()
  listHardForks()
}

function onHardForkChange(select) {
  // Remember the last hardfork selected
  storage.setItem(hardforkStorageKey, select.target.selectedIndex)
  common.setHardfork(select.target.value)

  document.getElementById("executeArea").hidden = true
  finishExecution()

  updateVmInstance()
  resetTable()
}

function resetTable() {
  let table = document.getElementById("opcodes");
  table.innerHTML = "" // Clear it first

  let head = table.createTHead().insertRow()
  addRowElement(head, "Opcode")
  addRowElement(head, "Mnemonic")
  addRowElement(head, "Gas cost")

  extraOpcodeInfo[0].forEach(value => {
    addRowElement(head, value)
  })

  let body = table.createTBody()

  vm.getActiveOpcodes().forEach(value => {
    let row = body.insertRow()
    row.id = value.code

    addRowElement(row, value.code.toString(16).toUpperCase().padStart(2, '0'))
    addRowElement(row, value.fullName)
    addRowElement(row, value.fee)

    extraOpcodeInfo[value.code + 1].forEach(value => {
      addRowElement(row, value)
    })
  })
}

// Execution functions

function loadInstructions(hexaString) {
  const htmlInstructions = document.getElementById("instructions")
  const opcodes = vm.getActiveOpcodes()

  htmlInstructions.innerHTML = ""

  for (let i = 0; i < hexaString.length; i += 2) {
    let instruction = parseInt(hexaString.slice(i, i + 2), '16')
    let row = htmlInstructions.insertRow()
    let opcode = opcodes.get(instruction)

    if (!opcode) {
      addRowElement(row, 'INVALID')
    }
    else if (opcode.name === 'PUSH') {
      let count = parseInt(opcode.fullName.slice(4), '10') * 2
      addRowElement(row, opcode.fullName + ' ' + hexaString.slice(i + 2, i + 2 + count))
      i += count
    }
    else {
      addRowElement(row, opcode.fullName)
    }
  }
}

function popInstruction() {
  document.getElementById("instructions").deleteRow(0)
}

function loadStack(stack) {
  let htmlStack = document.getElementById("stack")
  htmlStack.innerHTML = ""

  stack.forEach(value => {
    addRowElement(htmlStack.insertRow(0), value.toString('hex'))
  })
}

function loadMemory(memory) {
  document.getElementById("memory").innerText = memory.map(x => x.toString(16).padStart(2, '0'))
    .join('')
}

async function loadStorage() {
  let htmlStorage = document.getElementById("storage")
  htmlStorage.innerHTML = ""

  storageMemory.forEach((value, key) => {
    const row = htmlStorage.insertRow()
    addRowElement(row, key.map(x => x.toString(16).padStart(2, '0')).join(''))
    addRowElement(row, value.map(x => x.toString(16).padStart(2, '0')).join(''))
  })
}

function startExecution(code) {
  // Make sure of the state
  finishExecution()

  nextStepFunction = null
  shouldfinishExecution = false

  executionResult = vm.runCode({ code: Buffer.from(code, 'hex'), gasLimit: gasLimit })
  executionResult.then(results => {
    nextStepFunction = null

    if (results.exceptionError) {
      alert(results.exceptionError.error)
      return
    }

    document.getElementById("currentPC").innerText = results.runState.programCounter.toString()
    document.getElementById("currentGasCost").innerText = '0'
    document.getElementById("totalGasCost").innerText = results.gasUsed.toString()
    document.getElementById("returnValue").innerText = results.returnValue.toString('hex')

    loadStack(results.runState.stack._store)
    loadMemory(results.runState.memory._store)
    loadStorage()

  }).catch(console.error)
}

async function finishExecution() {
  if (!nextStepFunction) {
    return
  }

  shouldfinishExecution = true
  buttonStep()
  await executionResult
}

function vmStep(data, continueFunction) {
  document.getElementById("currentPC").innerText = data.pc
  document.getElementById("currentGasCost").innerText = data.opcode.fee
  document.getElementById("totalGasCost").innerText = (gasLimit - data.gasLeft).toString()
  document.getElementById("returnValue").innerText = ''

  loadStack(data.stack)
  loadMemory(data.memory)
  loadStorage()

  nextStepFunction = continueFunction
  if (shouldfinishExecution) {
    buttonStep()
  }
}

function textToInstructions() {
  const textArea = document.getElementById("submittedInstructions")
  const hex = /^[0-9a-fA-F]+$/;

  if (textArea.textLength === 0) {
    alert('No code found')
    return
  } else if (textArea.textLength % 2 !== 0) {
    alert('There should be 2 characters per byte')
    return
  } else if (!hex.test(textArea.value)) {
    alert('Only hexadecimal characters are allowed')
    return
  }

  let instructions = textArea.value
  loadInstructions(instructions)
  startExecution(instructions)

  document.getElementById("executeArea").hidden = false
}

function buttonResetExecute() {
  textToInstructions()
}

function buttonStep() {
  if (!nextStepFunction) {
    return
  }

  popInstruction()
  nextStepFunction()
}

function buttonContinue() {
  finishExecution()
}

// Init code

listChains()
document.getElementById("hardforks").addEventListener('input', onHardForkChange)
document.getElementById("chains").addEventListener('input', onChainChange)
document.getElementById("resetExecute").onclick = buttonResetExecute
document.getElementById("executeAll").onclick = buttonContinue
document.getElementById("executeNext").onclick = buttonStep
