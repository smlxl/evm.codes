import Link from 'next/link'

import { GITHUB_REPO_URL } from 'util/constants'

import NavLink from 'components/NavLink'
import Settings from 'components/Settings'
import { Container, Logo } from 'components/ui'

const Nav = () => {
  return (
    <nav className="fixed z-50 h-16 top-0 inset-x-0 py-5 bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg">
      <Container>
        <div className="flex justify-between">
          <Link href="/" passHref>
            <a>
              <Logo />
            </a>
          </Link>

          <ul>
            <NavLink href="/about">About EVM</NavLink>
            <NavLink href="/opcodes">Opcodes</NavLink>
            <NavLink href={GITHUB_REPO_URL} external>
              GitHub
            </NavLink>
          </ul>

          <Settings />
        </div>
      </Container>
    </nav>
  )
}

export default Nav
