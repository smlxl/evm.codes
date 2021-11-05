import React, { createContext, useEffect, useState, useRef } from 'react'

// These imports are here for types only, since they can't be used client-side
// See `lib/ethereum.js` for globals
import Common from '@ethereumjs/common'
import { TypedTransaction, TxData } from '@ethereumjs/tx'
import VM from '@ethereumjs/vm'
import { RunState, InterpreterStep } from '@ethereumjs/vm/dist/evm/interpreter'
import { Opcode } from '@ethereumjs/vm/dist/evm/opcodes'
import { VmError } from '@ethereumjs/vm/dist/exceptions'
import { BN, Address } from 'ethereumjs-util'
//
import OpcodesMeta from 'opcodes.json'
import {
  IOpcode,
  IOpcodeMetaList,
  IInstruction,
  IStorage,
  IExecutionState,
  IChain,
} from 'types'

import { getHardfork } from 'util/opcodes'
import { toHex, fromBuffer } from 'util/string'

let vm: VM
let common: Common
let accountAddress: Address
let gasLimit: BN

const storageMemory = new Map()
const privateKey = Buffer.from(
  'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109',
  'hex',
)
const accountBalance = 18 // 1eth

// Run these only client-side
if (typeof window !== 'undefined') {
  accountAddress = window.EvmCodes.Address.fromPrivateKey(privateKey)
  gasLimit = new window.EvmCodes.BN(0xffffffffffff)
}

type ContextProps = {
  chains: IChain[]
  forks: string[]
  selectedChain: IChain | undefined
  selectedFork: string | undefined
  opcodes: IOpcode[]
  instructions: IInstruction[]
  deployedContractAddress: string | undefined
  isExecuting: boolean
  executionState: IExecutionState
  vmError: string | undefined

  onChainChange: (chainId: number) => void
  onForkChange: (forkName: string) => void
  deployContract: (byteCode: string) => Promise<TypedTransaction | TxData>
  loadInstructions: (byteCode: string) => void
  startExecution: (byteCode: string, tx?: TypedTransaction | TxData) => void
  continueExecution: () => void
  addBreakpoint: (instructionId: number) => void
  removeBreakpoint: (instructionId: number) => void
  nextExecution: () => void
  resetExecution: () => void
}

const initialExecutionState = {
  stack: [],
  storage: [],
  memory: undefined,
  programCounter: undefined,
  totalGas: undefined,
  currentGas: undefined,
}

export const EthereumContext = createContext<ContextProps>({
  chains: [],
  forks: [],
  selectedChain: undefined,
  selectedFork: undefined,
  opcodes: [],
  instructions: [],
  deployedContractAddress: undefined,
  isExecuting: false,
  executionState: initialExecutionState,
  vmError: undefined,

  onChainChange: () => undefined,
  onForkChange: () => undefined,
  deployContract: () =>
    new Promise((resolve) => {
      resolve({})
    }),
  loadInstructions: () => undefined,
  startExecution: () => undefined,
  continueExecution: () => undefined,
  addBreakpoint: () => undefined,
  removeBreakpoint: () => undefined,
  nextExecution: () => undefined,
  resetExecution: () => undefined,
})

