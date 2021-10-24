import React from 'react'

import Link from 'next/link'

type Props = {
  href: string
  external?: boolean
  children: string
}

const NavLink: React.FC<Props> = ({ href, children, external = false }) => {
  return (
    <li className="inline-block mx-8 uppercase font-semibold text-tiny">
      <Link href={href} passHref={external}>
        <a target={external ? '_blank' : '_self'}>{children}</a>
      </Link>
    </li>
  )
}

export default NavLink
