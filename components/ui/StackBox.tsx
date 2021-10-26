import React from 'react'

type Props = {
  value: string
}

export const StackBox: React.FC<Props> = ({ value }) => {
  if (value.length === 0) return null

  const parts = value.split('|')

  return (
    <div className="font-mono">
      {(parts.length > 0 ? parts : [value]).map((p: string, index: number) => (
        <span
          key={index}
          className="inline-block border border-gray-300 px-2 py-1 h-6 mb-1 mr-1"
        >
          {p}
        </span>
      ))}
    </div>
  )
}
