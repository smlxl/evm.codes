import { Action } from 'kbar'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'

import { GITHUB_REPO_URL } from 'util/constants'

import { Icon } from 'components/ui'

const useActions = () => {
  const router = useRouter()
  const { setTheme } = useTheme()

  const createAction = (
    id: string,
    name: string,
    shortcut: string[],
    keywords: string,
    section: string,
    subtitle: string,
    iconName: string,
    perform?: () => void,
  ): Action => {
    return {
      id,
      name,
      shortcut,
      keywords,
      section,
      subtitle,
      icon: <Icon name={iconName} />,
      perform,
    }
  }

  return [
    createAction(
      'theme',
      'Theme',
      ['t'],
      'change theme',
      'Settings',
      'Change application theme',
      'palette-line',
    ),
    createAction(
      'theme-light',
      'Light Mode',
      ['l'],
      'light theme',
      'Settings',
      'Switch to Light Mode',
      'sun-line',
      () => setTheme('light'),
    ),
    createAction(
      'theme-dark',
      'Dark Mode',
      ['d'],
      'dark theme',
      'Settings',
      'Switch to Dark Mode',
      'moon-line',
      () => setTheme('dark'),
    ),
    createAction(
      'theme-system',
      'System Default',
      ['s'],
      'system theme',
      'Settings',
      'Use system theme settings',
      'settings-2-line',
      () => setTheme('system'),
    ),
    createAction(
      'opcodes',
      'Opcodes',
      ['o'],
      'home opcodes back',
      'Navigation',
      'Opcodes reference',
      'home-2-line',
      () => router.push('/'),
    ),
    createAction(
      'precompiled',
      'Precompiled',
      ['a'],
      'precompiled contracts',
      'Navigation',
      'Precompiled contracts reference',
      'information-line',
      () => router.push('/precompiled'),
    ),
    createAction(
      'transactions',
      'Transactions',
      ['t'],
      'Transactions Types',
      'Navigation',
      'Transactions Types reference',
      'information-line',
      () => router.push('/transactions'),
    ),
    createAction(
      'playground',
      'Playground',
      ['p'],
      'editor play',
      'Navigation',
      'Play with EVM in real-time',
      'play-circle-line',
      () => router.push('/playground'),
    ),
    createAction(
      'about',
      'About',
      ['b'],
      'about EVM',
      'Navigation',
      'About EVM and its internals',
      'information-line',
      () => router.push('/about'),
    ),
    createAction(
      'github',
      'GitHub',
      ['g'],
      'contribute GitHub issues',
      'Navigation',
      'Contribute on GitHub',
      'github-fill',
      () => window.open(GITHUB_REPO_URL, '_blank'),
    ),
  ]
}

export default useActions
