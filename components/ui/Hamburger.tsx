/* eslint-disable react/no-unknown-property */
import React from 'react'

import cn from 'classnames'

type Props = {
  isActive?: boolean
  onClick: () => void
} & React.ComponentPropsWithoutRef<'button'>

const barClassName =
  'bar my-1 mx-auto block bg-gray-900 dark:bg-gray-200 transition-transform'

export const Hamburger: React.FC<Props> = ({ isActive, onClick }) => (
  <button
    className={cn('ml-4 cursor-pointer md:hidden', {
      active: isActive,
    })}
    onClick={onClick}
  >
    <span className={barClassName}></span>
    <span className={barClassName}></span>
    <span className={barClassName}></span>

    <style jsx>{`
      .bar {
        width: 20px;
        height: 2px;
      }

      .active .bar:nth-child(2) {
        opacity: 0;
      }

      .active .bar:nth-child(1) {
        transform: translateY(6px) rotate(45deg);
      }

      .active .bar:nth-child(3) {
        transform: translateY(-6px) rotate(-45deg);
      }
    `}</style>
  </button>
)
