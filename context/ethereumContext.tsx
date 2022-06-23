import { Buffer } from 'buffer'

import React, { createContext, useEffect, useState, useRef } from 'react'

import { Block } from '@ethereumjs/block'
import Common, { Chain } from '@ethereumjs/common'
import { Hardfork } from '@ethereumjs/common/src/types'
import { TypedTransaction, TxData, Transaction } from '@ethereumjs/tx'
import VM from '@ethereumjs/vm'
import { RunState, InterpreterStep } from '@ethereumjs/vm/dist/evm/interpreter'
import { Opcode } from '@ethereumjs/vm/dist/evm/opcodes'
import { getActivePrecompiles } from '@ethereumjs/vm/dist/evm/precompiles'
import { VmError } from '@ethereumjs/vm/dist/exceptions'
import { BN, Address, Account } from 'ethereumjs-util'
//
import OpcodesMeta from 'opcodes.json'
import PrecompiledMeta from 'precompiled.json'
import {
  IReferenceItem,
  IReferenceItemMetaList,
  IInstruction,
  IStorage,
  IExecutionState,
  IChain,
} from 'types'

import { CURRENT_FORK } from 'util/constants'
import {
  calculateOpcodeDynamicFee,
  calculatePrecompiledDynamicFee,
} from 'util/gas'
import { toHex, fromBuffer } from 'util/string'

let vm: VM
let common: Common

const storageMemory = new Map()
const privateKey = Buffer.from(
  'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109',
  'hex',
)
const accountBalance = 18 // 1eth
const accountAddress = Address.fromPrivateKey(privateKey)
const contractAddress = Address.generate(accountAddress, new BN(1))
const gasLimit = new BN(0xffffffffffff)

type ContextProps = {
  common: Common | undefined
  chains: IChain[]
  forks: Hardfork[]
  selectedChain: IChain | undefined
  selectedFork: Hardfork | undefined
  opcodes: IReferenceItem[]
  precompiled: IReferenceItem[]
  instructions: IInstruction[]
  deployedContractAddress: string | undefined
  isExecuting: boolean
  executionState: IExecutionState
  vmError: string | undefined

  onChainChange: (chainId: number) => void
  onForkChange: (forkName: string) => void
  transactionData: (
    byteCode: string,
    value: BN,
    to?: Address,
  ) => Promise<TypedTransaction | TxData>
  loadInstructions: (byteCode: string) => void
  startExecution: (byteCode: string, value: BN, data: string) => void
  startTransaction: (tx: TypedTransaction | TxData) => Promise<{
    error?: VmError
    returnValue: Buffer
    createdAddress: Address | undefined
  }>
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
  returnValue: undefined,
}

export const EthereumContext = createContext<ContextProps>({
  common: undefined,
  chains: [],
  forks: [],
  selectedChain: undefined,
  selectedFork: undefined,
  opcodes: [],
  precompiled: [],
  instructions: [],
  deployedContractAddress: undefined,
  isExecuting: false,
  executionState: initialExecutionState,
  vmError: undefined,

  onChainChange: () => undefined,
  onForkChange: () => undefined,
  transactionData: () =>
    new Promise((resolve) => {
      resolve({})
    }),
  loadInstructions: () => undefined,
  startExecution: () => undefined,
  startTransaction: () => Promise.reject(),
  continueExecution: () => undefined,
  addBreakpoint: () => undefined,
  removeBreakpoint: () => undefined,
  nextExecution: () => undefined,
  resetExecution: () => undefined,
})

