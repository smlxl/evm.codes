import { useState } from 'react'

import cn from 'classnames'
import Link from 'next/link'

import { GITHUB_REPO_URL } from 'util/constants'

import NavLink from 'components/NavLink'
import Settings from 'components/Settings'
import { Container, Logo, Icon } from 'components/ui'

import ChainSelector from '../ChainSelector'

const Nav = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false)

  const handleClick = () => {
    setIsMenuVisible(!isMenuVisible)
  }

  return (
    <nav className="fixed z-50 top-0 inset-x-0 py-2 bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg">
      <Container>
        <div className="h-10 flex items-center justify-between">
          <Link href="/" passHref>
            <a>
              <Logo />
            </a>
          </Link>

          <ul
            className={cn(
              'py-2 md:py-0 px-2 flex justify-between items-start md:items-center flex-col md:flex-row w-full md:w-auto bg-white md:bg-transparent bg-opacity-85 md:bg-opacity-100 fixed md:static shadow-md md:shadow-none transition-all',
              { 'left-0': isMenuVisible, '-left-full': !isMenuVisible },
            )}
            style={{ top: 56 }}
          >
            <NavLink href="/">Opcodes</NavLink>
            <NavLink href="/playground">Playground</NavLink>
            <NavLink href="/about">About EVM</NavLink>
            <NavLink href={GITHUB_REPO_URL} external className="lg:hidden">
              GitHub
            </NavLink>
          </ul>

          <div className="items-center ml-auto hidden lg:flex">
            <ChainSelector />
            <Settings />
          </div>

          <a
            className="hidden lg:block"
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="github-fill" className="mr-1" size="lg" />
          </a>

          <button
            className={cn('ml-4 hamburger cursor-pointer md:hidden', {
              active: isMenuVisible,
            })}
            onClick={handleClick}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </Container>
    </nav>
  )
}

export default Nav
