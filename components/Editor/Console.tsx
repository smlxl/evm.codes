import { toKeyIndex } from 'util/string'

import { IConsoleOutput } from './types'

type Props = {
  output: IConsoleOutput[]
}

const Console = ({ output }: Props) => {
  return (
    <div className="px-4 font-mono text-tiny">
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
    </div>
  )
}

export default Console
