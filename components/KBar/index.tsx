import { KBarPortal, KBarPositioner, KBarAnimator, KBarSearch } from 'kbar'

import Results from './Results'

const KBar = () => {
  return (
    <KBarPortal>
      <KBarPositioner className="inset-0">
        <KBarAnimator className="shadow-lg overflow-hidden rounded-md text-gray-800 dark:text-gray-400 bg-white dark:bg-black-600 w-full max-w-xl border border-gray-200 dark:border-black-700 text-sm">
          <KBarSearch
            className="w-full border-0 outline-none bg-white dark:bg-black-600 text-gray-800 dark:text-gray-100 font-sm px-4 py-4 border-box"
            placeholder="Type a command or search…"
          />
          <Results />
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  )
}

export default KBar
