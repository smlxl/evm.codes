import { useContext } from 'react'

import cn from 'classnames'

import { EthereumContext } from 'context/ethereumContext'

const EditorInstructions = () => {
  const { instructions, executionState } = useContext(EthereumContext)

  return (
    <table className="w-full font-mono text-tiny">
      <tbody>
        {instructions.map(({ id, name, value }) => {
          const isActive = executionState.programCounter === id

          return (
            <tr
              key={id}
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
