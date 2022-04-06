import React, { ChangeEvent } from 'react'

type Props = {
  text: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  isChecked: boolean
  isDisabled?: boolean
}

export const Radio: React.FC<Props> = ({
  text,
  value,
  onChange,
  isChecked,
  isDisabled,
}) => {
  return (
    <label className="mr-3 text-sm">
      <input
        type="radio"
        value={value}
        checked={isChecked}
        disabled={isDisabled || false}
        onChange={onChange}
        className="mr-2"
      />
      {text}
    </label>
  )
}