export const EthereumProvider: React.FC<{}> = ({ children }) => {
  const [chains, setChains] = useState<IChain[]>([])
  const [forks, setForks] = useState<string[]>([])
  const [selectedChain, setSelectedChain] = useState<IChain>()
  const [selectedFork, setSelectedFork] = useState<string>()
  const [opcodes, setOpcodes] = useState<IOpcode[]>([])
  const [instructions, setInstructions] = useState<IInstruction[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionState, setExecutionState] = useState<IExecutionState>(
    initialExecutionState,
  )
  const [deployedContractAddress, setDeployedContractAddress] = useState<
    string | undefined
  >()
  const [vmError, setVmError] = useState<string | undefined>()

  const nextStepFunction = useRef<() => void | undefined>()
  const isExecutionPaused = useRef(true)
  const breakpointIds = useRef<number[]>([])

  useEffect(() => {
    const { Common, Chain } = window.EvmCodes
    common = new Common({ chain: Chain.Mainnet })

    initVmInstance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Initializes the EVM instance.
   */
  const initVmInstance = async (skipChainsLoading?: boolean) => {
    const { VM } = window.EvmCodes
    vm = new VM({ common })

    if (!skipChainsLoading) {
      _loadChainAndForks(common)
    }

    _loadOpcodes()
    _setupStateManager()
    _setupAccount()

    vm.on('step', _stepInto)
  }

  /**
   * Callback on changing the EVM chain.
   * @param chainId The chain ID.
   */
  const onChainChange = (chainId: number) => {
    common.setChain(chainId)
    resetExecution()
    initVmInstance(true)

    const chain = chains.find((chain) => chain.id === chainId)
    if (chain) setSelectedChain(chain)
  }

  /**
   * Callback on changing the EVM hard fork.
   * @param forkName The hard fork name.
   */
  const onForkChange = (forkName: string) => {
    common.setHardfork(forkName)
    resetExecution()
    initVmInstance(true)

    setSelectedFork(forkName)
  }

  /**
   * Deploys the contract code to the EVM.
   * @param byteCode The contract bytecode.
   * @returns The deployed contract transaction data.
   */
  const deployContract = async (byteCode: string) => {
    const { Transaction } = window.EvmCodes
    const account = await vm.stateManager.getAccount(accountAddress)

    const txData = {
      value: 0,
      gasLimit,
      gasPrice: 1,
      data: '0x' + byteCode,
      nonce: account.nonce,
    }

    return Transaction.fromTxData(txData).sign(privateKey)
  }

  /**
   * Loads contract instructions to the context state.
   * @param byteCode The contract bytecode.
   */
  const loadInstructions = (byteCode: string) => {
    const opcodes = vm.getActiveOpcodes()
    const instructions: IInstruction[] = []

    for (let i = 0; i < byteCode.length; i += 2) {
      const instruction = parseInt(byteCode.slice(i, i + 2), 16)
      // The id to reference back with breakpoints
      const id = i / 2
      const opcode = opcodes.get(instruction)

      if (!opcode) {
        instructions.push({
          id,
          name: 'INVALID',
        })
      } else if (opcode.name === 'PUSH') {
        const count = parseInt(opcode.fullName.slice(4), 10) * 2
        instructions.push({
          id,
          name: opcode.fullName,
          value: byteCode.slice(i + 2, i + 2 + count),
        })
        i += count
      } else {
        instructions.push({
          id,
          name: opcode.fullName,
        })
      }
    }

    setInstructions(instructions)
  }

  /**
   * Starts EVM execution of the instructions.
   * @param byteCode The contract bytecode.
   * @param tx The optional transaction data to run from.
   */
  const startExecution = (byteCode: string, tx?: TypedTransaction | TxData) => {
    // always start paused
    isExecutionPaused.current = true
    setIsExecuting(true)
    setVmError(undefined)

    if (tx) {
      // starting execution via deployed contract's transaction
      vm.runTx({ tx: tx as TypedTransaction })
        .then(({ execResult, gasUsed, createdAddress }) =>
          _loadRunState(gasUsed, execResult.runState, createdAddress),
        )
        .finally(() => setIsExecuting(false))
    } else {
      vm.runCode({ code: Buffer.from(byteCode, 'hex'), gasLimit })
        .then(({ runState, gasUsed, exceptionError }) =>
          _loadRunState(gasUsed, runState, undefined, exceptionError),
        )
        .finally(() => setIsExecuting(false))
    }
  }

  /**
   * Resets EVM execution state to the initial state.
   */
  const resetExecution = () => {
    setInstructions([])
    setExecutionState(initialExecutionState)
    setDeployedContractAddress(undefined)
    setVmError(undefined)

    isExecutionPaused.current = true
    breakpointIds.current = []
    nextStepFunction.current = undefined

    setIsExecuting(false)
  }

  /**
   * Adds a breakpoint to pause the EVM execution at a given instruction.
   * @param instructionId The instruction id provided by in the `instructions[]`.
   */
  const addBreakpoint = (instructionId: number) => {
    breakpointIds.current.push(instructionId)

    setInstructions(
      instructions.map((el) => {
        if (el.id === instructionId) {
          return {
            ...el,
            hasBreakpoint: true,
          }
        }
        return el
      }),
    )
  }

  /**
   * Removes previously added breakpoint.
   * @param instructionId The instruction id provided by in the `instructions[]`.
   * @see `addBreakpoint`
   */
  const removeBreakpoint = (instructionId: number) => {
    breakpointIds.current = breakpointIds.current.filter(
      (id) => id !== instructionId,
    )

    setInstructions(
      instructions.map((el) => {
        if (el.id === instructionId) {
          return {
            ...el,
            hasBreakpoint: false,
          }
        }
        return el
      }),
    )
  }

  /**
   * Resumes the EVM execution.
   */
  const continueExecution = () => {
    isExecutionPaused.current = false
    nextExecution()
  }

  /**
   * Runs the next EVM execution.
   */
  const nextExecution = () => {
    // FIXME: Instead of allowing to get into exception,
    // prevent from executing when all instructions have been completed.
    try {
      if (nextStepFunction.current) nextStepFunction.current()
    } catch (_e) {
      const error = _e as Error

      if (error.message.match(/Callback was already called/i)) {
        return
      }

      throw error
    }
  }

  const _loadChainAndForks = (common: Common) => {
    const { Chain } = window.EvmCodes

    const chainIds: number[] = []
    const chainNames: string[] = []
    const forks: string[] = []

    // iterate over TS enum to pick key,val
    for (const chain in Chain) {
      if (isNaN(Number(chain))) {
        chainNames.push(chain)
      } else {
        chainIds.push(parseInt(chain))
      }
    }
    setChains(
      chainIds.map((chainId, index) => {
        return { id: chainId, name: chainNames[index] }
      }),
    )

    common.hardforks().forEach(({ name }) => {
      forks.push(name)
    })
    setForks(forks)

    setSelectedChain({ id: chainIds[0], name: chainNames[0] })
    setSelectedFork(common.hardfork())
  }

  const _loadOpcodes = () => {
    const opcodes: IOpcode[] = []

    vm.getActiveOpcodes().forEach((op: Opcode) => {
      const meta = OpcodesMeta as IOpcodeMetaList

      opcodes.push({
        ...meta[toHex(op.code)],
        ...{
          code: toHex(op.code),
          fee: op.fee,
          name: op.fullName,
          fork: getHardfork(op.code),
        },
      })
    })

    setOpcodes(opcodes)
  }

  const _setupStateManager = () => {
    // Hack the state manager so that we can track the stored variables
    // @ts-ignore: Store original contract storage to access later
    vm.stateManager.originalPutContractStorage =
      vm.stateManager.putContractStorage

    // @ts-ignore: Store original contract storage to access later
    vm.stateManager.originalClearContractStorage =
      vm.stateManager.clearContractStorage

    vm.stateManager.putContractStorage = _putContractStorage
    vm.stateManager.clearContractStorage = _clearContractStorage
    storageMemory.clear()
  }

  const _setupAccount = () => {
    const { BN, Account } = window.EvmCodes

    // Add a fake account
    const accountData = {
      nonce: 0,
      balance: new BN(10).pow(new BN(accountBalance)),
    }
    vm.stateManager.putAccount(
      accountAddress,
      Account.fromAccountData(accountData),
    )
  }

  const _loadRunState = (
    gasUsed: BN,
    runState?: RunState,
    contractAddress?: Address,
    exceptionError?: VmError,
  ) => {
    if (exceptionError) {
      setVmError(exceptionError.error)
      return
    }

    if (runState) {
      const { programCounter, stack, memory } = runState
      _setExecutionState(programCounter, gasUsed, stack._store, memory._store)
    }

    if (contractAddress) {
      setDeployedContractAddress(contractAddress.toString())
    }
  }

  const _stepInto = (
    { depth, pc, gasLeft, opcode, stack, memory }: InterpreterStep,
    continueFunc: () => void,
  ) => {
    // We skip over the calls
    if (depth != 0) {
      continueFunc()
      return
    }

    const gasUsed = gasLimit.sub(gasLeft)

    _setExecutionState(pc, gasUsed, stack, memory, opcode.fee)

    nextStepFunction.current = continueFunc

    if (isExecutionPaused.current === false) {
      if (breakpointIds.current.includes(pc)) {
        isExecutionPaused.current = true
      } else {
        nextExecution()
      }
    }
  }

  const _setExecutionState = (
    pc: number,
    gasUsed: BN,
    stack: BN[],
    memory: Buffer,
    currentGas?: BN | number,
  ) => {
    const storage: IStorage[] = []

    storageMemory.forEach((sm, address) => {
      sm.forEach((value: string, slot: string) => {
        storage.push({ address, slot, value })
      })
    })

    setExecutionState({
      programCounter: pc,
      stack: stack.map((value) => value.toString('hex')).reverse(),
      totalGas: gasUsed.toString(),
      memory: fromBuffer(memory),
      storage,
      currentGas: currentGas ? currentGas.toString() : undefined,
    })
  }

  const _putContractStorage = (
    address: Address,
    key: Buffer,
    value: Buffer,
  ) => {
    const addressText = address.toString()
    const keyText = fromBuffer(key)
    const valueText = fromBuffer(value)

    if (value.length == 0) {
      if (storageMemory.has(addressText)) {
        const addressStorage = storageMemory.get(addressText)
        addressStorage.delete(keyText)

        if (addressStorage.size == 0) {
          storageMemory.delete(addressText)
        }
      }
    } else {
      if (storageMemory.has(addressText)) {
        storageMemory.get(addressText).set(keyText, valueText)
      } else {
        storageMemory.set(addressText, new Map([[keyText, valueText]]))
      }
    }

    // @ts-ignore: Reuse original contract storage
    return vm.stateManager.originalPutContractStorage(address, key, value)
  }

  const _clearContractStorage = (address: Address) => {
    const addressText = address.toString()
    storageMemory.delete(addressText)

    // @ts-ignore: Reuse original contract storage
    return vm.stateManager.originalClearContractStorage(address)
  }

  return (
    <EthereumContext.Provider
      value={{
        chains,
        forks,
        selectedChain,
        selectedFork,
        opcodes,
        instructions,
        deployedContractAddress,
        isExecuting,
        executionState,
        vmError,

        onChainChange,
        onForkChange,
        deployContract,
        loadInstructions,
        startExecution,
        continueExecution,
        addBreakpoint,
        removeBreakpoint,
        nextExecution,
        resetExecution,
      }}
    >
      {children}
    </EthereumContext.Provider>
  )
}
