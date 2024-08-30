import React, { ChangeEvent } from 'react'

type Props = {
  id: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  isChecked: boolean
  text?: string
  isDisabled?: boolean
}

export const Toggle: React.FC<Props> = ({
  id,
  onChange,
  isChecked,
  text,
  isDisabled,
}) => {
  return (
    <label className="flex items-center cursor-pointer relative text-sm">
      <input
        id={id}
        type="checkbox"
        checked={isChecked}
        disabled={isDisabled || false}
        onChange={onChange}
        className="peer sr-only"
      />
      <label htmlFor={id} className="hidden">
        {''}
      </label>
      <div className="peer h-6 w-11 rounded-full bg-gray-200 dark:bg-gray-900 border-2 after:absolute after:left-[5px] after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-800 peer-checked:after:translate-x-[1.1rem]"></div>
      {text && (
        <span className="ml-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          {text}
        </span>
      )}
    </label>
  )
}
