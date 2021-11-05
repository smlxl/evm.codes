import { useKBar } from 'kbar'

import { isMac } from 'util/browser'

import { Icon, Button } from 'components/ui'

const Settings = () => {
  const { query } = useKBar()

  return (
    <div className="flex items-center">
      <Button
        size="xs"
        onClick={query.toggle}
        className="mx-6 px-2 font-semibold"
        transparent
        outline
        padded={false}
        style={{ width: isMac ? 48 : 64 }}
      >
        {isMac && <Icon name="command-line" className="mr-1" />}
        {isMac ? <span>K</span> : <span>Ctrl + K</span>}
      </Button>

      {/* <button className="mx-6">
        <Icon name="contrast-2-line" className="mr-1" />
      </button> */}
    </div>
  )
}

export default Settings
