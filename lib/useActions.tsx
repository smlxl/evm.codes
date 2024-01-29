import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'

import { GITHUB_REPO_URL } from 'util/constants'

import { Icon } from 'components/ui'

const useActions = () => {
  const router = useRouter()
  const { setTheme } = useTheme()

  return [
    {
      id: 'theme',
      name: 'Theme',
      shortcut: ['t'],
      keywords: 'change theme',
      section: 'Settings',
      subtitle: 'Change application theme',
      icon: <Icon name="palette-line" />,
      children: [
        {
          id: 'theme-light',
          name: 'Light Mode',
          shortcut: ['l'],
          keywords: 'light theme',
          section: 'Settings',
          perform: () => setTheme('light'),
          subtitle: 'Switch to Light Mode',
          icon: <Icon name="sun-line" />,
        },
        {
          id: 'theme-dark',
          name: 'Dark Mode',
          shortcut: ['d'],
          keywords: 'dark theme',
          section: 'Settings',
          perform: () => setTheme('dark'),
          subtitle: 'Switch to Dark Mode',
          icon: <Icon name="moon-line" />,
        },
        {
          id: 'theme-system',
          name: 'System Default',
          shortcut: ['s'],
          keywords: 'system theme',
          section: 'Settings',
          perform: () => setTheme('system'),
          subtitle: 'Use system theme settings',
          icon: <Icon name="settings-2-line" />,
        },
      ],
    },
    {
      id: 'opcodes',
      name: 'Opcodes',
      shortcut: ['o'],
      keywords: 'home opcodes back',
      section: 'Navigation',
      perform: () => router.push('/'),
      subtitle: 'Opcodes reference',
      icon: <Icon name="home-2-line" />,
    },
    {
      id: 'precompiled',
      name: 'Precompiled',
      shortcut: ['a'],
      keywords: 'precompiled contracts',
      section: 'Navigation',
      subtitle: 'Precompiled contracts reference',
      perform: () => router.push('/precompiled'),
      icon: <Icon name="information-line" />,
    },
    {
      id: 'transactions',
      name: 'Transactions',
      shortcut: ['t'],
      keywords: 'Transactions Types',
      section: 'Navigation',
      subtitle: 'Transactions Types reference',
      perform: () => router.push('/transactions'),
      icon: <Icon name="information-line" />,
    },
    {
      id: 'playground',
      name: 'Playground',
      shortcut: ['p'],
      keywords: 'editor play',
      section: 'Navigation',
      perform: () => router.push('/playground'),
      subtitle: 'Play with EVM in real-time',
      icon: <Icon name="play-circle-line" />,
    },
    {
      id: 'about',
      name: 'About',
      shortcut: ['b'],
      keywords: 'about EVM',
      section: 'Navigation',
      subtitle: 'About EVM and its internals',
      perform: () => router.push('/about'),
      icon: <Icon name="information-line" />,
    },
    {
      id: 'github',
      name: 'GitHub',
      shortcut: ['g'],
      keywords: 'contribute GitHub issues',
      section: 'Navigation',
      subtitle: 'Contribute on GitHub',
      perform: () => window.open(GITHUB_REPO_URL, '_blank'),
      icon: <Icon name="github-fill" />,
    },
  ]
}

export default useActions
