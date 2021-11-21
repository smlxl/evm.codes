import type { NextPage } from 'next'
import Link from 'next/link'

import HomeLayout from 'components/layouts/Home'
import { Container, H1, H2, H3 } from 'components/ui'

const OLink = ({ opcode, title }: { opcode?: string; title: string }) => (
  <Link href={opcode ? `/#${opcode}` : '/'} passHref>
    <a className="underline font-mono">{title}</a>
  </Link>
)

const AboutPage = () => {
  return (
    <Container className="text-sm leading-6">
      <H1>About the EVM</H1>

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
        ) is a stack-based computer. It means that all instructions take their
        parameters from the stack, and write their results on the stack. Each
        instruction thus has a stack input, the parameters that it needs (if
        any), and a stack output, the return values (if any). All instructions
        are encoded on 1 byte, with the exception of the{' '}
        <OLink opcode="60" title="PUSH1" /> instruction, which allows to put an
        arbitrary value on the stack and encode the value directly after the
        instruction. The list of instructions available, with their opcodes, is
        shown <OLink title="here" />.
      </p>
      <p className="pt-4 pb-10">
        An instruction is assigned an arbitrary value between 0 and 255 (or FF
        in hexadecimal), called the opcode, and a mnemonic, which is a text
        representation that helps us human read the instruction. A smart
        contract is a set of instructions. When the EVM executes a smart
        contract, it reads and executes each instruction one by one. If an
        instruction cannot be executed (for example because there are not enough
        values on the stack), the smart contract fails.
      </p>

      <H2 className="mb-6">Execution environment</H2>
      <p className="pb-8">
        When the EVM executes a smart contract, a context is created for it. The
        context is made of several memory regions, each with its own purpose.
      </p>

      <H3 className="mb-4">The code</H3>
      <p className="pb-8">
        The code is the region where the instructions are stored. It is
        persistent and part of an account properties. During smart contract
        execution, these are the bytes that the EVM will read, interpret and
        execute. This is a region that cannot be modified, but can be read with
        the instructions <OLink opcode="38" title="CODESIZE" /> and{' '}
        <OLink opcode="39" title="CODECOPY" />. Other contracts code can also be
        read with <OLink opcode="3B" title="EXTCODESIZE" /> and{' '}
        <OLink opcode="3B" title="EXTCODECOPY" />. The program counter (PC)
        encodes which instruction should be read next by the EVM in this region.
        An externally owned account (or EOA) has an empty code region.
      </p>

      <H3 className="mb-4">The stack</H3>
      <p className="pb-8">
        The stack is a list of 32-byte elements. The stack is used to put the
        parameters that are needed by the instructions, and their result values.
        When a new value is put on the stack, it is put on top, and only the top
        values are used by the instructions. The stack currently has a maximum
        limit of 1024 values. All instructions interact with the stack, but it
        can be directly manipulated with instructions like{' '}
        <OLink opcode="60" title="PUSH1" />, <OLink opcode="50" title="POP" />,{' '}
        <OLink opcode="80" title="DUP1" />, or{' '}
        <OLink opcode="90" title="SWAP1" />.
      </p>

      <H3 className="mb-4">The memory</H3>
      <p className="pb-8">
        The memory is a region that only exists during the smart contract
        execution, and is accessed with a byte offset. While all the 32-byte
        address space is available and initialized to 0, the size is counted
        with the highest address that was accessed. It is generally read and
        written with <OLink opcode="51" title="MLOAD" /> and{' '}
        <OLink opcode="52" title="MSTORE" /> instructions, but is also used by
        other instructions like <OLink opcode="F0" title="CREATE" /> or{' '}
        <OLink opcode="F3" title="EXTCODECOPY" />.
      </p>

      <H3 className="mb-4">The storage</H3>
      <p className="pb-8">
        The storage is the persistent memory of the smart contract. It is a map
        of the 32-byte slot to 32-byte value, and each value written is kept
        until it is set to 0 or the contract self-destruction. Reading from an
        unset key also returns 0. It is read and written with the instructions{' '}
        <OLink opcode="54" title="SLOAD" /> and{' '}
        <OLink opcode="55" title="SSTORE" />.
      </p>

      <H3 className="mb-4">The call data</H3>
      <p className="pb-8">
        The call data region is the data that is sent with a transaction. In the
        case of contract creation, it would be the constructor code. This region
        is immutable and can be read with the instructions{' '}
        <OLink opcode="35" title="CALLDATALOAD" />,{' '}
        <OLink opcode="36" title="CALLDATASIZE" />, and{' '}
        <OLink opcode="37" title="CALLDATACOPY" />.
      </p>

      <H3 className="mb-4">The return data</H3>
      <p className="pb-8">
        The return data region is the way a smart contract can return a value
        after a call. It can be set by external contract calls through the{' '}
        <OLink opcode="F3" title="RETURN" /> and{' '}
        <OLink opcode="FD" title="REVERT" /> instructions and can be read by the
        calling contract with <OLink opcode="3D" title="RETURNDATASIZE" /> and{' '}
        <OLink opcode="3E" title="RETURNDATACOPY" />.
      </p>
    </Container>
  )
}

AboutPage.getLayout = function getLayout(page: NextPage) {
  return <HomeLayout>{page}</HomeLayout>
}

export default AboutPage
