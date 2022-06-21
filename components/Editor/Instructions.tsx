import { useContext, useEffect, useRef, RefObject, createRef, Ref } from 'react'

import { EthereumContext } from 'context/ethereumContext'

import InstructionRow from './InstructionRow'

type TableProps = {
  containerRef: RefObject<HTMLDivElement>
}

type RowRefs = {
  [programCounter: number]: Ref<HTMLTableRowElement> | undefined
}

// The offset to leave before the top instruction row on the next scroll
const topRowOffset = 28

const EditorInstructions = ({ containerRef }: TableProps) => {
  const itemsRef = useRef<RowRefs>({})
  const tableRef = useRef() as React.MutableRefObject<HTMLTableElement>
  const {
    instructions,
    executionState,
    isExecuting,
    addBreakpoint,
    removeBreakpoint,
  } = useContext(EthereumContext)

  useEffect(() => {
    instructions.forEach((i) => (itemsRef.current[i.id] = createRef()))
  }, [instructions])

  useEffect(() => {
    if (!containerRef?.current) {
      return
    }

    if (executionState?.programCounter) {
      const tableOffset = tableRef?.current?.offsetTop || 0
      const rowRef = itemsRef.current[
        executionState.programCounter
      ] as RefObject<HTMLTableRowElement>

      if (rowRef?.current) {
        containerRef.current.scrollTop =
          rowRef.current.offsetTop - tableOffset - topRowOffset
      }
    }
  }, [containerRef, tableRef, executionState.programCounter])

  return (
    <table className="w-full font-mono text-tiny" ref={tableRef}>
      <tbody>
        {instructions.map(({ id, name, value, hasBreakpoint }) => {
          return (
            <InstructionRow
              key={id}
              instructionId={id}
              ref={itemsRef.current[id]}
              isActive={isExecuting && executionState.programCounter === id}
              name={name}
              value={value}
              hasBreakpoint={hasBreakpoint}
              onAddBreakpoint={addBreakpoint}
              onRemoveBreakpoint={removeBreakpoint}
            />
          )
        })}
      </tbody>
    </table>
  )
}

export default EditorInstructions
