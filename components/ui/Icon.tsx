import cn from 'classnames'

type Props = {
  name: string
  className?: string
}

const Icon = ({ name, className }: Props) => (
  <svg className={cn('inline-block ri', className)}>
    <use xlinkHref={`#remix_svg__ri-${name}`} />
    <style jsx>{`
      svg {
        width: 16px;
        height: 16px;
      }
    `}</style>
  </svg>
)

export default Icon
