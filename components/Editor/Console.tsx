type Props = {
  output: string[]
}

const Console = ({ output }: Props) => {
  return (
    <div className="px-4 font-mono text-tiny">
      {output.map((line, index) => (
        <pre key={`line-${index}`}>{line}</pre>
      ))}
    </div>
  )
}

export default Console
