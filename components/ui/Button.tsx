import cn from 'classnames'

type Props = {
  children: JSX.Element | string
  href?: string
  external?: boolean
  className?: string
}

export const Button = ({ children, className, href, external }: Props) => {
  const button = (
    <button
      className={cn(
        'rounded py-3 px-4 bg-gray-500 font-semibold text-white',
        className,
      )}
    >
      {children}
    </button>
  )

  if (href) {
    return (
      <a href={href} target={external ? '_blank' : '_self'} rel="noreferrer">
        {button}
      </a>
    )
  }

  return button
}
