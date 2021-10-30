import { GITHUB_REPO_URL } from 'util/constants'

import { Icon } from 'components/ui'

const Settings = () => {
  return (
    <div className="flex items-center">
      {/* <button>
        <Icon name="command-line" className="mr-1" />
        <span className="text-tiny font-semibold">K</span>
      </button>

      <button className="mx-6">
        <Icon name="contrast-2-line" className="mr-1" />
      </button> */}

      <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer">
        <Icon name="github-fill" className="mr-1" size="lg" />
      </a>
    </div>
  )
}

export default Settings
