import type { NextPage } from 'next'

import HomeLayout from 'components/layouts/Home'
import { Container, H1, H2, H3 } from 'components/ui'

const AboutPage = () => {
  return (
    <Container className="text-sm">
      <H1>About EVM</H1>

      <H2 className="mb-6">Introduction</H2>
      <p>
        The ethereum virtual machine (or{' '}
        <a
          href="https://ethereum.org/en/developers/docs/evm/"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          EVM
        </a>
        ) is a stack based computer. It means that all instructions take their
        parameters from the stack, and write their results on the stack. Each
        instruction thus has a stack input, the parameters that it needs (if
        any), and a stack output, the return values (if any). All instruction
        are encoded on 1 byte, with the exception of the{' '}
        <span className="font-mono">PUSH</span> instruction, which allows to put
        an arbitrary value on the stack and encode the value directly after the
        instruction. The list of instructions available, with their opcodes, is
        shown below.
      </p>
      <p className="pt-4 pb-10">
        An instruction is assigned an arbitrary value between 0 and 255 (or FF
        in hexadecimal), the opcode, and a mnemonic, which is a text
        representation that help us human read the instruction. A smart contract
        is a set of instructions. When the EVM executes a smart contract, it
        reads and executes each instruction one by one. If an instruction cannot
        be executed (for example because there are not enough values on the
        stack), the smart contract fails.
      </p>

      <H2 className="mb-6">Execution environment</H2>
      <p className="pb-8">
        When the EVM executes a smart contract, a context is created for it. The
        context is made of several memory regions, each with its own purpose.
      </p>

      <H3 className="mb-4">The code</H3>
      <p className="pb-8">
        The code is the region where the instructions are stored. During a smart
        contract execution, this is the bytes that the EVM will read, interpret
        and execute. This is a region that cannot be modified, but can be read
        with the instructions <span className="font-mono">CODESIZE</span> and{' '}
        <span className="font-mono">CODECOPY</span>. Other contracts code can
        also be read with <span className="font-mono">EXTCODESIZE</span> and{' '}
        <span className="font-mono">EXTCODECOPY</span>. The program counter (PC)
        encodes which instruction should be read next by the EVM in this region.
      </p>

      <H3 className="mb-4">The stack</H3>
      <p className="pb-8">
        The stack is a list of 32-byte elements. The stack is used to put the
        parameters that are needed by the instructions, and their result values.
        When a new value is put on the stack, it is put on top, and only the top
        values are used by the instructions. The stack currently has a maximum
        limit of 1024 values. All instructions interact with the stack, but it
        can be directly manipulated with instructions like{' '}
        <span className="font-mono">PUSH1</span>,{' '}
        <span className="font-mono">POP</span>,{' '}
        <span className="font-mono">DUP1</span> or{' '}
        <span className="font-mono">SWAP1</span>.
      </p>

      <H3 className="mb-4">The memory</H3>
      <p className="pb-8">
        The memory is a region that only exists during the smart contract
        execution, and accessed with a byte offset. While all the 32-byte
        address space is available and initialised to 0, the size is counted
        with the highest address that was accessed. It is generally read and
        written with <span className="font-mono">MLOAD</span> and{' '}
        <span className="font-mono">MSTORE</span> instructions, but is also used
        by other instructions like <span className="font-mono">CREATE</span> or{' '}
        <span className="font-mono">RETURN</span>.
      </p>

      <H3 className="mb-4">The storage</H3>
      <p className="pb-8">
        The storage is thepersistent memory of the smart contract. It is a map
        of 32-byte slot to 32-byte value, and each value written is kept until
        it is set to 0 or the contract self destruction. Reading from an unset
        key also returns 0. It is read and written with the instructions{' '}
        <span className="font-mono">SLOAD</span> and{' '}
        <span className="font-mono">SSTORE</span>.
      </p>

      <H3 className="mb-4">The call data</H3>
      <p className="pb-8">
        The call data region is the data that is sent with a transaction. In the
        case of a contract creation, it would be the constructor code. This
        region is immutable, and can be read with the instructions{' '}
        <span className="font-mono">CALLDATALOAD</span>,{' '}
        <span className="font-mono">CALLDATASIZE</span> and{' '}
        <span className="font-mono">CALLDATACOPY</span>.
      </p>

      <H3 className="mb-4">The return data</H3>
      <p className="pb-8">
        The return data region is the way a smart contract can return a value
        after a call. It can be set by external contract calls through the{' '}
        <span className="font-mono">RETURN</span> and{' '}
        <span className="font-mono">REVERT</span> instructions, and can be read
        by the calling contract with{' '}
        <span className="font-mono">RETURNDATASIZE</span> and{' '}
        <span className="font-mono">RETURNDATACOPY</span>.
      </p>
    </Container>
  )
}

AboutPage.getLayout = function getLayout(page: NextPage) {
  return <HomeLayout>{page}</HomeLayout>
}

export default AboutPage
