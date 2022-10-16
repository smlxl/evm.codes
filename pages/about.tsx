import React from 'react'

import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'

import HomeLayout from 'components/layouts/Home'
import { Container, H1, H2, H3, Icon, RelativeLink } from 'components/ui'
import { Pre } from 'components/ui/Doc'

type SectionWrapperProps = {
  header: React.ReactNode
  anchorKey: string
  children: React.ReactNode
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  header,
  anchorKey,
  children,
}) => {
  return (
    <>
      <html lang="en"></html>
      <React.Fragment>
        <Head>
          <title> EVM Codes - About the EVM </title>
        </Head>
        <meta
          property="og:description"
          content="How does the EVM work? We explain the relationship between opcode
          instructions, gas costs, storage and the execution environment for
          your understanding."
        />
      </React.Fragment>
      <div
        id={anchorKey}
        className="font-mono mb-4 justify-start relative items-center scroll-mt-14"
      >
        <Link href={`/about#${anchorKey}`}>
          <a className="absolute -left-6">
            <Icon name="links-line" className="text-indigo-500" />
          </a>
        </Link>

        {header}
      </div>
      <div>{children}</div>
    </>
  )
}

// NOTE: It seems the memory expansion computation and constants did not change
// since frontier, but we have to keep an eye on new fork to keep this up to date
const AboutPage = () => {
  return (
    <Container className="text-sm leading-6 max-w-4xl">
      <H1>About the EVM</H1>

      <SectionWrapper header={<H2>Introduction</H2>} anchorKey="introduction">
        <p className="pb-6">
          The Ethereum Virtual Machine (or{' '}
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
          instruction thus has stack inputs, the parameters that it needs (if
          any), stack outputs, and the return values (if any). All instructions
          are encoded on 1 byte, with the exception of the PUSH instructions,
          which allows to put an arbitrary value on the stack and encode the
          value directly after the instruction. The list of instructions
          available, with their opcodes, is shown in the{' '}
          <RelativeLink title="reference" />.
        </p>
        <p className="pb-8">
          An instruction is assigned a value between 0 and 255 (or FF in
          hexadecimal), called the opcode, and a mnemonic, which is a text
          representation that helps us human read the instruction. A smart
          contract is a set of instructions. When the EVM executes a smart
          contract, it reads and executes each instruction one by one. If an
          instruction cannot be executed (for example because there are not
          enough values on the stack), the execution reverts.
        </p>
      </SectionWrapper>

      <SectionWrapper
        header={<H2>Execution environment</H2>}
        anchorKey="executionenv"
      >
        <p className="pb-8">
          When the EVM executes a smart contract, a context is created for it.
          The context is made of several memory regions, each with its own
          purpose.
        </p>
      </SectionWrapper>

      <SectionWrapper header={<H3>The code</H3>} anchorKey="code">
        <p className="pb-8">
          The code is the region where the instructions are stored. It is
          persistent and part of an account properties. During smart contract
          execution, these are the bytes that the EVM will read, interpret and
          execute. This is a region that cannot be modified, but can be read
          with the instructions <RelativeLink to="#38" title="CODESIZE" /> and{' '}
          <RelativeLink to="#39" title="CODECOPY" />. Other contracts code can
          also be read with <RelativeLink to="#3B" title="EXTCODESIZE" /> and{' '}
          <RelativeLink to="#3B" title="EXTCODECOPY" />. The program counter
          (PC) encodes which instruction should be read next by the EVM in this
          region. An externally owned account (or EOA) has an empty code region.
        </p>
      </SectionWrapper>

      <SectionWrapper header={<H3>The stack</H3>} anchorKey="stack">
        <p className="pb-8">
          The stack is a list of 32-byte elements. The stack is used to put the
          parameters that are needed by the instructions, and their result
          values. When a new value is put on the stack, it is put on top, and
          only the top values are used by the instructions. The stack currently
          has a maximum limit of 1024 values. All instructions interact with the
          stack, but it can be directly manipulated with instructions like{' '}
          <RelativeLink to="#60" title="PUSH1" />,{' '}
          <RelativeLink to="#50" title="POP" />,{' '}
          <RelativeLink to="#80" title="DUP1" />, or{' '}
          <RelativeLink to="#90" title="SWAP1" />.
        </p>
      </SectionWrapper>

      <SectionWrapper header={<H3>The memory</H3>} anchorKey="memory">
        <p className="pb-8">
          The memory is a region that only exists during the smart contract
          execution, and is accessed with a byte offset. While all the 32-byte
          address space is available and initialized to 0, the size is counted
          with the highest address that was accessed. It is generally read and
          written with <RelativeLink to="#51" title="MLOAD" /> and{' '}
          <RelativeLink to="#52" title="MSTORE" /> instructions, but is also
          used by other instructions like{' '}
          <RelativeLink to="#F0" title="CREATE" /> or{' '}
          <RelativeLink to="#F3" title="EXTCODECOPY" />.
        </p>
      </SectionWrapper>

      <SectionWrapper header={<H3>The storage</H3>} anchorKey="storage">
        <p className="pb-8">
          The storage is the persistent memory of the smart contract. It is a
          map of the 32-byte slot to 32-byte value, and each value written is
          kept until it is set to 0 or the contract self-destruction. Reading
          from an unset key also returns 0. It is read and written with the
          instructions <RelativeLink to="#54" title="SLOAD" /> and{' '}
          <RelativeLink to="#55" title="SSTORE" />.
        </p>
      </SectionWrapper>

      <SectionWrapper header={<H3>The calldata</H3>} anchorKey="calldata">
        <p className="pb-8">
          The calldata region is the data that is sent with a transaction. In
          the case of contract creation, it would be the constructor code. This
          region is immutable and can be read with the instructions{' '}
          <RelativeLink to="#35" title="CALLDATALOAD" />,{' '}
          <RelativeLink to="#36" title="CALLDATASIZE" />, and{' '}
          <RelativeLink to="#37" title="CALLDATACOPY" />.
        </p>
      </SectionWrapper>

      <SectionWrapper header={<H3>The return data</H3>} anchorKey="returndata">
        <p className="pb-8">
          The return data region is the way a smart contract can return a value
          after a call. It can be set by external contract calls through the{' '}
          <RelativeLink to="#F3" title="RETURN" /> and{' '}
          <RelativeLink to="#FD" title="REVERT" /> instructions and can be read
          by the calling contract with{' '}
          <RelativeLink to="#3D" title="RETURNDATASIZE" /> and{' '}
          <RelativeLink to="#3E" title="RETURNDATACOPY" />.
        </p>
      </SectionWrapper>

      <SectionWrapper header={<H2>Gas costs</H2>} anchorKey="gascosts">
        <p className="pb-6">
          As an incentive to provide resources to run transactions, a fee is
          paid to send and execute a transaction. The fee is determined by
          several factors, including the amount of data sent or the amount of
          work that a transaction requires. That fee is calculated through two
          mechanisms. The first is a fixed cost that is defined by Ethereum,
          depending on what is executed. The unit for that is called gas, and
          remains the same for all transactions, though it can be changed by a
          hardfork. The second component is the price of one gas unit, which
          varies over time according to what people are willing to pay to run
          their transactions. Its unit is ETH per gas.
        </p>

        <p className="pb-8">
          Each opcode has its own gas cost. There are two parts to their gas
          cost. The first one is the static cost, which has to be paid for
          running that opcode. The second is a dynamic cost, which depends on
          several factors during the execution of a transaction. The factors
          that are used to determine the dynamic gas cost can change from fork
          to fork. Use our reference to learn about the specific computations
          per opcode and fork. And finally, remember that the gas cost still has
          other components, for example the transaction fee, or the size of the
          calldata. To get a complete estimation of the gas cost for your
          programm, with your compiler options and specific state and inputs,
          use a tool like{' '}
          <a
            href="https://remix.ethereum.org/"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Remix
          </a>{' '}
          or{' '}
          <a
            href="https://trufflesuite.com/"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Truffle
          </a>
          .
        </p>
      </SectionWrapper>

      <SectionWrapper header={<H3>Intrinsic Gas</H3>} anchorKey="intrinsicgas">
        <p className="pb-8">
          Each transaction has an intrinsic cost of 21000 gas. Creating a
          contract costs 32000 gas, on top of the transaction cost. And finally,
          the calldata costs 4 gas per byte equal to 0, and 16 gas for the
          others (64 before the hardfork <b>Istanbul</b>). This cost is paid
          from the transaction before any opcode or transfer is executed.
        </p>
      </SectionWrapper>

      <SectionWrapper
        header={<H3>Memory expansion</H3>}
        anchorKey="memoryexpansion"
      >
        <p className="pb-6">
          During an execution, the whole memory is accessible, but not for free.
          When an offset is accessed for the first time (either read or write),
          it may trigger a memory expansion, which will cost gas. A memory
          expansion may be triggered when the offset used is bigger than any
          used before. When that happens, the cost of accessing that higher
          offset is computed and removed from the total gas available in the
          current context.
        </p>

        <p className="pb-4">
          <p className="pb-4">
            The total cost for a given memory size is computed as follows:
          </p>
          <Pre>
            <code>
              memory_size_word = (memory_byte_size + 31) / 32
              <br />
              memory_cost = (memory_size_word ** 2) / 512 + (3 *
              memory_size_word)
            </code>
          </Pre>
        </p>

        <p className="pb-4">
          <p className="pb-4">
            When a memory expansion is triggered however, only the additional
            chunk of memory has to be paid. The cost of memory expansion for a
            specific opcode is thus:
          </p>
          <Pre>
            <code>
              memory_expansion_cost = new_memory_cost - last_memory_cost
            </code>
          </Pre>
        </p>

        <p className="pb-8">
          The <code>memory_byte_size</code> can be obtained with{' '}
          <RelativeLink to="#59" title="MSIZE" />. We can see that the cost
          grows quadratically with the size, making higher offsets more costly
          and discouraging to use too much memory. Any opcode accessing memory
          may trigger an expansion (including, for example,{' '}
          <RelativeLink to="#51" title="MLOAD" />,{' '}
          <RelativeLink to="#F3" title="RETURN" /> or{' '}
          <RelativeLink to="#37" title="CALLDATACOPY" />
          ). Each opcode that can is mentioned in the{' '}
          <RelativeLink title="reference" />. Note also that an opcode with a
          byte size parameter of 0 will not trigger a memory expansion,
          regardless of its offset parameters.
        </p>
      </SectionWrapper>

      <SectionWrapper header={<H3>Access sets</H3>} anchorKey="accesssets">
        <p className="pb-8">
          Access sets have been introduced in the hardfork <b>Berlin</b>. They
          are kept per transaction (and not per call context). Two of them
          exist: the touched contracts addresses, and the touched contract
          storage slots. If an address or slot is present in the set, it is
          called 'warm', otherwise it is 'cold'. The dynamic cost of some
          opcodes depends on whether the address or slot is warm or cold.
          <ul className="list-disc mb-2">
            <li className="ml-6">
              Addresses: a set of contract addresses that have been touched in
              the current transaction. It is initialized with the sender and
              receiver (or the new contract address in case of a creation) of
              the transaction, as well as all the{' '}
              <RelativeLink to="precompiled" title="precompiled contracts" />.
              When an opcode accesses an address that is not present in the set,
              it adds it in it. The relevant opcodes are{' '}
              <RelativeLink to="#3B" title="EXTCODESIZE" />,{' '}
              <RelativeLink to="#3C" title="EXTCODECOPY" />,{' '}
              <RelativeLink to="#3F" title="EXTCODEHASH" />,{' '}
              <RelativeLink to="#31" title="BALANCE" />,{' '}
              <RelativeLink to="#F1" title="CALL" />,{' '}
              <RelativeLink to="#F2" title="CALLCODE" />,{' '}
              <RelativeLink to="#F4" title="DELEGATECALL" />,{' '}
              <RelativeLink to="#FA" title="STATICCALL" />,{' '}
              <RelativeLink to="#F0" title="CREATE" />,{' '}
              <RelativeLink to="#F5" title="CREATE2" /> and{' '}
              <RelativeLink to="#FF" title="SELFDESTRUCT" />.
            </li>
            <li className="ml-6">
              Slots: a set of contract address and their storage slot keys that
              have been accessed. It is initialized to empty. When an opcode
              accesses a slot that is not present in the set, it adds it to it.
              The relevant opcodes are <RelativeLink to="#54" title="SLOAD" />{' '}
              and <RelativeLink to="#55" title="SSTORE" />
            </li>
          </ul>
          When a context reverts, the sets are also reverted to the state they
          had before that context.
        </p>
      </SectionWrapper>

      <SectionWrapper header={<H3>Gas refunds</H3>} anchorKey="gasrefunds">
        <p className="pb-8">
          Some opcodes can trigger gas refunds, which reduces the gas cost of a
          transaction. However the gas refund is applied at the end of a
          transaction, meaning that a transaction always need enough gas to run
          as if there was no refunds. The amount of gas that can be refunded is
          also limited, to half of the total transaction cost before the
          hardfork <b>London</b>, otherwise to a fifth. Starting from the
          hardfork <b>London</b> also, only{' '}
          <RelativeLink to="#55" title="SSTORE" /> may trigger refunds. Before
          that, <RelativeLink to="#FF" title="SELFDESTRUCT" /> could also
          trigger refunds.
        </p>
      </SectionWrapper>

      <SectionWrapper
        header={<H2>Other EVM Related Resources</H2>}
        anchorKey="otherevmresources"
      >
        <p className="pb-8">
          <a
            href="https://takenobu-hs.github.io/downloads/ethereum_evm_illustrated.pdf"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Ethereum EVM Illustrated (2018)
          </a>
          ,{' '}
          <a
            href="https://ethereum.org/en/history/"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            The History and Forks of Ethereum
          </a>
          ,{' '}
          <a
            href="https://www.youtube.com/watch?v=RxL_1AfV7N4&t=1s"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            EVM: From Solidity to bytecode, memory and storage
          </a>
          ,{' '}
          <a
            href="https://noxx.substack.com/p/evm-deep-dives-the-path-to-shadowy"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            EVM Deep Dives by noxx
          </a>
          ,{' '}
          <a
            href="https://github.com/ethereumbook/ethereumbook/blob/develop/13evm.asciidoc"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            The EVM Chapter in the Mastering Ethereum book
          </a>
        </p>

        <em>
          Acknowledgment to{' '}
          <a
            href="https://github.com/wolflo/evm-opcodes"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            wolflo
          </a>{' '}
          for the cost descriptions.
        </em>
      </SectionWrapper>
    </Container>
  )
}

AboutPage.getLayout = function getLayout(page: NextPage) {
  return <HomeLayout>{page}</HomeLayout>
}

export default AboutPage
