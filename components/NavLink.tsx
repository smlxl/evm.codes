import React from 'react'

import cn from 'classnames'
import Link from 'next/link'

type Props = {
  href: string
  external?: boolean
  children: string
  className?: string
}

const NavLink: React.FC<Props> = ({
  href,
  children,
  className,
  external = false,
}) => {
  return (
    <li
      className={cn(
        'inline-block mx-4 uppercase font-semibold text-tiny my-2 md:my-0',
        className,
      )}
    >
      <Link href={href} passHref={external}>
        <a target={external ? '_blank' : '_self'}>{children}</a>
      </Link>
    </li>
  )
}

export default NavLink
