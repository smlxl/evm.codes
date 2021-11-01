import { useKBar } from 'kbar'

import { isMac } from 'util/browser'
import { GITHUB_REPO_URL } from 'util/constants'

import { Icon, Button } from 'components/ui'

const Settings = () => {
  const { query } = useKBar()

  return (
    <div className="flex items-center">
      <Button
        size="xs"
        onClick={query.toggle}
        className="mx-6 px-2 font-semibold flex-items-center"
        transparent
        outline
        padded={false}
      >
        {isMac && <Icon name="command-line" className="mr-1" />}
        {isMac ? <span>K</span> : <span>Ctrl + K</span>}
      </Button>

      {/* <button className="mx-6">
        <Icon name="contrast-2-line" className="mr-1" />
      </button> */}

      <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer">
        <Icon name="github-fill" className="mr-1" size="lg" />
      </a>
    </div>
  )
}

export default Settings
