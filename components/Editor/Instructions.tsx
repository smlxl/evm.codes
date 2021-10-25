import { useContext, useEffect, useRef, RefObject } from 'react'

import cn from 'classnames'

import { EthereumContext } from 'context/ethereumContext'

type Props = {
  containerRef: RefObject<HTMLDivElement>
}

type RowRefs = {
  [programCounter: number]: HTMLTableRowElement
}

const EditorInstructions = ({ containerRef }: Props) => {
  const itemsRef = useRef<RowRefs>({})
  const { instructions, executionState } = useContext(EthereumContext)

  useEffect(() => {
    if (!containerRef?.current) {
      return
    }

    if (executionState?.programCounter) {
      containerRef.current.scrollTop =
        itemsRef.current[executionState.programCounter].offsetTop
    } else {
      containerRef.current.scrollTop = 0
    }
  }, [containerRef, executionState.programCounter])

  return (
    <table className="w-full font-mono text-tiny">
      <tbody>
        {instructions.map(({ id, name, value }) => {
          const isActive = executionState.programCounter === id

          return (
            <tr
              key={id}
              ref={(element) => {
                if (element) itemsRef.current[id] = element
              }}
              className={cn('border-b border-gray-200', {
                'text-gray-900': isActive,
                'text-gray-400': !isActive,
              })}
            >
              <td className="py-1 px-4 pr-6">{name}</td>
              <td className="py-1 px-4">{value}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default EditorInstructions
