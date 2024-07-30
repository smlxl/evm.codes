import { useContext, useCallback } from 'react'

import Image from 'next/image'
import eofIcon from 'public/eof_icon.png'

import { EthereumContext } from 'context/ethereumContext'

import { Toggle } from 'components/ui'

const EOFToggle = () => {
  const { showEOF, toggleEOFShow } = useContext(EthereumContext)

  const handleEOFToggle = useCallback(() => {
    toggleEOFShow()
  }, [toggleEOFShow])

  return (
    <div className="flex justify-end items-center rounded">
      <div className="flex items-center mr-2">
        <Image alt="EOF icon" src={eofIcon} width={30} height={30} />

        <Toggle
          id="eof-toggle"
          onChange={handleEOFToggle}
          isChecked={showEOF}
        />
      </div>
    </div>
  )
}

export default EOFToggle
