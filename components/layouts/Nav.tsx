import { GITHUB_REPO_URL } from '../../util/constants'
import Container from '../Container'
import Logo from '../Logo'
import NavLink from '../NavLink'
import Settings from '../Settings'

const Nav = () => {
  return (
    <nav className="fixed h-16 top-0 inset-x-0 py-8">
      <Container>
        <div className="flex justify-between">
          <Logo />

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
