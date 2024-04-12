import { useRegisterActions, Action } from 'kbar'
import { useTheme } from 'next-themes'

import { Icon, Button } from 'components/ui'

const ThemeSelector = () => {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const actions: Action[] = [
    {
      id: 'theme',
      name: 'Select theme…',
      shortcut: ['t'],
      keywords: 'theme appearance',
      section: 'Preferences',
      // children: ['theme-light', 'theme-dark', 'theme-system'],
    },
    {
      id: 'theme-light',
      name: 'Light',
      shortcut: [],
      keywords: 'light',
      section: '',
      perform: () => setTheme('light'),
      parent: 'theme',
    },
    {
      id: 'theme-dark',
      name: 'Dark',
      shortcut: [],
      keywords: 'dark',
      section: '',
      perform: () => setTheme('dark'),
      parent: 'theme',
    },
    {
      id: 'theme-system',
      name: 'System',
      shortcut: [],
      keywords: 'system',
      section: '',
      perform: () => setTheme('system'),
      parent: 'theme',
    },
  ]

  useRegisterActions(actions, [actions])

  const handleThemChange = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button transparent onClick={handleThemChange}>
      <Icon
        name={resolvedTheme === 'dark' ? 'contrast-2-fill' : 'contrast-2-line'}
        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      />
    </Button>
  )
}

export default ThemeSelector
