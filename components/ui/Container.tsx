import React from 'react'

type Props = {
  children: React.ReactNode
}

export const Container: React.FC<Props> = ({ children }) => {
  return <div className="container mx-auto px-6 xl:px-0">{children}</div>
}