export const EthereumProvider: React.FC<{}> = ({ children }) => {
  const [chains, setChains] = useState<IChain[]>([])
  const [forks, setForks] = useState<Hardfork[]>([])
  const [selectedChain, setSelectedChain] = useState<IChain>()
  const [selectedFork, setSelectedFork] = useState<Hardfork>()
  const [opcodes, setOpcodes] = useState<IReferenceItem[]>([])
  const [precompiled, setPrecompiled] = useState<IReferenceItem[]>([])
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
    initVmInstance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Initializes the EVM instance.
   */
  const initVmInstance = async (
    skipChainsLoading?: boolean,
    chainId?: Chain,
    fork?: string,
  ) => {
    common = new Common({
      chain: Chain.Mainnet,
      hardfork: fork || CURRENT_FORK,
    })
    vm = new VM({ common })

    if (!skipChainsLoading) {
      _loadChainAndForks(common)
    }

    _loadOpcodes()
    _loadPrecompiled()
    _setupStateManager()
    _setupAccount()

    vm.on('step', _stepInto)
  }

  /**
   * Callback on changing the EVM chain.
   * @param chainId The chain ID.
   */
  const onChainChange = (chainId: number) => {
    const chain = chains.find((chain) => chain.id === chainId)
    if (chain) {
      setSelectedChain(chain)
      resetExecution()
      initVmInstance(true, chainId, selectedFork?.name)
    }
  }

  /**
   * Callback on changing the EVM hard fork.
   * @param forkName The hard fork name.
   */
  const onForkChange = (forkName: string) => {
    const fork = forks.find((f) => f.name === forkName)
    if (fork) {
      setSelectedFork(fork)
      resetExecution()
      initVmInstance(true, selectedChain?.id, fork.name)
    }
  }

  /**
   * Deploys the contract code to the EVM.
   * @param byteCode The contract bytecode.
   * @returns The deployed contract transaction data.
   */
  const transactionData = async (data: string, value: BN, to?: Address) => {
    const account = await vm.stateManager.getAccount(accountAddress)

    const txData = {
      to,
      value: value,
      gasLimit,
      gasPrice: 10,
      data: '0x' + data,
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
   * @param value The callvalue.
   * @param data The calldata.
   */
  const startExecution = async (byteCode: string, value: BN, data: string) => {
    vm.stateManager.putContractCode(
      contractAddress,
      Buffer.from(byteCode, 'hex'),
    )
    startTransaction(await transactionData(data, value, contractAddress))
  }

  /**
   * Starts EVM execution of the instructions.
   * @param byteCode The contract bytecode.
   * @param tx The transaction data to run from.
   */
  const startTransaction = (tx: TypedTransaction | TxData) => {
    // always start paused
    isExecutionPaused.current = true
    setIsExecuting(true)
    setVmError(undefined)

    // starting execution via deployed contract's transaction
    return vm
      .runTx({ tx: tx as TypedTransaction, block: _getBlock() })
      .then(({ execResult, gasUsed, createdAddress }) => {
        _loadRunState({
          gasUsed,
          runState: execResult.runState,
          newContractAddress: createdAddress,
          returnValue: execResult.returnValue,
          exceptionError: execResult.exceptionError,
        })
        return {
          error: execResult.exceptionError,
          returnValue: execResult.returnValue,
          createdAddress: createdAddress,
        }
      })
      .finally(() => setIsExecuting(false))
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
      if (nextStepFunction.current) {
        nextStepFunction.current()
      }
    } catch (_e) {
      const error = _e as Error

      if (error.message.match(/Callback was already called/i)) {
        return
      }

      throw error
    }
  }

  const _loadChainAndForks = (common: Common) => {
    const chainIds: number[] = []
    const chainNames: string[] = []
    const forks: Hardfork[] = []

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
    setSelectedChain({ id: chainIds[0], name: chainNames[0] })

    let currentForkFound = false

    common.hardforks().forEach((fork) => {
      // ignore null block forks
      if (fork.block) {
        forks.push(fork)

        // set initially selected fork
        if (!currentForkFound && fork.name === CURRENT_FORK) {
          setSelectedFork(fork)
          currentForkFound = true
        }
      }
    })

    setForks(forks)
  }

  const _loadOpcodes = () => {
    const opcodes: IReferenceItem[] = []

    vm.getActiveOpcodes().forEach((op: Opcode) => {
      const meta = OpcodesMeta as IReferenceItemMetaList
      const opcode = {
        ...meta[toHex(op.code)],
        ...{
          opcodeOrAddress: toHex(op.code),
          staticFee: op.fee,
          minimumFee: 0,
          name: op.fullName,
        },
      }

      opcode.minimumFee = parseInt(
        calculateOpcodeDynamicFee(opcode, common, {}),
      )
      opcodes.push(opcode)
    })

    setOpcodes(opcodes)
  }

  const _loadPrecompiled = () => {
    const precompiled: IReferenceItem[] = []

    const addressIterator = getActivePrecompiles(common).keys()
    let result = addressIterator.next()
    while (!result.done) {
      const meta = PrecompiledMeta as IReferenceItemMetaList
      const addressString = '0x' + result.value.slice(-2)
      const contract = {
        ...meta[addressString],
        ...{
          opcodeOrAddress: addressString,
          minimumFee: 0,
          name: meta[addressString].name,
        },
      }

      contract.minimumFee = parseInt(
        calculatePrecompiledDynamicFee(contract, common, {}),
      )
      precompiled.push(contract)
      result = addressIterator.next()
    }

    setPrecompiled(precompiled)
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
    // Add a fake account
    const accountData = {
      nonce: 2,
      balance: new BN(10).pow(new BN(accountBalance)),
    }
    const contractData = {
      nonce: 0,
      balance: 0,
    }
    vm.stateManager.putAccount(
      accountAddress,
      Account.fromAccountData(accountData),
    )
    vm.stateManager.putAccount(
      contractAddress,
      Account.fromAccountData(contractData),
    )
  }

  const _loadRunState = ({
    gasUsed,
    runState,
    newContractAddress,
    returnValue,
    exceptionError,
  }: {
    gasUsed: BN
    runState?: RunState
    newContractAddress?: Address
    returnValue?: Buffer
    exceptionError?: VmError
  }) => {
    if (runState) {
      const { programCounter: pc, stack, memory } = runState
      _setExecutionState({
        pc,
        gasUsed,
        stack: stack._store,
        memory: memory._store,
        returnValue,
      })
    }

    if (exceptionError) {
      setVmError(exceptionError.error)
    } else if (newContractAddress) {
      setDeployedContractAddress(newContractAddress.toString())
    }
  }

  const _getBlock = () => {
    // base fee is only applicable since london hardfork, ie block 12965000
    if (selectedFork && (selectedFork.block || 0) < 12965000) {
      return undefined
    }

    return Block.fromBlockData(
      {
        header: {
          baseFeePerGas: new BN(10),
          gasLimit: new BN(0xffffffffffff),
          gasUsed: new BN(60),
        },
      },
      { common },
    )
  }

  const _stepInto = (
    { depth, pc, gasLeft, opcode, stack, memory }: InterpreterStep,
    continueFunc: () => void,
  ) => {
    // We skip over the calls
    if (depth !== 0) {
      continueFunc()
      return
    }

    const gasUsed = gasLimit.sub(gasLeft)

    _setExecutionState({ pc, gasUsed, stack, memory, currentGas: opcode.fee })

    nextStepFunction.current = continueFunc

    if (isExecutionPaused.current === false) {
      if (breakpointIds.current.includes(pc)) {
        isExecutionPaused.current = true
      } else {
        nextExecution()
      }
    }
  }

  const _setExecutionState = ({
    pc,
    gasUsed,
    stack,
    memory,
    currentGas,
    returnValue,
  }: {
    pc: number
    gasUsed: BN
    stack: BN[]
    memory: Buffer
    currentGas?: BN | number
    returnValue?: Buffer
  }) => {
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
      returnValue: returnValue ? returnValue.toString('hex') : undefined,
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
        common,
        chains,
        forks,
        selectedChain,
        selectedFork,
        opcodes,
        precompiled,
        instructions,
        deployedContractAddress,
        isExecuting,
        executionState,
        vmError,

        onChainChange,
        onForkChange,
        transactionData,
        loadInstructions,
        startExecution,
        startTransaction,
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
