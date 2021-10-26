import { toKeyIndex } from 'util/string'

type Props = {
  output: string[]
}

const Console = ({ output }: Props) => {
  return (
    <div className="px-4 font-mono text-tiny">
      {output.map((line, index) => (
        <pre key={toKeyIndex('line', index)}>{line}</pre>
      ))}
    </div>
  )
}

export default Console
