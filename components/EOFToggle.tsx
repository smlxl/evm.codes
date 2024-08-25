import Image from 'next/image'
import eofIcon from 'public/eof_icon.png'
import { Tooltip } from 'react-tooltip'

import { Toggle } from 'components/ui'

const EOFToggle = () => {
  return (
    <div className="flex justify-end items-center rounded">
      <div className="flex items-center mr-2">
        <span
          className="flex items-center pl-2 text-gray-400 dark:text-black-400"
          data-tooltip-content="Toggle viewing EOF opcodes"
          data-tooltip-id={`tip-toggle-eof`}
        >
          <Image alt="EOF icon" src={eofIcon} width={30} height={30} />
          <Tooltip className="tooltip" id={`tip-toggle-eof`} />
          <Toggle
            id="eof-toggle"
            onChange={() => {
              console.log('clicked')
            }}
            isChecked={false}
          />
        </span>
      </div>
    </div>
  )
}

export default EOFToggle
