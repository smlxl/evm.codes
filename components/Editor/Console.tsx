import { useEffect, useRef } from 'react'

import { toKeyIndex } from 'util/string'

import { IConsoleOutput } from './types'

type Props = {
  output: IConsoleOutput[]
}

const Console = ({ output }: Props) => {
  const container = useRef<HTMLDivElement>(null)
  const endDiv = useRef<HTMLDivElement>(null)

  useEffect(() => {
    container.current?.parentElement?.scrollTo({
      top: endDiv.current?.offsetTop,
      behavior: 'smooth',
    })
  }, [output])

  return (
    <div
      ref={container}
      className="px-4 pt-2 leading-5 font-mono text-tiny text-gray-400 dark:text-gray-500"
    >
      {output.map((log, index) => (
        <pre key={toKeyIndex('line', index)}>
          {log.type === 'error' && (
            <span className="text-red-500">[Error] </span>
          )}
          {log.type === 'warn' && (
            <span className="text-yellow-500">[Warn] </span>
          )}
          {log.message}
        </pre>
      ))}
      <div ref={endDiv}></div>
    </div>
  )
}

export default Console
