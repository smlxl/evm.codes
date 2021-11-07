import { useKBar } from 'kbar'

import { isMac } from 'util/browser'

import { Button, Icon } from 'components/ui'

const KBarButton = () => {
  const { query } = useKBar()

  return (
    <Button
      size="xs"
      onClick={query.toggle}
      className="mx-4 py-1 px-2 font-medium"
      transparent
      outline
      padded={false}
    >
      {isMac && <Icon name="command-line" className="mr-1" />}
      {isMac ? <span>K</span> : <span>Ctrl + K</span>}
    </Button>
  )
}

export default KBarButton
