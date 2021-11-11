import React from 'react'

type Props = {
  children: React.ReactNode | string
} & React.ComponentPropsWithoutRef<'button'>

export const Label: React.FC<Props> = ({ children }) => (
  <span className="ml-2 py-1 px-3 bg-gray-200 dark:bg-black-500 uppercase rounded-full text-2xs text-indigo-500 font-medium">
    {children}
  </span>
)
