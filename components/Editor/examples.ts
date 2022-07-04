import { ExampleCode } from './types'

const examples: ExampleCode = {
  Yul: [
    `object "Contract" {
    // This is the constructor code of the contract.
    code {
        // Deploy the contract
        datacopy(0, dataoffset("runtime"), datasize("runtime"))
        return(0, datasize("runtime"))
    }

    object "runtime" {
        code {
            // Protection against sending Ether
            if gt(callvalue(), 0) {
                revert(0, 0)
            }

            // Dispatcher
            switch selector()
            case 0x6d4ce63c {
                returnUint(get())
            }
            case 0x371303c0 {
                inc()
            }
            case 0xb3bcfa82 {
                dec()
            }
            default {
                revert(0, 0)
            }

            // ABI
            function get() -> counter {
                counter := sload(counterSlot())
            }

            function inc() {
                sstore(counterSlot(), add(get(), 1))
            }

            function dec() {
                sstore(counterSlot(), sub(get(), 1))
            }

            // Helpers
            function selector() -> s {
                s := div(calldataload(0), 0x100000000000000000000000000000000000000000000000000000000)
            }

            function returnUint(v) {
                mstore(0, v)
                return(0, 0x20)
            }

            // Slots
            function counterSlot() -> s { s := 0 }
        }
    }
  }`,
  ],
  Solidity: [
    `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract Counter {
    uint public count;

    // Function to get the current count
    function get() public view returns (uint) {
        return count;
    }

    // Function to increment count by 1
    function inc() public {
        count += 1;
    }

    // Function to decrement count by 1
    function dec() public {
        count -= 1;
    }
}`,
  ],
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
