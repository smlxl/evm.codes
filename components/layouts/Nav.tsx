import Link from 'next/link'

import NavLink from 'components/NavLink'
//import Settings from 'components/Settings'
import { Container, Logo } from 'components/ui'

import ChainSelector from '../ChainSelector'

const Nav = () => {
  return (
    <nav className="fixed z-50 top-0 inset-x-0 py-4 bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg">
      <Container>
        <div className="flex items-center">
          <Link href="/" passHref>
            <a>
              <Logo />
            </a>
          </Link>

          <ul className="ml-6">
            <NavLink href="/">Opcodes</NavLink>
            <NavLink href="/playground">Playground</NavLink>
            <NavLink href="/about">About EVM</NavLink>
          </ul>

          <div className="flex items-center ml-auto">
            <ChainSelector />
            {/* TODO: <Settings /> */}
          </div>
        </div>
      </Container>
    </nav>
  )
}

export default Nav
