import React from 'react'

type Props = {
  children: string
}

export const H1: React.FC<Props> = ({ children }) => (
  <h1 className="text-lg font-semibold my-4">{children}</h1>
)

export const H2: React.FC<Props> = ({ children }) => (
  <h2 className="text-base font-semibold my-3">{children}</h2>
)

export const H3: React.FC<Props> = ({ children }) => (
  <h2 className="text-base font-medium my-2">{children}</h2>
)

export const P: React.FC<Props> = ({ children }) => (
  <p className="leading-5 mb-3">{children}</p>
)

export const UL: React.FC<Props> = ({ children }) => (
  <ul className="list-disc mb-2">{children}</ul>
)

export const OL: React.FC<Props> = ({ children }) => (
  <ol className="list-decimal mb-2">{children}</ol>
)

export const LI: React.FC<Props> = ({ children }) => (
  <li className="ml-6">{children}</li>
)
