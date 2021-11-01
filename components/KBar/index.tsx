import { KBarPortal, KBarPositioner, KBarAnimator, KBarSearch } from 'kbar'

import Results from './Results'

const KBar = () => {
  return (
    <KBarPortal>
      <KBarPositioner className="inset-0">
        <KBarAnimator className="shadow-lg overflow-hidden rounded-md text-black bg-white w-full max-w-xl border border-gray-200">
          <KBarSearch
            className="w-full border-0 outline-none bg-white text-black font-sm px-4 py-3 border-box"
            placeholder="Type a command or search…"
          />
          <Results />
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  )
}

export default KBar
