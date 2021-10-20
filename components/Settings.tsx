import Icon from 'components/ui/Icon'

const Settings = () => {
  return (
    <div className="flex items-center">
      <button className="mx-4">
        <Icon name="command-line" className="mr-1" />
        <span className="text-tiny font-semibold">K</span>
      </button>

      <button>
        <Icon name="contrast-2-line" className="mr-1" />
      </button>
    </div>
  )
}

export default Settings
